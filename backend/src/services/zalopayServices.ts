import axios from "axios";
import moment from "moment";
import crypto from 'crypto';
import { ZLPconfig } from "../config/zaloPay";
import bookingServices from "./bookingServices";
import paymentServices from "./paymentServices";
import { booking_status, payment_method, payment_status } from "../generated/prisma/enums";
import { ValidationError } from "../middlewares/validateData";
import invoiceServices from "./invoiceServices";
import { sendConfirmBookingEmail } from "./emailServices";
import customerServices from "./customerServices";

class ZalopayService {
    async createPayment(is_deposit, amount, booking_id, booking_code) {
        const items = [];
        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

        const payment_data = {
            booking_id: booking_id,
            payment_method: payment_method.bank_transfer,
            status: payment_status.pending,
            amount: amount,
            is_deposit: is_deposit,
            transaction_ref: app_trans_id,
        }

        if (!is_deposit) {
            const invoice = await invoiceServices.getInvoiceByBookingId(booking_id);
            if (invoice == null)
                throw new ValidationError('404', "Invoice not found");
            Object.assign(payment_data,
                {
                    invoice_id: invoice.id
                }
            );
        }

        const newPayment = await paymentServices.createPayment(payment_data);

        const embed_data = {
            //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
            redirecturl: process.env.FRONTEND_URL + '/booking/success',
            payment_id: newPayment.id,
        };

        const order = {
            app_id: Number(ZLPconfig.app_id),
            app_trans_id, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: 'Aurora Hotel',
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình

            callback_url: process.env.CALLBACK_URL + '/payments/zalopay/callback',
            description: `Payment for the booking ${booking_code} - #${transID}`,
            bank_code: '',
            mac: '',
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data =
            ZLPconfig.app_id +
            '|' +
            order.app_trans_id +
            '|' +
            order.app_user +
            '|' +
            order.amount +
            '|' +
            order.app_time +
            '|' +
            order.embed_data +
            '|' +
            order.item;
        order.mac = crypto.createHmac('sha256', String(ZLPconfig.key1)).update(data).digest('hex');
        return await axios.post(String(ZLPconfig.endpoint), null, { params: order });
    }

    async ZaloPayCallback(req, res) {
        let result: { return_code?; return_message?} = {};
        try {
            let dataStr = req.body.data;
            let reqMac = req.body.mac;

            let mac = crypto.createHmac('sha256', String(ZLPconfig.key2)).update(dataStr).digest('hex');
            console.log('mac =', mac);

            // kiểm tra callback hợp lệ (đến từ ZaloPay server)
            if (reqMac !== mac) {
                // callback không hợp lệ
                result.return_code = -1;
                result.return_message = 'mac not equal';
            } else {
                // thanh toán thành công
                // merchant cập nhật trạng thái cho đơn hàng ở đây
                let dataJson = JSON.parse(dataStr);
                const paymentData = JSON.parse(dataJson.embed_data);
                const payment_id = paymentData['payment_id'];
                const updatedPayment = await paymentServices.updatePayment(payment_id, {
                    status: payment_status.paid,
                    paid_at: new Date(),
                    transaction_ref: dataJson['app_trans_id'],
                    updated_at: new Date()
                });
                if (updatedPayment.is_deposit === true) {
                    const updatedBooking = await bookingServices.updateBooking(updatedPayment.booking_id, {
                        status: booking_status.confirmed,
                        deposit_paid_at: updatedPayment.updated_at,
                        updated_at: new Date(),
                        expires_at: null,
                    });
                    const customer = await customerServices.getCustomerById(updatedBooking.customer_id);
                    if (customer?.email)
                        await sendConfirmBookingEmail(customer?.email, customer?.full_name, updatedBooking);
                } else if (updatedPayment.is_deposit === false) {
                    await bookingServices.updateBooking(updatedPayment.booking_id, {
                        status: booking_status.completed,
                        deposit_paid_at: updatedPayment.updated_at,
                        updated_at: new Date(),
                    })
                }

                result.return_code = 1;
                result.return_message = 'success';
            }
        } catch (ex: any) {
            console.log('lỗi:::' + ex.message);
            result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
            result.return_message = ex.message;
        }

        // thông báo kết quả cho ZaloPay server
        return res.json(result);
    }

    async checkOrderStatus(req, res) {
        const { booking_code } = req.body;
        const booking = await bookingServices.getBookingByCode(booking_code);
        const payments = await paymentServices.getPaymentsByBookingId(booking?.id);
        const deposit_payment = payments.filter(payment => payment.is_deposit === true)[0];
        if (!deposit_payment) {
            throw new Error('No deposit payment found');
        }
        let postData: any = {
            app_id: Number(ZLPconfig.app_id),
            app_trans_id: deposit_payment.transaction_ref, // Input your app_trans_id lấy transref từ payment
        };

        let data = String(postData.app_id) + '|' + String(postData.app_trans_id) + '|' + String(ZLPconfig.key1); // appid|app_trans_id|key1
        postData.mac = crypto.createHmac('sha256', String(ZLPconfig.key1)).update(data).digest('hex');

        let postConfig = {
            method: 'post',
            url: 'https://sb-openapi.zalopay.vn/v2/query',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: postData,
        };

        try {
            const result = await axios(postConfig);
            console.log(result.data);
            return res.status(200).json(result.data);
            /**
             * kết quả mẫu
              {
                "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
                "return_message": "",
                "sub_return_code": 1,
                "sub_return_message": "",
                "is_processing": false,
                "amount": 50000,
                "zp_trans_id": 240331000000175,
                "server_time": 1711857138483,
                "discount_amount": 0
              }
            */
        } catch (error) {
            console.log('lỗi');
            console.log(error);
        }
    }
}

export default ZalopayService;
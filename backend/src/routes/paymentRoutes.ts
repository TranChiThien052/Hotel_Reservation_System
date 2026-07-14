import express from 'express';
import crypto from 'crypto';
import { ZLPconfig } from '../config/zaloPay';
import PaymentController from '../controllers/paymentController';
import ZalopayService from '../services/zalopayServices';

const router = express.Router();

/**
 * @swagger
 * /payments/booking/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/booking/:id', PaymentController.getPaymentsByBookingId);
/**
 * @swagger
 * /payments/invoice/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/invoice/:id', PaymentController.getPaymentsByInvoiceId);
/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', PaymentController.getAllPayments);
/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/:id', PaymentController.getPaymentById);

/**
 * 
 */
router.post('/momo', PaymentController.createMomoPayments);

import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat, HashAlgorithm } from 'vnpay';
import paymentServices from '../services/paymentServices';
import { payment_method } from '../generated/prisma/enums';
import bookingServices from '../services/bookingServices';
router.post('/vnpay/create', async (req, res) => {
    const vnPay = new VNPay({
        tmnCode: String(process.env.VNPAY_TMN_CODE),
        secureSecret: String(process.env.VNPAY_SECRET),
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        hashAlgorithm: HashAlgorithm.SHA512,
        loggerFn: ignoreLogger,
    });
    const vnpayResponse = await vnPay.buildPaymentUrl({
        vnp_Amount: 500000,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: '98765432',
        vnp_OrderInfo: '98765432',
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: 'http://localhost:3000/payments/vnpay/check-payment',
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000))
    })
    return res.status(201).json(vnpayResponse);
});

router.get('/vnpay/check-payment', (req, res) => {
    console.log(req.query);
})

/**
 * @swagger
 * /payments/zalopay/create:
 *   post:
 *     summary: Create new record
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id:
 *                  type: string
 *                  format: uuid
 *               amount:
 *                  type: integer
 *               is_deposit:
 *                  type: boolean
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     return_code:
 *                        type: integer
 *                     return_message:
 *                        type: string
 *                     order_url:
 *                        type: string
 *                     sub_return_code:
 *                        type: integer
 *                     sub_return_message:
 *                        type: string
 *                     zp_trans_token:
 *                        type: string
 *                     order_token:
 *                        type: string
 */
router.post('/zalopay/create', async (req, res) => {
    const { amount, is_deposit, booking_id, booking_code } = req.body;
    try {
        const newPayment = await paymentServices.createPayment({
            booking_id,
            payment_method: payment_method.bank_transfer,
            status: 'pending',
            amount,
            is_deposit: is_deposit
        });
        const zalopay = new ZalopayService();
        const result = await zalopay.createPayment(amount, booking_code, newPayment.id);
        res.status(201).json(result.data);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create zalopay payment' });
    }
});

router.post('/zalopay/callback', async (req, res) => {
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
                status: 'paid',
                paid_at: new Date(),
                transaction_ref: dataJson['app_trans_id'],
                updated_at: new Date()
            });
            if (updatedPayment.is_deposit) {
                await bookingServices.updateBooking(updatedPayment.booking_id, {
                    status: 'confirmed',
                    deposit_paid_at: updatedPayment.updated_at,
                    updated_at: new Date()
                });
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
});

/**
 * @swagger
 * /payments/zalopay/payment_result:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: appid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The appid parameter
 *       - in: query
 *         name: apptransid
 *         required: true
 *         schema:
 *           type: string
 *         description: The apptransid parameter
 *       - in: query
 *         name: pmcid
 *         required: true
 *         schema:
 *           type: string
 *         description: The pmcid parameter
 *       - in: query
 *         name: bankcode
 *         required: true
 *         schema:
 *           type: string
 *         description: The bankcode parameter
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: integer
 *         description: The amount parameter
 *       - in: query
 *         name: discountamount
 *         required: true
 *         schema:
 *           type: integer
 *         description: The discountamount parameter
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: The status parameter
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                      result_code:
 *                         type: integer
 *                         description: The result_code parameter
 *                      result_message:
 *                         type: string
 *                         description: The result_message parameter
 *                      payments:
 *                         type: object
 *                         description: The payments parameter
 *                         properties:
 *                            id:
 *                               type: string
 *                               description: The id parameter
 *                               format: uuid
 *                            booking_id:
 *                               type: string
 *                               description: The booking_id parameter
 *                               format: uuid
 *                            payment_method:
 *                               type: string
 *                               description: The payment_method parameter
 *                            status:
 *                               type: string
 *                               description: The status parameter
 *                            amount:
 *                               type: number
 *                               description: The amount parameter
 *                            is_deposit:
 *                               type: boolean
 *                               description: The is_deposit parameter
 *                            paid_at:
 *                               type: string
 *                               description: The paid_at parameter
 *                            transaction_ref:
 *                               type: string
 *                               description: The transaction_ref parameter
 *                            updated_at:
 *                               type: string
 *                               description: The updated_at parameter
 *       404:
 *         description: Payment not found
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                      result_code:
 *                         type: integer
 *                         description: The result_code parameter
 *                      result_message:
 *                         type: string
 *                         description: The result_message parameter     
 *       400:
 *         description: Payment failed or pending
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                      result_code:
 *                         type: integer
 *                         description: The result_code parameter
 *                      result_message:
 *                         type: string
 *                         description: The result_message parameter
 */
router.get('/zalopay/payment_result', async (req, res) => {
    const data = req.query;
    const checksumData = `${data.appid}|${data.apptransid}|${data.pmcid}|${data.bankcode}|${data.amount}|${data.discountamount}|${data.status}`;
    const checksum = crypto.createHmac('sha256', String(ZLPconfig.key2)).update(checksumData).digest('hex');

    if (checksum !== data.checksum) {
        return res.redirect(`${process.env.FRONTEND_URL}/booking/failed?reason=invalid_checksum`);
    }

    let payments = await paymentServices.getPaymentByTransactionRef(data.apptransid);

    if (!payments) {
        const result = {
            result_code: 2,
            message: 'callback failed, no order found'
        }
        return res.status(404).json(result);
    } else if (payments.transaction_ref === data.apptransid) {
        if (payments.status === 'paid') {
            const result = {
                result_code: 1,
                message: 'payment updated successfully',
                payments
            }
            return res.status(200).json(result);
        } else {
            const result = {
                result_code: 2,
                message: 'payment failed or pending'
            }
            return res.status(400).json(result);
        }
    }
})

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create new record
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/', PaymentController.createPayment);
/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put('/:id', PaymentController.updatePayment);
/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete('/:id', PaymentController.deletePayment);

export default router;

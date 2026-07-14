import axios from "axios";
import moment from "moment";
import crypto from 'crypto';
import { ZLPconfig } from "../config/zaloPay";

class ZalopayService {
    async createPayment(amount, booking_code, payment_id) {
        const embed_data = {
            //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
            redirecturl: process.env.FRONTEND_URL + '/booking/success',
            payment_id
        };

        const items = [];
        const transID = Math.floor(Math.random() * 1000000);

        const order = {
            app_id: Number(ZLPconfig.app_id),
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: 'Aurora Hotel',
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
            callback_url: 'https://probable-thesis-variety.ngrok-free.dev/payments/zalopay/callback',
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
}

export default ZalopayService;
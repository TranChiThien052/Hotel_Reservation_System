import PaymentRepository from '../repositories/paymentRepo';
import BookingRepository from '../repositories/bookingRepo';
import InvoiceRepository from '../repositories/invoiceRepo';
import AccountRepository from '../repositories/accountRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';
import bookingRepo from '../repositories/bookingRepo';
import { booking_status, payment_method, payment_status } from '../generated/prisma/enums';
import branchServices from './branchServices';

class PaymentService {
    // async createMomoPayment(data) {
    //     //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //     //parameters
    //     var partnerCode = "MOMO";
    //     var accessKey = "F8BBA842ECF85";
    //     var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    //     var requestId = partnerCode + new Date().getTime();
    //     var orderId = requestId;
    //     var orderInfo = "pay with MoMo";
    //     var redirectUrl = "https://momo.vn/return";
    //     var ipnUrl = "https://callback.url/notify";
    //     // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    //     var amount = data.amount;
    //     var requestType = "captureWallet"
    //     var extraData = ""; //pass empty value if your merchant does not have stores

    //     //before sign HMAC SHA256 with format
    //     //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    //     var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
    //     //puts raw signature
    //     console.log("--------------------RAW SIGNATURE----------------")
    //     console.log(rawSignature)
    //     //signature
    //     var signature = crypto.createHmac('sha256', secretkey)
    //         .update(rawSignature)
    //         .digest('hex');
    //     console.log("--------------------SIGNATURE----------------")
    //     console.log(signature)

    //     //json object send to MoMo endpoint
    //     const requestBody = JSON.stringify({
    //         partnerCode: partnerCode,
    //         accessKey: accessKey,
    //         requestId: requestId,
    //         amount: amount,
    //         orderId: orderId,
    //         orderInfo: orderInfo,
    //         orderExpireTime: 30,
    //         redirectUrl: redirectUrl,
    //         ipnUrl: ipnUrl,
    //         extraData: extraData,
    //         requestType: requestType,
    //         signature: signature,
    //         lang: 'en'
    //     });

    //     // axios options
    //     const option = {
    //         method: 'POST',
    //         url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Content-Length': Buffer.byteLength(requestBody)
    //         },
    //         data: requestBody
    //     }

    //     let result;
    //     try {
    //         result = await axios(option);
    //         return result.data;
    //     } catch (error) {
    //         throw new ValidationError('500', "Server error: " + error);
    //     }
    // }

    async getAllPayments() {
        return await PaymentRepository.getAllPayments();
    };

    async getPaymentById(id) {
        const validator = new Validator();
        validator.isUUID("Payment ID", id);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentById(id);
    };

    async getPaymentsByBookingId(bookingId) {
        const validator = new Validator();
        if (!validator.isEmpty("Booking ID", bookingId)) {
            if (validator.isUUID("Booking ID", bookingId)) {
                const booking = await BookingRepository.getBookingById(bookingId);
                if (!booking) {
                    throw new ValidationError('404', "Booking not found");
                }
            }
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentsByBookingId(bookingId);
    };

    async getPaymentsByInvoiceId(invoiceId) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice ID", invoiceId)) {
            if (validator.isUUID("Invoice ID", invoiceId)) {
                const invoice = await InvoiceRepository.getInvoiceById(invoiceId);
                if (!invoice) {
                    throw new ValidationError('404', "Invoice not found");
                }
            }
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentsByInvoiceId(invoiceId);
    };

    async createPayment(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.invoice_id && { invoice_id: data.invoice_id }),
            ...(data.payment_method && { payment_method: data.payment_method }),
            ...(data.status && { status: data.status }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref }),
            ...(data.processed_by && { processed_by: data.processed_by }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();
        if (!validator.isEmpty("Booking ID", validatedData.booking_id))
            validator.isUUID("Booking ID", validatedData.booking_id);
        if (!validator.isEmpty("Payment Method", validatedData.payment_method))
            validator.validatePaymentMethod(validatedData.payment_method);
        if (!validator.isEmpty("Amount", validatedData.amount)) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }

        if (validatedData.invoice_id) {
            validator.isUUID("Invoice ID", validatedData.invoice_id);
        }
        if (validatedData.status) {
            validator.validatePaymentStatus(validatedData.status);
        }
        if (validatedData.is_deposit !== undefined) {
            validator.isBoolean("Is Deposit", validatedData.is_deposit);
        }
        if (validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }
        if (validatedData.transaction_ref) {
            validator.isString("Transaction Reference", validatedData.transaction_ref);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.booking_id) {
            const booking = await BookingRepository.getBookingById(validatedData.booking_id);
            if (!booking) {
                throw new ValidationError('404', "Booking not found");
            }
        }

        if (validatedData.invoice_id) {
            const invoice = await InvoiceRepository.getInvoiceById(validatedData.invoice_id);
            if (!invoice) {
                throw new ValidationError('404', "Invoice not found");
            }
        }

        if (validatedData.processed_by) {
            const account = await AccountRepository.getAccountById(validatedData.processed_by);
            if (!account) {
                throw new ValidationError('404', "Processed by not found");
            }
        }

        try {
            const result = await PaymentRepository.createPayment(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Thông tin hanh toán",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updatePayment(id, data) {
        const validator = new Validator();
        validator.isUUID("Payment ID", id);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const existingPayment = await PaymentRepository.getPaymentById(id);
        if (!existingPayment) {
            throw new ValidationError('404', "Payment not found");
        }

        const validatedData = {
            ...(data.payment_method && { payment_method: data.payment_method }),
            ...(data.status && { status: data.status }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref }),
            ...(data.paid_at && { paid_at: data.paid_at }),
            ...(data.processed_by && { processed_by: data.processed_by }),
            ...(data.updated_at && { updated_at: data.updated_at }),
            ...(data.notes && { notes: data.notes }),
        };

        if (validatedData.transaction_ref) {
            validator.isString("Transaction Reference", validatedData.transaction_ref);
        }
        if (validatedData.payment_method) {
            validator.validatePaymentMethod(validatedData.payment_method);
        }
        if (validatedData.status) {
            validator.validatePaymentStatus(validatedData.status);
        }
        if (validatedData.amount) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }
        if (validatedData.is_deposit !== undefined) {
            validator.isBoolean("Is Deposit", validatedData.is_deposit);
        }
        if (validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }
        if (validatedData.paid_at) {
            validator.validateDate(validatedData.paid_at);
        }
        if (validatedData.updated_at) {
            validator.validateDate(validatedData.updated_at);
        }
        if (validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.payment_method === payment_method.cash) {
            validatedData.status = payment_status.paid;
            validatedData.paid_at = new Date();
        }

        if (validatedData.processed_by) {
            const account = await AccountRepository.getAccountById(validatedData.processed_by);
            if (!account) {
                throw new ValidationError('404', "Processed by not found");
            }
        };

        try {
            const before = await PaymentRepository.getPaymentById(id);
            const after = await PaymentRepository.updatePayment(id, validatedData);
            if (after) {
                if (after.is_deposit === false && after.status === payment_status.paid && after.invoice_id) {
                    await bookingRepo.updateBooking(after.booking_id, {
                        status: booking_status.completed,
                        updated_at: new Date()
                    })
                }
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Thông tin hanh toán",
                    id,
                    before,
                    after,
                    Object.keys(validatedData)
                );
            }
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deletePayment(id) {
        return await PaymentRepository.deletePayment(id);
    };

    async getPaymentByTransactionRef(transactionRef) {
        return await PaymentRepository.getPaymentByTransactionRef(transactionRef);
    }

    async getRevenueReport_Custom(get_by, year, quarter?, month?, branch_id?) {
        const validator = new Validator();
        const method = ['year', 'quarter', 'month'];
        if (!method.includes(get_by))
            throw new ValidationError('400', 'Invalid get by method');
        const getYear = new Date(year).getFullYear();
        if (getYear > new Date().getFullYear())
            throw new ValidationError('400', 'Invalid year');
        if (branch_id) {
            if (validator.isUUID("Branch ID", branch_id)) {
                const branch = await branchServices.getBranchById(branch_id);
                if (!branch)
                    throw new ValidationError('404', 'Branch not found')
            }
        }
        if (quarter)
            if (quarter <= 0 || quarter > 4)
                throw new ValidationError('400', 'Invalid quarter');
        if (month)
            if (month <= 0 || month > 12)
                throw new ValidationError('400', 'Invalid month');
        const startDate = new Date(Number(year), 0, 1, 0, 0, 0);
        const endDate = new Date(Number(year), 11, 31, 23, 59, 999);
        const payments = await PaymentRepository.getCustomRevenue(startDate, endDate, branch_id);
        const result = payments.reduce((acc, curr) => {
            const month = (curr.paid_at ? new Date(curr.paid_at).getMonth() : 0) + 1;
            let quarter = 0;
            if (month >= 0 && month <= 3)
                quarter = 1;
            else if (month <= 6)
                quarter = 2;
            else if (month <= 9)
                quarter = 3;
            else if (month <= 12)
                quarter = 4;

            acc.total += Number(curr.amount);
            if (!acc.revenue_by_month[month])
                acc.revenue_by_month[month] = {};
            acc.revenue_by_month[month].total = (acc.revenue_by_month[month].total ? acc.revenue_by_month[month].total : 0) + Number(curr.amount);
            if (!acc.revenue_by_quarter[quarter])
                acc.revenue_by_quarter[quarter] = {};
            acc.revenue_by_quarter[quarter].total = (acc.revenue_by_quarter[quarter].total ? acc.revenue_by_quarter[quarter].total : 0) + Number(curr.amount);

            if (curr.payment_method === payment_method.cash) {
                acc.cash += Number(curr.amount);
                acc.revenue_by_month[month].cash = (acc.revenue_by_month[month].cash ? acc.revenue_by_month[month].cash : 0) + Number(curr.amount);
                acc.revenue_by_quarter[quarter].cash = (acc.revenue_by_quarter[quarter].cash ? acc.revenue_by_quarter[quarter].cash : 0) + Number(curr.amount);
            }

            if (curr.payment_method === payment_method.bank_transfer) {
                acc.transfer += Number(curr.amount);
                acc.revenue_by_month[month].transfer = (acc.revenue_by_month[month].transfer ? acc.revenue_by_month[month].transfer : 0) + Number(curr.amount);
                acc.revenue_by_quarter[quarter].transfer = (acc.revenue_by_quarter[quarter].transfer ? acc.revenue_by_quarter[quarter].transfer : 0) + Number(curr.amount);
            }

            return acc;
        }, {
            total: 0,
            cash: 0,
            transfer: 0,
            revenue_by_quarter: {
                1: {},
                2: {},
                3: {},
                4: {},
            },
            revenue_by_month: {
                1: {},
                2: {},
                3: {},
                4: {},
                5: {},
                6: {},
                7: {},
                8: {},
                9: {},
                10: {},
                11: {},
                12: {},
            }
        }
        );
        switch (get_by) {
            case 'year':
                return result;
                break;
            case 'quarter':
                const revenue_by_month = {};
                if (quarter == 1) {
                    for (let i = 1; i <= 3; i++)
                        revenue_by_month[i] = result.revenue_by_month[i];
                } else if (quarter == 2) {
                    for (let i = 4; i <= 6; i++)
                        revenue_by_month[i] = result.revenue_by_month[i];
                } else if (quarter == 3) {
                    for (let i = 7; i <= 9; i++)
                        revenue_by_month[i] = result.revenue_by_month[i];
                } else if (quarter == 4) {
                    for (let i = 10; i <= 12; i++)
                        revenue_by_month[i] = result.revenue_by_month[i];
                }
                return {
                    total: result.revenue_by_quarter[quarter],
                    revenue_by_month: revenue_by_month,
                };
                break;
            case 'month':
                return {
                    total: result.revenue_by_month[month],
                }
                break;
            default:
                break;
        }
    }

    async getRevenueReport(start, end, branch_id?) {
        const validator = new Validator();
        validator.validateDate(start);
        validator.validateDate(end);
        if (branch_id && validator.isUUID("Branch ID", branch_id)) {
            const branch = await branchServices.getBranchById(branch_id);
            if (!branch)
                throw new ValidationError('404', "Branch not found");
        }
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        if (startDate.getDate() < endDate.getDate())
            throw new ValidationError('400', 'Start date must be before end date');
        return PaymentRepository.getRevenue(startDate, endDate, branch_id);
    }
}

export default new PaymentService();

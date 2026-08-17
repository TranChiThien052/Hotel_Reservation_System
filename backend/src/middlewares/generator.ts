import crypto from "crypto";
import { booking_status, booking_type } from "../generated/prisma/enums";
import paymentServices from "../services/paymentServices";

export const generateToken = () => crypto.randomBytes(32).toString("hex");

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const generateBookingCode = (length) => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};

export const generateInvoiceCode = () => {
    const prefix = "INV";

    const datePart = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `${prefix}-${datePart}-${randomPart}`;
};

export const generateDiscountAmount = (subtotal, discountType, discountValue) => {
    if (discountType === "percentage") {
        return subtotal * (discountValue / 100);
    } else if (discountType === "fixed_amount") {
        return discountValue;
    }
};

export const calculateDynamicPrice = (checkin, checkout, basePrice, weekendRate, holidayRate, holidayDates, bookingType) => {
    let total = 0;

    if (bookingType === 'hourly') {
        const hours = Math.ceil(Math.abs(checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60));
        const checkinDateStr = checkin.toDateString();
        const dayOfWeek = checkin.getDay();

        let rate = 0;
        if (holidayDates.includes(checkinDateStr)) {
            rate = holidayRate;
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            rate = weekendRate;
        }
        return (Number(basePrice) + Number(basePrice) * (Number(rate) / 100)) * hours;
    }

    let currentDate = new Date(checkin);

    while (currentDate < checkout) {
        const dateStr = currentDate.toDateString();
        const dayOfWeek = currentDate.getDay();

        let rate = 0;
        if (holidayDates.includes(dateStr)) {
            rate = holidayRate;
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            rate = weekendRate;
        }

        total += Number(basePrice) + Number(basePrice * (rate / 100));

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return total;
}

export const generateRefundAmount = async (booking) => {
    if (booking.booking_type === booking_type.hourly)
        return 0;
    const created_at = new Date(booking.created_at);
    const current = new Date();
    if (booking.status === booking_status.confirmed) {
        const payments = await paymentServices.getPaymentsByBookingId(booking.id);
        const payment = payments.filter(payment => payment.is_deposit === true)[0];
        if (!payment)
            return 0;
        if (current.getTime() - created_at.getTime() < 24 * 60 * 60 * 1000)
            return payment.amount;
        else if (Number(payment.amount) === Number(booking.total_amount)) return Number(payment.amount) - Number(booking.deposit_amount);
        else return 0;
    }
}
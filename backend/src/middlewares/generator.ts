import crypto from "crypto";

export const generateBookingCode = (length: number): string => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};

export const generateDayDiff = (startDate: Date, endDate: Date) => {
    const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const generateHourDiff = (startDate: Date, endDate: Date) => {
    const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffMs / (1000 * 60 * 60));
};

export const generateDiscountAmount = (subtotal: number, discountType: string, discountValue: number) => {
    if (discountType === "percentage") {
        return subtotal * (discountValue / 100);
    } else if (discountType === "fixed_amount") {
        return discountValue;
    }
};

export const generateSubtotal = (roomPrice: number, start: Date, end: Date, type: string) => {
    if (type === "daily") {
        const dayDiff = generateDayDiff(start, end);
        return roomPrice * dayDiff;
    } else if (type === "hourly") {
        const hourDiff = generateHourDiff(start, end);
        return roomPrice * hourDiff;
    }
};
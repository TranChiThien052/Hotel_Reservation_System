import crypto from "crypto";

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

export const generateEarlyCheckoutFee = (created_at: Date, expected_checkout: Date, changed_checkout: Date, unit_price: number, checked_in: boolean): number => {
    const now = new Date();
    const createdDate = new Date(created_at);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
        return 0;
    }

    const dayDiff = generateDayDiff(new Date(changed_checkout), new Date(expected_checkout));

    if (checked_in) {
        return unit_price * dayDiff * 0.3;
    }

    return unit_price * dayDiff * 0.2
};

export const generateLateCheckoutFee = (expected_checkout: Date, actual_checkout: Date, unit_price: number): number => {
    const now = new Date();
    const expectedCheckoutDate = new Date(expected_checkout);
    const diffMs = now.getTime() - expectedCheckoutDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 1 && diffHours < 2) {
        return unit_price * 0.2;
    }

    if (diffHours >= 2 && diffHours < 6) {
        return unit_price * 0.5;
    }

    return unit_price;
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


class Validator {
    public error;

    constructor() {
        this.error = [];
    }

    pushError(message) {
        this.error.push(message);
    }
    
    clearError() {
        let result = this.error.length + " validation error(s): " + this.error.join("; ");
        this.error = [];
        return result;
    }

    isEmpty(typeOfData, data) {
        if (data === undefined || data === null || data === "") {
            this.error.push(`${typeOfData} is required`);
            return true;
        }
        return false;
    }

    isNumber(typeOfData, data) {
        if (isNaN(data)) {
            this.error.push(`${typeOfData} must be a number`);
            return false;
        }
        return true;
    };

    validateEmail(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(data)) {
            this.error.push("Invalid email format");
            return false;
        }
        return true;
    };
    
    validatePhoneNumber(data) {
        const phoneRegex = /^0+\d{9}$/;
        if(!phoneRegex.test(data)) {
            this.error.push("Invalid phone number format");
            return false;
        }
        return true;
    };
    
    validateDate(data) {
        const date = new Date(data);
        if(isNaN(date.getTime())){
            this.error.push("Invalid date format");
            return false;
        }
        return true;
    };

    validatePassword(data) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(data)) {
            this.error.push("Invalid password format");
            return false;
        }
        return true;
    };

    validateDiscountType(data) {
        const validTypes = ["percentage", "fixed_amount"];
        if(!validTypes.includes(data)) {
            this.error.push("Invalid discount type");
            return false;
        }        
        return true;
    };

    validateRoomStatus(data) {
        const validStatuses = ["available", "unavailable", "occupied", "cleaning", "maintenance"];
        if(!validStatuses.includes(data)) {
            this.error.push("Invalid room status");
            return false;
        }
        return true;
    }

    validateDateOrder(startDate, endDate) {
        if (startDate === undefined && endDate === undefined) {
            return true;
        } else if (endDate !== undefined) {
            const end = new Date(endDate);

            if (startDate !== undefined) {
                const start = new Date(startDate);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    this.error.push("Invalid date format");
                }

                if (start >= end) {
                    this.error.push("Start date must be before end date");
                }

                return true;
            }
            
            const start = new Date();
            
            if (isNaN(end.getTime())) {
                this.error.push("Invalid date format");
            }

            if (start >= end) {
                this.error.push("Start date must be before end date");
            }

            return true;
        }
        return true;
    }

    isDecimal(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        const decimalRegex = /^\d+(\.\d{1,2})?$/;
        if (!decimalRegex.test(String(data))) {
            this.error.push(`${typeOfData} must be a valid decimal number`);
            return false;
        }
        return true;
    }

    isBoolean(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        if (typeof data !== 'boolean') {
            this.error.push(`${typeOfData} must be a boolean`);
            return false;
        }
        return true;
    }

    isArray(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        if (!Array.isArray(data)) {
            this.error.push(`${typeOfData} must be an array`);
            return false;
        }
        return true;
    }

    isString(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        if (typeof data !== 'string') {
            this.error.push(`${typeOfData} must be a string`);
            return false;
        }
        return true;
    }

    isUUID(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(String(data))) {
            this.error.push(`${typeOfData} must be a valid UUID`);
            return false;
        }
        return true;
    }

    minLength(typeOfData, data, minLength) {
        if (data === undefined || data === null || data === "") {
            return true;
        }
        if (String(data).length < minLength) {
            this.error.push(`${typeOfData} must be at least ${minLength} characters`);
            return false;
        }
        return true;
    }

    maxLength(typeOfData, data, maxLength) {
        if (data === undefined || data === null || data === "") {
            return true;
        }
        if (String(data).length > maxLength) {
            this.error.push(`${typeOfData} must not exceed ${maxLength} characters`);
            return false;
        }
        return true;
    }

    isPositiveNumber(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        if (isNaN(data) || Number(data) <= 0) {
            this.error.push(`${typeOfData} must be a positive number`);
            return false;
        }
        return true;
    }

    isNonNegativeNumber(typeOfData, data) {
        if (data === undefined || data === null) {
            return true;
        }
        if (isNaN(data) || Number(data) < 0) {
            this.error.push(`${typeOfData} must be a non-negative number`);
            return false;
        }
        return true;
    }

    validateEnum(typeOfData, data, validValues) {
        if (data === undefined || data === null || data === "") {
            return true;
        }
        if (!validValues.includes(data)) {
            this.error.push(`${typeOfData} must be one of: ${validValues.join(", ")}`);
            return false;
        }
        return true;
    }

    validateAccountRole(data) {
        const validRoles = ["customer", "staff", "manager", "admin"];
        return this.validateEnum("Account role", data, validRoles);
    }

    validateAccountStatus(data) {
        const validStatuses = ["active", "inactive"];
        return this.validateEnum("Account status", data, validStatuses);
    }

    validateBookingStatus(data) {
        const validStatuses = ["pending", "confirmed", "checked_in", "checked_out", "completed", "cancelled"];
        return this.validateEnum("Booking status", data, validStatuses);
    }

    validateBookingType(data) {
        const validTypes = ["daily", "hourly"];
        return this.validateEnum("Booking type", data, validTypes);
    }

    validateCancellationStatus(data) {
        const validStatuses = ["pending", "confirmed", "failed"];
        return this.validateEnum("Cancellation status", data, validStatuses);
    }

    validatePaymentMethod(data) {
        const validMethods = ["cash", "bank_transfer", "online"];
        return this.validateEnum("Payment method", data, validMethods);
    }

    validatePaymentStatus(data) {
        const validStatuses = ["pending", "paid", "refunded", "failed"];
        return this.validateEnum("Payment status", data, validStatuses);
    }
}

class ValidationError extends Error {
    code: string;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

export { Validator, ValidationError };
class Validator {
    public error;

    constructor() {
        this.error = [];
    }

    pushError(message) {
        this.error.push(message);
    }
    
    clearError() {
        let result = this.error.length + " validation error(s): " + this.error.join(", ");
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
}

class ValidationError extends Error {
    code: string;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

export { Validator, ValidationError };
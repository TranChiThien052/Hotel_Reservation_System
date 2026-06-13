import CustomerRepository from '../repositories/customerRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class CustomerService {
    async getAllCustomers() {
        return await CustomerRepository.getAllCustomers();
    };

    async getCustomerById(id) {
        return await CustomerRepository.getCustomerById(id);
    };

    async createCustomer(data) {
        const validatedData = {
            ...(data.account_id && { account_id: data.account_id.trim() }),
            ...(data.full_name && { full_name: data.full_name.trim() }),
            ...(data.phone && { phone: data.phone.trim() }),
            ...(data.email && { email: data.email.trim() }),
            ...(data.id_card_number && { id_card_number: data.id_card_number.trim() }),
            ...(data.nationality && { nationality: data.nationality.trim() }),
            ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
            ...(data.address && { address: data.address.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Full Name", validatedData.full_name)) 
            throw new ValidationError('400', "Full Name is required");

        validator.isString("Full Name", validatedData.full_name);
        
        if(validatedData.email) {
            validator.validateEmail(validatedData.email);
        }
        if(validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
        }
        if(validatedData.id_card_number) {
            validator.isString("ID Card Number", validatedData.id_card_number);
        }
        if(validatedData.nationality) {
            validator.isString("Nationality", validatedData.nationality);
        }
        if(validatedData.date_of_birth) {
            if(validator.validateDate(validatedData.date_of_birth))
                validatedData.date_of_birth = new Date(validatedData.date_of_birth);
        }
        if(validatedData.account_id) {
            validator.isUUID("Account ID", validatedData.account_id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        // Check unique constraints
        const validatingInfo = await CustomerRepository.getValidatingInformation();

        if(validatingInfo.some(customer => customer.email === validatedData.email)) {
            throw new ValidationError('400', "Email already exists");
        }
        if (validatingInfo.some(customer => customer.phone === validatedData.phone)) {
            throw new ValidationError('400', "Phone number already exists");
        }
        if (validatingInfo.some(customer => customer.id_card_number === validatedData.id_card_number)) {
            throw new ValidationError('400', "ID Card Number already exists");
        }

        return await CustomerRepository.createCustomer(validatedData);
    };

    async updateCustomer(id, data) {
        const validator = new Validator();

        const validatingInfo = await CustomerRepository.getValidatingInformation();

        const validatedData = {
            ...(data.account_id && { account_id: data.account_id.trim() }),
            ...(data.full_name && { full_name: data.full_name.trim() }),
            ...(data.phone && { phone: data.phone.trim() }),
            ...(data.email && { email: data.email.trim() }),
            ...(data.id_card_number && { id_card_number: data.id_card_number.trim() }),
            ...(data.nationality && { nationality: data.nationality.trim() }),
            ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
            ...(data.address && { address: data.address.trim() }),
        };

        if (validatedData.full_name) {
            if (!validator.isEmpty("Full Name", validatedData.full_name)) {
                validator.isString("Full Name", validatedData.full_name);
            }
        }
        
        if(validatedData.email) {
            validator.validateEmail(validatedData.email);
            if (validatingInfo.find(customer => customer.email === validatedData.email && customer.id !== id)) {
                validator.pushError("Email already exists");
            }
        }
        if(validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
            if (validatingInfo.some(customer => customer.phone === validatedData.phone && customer.id !== id)) {
                validator.pushError("Phone number already exists");
            }
        }
        if(validatedData.id_card_number) {
            validator.isString("ID Card Number", validatedData.id_card_number);
            if (validatingInfo.some(customer => customer.id_card_number === validatedData.id_card_number && customer.id !== id)) {
                validator.pushError("ID Card Number already exists");
            }
        }
        if(validatedData.nationality) {
            validator.isString("Nationality", validatedData.nationality);
        }
        if(validatedData.date_of_birth) {
            if (validator.validateDate(validatedData.date_of_birth)) 
                validatedData.date_of_birth = new Date(validatedData.date_of_birth);
        }
        if(validatedData.account_id) {
            validator.isUUID("Account ID", validatedData.account_id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatingInfo.some(customer => customer.id === id) === false) {
            throw new ValidationError('404', "Customer not found");
        }

        return await CustomerRepository.updateCustomer(id, validatedData);
    };

    async deleteCustomer(id) {
        return await CustomerRepository.deleteCustomer(id);
    };
}

export default new CustomerService();

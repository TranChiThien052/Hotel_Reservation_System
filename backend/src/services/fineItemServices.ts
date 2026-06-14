import FineItemRepository from '../repositories/fineItemRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class FineItemService {
    async getAllFineItems() {
        return await FineItemRepository.getAllFineItems();
    };

    async getFineItemById(id) {
        return await FineItemRepository.getFineItemById(id);
    };

    async createFineItem(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.name && { name: data.name.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.price && { price: data.price }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Branch ID", validatedData.branch_id)) return;
        if(validator.isEmpty("Name", validatedData.name)) return;
        if(validator.isEmpty("Price", validatedData.price)) return;

        validator.isUUID("Branch ID", validatedData.branch_id);
        validator.isString("Name", validatedData.name);
        validator.maxLength("Name", validatedData.name, 200);
        validator.isDecimal("Price", validatedData.price);
        validator.isPositiveNumber("Price", validatedData.price);
        
        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await FineItemRepository.createFineItem(validatedData);
    };

    async updateFineItem(id, data) {
        const validator = new Validator();
        const existingFineItem = await FineItemRepository.getFineItemById(id);
        if (!existingFineItem) {
            throw new ValidationError('404', "Fine item not found");
        }

        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.name && { name: data.name.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.price && { price: data.price }),
        };

        if(validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }
        if(validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 200);
        }
        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
        }
        if(validatedData.price) {
            validator.isDecimal("Price", validatedData.price);
            validator.isPositiveNumber("Price", validatedData.price);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await FineItemRepository.updateFineItem(id, validatedData);
    };

    async deleteFineItem(id) {
        return await FineItemRepository.deleteFineItem(id);
    };
}

export default new FineItemService();

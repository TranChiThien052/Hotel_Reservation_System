import CancellationRequestRepository from '../repositories/cancellationRequestRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class CancellationRequestService {
    async getAllCancellationRequests() {
        return await CancellationRequestRepository.getAllCancellationRequests();
    };

    async getCancellationRequestById(id) {
        return await CancellationRequestRepository.getCancellationRequestById(id);
    };

    async createCancellationRequest(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id.trim() }),
            ...(data.requested_by && { requested_by: data.requested_by.trim() }),
            ...(data.reason && { reason: data.reason.trim() }),
            ...(data.status && { status: data.status.trim() }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Booking ID", validatedData.booking_id)) return;

        validator.isUUID("Booking ID", validatedData.booking_id);
        
        if(validatedData.requested_by) {
            validator.isUUID("Requested By", validatedData.requested_by);
        }
        if(validatedData.status) {
            validator.validateCancellationStatus(validatedData.status);
        }
        if(validatedData.refund_amount) {
            validator.isDecimal("Refund Amount", validatedData.refund_amount);
            validator.isNonNegativeNumber("Refund Amount", validatedData.refund_amount);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await CancellationRequestRepository.createCancellationRequest(validatedData);
    };

    async updateCancellationRequest(id, data) {
        const validator = new Validator();
        const existingRequest = await CancellationRequestRepository.getCancellationRequestById(id);
        if (!existingRequest) {
            throw new ValidationError('404', "Cancellation request not found");
        }

        const validatedData = {
            ...(data.reason && { reason: data.reason.trim() }),
            ...(data.status && { status: data.status.trim() }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.resolved_by && { resolved_by: data.resolved_by.trim() }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        if(validatedData.status) {
            validator.validateCancellationStatus(validatedData.status);
        }
        if(validatedData.refund_amount) {
            validator.isDecimal("Refund Amount", validatedData.refund_amount);
            validator.isNonNegativeNumber("Refund Amount", validatedData.refund_amount);
        }
        if(validatedData.resolved_by) {
            validator.isUUID("Resolved By", validatedData.resolved_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await CancellationRequestRepository.updateCancellationRequest(id, validatedData);
    };

    async deleteCancellationRequest(id) {
        return await CancellationRequestRepository.deleteCancellationRequest(id);
    };
}

export default new CancellationRequestService();

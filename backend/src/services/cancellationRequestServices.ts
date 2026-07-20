import CancellationRequestRepository from '../repositories/cancellationRequestRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import AccountRepository from '../repositories/accountRepo';
import BookingRepository from '../repositories/bookingRepo';

class CancellationRequestService {
    async getAllCancellationRequests() {
        return await CancellationRequestRepository.getAllCancellationRequests();
    };

    async getCancellationRequestById(id) {
        return await CancellationRequestRepository.getCancellationRequestById(id);
    };

    async getCancellationRequestsByBranchId(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", id))
            validator.isUUID("Branch ID", id)
        if (validator.error.length > 0)
            throw new ValidationError("400", validator.clearError())
        return await CancellationRequestRepository.getCancellationRequestByBranchId(id)
    }

    async createCancellationRequest(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.requested_by && { requested_by: data.requested_by }),
            ...(data.reason && { reason: data.reason }),
            ...(data.status && { status: data.status }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();
        if (!validator.isEmpty("Booking ID", validatedData.booking_id))
            if (validator.isUUID("Booking ID", validatedData.booking_id)) {
                const booking = await BookingRepository.getBookingById(validatedData.booking_id);
                if (!booking) {
                    validator.pushError("Booking not found");
                }
            }

        if (validatedData.requested_by)
            if (validator.isUUID("Requested By", validatedData.requested_by)) {
                const account = await AccountRepository.getAccountById(validatedData.requested_by);
                if (!account) {
                    validator.pushError("Requested_by ID not found");
                }
            }

        if (validatedData.status)
            validator.validateCancellationStatus(validatedData.status);

        if (validatedData.refund_amount) {
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
        if (validator.isUUID("Cancellation Request ID", id)) {
            const existingRequest = await CancellationRequestRepository.getCancellationRequestById(id);
            if (!existingRequest) {
                throw new ValidationError('404', 'Cancellation request not found');
            }
        }

        const validatedData = {
            ...(data.reason && { reason: data.reason }),
            ...(data.status && { status: data.status }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.refund_processed_at && { refund_processed_at: data.refund_processed_at }),
            ...(data.resolved_by && { resolved_by: data.resolved_by }),
            ...(data.notes && { notes: data.notes }),
        };

        if (validatedData.status) {
            validator.validateCancellationStatus(validatedData.status);
        }
        if (validatedData.refund_amount) {
            validator.isDecimal("Refund Amount", validatedData.refund_amount);
            validator.isNonNegativeNumber("Refund Amount", validatedData.refund_amount);
        }
        if (validatedData.resolved_by) {
            if (validator.isUUID("Resolved By", validatedData.resolved_by)) {
                const account = await AccountRepository.getAccountById(validatedData.resolved_by);
                if (!account) {
                    validator.pushError("Resolved_by ID not found");
                }
            }
        }
        if (validatedData.refund_processed_at) {
            validator.validateDate(validatedData.refund_processed_at);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.updated_at = new Date();

        return await CancellationRequestRepository.updateCancellationRequest(id, validatedData);
    };

    async deleteCancellationRequest(id) {
        return await CancellationRequestRepository.deleteCancellationRequest(id);
    };
}

export default new CancellationRequestService();

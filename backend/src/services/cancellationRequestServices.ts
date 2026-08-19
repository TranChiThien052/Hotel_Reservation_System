import CancellationRequestRepository from '../repositories/cancellationRequestRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import branchServices from './branchServices';
import bookingServices from './bookingServices';
import accountServices from './accountServices';
import { generateRefundAmount } from '../middlewares/generator';

class CancellationRequestService {
    async getAllCancellationRequests() {
        const cancellationRequest = await CancellationRequestRepository.getAllCancellationRequests();
        cancellationRequest.forEach(cr => {
            const service_charge = cr.bookings.booking_services.reduce((acc, curr) => {
                return acc + Number(curr.total_amount);
            }, 0)
            Object.assign(cr, { service_charge });
        });
        return cancellationRequest;
    };

    async getCancellationRequestById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Cancellation Request ID", id))
            throw new ValidationError("400", validator.clearError());
        return await CancellationRequestRepository.getCancellationRequestById(id);
    };

    async getCancellationRequestsByBranchId(id) {
        const validator = new Validator();
        if (!validator.isUUID("Branch ID", id))
            throw new ValidationError("400", validator.clearError());
        const branch = await branchServices.getBranchById(id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
        const cancellationRequest = await CancellationRequestRepository.getCancellationRequestByBranchId(id)
        cancellationRequest.forEach(cr => {
            const service_charge = cr.bookings.booking_services.reduce((acc, curr) => {
                return acc + Number(curr.total_amount);
            }, 0)
            Object.assign(cr, { service_charge });
        });
        return cancellationRequest;
    }

    async createCancellationRequest(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.requested_by && { requested_by: data.requested_by }),
            ...(data.reason && { reason: data.reason }),
            ...(data.status && { status: data.status }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();

        const booking = await bookingServices.getBookingById(validatedData.booking_id);
        if (!booking) {
            validator.pushError("Booking not found");
        }

        const account = await accountServices.getAccountById(validatedData.requested_by);
        if (!account) {
            validator.pushError("Requested_by ID not found");
        }

        if (validatedData.status)
            validator.validateCancellationStatus(validatedData.status);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.refund_amount = await generateRefundAmount(booking);

        return await CancellationRequestRepository.createCancellationRequest(validatedData);
    };

    async updateCancellationRequest(id, data) {
        const validator = new Validator();
        const existingRequest = await this.getCancellationRequestById(id);
        if (!existingRequest) {
            throw new ValidationError('404', 'Cancellation Request not found');
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
            const account = await accountServices.getAccountById(validatedData.resolved_by);
            if (!account) {
                validator.pushError("Resolved_by ID not found");
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

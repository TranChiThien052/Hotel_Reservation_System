import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestCancellationRequest, createTestBranch, createTestRoomType, createTestRoomPrice, createTestAccount, createTestCustomer, createTestBooking, createTestStaff, cleanDatabase } from '../helpers/seed.ts';

describe('Cancellation Requests API', () => {
    beforeAll(async () => {
        await cleanDatabase();
    });

    afterEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await cleanDatabase();
        await prisma.$disconnect();
    });

    describe('GET /api/cancellation-requests', () => {
        // Test case for getting all cancellation requests
        it('should return all cancellation requests', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app).get('/cancellation-requests');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0].id).toBe(cancellationRequest.id);
        });

        // Test case for getting cancellation request by ID
        it('should return a cancellation request by ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app).get(`/cancellation-requests/${cancellationRequest.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBe(cancellationRequest.id);
        });

        // Test case for getting cancellation request by invalid ID
        it('should return 404 for invalid cancellation request ID', async () => {
            const response = await request(app).get('/cancellation-requests/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for getting cancellation request by non-existent ID
        it('should return 404 for non-existent cancellation request ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app).get('/cancellation-requests/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/cancellation-requests', () => {
        // Test case for creating a new cancellation request
        it('should create a new cancellation request', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const response = await request(app)
                .post('/cancellation-requests')
                .send({
                    booking_id: booking.id,
                    requested_by: staff.account_id,
                    reason: 'Change of plans',
                    status: 'pending',
                    notes: 'Customer requested cancellation due to change of plans'
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.booking_id).toBe(booking.id);
            expect(response.body.requested_by).toBe(staff.account_id);
            expect(response.body.reason).toBe('Change of plans');
        });
        // it should return 400 if required fields are missing
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/cancellation-requests')
                .send({
                    reason: 'Change of plans',
                    status: 'pending',
                    notes: 'Customer requested cancellation due to change of plans'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        // it should return 400 if booking_id is invalid and account_id is invalid
        it('should return 400 if booking_id is invalid', async () => {
            const response = await request(app)
                .post('/cancellation-requests')
                .send({
                    booking_id: 'invalid-booking-id',
                    requested_by: 'invalid-account-id',
                    reason: 'Change of plans',
                    status: 'pending',
                    notes: 'Customer requested cancellation due to change of plans'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Booking ID must be a valid UUID');
            expect(response.body.error).toContain('Requested By must be a valid UUID');
        });
        // it should return 400 if booking_id is not found and requested_by is not found
        it('should return 400 if booking_id is not found', async () => {
            const response = await request(app)
                .post('/cancellation-requests')
                .send({
                    booking_id: '00000000-0000-0000-0000-000000000000',
                    requested_by: '00000000-0000-0000-0000-000000000000',
                    reason: 'Change of plans',
                    status: 'pending',
                    notes: 'Customer requested cancellation due to change of plans'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Booking not found');
            expect(response.body.error).toContain('Requested_by ID not found');
        });
        // it should return 400 if refund_amount is negative
        it('should return 400 if refund_amount is negative', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const response = await request(app)
                .post('/cancellation-requests')
                .send({
                    booking_id: booking.id,
                    requested_by: staff.account_id,
                    reason: 'Change of plans',
                    status: 'pending',
                    refund_amount: -100,
                    notes: 'Customer requested cancellation due to change of plans'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Refund Amount must be a non-negative number');
        });
    });
    describe('PUT /api/cancellation-requests/:id', () => {
        // Test case for updating a cancellation request
        it('should update a cancellation request', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(200);
            expect(response.body.reason).toBe('Updated reason for cancellation');
            expect(response.body.status).toBe('confirmed');
            expect(parseInt(response.body.refund_amount)).toBe(100);
            expect(response.body.notes).toBe('Updated notes for cancellation request');
            expect(response.body.refund_processed_at).toBeDefined();
            expect(response.body.updated_at).toBeDefined();
        });
        // Test case for updating a cancellation request with invalid ID
        it('should return 400 if cancellation request ID is invalid', async () => {
            const response = await request(app)
                .put(`/cancellation-requests/invalid-id`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Cancellation Request ID must be a valid UUID');
        });

        // Test case for updating a cancellation request with non-existent ID
        it('should return 404 if cancellation request ID does not exist', async () => {
            const response = await request(app)
                .put(`/cancellation-requests/00000000-0000-0000-0000-000000000000`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Cancellation request not found');
        });

        // Test case for updating a cancellation request with invalid status
        it('should return 400 if cancellation request status is invalid', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'invalid',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Cancellation status must be one of: pending, confirmed, failed');
        });

        // Test case for updating a cancellation request with negative refund amount
        it('should return 400 if refund amount is negative', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: -100,
                    refund_processed_at: new Date(),
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Refund Amount must be a valid decimal number');
            expect(response.body.error).toContain('Refund Amount must be a non-negative number');
        });

        // Test case for updating a cancellation request with invalid resolved_by
        it('should return 400 if resolved_by is invalid', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    resolved_by: 'invalid_user',
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Resolved By must be a valid UUID');
        });
        // Test case for updating a cancellation request with non-existent resolved_by
        it('should return 400 if resolved_by is non-existent', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: new Date(),
                    resolved_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Resolved_by ID not found');
        });

        // Test case for updating a cancellation request with invalid refund_processed_at
        it('should return 400 if refund_processed_at is invalid', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const staffAccount = await createTestAccount({
                username: "staff1",
                password_hash: "staff1",
                role: "staff",
                status: "active",
                branch_id: branch.id,
            });
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { created_by: staff.account_id });
            const cancellationRequest = await createTestCancellationRequest(booking.id);
            const response = await request(app)
                .put(`/cancellation-requests/${cancellationRequest.id}`)
                .send({
                    reason: 'Updated reason for cancellation',
                    status: 'confirmed',
                    refund_amount: 100,
                    refund_processed_at: 'invalid-date',
                    resolved_by: staff.account_id,
                    notes: 'Updated notes for cancellation request'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid date format');
        });

    });
});
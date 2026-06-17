import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { cleanDatabase, createTestAccount, createTestBooking, createTestBookingService, createTestBranch, createTestCustomer, createTestInvoice, createTestPayment, createTestRoom, createTestRoomPrice, createTestRoomService, createTestRoomType, createTestStaff } from '../helpers/seed.ts';
import { response } from 'express';

describe('Payment API Integration Tests', () => {
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

    describe('POST /api/payments', () => {
        // Test case for creating a new payment without invoice id
        it('should create a new payment without invoice id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: booking.id,
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: staffAccount.id,
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.booking_id).toBe(booking.id);
            expect(response.body.payment_method).toBe('bank_transfer');
            expect(response.body.status).toBe('pending');
            expect(Number(response.body.amount)).toBe(320.00);
            expect(response.body.is_deposit).toBe(false);
            expect(response.body.transaction_ref).toBe('TESTTRANS');
            expect(new Date(response.body.paid_at)).toBeInstanceOf(Date);
            expect(response.body.processed_by).toBe(staffAccount.id);
            expect(response.body.notes).toBe('Test payment for integration tests');
        });

        // Test case for creating a new payment with invoice id
        it('should create a new payment with invoice id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const invoice = await createTestInvoice(booking.id, staffAccount.id);
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: booking.id,
                    invoice_id: invoice.id,
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: staffAccount.id,
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.invoice_id).toBe(invoice.id);
            expect(response.body.booking_id).toBe(booking.id);
            expect(response.body.payment_method).toBe('bank_transfer');
            expect(response.body.status).toBe('pending');
            expect(Number(response.body.amount)).toBe(320.00);
            expect(response.body.is_deposit).toBe(false);
            expect(response.body.transaction_ref).toBe('TESTTRANS');
            expect(new Date(response.body.paid_at)).toBeInstanceOf(Date);
            expect(response.body.processed_by).toBe(staffAccount.id);
            expect(response.body.notes).toBe('Test payment for integration tests');
        });

        // Test case for creating a new payment with invalid booking id
        it('should return 400 with invalid booking id', async () => {
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: 'invalid-booking-id',
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: 'invalid-processed-by-id',
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Booking ID must be a valid UUID');
        });

        // Test case for creating a new payment with non-existent booking id
        it('should return 404 with non-existent booking id', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({branch_id: branch.id, role: 'staff'});
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: '00000000-0000-0000-0000-000000000000',
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: staff.id,
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Booking not found');
        });

        // Test case for creating a new payment with invalid invoice id
        it('should return 400 with invalid invoice id', async () => {
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: 'invalid-booking-id',
                    invoice_id: 'invalid-invoice-id',
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: 'invalid-processed-by-id',
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invoice ID must be a valid UUID');
        });

        // Test case for creating a new payment with non-existent invoice id
        it('should return 404 with non-existent invoice id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: booking.id,
                    invoice_id: '00000000-0000-0000-0000-000000000000',
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: staff.account_id,
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invoice not found');
        });

        // Test case for creating a new payment with invalid processed by id
        it('should return 400 with invalid processed by id', async () => {
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: 'invalid-booking-id',
                    invoice_id: 'invalid-invoice-id',
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: 'invalid-processed-by-id',
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Processed By must be a valid UUID');
        });

        // Test case for creating a new payment with non-existent processed by id
        it('should return 404 with non-existent processed by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const invoice = await createTestInvoice(booking.id, staffAccount.id);
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: booking.id,
                    invoice_id: invoice.id,
                    payment_method: 'bank_transfer',
                    status: 'pending',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: 'TESTTRANS',
                    paid_at: new Date(),
                    processed_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Test payment for integration tests',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Processed by not found');
        });

        // Test case for creating a new payment with invalid data
        it('should return 400 with invalid data', async () => {
            const response = await request(app)
                .post('/payments')
                .send({
                    booking_id: 'invalid-booking-id',
                    invoice_id: 'invalid-invoice-id',
                    payment_method: 'invalid-payment-method',
                    status: 'invalid-status',
                    amount: 'invalid-amount',
                    is_deposit: 'invalid-is-deposit',
                    transaction_ref: 123,
                    paid_at: 'invalid-paid-at',
                    processed_by: 'invalid-processed-by-id',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Booking ID must be a valid UUID');
            expect(response.body.error).toContain('Invoice ID must be a valid UUID');
            expect(response.body.error).toContain('Payment method must be one of: cash, bank_transfer, online');
            expect(response.body.error).toContain('Payment status must be one of: pending, paid, refunded, failed');
            expect(response.body.error).toContain('Amount must be a valid decimal number');
            expect(response.body.error).toContain('Amount must be a positive number');
            expect(response.body.error).toContain('Is Deposit must be a boolean');
            expect(response.body.error).toContain('Transaction Reference must be a string');
            expect(response.body.error).toContain('Processed By must be a valid UUID');
        });
    });
    describe('GET /api/payments', () => {
        // Test case for getting payments by booking id
        it('should get payments by booking id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const invoice = await createTestInvoice(booking.id, staffAccount.id);
            const payment1 = await createTestPayment(booking.id, { is_deposit: true, invoice_id: invoice.id, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const payment2 = await createTestPayment(booking.id, { is_deposit: false, invoice_id: invoice.id, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.7 });
            const response = await request(app)
                .get(`/payments/booking/${booking.id}`);
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].booking_id).toBe(booking.id);
            expect(response.body[1].booking_id).toBe(booking.id);
        });

        // Test case for getting payments by id
        it('should get payments by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const invoice = await createTestInvoice(booking.id, staffAccount.id);
            const payment1 = await createTestPayment(booking.id, { is_deposit: true, invoice_id: invoice.id, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const payment2 = await createTestPayment(booking.id, { is_deposit: false, invoice_id: invoice.id, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.7 });
            const response = await request(app)
                .get(`/payments/${payment1.id}`);
            expect(response.status).toBe(200);
            expect(response.body.booking_id).toBe(booking.id);
        });

        // Test case for getting payments by invoice id
        it('should get payments by invoice id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const invoice = await createTestInvoice(booking.id, staffAccount.id);
            const payment1 = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const payment2 = await createTestPayment(booking.id, { is_deposit: false, invoice_id: invoice.id, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.7 });
            const response = await request(app)
                .get(`/payments/invoice/${invoice.id}`);
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].invoice_id).toBe(invoice.id);
        });

        // Test case for getting payments without id
        it('should return empty array', async () => {
            const response = await request(app)
                .get('/payments/');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        // Test case for getting payments with non-existent id
        it('should return 404 with non-existent id', async () => {
            const response = await request(app)
                .get('/payments/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });

        // Test case for getting payments with non-existent booking id
        it('should return 404 with non-existent booking id', async () => {
            const response = await request(app)
                .get('/payments/booking/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });

        // Test case for getting payments with non-existent invoice id
        it('should return 404 with non-existent invoice id', async () => {
            const response = await request(app)
                .get('/payments/invoice/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });

        // Test case for getting payments with invalid id
        it('should return 400 with invalid id', async () => {
            const response = await request(app)
                .get('/payments/invalid-id');
            expect(response.status).toBe(400);
        });

        // Test case for getting payments with invalid booking id
        it('should return 400 with invalid booking id', async () => {
            const response = await request(app)
                .get('/payments/booking/invalid-id');
            expect(response.status).toBe(400);
        });

        // Test case for getting payments with invalid invoice id
        it('should return 400 with invalid invoice id', async () => {
            const response = await request(app)
                .get('/payments/invoice/invalid-id');
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/payments/:id', () => {
        // Test case for updating a payment without invoice id
        it('should update a payment without invoice id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const payment = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const response = await request(app)
                .put(`/payments/${payment.id}`)
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: staffAccount.id,
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(payment.id);
        });

        // Test case for updating a payment with invalid id
        it('should return 400 with invalid id', async () => {
            const response = await request(app)
                .put('/payments/invalid-id')
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Payment ID must be a valid UUID');
        });

        // Test case for updating a payment with non-existent id
        it('should return 404 with non-existent id', async () => {
            const response = await request(app)
                .put('/payments/00000000-0000-0000-0000-000000000000')
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(404);
        });

        // Test case for updating a payment with processed by id
        it('should update a payment with valid processed by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const payment = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const response = await request(app)
                .put(`/payments/${payment.id}`)
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: staff.account_id,
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(200);
        });

        // Test case for updating a payment with invalid processed by id
        it('should return 400 with invalid processed by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const payment = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const response = await request(app)
                .put(`/payments/${payment.id}`)
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: 'invalid-processed-by-id',
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Processed By must be a valid UUID');
        });

        // Test case for updating a payment with non-existent processed by id
        it('should return 400 with non-existent processed by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const payment = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const response = await request(app)
                .put(`/payments/${payment.id}`)
                .send({
                    payment_method: 'cash',
                    status: 'paid',
                    amount: 320.00,
                    is_deposit: false,
                    transaction_ref: null,
                    paid_at: new Date(),
                    processed_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Processed by not found');
        });

        // Test case for updating a payment with invalid data
        it('should return 400 with invalid data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const staffAccount = await createTestAccount();
            const staff = await createTestStaff(branch.id, staffAccount.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const service = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, service.id, staffAccount.id);
            const payment = await createTestPayment(booking.id, { is_deposit: true, processed_by: staffAccount.id, amount: Number(booking.total_amount) * 0.3 });
            const response = await request(app)
                .put(`/payments/${payment.id}`)
                .send({
                    payment_method: 'food',
                    status: 'I dont know',
                    amount: -320,
                    is_deposit: 'invalid-is-deposit',
                    transaction_ref: 123,
                    paid_at: 'invalid-paid-at',
                    processed_by: 'invalid-processed-by-id',
                    notes: 'Updated test payment for integration tests',
                    updated_at: new Date(),
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Processed By must be a valid UUID');
            expect(response.body.error).toContain('Payment method must be one of: cash, bank_transfer, online');
            expect(response.body.error).toContain('Payment status must be one of: pending, paid, refunded, failed');
            expect(response.body.error).toContain('Amount must be a valid decimal number');
            expect(response.body.error).toContain('Amount must be a positive number');
            expect(response.body.error).toContain('Is Deposit must be a boolean');
            expect(response.body.error).toContain('Transaction Reference must be a string');
            expect(response.body.error).toContain('Invalid date format');
        });
    });
});
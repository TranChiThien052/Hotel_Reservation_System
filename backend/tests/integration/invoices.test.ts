import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBooking, cleanDatabase, createTestBranch, createTestCustomer, createTestRoomType, createTestRoomPrice, createTestAccount, createTestStaff, createTestDiscount, createTestRoom, createTestInvoice } from '../helpers/seed.ts';

describe('Invoices API', () => {
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

    describe('POST /api/invoices', () => {
        // Test case for creating a new invoice
        it('should create a new invoice', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const response = await request(app)
                .post('/invoices')
                .send({
                    booking_id: booking.id,
                    issued_by: staff.account_id,
                    notes: 'Test invoice creation'
                });
            expect(response.status).toBe(201);
        });

        // Test case for creating a new invoice with invalid booking id
        it('should return 400 if booking id is invalid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .post('/invoices')
                .send({
                    booking_id: 'invalid',
                    issued_by: staff.account_id,
                    notes: 'Test invoice creation'
                });
            expect(response.status).toBe(400);
        });

        // Test case for creating a new invoice with non-existent booking id
        it('should return 404 for creating a new invoice with non-existent booking id', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .post('/invoices')
                .send({
                    booking_id: '00000000-0000-0000-0000-000000000000',
                    issued_by: staff.account_id,
                    notes: 'Test invoice creation'
                });
            expect(response.status).toBe(404);
        });

        // Test case for creating a new invoice with invalid issued by
        it('should return 400 for creating a new invoice with invalid issued_by', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const response = await request(app)
                .post('/invoices')
                .send({
                    booking_id: booking.id,
                    issued_by: "invalid-issued_by",
                    notes: 'Test invoice creation'
                });
            expect(response.status).toBe(400);
        });

        // Test case for creating a new invoice with non-existent issued by
        it('should return 404 for creating a new invoice with non-existent issued_by', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const response = await request(app)
                .post('/invoices')
                .send({
                    booking_id: booking.id,
                    issued_by: '00000000-0000-0000-0000-000000000000',
                    notes: 'Test invoice creation'
                });
            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/invoices', () => {
        // Test case for getting all invoices
        it('should return all invoices', async () => {
            const response = await request(app).get('/invoices');
            expect(response.status).toBe(200);
        });

        // Test case for getting an invoice by id
        it('should return an invoice by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, staff.account_id);
            const response = await request(app).get(`/invoices/${invoice.id}`);
            expect(response.status).toBe(200);
        });

        // Test case for getting an invoice by invalid id
        it('should return 400 for an invalid invoice id', async () => {
            const response = await request(app).get('/invoices/invalid');
            expect(response.status).toBe(400);
        });

        // Test case for getting an invoice by non-existent id
        it('should return 404 for a non-existent invoice id', async () => {
            const response = await request(app).get('/invoices/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
    })
});
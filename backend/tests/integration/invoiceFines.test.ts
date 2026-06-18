import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { cleanDatabase, createTestBranch, createTestCustomer, createTestRoomType, createTestRoomPrice, createTestAccount, createTestStaff, createTestBooking, createTestInvoice, createTestRoom, createTestFineItem, createTestInvoiceFine } from '../helpers/seed.ts';

describe('Invoice Fines API', () => {
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

    describe('POST /api/invoice-fines', () => {
        // Test case for creating a new invoice fine
        it('should create a new invoice fine', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app)
                .post('/invoice-fines')
                .send({
                    invoice_id: invoice.id,
                    fine_item_id: fineItem.id,
                    description: 'Test fine description',
                    amount: 50.00 * Number(fineItem.price),
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(201);
        });

        // Test case for creating a new invoice fine with non-existent invoice id
        it('should return 404 for creating a new invoice fine with non-existent invoice id', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .post('/invoice-fines')
                .send({
                    invoice_id: '00000000-0000-0000-0000-000000000000',
                    description: 'Test fine description',
                    amount: 50.00,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Invoice not found");
        });
        
        // Test case for creating a new invoice fine with non-existent added_by id
        it('should return 404 for creating a new invoice fine with non-existent added_by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const response = await request(app)
                .post('/invoice-fines')
                .send({
                    invoice_id: invoice.id,
                    description: 'Test fine description',
                    amount: 50.00,
                    added_by: '00000000-0000-0000-0000-000000000000',
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Added by not found");
        });

        // Test case for creating a new invoice fine with non-existent fine item id
        it('should return 404 for creating a new invoice fine with non-existent fine item id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const response = await request(app)
                .post('/invoice-fines')
                .send({
                    invoice_id: invoice.id,
                    description: 'Test fine description',
                    amount: 50.00,
                    fine_item_id: '00000000-0000-0000-0000-000000000000',
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Fine item not found");
        });

        // Test case for creating a new invoice fine with invalid data
        it('should return 400 for creating a new invoice fine with invalid data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const response = await request(app)
                .post('/invoice-fines')
                .send({
                    invoice_id: "invalid-invoice-id",
                    fine_item_id: "invalid-fine-item-id",
                    description: 123,
                    amount: -50.00,
                    added_by: 324,
                });
            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Invoice ID must be a valid UUID");
            expect(response.body.error).toContain("Fine Item ID must be a valid UUID");
            expect(response.body.error).toContain("Description must be a string");
            expect(response.body.error).toContain("Amount must be a positive number");
            expect(response.body.error).toContain("Added By must be a valid UUID");
        });
    });
    describe('GET /api/invoice-fines/:id', () => {
        // Test case for getting an invoice fine by ID
        it('should return an invoice fine by ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .get(`/invoice-fines/${invoiceFine.id}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(invoiceFine.id);
            expect(response.body).toHaveProperty('fine_items');
        });

        // Test case for getting invoice fines by invoice ID
        it('should return invoice fines by invoice ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .get(`/invoice-fines/invoice/${invoice.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        // Test case for getting invoice fine with non-existent ID
        it('should return invoice fines by non-existent ID', async () => {
            const response = await request(app)
                .get(`/invoice-fines/ee062e50-8ee7-4f29-8236-693ba30eee23`);
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Invoice fine not found");
        });

        // Test case for getting invoice fines with non-existent invoice ID
        it('should return invoice fines by non-existent invoice ID', async () => {
            const response = await request(app)
                .get(`/invoice-fines/invoice/ee062e50-8ee7-4f29-8236-693ba30eee23`);
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Invoice not found");
        });

        // Test case for getting invoice fine with invalid ID
        it('should return invoice fines by invalid ID', async () => {
            const response = await request(app)
                .get(`/invoice-fines/invalid-id`);
            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Invoice Fine ID must be a valid UUID");
        });

        // Test case for getting invoice fines with invalid invoice ID
        it('should return invoice fines by invalid invoice ID', async () => {
            const response = await request(app)
                .get(`/invoice-fines/invoice/invalid-id`);
            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Invoice ID must be a valid UUID");
        });
    });
    describe('PUT /api/invoice-fines/:id', () => {
        // Test case for updating an invoice fine
        it('should update an invoice fine', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .put(`/invoice-fines/${invoiceFine.id}`)
                .send({
                    description: 'Updated fine description',
                    amount: 100.00,
                    fine_item_id: fineItem.id,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(200);
            expect(response.body.description).toBe('Updated fine description');
            expect(Number(response.body.amount)).toBe(100.00);
        });
        
        // Test case for updating an invoice fine with invalid data
        it('should return 400 with invalid data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .put(`/invoice-fines/${invoiceFine.id}`)
                .send({
                    fine_item_id: 'invalide-fine-item-id',
                    description: 13,
                    amount: -100.00,
                    added_by: 'invalid-added-by-id',
                });
            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Fine Item ID must be a valid UUID");
            expect(response.body.error).toContain("Description must be a string");
            expect(response.body.error).toContain("Amount must be a positive number");
            expect(response.body.error).toContain("Added By must be a valid UUID");
        });

        // Test case for updating an invoice fine without ID
        it('should return 400 for updating an invoice fine without ID', async () => {
            const response = await request(app)
                .put(`/invoice-fines/`)
                .send({
                    description: 'Updated fine description',
                    amount: 100.00,
                });
            expect(response.status).toBe(404);
        });

        // Test case for updating an invoice fine with non-existent ID
        it('should return 404 for updating an invoice fine with non-existent ID', async () => {
            const response = await request(app)
                .put(`/invoice-fines/00000000-0000-0000-0000-000000000000`)
                .send({
                    description: 'Updated fine description',
                    amount: 100.00,
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Invoice fine not found");
        });

        // Test case for updating an invoice fine with non-existent fine item ID
        it('should return 404 for updating an invoice fine with non-existent fine item ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .put(`/invoice-fines/${invoiceFine.id}`)
                .send({
                    fine_item_id: '00000000-0000-0000-0000-000000000000',
                    description: 'Updated fine description',
                    amount: 100.00,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Fine item not found");
        });

        // Test case for updating an invoice fine with non-existent added_by ID
        it('should return 404 for updating an invoice fine with non-existent added_by ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, { assigned_room_id: room.id });
            const invoice = await createTestInvoice(booking.id, account.id);
            const fineItem = await createTestFineItem(branch.id);
            const invoiceFine = await createTestInvoiceFine(invoice.id, { fine_item_id: fineItem.id, description: 'Test fine description', amount: 3, added_by: staff.account_id });
            const response = await request(app)
                .put(`/invoice-fines/${invoiceFine.id}`)
                .send({
                    fine_item_id: fineItem.id,
                    description: 'Updated fine description',
                    amount: 100.00,
                    added_by: '00000000-0000-0000-0000-000000000000',
                });
            expect(response.status).toBe(404);
            expect(response.body.error).toContain("Added by not found");
        });
    });
});
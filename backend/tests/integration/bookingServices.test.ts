import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { cleanDatabase, createTestBranch, createTestRoomType, createTestRoomPrice, createTestCustomer, createTestAccount, createTestStaff, createTestBooking, createTestBookingService, createTestRoomService } from '../helpers/seed.ts';

describe('Booking Service API', () => {
    beforeAll(async () => {
        await cleanDatabase();
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /booking-services', () => {
        // Test case for creating a booking service with valid data
        it('should create a booking service with valid data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: booking.id,
                    service_id: roomService.id,
                    quantity: 2,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        // Test case for creating a booking service with missing required fields
        it('should return a 400 error when required fields are missing', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: null,
                    service_id: null,
                    quantity: null,
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Booking ID is required");
            expect(response.body.error).toContain("Service ID is required");
            expect(response.body.error).toContain("Quantity is required");
        });

        // Test case for creating a booking service with non-existent booking_id
        it('should return a 400 error when booking_id does not exist', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: '00000000-0000-0000-0000-000000000000',
                    service_id: roomService.id,
                    quantity: 2,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Booking not found");
        });

        // Test case for creating a booking service with non-existent service_id
        it('should return a 400 error when service_id does not exist', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: booking.id,
                    service_id: '00000000-0000-0000-0000-000000000000',
                    quantity: 2,
                    added_by: staff.account_id,
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Service not found");
        });

        // Test case for creating a booking service with non-existent added_by account_id
        it('should return a 400 error when added_by id does not exist', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: booking.id,
                    service_id: roomService.id,
                    quantity: 2,
                    added_by: "00000000-0000-0000-0000-000000000000",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Added_by's ID not found");
        });

        // Test case for creating a booking service with invalid data types
        it('should return a 400 error with invalid data types', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const response = await request(app)
                .post('/booking-services')
                .send({
                    booking_id: 1,
                    service_id: 2,
                    quantity: "two",
                    added_by: 3,
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Booking ID must be a valid UUID");
            expect(response.body.error).toContain("Service ID must be a valid UUID");
            expect(response.body.error).toContain("Quantity must be a positive number");
            expect(response.body.error).toContain("Added_by's ID must be a valid UUID");
        });
    });
    describe('GET /booking-services/:id', () => {
        // Test case for getting a booking service by ID
        it('should get a booking service by ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .get(`/booking-services/${bookingService.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', bookingService.id);
        });

        // Test case for getting a booking service with non-existent ID
        it('should return a 404 error for non-existent ID', async () => {
            const response = await request(app)
                .get(`/booking-services/00000000-0000-0000-0000-000000000000`);
            expect(response.status).toBe(404);
        });

        // Test case for getting a booking service with booking's ID
        it('should get a booking service by booking\'s ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .get(`/booking-services/bookings/${booking.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        // Test case for getting a booking services with non-existent booking's ID
        it('should return a 404 error for non-existent booking\'s ID', async () => {
            const response = await request(app)
                .get(`/booking-services/bookings/00000000-0000-0000-0000-000000000000`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        // Test case for getting a booking service with invalid ID format
        it('should return a 400 error for invalid ID format', async () => {
            const response = await request(app)
                .get(`/booking-services/invalid-id`);
            expect(response.status).toBe(400);
            console.log(response.body);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Booking Service's ID must be a valid UUID");
        });

        // Test case for getting a booking service with invalid booking's ID format
        it('should return a 400 error for invalid booking\'s ID format', async () => {
            const response = await request(app)
                .get(`/booking-services/bookings/invalid-id`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Booking's ID must be a valid UUID");
        });
    });
    describe('PUT /booking-services/:id', () => {
        // Test case for updating a booking service
        it('should update a booking service', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .put(`/booking-services/${bookingService.id}`)
                .send({
                    quantity: 3,
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', bookingService.id);
            expect(response.body).toHaveProperty('quantity', 3);
            expect(response.body).toHaveProperty('total_amount');
            expect(Number(response.body.total_amount)).toBe(3 * Number(bookingService.unit_price));
        });

        // Test case for updating a booking service with non-existent ID
        it('should return a 404 error for non-existent ID', async () => {
            const response = await request(app)
                .put(`/booking-services/00000000-0000-0000-0000-000000000000`)
                .send({
                    quantity: 3,
                });
            expect(response.status).toBe(404);
        });

        // Test case for updating a booking service with invalid data types
        it('should return a 400 error with invalid data types', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .put(`/booking-services/${bookingService.id}`)
                .send({
                    quantity: "three",
                    unit_price: "twenty",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Quantity must be a positive number");
            expect(response.body.error).toContain("Unit Price must be a valid decimal number");
            expect(response.body.error).toContain("Unit Price must be a positive number");
        });

        // Test case for updating a booking service with invalid added_by account_id
        it('should return a 400 error with invalid added_by account_id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .put(`/booking-services/${bookingService.id}`)
                .send({
                    added_by: "invalid-uuid",
                });
                console.error(response.body);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Added_by's ID must be a valid UUID");
        });

        // Test case for updating a booking service with non-existent added_by account_id
        it('should return a 400 error with non-existent added_by account_id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const booking = await createTestBooking(branch.id, customer.id, roomType.id);
            const roomService = await createTestRoomService(branch.id);
            const bookingService = await createTestBookingService(booking.id, roomService.id, staff.account_id);
            const response = await request(app)
                .put(`/booking-services/${bookingService.id}`)
                .send({
                    added_by: "00000000-0000-0000-0000-000000000000",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain("Added_by's ID not found");
        });
    });
});
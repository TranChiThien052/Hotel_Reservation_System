import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBooking, cleanDatabase, createTestBranch, createTestCustomer, createTestRoomType, createTestRoomPrice, createTestAccount, createTestStaff, createTestDiscount, createTestRoom } from '../helpers/seed.ts';

describe('Bookings API', () => {
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

    describe('GET /api/bookings', () => {
        // Test case for getting all bookings
        it('should return all bookings', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            for (let i = 0; i < 3; i++) {
                await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: `TEST_00${i}`});
            }

            const response = await request(app).get('/bookings');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
        });
        // Test case for getting a booking by ID
        it('should return a booking by ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});

            const response = await request(app).get(`/bookings/${booking.id}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(booking.id);
        });
        // Test case for getting a booking by non-existent ID
        it('should return 404 for non-existent booking ID', async () => {
            const response = await request(app).get('/bookings/2bbce2bc-24ef-4fb5-bd29-c7405acefdd8');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/bookings', () => {
        // Test case for creating a new daily booking
        it('should create a new daily booking', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Check-in tomorrow
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Check-out in two days
                num_guests: 2,
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.booking_type).toBe('daily');
            expect(parseFloat(response.body.subtotal)).toBe(100);
        });

        // Test case for creating a new hourly booking
        it('should create a new hourly booking', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_hour: 100});
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'hourly',
                checkin_at: new Date(Date.now() + 15 * 60 * 1000),
                checkout_at: new Date(Date.now() + 135 * 60 * 1000), 
                num_guests: 2,
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.booking_type).toBe('hourly');
            expect(parseFloat(response.body.subtotal)).toBe(200);
        });

        // Test case for creating a new booking with invalid data
        it('should return 400 for invalid booking data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_hour: 100});
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'invalid-type',
                status: 'invalide_status',
                checkin_at: '2026-07-01',
                checkout_at: '2026-06-02',
                num_guests: -1,
            });
            expect(response.status).toBe(400);
        });

        // Test case for creating a new booking with non-existent branch ID
        it('should return 400 for non-existent branch ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Check-in tomorrow
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Check-out in two days
                num_guests: 2,
            });
            expect(response.status).toBe(400);
        });

        // Test case for creatting a new booking with non-existent room type ID
        it('should return 400 for non-existent room type ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Check-in tomorrow
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Check-out in two days
                num_guests: 2,
            });
            expect(response.status).toBe(400);
        });

        // Test case for creating a new booking with non-existent customer ID
        it('should return 400 for non-existent customer ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Check-in tomorrow
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Check-out in two days
                num_guests: 2,
            });
            expect(response.status).toBe(400);
        });

        // Test case for creating a new booking with created_by field
        it('should create a new booking with valid created_by field', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const account = await createTestAccount();
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                num_guests: 2,
                created_by: account.id,
            });
            expect(response.status).toBe(201);
            expect(response.body.created_by).toBe(account.id);
        });

        // Test case for creating a new booking without created_by field
        it('should create a new booking without valid created_by field', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id);
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                num_guests: 2,
            });
            expect(response.status).toBe(201);
            expect(response.body.created_by).toBe(null);
        });

        // Test case for creating a new booking with discount ID
        it('should create a new booking with valid discount ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const discount = await createTestDiscount({ discount_type: "percentage", discount_value: 30 });
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                num_guests: 2,
                discount_id: discount.id,
            });
            expect(response.status).toBe(201);
            expect(response.body.discount_id).toBe(discount.id);
            expect(parseFloat(response.body.discount_amount)).toBe(30);
            expect(parseFloat(response.body.total_amount)).toBe(70);
        });

        // Test case for creating a new booking with invalid discount ID
        it('should return an error when creating a booking with an invalid discount ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const response = await request(app)            
            .post('/bookings')
            .send({
                branch_id: branch.id,
                customer_id: customer.id,
                room_type_id: roomType.id,
                booking_type: 'daily',
                checkin_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                num_guests: 2,
                discount_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
            });
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/bookings/:id', () => {
        // Test case for updating a booking
        it('should update a booking', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                status: 'confirmed',
                num_guests: 3,
                checkin_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                actual_checkin_at: new Date(Date.now() + 48 * 60 * 60 * 1000 + 15 * 60 * 1000),
                actual_checkout_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
                deposit_amount: 100,
                deposit_paid_at: new Date(),
            });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('confirmed');
            expect(response.body.num_guests).toBe(3);
        });

        // Test case for updating a booking with invalid status, number of guests,
        // check-in and check-out times, deposit amount, and discount ID, deposit paid at
        it('should return 400 for invalid booking update data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                status: 'invalid_status',
                num_guests: -1,
                checkin_at: '2026-07-01',
                checkout_at: '2026-06-02',
                actual_checkin_at: '2026-07-01',
                actual_checkout_at: '2026-06-02',
                deposit_amount: -100,
                discount_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
                deposit_paid_at: 'invalid_date',
            });
            expect(response.status).toBe(400);
        });

        // Test case for updating a non-existent booking
        it('should return 404 for non-existent booking ID', async () => {
            const response = await request(app)
            .put('/bookings/2bbce2bc-24ef-4fb5-bd29-c7405acefdd8')
            .send({
                status: 'confirmed',
                num_guests: 3,
                checkin_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
                checkout_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                actual_checkin_at: new Date(Date.now() + 48 * 60 * 60 * 1000 + 15 * 60 * 1000),
                actual_checkout_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
                deposit_amount: 100,
                deposit_paid_at: new Date(),
            });
            expect(response.status).toBe(404);
        });

        // Test case for updating a booking with discount ID
        it('should update a booking with valid discount ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const discount = await createTestDiscount({ discount_type: "percentage", discount_value: 30 });
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                discount_id: discount.id,
            });
            expect(response.status).toBe(200);
            expect(response.body.discount_id).toBe(discount.id);
            expect(parseFloat(response.body.discount_amount)).toBe(60);
            expect(parseFloat(response.body.total_amount)).toBe(140);
        });

        // Test case for updating a booking with invalid discount ID
        it('should return an error when updating a booking with an invalid discount ID', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                discount_id: "a15a9d53-037e-4732-a395-7aa48d272c98",
            });
            expect(response.status).toBe(400);
        });

        // Test case for updating a booking to change actual check-in and check-out times
        it('should update a booking to change actual check-in and check-out times', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                actual_checkin_at: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000),
                actual_checkout_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            });
            expect(response.status).toBe(200);
        });

        // Test case for updating a booking to change invalid actual check-in and check-out times
        it('should return 400 when updating a booking with invalid actual check-in and check-out times', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                actual_checkin_at: 'invalid_date',
                actual_checkout_at: 'invalid_date',
            });
            expect(response.status).toBe(400);
        });

        // Test case for updating a booking to assign a room
        it('should update a booking to assign a room', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const room = await createTestRoom(branch.id, roomType.id);
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                assigned_room_id: room.id,
            });
            expect(response.status).toBe(200);
            expect(response.body.assigned_room_id).toBe(room.id);
        });

        // Test case for updating a booking with invalid room assignment
        it('should return 400 when updating a booking with invalid room assignment', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPrice = await createTestRoomPrice(roomType.id, {price_per_day: 100});
            const customer = await createTestCustomer();
            const booking = await createTestBooking(branch.id, customer.id, roomType.id, {booking_code: 'TEST_001'});
            const response = await request(app)
            .put(`/bookings/${booking.id}`)
            .send({
                assigned_room_id: 'invalid_room_id',
            });
            expect(response.status).toBe(400);
        });
    });
});
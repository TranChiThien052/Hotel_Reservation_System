import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBranch, createTestRoomType, cleanDatabase, createTestRoomPrice } from '../helpers/seed.ts';

describe('Room Prices API', () => {
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

    describe('GET /api/room-prices', () => {
        // Test case for getting all room prices
        it('should get all room prices', async () => {
            const branch = await createTestBranch();
            const roomType1 = await createTestRoomType(branch.id);
            const roomType2 = await createTestRoomType(branch.id);
            await createTestRoomPrice(roomType1.id);
            await createTestRoomPrice(roomType2.id);
            const response = await request(app).get('/room-prices');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        // Test case for getting room price by id
        it('should get room price by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPriceData = await createTestRoomPrice(roomType.id);
            const response = await request(app).get(`/room-prices/${roomPriceData.id}`);
            expect(response.status).toBe(200);
        });

        // Test case for getting room price by non-existent id
        it('should return 404 for non-existent room price id', async () => {
            const response = await request(app).get('/room-prices/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });

        // Test case for getting room price by room type id
        it('should get room price by room type id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPriceData = await createTestRoomPrice(roomType.id);
            const response = await request(app).get(`/room-prices/room-type/${roomType.id}`);
            expect(response.status).toBe(200);
        });

        // Test case for getting room price by non-existent room type id
        it('should return 404 for non-existent room type id', async () => {
            const response = await request(app).get('/room-prices/room-type/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
    });


    describe('POST /api/room-prices', () => {
        // Test case for creating a new room price
        it('should create a new room price', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .post('/room-prices')
                .send({
                    room_type_id: roomType.id,
                    price_per_day: 100.00,
                    price_per_hour: 50.00,
                    weekend_rate: 120.00,
                    holiday_rate: 150.00,
                    effective_from: '2024-01-01',
                    effective_to: '2024-12-31',
                });
            expect(response.status).toBe(201);
        });
        // Test case for creating a room price with non-existent room type id
        it('should return 400 for non-existent room type id', async () => {
            const response = await request(app)
                .post('/room-prices')
                .send({
                    room_type_id: 'b7df229c-a9c6-481f-8cee-9d25abb9e576',
                    price_per_day: 100.00,
                    price_per_hour: 50.00,
                    weekend_rate: 120.00,
                    holiday_rate: 150.00,
                    effective_from: '2024-01-01',
                    effective_to: '2024-12-31',
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room price with missing required fields
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/room-prices')
                .send({
                    price_per_day: 100.00,
                    effective_from: '2024-01-01',
                    effective_to: '2024-12-31',
                });
            expect(response.status).toBe(400);
        });
        
        // Test case for creating a room price with invalid data
        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/room-prices')
                .send({
                    room_type_id: "invalid-id",
                    price_per_day: -100.00,
                    price_per_hour: "invalid-price",
                    weekend_rate: "invalid-rate",
                    holiday_rate: "invalid-rate",
                    effective_from: '2025-02-31',
                    effective_to: '2024-12-31',
                });
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/room-prices/:id', () => {
        // Test case for updating a room price
        it('should update a room price', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPriceData = await createTestRoomPrice(roomType.id);
            const response = await request(app)
                .put(`/room-prices/${roomPriceData.id}`)
                .send({
                    price_per_day: 120.00,
                    price_per_hour: 60.00,
                    weekend_rate: 1.5,
                    holiday_rate: 2,
                    effective_from: '2024-02-01',
                    effective_to: '2024-11-30',
                });
            expect(response.status).toBe(200);
        });

        // Test case for updating a room price with non-existent id
        it('should return 404 for non-existent room price id', async () => {
            const response = await request(app)
                .put('/room-prices/00000000-0000-0000-0000-000000000000')
                .send({
                    price_per_day: 120.00,
                    price_per_hour: 60.00,
                    weekend_rate: 1.5,
                    holiday_rate: 2,
                    effective_from: '2024-02-01',
                    effective_to: '2024-11-30',
                });
            expect(response.status).toBe(400);
        });

        // Test case for updating a room price with invalid data
        it('should return 400 for invalid data', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const roomPriceData = await createTestRoomPrice(roomType.id);
            const response = await request(app)
                .put(`/room-prices/${roomPriceData.id}`)
                .send({
                    price_per_day: -120.00,
                    price_per_hour: "invalid-price",
                    weekend_rate: "invalid-rate",
                    holiday_rate: -5,
                    effective_from: '2025-02-31',
                    effective_to: '2024-12-31',
                });
            expect(response.status).toBe(400);
        });        
    });
});
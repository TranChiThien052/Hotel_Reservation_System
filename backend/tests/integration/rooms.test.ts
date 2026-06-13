import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBranch, cleanDatabase, createTestRoom, createTestRoomType } from '../helpers/seed.ts';

describe('Rooms API', () => {
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

    describe('GET /api/rooms', () => {
        // Test case for getting all rooms
        it('should get all rooms', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            for (let i = 0; i < 3; i++) 
                await createTestRoom(branch.id, roomType.id, 
            {
                room_number: `10${i+1}`,
            });
            const response = await request(app).get('/rooms');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        // Test case for getting room by id
        it('should get room by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const room = await createTestRoom(branch.id, roomType.id);
            const response = await request(app).get(`/rooms/${room.id}`);
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/rooms', () => {
        // Test case for creating a new room
        it('should create a new room', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: branch.id,
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(201);
        });
        // Test case for creating a room with missing required fields
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: null,
                    room_type_id: null,
                    room_number: null,
                    floor: 1,
                    basic: [],
                    extra: [],
                    status: null,
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with missing branch_id
        it('should return 400 for missing branch_id', async () => {
            const roomType = await createTestRoomType((await createTestBranch()).id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with invalid branch_id
        it('should return 400 for invalid branch_id', async () => {
            const roomType = await createTestRoomType((await createTestBranch()).id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(400);
        }
        );
        // Test case for creating a room with missing room_type_id
        it('should return 400 for missing room_type_id', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: branch.id,
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with invalid room_type_id
        it('should return 400 for invalid room_type_id', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/rooms')                .send({
                    branch_id: branch.id,
                    room_type_id: '00000000-0000-0000-0000-000000000000',
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with invalid status
        it('should return 400 for invalid status', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: branch.id,
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 1,
                    status: "invalid_status",
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with non-boolean is_active
        it('should return 400 for non-boolean is_active', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: branch.id,
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 1,
                    status: "available",
                    is_active: "not_a_boolean",
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a room with non-integer floor
        it('should return 400 for non-integer floor', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .post('/rooms')
                .send({
                    branch_id: branch.id,
                    room_type_id: roomType.id,
                    room_number: '101',
                    floor: 'not_an_integer',
                    status: "available",
                    is_active: true,
                });
            expect(response.status).toBe(400);
        });
    });
});
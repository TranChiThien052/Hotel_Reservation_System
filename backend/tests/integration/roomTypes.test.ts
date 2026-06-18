import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBranch, createTestRoomType, cleanDatabase } from '../helpers/seed.ts';

describe('Room Types API', () => {
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

    describe('GET /api/room-types', () => {
        // Test case for getting all room types
        it('should get all room types', async () => {
            const branch = await createTestBranch();
            for (let i = 0; i < 3; i++)
                await createTestRoomType(branch.id);
            const response = await request(app).get('/room-types');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        // Test case for getting room types by id
        it('should get room types by id', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app).get(`/room-types/${roomType.id}`);
            expect(response.status).toBe(200);
        });
        // Test case for getting room types by non-existent id
        it('should return 404 for non-existent room type id', async () => {
            const response = await request(app).get('/room-types/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
        // Test case for getting room types by branch id
        it('should get room types by branch id', async () => {
            const branch = await createTestBranch();
            for (let i = 0; i < 3; i++)
                await createTestRoomType(branch.id);
            const response = await request(app).get(`/room-types/branch/${branch.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        // Test case for getting room types by non-existent branch id
        it('should return 400 for non-existent branch id', async () => {
            const response = await request(app).get('/room-types/branch/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/room-types', () => {
        // Test case for creating a new room type
        it('should create a new room type', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/room-types')
                .send({
                    branch_id: branch.id,
                    name: 'Deluxe Room',
                    description: 'A deluxe room with sea view',
                    max_guests: 2,
                    images: [],
                    is_active: true
                });
            expect(response.status).toBe(201);
        });
        // Test case for missing name field
        it('should return 400 if name is missing', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/room-types')
                .send({
                    branch_id: branch.id,
                    name: "",
                    description: 'A deluxe room with sea view',
                    max_guests: 2,
                    images: [],
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for invalid branch_id
        it('should return 400 if branch_id is invalid', async () => {
            const response = await request(app)
                .post('/room-types')
                .send({
                    branch_id: 'invalid-id',
                    name: 'Deluxe Room',
                    description: 'A deluxe room with sea view',
                    max_guests: 2,
                    images: [],
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for non-existent branch_id
        it('should return 400 if branch_id does not exist', async () => {
            const response = await request(app)
                .post('/room-types')
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    name: 'Deluxe Room',
                    description: 'A deluxe room with sea view',
                    max_guests: 2,
                    images: [],
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for invalid max_guests        
        it('should return 400 if max_guests is invalid', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/room-types')
                .send({
                    branch_id: branch.id,
                    name: 'Deluxe Room',
                    description: 'A deluxe room with sea view',
                    max_guests: -1,
                    images: [],
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/room-types/:id', () => {
        // Test case for updating a room type
        it('should update a room type', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .put(`/room-types/${roomType.id}`)
                .send({
                    name: 'Updated Room Type',
                    description: 'Updated description',
                    max_guests: 3,
                    images: [],
                    is_active: false
                });
            expect(response.status).toBe(200);
        });
        // Test case for updating a non-existent room type
        it('should return 404 for non-existent room type id', async () => {
            const response = await request(app)
                .put('/room-types/00000000-0000-0000-0000-000000000000')
                .send({
                    name: 'Updated Room Type',
                    description: 'Updated description',
                    max_guests: 3,
                    images: [],
                    is_active: false
                });
            expect(response.status).toBe(404);
        });
        // Test case for invalid branch_id during update
        it('should return 400 if branch_id is invalid during update', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .put(`/room-types/${roomType.id}`)
                .send({
                    branch_id: 'invalid-id',
                    name: 'Updated Room Type',
                    description: 'Updated description',
                    max_guests: 3,
                    images: [],
                    is_active: false
                });
            expect(response.status).toBe(400);
        });
        // Test case for non-existent branch_id during update
        it('should return 400 if branch_id does not exist during update', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .put(`/room-types/${roomType.id}`)
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    name: 'Updated Room Type',
                    description: 'Updated description',
                    max_guests: 3,
                    images: [],
                    is_active: false
                });
            expect(response.status).toBe(400);
        });
        // Test case for invalid max_guests during update
        it('should return 400 if max_guests is invalid during update', async () => {
            const branch = await createTestBranch();
            const roomType = await createTestRoomType(branch.id);
            const response = await request(app)
                .put(`/room-types/${roomType.id}`)
                .send({
                    name: 'Updated Room Type',
                    description: 'Updated description',
                    max_guests: -1,
                    images: [],
                    is_active: false
                });
            expect(response.status).toBe(400);
        });
    });
});
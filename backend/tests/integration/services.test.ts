import request from 'supertest';
import app from '../../src/app.ts';
import BranchRepository from '../../src/repositories/branchRepo.ts';
import RoomServiceRepository from '../../src/repositories/roomServiceRepo.ts';
import { cleanDatabase, createTestBranch, createTestRoomService } from '../helpers/seed.ts';

describe('Room Service API', () => {
    beforeAll(async () => {
        await cleanDatabase();
    });
    describe('GET /api/services', () => {
        // Test case for getting all services
        it('should get all services', async () => {
            const response = await request(app).get('/services');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        // Test case for getting service by id
        it('should get service by id', async () => {
            const branch = await createTestBranch();
            const service = await createTestRoomService(branch.id);
            const response = await request(app).get(`/services/${service.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', service.id);
        });
        // Test case for getting service by non-existent id
        it('should return 404 for non-existent service id', async () => {
            const response = await request(app).get('/services/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
    });
    describe('POST /api/services', () => {
        // Test case for creating a new service
        it('should create a new service', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/services')
                .send({
                    branch_id: branch.id,
                    name: 'Test Service',
                    description: 'A test service for unit tests',
                    price: 20.00,
                    unit: 'per item',
                    is_active: true
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        // Test case for creating a service with invalid branch id
        it('should return 400 for invalid branch id', async () => {
            const response = await request(app)
                .post('/services')
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    name: 'Test Service',
                    description: 'A test service for unit tests',
                    price: 20.00,
                    unit: 'per item',
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a service with missing required fields
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/services')
                .send({
                    name: '',
                    price: 20.00,
                    unit: 'per item',
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a service with invalid data
        it('should return 400 for invalid data', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/services')
                .send({
                    branch_id: branch.id,
                    name: 1,
                    description: 'A test service for unit tests',
                    price: -20.00,
                    unit: true,
                    is_active: 40
                });
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/services/:id', () => {
        // Test case for updating a service
        it('should update a service', async () => {
            const branch = await createTestBranch();
            const service = await createTestRoomService(branch.id);
            const response = await request(app)
                .put(`/services/${service.id}`)
                .send({
                    name: 'Updated Test Service',
                    price: 25.00,
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', service.id);
            expect(response.body.name).toBe('Updated Test Service');
            expect(Number(response.body.price)).toBe(25.00);
        });
        // Test case for updating a non-existent service        
        it('should return 404 for non-existent service id', async () => {
            const response = await request(app)
                .put('/services/00000000-0000-0000-0000-000000000000')
                .send({
                    name: 'Updated Test Service',
                    price: 25.00,
                });
            expect(response.status).toBe(404);
        });
        // Test case for updating a service with invalid data
        it('should return 400 for invalid data', async () => {
            const branch = await createTestBranch();
            const service = await createTestRoomService(branch.id);
            const response = await request(app)
                .put(`/services/${service.id}`)
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    name: 1,
                    price: -25.00,
                });
            expect(response.status).toBe(400);
        });
    });
});
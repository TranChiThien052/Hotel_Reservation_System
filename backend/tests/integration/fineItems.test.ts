import request from 'supertest';
import app from '../../src/app.ts';
import { createTestBranch, createTestFineItem, cleanDatabase } from '../helpers/seed.ts';
import { prisma } from '../helpers/prisma.ts'

describe('Fine Item API Integration Tests', () => {
    beforeAll(async () => {
        await cleanDatabase();
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await cleanDatabase();
        await prisma.$disconnect();
    });

    describe('POST /fine-items', () => {
        // Test case for creating a fine item with valid data
        it('should create a fine item with valid data', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/fine-items')
                .send({
                    branch_id: branch.id,
                    name: 'Test Fine Item',
                    description: 'Test fine item for integration tests',
                    price: 50.00
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });

        // Test case for creating a fine item with missing required fields
        it('should return 400 an error for missing required fields', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/fine-items')
                .send({
                    branch_id: branch.id,
                    description: 'Test fine item for integration tests',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Name is required');
            expect(response.body.error).toContain('Price is required');
        });

        // Test case for creating a fine item with invalid data types
        it('should return 400 an error for invalid data types', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/fine-items')
                .send({
                    branch_id: false,
                    name: 123,
                    description: 'Test fine item for integration tests',
                    price: 'invalid'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Name must be a string');
            expect(response.body.error).toContain('Price must be a valid decimal number');
        });

        // Test case for creating a fine item with invalid branch_id
        it('should return 400 an error for invalid branch_id', async () => {
            const response = await request(app)
                .post('/fine-items')
                .send({
                    branch_id: 'invalid-uuid',
                    name: 'Test Fine Item',
                    description: 'Test fine item for integration tests',
                    price: 50.00
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });

        // Test case for creating a fine item with non-existent branch_id
        it('should return 400 an error for non-existent branch_id', async () => {
            const response = await request(app)
                .post('/fine-items')
                .send({
                    branch_id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Test Fine Item',
                    description: 'Test fine item for integration tests',
                    price: 50.00
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID does not exist');
        });
    });
    describe('GET /fine-items/:id', () => {
        // Test case for retrieving all fine items
        it('should retrieve all fine items', async () => {
            const branch = await createTestBranch();
            await createTestFineItem(branch.id);
            const response = await request(app).get('/fine-items');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        // Test case for retrieving a fine item by ID
        it('should retrieve a fine item by ID', async () => {
            const branch = await createTestBranch();
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app).get(`/fine-items/${fineItem.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', fineItem.id);
        });

        // Test case for retrieving a fine item with non-existent ID
        it('should return 404 an error for non-existent fine item ID', async () => {
            const response = await request(app).get('/fine-items/123e4567-e89b-12d3-a456-426614174000');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Fine item not found');
        });

        // Test case for retrieving a fine item with invalid ID format
        it('should return 400 an error for invalid fine item ID format', async () => {
            const response = await request(app).get('/fine-items/invalid-id');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Fine Item ID must be a valid UUID');
        });

        // Test case for retrieving a fine item with branch_id
        it('should retrieve fine items by branch_id', async () => {
            const branch = await createTestBranch();
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app).get(`/fine-items/branch/${branch.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id', fineItem.id);
        });

        // Test case for retrieving fine items with non-existent branch_id
        it('should return an empty array for non-existent branch_id', async () => {
            const response = await request(app).get('/fine-items/branch/123e4567-e89b-12d3-a456-426614174000');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        // Test case for retrieving a fine item with invalid branch_id format
        it('should return 400 an error for invalid branch_id format', async () => {
            const response = await request(app).get('/fine-items/branch/invalid-uuid');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });
    });
    describe('PUT /fine-items/:id', () => {
        // Test case for updating a fine item with valid data
        it('should update a fine item with valid data', async () => {
            const branch = await createTestBranch();
            const branch2 = await createTestBranch({ name: 'Second Test Branch' });
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app)
                .put(`/fine-items/${fineItem.id}`)
                .send({
                    branch_id: branch2.id,
                    name: 'Updated Fine Item',
                    description: 'Updated description for fine item',
                    price: 75.00
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', fineItem.id);
            expect(response.body).toHaveProperty('branch_id', branch2.id);
            expect(response.body).toHaveProperty('name', 'Updated Fine Item');
            expect(response.body).toHaveProperty('description', 'Updated description for fine item');
            expect(response.body).toHaveProperty('price');
            expect(parseFloat(response.body.price)).toBeCloseTo(75.00);
        });

        // Test case for updating a fine item with invalid id
        it('should return 400 an error for invalid fine item ID format', async () => {
            const response = await request(app)
                .put('/fine-items/invalid-id')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Fine Item ID must be a valid UUID');
        });

        // Test case for updating a fine item with non-existent id
        it('should return 404 an error for non-existent fine item ID', async () => {
            const response = await request(app)
                .put('/fine-items/123e4567-e89b-12d3-a456-426614174000')
                .send({});
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Fine item not found');
        });

        // Test case for updating a fine item with invalid branch id
        it('should return 400 an error for invalid branch_id format', async () => {
            const branch = await createTestBranch();
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app)
                .put(`/fine-items/${fineItem.id}`)
                .send({
                    branch_id: 'invalid-uuid',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });

        // Test case for updating a fine item with non-existent branch id
        it('should return 400 an error for non-existent branch_id', async () => {
            const branch = await createTestBranch();
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app)
                .put(`/fine-items/${fineItem.id}`)
                .send({
                    branch_id: '123e4567-e89b-12d3-a456-426614174000',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID does not exist');
        });

        // Test case for updating a fine item with invalid data types
        it('should return 400 an error for invalid data types', async () => {
            const branch = await createTestBranch();
            const fineItem = await createTestFineItem(branch.id);
            const response = await request(app)
                .put(`/fine-items/${fineItem.id}`)
                .send({
                    name: 123,
                    price: 'invalid'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Name must be a string');
            expect(response.body.error).toContain('Price must be a valid decimal number');
        });
    });
});
import requeset from 'supertest';
import app from '../../src/app.ts';
import { createTestBranch, createTestRoomType, createTestRoom, createTestRoomPrice, cleanDatabase, createTestDiscount } from '../helpers/seed.ts';

describe('Discounts API', () => {
   beforeAll(async () => {
      await cleanDatabase();
   });

   afterEach(async () => {
      await cleanDatabase();
   });

   afterAll(async () => {
      await cleanDatabase();
   });

    describe('GET /api/discounts', () => {
        // Test case for getting all discounts
        it('should get all discounts', async () => {
            const response = await requeset(app).get('/discounts');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
        // Test case for getting discount by id
        it('should get discount by id', async () => {
           const branch = await createTestBranch();
           const discount = await createTestDiscount({ branch_id: branch.id });
           const response = await requeset(app).get(`/discounts/${discount.id}`);
           expect(response.status).toBe(200);
           expect(response.body).toHaveProperty('id', discount.id);
        });
        // Test case for getting discount by non-existent id
        it('should return 404 for non-existent discount id', async () => {
            const response = await requeset(app).get('/discounts/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
    });
    describe('POST /api/discounts', () => {
        // Test case for creating a new discount with branch id
        it('should create a new discount', async () => {
            const branch = await createTestBranch();
            const response = await requeset(app)
                .post('/discounts')
                .send({
                    branch_id: branch.id,
                    code: 'TESTDISCOUNT',
                    description: 'A test discount for unit tests',
                    discount_type: 'percentage',
                    discount_value: 10.00,
                    min_order_value: 500.00,
                    usage_limit: 100,
                    is_active: true
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        // Test case for creating a discount without branch id
        it('should create a new discount without branch id', async () => {
            const response = await requeset(app)
                .post('/discounts')
                .send({
                    code: 'TESTDISCOUNT',
                    description: 'A test discount for unit tests',
                    discount_type: 'percentage',
                    discount_value: 10.00,
                    min_order_value: 500.00,
                    usage_limit: 100,
                    is_active: true
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        // Test case for creating a discount with invalid branch id
        it('should return 400 for invalid branch id', async () => {
            const response = await requeset(app)
                .post('/discounts')
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    code: 'TESTDISCOUNT',
                    description: 'A test discount for unit tests',
                    discount_type: 'percentage',
                    discount_value: 10.00,
                    min_order_value: 500.00,
                    usage_limit: 100,
                    valid_from: new Date(),
                    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a discount with missing required fields
        it('should return 400 for missing required fields', async () => {
            const response = await requeset(app)
                .post('/discounts')
                .send({
                    code: '',
                    min_order_value: 500.00,
                    usage_limit: 100,
                    valid_from: new Date(),
                    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    is_active: true
                });
            expect(response.status).toBe(400);
        });
        // Test case for creating a discount with invalid data
        it('should return 400 for invalid data', async () => {
            const response = await requeset(app)
                .post('/discounts')
                .send({
                    code: 'TESTDISCOUNT',
                    description: 'A test discount for unit tests',
                    discount_type: 'invalid-type',
                    discount_value: -10.00,
                    min_order_value: -500.00,
                    usage_limit: -100,
                    valid_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    valid_to: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    is_active: 'invalid-boolean'
                 });
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/discounts/:id', () => {
        // Test case for updating a discount
        it('should update a discount', async () => {
            const branch = await createTestBranch();
            const discount = await createTestDiscount({ branch_id: branch.id });
            const response = await requeset(app)
                .put(`/discounts/${discount.id}`)
                .send({
                    code: 'UPDATEDDISCOUNT',
                    description: 'An updated test discount for unit tests',
                    discount_type: 'fixed_amount',
                    discount_value: 20.00,
                    min_order_value: 1000.00,
                    usage_limit: 50,
                    valid_to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    is_active: false
                });
            expect(response.status).toBe(200);
        });
        // Test case for updating a discount with invalid data
        it('should return 400 for invalid data', async () => {
            const branch = await createTestBranch();
            const discount = await createTestDiscount({ branch_id: branch.id });
            const response = await requeset(app)
                .put(`/discounts/${discount.id}`)
                .send({
                    code: 1,
                    description: 'An updated test discount for unit tests',
                    discount_type: 'invalid-type',
                    discount_value: -20.00,
                    min_order_value: -1000.00,
                    usage_limit: -50,
                    valid_to: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    is_active: 'invalid-boolean'
                });
             expect(response.status).toBe(400);
        });
        // Test case for updating a non-existent discount
        it('should return 404 for non-existent discount id', async () => {
            const response = await requeset(app)
                .put('/discounts/00000000-0000-0000-0000-000000000000')
                .send({
                    code: 'UPDATEDDISCOUNT',
                    description: 'An updated test discount for unit tests',
                    discount_type: 'fixed_amount',
                    discount_value: 20.00,
                    min_order_value: 1000.00,
                    usage_limit: 50,
                    valid_to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    is_active: false
                });
             expect(response.status).toBe(404);
        });
        // Test case for updating a discount with invalid branch id
        it('should return 400 for invalid branch id', async () => {
            const branch = await createTestBranch();
            const discount = await createTestDiscount({ branch_id: branch.id });
            const response = await requeset(app)
                .put(`/discounts/${discount.id}`)
                .send({
                    branch_id: '00000000-0000-0000-0000-000000000000',
                    code: 'UPDATEDDISCOUNT',
                    description: 'An updated test discount for unit tests',
                    discount_type: 'fixed_amount',
                    discount_value: 20.00,
                    min_order_value: 1000.00,
                    usage_limit: 50,
                    valid_to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    is_active: false
                });
             expect(response.status).toBe(400);
        });
    });
});
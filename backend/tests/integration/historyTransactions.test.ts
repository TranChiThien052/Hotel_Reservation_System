import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { cleanDatabase, createTestAccount, createTestBranch, createTestCustomer, createTestHistoryTransaction, createTestStaff } from '../helpers/seed.ts';

describe('HistoryTransaction API', () => {
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

    describe('POST /history-transactions', () => {
        // Test case for creating a new history transaction
        it('should create a new history transaction', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const customer = await createTestCustomer();
            const response = await request(app)
                .post('/history-transactions')
                .send({
                    account_id: account.id,
                    action: 'Create',
                    target_type: 'Customer',
                    target_id: customer.id,
                    description: 'Test history transaction for unit tests',
                    metadata: customer,
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.account_id).toBe(account.id);
            expect(response.body.action).toBe('Create');
            expect(response.body.target_type).toBe('Customer');
            expect(response.body.target_id).toBe(customer.id);
            expect(response.body.description).toBe('Test history transaction for unit tests');
            expect(response.body.metadata.id).toEqual(customer.id);
        });

        // Test case for creating a history transaction with invalid account_id
        it('should return 404 if account_id does not exist', async () => {
            const response = await request(app)
                .post('/history-transactions')
                .send({
                    account_id: '00000000-0000-0000-0000-000000000000',
                    action: 'Create',
                    target_type: 'Customer',
                    target_id: '00000000-0000-0000-0000-000000000000',
                    description: 'Test history transaction with invalid account_id',
                    metadata: {},
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Account ID does not exist');
        });

        // Test case for creating a history transaction with missing required fields
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/history-transactions')
                .send({
                    target_type: 'Customer',
                    target_id: '00000000-0000-0000-0000-000000000000',
                    description: 'Test history transaction with missing account_id',
                    metadata: {},
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account ID is required');
        });

        // Test case for creating a history transaction with invalid field types
        it('should return 400 if fields have invalid types', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .post('/history-transactions')
                .send({
                    account_id: 123,
                    action: 123,
                    target_type: 123,
                    target_id: 123,
                    description: 123,
                    metadata: {},
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Action must be a string');
            expect(response.body.error).toContain('Target Type must be a string');
            expect(response.body.error).toContain('Target ID must be a valid UUID');
            expect(response.body.error).toContain('Description must be a string');
        });
    });
    describe('GET /history-transactions', () => {
        // Test case for getting all history transactions
        it('should retrieve all history transactions', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            await createTestHistoryTransaction(account.id);
            const response = await request(app).get('/history-transactions');
            console.log(response.error);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        // Test case for getting history transactions by account ID
        it('should retrieve history transactions by account ID', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            await createTestHistoryTransaction(account.id);
            const response = await request(app).get(`/history-transactions/account/${account.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        // Test case for getting history transactions by account ID with no transactions
        it('should return an empty array if no history transactions exist for the account ID', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .get(`/history-transactions/account/${account.id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        // Test case for getting history transactions by account ID with invalid account ID
        it('should return 404 if account ID is invalid when retrieving history transactions by account ID', async () => {
            const response = await request(app)
                .get('/history-transactions/account/invalid-account-id');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account ID must be a valid UUID');
        });

        // Test case for getting history transactions by account ID with non-existent account ID
        it('should return 404 if account ID does not exist when retrieving history transactions by account ID', async () => {
            const response = await request(app)
                .get('/history-transactions/account/ad2c1dce-0c24-4a2d-a5a7-6e8ec924b0a8');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Account ID does not exist');
        });

        // Test case for getting a specific history transaction by ID
        it('should retrieve a specific history transaction by ID', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const transaction = await createTestHistoryTransaction(account.id);
            const response = await request(app).get(`/history-transactions/${transaction.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.action).toBe(transaction.action);
            expect(response.body.target_type).toBe(transaction.target_type);
            expect(response.body.target_id).toBe(transaction.target_id);
            expect(response.body.description).toBe(transaction.description);
        });
    });
});
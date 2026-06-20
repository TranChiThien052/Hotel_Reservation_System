import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../helpers/prisma';
import { cleanDatabase, createTestAccount, createTestBranch } from '../helpers/seed';

describe('Accounts API', () => {
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

    describe('POST /api/accounts', () => {
        // Test case for creating a new account
        it('should create a new account', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/accounts')
                .send({
                    username: "test_user",
                    password: "ValidP@ssword123",
                    role: "staff",
                    status: "active",
                    branch_id: branch.id,
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
        });

        // Test case for creating a new account with invalid data
        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({
                    username: 456,
                    password: 123,
                    role: 2,
                    status: 1,
                    branch_id: "invalid-branch_id",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid password format');
            expect(response.body.error).toContain('Username must be a string');
            expect(response.body.error).toContain('Account role must be one of: customer, staff, manager, admin');
            expect(response.body.error).toContain('Account status must be one of: active, inactive');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });

        // Test case for creating a new account with existed username
        it('should return 400 with existed username error', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ username: "test_user", branch_id: branch.id });
            const response = await request(app)
                .post('/accounts')
                .send({
                    username: "test_user",
                    password: "ValidP@ssword123",
                    role: "staff",
                    status: "active",
                    branch_id: branch.id,
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Username already exists');
        });

        // Test case for creating a new account with non-existent branch id
        it('should return 404 with non-existent branch id error', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({
                    username: "test_user",
                    password: "ValidP@ssword123",
                    role: "staff",
                    status: "active",
                    branch_id: "f1e2e3e4-1a1a-1e1a-1a1a-1e1a1a1e1a1a",
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch not found');
        });
    });

    describe('GET /accounts', () => {
        // Test case for getting all accounts
        it('should return all accounts', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const account2 = await createTestAccount({ username: "customer", role: "customer" });
            const response = await request(app).get('/accounts');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toContainEqual(account);
            expect(response.body).toContainEqual(account2);
        });

        // Test case for getting an account by ID
        it('should return an account by ID', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app).get(`/accounts/${account.id}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toEqual(account.id);
        });

        // Test case for getting an account by username
        it('should return an account by username', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app).get(`/accounts/username/${account.username}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toEqual(account.id);
        });

        // Test case for getting an account with invalid ID
        it('should return 400 with invalid ID error', async () => {
            const response = await request(app).get('/accounts/invalid-id');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account ID must be a valid UUID');
        });

        // Test case for getting an account with non-existent ID
        it('should return 400 with non-existent ID error', async () => {
            const response = await request(app).get('/accounts/d3e658d7-04d1-4caa-aa9b-8b98ce630d08');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account not found');
        });
    });

    describe('PUT /api/accounts', () => {
        // Test case for updating an account
        it('should update an account', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .put(`/accounts/${account.id}`)
                .send({
                    password: "ValidP@ssword012",
                    role: "manager",
                    status: "inactive",
                });
            expect(response.status).toBe(200);
            expect(response.body.password_hash).not.toBe(account.password_hash);
            expect(response.body.role).toBe("manager");
            expect(response.body.status).toBe("inactive");
        });

        // Test case for updating an account with invalid data
        it('should return 400 with invalid data error', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .put(`/accounts/${account.id}`)
                .send({
                    role: "invalid",
                    status: "invalid",
                    branch_id: "invalid-id",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account role must be one of: customer, staff, manager, admin');
            expect(response.body.error).toContain('Account status must be one of: active, inactive');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });

        // Test case for updating an account with non-existent ID
        it('should return 404 with non-existent ID error', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .put(`/accounts/d3e658d7-04d1-4caa-aa9b-8b98ce630d08`)
                .send({
                    role: "manager",
                    status: "inactive",
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Account not found');
        });

        // Test case for updating an account with invalid ID
        it('should return 400 with invalid ID error', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .put(`/accounts/invalid-id`)
                .send({
                    role: "manager",
                    status: "inactive",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('ID must be a valid UUID');
        });

        // Test case for updating an account with non-existent branch ID
        it('should return 404 with non-existent branch ID error', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ branch_id: branch.id });
            const response = await request(app)
                .put(`/accounts/${account.id}`)
                .send({
                    branch_id: "d3e658d7-04d1-4caa-aa9b-8b98ce630d08",
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch not found');
        });
    });
});
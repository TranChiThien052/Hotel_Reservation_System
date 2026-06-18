import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestStaff, createTestAccount, createTestBranch, cleanDatabase } from '../helpers/seed.ts';

describe('Staff API', () => {
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

    describe('POST /staff', () => {
        it('should create a new staff member', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff',
                    position: 'staff',
                    branch_id: branch.id,
                    account_id: account.id,
                    phone: '0123456789',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.full_name).toBe('Test Staff');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/staff')
                .send({
                    position: 'staff',
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if branch_id is invalid', async () => {
            const account = await createTestAccount({ role: 'staff' });
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff',
                    position: 'staff',
                    branch_id: "999",
                    account_id: account.id,
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if account_id is invalid', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff',
                    position: 'staff',
                    branch_id: branch.id,
                    account_id: "999",
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if staff role is invalid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff',
                    position: 'abc',
                    branch_id: branch.id,
                    account_id: account.id,
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if phone number is not valid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff',
                    position: 'staff',
                    branch_id: branch.id,
                    account_id: account.id,
                    phone: 'invalid-phone',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if phone number is duplicate', async () => {
            const branch = await createTestBranch();
            const account1 = await createTestAccount({ username: 'test1', role: 'staff', branch_id: branch.id });
            const staff1 = await createTestStaff(branch.id, account1.id, { phone: '0123456789' });
            const account2 = await createTestAccount({ username: 'test2', role: 'staff', branch_id: branch.id });
            const response = await request(app)
                .post('/staff')
                .send({
                    full_name: 'Test Staff 2',
                    position: 'staff',
                    branch_id: branch.id,
                    account_id: account2.id,
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });
    });

    describe('GET /staff', () => {
        it('should retrieve all staff members', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app).get('/staff');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].id).toBe(staff.id);
        });

        it('should return 404 if staff member not found', async () => {
            const randomUUID = '123e4567-e89b-12d3-a456-426614174000';
            const response = await request(app).get(`/staff/${randomUUID}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PUT /staff/:id', () => {
        it('should update a staff member', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .put(`/staff/${staff.id}`)
                .send({
                    full_name: 'staff',
                    position: 'manager',
                    phone: '0987654321',
                });
            expect(response.status).toBe(200);
            expect(response.body.full_name).toBe('staff');
            expect(response.body.position).toBe('manager');
            expect(response.body.phone).toBe('0987654321');
        });

        it('should return 404 if staff member not found', async () => {
            const response = await request(app)
                .put('/staff/8be2cbb2-72da-4f7e-a5ea-2d4667f01c50') // random UUID
                .send({
                    full_name: 'staff',
                    position: 'manager',
                    phone: '0987654321',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if phone number is not valid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .put(`/staff/${staff.id}`)
                .send({
                    full_name: 'staff',
                    position: 'manager',
                    phone: 'invalid-phone',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if phone number is duplicate', async () => {
            const branch = await createTestBranch();
            const account1 = await createTestAccount({ username: 'teststaff1', role: 'staff', branch_id: branch.id });
            const account2 = await createTestAccount({ username: 'teststaff2', role: 'staff', branch_id: branch.id });
            const staff1 = await createTestStaff(branch.id, account1.id, { phone: '0123456789' });
            const staff2 = await createTestStaff(branch.id, account2.id, { phone: '0987654321' });
            const response = await request(app)
                .put(`/staff/${staff2.id}`)
                .send({
                    full_name: 'staff',
                    position: 'manager',
                    phone: '0123456789',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if staff position is invalid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .put(`/staff/${staff.id}`)
                .send({
                    full_name: 'staff',
                    position: 'abc',
                    phone: '0987654321',
                });
            expect(response.status).toBe(400);
        });

        it('should return 400 if branch_id is invalid', async () => {
            const branch = await createTestBranch();
            const account = await createTestAccount({ role: 'staff', branch_id: branch.id });
            const staff = await createTestStaff(branch.id, account.id);
            const response = await request(app)
                .put(`/staff/${staff.id}`)
                .send({
                    full_name: 'staff',
                    position: 'staff',
                    phone: '0987654321',
                    branch_id: "999",
                });
            expect(response.status).toBe(400);
        });
    });
});

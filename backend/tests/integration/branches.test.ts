import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestBranch, cleanDatabase } from '../helpers/seed.ts';

describe('Branches API', () => {
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

    describe('POST /api/branches', () => {
        it('should create a new branch', async () => {
            const response = await request(app)
            .post('/branches')
            .send({
                name: 'Test Branch',
                address: '123 Test Street',
                city: 'Test City',
                phone: '0123456789',
                email: 'test@gmail.com',
                description: 'This is a test branch',
                is_active: true
            })

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test Branch');
            expect(response.body.address).toBe('123 Test Street');
            expect(response.body.city).toBe('Test City');
            expect(response.body.phone).toBe('0123456789');
            expect(response.body.email).toBe('test@gmail.com');
            expect(response.body.description).toBe('This is a test branch');
            expect(response.body.is_active).toBe(true);

            const branchInDb = await prisma.branches.findUnique({
                where: { id: response.body.id },
            });
            expect(branchInDb).not.toBeNull();
        });
        
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
            .post('/branches')
            .send({
                address: '123 Test Street',
                city: 'Test City',
                phone: '0123456789',
                email: 'test@gmail.com',
                description: 'This is a test branch',
                is_active: true
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if email is not valid', async () => {
            const response = await request(app)
            .post('/branches')
            .send({
                name: 'Test Branch',
                address: '123 Test Street',
                city: 'Test City',
                phone: '0123456789',
                email: 'invalid-email',
                description: 'This is a test branch',
                is_active: true
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if phone number is not valid', async () => {
            const response = await request(app)
            .post('/branches')
            .send({
                name: 'Test Branch',
                address: '123 Test Street',
                city: 'Test City',
                phone: 'invalid-phone',
                email: 'test@gmail.com',
                description: 'This is a test branch',
                is_active: true
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if phone number is duplicate', async () => {
            await createTestBranch({ phone: '0123456789' });
            const response = await request(app)
            .post('/branches')
            .send({
                name: 'Test Branch 2',
                address: '456 Test Street',
                city: 'Test City',
                phone: '0123456789',
                email: 'test2@gmail.com',
                description: 'This is another test branch',
                is_active: true
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if email is duplicate', async () => {
            await createTestBranch({ email: 'test@gmail.com' });
            const response = await request(app)
            .post('/branches')
            .send({
                name: 'Test Branch 2',
                address: '456 Test Street',
                city: 'Test City',
                phone: '0987654321',
                email: 'test@gmail.com',
                description: 'This is another test branch',
                is_active: true
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/branches', () => {
        it('should return a list of branches', async () => {
            await createTestBranch();
            const response = await request(app).get('/branches');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0].name).toBe('Test Branch');
        });
    });

    describe('GET /api/branches/:id', () => {
        it('should return a branch by id', async () => {
            const branch = await createTestBranch();
            const response = await request(app).get(`/branches/${branch.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test Branch');
        });
    });

    describe('PUT /api/branches/:id', () => {
        it('should update a branch', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
            .put(`/branches/${branch.id}`)
            .send({
                name: 'Updated Branch',
                address: '456 Updated Street',
                city: 'Updated City',
                phone: '0987654321',
                email: 'updated@gmail.com',
                description: 'This is an updated test branch',
                is_active: false
            });
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Branch');
        });

        it('should return 404 if branch not found', async () => {
            const response = await request(app)
            .put('/branches/9999')
            .send({
                name: 'Updated Branch',
                address: '456 Updated Street',
                city: 'Updated City',
                phone: '0987654321',
                email: 'updated@gmail.com',
                description: 'This is an updated test branch',
                is_active: false
            });
            expect(response.status).toBe(404);
        });

        it('should return 400 if email is not valid', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
            .put(`/branches/${branch.id}`)
            .send({
                name: 'Updated Branch',
                address: '456 Updated Street',
                city: 'Updated City',
                phone: '0987654321',
                email: 'invalid-email',
                description: 'This is an updated test branch',
                is_active: false
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if phone number is not valid', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
            .put(`/branches/${branch.id}`)
            .send({
                name: 'Updated Branch',
                address: '456 Updated Street',
                city: 'Updated City',
                phone: 'invalid-phone',
                email: 'updated@gmail.com',
                description: 'This is an updated test branch',
                is_active: false
            });
            expect(response.status).toBe(400);
        });
    });
});

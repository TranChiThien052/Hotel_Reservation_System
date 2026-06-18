import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../helpers/prisma.ts';
import { createTestCustomer, cleanDatabase } from '../helpers/seed.ts';

describe('Customers API', () => {
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

    describe('POST /api/customers', () => {
        it('should create a new customer', async () => {
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Test Customer',
                    email: 'test@example.com',
                    phone: '0123456789',
                    id_card_number: '1234567890123456',
                    nationality: 'Test Nationality',
                    date_of_birth: '1990-01-01',
                    address: 'Test Address'
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/customers')
                .send({
                    email: 'test@example.com',
                    phone: '0123456789',
                    id_card_number: '1234567890123456',
                    nationality: 'Test Nationality',
                    date_of_birth: '1990-01-01',
                    address: 'Test Address'
                });
            expect(response.status).toBe(400);
        });
        it('should return 400 if email already exists', async () => {
            await createTestCustomer({ email: 'test@gmail.com' });
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Another Customer',
                    email: 'test@gmail.com',
                    phone: '0987654321',
                    id_card_number: '6543210987654321',
                    nationality: 'Another Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Another Address'
                });
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone number already exists', async () => {
            await createTestCustomer({ phone: '0123456789' });
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Another Customer',
                    email: 'test@gmail.com',
                    phone: '0123456789',
                    id_card_number: '6543210987654321',
                    nationality: 'Another Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Another Address'
                });
            expect(response.status).toBe(400);
        });
        it('should return 400 if ID card number already exists', async () => {
            await createTestCustomer({ id_card_number: '1234567890123456' });
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Another Customer',
                    email: 'test@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Another Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Another Address'
                });
            expect(response.status).toBe(400);
        });
        it('should return 400 if email is not valid', async () => {
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Test Customer',
                    email: 'invalid-email',
                    phone: '0123456789',
                    id_card_number: '1234567890123456',
                    nationality: 'Test Nationality',
                    date_of_birth: '1990-01-01',
                    address: 'Test Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if phone number is not valid', async () => {
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Test Customer',
                    email: 'test@gmail.com',
                    phone: 'invalid-phone',
                    id_card_number: '1234567890123456',
                    nationality: 'Test Nationality',
                    date_of_birth: '1990-01-01',
                    address: 'Test Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if date of birth is not valid', async () => {
            const response = await request(app)
                .post('/customers')
                .send({
                    full_name: 'Test Customer',
                    email: 'test@gmail.com',
                    phone: '0123456789',
                    id_card_number: '1234567890123456',
                    nationality: 'Test Nationality',
                    date_of_birth: 'invalid-date',
                    address: 'Test Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/customers/:id', () => {
        it('should return a customer by ID', async () => {
            const customer = await createTestCustomer();
            const response = await request(app).get(`/customers/${customer.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', customer.id);
        });
    });

    describe('GET /api/customers', () => {
        it('should return all customers', async () => {
            const customer1 = await createTestCustomer();
            const customer2 = await createTestCustomer();
            const response = await request(app).get('/customers');
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });
    });

    describe('PUT /api/customers/:id', () => {
        it('should update a customer', async () => {
            const customer = await createTestCustomer();
            const response = await request(app)
                .put(`/customers/${customer.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'updated@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', customer.id);
        });
        it('should return 404 if customer not found', async () => {
            const response = await request(app)
                .put('/customers/9999')
                .send({
                    full_name: 'Updated Customer',
                    email: 'updated@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(404);
        });
        it('should return 400 if email is not valid', async () => {
            const customer = await createTestCustomer();
            const response = await request(app)
                .put(`/customers/${customer.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'invalid-email',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if phone number is not valid', async () => {
            const customer = await createTestCustomer();
            const response = await request(app)
                .put(`/customers/${customer.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'updated@gmail.com',
                    phone: 'invalid-phone',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if date of birth is not valid', async () => {
            const customer = await createTestCustomer();
            const response = await request(app)
                .put(`/customers/${customer.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'updated@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: 'invalid-date',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if email already exists', async () => {
            const customer1 = await createTestCustomer({ email: 'test1@gmail.com' });
            const customer2 = await createTestCustomer({ email: 'test2@gmail.com' });
            const response = await request(app)
                .put(`/customers/${customer2.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'test1@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if phone number already exists', async () => {
            const customer1 = await createTestCustomer({ phone: '0123456789' });
            const customer2 = await createTestCustomer({ phone: '0987654321' });
            const response = await request(app)
                .put(`/customers/${customer2.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'test2@gmail.com',
                    phone: '0123456789',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if ID card number already exists', async () => {
            const customer1 = await createTestCustomer({ id_card_number: '1234567890123456' });
            const customer2 = await createTestCustomer({ id_card_number: '6543210987654321' });
            const response = await request(app)
                .put(`/customers/${customer2.id}`)
                .send({
                    full_name: 'Updated Customer',
                    email: 'test2@gmail.com',
                    phone: '0987654321',
                    id_card_number: '1234567890123456',
                    nationality: 'Updated Nationality',
                    date_of_birth: '1995-01-01',
                    address: 'Updated Address'
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
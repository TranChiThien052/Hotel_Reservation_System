import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../helpers/prisma';
import { cleanDatabase, createTestAccount } from '../helpers/seed';
import expectCookies from 'supertest/lib/cookies';
import { response } from 'express';

describe('Authentication Integration Tests', () => {
    beforeAll(async () => {
        await cleanDatabase();
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await cleanDatabase();
    });

    describe('POST /auth/login', () => {
        // Test case for successful login
        it('should return 200 and set refresh_token cookie on successful login', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const accounts = await prisma.accounts.findMany();
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('access_token');
            expect(response.headers['set-cookie']).toBeDefined();
        });

        // Test case for failed login due to invalid data
        it('should return 400 for invalid login data', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: '',
                    password: '',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Username is required');
            expect(response.body.error).toContain('Password is required');
        });

        // Test case for failed login due to non-existent username
        it('should return 404 for non-existent username', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'nonexistentuser',
                    password: 'Testp@ssword123',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Account not found');
        });

        // Test case for failed login due to incorrect password
        it('should return 400 for incorrect password', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Wrongp@ssword123',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Incorrect password');
        });

        // Test case for failed login due to inactive account
        it('should return 403 for inactive account', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                    status: 'inactive',
                });
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Account is not active');
        });

        // Test case for failed login due to not found account for login
        it('should return 404 for account not found for login', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    username: 'nonexistentuser',
                    password: 'Testp@ssword123',
                });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Account not found');
        });
    });

    describe('POST /auth/refresh', () => { 
        // Test case for successful token refresh
        it('should return 200 and new access token on successful refresh', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const cookies = loginResponse.headers['set-cookie'];
            const refreshResponse = await request(app)
                .post('/auth/refresh')
                .set('Cookie', cookies)
                .send();
            expect(refreshResponse.status).toBe(200);
            expect(refreshResponse.body).toHaveProperty('access_token');
        });

        // Test case for invalid refresh token
        it('should return 400 for invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send();
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for expired refresh token
        it('should return 404 for expired refresh token', async () => {
            const date = new Date();
            const account = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            await prisma.refresh_tokens.updateMany({
                where: { account_id: account.body.id },
                data: { expires_at: new Date(date.getTime() - 1000) },
             });
            const cookies = loginResponse.headers['set-cookie'];
            const response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for revoked refresh token
        it('should return 404 for revoked refresh token', async () => {
            const account = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            await prisma.refresh_tokens.updateMany({
                where: { account_id: account.body.id },
                data: { is_revoked: true },
             });
            let cookies = loginResponse.headers['set-cookie'];
            await prisma.refresh_tokens.deleteMany({
                where: { account_id: account.body.id },
            });
            const response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for missing refresh token
        it('should return 400 for missing refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send();
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for account not found for refresh token
        it('should return 404 for account not found for refresh token', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            await prisma.refresh_tokens.deleteMany({
                where: { account_id: testAccount.body.id },
            });
            const cookies = loginResponse.headers['set-cookie'];
            const response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for account not active for refresh token
        it('should return 403 for account not active for refresh token', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const updatedAccount = await request(app)
                .put(`/accounts/${testAccount.body.id}`)
                .send({
                    status: 'inactive',
                });
            const cookies = loginResponse.headers['set-cookie'];
            const response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /auth/logout', () => {
        // Test case for successful logout
        it('should return 200 and clear refresh_token cookie on successful logout', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const cookies = loginResponse.headers['set-cookie'];
            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.headers['set-cookie']).toBeDefined();
            const clearedCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('refresh_token='));
            expect(clearedCookie).toBeDefined();
            expect(clearedCookie).toContain('refresh_token=;');
        });

        // Test case for invalid refresh token on logout
        it('should return 400 for invalid refresh token on logout', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .send();
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for not found refresh token on logout
        it('should return 404 for not found refresh token on logout', async () => {
            const testAccount = await request(app)
                .post('/accounts')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    username: 'testuser',
                    password: 'Testp@ssword123',
                });
            const cookies = loginResponse.headers['set-cookie'];
            await prisma.refresh_tokens.deleteMany({
                where: { account_id: testAccount.body.id },
            });
            const response = await request(app)
                .post('/auth/logout')
                .set('Cookie', cookies)
                .send();
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
});
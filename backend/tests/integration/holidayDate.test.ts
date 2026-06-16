import request from 'supertest';
import app from '../../src/app.ts';
import { createTestBranch, createTestHolidayDate, cleanDatabase } from '../helpers/seed.ts';

describe('Holiday Date API', () => {
    beforeAll(async () => { 
        await cleanDatabase();
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await cleanDatabase();
    });

    describe('POST /api/holiday-dates', () => {
        // Test creating a holiday date with valid data
        it('should create a holiday date with valid data', async () => {
            const branch = await createTestBranch();
            const testDate = "2026-12-24";
            const response = await request(app)
                .post('/holiday-dates')
                .send({
                    branch_id: branch.id,
                    date: testDate,
                    name: 'Test Holiday',
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.branch_id).toBe(branch.id);
            expect(new Date(response.body.date)).toEqual(new Date(testDate));
            expect(response.body.name).toBe('Test Holiday');
        });

        // Test creating a holiday date with missing required fields
        it('should return 400 when required fields are missing', async () => {
            const response = await request(app)
                .post('/holiday-dates')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test creating a holiday date with invalid branch_id
        it('should return 400 when branch_id is invalid', async () => {
            const response = await request(app)
                .post('/holiday-dates')
                .send({
                    branch_id: 'invalid-uuid',
                    date: '2023-12-25',
                    name: 'Test Holiday',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test creating a holiday date with non-existent branch_id
        it('should return 400 when branch_id does not exist', async () => {
            const response = await request(app)
                .post('/holiday-dates')
                .send({
                    branch_id: '123e4567-e89b-12d3-a456-426614174000',
                    date: '2023-12-25',
                    name: 'Test Holiday',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test creating a holiday date with invalid date format
        it('should return 400 when date format is invalid', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/holiday-dates')
                .send({
                    branch_id: branch.id,
                    date: 'invalid-date',
                    name: 'Test Holiday',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test creating a holiday date with name exceeding max length
        it('should return 400 when name exceeds max length', async () => {
            const branch = await createTestBranch();
            const response = await request(app)
                .post('/holiday-dates')
                .send({
                    branch_id: branch.id,
                    date: '2023-12-25',
                    name: 'A'.repeat(151),
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /api/holiday-dates/:id', () => {
        // Test retrieving all holiday dates
        it('should retrieve all holiday dates', async () => {
            const branch = await createTestBranch();
            await createTestHolidayDate(branch.id);
            const response = await request(app)
                .get('/holiday-dates'); 
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        // Test retrieving a holiday date by ID
        it('should retrieve a holiday date by ID', async () => {
            const branch = await createTestBranch();
            const holidayDate = await createTestHolidayDate(branch.id);
            const response = await request(app)
                .get(`/holiday-dates/${holidayDate.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', holidayDate.id);
            expect(response.body).toHaveProperty('branch_id', branch.id);
            expect(new Date(response.body.date)).toEqual(new Date(holidayDate.date));
            expect(response.body.name).toBe(holidayDate.name);
        });

        // Test retrieving a holiday date with non-existent ID
        it('should return 404 when holiday date ID does not exist', async () => {
            const response = await request(app)
                .get('/holiday-dates/123e4567-e89b-12d3-a456-426614174000');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        // Test retrieving a holiday date with invalid ID format
        it('should return 400 when holiday date ID format is invalid', async () => {
            const response = await request(app)
                .get('/holiday-dates/invalid-uuid');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('PUT /holiday-dates/:id', () => {
        // Test case for updating a holiday-dates
        it ('should update a holiday-dates', async () => {
            const branch = await createTestBranch();
            const branch2 = await createTestBranch({ name: 'Second Test Branch' });
            const testHolidayDate = await createTestHolidayDate(branch.id);
            const response = await request(app)
                .put(`/holiday-dates/${testHolidayDate.id}`)
                .send({
                    branch_id: branch2.id,
                    name: 'Updated Test Holiday',
                    date: '2026-09-02',
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', testHolidayDate.id);
            expect(response.body).toHaveProperty('branch_id', branch2.id);
            expect(new Date(response.body.date)).toEqual(new Date('2026-09-02'));
            expect(response.body.name).toBe('Updated Test Holiday');
        });

        // Test case for updating a holiday-dates with invalid id
        it('should return 400 for invalid holiday-dates id', async () => {
            const response = await request(app)
                .put('/holiday-dates/invalid-uuid')
                .send({
                    name: 'Updated Test Holiday',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        // Test case for updating a holiday-dates with non-existent id
        it('should return 404 for non-existent holiday-dates id', async () => {
            const response = await request(app)
                .put('/holiday-dates/123e4567-e89b-12d3-a456-426614174000')
                .send({});
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Holiday date not found');
        });

        // Test case for updating a holiday-dates with invalid branch id
        it('should return 400 for invalid branch id', async () => {
            const branch = await createTestBranch();
            const holidayDate = await createTestHolidayDate(branch.id);
            const response = await request(app)
                .put(`/holiday-dates/${holidayDate.id}`)
                .send({
                    branch_id: 'invalid-branch-id',
                    name: 'Updated Test Holiday',
                    date: '2026-09-02',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID must be a valid UUID');
        });

        // Test case for updating a holiday-dates with non-existent id
        it('should return 400 for non-existent branch id', async () => {
            const branch = await createTestBranch();
            const holidayDate = await createTestHolidayDate(branch.id);
            const response = await request(app)
                .put(`/holiday-dates/${holidayDate.id}`)
                .send({
                    branch_id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Updated Test Holiday',
                    date: '2026-09-02',
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Branch ID does not exist');
        });

        // Test case for updating a holiday-dates with invalid data
        it('should return 400 for invalid data', async () => {
            const branch = await createTestBranch();
            const holidayDate = await createTestHolidayDate(branch.id);
            const response = await request(app)
                .put(`/holiday-dates/${holidayDate.id}`)
                .send({
                    date: 'invalid-date',
                    name: 'A'.repeat(151),
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
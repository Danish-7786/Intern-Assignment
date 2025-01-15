// tests/e2e/appointment-flow.test.js

import request from 'supertest';
import app from '../../app.js';
import { connectDB, disconnectDB, clearDatabase } from '../config/db.config.js';
import { mockStudentA1, mockStudentA2, mockProfessorP1, mockTimeSlot1, mockTimeSlot2 } from '../__mocks__/mockData.js';

describe('Appointment System E2E Tests', () => {
    let studentA1Data, studentA2Data, professorData;
    let slotId1, slotId2, appointmentId1, appointmentId2;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'mysecret123';
        process.env.JWT_EXPIRY = '1d';
        await connectDB();
    });

    afterAll(async () => {
        await clearDatabase();
        await disconnectDB();
    });

   

    // 1. Student A1 Authentication
    describe('1. Student A1 Authentication', () => {
        test('Student A1 should successfully register and login', async () => {
            // Register Student A1
            const registerResponse = await request(app)
                .post('/api/v1/students/register')
                .send(mockStudentA1);
            
            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.data).toBeDefined();

            // Login Student A1
            const loginResponse = await request(app)
                .post('/api/v1/students/login')
                .send({
                    email: mockStudentA1.email,
                    password: mockStudentA1.password
                });

            expect(loginResponse.status).toBe(201);
            studentA1Data = {
                token: loginResponse.body.data.token,
                student: loginResponse.body.data.student
            };
            expect(studentA1Data.token).toBeDefined();
        });
    });

    // 2. Professor P1 Authentication
    describe('2. Professor P1 Authentication', () => {
        test('Professor P1 should successfully register and login', async () => {
            // Register Professor
            const registerResponse = await request(app)
                .post('/api/v1/professors/register')
                .send(mockProfessorP1);

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.data).toBeDefined();

            // Login Professor
            const loginResponse = await request(app)
                .post('/api/v1/professors/login')
                .send({
                    email: mockProfessorP1.email,
                    password: mockProfessorP1.password
                });

            expect(loginResponse.status).toBe(201);
            professorData = {
                token: loginResponse.body.data.token,
                professor: loginResponse.body.data.professor
            };
            expect(professorData.token).toBeDefined();
        });
    });
    console.log("professorData",professorData);
    // 3. Professor Specifies Available Time Slots
    describe('3. Professor Time Slot Management', () => {
        beforeEach(async () => {
            // Setup professor authentication
            const loginResponse = await request(app)
                .post('/api/v1/professors/login')
                .send({
                    email: mockProfessorP1.email,
                    password: mockProfessorP1.password
                });
            professorData = {
                token: loginResponse.body.data.token,
                professor: loginResponse.body.data.professor
            };
        });

        test('Professor P1 should successfully add two time slots', async () => {
            // Add first time slot
            const slot1Response = await request(app)
                .post('/api/v1/professors/availability')
                .set('Authorization', `Bearer ${professorData.token}`)
                .send(mockTimeSlot1);

            expect(slot1Response.status).toBe(201);
            slotId1 = slot1Response.body.data.availableSlots[0]._id;


            // Add second time slot
            const slot2Response = await request(app)
                .post('/api/v1/professors/availability')
                .set('Authorization', `Bearer ${professorData.token}`)
                .send(mockTimeSlot2);

            expect(slot2Response.status).toBe(201);
            slotId2 = slot2Response.body.data.availableSlots[1];
        });
    });

    // 4. Student Views Available Slots
    describe('4. Student Views Available Slots', () => {
        test('Student A1 should be able to view available time slots', async () => {
            const response = await request(app)
                .get(`/api/v1/students/get-all-slots/${professorData.professor._id}`)
                .set('Authorization', `Bearer ${studentA1Data.token}`);

            expect(response.status).toBe(201);
            expect(Array.isArray(response.body.data)).toBeTruthy();
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    // 5. Student A1 Books Appointment

    describe('5. Student A1 Books Appointment', () => {
        test('Student A1 should successfully book an appointment for time T1', async () => {
            const response = await request(app)
                .post(`/api/v1/students/book-slot/${professorData.professor._id}/${slotId1}`)
                .set('Authorization', `Bearer ${studentA1Data.token}`);

            expect(response.status).toBe(201);
            appointmentId1 = response.body.data.appointment._id;
            expect(appointmentId1).toBeDefined();
        });
    });
    console.log("prof",professorData);

    // 6. Student A2 Authentication
    describe('6. Student A2 Authentication', () => {
        test('Student A2 should successfully register and login', async () => {
            // Register Student A2
            const registerResponse = await request(app)
                .post('/api/v1/students/register')
                .send(mockStudentA2);

            expect(registerResponse.status).toBe(201);

            // Login Student A2
            const loginResponse = await request(app)
                .post('/api/v1/students/login')
                .send({
                    email: mockStudentA2.email,
                    password: mockStudentA2.password
                });

            expect(loginResponse.status).toBe(201);
            studentA2Data = {
                token: loginResponse.body.data.token,
                student: loginResponse.body.data.student
            };
            expect(studentA2Data.token).toBeDefined();
        });
    });

    // 7. Student A2 Books Appointment
console.log("professor a2",professorData);
    describe('7. Student A2 Books Appointment', () => {
      
        test('Student A2 should successfully book an appointment for time T2', async () => {
           
            const response = await request(app)
                .post(`/api/v1/students/book-slot/${professorData.professor._id}/${slotId2}`)
                .set('Authorization', `Bearer ${studentA2Data.token}`);

            expect(response.status).toBe(201);
            appointmentId2 = response.body.data.appointment._id;
            expect(appointmentId2).toBeDefined();
        });
    });

    // 8. Professor Cancels Appointment
    describe('8. Professor Cancels Appointment', () => {
        test('Professor P1 should successfully cancel appointment with Student A1', async () => {
            const response = await request(app)
                .patch(`/api/v1/professors/manage-booking/${appointmentId1}`)
                .set('Authorization', `Bearer ${professorData.token}`)
                .send({ status: 'cancelled' });

            expect(response.status).toBe(201);
        });
    });

    // 9. Student Checks Appointments
    describe('9. Student Checks Appointments', () => {
        test('Student A1 should see no pending appointments', async () => {
            const response = await request(app)
                .get('/api/v1/students/my-appointments')
                .set('Authorization', `Bearer ${studentA1Data.token}`);

            expect(response.status).toBe(201);
           
            expect(response.body.data[0].my_Appointments.length).toBe(0);
        });
    });
});
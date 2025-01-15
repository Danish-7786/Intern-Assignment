// tests/helpers/auth.helper.js
import request from 'supertest';

export const registerAndLoginStudent = async (app, studentData) => {
    // Register student
   
    const registerResponse = await request(app)
        .post('/api/v1/students/register')
        .send(studentData);

    // Login student
    const loginResponse = await request(app)
        .post('/api/v1/students/login')
        .send({
            email: studentData.email,
            password: studentData.password
        });


    return {
        token: loginResponse.body.data.token,
        student: loginResponse.body.data.student
    };
};

export const registerAndLoginProfessor = async (app, professorData) => {
    // Register professor
    const registerResponse = await request(app)
        .post('/api/v1/professors/register')
        .send(professorData);
    
    // Login professor
    const loginResponse = await request(app)
        .post('/api/v1/professors/login')
        .send({
            email: professorData.email,
            password: professorData.password
        });

    return {
        token: loginResponse.body.data.token,
        professor: loginResponse.body.data.professor
    };
};
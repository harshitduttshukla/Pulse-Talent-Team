import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import { connectDB } from '../src/config/db';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

// Mock DB Connection for tests to avoid needing running Mongo
// For a real app, use mongodb-memory-server
// Here we will just test the express app logic validation
// But since we need DB for Register, let's just mock the controller response or 
// assumes a running local DB as per requirements "Basic testing". 
// To keep it simple and robust without extra deps, we'll verify Validation Middleware mainly.

describe('Auth API Validation', () => {
    it('should return 400 if email is invalid on register', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testu',
                email: 'invalid-email',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toBeDefined();
        // checks that express-validator caught the email
        expect(res.body.errors[0].msg).toContain('valid email');
    });

    it('should return 400 if password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testu',
                email: 'test@example.com',
                password: '123'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toContain('6 or more characters');
    });
});

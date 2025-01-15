// tests/setup.js
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_123';
process.env.JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';
// Increase timeout for all tests
jest.setTimeout(30000);

// Global console error handler
console.error = (message) => {
    throw new Error(message);
};
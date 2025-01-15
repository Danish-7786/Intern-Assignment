// tests/config/db.config.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export const connectDB = async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log("Mock Database connected successfully");
    } catch (error) {
        console.error("Mock Database connection error:", error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
        console.log("Mock Database disconnected successfully");
    } catch (error) {
        console.error("Mock Database disconnection error:", error);
        throw error;
    }
};

export const clearDatabase = async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
            await collection.dropIndexes();

        }
        console.log("Mock Database cleared successfully");
    } catch (error) {
        console.error("Mock Database clearing error:", error);
        throw error;
    }
};
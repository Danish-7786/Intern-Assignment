// db/db.js
import mongoose from "mongoose";

const connectDb = async (uri) => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log("MongoDB is already connected");
            return;
        }
        const connectionInstance = await mongoose.connect(uri || process.env.MONGODB_URI);
        console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error in connecting with database", error);
        throw error;
    }
}

export default connectDb;
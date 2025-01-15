// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import connectDb from "./db/db.js";

const app = express();

// Only connect to database if not in test environment
if (process.env.NODE_ENV !== 'test') {
    await connectDb();
}




app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

import professorRoutes from "./routes/professor.routes.js";
import studentRoutes from "./routes/student.routes.js";
app.use("/api/v1/professors", professorRoutes);
app.use("/api/v1/students", studentRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

export default app;
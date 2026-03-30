import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import helmet from 'helmet';
import authRoute from './routes/auth.js'
import todoRoute from './routes/todo.js'
import rateLimit from 'express-rate-limit'

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // max 100 requests per 15 minutes
  message: { success: false, error: 'Too many requests, please try again later' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again later' }
})

app.use(limiter)
app.use('/api/v1/login', authLimiter)
app.use('/api/v1/register', authLimiter)

mongoose.connect(MONGO_URI)
.then(()=> console.log("Database connected successfully"))
.catch((err) => console.log("Connection error", err));


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use("/api/v1",authRoute)
app.use("/api/v1",todoRoute)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

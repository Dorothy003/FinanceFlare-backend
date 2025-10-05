
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseRoutes from "./routes/expenseRoute.js";
import goalRoutes from './routes/goalRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/income', incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use('/api/user/goals', goalRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

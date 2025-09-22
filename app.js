import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { protect } from './middlewares/auth.middleware.js';


// Load env
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "https://departmental-lecture-repository-sys.vercel.app", // your frontend origin
  credentials: true,  // allow cookies, auth headers
}));app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
import authRoutes from './routes/auth.routes.js';
// import resourceRoutes from './routes/resource.routes.js';

app.use('/api/auth', authRoutes);
// app.use('/api/resources', resourceRoutes);

app.get('/api/protected', protect, (req, res) => {
    res.json({ message: 'Access granted!', user: req.user });
  });

  app.get('/', (req, res) => {
    res.send('Backend API is running');
  });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

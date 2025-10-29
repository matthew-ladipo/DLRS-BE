import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { protect } from './middlewares/auth.middleware.js';

// Load env
dotenv.config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DLRS API',
      version: '1.0.0',
      description: 'Departmental Lecture Repository System API',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'https://departmental-lecture-repository-sys.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ CORS configuration
app.use(
  cors({
    origin: [
     "https://departmental-lecture-repository-sys.vercel.app", // your frontend
      "http://localhost:3000", // allow local dev too
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.log("Incoming Origin:", req.headers.origin);
  next();
});




app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

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

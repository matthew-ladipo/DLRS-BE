import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { protect } from "./middlewares/auth.middleware.js";

// Load env
dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,         // e.g. "https://departmental-lecture-repository-sys.vercel.app"
  "http://localhost:3000"         // dev
].filter(Boolean);

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Handle preflight requests for all routes
app.options("*", cors());

// Body parser
app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
import authRoutes from "./routes/auth.routes.js";
// import resourceRoutes from "./routes/resource.routes.js";

app.use("/api/auth", authRoutes);
// app.use("/api/resources", resourceRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

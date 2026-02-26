import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Internal Imports
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/Users.routes.js";

// 1. SETUP ENVIRONMENT VARIABLES
// This ensures the .env file is found even if it's one folder up
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// 2. MIDDLEWARE
app.use(cors()); 
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// 3. SERVER INITIALIZATION
const server = createServer(app); 

// Initialize Socket.io connection manager
const io = connectToSocket(server);

// 4. API ROUTES
app.use("/api/v1/users", userRoutes);

// 5. DATABASE & SERVER START
const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        // Check if MONGO_URL exists to prevent the 'undefined' error
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in .env file");
        }

        const connectionDb = await mongoose.connect(process.env.MONGO_URL);
        console.log(`✅ MongoDB Connected! Host: ${connectionDb.connection.host}`);
        
        server.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1); // Stop the process if DB fails
    }
};

start();
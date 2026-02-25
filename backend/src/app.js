import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io"; 
import mongoose from "mongoose";
import cors from "cors";
import connectToSocket from "./controllers/socketManager.js"

const app = express();
app.use(cors()); 
import userRoutes from "./routes/Users.routes.js"

// Initialize HTTP server to work with both Express and Socket.io
const server = createServer(app); 

// Initialize Socket.io connection manager
const io = connectToSocket(server)

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))

// API Routes
app.use("/api/v1/users", userRoutes)

const start = async () => {
    try {
        // Connect to MongoDB Atlas
        const connectionDb = await mongoose.connect("mongodb+srv://dhiraj_new:dhiraj1234@cluster0.v9g4ddv.mongodb.net/video_call?retryWrites=true&w=majority");
        
        console.log(`mongo connected DB Host: ${connectionDb.connection.host}`);
        
        // Start the integrated server
        server.listen(app.get("port"), () => {
            console.log(`listening on port ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

start();
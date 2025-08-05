import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import http from "http";
import connectDB from "./db/db.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import mongoose from "mongoose";
import Project from "./models/project.model.js";
import Message from "./models/message.model.js";
import { generateResult } from "./services/ai.service.js";
import redisClient from "./services/redis.service.js";


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://codecraft-ai-dusky.vercel.app",
      "https://codecraft-ai-f730.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  },
});

io.use(async (socket, next) => {
  try {
    const projectId = socket.handshake.query.projectId;
    const authToken = socket.handshake.auth.token;
    
    console.log("Socket auth attempt:", { projectId, hasToken: !!authToken });
    
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      console.error("Invalid projectId:", projectId);
      return next(new Error("Invalid projectId"));
    }

    if (!authToken) {
      console.error("No auth token provided");
      return next(new Error("Auth token required"));
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return next(new Error("Invalid or expired token"));
    }
    
    // Check if token is blacklisted (for logout functionality)
    try {
      const blacklisted = await redisClient.get(authToken);
      if (blacklisted) {
        console.error("Token is blacklisted:", authToken.substring(0, 10) + "...");
        return next(new Error("Token blacklisted"));
      }
    } catch (redisError) {
      console.error("Redis error during blacklist check:", redisError.message);
      // Continue without blacklist check if Redis is down
      // In production, you might want to fail securely here
    }
    
    // Find and validate project
    const project = await Project.findById(projectId).populate("users");
    if (!project) {
      console.error("Project not found:", projectId);
      return next(new Error("Project not found"));
    }
    
    // Check if user is a member of the project
    const isMember = project.users.some(user => 
      user.user.toString() === decoded.userId
    );
    
    if (!isMember) {
      console.error("User not a member of project:", decoded.userId, projectId);
      return next(new Error("Access denied to project"));
    }
    
    console.log("Socket auth successful:", decoded.email, projectId);
    
    socket.project = project;
    socket.user = decoded;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message, err.stack);
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const { projectId } = socket.handshake.query;

  console.log("🎉 Client connected:", socket.id, "Project:", projectId);

  if (!projectId) return;

  socket.join(projectId);

  socket.removeAllListeners("project-message");

  socket.on("project-message", async (data) => {
    const { text, senderEmail, projectId } = data;
    console.log(data);
    const isAiPresent = text.includes("@ai");

    try {
      await Message.create({ text, senderEmail, projectId });
      socket.to(projectId).emit("project-message", data);

      if (isAiPresent) {
        const prompt = text.replace("@ai", " ");
        const aiResult = await generateResult(prompt);

        // Save AI message to database
        await Message.create({
          text: aiResult,
          senderEmail: "@Ai",
          projectId
        });

        io.to(projectId).emit("project-message", {
          text: aiResult,
          senderEmail: "@Ai",
          projectId,
        });
      }
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
connectDB();
server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

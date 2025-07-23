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
import Message from "./models/message.model.js"; // import at top
import { generateResult } from "./services/ai.service.js";


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
    console.log("Incoming projectId:", projectId);

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      console.error("❌ Invalid or missing projectId");
      return next(new Error("Invalid or missing projectId"));
    }

    const rawCookie = socket.handshake.headers?.cookie;
    console.log("🔍 Raw cookie header:", rawCookie);

    const cookies = cookie.parse(rawCookie || "");
    const token = cookies.token;

    if (!token) {
      console.error("❌ Token not found in cookie");
      return next(new Error("Token not found"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.error("❌ Token verification failed");
      return next(new Error("Token invalid"));
    }

    socket.project = await Project.findById(projectId).populate("users");
    if (!socket.project) {
      console.error("❌ Project not found");
      return next(new Error("Project not found"));
    }

    socket.user = decoded;
    console.log("✅ Socket authorized for user:", decoded.email);
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
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

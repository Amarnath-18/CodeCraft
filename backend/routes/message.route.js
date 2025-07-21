// routes/message.route.js
import express from "express";
import Message from "../models/message.model.js";
const router = express.Router();

router.get("/:projectId", async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId }).sort("createdAt");
    res.status(200).json({
      success:true,
      messages:messages,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;

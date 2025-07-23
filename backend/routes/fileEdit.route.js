import express from 'express';
import { saveEditedFile } from '../controllers/fileEdit.controller.js';
import { authUser } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authUser);

// Save edited file content
router.post('/save', saveEditedFile);

export default router;

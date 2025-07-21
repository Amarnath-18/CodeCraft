import express from "express";
import { getResult } from "../controllers/ai.controller.js";
import {authUser} from '../middlewares/auth.js'

const router = express.Router();

router.get('/get-result' , authUser , getResult);

export default router;

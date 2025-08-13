import express from 'express'
import { body } from 'express-validator';
import {authUser} from '../middlewares/auth.js'
import { createUserController, getAllUserController, loginUserController, logoutUserConteoller } from '../controllers/user.controller.js';
import User from '../models/user.model.js';
const router = express.Router();

router.post('/register' , 
    body('email').isEmail().withMessage("Email must be a valid email address"), 
    body('password').isLength({min:3}).withMessage("Password must be at least 3 characters long"), 
    createUserController);

router.post("/login" , body('email').isEmail().withMessage("Email must be a valid email") , loginUserController );
router.post("/logout" , logoutUserConteoller);
router.get('/all-users' , authUser , getAllUserController  );

router.get('/me' , authUser ,async (req , res)=>{
    return res.json(req.user);
});

// Vercel token management routes
router.post('/vercel-token', authUser, async (req, res) => {
    try {
        const { vercelToken } = req.body;
        
        if (!vercelToken) {
            return res.status(400).json({
                success: false,
                error: 'Vercel token is required'
            });
        }
        
        await User.findByIdAndUpdate(req.user.userId, {
            vercelToken: vercelToken
        });
        
        res.json({
            success: true,
            message: 'Vercel token saved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/vercel-token', authUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('vercelToken');
        
        res.json({
            success: true,
            hasToken: !!user.vercelToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/vercel-token', authUser, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, {
            $unset: { vercelToken: 1 }
        });
        
        res.json({
            success: true,
            message: 'Vercel token deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
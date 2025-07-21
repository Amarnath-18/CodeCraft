import express from 'express'
import { body } from 'express-validator';
import {authUser} from '../middlewares/auth.js'
import { createUserController, getAllUserController, loginUserController, logoutUserConteoller } from '../controllers/user.controller.js';
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
export default router;
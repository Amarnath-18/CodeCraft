import { validationResult } from "express-validator";
import { createUser, getAllUsers, loginUser } from "../services/user.service.js";
import User from "../models/user.model.js";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed!!",
        error: error.array(),
      });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(401).json({
        success: false,
        message: "User Already Exist With This Email!!!",
      });
    const user = await createUser(req.body);
    const token = await user.genJWT();
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log
    console.log("Content-Type:", req.headers["content-type"]); // Debug log

    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error);

      return res.status(400).json({
        success: false,
        message: "Validation failed!!",
        error: error.array(),
      });
    }

    const user = await loginUser(req.body);
    const token = await user.genJWT();
    res
      .cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "User LoggedIn successfully",
        user: {
        _id: user._id,
        email: user.email,
      },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUserConteoller = async (req , res)=>{
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No token found"
            });
        }
        
        // Add token to Redis blacklist with error handling
        try {
            await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        } catch (redisError) {
            console.error('Redis error during logout:', redisError);
            // Still return success since user intent to logout is clear
            // But log the error for monitoring
        }
        
        // Clear the cookie
        res.clearCookie('token');
        
        res.status(200).json({
            success:true,
            message:"LoggedOut Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to Logout",
        })
    }
}

export const getAllUserController = async (req  , res)=>{
  try {
    const {userId} = req.user;
    const allUsers = await getAllUsers({userId});
    return res.status(200).json({
      success:true,
      message:"All Users Fetched Successfully",
      users: allUsers,
    })
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
}
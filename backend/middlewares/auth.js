import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
export const authUser = async(req , res , next)=>{
    try {
        const token = req.cookies.token || 
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if(!token) return res.status(401).json({
            success:false,
            message:"Unauthorized: Token not found"
        })

        // Check if token is blacklisted with error handling
        let blackListed;
        try {
            blackListed = await redisClient.get(token);
        } catch (redisError) {
            console.error('Redis error:', redisError);
            // Continue without blacklist check if Redis is down
            // You might want to fail securely here depending on your security requirements
        }
        
        if(blackListed) return res.status(401).json({
            success:false,
            message:"Unauthorized: Invalid Token"
        })

        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({
            success:false,
            message:"Unauthorized: Invalid Token"
        })

        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in Authentication",
            error:error.message,
        })
    }
}



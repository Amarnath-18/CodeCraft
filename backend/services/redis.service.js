import Redis from "ioredis";
import dotenv from 'dotenv';``
dotenv.config();

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
    console.log("Redis Connected!!");
});

redisClient.on('error', (err) => {
    console.error("Redis connection error:", err);
});

redisClient.on('ready', () => {
    console.log("Redis is ready!");
});

export default redisClient;
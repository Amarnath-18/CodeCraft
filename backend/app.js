import express from 'express';
import userRoute from './routes/user.route.js'
import projectRoute from './routes/project.route.js'
import cookieParser from 'cookie-parser';
import messageRoute from './routes/message.route.js'
import aiRoutes from './routes/ai.route.js'
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin: [
      "http://localhost:5173", 
      "https://codecraft-ai-dusky.vercel.app",
      "https://codecraft-ai-f730.onrender.com"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));


app.use('/api/user' , userRoute);
app.use('/api/project' , projectRoute);
app.use('/api/messages' , messageRoute);
app.use('/api' , aiRoutes);


app.get('/' , (req , res)=>{
    res.send("Hello from app")
})

export default app;

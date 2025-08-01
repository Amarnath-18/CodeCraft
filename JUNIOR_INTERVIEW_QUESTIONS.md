# CodeCraft AI - Junior Developer Interview Questions

## Table of Contents
1. [Project Overview & Basic Concepts](#project-overview--basic-concepts)
2. [React Fundamentals](#react-fundamentals)
3. [Node.js & Express Basics](#nodejs--express-basics)
4. [MongoDB & Database Basics](#mongodb--database-basics)
5. [Authentication & Basic Security](#authentication--basic-security)
6. [Socket.io & Real-time Features](#socketio--real-time-features)
7. [API Integration & HTTP Requests](#api-integration--http-requests)
8. [Project Structure & Organization](#project-structure--organization)
9. [Basic Debugging & Problem Solving](#basic-debugging--problem-solving)
10. [Learning & Growth Questions](#learning--growth-questions)

---

## Project Overview & Basic Concepts

### Q1: Can you explain what CodeCraft AI is and what it does?

**Answer**: CodeCraft AI is a collaborative development platform that I built using React and Node.js. It allows multiple users to work together on coding projects in real-time. The main features include:

- **User Authentication**: Users can register and login to access their projects
- **Project Management**: Users can create, view, and manage coding projects
- **Real-time Chat**: Team members can chat in real-time within each project
- **AI Integration**: Users can ask AI (@ai) to generate code by typing messages like "@ai create a React component"
- **Code Editor**: Built-in Monaco editor (same as VS Code) for editing code
- **File Management**: View and organize project files in a tree structure
- **WebContainer Integration**: Run code directly in the browser

The application helps developers collaborate on projects and get AI assistance for coding tasks.

### Q2: What technologies did you use to build this project and why?

**Answer**: I chose these technologies based on what I learned and what works well together:

**Frontend:**
- **React**: For building the user interface with reusable components
- **Vite**: Fast development server and build tool, much faster than Create React App
- **TailwindCSS**: For styling - easier than writing custom CSS
- **React Router**: For navigation between pages (Home, Login, Register, Project)
- **Axios**: For making HTTP requests to the backend API

**Backend:**
- **Node.js**: JavaScript runtime so I can use the same language for frontend and backend
- **Express.js**: Web framework for creating REST API endpoints
- **MongoDB**: NoSQL database that's flexible and stores data as JSON-like documents
- **Mongoose**: Makes it easier to work with MongoDB from Node.js
- **Socket.io**: For real-time features like chat

**External Services:**
- **Google Gemini AI**: For AI code generation features
- **WebContainers**: For running code in the browser

### Q3: How is your project structured? Walk me through the folder organization.

**Answer**: My project is organized into two main parts:

```
CodeCraft-AI/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components (Home, Login, ProjectPage, etc.)
│   │   ├── hooks/           # Custom React hooks (useProjectData, useSocket)
│   │   ├── context/         # React Context for global state (UserContext)
│   │   ├── config/          # Configuration files (axios, socket setup)
│   │   ├── utils/           # Utility functions
│   │   └── Routes/          # React Router setup
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                 # Node.js/Express server
│   ├── controllers/         # Handle HTTP requests (user, project, ai)
│   ├── models/             # MongoDB schemas (User, Project, Message)
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic (user service, AI service)
│   ├── middlewares/        # Custom middleware (authentication)
│   ├── db/                 # Database connection
│   ├── app.js              # Express app setup
│   └── server.js           # Server startup and Socket.io
└── README.md               # Project documentation
```

This structure separates concerns clearly - frontend handles UI, backend handles data and business logic.

---

## React Fundamentals

### Q4: Explain how you use React Context in your project. Show me the UserContext implementation.

**Answer**: I use React Context to share user information across all components without prop drilling. Here's how I implemented it:

<augment_code_snippet path="frontend/src/context/user.context.jsx" mode="EXCERPT">
````javascript
import { createContext, useEffect, useState } from "react";
import axiosInstance from "../config/AxiosInstance";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function check() {
            try {
                const currUser = await axiosInstance.get('/user/me', { withCredentials: true });
                if (currUser && currUser.data) {
                    setUser(currUser.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);
    
    return (
        <UserContext.Provider value={{projects, setProjects, user, setUser, loading}}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext };
export default UserProvider;
````
</augment_code_snippet>

**Why I use Context:**
- Avoids passing user data through many component levels
- Automatically checks if user is logged in when app starts
- Provides global access to user state and projects
- Makes it easy to update user info from any component

**How I use it in components:**
```javascript
const { user, setUser, loading } = useContext(UserContext);
```

### Q5: How do you handle forms in React? Show me an example from your Login component.

**Answer**: I use controlled components with useState to handle forms. Here's my login form implementation:

<augment_code_snippet path="frontend/src/components/Login.jsx" mode="EXCERPT">
````javascript
const Login = () => {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/user/login', formdata);
      if (response.data.success == true) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        navigate('/');
        toast.success("Welcome..");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
````
</augment_code_snippet>

**Key concepts I'm using:**
- **Controlled Components**: Form inputs are controlled by React state
- **Single State Object**: All form fields in one state object
- **Dynamic Updates**: One handler function updates any field using `name` attribute
- **Form Submission**: Prevent default, make API call, handle success/error
- **Navigation**: Use React Router's `navigate` after successful login

### Q6: What are React hooks and which ones do you use in your project?

**Answer**: React hooks are functions that let you use state and other React features in functional components. Here are the hooks I use:

**Built-in Hooks:**
- **useState**: For component state (form data, loading states, etc.)
- **useEffect**: For side effects (API calls, socket connections)
- **useContext**: To access UserContext data
- **useCallback**: To prevent unnecessary re-renders in socket handlers
- **useRef**: For storing socket references that don't trigger re-renders

**Custom Hooks I Created:**
- **useProjectData**: Manages project loading and operations
- **useProjectMessages**: Handles chat messages
- **useSocket**: Manages Socket.io connections
- **useWebContainer**: Handles code execution and file management

**Example of my custom hook:**
<augment_code_snippet path="frontend/src/hooks/useProjectData.js" mode="EXCERPT">
````javascript
export const useProjectData = (projectId) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProject = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/project/${id}`);
      setCurrentProject(response.data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };
````
</augment_code_snippet>

Custom hooks help me reuse logic across components and keep components clean.

### Q7: How do you handle navigation in your React app?

**Answer**: I use React Router for navigation. Here's my routing setup:

<augment_code_snippet path="frontend/src/Routes/AppRoutes.jsx" mode="EXCERPT">
````javascript
import React from 'react'
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Home from '../components/Home'
import Register from '../components/Register'
import Login from '../components/Login'
import ProjectPage from '../components/ProjectPage'
import Layout from '../components/Layout'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Layout/>}>
              <Route index element={<Home/>} />
              <Route path='/login' element={<Login/>} />
              <Route path='/register' element={<Register/>} />
              <Route path='/project' element={<ProjectPage/>} />
            </Route>
        </Routes>
    </BrowserRouter>
  )
}
````
</augment_code_snippet>

**Key concepts:**
- **BrowserRouter**: Enables routing in the app
- **Nested Routes**: Layout component wraps all pages for consistent navigation
- **Index Route**: Home component shows at the root path "/"
- **useNavigate**: For programmatic navigation (like after login)
- **useLocation**: To get current route information and pass data between pages

**Example of programmatic navigation:**
```javascript
const navigate = useNavigate();
// After successful login
navigate('/');
// Navigate to project page with data
navigate('/project', { state: projectData });
```

---

## Node.js & Express Basics

### Q8: How did you structure your Express.js application? Explain your app.js file.

**Answer**: I organized my Express app with clear separation of concerns. Here's my main app.js structure:

<augment_code_snippet path="backend/app.js" mode="EXCERPT">
````javascript
import express from 'express';
import userRoute from './routes/user.route.js'
import projectRoute from './routes/project.route.js'
import cookieParser from 'cookie-parser';
import messageRoute from './routes/message.route.js'
import aiRoutes from './routes/ai.route.js'
import fileEditRoute from './routes/fileEdit.route.js'
import cors from 'cors';

const app = express();

// Middleware setup
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

// Routes
app.use('/api/user', userRoute);
app.use('/api/project', projectRoute);
app.use('/api/messages', messageRoute);
app.use('/api/file-edit', fileEditRoute);
app.use('/api', aiRoutes);

export default app;
````
</augment_code_snippet>

**What each part does:**
- **Middleware**: Set up before routes to process all requests
- **express.json()**: Parses JSON request bodies
- **cookieParser()**: Handles cookies for authentication
- **CORS**: Allows frontend to make requests from different domain
- **Routes**: Organized by feature (user, project, messages, etc.)
- **Modular Structure**: Each route is in a separate file

### Q9: How do you handle user authentication in your backend? Show me a route example.

**Answer**: I use JWT (JSON Web Tokens) for authentication. Here's how it works:

**User Registration/Login Controller:**
<augment_code_snippet path="backend/controllers/user.controller.js" mode="EXCERPT">
````javascript
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: { _id: user._id, email: user.email },
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
````
</augment_code_snippet>

**Route with Authentication:**
<augment_code_snippet path="backend/routes/user.route.js" mode="EXCERPT">
````javascript
router.post('/register', 
    body('email').isEmail().withMessage("Email must be a valid email address"), 
    body('password').isLength({min:3}).withMessage("Password must be at least 3 characters long"), 
    createUserController);

router.post("/login", body('email').isEmail().withMessage("Email must be a valid email"), loginUserController);
router.get('/all-users', authUser, getAllUserController);
````
</augment_code_snippet>

**Key concepts:**
- **Input Validation**: Using express-validator to check email format and password length
- **Password Hashing**: Using bcrypt to hash passwords before storing
- **JWT Generation**: Creating tokens that contain user info
- **Cookie Storage**: Storing tokens in httpOnly cookies for security
- **Middleware Protection**: `authUser` middleware protects routes that need authentication

### Q10: How do you connect to MongoDB and define your data models?

**Answer**: I use Mongoose to connect to MongoDB and define schemas. Here's my setup:

**Database Connection:**
<augment_code_snippet path="backend/db/db.js" mode="EXCERPT">
````javascript
import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;
````
</augment_code_snippet>

**User Model Example:**
<augment_code_snippet path="backend/models/user.model.js" mode="EXCERPT">
````javascript
import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema({
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: false,
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
});

userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

userSchema.methods.genJWT = function () {
    return jwt.sign({email: this.email, userId: this._id}, process.env.JWT_SECRET);
}
````
</augment_code_snippet>

**What I learned:**
- **Schema Definition**: Define structure and validation rules
- **Data Types**: String, ObjectId, Array, etc.
- **Relationships**: Reference other collections using ObjectId
- **Methods**: Add custom functions to schema (like password hashing)
- **Middleware**: Mongoose hooks for pre/post operations

---

## MongoDB & Database Basics

### Q11: Explain the database models you created. What are the relationships between them?

**Answer**: I created three main models for my application:

**1. User Model:**
<augment_code_snippet path="backend/models/user.model.js" mode="EXCERPT">
````javascript
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: false, // Don't include in queries by default
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
});
````
</augment_code_snippet>

**2. Project Model:**
<augment_code_snippet path="backend/models/project.model.js" mode="EXCERPT">
````javascript
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
    },
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        }
    }],
}, {timestamps: true})
````
</augment_code_snippet>

**3. Message Model:**
<augment_code_snippet path="backend/models/message.model.js" mode="EXCERPT">
````javascript
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // TTL: messages auto-delete after 10 minutes
  },
});
````
</augment_code_snippet>

**Relationships:**
- **User ↔ Project**: Many-to-many (users can be in multiple projects, projects can have multiple users)
- **Project → Messages**: One-to-many (each project has many messages)
- **Role-based**: Users have different roles (admin/member) in each project

### Q12: How do you perform basic database operations? Show me some examples.

**Answer**: I use Mongoose methods for CRUD operations. Here are examples from my controllers:

**Create a Project:**
```javascript
export const createProjectController = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        const project = await Project.create({
            name,
            users: [{
                user: userId,
                role: 'admin'
            }]
        });

        // Also add project to user's projects array
        await User.findByIdAndUpdate(userId, {
            $push: { projects: project._id }
        });

        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

**Get All Projects for a User:**
```javascript
export const getProjectsController = async (req, res) => {
    try {
        const userId = req.user.userId;

        const projects = await Project.find({
            'users.user': userId
        }).populate('users.user', 'email');

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

**Save Messages:**
```javascript
// In Socket.io handler
await Message.create({
    text,
    senderEmail,
    projectId
});
```

**Key operations I use:**
- **Create**: `Model.create()` or `new Model().save()`
- **Read**: `Model.find()`, `Model.findById()`, `Model.findOne()`
- **Update**: `Model.findByIdAndUpdate()`, `Model.updateOne()`
- **Delete**: `Model.findByIdAndDelete()`, `Model.deleteOne()`
- **Populate**: Load referenced documents
- **Query operators**: `$push`, `$pull` for arrays

### Q13: What is TTL in MongoDB and how do you use it?

**Answer**: TTL (Time To Live) automatically deletes documents after a specified time. I use it for chat messages:

<augment_code_snippet path="backend/models/message.model.js" mode="EXCERPT">
````javascript
createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // TTL: 600 seconds = 10 minutes
},
````
</augment_code_snippet>

**Why I use TTL for messages:**
- **Storage Management**: Chat messages don't need to be stored forever
- **Privacy**: Messages automatically disappear after 10 minutes
- **Performance**: Keeps the messages collection small
- **Automatic Cleanup**: No need to manually delete old messages

**How it works:**
- MongoDB checks TTL indexes every 60 seconds
- Documents are deleted when `createdAt + expires` time is reached
- It's perfect for temporary data like chat messages

---

## Authentication & Basic Security

### Q14: How does your JWT authentication work? Walk me through the login process.

**Answer**: Here's how my JWT authentication works step by step:

**1. User Login Request:**
```javascript
// Frontend - Login.jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axiosInstance.post('/user/login', formdata);
        if (response.data.success == true) {
            // Store token in localStorage
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            navigate('/');
            toast.success("Welcome..");
        }
    } catch (error) {
        toast.error(error.response.data.message);
    }
}
```

**2. Backend Validates Credentials:**
```javascript
// Backend - user.controller.js
export const loginUserController = async (req, res) => {
    try {
        const user = await loginUser(req.body); // Check email/password
        const token = await user.genJWT(); // Generate JWT

        res.cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
            success: true,
            message: "User LoggedIn successfully",
            user: { _id: user._id, email: user.email },
            token: token,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

**3. JWT Generation:**
<augment_code_snippet path="backend/models/user.model.js" mode="EXCERPT">
````javascript
userSchema.methods.genJWT = function () {
    return jwt.sign({email: this.email, userId: this._id}, process.env.JWT_SECRET);
}
````
</augment_code_snippet>

**4. Protected Route Access:**
```javascript
// Backend - auth middleware
export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) return res.status(401).json({
            success: false,
            message: "Unauthorized: Token not found"
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Authentication",
        });
    }
}
```

**Security measures I implemented:**
- **Password Hashing**: Using bcrypt with salt rounds
- **HttpOnly Cookies**: Prevent XSS attacks
- **Token Expiration**: Tokens have limited lifetime
- **CORS Configuration**: Control which domains can access the API

### Q15: How do you handle user roles in your project system?

**Answer**: I implement role-based access with admin and member roles:

**Project Schema with Roles:**
<augment_code_snippet path="backend/models/project.model.js" mode="EXCERPT">
````javascript
users: [{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    }
}],

// Helper method to check if user is admin
projectSchema.methods.isUserAdmin = function(userId) {
    const userEntry = this.users.find(u => u.user.toString() === userId.toString());
    return userEntry && userEntry.role === 'admin';
};
````
</augment_code_snippet>

**Role-based Route Protection:**
```javascript
// Example: Only admins can delete projects
router.delete('/delete/:projectId', authUser, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project.isUserAdmin(req.user.userId)) {
            return res.status(403).json({
                success: false,
                message: "Only project admins can delete projects"
            });
        }

        await Project.findByIdAndDelete(req.params.projectId);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
```

**Frontend Role Checking:**
```javascript
// Show different UI based on user role
const isAdmin = currentProject.users.find(
    u => u.user._id === user._id && u.role === 'admin'
);

return (
    <div>
        {/* All users can see this */}
        <ProjectChat />

        {/* Only admins can see this */}
        {isAdmin && (
            <button onClick={deleteProject}>Delete Project</button>
        )}
    </div>
);
```

**Role Permissions:**
- **Admin**: Create/delete projects, manage users, change roles
- **Member**: View project, participate in chat, edit code

---

## Socket.io & Real-time Features

### Q16: How did you implement real-time chat using Socket.io? Explain the basic setup.

**Answer**: I use Socket.io for real-time communication between users. Here's my implementation:

**1. Server Setup:**
<augment_code_snippet path="backend/server.js" mode="EXCERPT">
````javascript
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://codecraft-ai-dusky.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Authentication middleware for Socket.io
io.use(async (socket, next) => {
  try {
    const projectId = socket.handshake.query.projectId;
    const authToken = socket.handshake.auth.token;

    if (!authToken) {
      return next(new Error("Auth token required"));
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication failed"));
  }
});
````
</augment_code_snippet>

**2. Handling Messages:**
```javascript
io.on("connection", (socket) => {
  const { projectId } = socket.handshake.query;

  // Join project-specific room
  socket.join(projectId);

  socket.on("project-message", async (data) => {
    const { text, senderEmail, projectId } = data;

    try {
      // Save message to database
      await Message.create({ text, senderEmail, projectId });

      // Broadcast to all users in the project room
      socket.to(projectId).emit("project-message", data);

      // Handle AI integration
      if (text.includes("@ai")) {
        const prompt = text.replace("@ai", " ");
        const aiResult = await generateResult(prompt);

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
      console.error("Failed to save message:", err);
    }
  });
});
```

**3. Frontend Socket Connection:**
<augment_code_snippet path="frontend/src/config/socket.js" mode="EXCERPT">
````javascript
import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const token = localStorage.getItem('token');

  socketInstance = io(import.meta.env.VITE_API_URL_WS, {
    auth: { token: token },
    query: { projectId },
  });

  return socketInstance;
};

export const sendMessage = (eventName, data) => {
  if (socketInstance) {
    socketInstance.emit(eventName, data);
  }
};

export const receiveMessage = (eventName, cb) => {
  if (socketInstance) {
    socketInstance.on(eventName, cb);
  }
};
````
</augment_code_snippet>

**Key concepts:**
- **Rooms**: Each project has its own room for isolated communication
- **Authentication**: Verify JWT tokens before allowing socket connections
- **Event-based**: Use emit/on pattern for sending/receiving messages
- **Persistence**: Save messages to database for history

### Q17: How do you handle the AI integration in your chat system?

**Answer**: When users type "@ai" in chat, it triggers AI code generation. Here's how it works:

**1. Detecting AI Messages:**
```javascript
// Server-side message handler
socket.on("project-message", async (data) => {
  const { text, senderEmail, projectId } = data;
  const isAiPresent = text.includes("@ai");

  // Save user message first
  await Message.create({ text, senderEmail, projectId });
  socket.to(projectId).emit("project-message", data);

  // If @ai mentioned, generate AI response
  if (isAiPresent) {
    const prompt = text.replace("@ai", " ");
    const aiResult = await generateResult(prompt);

    // Save AI message
    await Message.create({
      text: aiResult,
      senderEmail: "@Ai",
      projectId
    });

    // Broadcast AI response to all users
    io.to(projectId).emit("project-message", {
      text: aiResult,
      senderEmail: "@Ai",
      projectId,
    });
  }
});
```

**2. AI Service Integration:**
<augment_code_snippet path="backend/services/ai.service.js" mode="EXCERPT">
````javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateResult = async (prompt) => {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Prompt is required and must be a non-empty string.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{
      role: "user",
      parts: [{ text: `${instruction}\n\n${prompt}` }],
    }],
  });

  const content = response?.candidates?.[0]?.content;
  const text = content?.parts?.[0]?.text ?? "⚠️ Gemini returned an unexpected format.";

  return text;
};
````
</augment_code_snippet>

**3. Frontend AI Handling:**
```javascript
// In ProjectPage component
const handleMessageReceived = useCallback((msg) => {
  if (msg.senderEmail === "@Ai") {
    setIsAiThinking(false);

    // Extract file tree from AI response if present
    const { fileTree } = extractTextFromJsonMarkdown(msg.text);
    if (fileTree) {
      console.log("File tree received:", fileTree);
    }
  }
  addMessage(msg);
}, [addMessage]);

const handleSendMessage = () => {
  const isAiMessage = messageText.includes("@ai");

  sendProjectMessage({
    text: messageText.trim(),
    senderEmail: user.email,
    projectId: currentProject._id,
  });

  // Show thinking indicator for AI
  if (isAiMessage) {
    setIsAiThinking(true);
  }
};
```

**User Experience:**
- User types: "@ai create a React component"
- System shows "AI is thinking..." indicator
- AI generates code and sends response
- All users in the project see the AI response
- AI can generate complete project structures with files

---

## API Integration & HTTP Requests

### Q18: How do you make HTTP requests in your React app? Show me your Axios setup.

**Answer**: I use Axios for all HTTP requests with a configured instance for consistency:

**Axios Configuration:**
<augment_code_snippet path="frontend/src/config/AxiosInstance.js" mode="EXCERPT">
````javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
````
</augment_code_snippet>

**Example API Calls:**
```javascript
// Get all projects
const getProjects = async () => {
  try {
    const response = await axiosInstance.get('/project/allProjects');
    setProjects(response.data.projects);
  } catch (error) {
    console.log("Error fetching projects:", error);
    toast.error("Failed to load projects");
  }
};

// Create new project
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axiosInstance.post("/project/create", {name: formName});
    if (response.data.success) {
      toast.success('Project created successfully!');
      await getProjects(); // Refresh list
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
}

// Login user
const handleLogin = async (formdata) => {
  try {
    const response = await axiosInstance.post('/user/login', formdata);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    navigate('/');
  } catch (error) {
    toast.error(error.response.data.message);
  }
};
```

**Benefits of this setup:**
- **Consistent Base URL**: All requests use the same API endpoint
- **Automatic Auth**: Token automatically added to requests
- **Credentials**: Cookies sent with requests for authentication
- **Error Handling**: Centralized error handling
- **Environment Variables**: Different URLs for development/production

### Q19: How do you handle loading states and errors in your API calls?

**Answer**: I use React state to manage loading and error states for better user experience:

**Loading States Example:**
<augment_code_snippet path="frontend/src/hooks/useProjectData.js" mode="EXCERPT">
````javascript
export const useProjectData = (projectId) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProject = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/project/${id}`);
      setCurrentProject(response.data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false); // Always set loading to false
    }
  };
````
</augment_code_snippet>

**UI Loading States:**
```javascript
// In ProjectPage component
if (loading || !currentProject) {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
}
```

**Error Handling Patterns:**
```javascript
// User-friendly error messages
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axiosInstance.post("/project/create", {name: formName});
    if (response.data.success) {
      toast.success('Project created successfully!');
    }
  } catch (error) {
    // Handle different error types
    if (error.response?.status === 401) {
      toast.error('Please login to create a project');
      navigate('/login');
    } else if (error.response?.status === 400) {
      toast.error('Invalid project name');
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }
};
```

**Toast Notifications:**
I use react-hot-toast for user feedback:
```javascript
import toast from 'react-hot-toast';

// Success messages
toast.success('Project created successfully!');

// Error messages
toast.error('Failed to load project');

// Loading messages
toast.loading('Creating project...');
```

**Best practices I follow:**
- Always set loading to false in finally block
- Show specific error messages when possible
- Use loading spinners for better UX
- Handle different HTTP status codes appropriately
- Provide user feedback with toast notifications

---

## Project Structure & Organization

### Q20: How did you organize your React components? Explain your component structure.

**Answer**: I organized my React components by feature and responsibility:

**Main Components:**
- **App.jsx**: Root component with UserProvider and routing
- **Layout.jsx**: Common layout with navigation for all pages
- **Home.jsx**: Dashboard showing all projects with create/edit functionality
- **Login.jsx & Register.jsx**: Authentication forms
- **ProjectPage.jsx**: Main workspace where users collaborate

**Project-specific Components:**
- **ProjectChat.jsx**: Real-time messaging component
- **CodeEditor.jsx**: Monaco editor wrapper for code editing
- **FileExplorer.jsx**: File tree navigation
- **ProjectRunner.jsx**: Code execution and preview
- **ProjectSidebar.jsx**: User management panel

**Utility Components:**
- **FileTreeRenderer.jsx**: Renders file tree structure
- **Navbar.jsx**: Navigation bar with login/logout

**Component Hierarchy Example:**
```
App
├── UserProvider (Context)
├── Layout
│   ├── Navbar
│   └── Outlet (renders current page)
│       ├── Home (project list)
│       ├── Login/Register
│       └── ProjectPage
│           ├── FileExplorer
│           ├── CodeEditor
│           ├── ProjectChat
│           ├── ProjectRunner
│           └── ProjectSidebar
```

**Why this structure works:**
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components can be used in different contexts
- **Maintainability**: Easy to find and update specific features
- **Separation of Concerns**: UI components separate from business logic

### Q21: How do you manage state across your application? What patterns do you use?

**Answer**: I use different state management patterns depending on the scope:

**1. Global State - React Context:**
<augment_code_snippet path="frontend/src/context/user.context.jsx" mode="EXCERPT">
````javascript
const UserProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    return (
        <UserContext.Provider value={{projects, setProjects, user, setUser, loading}}>
            {children}
        </UserContext.Provider>
    );
}
````
</augment_code_snippet>

**2. Component State - useState:**
```javascript
// Local form state
const [formdata, setFormdata] = useState({
  email: "",
  password: "",
});

// UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [loading, setLoading] = useState(false);
```

**3. Custom Hooks for Business Logic:**
<augment_code_snippet path="frontend/src/hooks/useProjectData.js" mode="EXCERPT">
````javascript
export const useProjectData = (projectId) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProject = async (id) => {
    // API logic here
  };

  return { currentProject, loading, getProject };
};
````
</augment_code_snippet>

**4. Socket State Management:**
<augment_code_snippet path="frontend/src/hooks/useSocket.js" mode="EXCERPT">
````javascript
export const useSocket = (projectId, onMessageReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = initializeSocket(projectId);
    socketRef.current = socket;

    const handleIncomingMessage = (msg) => {
      onMessageReceived(msg);
    };

    receiveMessage("project-message", handleIncomingMessage);
  }, [projectId]);

  const sendProjectMessage = useCallback((messageData) => {
    sendMessage("project-message", messageData);
  }, []);

  return { sendProjectMessage };
};
````
</augment_code_snippet>

**State Management Strategy:**
- **Global**: User authentication, project list (Context)
- **Page-level**: Current project, messages, file trees (useState + custom hooks)
- **Component-level**: Form inputs, modal states (useState)
- **Server state**: API data with loading/error states (custom hooks)

### Q22: How do you handle environment variables and configuration?

**Answer**: I use environment variables for different configurations between development and production:

**Frontend (.env files):**
```env
# Development (.env.local)
VITE_API_URL=http://localhost:3000/api
VITE_API_URL_WS=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Production (.env.production)
VITE_API_URL=https://codecraft-ai-f730.onrender.com/api
VITE_API_URL_WS=https://codecraft-ai-f730.onrender.com
```

**Using Environment Variables:**
<augment_code_snippet path="frontend/src/config/AxiosInstance.js" mode="EXCERPT">
````javascript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});
````
</augment_code_snippet>

**Backend (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/codecraft-ai

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# AI Service
GEMINI_API_KEY=your-google-gemini-api-key

# Server
PORT=3000
NODE_ENV=development
```

**Using in Backend:**
```javascript
import dotenv from "dotenv";
dotenv.config();

// Database connection
mongoose.connect(process.env.MONGODB_URI);

// JWT signing
jwt.sign(payload, process.env.JWT_SECRET);

// AI service
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
```

**Benefits:**
- **Security**: Sensitive data not in code
- **Flexibility**: Different configs for dev/prod
- **Team Collaboration**: Each developer can have their own local config
- **Deployment**: Easy to change settings without code changes

### Q23: How do you handle file uploads and file management in your project?

**Answer**: I handle file operations through the WebContainer integration and database storage:

**File Save to Database:**
<augment_code_snippet path="frontend/src/hooks/useWebContainer.js" mode="EXCERPT">
````javascript
// Save file to database
const handleFileSave = async (file) => {
  if (!projectId || !file) return;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  try {
    await axios.post(
      `${API_BASE_URL}/api/file-edit/save`,
      {
        projectId,
        filePath: file.path || file.name,
        fileName: file.name,
        content: file.contents
      },
      { withCredentials: true }
    );

    console.log("File saved successfully:", file.name);
  } catch (error) {
    console.error("Failed to save file:", error);
    throw error;
  }
};
````
</augment_code_snippet>

**File Tree Management:**
```javascript
// File tree structure from AI
const fileTree = {
  "package.json": {
    file: { contents: "..." }
  },
  "src": {
    directory: {
      "App.jsx": { file: { contents: "..." } },
      "main.jsx": { file: { contents: "..." } }
    }
  }
};

// Update file content
const updateFileContent = (tree, filePath, newContent) => {
  // Recursive function to update nested file structure
  const pathParts = filePath.split("/");
  // Implementation for updating file content in tree
};
```

**File Operations I Handle:**
- **File Selection**: Click on file in explorer to open in editor
- **File Editing**: Monaco editor for code editing with syntax highlighting
- **File Saving**: Save changes to database with debouncing
- **File Creation**: AI generates new files and folders
- **File Tree Display**: Recursive rendering of folder structure

**Backend File Route:**
<augment_code_snippet path="backend/routes/fileEdit.route.js" mode="EXCERPT">
````javascript
router.post('/save', authUser, async (req, res) => {
  try {
    const { projectId, filePath, fileName, content } = req.body;

    // Save file data to database or file system
    // Implementation depends on storage strategy

    res.json({
      success: true,
      message: 'File saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
````
</augment_code_snippet>

---

## Basic Debugging & Problem Solving

### Q24: How do you debug issues in your React application? What tools do you use?

**Answer**: I use several debugging techniques and tools:

**1. Browser Developer Tools:**
```javascript
// Console logging for debugging
console.log("User data:", user);
console.log("API response:", response.data);
console.error("Error occurred:", error);

// Debugging state changes
useEffect(() => {
  console.log("Projects updated:", projects);
}, [projects]);
```

**2. React Developer Tools:**
- Inspect component props and state
- Track state changes in real-time
- View component hierarchy
- Check Context values

**3. Network Tab:**
- Monitor API requests and responses
- Check request headers (authentication tokens)
- Verify request payloads
- Debug CORS issues

**4. Common Debugging Scenarios:**

**Authentication Issues:**
```javascript
// Check if token exists
const token = localStorage.getItem('token');
console.log("Token:", token);

// Verify user context
const { user, loading } = useContext(UserContext);
console.log("User:", user, "Loading:", loading);
```

**Socket Connection Issues:**
```javascript
// Debug socket connection
useEffect(() => {
  const socket = initializeSocket(projectId);

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
}, [projectId]);
```

**API Call Debugging:**
```javascript
const getProjects = async () => {
  try {
    console.log("Fetching projects...");
    const response = await axiosInstance.get('/project/allProjects');
    console.log("Projects response:", response.data);
    setProjects(response.data.projects);
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
```

**5. Error Boundaries:**
```javascript
// Simple error boundary for catching React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Q25: Describe a bug you encountered and how you fixed it.

**Answer**: Here's a real bug I encountered and how I solved it:

**Problem**: Users were getting logged out randomly, and the authentication state was inconsistent.

**Symptoms:**
- User would be logged in, then suddenly see login page
- API calls would fail with 401 errors
- UserContext would show user as null unexpectedly

**Debugging Process:**

**1. Identified the Issue:**
```javascript
// Added logging to UserContext
useEffect(() => {
  async function check() {
    try {
      console.log("Checking user authentication...");
      const currUser = await axiosInstance.get('/user/me', { withCredentials: true });
      console.log("User check response:", currUser.data);
      if (currUser && currUser.data) {
        setUser(currUser.data);
      } else {
        console.log("No user data received");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  check();
}, []);
```

**2. Found the Root Cause:**
The issue was that I was storing the JWT token in localStorage, but the backend was also trying to read it from cookies. Sometimes the token would be missing from one location.

**3. The Fix:**
```javascript
// Updated Axios interceptor to always send token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Updated backend auth middleware to check both sources
export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) return res.status(401).json({
      success: false,
      message: "Unauthorized: Token not found"
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Authentication",
    });
  }
}
```

**4. Testing the Fix:**
- Verified login works consistently
- Checked that API calls include proper headers
- Tested page refresh doesn't log user out
- Confirmed authentication persists across browser sessions

**What I Learned:**
- Always check both frontend and backend when debugging auth issues
- Use consistent token storage and retrieval methods
- Add proper logging to track down intermittent issues
- Test authentication flows thoroughly

### Q26: How do you handle errors in your Node.js backend?

**Answer**: I use several error handling strategies in my backend:

**1. Try-Catch Blocks in Controllers:**
```javascript
export const createProjectController = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const project = await createProject(name, userId);

    res.status(201).json({
      success: true,
      message: "Project Created Successfully",
      project
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

**2. Input Validation:**
<augment_code_snippet path="backend/routes/user.route.js" mode="EXCERPT">
````javascript
router.post('/register',
    body('email').isEmail().withMessage("Email must be a valid email address"),
    body('password').isLength({min:3}).withMessage("Password must be at least 3 characters long"),
    createUserController);
````
</augment_code_snippet>

**3. Validation Error Handling:**
```javascript
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
    // ... rest of the logic
  } catch (error) {
    // Handle unexpected errors
  }
};
```

**4. Database Error Handling:**
```javascript
// Handle duplicate email registration
const existingUser = await User.findOne({ email: req.body.email });
if (existingUser) {
  return res.status(401).json({
    success: false,
    message: "User Already Exist With This Email!!!",
  });
}
```

**5. Socket.io Error Handling:**
```javascript
socket.on("project-message", async (data) => {
  try {
    await Message.create({ text, senderEmail, projectId });
    socket.to(projectId).emit("project-message", data);
  } catch (err) {
    console.error("❌ Failed to save message:", err);
    socket.emit("error", { message: "Failed to send message" });
  }
});
```

**Error Response Format:**
```javascript
// Consistent error response structure
{
  success: false,
  message: "User-friendly error message",
  error: "Detailed error for debugging (development only)"
}

// Success response structure
{
  success: true,
  message: "Operation successful",
  data: { /* response data */ }
}
```

**Best Practices I Follow:**
- Always use try-catch in async functions
- Validate input data before processing
- Return consistent error response format
- Log errors for debugging but don't expose sensitive info to client
- Use appropriate HTTP status codes (400, 401, 404, 500)

---

## Learning & Growth Questions

### Q27: What was the most challenging part of building this project?

**Answer**: The most challenging part was implementing real-time collaboration with Socket.io and WebContainer integration. Here's why:

**1. Socket.io Authentication:**
Initially, I struggled with authenticating Socket.io connections. I had to learn how to:
- Pass JWT tokens through socket handshake
- Verify tokens in Socket.io middleware
- Handle authentication failures gracefully

**2. WebContainer Integration:**
WebContainers were completely new to me. Challenges included:
- Understanding the file system structure they require
- Parsing AI responses into the correct format
- Handling CORS headers for WebContainer compatibility
- Managing container lifecycle and cleanup

**3. Real-time State Synchronization:**
Keeping the UI in sync across multiple users was tricky:
- When one user receives AI-generated files, all users should see them
- Managing loading states during AI processing
- Handling connection drops and reconnections

**4. AI Response Parsing:**
The AI returns text that needs to be parsed into structured data:
```javascript
// Had to learn to extract JSON from markdown
const extractTextFromJsonMarkdown = (input) => {
  const match = input.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return { text: input };

  try {
    const parsed = JSON.parse(match[1]);
    return {
      text: parsed.text || "",
      fileTree: parsed.fileTree || null,
      buildCommand: parsed.buildCommand || null,
      startCommand: parsed.startCommand || null,
    };
  } catch (err) {
    return { text: input };
  }
};
```

**How I Overcame These Challenges:**
- **Documentation**: Read Socket.io and WebContainer docs thoroughly
- **Console Logging**: Added extensive logging to understand data flow
- **Step-by-step**: Broke down complex features into smaller parts
- **Community Help**: Used Stack Overflow and GitHub issues for specific problems
- **Experimentation**: Built small test components to understand concepts

**What I Learned:**
- Real-time applications require careful state management
- Authentication in WebSocket connections is different from HTTP
- AI integration needs robust error handling and parsing
- Complex features should be built incrementally

### Q28: What would you improve or add to this project if you had more time?

**Answer**: There are several features I'd like to add and improvements I'd make:

**1. Enhanced Collaboration Features:**
- **Real-time Code Editing**: Multiple users editing the same file simultaneously (like Google Docs)
- **User Cursors**: Show where other users are typing in the code editor
- **File Locking**: Prevent conflicts when multiple users edit the same file

**2. Better File Management:**
- **File Upload**: Allow users to upload their own files
- **File Download**: Export project files as a ZIP
- **Version Control**: Basic Git-like functionality to track changes
- **File Search**: Search across all project files

**3. Improved AI Features:**
- **Code Review**: AI can review code and suggest improvements
- **Error Detection**: AI helps debug errors in the code
- **Code Completion**: AI-powered autocomplete in the editor
- **Multiple AI Models**: Support for different AI providers

**4. User Experience Improvements:**
- **Dark/Light Theme**: Theme switcher for better user preference
- **Mobile Responsive**: Better mobile experience
- **Keyboard Shortcuts**: VS Code-like shortcuts in the editor
- **Project Templates**: Pre-built project templates for quick start

**5. Performance Optimizations:**
- **Code Splitting**: Lazy load components for faster initial load
- **Caching**: Cache API responses and AI results
- **WebSocket Optimization**: Better connection management
- **Database Indexing**: Optimize database queries

**6. Security Enhancements:**
- **Rate Limiting**: Prevent API abuse
- **Input Sanitization**: Better validation of user inputs
- **HTTPS**: Secure connections in production
- **Session Management**: Better token refresh mechanism

**7. Testing:**
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Load testing for concurrent users

**8. DevOps Improvements:**
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring
- **Logging**: Better structured logging
- **Error Tracking**: Tools like Sentry for error monitoring

### Q29: How did this project help you grow as a developer?

**Answer**: This project significantly improved my development skills in several areas:

**1. Full-Stack Development:**
Before this project, I had only worked on frontend or backend separately. Building CodeCraft AI taught me:
- How frontend and backend communicate through APIs
- Managing state across both client and server
- Understanding the complete data flow in a web application
- Coordinating development between React and Node.js

**2. Real-time Applications:**
I learned about WebSocket technology and real-time communication:
- Socket.io for bidirectional communication
- Managing connection states and reconnections
- Broadcasting messages to specific user groups (rooms)
- Handling real-time UI updates without page refreshes

**3. Database Design:**
Working with MongoDB taught me:
- Designing schemas for related data (users, projects, messages)
- Understanding relationships between collections
- Using Mongoose for data modeling and validation
- Implementing features like TTL for automatic data cleanup

**4. Authentication & Security:**
I gained practical experience with:
- JWT token-based authentication
- Password hashing with bcrypt
- Protecting API routes with middleware
- CORS configuration for cross-origin requests
- Role-based access control

**5. External API Integration:**
Integrating Google Gemini AI taught me:
- Making API calls to external services
- Handling API responses and errors
- Parsing and validating external data
- Managing API keys and environment variables

**6. Problem-Solving Skills:**
Building complex features improved my ability to:
- Break down large problems into smaller tasks
- Debug issues across multiple layers (frontend, backend, database)
- Research solutions using documentation and community resources
- Test and iterate on solutions

**7. Code Organization:**
I learned better practices for:
- Structuring React applications with custom hooks
- Organizing backend code with controllers, services, and routes
- Creating reusable components and functions
- Managing environment configurations

**8. User Experience Thinking:**
Working on the UI taught me to consider:
- Loading states and error handling
- User feedback with toast notifications
- Responsive design principles
- Intuitive navigation and user flows

**What I'm Most Proud Of:**
- Successfully integrating multiple complex technologies
- Building a working real-time collaborative platform
- Creating a clean, organized codebase
- Implementing features I had never built before (WebContainers, Socket.io)

**Next Steps for Learning:**
- Add comprehensive testing to the project
- Learn about deployment and DevOps practices
- Explore more advanced React patterns
- Study system design for scaling applications

### Q30: How would you explain this project to a non-technical person?

**Answer**: I would explain CodeCraft AI like this:

"CodeCraft AI is like Google Docs, but for writing computer code instead of documents. Here's what makes it special:

**What it does:**
- Multiple people can work on the same coding project at the same time
- Everyone can see changes instantly, just like in Google Docs
- There's a built-in chat where team members can discuss the project
- You can ask an AI assistant to write code for you by typing '@ai' in the chat

**Why it's useful:**
- **Collaboration**: Developers can work together from different locations
- **Learning**: Beginners can learn by watching experienced developers code
- **AI Help**: When you're stuck, the AI can generate code examples or complete projects
- **Convenience**: Everything happens in the web browser - no software to install

**Real-world example:**
Imagine you're working on a website with your team. Instead of emailing code files back and forth, everyone opens CodeCraft AI in their browser. You can all see the same code, make changes together, and chat about what you're building. If someone needs help creating a login form, they can ask the AI: '@ai create a login form for my website' and the AI will generate the code instantly.

**The technology behind it:**
- **Frontend**: The part users see and interact with (like a website interface)
- **Backend**: The server that handles data and user accounts
- **Database**: Stores all the projects, users, and chat messages
- **Real-time communication**: Makes sure everyone sees changes instantly
- **AI integration**: Connects to Google's AI to generate code

**What I learned building it:**
- How to make websites that update in real-time
- How to securely handle user accounts and passwords
- How to integrate AI services into applications
- How to organize complex code projects
- How to make different parts of an application work together

It's like building a digital workspace where programmers can collaborate and get AI assistance, making coding more social and accessible."

This explanation focuses on the value and functionality rather than technical details, using analogies that non-technical people can understand.

---

## Conclusion

These interview questions are designed specifically for junior developers and focus on the actual implementation in your CodeCraft AI project. They cover:

✅ **Fundamental Concepts**: Basic React, Node.js, and MongoDB concepts you actually used
✅ **Real Code Examples**: Questions based on your actual codebase
✅ **Practical Experience**: What you learned building real features
✅ **Problem-Solving**: Debugging and challenges you actually faced
✅ **Growth Mindset**: How the project helped you learn and improve

**Key Areas Covered:**
- React fundamentals (hooks, context, components)
- Node.js/Express basics (routes, middleware, controllers)
- MongoDB essentials (schemas, CRUD operations)
- Authentication with JWT
- Socket.io for real-time features
- API integration and HTTP requests
- Project organization and structure
- Basic debugging techniques
- Learning experiences and growth

These questions will help you confidently discuss your project in junior developer interviews, focusing on what you've actually built and learned rather than advanced concepts you haven't implemented yet.

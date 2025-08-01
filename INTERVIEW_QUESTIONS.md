# CodeCraft AI - Technical Interview Questions & Answers

## Table of Contents
1. [System Architecture & Design](#system-architecture--design)
2. [Frontend Development](#frontend-development)
3. [Backend Development](#backend-development)
4. [Database Design & MongoDB](#database-design--mongodb)
5. [Authentication & Security](#authentication--security)
6. [AI Integration](#ai-integration)
7. [Real-time Collaboration](#real-time-collaboration)
8. [Performance & Scalability](#performance--scalability)
9. [Problem-solving & Debugging](#problem-solving--debugging)

---

## System Architecture & Design

### Q1: Walk me through the overall architecture of CodeCraft AI. How do the different components interact?

**Answer**: CodeCraft AI follows a modern full-stack architecture with clear separation of concerns:

**Frontend Layer**: React 19.1.0 with Vite, featuring modular components, custom hooks for business logic, and Context API for state management. Key components include ProjectPage (main workspace), CodeEditor (Monaco-based), FileExplorer, and ProjectChat.

**Backend Layer**: Node.js with Express.js 5.1.0, implementing a service layer pattern. Controllers handle HTTP requests, services contain business logic, and middleware manages authentication and authorization.

**Real-time Layer**: Socket.io enables bidirectional communication with room-based project isolation. Each project creates a separate room for secure collaboration.

**Database Layer**: MongoDB with Mongoose ODM, featuring three main collections: Users, Projects, and Messages (with TTL for automatic cleanup).

**External Services**: Google Gemini AI for code generation and StackBlitz WebContainers for in-browser code execution.

**Data Flow**: Frontend → Axios/Socket.io → Express Routes → Middleware → Controllers → Services → MongoDB, with real-time updates flowing back through Socket.io rooms.

### Q2: Why did you choose this particular tech stack? What were the key decision factors?

**Answer**: The tech stack was chosen based on several strategic factors:

**React**: Chosen for its component-based architecture, excellent ecosystem, and strong community support. React 19's concurrent features help with real-time updates and WebContainer integration.

**Node.js/Express**: JavaScript across the full stack reduces context switching and enables code sharing. Express provides mature middleware ecosystem essential for authentication and CORS handling.

**MongoDB**: Document-based storage fits our flexible project structure and user-role relationships. The schema-less nature accommodates varying project configurations and AI-generated content.

**Socket.io**: Provides reliable real-time communication with automatic fallbacks, room management, and built-in authentication hooks essential for collaborative features.

**WebContainers**: Enables secure, client-side code execution without server resources, crucial for scalability and security in a multi-tenant environment.

**Google Gemini**: Offers advanced code generation capabilities with structured output formatting, essential for generating complete project structures.

### Q3: How would you modify this architecture to support microservices?

**Answer**: I'd decompose the monolithic backend into specialized services:

**API Gateway**: Route requests and handle cross-cutting concerns like authentication, rate limiting, and logging.

**User Service**: Handle authentication, user management, and profile operations.

**Project Service**: Manage project CRUD operations, user-project relationships, and permissions.

**AI Service**: Dedicated service for Google Gemini integration with request queuing and caching.

**File Service**: Handle file operations, storage, and WebContainer integration.

**Notification Service**: Manage real-time events and Socket.io connections.

**Message Service**: Handle chat functionality with message persistence and cleanup.

**Benefits**: Independent scaling, technology diversity, fault isolation, and team autonomy.

**Challenges**: Service discovery, data consistency, distributed transactions, and increased operational complexity.

**Implementation**: Use Docker containers, Kubernetes orchestration, Redis for inter-service communication, and event-driven architecture with message queues.

---

## Frontend Development

### Q4: Explain your component architecture and state management strategy in React.

**Answer**: Our React architecture follows a hierarchical component structure with clear data flow:

**Component Hierarchy**:
```
App (UserContext Provider)
├── ProjectPage (Main Container)
│   ├── FileExplorer (File Navigation)
│   ├── CodeEditor (Monaco Integration)
│   ├── ProjectChat (Real-time Messaging)
│   ├── ProjectRunner (Code Execution)
│   └── ProjectSidebar (User Management)
```

**State Management Strategy**:

1. **Global State**: UserContext for authentication and user data
2. **Component State**: Local useState for UI-specific state
3. **Custom Hooks**: Business logic abstraction (useProjectData, useWebContainer, useSocket)
4. **Server State**: Real-time synchronization via Socket.io

**Custom Hooks Pattern**:
```javascript
// useProjectData - Encapsulates project operations
const { currentProject, loading, handleAddUser } = useProjectData(projectId);

// useWebContainer - Manages file system and execution
const { fileTrees, currFile, runProject } = useWebContainer(projectId, messages);

// useSocket - Handles real-time communication
const { sendProjectMessage } = useSocket(projectId, handleMessageReceived);
```

This approach provides clear separation of concerns, reusable logic, and maintainable code structure.

### Q5: How do you handle WebContainer integration and what challenges did you face?

**Answer**: WebContainer integration required careful handling of browser security and file system management:

**Implementation Approach**:
```javascript
// Singleton pattern for WebContainer instance
let containerInstance = null;

export async function getWebContainer() {
    if (containerInstance) return containerInstance;
    containerInstance = await WebContainer.boot();
    return containerInstance;
}
```

**Key Challenges and Solutions**:

1. **CORS Headers**: WebContainers require specific security headers
   ```javascript
   // Vite configuration
   server: {
       headers: {
           "Cross-Origin-Embedder-Policy": "require-corp",
           "Cross-Origin-Opener-Policy": "same-origin",
       }
   }
   ```

2. **File System Mounting**: Converting AI-generated structures to WebContainer format
   ```javascript
   const fileTree = {
       "package.json": { file: { contents: "..." } },
       "src": { 
           directory: {
               "App.jsx": { file: { contents: "..." } }
           }
       }
   };
   await webContainer.mount(fileTree);
   ```

3. **Process Management**: Handling build and start commands
   ```javascript
   const buildProcess = await webContainer.spawn('npm', ['install']);
   buildProcess.output.pipeTo(new WritableStream({
       write(data) { setRunOutput(prev => prev + data); }
   }));
   ```

4. **Server Detection**: Automatically detecting development servers
   ```javascript
   webContainer.on('server-ready', (port, url) => {
       setPreviewUrl(url);
       setShowPreview(true);
   });
   ```

### Q6: Describe your approach to real-time UI updates and state synchronization.

**Answer**: Real-time UI updates are handled through a combination of optimistic updates and server synchronization:

**Optimistic Updates Pattern**:
```javascript
const handleSendMessage = () => {
    // Immediate UI update
    addMessage({
        text: messageText,
        senderEmail: user.email,
        timestamp: Date.now()
    });
    
    // Send to server
    sendProjectMessage(messageData);
    
    // Server confirms and broadcasts to other users
};
```

**State Synchronization Strategy**:

1. **Message Flow**: Local state → Server persistence → Broadcast to room → Update all clients
2. **File Updates**: Editor changes → Local state → Database save → Real-time sync (planned)
3. **AI Integration**: User request → Server processing → AI response → Parse and update file trees

**Conflict Resolution**:
- Last-write-wins for simple operations
- Operational transformation planned for collaborative editing
- Server-side validation for critical operations

**Performance Optimizations**:
- Debounced file saves to reduce server load
- Memoized components to prevent unnecessary re-renders
- Virtual scrolling for large file trees

---

## Backend Development

### Q7: Explain your Express.js middleware architecture and request flow.

**Answer**: Our Express middleware architecture follows a layered approach with clear separation of concerns:

**Middleware Stack**:
```javascript
app.use(express.json());                    // Body parsing
app.use(express.urlencoded({extended:true})); // URL encoding
app.use(cookieParser());                    // Cookie handling
app.use(cors(corsConfig));                  // CORS configuration
app.use('/api/user', authUser, userRoute);  // Authentication
app.use('/api/project', authUser, projectRoute); // Protected routes
```

**Request Flow**:
1. **CORS Middleware**: Validates origin and sets headers
2. **Body Parsing**: Processes JSON/form data
3. **Authentication**: JWT validation and user extraction
4. **Route Matching**: Express router delegation
5. **Authorization**: Project-level permission checks
6. **Controller**: Business logic execution
7. **Service Layer**: Database operations
8. **Response**: JSON formatting and error handling

**Custom Middleware Examples**:
```javascript
// Authentication middleware
export const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({message: "Unauthorized"});
    
    const blackListed = await redisClient.get(token);
    if (blackListed) return res.status(401).json({message: "Invalid Token"});
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
};

// Project authorization middleware
export const checkProjectAdmin = async (req, res, next) => {
    const project = await Project.findById(req.params.projectId);
    if (!project.isUserAdmin(req.user.userId)) {
        return res.status(403).json({message: "Admin access required"});
    }
    req.project = project;
    next();
};
```

### Q8: How do you handle Socket.io authentication and room management?

**Answer**: Socket.io authentication and room management are critical for secure real-time collaboration:

**Authentication Middleware**:
```javascript
io.use(async (socket, next) => {
    try {
        const projectId = socket.handshake.query.projectId;
        const authToken = socket.handshake.auth.token;
        
        // Validate project ID
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("Invalid projectId"));
        }
        
        // Verify JWT token
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        
        // Validate project access
        const project = await Project.findById(projectId).populate("users");
        if (!project) return next(new Error("Project not found"));
        
        // Check user membership
        const isMember = project.users.some(u => u.user.toString() === decoded.userId);
        if (!isMember) return next(new Error("Access denied"));
        
        socket.project = project;
        socket.user = decoded;
        next();
    } catch (err) {
        return next(new Error("Authentication failed"));
    }
});
```

**Room Management Strategy**:
```javascript
io.on("connection", (socket) => {
    const { projectId } = socket.handshake.query;
    
    // Join project-specific room
    socket.join(projectId);
    console.log(`User ${socket.user.email} joined project ${projectId}`);
    
    // Handle project messages
    socket.on("project-message", async (data) => {
        // Save to database
        await Message.create(data);
        
        // Broadcast to room (excluding sender)
        socket.to(projectId).emit("project-message", data);
        
        // Handle AI integration
        if (data.text.includes("@ai")) {
            const aiResponse = await generateResult(data.text.replace("@ai", ""));
            io.to(projectId).emit("project-message", {
                text: aiResponse,
                senderEmail: "@Ai",
                projectId
            });
        }
    });
    
    socket.on("disconnect", () => {
        console.log(`User disconnected from project ${projectId}`);
    });
});
```

**Security Features**:
- Project-based room isolation
- JWT validation for each connection
- User membership verification
- Automatic cleanup on disconnect

### Q9: Describe your error handling and logging strategy.

**Answer**: Comprehensive error handling and logging are essential for production reliability:

**Error Handling Layers**:

1. **Validation Layer**: Express-validator for input validation
```javascript
router.post('/register', 
    body('email').isEmail().withMessage("Email must be valid"),
    body('password').isLength({min:3}).withMessage("Password too short"),
    createUserController
);
```

2. **Controller Layer**: Try-catch with specific error responses
```javascript
export const createUserController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }
        
        const user = await createUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

3. **Service Layer**: Business logic error handling
```javascript
export const createUser = async ({email, password}) => {
    if (!email || !password) {
        throw new Error("All fields are required");
    }
    
    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new Error("User already exists");
    }
    
    return await User.create({email, password: hashedPassword});
};
```

**Logging Strategy**:
- Structured logging with Winston (planned)
- Error tracking with Sentry (planned)
- Performance monitoring with New Relic (planned)
- Custom middleware for request/response logging

---

## Database Design & MongoDB

### Q10: Explain your MongoDB schema design and the reasoning behind your choices.

**Answer**: Our MongoDB schema is designed for flexibility, performance, and collaboration features:

**User Schema**:
```javascript
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
        select: false,  // Security: exclude from queries
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
});
```

**Project Schema**:
```javascript
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
}, {timestamps: true});

// Helper method for role checking
projectSchema.methods.isUserAdmin = function(userId) {
    const userEntry = this.users.find(u => u.user.toString() === userId.toString());
    return userEntry && userEntry.role === 'admin';
};
```

**Message Schema with TTL**:
```javascript
const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    senderEmail: { type: String, required: true },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,  // TTL: 10 minutes
    },
});
```

**Design Decisions**:

1. **Embedded vs Referenced**: 
   - Project users are embedded for atomic role updates
   - User projects are referenced to avoid duplication

2. **TTL for Messages**: Automatic cleanup reduces storage costs and maintains privacy

3. **Role-based Access**: Embedded roles in project schema for efficient permission checks

4. **Indexing Strategy**: Email uniqueness, project-user relationships optimized

### Q11: How would you optimize database queries for better performance?

**Answer**: Database optimization involves multiple strategies:

**Indexing Strategy**:
```javascript
// Compound indexes for common queries
userSchema.index({ email: 1 });
projectSchema.index({ "users.user": 1 });
messageSchema.index({ projectId: 1, createdAt: -1 });

// Text search indexes for future features
projectSchema.index({ name: "text" });
```

**Query Optimization**:
```javascript
// Efficient population with field selection
const project = await Project.findById(projectId)
    .populate('users.user', 'email')  // Only fetch needed fields
    .lean();  // Return plain objects for read-only operations

// Aggregation for complex queries
const projectStats = await Project.aggregate([
    { $match: { _id: projectId } },
    { $unwind: "$users" },
    { $group: { 
        _id: "$_id", 
        totalUsers: { $sum: 1 },
        adminCount: { 
            $sum: { $cond: [{ $eq: ["$users.role", "admin"] }, 1, 0] }
        }
    }}
]);
```

**Connection Optimization**:
```javascript
// Connection pooling
mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});
```

**Caching Strategy**:
- Redis for frequently accessed project data
- Application-level caching for user sessions
- Query result caching for expensive operations

### Q12: How do you handle data consistency in a collaborative environment?

**Answer**: Data consistency in collaborative environments requires careful transaction management:

**Atomic Operations**:
```javascript
// Using MongoDB transactions for multi-document updates
const session = await mongoose.startSession();
try {
    await session.withTransaction(async () => {
        // Add user to project
        await Project.findByIdAndUpdate(
            projectId,
            { $push: { users: { user: userId, role: 'member' } } },
            { session }
        );
        
        // Add project to user
        await User.findByIdAndUpdate(
            userId,
            { $push: { projects: projectId } },
            { session }
        );
    });
} finally {
    await session.endSession();
}
```

**Optimistic Concurrency Control**:
```javascript
// Version-based updates
const projectSchema = new mongoose.Schema({
    // ... other fields
    version: { type: Number, default: 0 }
});

// Update with version check
const updateProject = async (projectId, updates, currentVersion) => {
    const result = await Project.findOneAndUpdate(
        { _id: projectId, version: currentVersion },
        { ...updates, $inc: { version: 1 } },
        { new: true }
    );
    
    if (!result) {
        throw new Error('Concurrent modification detected');
    }
    return result;
};
```

**Event Sourcing for Critical Operations**:
- Store all project changes as events
- Rebuild state from event log
- Enable audit trails and rollback capabilities

---

## Authentication & Security

### Q13: Walk me through your JWT authentication implementation and security measures.

**Answer**: Our JWT implementation follows security best practices with multiple layers of protection:

**Token Generation**:
```javascript
// User model method
userSchema.methods.genJWT = function() {
    return jwt.sign(
        { 
            email: this.email, 
            userId: this._id,
            iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}
```

**Token Storage Strategy**:
```javascript
// Dual storage approach
res.cookie("token", token, {
    maxAge: 1000 * 60 * 60 * 24,  // 24 hours
    httpOnly: true,                // Prevent XSS
    secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? undefined : undefined,
});

// Also return token for localStorage (mobile apps)
res.json({ success: true, user, token });
```

**Authentication Middleware**:
```javascript
export const authUser = async (req, res, next) => {
    try {
        // Multiple token sources
        const token = req.cookies.token || 
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token not found"
            });
        }

        // Check Redis blacklist for logout tokens
        let blackListed;
        try {
            blackListed = await redisClient.get(token);
        } catch (redisError) {
            console.error('Redis error:', redisError);
            // Continue without blacklist check if Redis is down
        }
        
        if (blackListed) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid Token"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Authentication",
            error: error.message,
        });
    }
}
```

**Security Measures**:

1. **Password Security**:
```javascript
userSchema.statics.hashPassword = async function(password) {
    return bcrypt.hash(password, 10);  // Salt rounds: 10
};

userSchema.methods.isValidPassword = async function(password) {
    return bcrypt.compare(password, this.password);
}
```

2. **Token Blacklisting**:
```javascript
// Logout implementation
export const logoutUserController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // Add to Redis blacklist
            await redisClient.setex(token, 24 * 60 * 60, 'blacklisted');
        }
        
        res.clearCookie('token').json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

3. **Input Validation**:
```javascript
router.post('/register', 
    body('email').isEmail().withMessage("Email must be valid"),
    body('password').isLength({min:3}).withMessage("Password too short"),
    createUserController
);
```

### Q14: How do you implement role-based access control?

**Answer**: Role-based access control is implemented at multiple levels:

**Database Level - Role Definition**:
```javascript
const projectSchema = new mongoose.Schema({
    users: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        }
    }]
});

// Helper method for permission checking
projectSchema.methods.isUserAdmin = function(userId) {
    const userEntry = this.users.find(u => u.user.toString() === userId.toString());
    return userEntry && userEntry.role === 'admin';
};

projectSchema.methods.isUserMember = function(userId) {
    return this.users.some(u => u.user.toString() === userId.toString());
};
```

**Middleware Level - Permission Enforcement**:
```javascript
// Check if user is project admin
export const checkProjectAdmin = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!project.isUserAdmin(userId)) {
            return res.status(403).json({ 
                message: "Only project admins can perform this action" 
            });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: "Permission check failed" });
    }
};

// Check if user is project member
export const checkProjectMember = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;

        const project = await Project.findById(projectId);
        if (!project || !project.isUserMember(userId)) {
            return res.status(403).json({ 
                message: "You don't have access to this project" 
            });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: "Access check failed" });
    }
};
```

**Route Level - Permission Application**:
```javascript
// Admin-only routes
router.delete('/removeUser/:projectId', authUser, checkProjectAdmin, removeUserController);
router.put('/updateRole/:projectId', authUser, checkProjectAdmin, updateUserRoleController);
router.delete('/delete/:projectId', authUser, checkProjectAdmin, deleteProjectController);

// Member-accessible routes
router.get('/:projectId', authUser, checkProjectMember, getProjectByIdController);
router.get('/stats/:projectId', authUser, checkProjectMember, getProjectStatsController);
```

**Frontend Level - UI Permission Control**:
```javascript
// Conditional rendering based on user role
const ProjectSidebar = ({ currentProject, currentUser }) => {
    const isAdmin = currentProject.users.find(
        u => u.user._id === currentUser._id && u.role === 'admin'
    );

    return (
        <div>
            {/* All users can see member list */}
            <UserList users={currentProject.users} />
            
            {/* Only admins can manage users */}
            {isAdmin && (
                <>
                    <AddUserForm onAddUser={handleAddUser} />
                    <UserManagement 
                        users={currentProject.users}
                        onRemoveUser={handleRemoveUser}
                        onUpdateRole={handleUpdateRole}
                    />
                </>
            )}
        </div>
    );
};
```

**Permission Matrix**:
- **Admin**: Create/delete projects, manage users, modify settings, all member permissions
- **Member**: View project, edit code, participate in chat, run code

### Q15: How do you secure Socket.io connections and prevent unauthorized access?

**Answer**: Socket.io security involves multiple authentication and authorization layers:

**Connection Authentication**:
```javascript
// Client-side connection with token
const initializeSocket = (projectId) => {
    const token = localStorage.getItem('token');
    
    const socket = io(SOCKET_URL, {
        auth: { token: token },
        query: { projectId },
        transports: ['websocket', 'polling']  // Fallback support
    });
    
    return socket;
};
```

**Server-side Authentication Middleware**:
```javascript
io.use(async (socket, next) => {
    try {
        const projectId = socket.handshake.query.projectId;
        const authToken = socket.handshake.auth.token;
        
        // Validate inputs
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("Invalid projectId"));
        }
        
        if (!authToken) {
            return next(new Error("Auth token required"));
        }
        
        // Verify JWT
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        
        // Check token blacklist
        const blacklisted = await redisClient.get(authToken);
        if (blacklisted) {
            return next(new Error("Token blacklisted"));
        }
        
        // Validate project access
        const project = await Project.findById(projectId).populate("users.user");
        if (!project) {
            return next(new Error("Project not found"));
        }
        
        // Check user membership
        const isMember = project.users.some(u => 
            u.user._id.toString() === decoded.userId
        );
        if (!isMember) {
            return next(new Error("Access denied to project"));
        }
        
        // Attach validated data to socket
        socket.project = project;
        socket.user = decoded;
        socket.projectId = projectId;
        
        next();
    } catch (err) {
        console.error("Socket auth error:", err.message);
        return next(new Error("Authentication failed"));
    }
});
```

**Event-Level Authorization**:
```javascript
io.on("connection", (socket) => {
    const { projectId } = socket.handshake.query;
    
    // Join project-specific room
    socket.join(projectId);
    
    // Validate each event
    socket.on("project-message", async (data) => {
        try {
            // Validate message data
            if (!data.text || !data.senderEmail || data.projectId !== projectId) {
                socket.emit("error", { message: "Invalid message data" });
                return;
            }
            
            // Verify sender matches authenticated user
            if (data.senderEmail !== socket.user.email) {
                socket.emit("error", { message: "Sender mismatch" });
                return;
            }
            
            // Rate limiting (implement with Redis)
            const messageCount = await redisClient.incr(`messages:${socket.user.userId}:${Date.now()}`);
            if (messageCount > 10) {  // 10 messages per minute
                socket.emit("error", { message: "Rate limit exceeded" });
                return;
            }
            
            // Process valid message
            await Message.create(data);
            socket.to(projectId).emit("project-message", data);
            
        } catch (error) {
            socket.emit("error", { message: "Message processing failed" });
        }
    });
    
    // Handle file operations (admin only)
    socket.on("file-operation", async (data) => {
        if (!socket.project.isUserAdmin(socket.user.userId)) {
            socket.emit("error", { message: "Admin access required" });
            return;
        }
        
        // Process file operation
    });
});
```

**Security Best Practices**:

1. **CORS Configuration**:
```javascript
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(','),
        credentials: true,
        methods: ["GET", "POST"]
    }
});
```

2. **Rate Limiting**:
```javascript
// Redis-based rate limiting
const checkRateLimit = async (userId, action) => {
    const key = `rate_limit:${userId}:${action}`;
    const count = await redisClient.incr(key);
    
    if (count === 1) {
        await redisClient.expire(key, 60);  // 1 minute window
    }
    
    return count <= 10;  // 10 actions per minute
};
```

3. **Input Sanitization**:
```javascript
const sanitizeMessage = (message) => {
    return {
        text: validator.escape(message.text),
        senderEmail: validator.normalizeEmail(message.senderEmail),
        projectId: validator.isMongoId(message.projectId) ? message.projectId : null
    };
};
```

---

## AI Integration

### Q16: Explain how you integrate with Google Gemini AI and handle the responses.

**Answer**: Google Gemini integration is designed for reliable code generation with structured output parsing:

**AI Service Implementation**:
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateResult = async (prompt) => {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new Error("Prompt is required and must be a non-empty string.");
    }

    const instruction = `
        You are an expert React developer. Generate a complete, production-ready React project structure.
        
        IMPORTANT: Your response must be in this exact JSON format:
        
        \`\`\`json
        {
            "text": "Brief description of what you created",
            "fileTree": {
                "package.json": {
                    "file": {
                        "contents": "actual package.json content"
                    }
                },
                "src": {
                    "directory": {
                        "App.jsx": {
                            "file": {
                                "contents": "actual React component code"
                            }
                        }
                    }
                }
            },
            "buildCommand": {
                "mainItem": "npm",
                "commands": ["install"]
            },
            "startCommand": {
                "mainItem": "npm",
                "commands": ["run", "dev"]
            }
        }
        \`\`\`
        
        Requirements:
        - Every directory MUST have "directory" key
        - Every file MUST have "file" key with "contents" property
        - Include package.json with proper dependencies
        - Include vite.config.js for Vite setup
        - Include index.html as entry point
        - Focus on React applications with modern practices
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{
                role: "user",
                parts: [{ text: `${instruction}\n\n${prompt}` }],
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        });

        const content = response?.candidates?.[0]?.content;
        const text = content?.parts?.[0]?.text ?? 
                    content?.text ?? 
                    "⚠️ Gemini returned an unexpected format. Try again.";
        
        return text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error(`AI service unavailable: ${error.message}`);
    }
};
```

**Response Processing on Frontend**:
```javascript
export const extractTextFromJsonMarkdown = (input) => {
    // Extract JSON from markdown code blocks
    const match = input.match(/```json\s*([\s\S]*?)\s*```/);

    if (!match) {
        return { text: input }; // Fallback for non-JSON responses
    }

    try {
        const parsed = JSON.parse(match[1]);
        
        // Validate required structure
        if (!parsed.fileTree) {
            throw new Error("Missing fileTree in AI response");
        }
        
        // Validate WebContainer compatibility
        validateFileTreeStructure(parsed.fileTree);
        
        return {
            text: parsed.text || "AI generated project",
            fileTree: parsed.fileTree,
            buildCommand: parsed.buildCommand || { mainItem: "npm", commands: ["install"] },
            startCommand: parsed.startCommand || { mainItem: "npm", commands: ["run", "dev"] },
        };
    } catch (err) {
        console.error("Invalid JSON from AI:", err);
        return { 
            text: input,
            error: "Failed to parse AI response structure"
        };
    }
};

// Validate WebContainer file structure
const validateFileTreeStructure = (tree) => {
    const validateNode = (node, path = "") => {
        if (node.file) {
            if (!node.file.contents) {
                throw new Error(`File at ${path} missing contents`);
            }
        } else if (node.directory) {
            Object.entries(node.directory).forEach(([name, child]) => {
                validateNode(child, `${path}/${name}`);
            });
        } else {
            throw new Error(`Invalid node structure at ${path}`);
        }
    };
    
    Object.entries(tree).forEach(([name, node]) => {
        validateNode(node, name);
    });
};
```

**Error Handling and Fallbacks**:
```javascript
// AI Controller with comprehensive error handling
export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }
        
        // Rate limiting check
        const userId = req.user.userId;
        const rateLimitKey = `ai_requests:${userId}`;
        const requestCount = await redisClient.incr(rateLimitKey);
        
        if (requestCount === 1) {
            await redisClient.expire(rateLimitKey, 3600); // 1 hour window
        }
        
        if (requestCount > 10) { // 10 requests per hour
            return res.status(429).json({
                success: false,
                message: "AI request limit exceeded. Try again later."
            });
        }
        
        const result = await generateResult(prompt);
        
        res.status(200).json({
            success: true,
            result: result
        });
        
    } catch (error) {
        console.error("AI generation error:", error);
        
        // Provide helpful error messages
        if (error.message.includes("quota")) {
            return res.status(503).json({
                success: false,
                message: "AI service temporarily unavailable. Please try again later."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to generate AI response",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
```

### Q17: How do you handle AI service failures and implement fallback mechanisms?

**Answer**: AI service reliability requires comprehensive error handling and graceful degradation:

**Retry Logic with Exponential Backoff**:
```javascript
const generateResultWithRetry = async (prompt, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generateResult(prompt);
        } catch (error) {
            lastError = error;
            
            // Don't retry on client errors
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`AI request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms`);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
};
```

**Circuit Breaker Pattern**:
```javascript
class AIServiceCircuitBreaker {
    constructor() {
        this.failureCount = 0;
        this.failureThreshold = 5;
        this.resetTimeout = 60000; // 1 minute
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.nextAttempt = Date.now();
    }
    
    async call(prompt) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('AI service circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
        }
        
        try {
            const result = await generateResultWithRetry(prompt);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
        }
    }
}

const aiCircuitBreaker = new AIServiceCircuitBreaker();
```

**Fallback Mechanisms**:
```javascript
// Template-based fallback
const projectTemplates = {
    'react-basic': {
        text: "Created a basic React application template",
        fileTree: {
            "package.json": {
                file: {
                    contents: JSON.stringify({
                        name: "react-app",
                        version: "1.0.0",
                        dependencies: {
                            "react": "^18.0.0",
                            "react-dom": "^18.0.0"
                        }
                    }, null, 2)
                }
            },
            // ... more template files
        },
        buildCommand: { mainItem: "npm", commands: ["install"] },
        startCommand: { mainItem: "npm", commands: ["run", "dev"] }
    }
};

const generateWithFallback = async (prompt) => {
    try {
        return await aiCircuitBreaker.call(prompt);
    } catch (error) {
        console.error("AI service failed, using fallback:", error);
        
        // Analyze prompt to select appropriate template
        const templateKey = selectTemplate(prompt);
        const template = projectTemplates[templateKey];
        
        if (template) {
            return JSON.stringify(template);
        }
        
        throw new Error("AI service unavailable and no suitable template found");
    }
};

const selectTemplate = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('react')) return 'react-basic';
    if (lowerPrompt.includes('vue')) return 'vue-basic';
    if (lowerPrompt.includes('angular')) return 'angular-basic';
    
    return 'react-basic'; // Default fallback
};
```

**Caching Strategy**:
```javascript
// Cache successful AI responses
const getCachedOrGenerate = async (prompt) => {
    const cacheKey = `ai_response:${crypto.createHash('md5').update(prompt).digest('hex')}`;
    
    // Check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log('Returning cached AI response');
        return cached;
    }
    
    // Generate new response
    const result = await generateWithFallback(prompt);
    
    // Cache for 1 hour
    await redisClient.setex(cacheKey, 3600, result);
    
    return result;
};
```

**User Experience During Failures**:
```javascript
// Frontend error handling
const handleAIRequest = async (prompt) => {
    setIsAiThinking(true);
    setAiError(null);
    
    try {
        const response = await axiosInstance.get(`/api/get-result?prompt=${encodeURIComponent(prompt)}`);
        return response.data.result;
    } catch (error) {
        let errorMessage = "AI service is temporarily unavailable";
        
        if (error.response?.status === 429) {
            errorMessage = "You've reached the AI request limit. Please try again later.";
        } else if (error.response?.status === 503) {
            errorMessage = "AI service is under maintenance. Using template instead.";
        }
        
        setAiError(errorMessage);
        
        // Show fallback options to user
        setShowTemplateOptions(true);
        
        throw new Error(errorMessage);
    } finally {
        setIsAiThinking(false);
    }
};
```

### Q18: How do you ensure the AI-generated code is secure and follows best practices?

**Answer**: AI-generated code security requires multiple validation layers and sanitization:

**Content Validation and Sanitization**:
```javascript
const validateAndSanitizeAIResponse = (aiResponse) => {
    try {
        const parsed = JSON.parse(aiResponse);
        
        // Validate structure
        if (!parsed.fileTree || typeof parsed.fileTree !== 'object') {
            throw new Error('Invalid file tree structure');
        }
        
        // Sanitize file contents
        const sanitizedFileTree = sanitizeFileTree(parsed.fileTree);
        
        return {
            ...parsed,
            fileTree: sanitizedFileTree
        };
    } catch (error) {
        throw new Error(`AI response validation failed: ${error.message}`);
    }
};

const sanitizeFileTree = (tree) => {
    const sanitizeNode = (node) => {
        if (node.file) {
            return {
                file: {
                    contents: sanitizeFileContent(node.file.contents)
                }
            };
        } else if (node.directory) {
            const sanitizedDir = {};
            Object.entries(node.directory).forEach(([name, child]) => {
                const sanitizedName = sanitizeFileName(name);
                sanitizedDir[sanitizedName] = sanitizeNode(child);
            });
            return { directory: sanitizedDir };
        }
        throw new Error('Invalid node structure');
    };
    
    const sanitized = {};
    Object.entries(tree).forEach(([name, node]) => {
        const sanitizedName = sanitizeFileName(name);
        sanitized[sanitizedName] = sanitizeNode(node);
    });
    
    return sanitized;
};
```

**Security Checks for Generated Code**:
```javascript
const sanitizeFileContent = (content) => {
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
        /eval\s*\(/gi,                    // eval() calls
        /Function\s*\(/gi,                // Function constructor
        /document\.write/gi,              // document.write
        /innerHTML\s*=/gi,                // innerHTML assignments
        /outerHTML\s*=/gi,                // outerHTML assignments
        /javascript:/gi,                  // javascript: URLs
        /on\w+\s*=/gi,                   // event handlers in HTML
        /<script[^>]*>/gi,               // script tags
        /import\s+.*\s+from\s+['"][^'"]*node_modules/gi, // suspicious imports
    ];
    
    let sanitized = content;
    
    dangerousPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '/* REMOVED_UNSAFE_CODE */');
    });
    
    // Validate package.json dependencies
    if (content.includes('"dependencies"') || content.includes('"devDependencies"')) {
        sanitized = sanitizePackageJson(sanitized);
    }
    
    return sanitized;
};

const sanitizePackageJson = (packageJsonContent) => {
    try {
        const pkg = JSON.parse(packageJsonContent);
        
        // Whitelist of allowed packages
        const allowedPackages = [
            'react', 'react-dom', 'react-router-dom',
            'vue', 'vue-router', 'vuex',
            'angular', '@angular/core', '@angular/common',
            'lodash', 'axios', 'moment',
            'tailwindcss', 'bootstrap',
            'vite', 'webpack', 'babel',
            // ... more allowed packages
        ];
        
        // Filter dependencies
        if (pkg.dependencies) {
            pkg.dependencies = filterDependencies(pkg.dependencies, allowedPackages);
        }
        
        if (pkg.devDependencies) {
            pkg.devDependencies = filterDependencies(pkg.devDependencies, allowedPackages);
        }
        
        // Remove scripts that could be dangerous
        if (pkg.scripts) {
            pkg.scripts = sanitizeScripts(pkg.scripts);
        }
        
        return JSON.stringify(pkg, null, 2);
    } catch (error) {
        // Return basic package.json if parsing fails
        return JSON.stringify({
            name: "sanitized-project",
            version: "1.0.0",
            dependencies: {
                "react": "^18.0.0",
                "react-dom": "^18.0.0"
            }
        }, null, 2);
    }
};

const filterDependencies = (deps, allowedPackages) => {
    const filtered = {};
    Object.entries(deps).forEach(([name, version]) => {
        if (allowedPackages.some(allowed => name.startsWith(allowed))) {
            // Validate version format
            if (/^[\^~]?\d+\.\d+\.\d+/.test(version)) {
                filtered[name] = version;
            }
        }
    });
    return filtered;
};

const sanitizeScripts = (scripts) => {
    const allowedScripts = {
        'dev': 'vite',
        'build': 'vite build',
        'preview': 'vite preview',
        'start': 'react-scripts start',
        'test': 'react-scripts test'
    };
    
    const sanitized = {};
    Object.entries(scripts).forEach(([name, command]) => {
        if (allowedScripts[name] && command === allowedScripts[name]) {
            sanitized[name] = command;
        }
    });
    
    return sanitized;
};
```

**File Name and Path Validation**:
```javascript
const sanitizeFileName = (fileName) => {
    // Remove dangerous characters and patterns
    let sanitized = fileName
        .replace(/[<>:"|?*]/g, '') // Windows forbidden chars
        .replace(/\.\./g, '')      // Directory traversal
        .replace(/^\./, '')        // Hidden files
        .replace(/\s+/g, '-')      // Spaces to dashes
        .toLowerCase();
    
    // Ensure valid file extension
    const allowedExtensions = [
        '.js', '.jsx', '.ts', '.tsx',
        '.vue', '.html', '.css', '.scss',
        '.json', '.md', '.txt'
    ];
    
    const hasValidExtension = allowedExtensions.some(ext => 
        sanitized.endsWith(ext)
    );
    
    if (!hasValidExtension && !sanitized.includes('.')) {
        // Assume it's a directory if no extension
        return sanitized;
    }
    
    if (!hasValidExtension) {
        // Add .txt extension for safety
        sanitized += '.txt';
    }
    
    return sanitized;
};
```

**Runtime Security in WebContainers**:
```javascript
// WebContainer security configuration
const secureWebContainerMount = async (fileTree) => {
    // Validate total file size
    const totalSize = calculateFileTreeSize(fileTree);
    if (totalSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Generated project exceeds size limit');
    }
    
    // Count files
    const fileCount = countFiles(fileTree);
    if (fileCount > 100) { // 100 files limit
        throw new Error('Generated project has too many files');
    }
    
    // Mount with restrictions
    const webContainer = await getWebContainer();
    await webContainer.mount(fileTree);
    
    // Set resource limits
    webContainer.setResourceLimits({
        memory: '512MB',
        cpu: '50%',
        timeout: 30000 // 30 seconds
    });
    
    return webContainer;
};

const calculateFileTreeSize = (tree) => {
    let size = 0;
    
    const traverse = (node) => {
        if (node.file) {
            size += node.file.contents.length;
        } else if (node.directory) {
            Object.values(node.directory).forEach(traverse);
        }
    };
    
    Object.values(tree).forEach(traverse);
    return size;
};
```

**Monitoring and Logging**:
```javascript
// Log AI-generated content for security review
const logAIGeneration = async (userId, prompt, response, sanitized) => {
    const logEntry = {
        userId,
        timestamp: new Date(),
        prompt: prompt.substring(0, 500), // Truncate for storage
        responseSize: response.length,
        sanitizationApplied: response !== sanitized,
        fileCount: countFiles(JSON.parse(sanitized).fileTree),
        ipAddress: req.ip
    };
    
    // Store in audit log
    await AuditLog.create(logEntry);
    
    // Alert on suspicious patterns
    if (logEntry.sanitizationApplied) {
        console.warn('AI response required sanitization:', logEntry);
    }
};
```

This comprehensive security approach ensures that AI-generated code is safe to execute while maintaining functionality and user experience.

---

## Real-time Collaboration

### Q19: How do you handle real-time synchronization of file changes across multiple users?

**Answer**: Real-time file synchronization requires careful coordination between WebContainers, Socket.io, and state management:

**Current Implementation - Message-Based Sync**:
```javascript
// When AI generates new files
const handleMessageReceived = useCallback((msg) => {
    if (msg.senderEmail === "@Ai") {
        setIsAiThinking(false);

        // Extract file tree from AI response
        const { fileTree } = extractTextFromJsonMarkdown(msg.text);
        if (fileTree) {
            // Update all connected users' file trees
            setFileTrees(fileTree);

            // Remount WebContainer with new files
            if (webContainer) {
                webContainer.mount(fileTree);
            }
        }
    }
    addMessage(msg);
}, [addMessage, webContainer]);
```

**Enhanced Real-time File Editing (Planned)**:
```javascript
// Operational Transformation for collaborative editing
class FileOperationTransform {
    constructor() {
        this.operations = [];
        this.version = 0;
    }

    // Transform operation against concurrent operations
    transform(operation, concurrentOps) {
        let transformedOp = { ...operation };

        concurrentOps.forEach(concurrentOp => {
            if (concurrentOp.type === 'insert' && operation.type === 'insert') {
                if (concurrentOp.position <= transformedOp.position) {
                    transformedOp.position += concurrentOp.content.length;
                }
            } else if (concurrentOp.type === 'delete' && operation.type === 'insert') {
                if (concurrentOp.position < transformedOp.position) {
                    transformedOp.position -= concurrentOp.length;
                }
            }
            // More transformation rules...
        });

        return transformedOp;
    }

    // Apply operation to document
    apply(document, operation) {
        switch (operation.type) {
            case 'insert':
                return document.slice(0, operation.position) +
                       operation.content +
                       document.slice(operation.position);
            case 'delete':
                return document.slice(0, operation.position) +
                       document.slice(operation.position + operation.length);
            default:
                return document;
        }
    }
}

// Real-time file editing hook
const useCollaborativeEditor = (fileId, initialContent) => {
    const [content, setContent] = useState(initialContent);
    const [operations, setOperations] = useState([]);
    const [version, setVersion] = useState(0);
    const socketRef = useRef();

    const sendOperation = useCallback((operation) => {
        const opWithVersion = {
            ...operation,
            fileId,
            version,
            userId: user.id,
            timestamp: Date.now()
        };

        socketRef.current.emit('file-operation', opWithVersion);
        setOperations(prev => [...prev, opWithVersion]);
    }, [fileId, version, user.id]);

    const handleRemoteOperation = useCallback((remoteOp) => {
        if (remoteOp.fileId !== fileId) return;

        // Transform against pending operations
        const transformer = new FileOperationTransform();
        const pendingOps = operations.filter(op => op.version > remoteOp.version);
        const transformedOp = transformer.transform(remoteOp, pendingOps);

        // Apply to content
        setContent(prev => transformer.apply(prev, transformedOp));
        setVersion(remoteOp.version + 1);
    }, [fileId, operations]);

    useEffect(() => {
        socketRef.current.on('file-operation', handleRemoteOperation);
        return () => socketRef.current.off('file-operation', handleRemoteOperation);
    }, [handleRemoteOperation]);

    return { content, sendOperation };
};
```

**Conflict Resolution Strategy**:
```javascript
// Server-side operation ordering and conflict resolution
const handleFileOperation = async (socket, operation) => {
    try {
        // Validate operation
        if (!operation.fileId || !operation.type) {
            socket.emit('operation-error', { message: 'Invalid operation' });
            return;
        }

        // Get current file state
        const fileState = await FileState.findOne({
            fileId: operation.fileId,
            projectId: socket.projectId
        });

        if (!fileState) {
            socket.emit('operation-error', { message: 'File not found' });
            return;
        }

        // Check version for conflict detection
        if (operation.version < fileState.version) {
            // Operation is based on old version, needs transformation
            const missedOps = await FileOperation.find({
                fileId: operation.fileId,
                version: { $gt: operation.version, $lte: fileState.version }
            }).sort({ version: 1 });

            // Transform operation against missed operations
            const transformer = new FileOperationTransform();
            const transformedOp = transformer.transform(operation, missedOps);
            operation = transformedOp;
        }

        // Apply operation
        const newContent = transformer.apply(fileState.content, operation);

        // Update file state
        await FileState.findOneAndUpdate(
            { fileId: operation.fileId },
            {
                content: newContent,
                version: fileState.version + 1,
                lastModified: new Date()
            }
        );

        // Store operation for history
        await FileOperation.create({
            ...operation,
            version: fileState.version + 1,
            projectId: socket.projectId
        });

        // Broadcast to all users in project
        socket.to(socket.projectId).emit('file-operation', {
            ...operation,
            version: fileState.version + 1
        });

    } catch (error) {
        console.error('File operation error:', error);
        socket.emit('operation-error', { message: 'Operation failed' });
    }
};
```

### Q20: How do you handle user presence and awareness in collaborative sessions?

**Answer**: User presence and awareness enhance the collaborative experience by showing who's online and what they're working on:

**User Presence Tracking**:
```javascript
// Server-side presence management
const userPresence = new Map(); // userId -> presence data

io.on('connection', (socket) => {
    const { projectId } = socket.handshake.query;
    const userId = socket.user.userId;

    // Add user to presence
    userPresence.set(userId, {
        userId,
        email: socket.user.email,
        projectId,
        socketId: socket.id,
        joinedAt: new Date(),
        lastSeen: new Date(),
        currentFile: null,
        cursor: null
    });

    // Broadcast user joined
    socket.to(projectId).emit('user-joined', {
        userId,
        email: socket.user.email,
        joinedAt: new Date()
    });

    // Send current online users to new user
    const onlineUsers = Array.from(userPresence.values())
        .filter(user => user.projectId === projectId && user.userId !== userId);
    socket.emit('online-users', onlineUsers);

    // Handle presence updates
    socket.on('presence-update', (data) => {
        const presence = userPresence.get(userId);
        if (presence) {
            Object.assign(presence, {
                ...data,
                lastSeen: new Date()
            });

            // Broadcast presence update
            socket.to(projectId).emit('presence-update', {
                userId,
                ...data
            });
        }
    });

    // Handle file focus changes
    socket.on('file-focus', (data) => {
        const presence = userPresence.get(userId);
        if (presence) {
            presence.currentFile = data.fileId;
            presence.cursor = data.cursor;

            socket.to(projectId).emit('user-file-focus', {
                userId,
                fileId: data.fileId,
                cursor: data.cursor
            });
        }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        userPresence.delete(userId);
        socket.to(projectId).emit('user-left', { userId });
    });
});
```

**Frontend Presence UI**:
```javascript
// User presence hook
const useUserPresence = (projectId) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [userActivities, setUserActivities] = useState(new Map());
    const socketRef = useRef();

    useEffect(() => {
        if (!projectId) return;

        const socket = initializeSocket(projectId);
        socketRef.current = socket;

        // Handle presence events
        socket.on('online-users', (users) => {
            setOnlineUsers(users);
        });

        socket.on('user-joined', (user) => {
            setOnlineUsers(prev => [...prev, user]);
            toast.success(`${user.email} joined the project`);
        });

        socket.on('user-left', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
            setUserActivities(prev => {
                const updated = new Map(prev);
                updated.delete(userId);
                return updated;
            });
        });

        socket.on('presence-update', ({ userId, ...activity }) => {
            setUserActivities(prev => {
                const updated = new Map(prev);
                updated.set(userId, activity);
                return updated;
            });
        });

        socket.on('user-file-focus', ({ userId, fileId, cursor }) => {
            setUserActivities(prev => {
                const updated = new Map(prev);
                const current = updated.get(userId) || {};
                updated.set(userId, {
                    ...current,
                    currentFile: fileId,
                    cursor
                });
                return updated;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [projectId]);

    // Send presence updates
    const updatePresence = useCallback((activity) => {
        socketRef.current?.emit('presence-update', activity);
    }, []);

    const updateFileFocus = useCallback((fileId, cursor) => {
        socketRef.current?.emit('file-focus', { fileId, cursor });
    }, []);

    return {
        onlineUsers,
        userActivities,
        updatePresence,
        updateFileFocus
    };
};

// Presence indicator component
const UserPresenceIndicator = ({ projectId }) => {
    const { onlineUsers, userActivities } = useUserPresence(projectId);

    return (
        <div className="presence-indicator">
            <h4>Online Users ({onlineUsers.length})</h4>
            {onlineUsers.map(user => {
                const activity = userActivities.get(user.userId);
                return (
                    <div key={user.userId} className="user-presence-item">
                        <div className="user-avatar">
                            <img src={getAvatarUrl(user.email)} alt={user.email} />
                            <div className="online-indicator" />
                        </div>
                        <div className="user-info">
                            <span className="user-email">{user.email}</span>
                            {activity?.currentFile && (
                                <span className="user-activity">
                                    Editing: {activity.currentFile}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
```

**Cursor and Selection Sharing**:
```javascript
// Enhanced Monaco editor with collaborative cursors
const CollaborativeCodeEditor = ({ fileId, content, onChange }) => {
    const [decorations, setDecorations] = useState([]);
    const editorRef = useRef();
    const { updateFileFocus } = useUserPresence();

    // Handle cursor position changes
    const handleCursorChange = useCallback((e) => {
        const position = e.position;
        const selection = e.selection;

        updateFileFocus(fileId, {
            line: position.lineNumber,
            column: position.column,
            selection: {
                startLine: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLine: selection.endLineNumber,
                endColumn: selection.endColumn
            }
        });
    }, [fileId, updateFileFocus]);

    // Render other users' cursors
    useEffect(() => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const newDecorations = [];

        userActivities.forEach((activity, userId) => {
            if (activity.currentFile === fileId && activity.cursor) {
                const user = onlineUsers.find(u => u.userId === userId);
                if (user) {
                    // Add cursor decoration
                    newDecorations.push({
                        range: new monaco.Range(
                            activity.cursor.line,
                            activity.cursor.column,
                            activity.cursor.line,
                            activity.cursor.column
                        ),
                        options: {
                            className: `cursor-${userId}`,
                            hoverMessage: { value: `${user.email}'s cursor` }
                        }
                    });

                    // Add selection decoration if exists
                    if (activity.cursor.selection) {
                        const sel = activity.cursor.selection;
                        newDecorations.push({
                            range: new monaco.Range(
                                sel.startLine,
                                sel.startColumn,
                                sel.endLine,
                                sel.endColumn
                            ),
                            options: {
                                className: `selection-${userId}`,
                                hoverMessage: { value: `${user.email}'s selection` }
                            }
                        });
                    }
                }
            }
        });

        // Apply decorations
        const decorationIds = editor.deltaDecorations(decorations, newDecorations);
        setDecorations(decorationIds);

    }, [userActivities, onlineUsers, fileId]);

    return (
        <Editor
            value={content}
            onChange={onChange}
            onMount={(editor) => {
                editorRef.current = editor;
                editor.onDidChangeCursorPosition(handleCursorChange);
                editor.onDidChangeCursorSelection(handleCursorChange);
            }}
            options={{
                // ... other options
                renderLineHighlight: 'all',
                selectionHighlight: false // Disable default selection highlight
            }}
        />
    );
};
```

### Q21: How do you handle message persistence and cleanup in the chat system?

**Answer**: Message persistence balances functionality with storage efficiency using MongoDB TTL and strategic cleanup:

**TTL-Based Message Cleanup**:
```javascript
// Message schema with automatic expiration
const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    senderEmail: { type: String, required: true },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,  // TTL: 10 minutes (600 seconds)
    },
    messageType: {
        type: String,
        enum: ['user', 'ai', 'system'],
        default: 'user'
    },
    metadata: {
        fileTree: Object,  // Store AI-generated file trees
        buildCommand: Object,
        startCommand: Object
    }
});

// Index for efficient queries
messageSchema.index({ projectId: 1, createdAt: -1 });
messageSchema.index({ createdAt: 1 }); // TTL index
```

**Strategic Message Archival**:
```javascript
// Archive important messages before TTL expiration
const archiveImportantMessages = async () => {
    try {
        // Find AI messages with file trees (important for project state)
        const importantMessages = await Message.find({
            senderEmail: '@Ai',
            'metadata.fileTree': { $exists: true },
            createdAt: {
                $gte: new Date(Date.now() - 9 * 60 * 1000), // 9 minutes ago
                $lte: new Date(Date.now() - 8 * 60 * 1000)  // 8 minutes ago
            }
        });

        // Archive to separate collection
        if (importantMessages.length > 0) {
            await ArchivedMessage.insertMany(
                importantMessages.map(msg => ({
                    ...msg.toObject(),
                    archivedAt: new Date(),
                    originalId: msg._id
                }))
            );

            console.log(`Archived ${importantMessages.length} important messages`);
        }
    } catch (error) {
        console.error('Message archival failed:', error);
    }
};

// Run archival job every minute
setInterval(archiveImportantMessages, 60 * 1000);
```

**Message Loading Strategy**:
```javascript
// Load messages with pagination and caching
const loadProjectMessages = async (projectId, page = 1, limit = 50) => {
    try {
        // Check Redis cache first
        const cacheKey = `messages:${projectId}:${page}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        // Load from database
        const messages = await Message.find({ projectId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        // Reverse for chronological order
        const chronologicalMessages = messages.reverse();

        // Cache for 1 minute (shorter than TTL)
        await redisClient.setex(cacheKey, 60, JSON.stringify(chronologicalMessages));

        return chronologicalMessages;
    } catch (error) {
        console.error('Failed to load messages:', error);
        return [];
    }
};

// Frontend message loading with infinite scroll
const useProjectMessages = (projectId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const loadMessages = useCallback(async (pageNum = 1, append = false) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/messages/${projectId}?page=${pageNum}&limit=50`
            );

            const newMessages = response.data.messages;

            if (append) {
                setMessages(prev => [...newMessages, ...prev]);
            } else {
                setMessages(newMessages);
            }

            setHasMore(newMessages.length === 50);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, loading]);

    // Load more messages (infinite scroll)
    const loadMoreMessages = useCallback(() => {
        if (hasMore && !loading) {
            loadMessages(page + 1, true);
        }
    }, [hasMore, loading, page, loadMessages]);

    // Initial load
    useEffect(() => {
        if (projectId) {
            loadMessages(1, false);
        }
    }, [projectId, loadMessages]);

    return {
        messages,
        loading,
        hasMore,
        loadMoreMessages,
        addMessage: (message) => setMessages(prev => [...prev, message])
    };
};
```

**Message Cleanup and Optimization**:
```javascript
// Cleanup orphaned messages and optimize storage
const cleanupMessages = async () => {
    try {
        // Remove messages from deleted projects
        const deletedProjectMessages = await Message.aggregate([
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            {
                $match: { project: { $size: 0 } }
            }
        ]);

        if (deletedProjectMessages.length > 0) {
            const messageIds = deletedProjectMessages.map(msg => msg._id);
            await Message.deleteMany({ _id: { $in: messageIds } });
            console.log(`Cleaned up ${messageIds.length} orphaned messages`);
        }

        // Compress old archived messages
        await ArchivedMessage.updateMany(
            {
                archivedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                compressed: { $ne: true }
            },
            {
                $set: {
                    text: '[Message archived and compressed]',
                    compressed: true
                }
            }
        );

    } catch (error) {
        console.error('Message cleanup failed:', error);
    }
};

// Run cleanup daily
setInterval(cleanupMessages, 24 * 60 * 60 * 1000);
```

---

## Performance & Scalability

### Q22: How would you optimize the application for 10,000+ concurrent users?

**Answer**: Scaling to 10,000+ concurrent users requires architectural changes across all layers:

**Horizontal Scaling Strategy**:
```javascript
// Load balancer configuration (nginx)
upstream codecraft_backend {
    least_conn;
    server backend1:3000 weight=3;
    server backend2:3000 weight=3;
    server backend3:3000 weight=2;
    keepalive 32;
}

server {
    listen 80;
    location / {
        proxy_pass http://codecraft_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Socket.io Clustering with Redis**:
```javascript
// Redis adapter for Socket.io clustering
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({
    url: process.env.REDIS_URL,
    retry_strategy: (options) => Math.min(options.attempt * 100, 3000)
});
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));

// Sticky sessions for WebSocket connections
const sessionAffinity = (req) => {
    const userId = req.user?.userId;
    if (userId) {
        // Hash user ID to determine server
        return crypto.createHash('md5').update(userId).digest('hex').slice(0, 8);
    }
    return Math.random().toString(36).substring(7);
};
```

**Database Optimization**:
```javascript
// Read replicas and connection pooling
const primaryDB = mongoose.createConnection(process.env.MONGO_PRIMARY_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
});

const readDB = mongoose.createConnection(process.env.MONGO_READ_REPLICA_URI, {
    maxPoolSize: 100,
    minPoolSize: 10,
    readPreference: 'secondary',
});

// Separate models for read/write operations
const UserWrite = primaryDB.model('User', userSchema);
const UserRead = readDB.model('User', userSchema);

// Service layer with read/write separation
export const getUserById = async (id) => {
    return await UserRead.findById(id).lean();
};

export const createUser = async (userData) => {
    return await UserWrite.create(userData);
};
```

**Caching Strategy**:
```javascript
// Multi-layer caching
class CacheManager {
    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
        this.memoryCache = new Map();
        this.maxMemoryItems = 1000;
    }

    async get(key) {
        // L1: Memory cache
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key);
        }

        // L2: Redis cache
        const redisValue = await this.redis.get(key);
        if (redisValue) {
            const parsed = JSON.parse(redisValue);
            this.setMemoryCache(key, parsed);
            return parsed;
        }

        return null;
    }

    async set(key, value, ttl = 3600) {
        // Set in both caches
        this.setMemoryCache(key, value);
        await this.redis.setex(key, ttl, JSON.stringify(value));
    }

    setMemoryCache(key, value) {
        if (this.memoryCache.size >= this.maxMemoryItems) {
            // LRU eviction
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(key, value);
    }
}

const cache = new CacheManager();

// Cached project retrieval
export const getProjectCached = async (projectId) => {
    const cacheKey = `project:${projectId}`;

    let project = await cache.get(cacheKey);
    if (!project) {
        project = await Project.findById(projectId).populate('users.user', 'email').lean();
        if (project) {
            await cache.set(cacheKey, project, 1800); // 30 minutes
        }
    }

    return project;
};
```

**Microservices Architecture**:
```javascript
// API Gateway with rate limiting
import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            client: redisClient,
            prefix: 'rl:'
        })
    });
};

// Different limits for different endpoints
app.use('/api/ai', createRateLimiter(60 * 1000, 10, 'AI request limit exceeded'));
app.use('/api/project', createRateLimiter(60 * 1000, 100, 'Project API limit exceeded'));
app.use('/api/user', createRateLimiter(60 * 1000, 50, 'User API limit exceeded'));

// Service discovery and health checks
const services = {
    user: ['http://user-service-1:3001', 'http://user-service-2:3001'],
    project: ['http://project-service-1:3002', 'http://project-service-2:3002'],
    ai: ['http://ai-service-1:3003', 'http://ai-service-2:3003']
};

const getHealthyService = async (serviceName) => {
    const serviceUrls = services[serviceName];

    for (const url of serviceUrls) {
        try {
            const response = await axios.get(`${url}/health`, { timeout: 1000 });
            if (response.status === 200) {
                return url;
            }
        } catch (error) {
            console.warn(`Service ${url} is unhealthy`);
        }
    }

    throw new Error(`No healthy ${serviceName} service available`);
};
```

### Q23: What are the main performance bottlenecks and how do you address them?

**Answer**: Performance bottlenecks exist at multiple layers, each requiring specific optimization strategies:

**Database Query Optimization**:
```javascript
// Problem: N+1 queries when loading projects with users
// Bad approach:
const projects = await Project.find({ 'users.user': userId });
for (const project of projects) {
    project.users = await User.find({ _id: { $in: project.users.map(u => u.user) } });
}

// Optimized approach:
const projects = await Project.find({ 'users.user': userId })
    .populate({
        path: 'users.user',
        select: 'email',
        options: { lean: true }
    })
    .lean();

// Aggregation for complex queries
const getProjectStats = async (projectId) => {
    return await Project.aggregate([
        { $match: { _id: new ObjectId(projectId) } },
        {
            $lookup: {
                from: 'messages',
                localField: '_id',
                foreignField: 'projectId',
                as: 'messages'
            }
        },
        {
            $project: {
                name: 1,
                userCount: { $size: '$users' },
                messageCount: { $size: '$messages' },
                lastActivity: { $max: '$messages.createdAt' }
            }
        }
    ]);
};
```

**Frontend Performance Optimization**:
```javascript
// React performance optimizations
import { memo, useMemo, useCallback, lazy, Suspense } from 'react';

// Lazy loading for large components
const CodeEditor = lazy(() => import('./CodeEditor'));
const ProjectRunner = lazy(() => import('./ProjectRunner'));

// Memoized components to prevent unnecessary re-renders
const FileTreeNode = memo(({ node, path, onFileSelect }) => {
    const handleClick = useCallback(() => {
        onFileSelect(path);
    }, [path, onFileSelect]);

    return (
        <div onClick={handleClick}>
            {node.name}
        </div>
    );
});

// Virtualized lists for large file trees
import { FixedSizeList as List } from 'react-window';

const VirtualizedFileTree = ({ files, onFileSelect }) => {
    const Row = useCallback(({ index, style }) => {
        const file = files[index];
        return (
            <div style={style}>
                <FileTreeNode
                    node={file}
                    onFileSelect={onFileSelect}
                />
            </div>
        );
    }, [files, onFileSelect]);

    return (
        <List
            height={600}
            itemCount={files.length}
            itemSize={25}
        >
            {Row}
        </List>
    );
};

// Debounced file saves
const useDebouncedFileSave = (file, delay = 1000) => {
    const [pendingChanges, setPendingChanges] = useState(false);

    const debouncedSave = useMemo(
        () => debounce(async (fileData) => {
            try {
                await saveFile(fileData);
                setPendingChanges(false);
            } catch (error) {
                console.error('Save failed:', error);
            }
        }, delay),
        [delay]
    );

    const saveFile = useCallback((fileData) => {
        setPendingChanges(true);
        debouncedSave(fileData);
    }, [debouncedSave]);

    return { saveFile, pendingChanges };
};
```

**WebContainer Performance**:
```javascript
// WebContainer instance pooling
class WebContainerPool {
    constructor(maxSize = 5) {
        this.pool = [];
        this.maxSize = maxSize;
        this.activeContainers = new Map();
    }

    async getContainer(projectId) {
        // Check if project already has a container
        if (this.activeContainers.has(projectId)) {
            return this.activeContainers.get(projectId);
        }

        // Get from pool or create new
        let container;
        if (this.pool.length > 0) {
            container = this.pool.pop();
            await container.reset(); // Clear previous state
        } else {
            container = await WebContainer.boot();
        }

        this.activeContainers.set(projectId, container);
        return container;
    }

    releaseContainer(projectId) {
        const container = this.activeContainers.get(projectId);
        if (container) {
            this.activeContainers.delete(projectId);

            if (this.pool.length < this.maxSize) {
                this.pool.push(container);
            } else {
                container.teardown();
            }
        }
    }

    // Cleanup inactive containers
    cleanup() {
        const now = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutes

        for (const [projectId, container] of this.activeContainers) {
            if (now - container.lastUsed > timeout) {
                this.releaseContainer(projectId);
            }
        }
    }
}

const containerPool = new WebContainerPool();

// Cleanup every 10 minutes
setInterval(() => containerPool.cleanup(), 10 * 60 * 1000);
```

**Socket.io Performance**:
```javascript
// Connection management and optimization
class SocketManager {
    constructor() {
        this.connections = new Map();
        this.rooms = new Map();
        this.messageQueue = new Map();
    }

    // Batch message processing
    addToQueue(roomId, message) {
        if (!this.messageQueue.has(roomId)) {
            this.messageQueue.set(roomId, []);

            // Process queue after short delay
            setTimeout(() => this.processQueue(roomId), 100);
        }

        this.messageQueue.get(roomId).push(message);
    }

    processQueue(roomId) {
        const messages = this.messageQueue.get(roomId);
        if (messages && messages.length > 0) {
            // Send batched messages
            io.to(roomId).emit('message-batch', messages);
            this.messageQueue.delete(roomId);
        }
    }

    // Connection throttling
    async handleConnection(socket) {
        const userId = socket.user.userId;
        const existingConnections = this.getConnectionCount(userId);

        if (existingConnections >= 5) { // Max 5 connections per user
            socket.emit('error', { message: 'Too many connections' });
            socket.disconnect();
            return;
        }

        this.addConnection(userId, socket);
    }

    // Memory-efficient room management
    joinRoom(socket, roomId) {
        socket.join(roomId);

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        this.rooms.get(roomId).add(socket.id);

        // Cleanup empty rooms
        socket.on('disconnect', () => {
            const room = this.rooms.get(roomId);
            if (room) {
                room.delete(socket.id);
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        });
    }
}
```

### Q24: How do you monitor and measure application performance?

**Answer**: Comprehensive performance monitoring involves multiple tools and metrics across the entire stack:

**Application Performance Monitoring (APM)**:
```javascript
// Custom performance middleware
const performanceMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    // Track memory usage
    const memoryBefore = process.memoryUsage();

    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        const memoryAfter = process.memoryUsage();
        const memoryDelta = memoryAfter.heapUsed - memoryBefore.heapUsed;

        // Log performance metrics
        console.log({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        // Send to monitoring service
        if (duration > 1000) { // Alert on slow requests
            sendAlert('slow_request', {
                url: req.url,
                duration,
                userId: req.user?.userId
            });
        }
    });

    next();
};

app.use(performanceMiddleware);
```

**Database Performance Monitoring**:
```javascript
// MongoDB slow query logging
mongoose.set('debug', (collectionName, method, query, doc) => {
    const startTime = Date.now();

    return function(error, result) {
        const duration = Date.now() - startTime;

        if (duration > 100) { // Log queries taking more than 100ms
            console.warn('Slow Query:', {
                collection: collectionName,
                method,
                query: JSON.stringify(query),
                duration: `${duration}ms`,
                timestamp: new Date().toISOString()
            });
        }
    };
});

// Connection pool monitoring
const monitorConnectionPool = () => {
    const db = mongoose.connection.db;
    const stats = db.serverStatus();

    console.log('MongoDB Connection Stats:', {
        connections: stats.connections,
        activeClients: stats.globalLock.activeClients,
        queuedOperations: stats.globalLock.currentQueue,
        memoryUsage: stats.mem
    });
};

setInterval(monitorConnectionPool, 60000); // Every minute
```

**Frontend Performance Monitoring**:
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
    // Send to your analytics service
    fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: { 'Content-Type': 'application/json' }
    });
};

// Track Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Custom performance tracking
const trackComponentPerformance = (componentName) => {
    return (WrappedComponent) => {
        return function PerformanceTrackedComponent(props) {
            const renderStart = performance.now();

            useEffect(() => {
                const renderEnd = performance.now();
                const renderTime = renderEnd - renderStart;

                if (renderTime > 16) { // Slower than 60fps
                    console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
                }
            });

            return <WrappedComponent {...props} />;
        };
    };
};

// Usage
const OptimizedCodeEditor = trackComponentPerformance('CodeEditor')(CodeEditor);
```

**Real-time Metrics Dashboard**:
```javascript
// Metrics collection service
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.intervals = new Map();
    }

    // Track counter metrics
    increment(name, tags = {}) {
        const key = this.getMetricKey(name, tags);
        const current = this.metrics.get(key) || 0;
        this.metrics.set(key, current + 1);
    }

    // Track gauge metrics
    gauge(name, value, tags = {}) {
        const key = this.getMetricKey(name, tags);
        this.metrics.set(key, value);
    }

    // Track timing metrics
    timing(name, duration, tags = {}) {
        const key = this.getMetricKey(name, tags);
        const timings = this.metrics.get(key) || [];
        timings.push(duration);
        this.metrics.set(key, timings);
    }

    // Get metrics for dashboard
    getMetrics() {
        const result = {};

        for (const [key, value] of this.metrics) {
            const [name, tags] = this.parseMetricKey(key);

            if (!result[name]) {
                result[name] = [];
            }

            result[name].push({
                tags,
                value: Array.isArray(value) ? this.calculateStats(value) : value
            });
        }

        return result;
    }

    calculateStats(values) {
        const sorted = values.sort((a, b) => a - b);
        return {
            count: values.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    getMetricKey(name, tags) {
        const tagString = Object.entries(tags)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join(',');
        return `${name}|${tagString}`;
    }

    parseMetricKey(key) {
        const [name, tagString] = key.split('|');
        const tags = {};

        if (tagString) {
            tagString.split(',').forEach(pair => {
                const [k, v] = pair.split(':');
                tags[k] = v;
            });
        }

        return [name, tags];
    }
}

const metrics = new MetricsCollector();

// Usage throughout the application
metrics.increment('api.requests', { endpoint: '/api/project', method: 'GET' });
metrics.timing('database.query', queryDuration, { collection: 'projects' });
metrics.gauge('websocket.connections', io.engine.clientsCount);

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
    res.json(metrics.getMetrics());
});
```

**Alerting System**:
```javascript
// Alert configuration
const alertRules = {
    high_response_time: {
        metric: 'api.response_time',
        threshold: 2000, // 2 seconds
        operator: 'gt',
        window: '5m',
        severity: 'warning'
    },
    high_error_rate: {
        metric: 'api.errors',
        threshold: 10, // 10 errors per minute
        operator: 'gt',
        window: '1m',
        severity: 'critical'
    },
    low_memory: {
        metric: 'system.memory.available',
        threshold: 100 * 1024 * 1024, // 100MB
        operator: 'lt',
        window: '1m',
        severity: 'warning'
    }
};

const checkAlerts = async () => {
    for (const [ruleName, rule] of Object.entries(alertRules)) {
        const metricValue = await getMetricValue(rule.metric, rule.window);

        if (evaluateCondition(metricValue, rule.operator, rule.threshold)) {
            await sendAlert(ruleName, {
                metric: rule.metric,
                value: metricValue,
                threshold: rule.threshold,
                severity: rule.severity,
                timestamp: new Date().toISOString()
            });
        }
    }
};

// Check alerts every minute
setInterval(checkAlerts, 60000);
```

---

## Problem-solving & Debugging

### Q25: Describe a challenging bug you encountered and how you debugged it.

**Answer**: One of the most challenging bugs was intermittent WebSocket disconnections causing users to lose real-time updates. Here's how I approached it:

**Problem Identification**:
```javascript
// Initial symptoms observed:
// 1. Users randomly stopped receiving messages
// 2. No error logs on client side
// 3. Server showed successful message broadcasts
// 4. Issue occurred more frequently under load

// Added comprehensive logging to identify patterns
io.on('connection', (socket) => {
    console.log(`Connection established: ${socket.id}, User: ${socket.user.email}`);

    socket.on('disconnect', (reason) => {
        console.log(`Disconnect: ${socket.id}, Reason: ${reason}, Duration: ${Date.now() - socket.connectedAt}ms`);

        // Track disconnect reasons
        metrics.increment('socket.disconnect', { reason });
    });

    socket.connectedAt = Date.now();
    socket.lastPing = Date.now();

    // Monitor connection health
    socket.on('pong', () => {
        socket.lastPing = Date.now();
    });
});
```

**Root Cause Analysis**:
```javascript
// Discovered the issue was related to load balancer configuration
// and Socket.io's polling fallback mechanism

// Problem 1: Load balancer not configured for sticky sessions
// Solution: Configure nginx for WebSocket support
upstream backend {
    ip_hash; # Ensure sticky sessions
    server backend1:3000;
    server backend2:3000;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400; # 24 hours for long-lived connections
    }
}

// Problem 2: Client-side reconnection logic was insufficient
// Solution: Implement robust reconnection with exponential backoff
class SocketManager {
    constructor(projectId) {
        this.projectId = projectId;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.socket = null;
        this.messageQueue = [];
        this.isConnected = false;
    }

    connect() {
        const token = localStorage.getItem('token');

        this.socket = io(SOCKET_URL, {
            auth: { token },
            query: { projectId: this.projectId },
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            timeout: 20000,
            forceNew: true
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;

            // Process queued messages
            this.processMessageQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;

            // Only attempt reconnection for certain disconnect reasons
            if (this.shouldReconnect(reason)) {
                this.scheduleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.scheduleReconnect();
        });
    }

    shouldReconnect(reason) {
        // Don't reconnect for authentication failures
        const noReconnectReasons = [
            'io server disconnect',
            'io client disconnect',
            'auth failed'
        ];

        return !noReconnectReasons.includes(reason);
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.onMaxReconnectAttemptsReached();
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }

    sendMessage(event, data) {
        if (this.isConnected && this.socket) {
            this.socket.emit(event, data);
        } else {
            // Queue message for later delivery
            this.messageQueue.push({ event, data, timestamp: Date.now() });
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }
}
```

**Testing and Validation**:
```javascript
// Created comprehensive test suite to prevent regression
describe('Socket Connection Reliability', () => {
    let server, clientSocket;

    beforeEach((done) => {
        server = createTestServer();
        clientSocket = createTestClient();
        clientSocket.on('connect', done);
    });

    afterEach(() => {
        server.close();
        clientSocket.close();
    });

    it('should reconnect after server restart', (done) => {
        let reconnectCount = 0;

        clientSocket.on('reconnect', () => {
            reconnectCount++;
            if (reconnectCount === 1) {
                expect(clientSocket.connected).toBe(true);
                done();
            }
        });

        // Simulate server restart
        setTimeout(() => {
            server.close();
            setTimeout(() => {
                server = createTestServer();
            }, 1000);
        }, 500);
    });

    it('should queue messages during disconnection', (done) => {
        const testMessage = { text: 'test message', projectId: 'test' };
        let messageReceived = false;

        server.on('connection', (socket) => {
            socket.on('project-message', (data) => {
                expect(data).toEqual(testMessage);
                messageReceived = true;
                done();
            });
        });

        // Disconnect and send message
        clientSocket.disconnect();
        clientSocket.emit('project-message', testMessage);

        // Reconnect
        setTimeout(() => {
            clientSocket.connect();
        }, 1000);
    });
});
```

### Q26: How do you handle memory leaks in a Node.js application?

**Answer**: Memory leak detection and prevention requires systematic monitoring and careful resource management:

**Memory Leak Detection**:
```javascript
// Memory monitoring middleware
const memoryMonitor = () => {
    const startMemory = process.memoryUsage();

    return (req, res, next) => {
        const beforeMemory = process.memoryUsage();

        res.on('finish', () => {
            const afterMemory = process.memoryUsage();
            const memoryDelta = afterMemory.heapUsed - beforeMemory.heapUsed;

            // Log significant memory increases
            if (memoryDelta > 10 * 1024 * 1024) { // 10MB
                console.warn('High memory usage detected:', {
                    endpoint: req.url,
                    method: req.method,
                    memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
                    totalHeap: `${(afterMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
                });
            }
        });

        next();
    };
};

app.use(memoryMonitor());

// Periodic memory reporting
setInterval(() => {
    const usage = process.memoryUsage();
    console.log('Memory Usage:', {
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`
    });

    // Force garbage collection if memory usage is high
    if (usage.heapUsed > 500 * 1024 * 1024 && global.gc) { // 500MB
        console.log('Forcing garbage collection...');
        global.gc();
    }
}, 30000); // Every 30 seconds
```

**Common Memory Leak Sources and Solutions**:
```javascript
// 1. Event Listener Leaks
class ProjectManager {
    constructor() {
        this.projects = new Map();
        this.eventHandlers = new Map();
    }

    addProject(projectId) {
        const project = new Project(projectId);

        // Store handler reference for cleanup
        const messageHandler = (data) => this.handleMessage(projectId, data);
        this.eventHandlers.set(projectId, messageHandler);

        project.on('message', messageHandler);
        this.projects.set(projectId, project);
    }

    removeProject(projectId) {
        const project = this.projects.get(projectId);
        const handler = this.eventHandlers.get(projectId);

        if (project && handler) {
            // Critical: Remove event listeners to prevent leaks
            project.removeListener('message', handler);
            project.destroy();
        }

        this.projects.delete(projectId);
        this.eventHandlers.delete(projectId);
    }
}

// 2. Timer Leaks
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.timers = new Map();
    }

    createSession(sessionId, ttl = 3600000) { // 1 hour
        const session = { id: sessionId, createdAt: Date.now() };
        this.sessions.set(sessionId, session);

        // Set cleanup timer
        const timer = setTimeout(() => {
            this.removeSession(sessionId);
        }, ttl);

        this.timers.set(sessionId, timer);
    }

    removeSession(sessionId) {
        // Clear timer to prevent memory leak
        const timer = this.timers.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(sessionId);
        }

        this.sessions.delete(sessionId);
    }

    // Cleanup all sessions (important for graceful shutdown)
    cleanup() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        this.sessions.clear();
    }
}

// 3. Closure Leaks
// Bad: Creates closure that retains large objects
const createHandler = (largeData) => {
    return (req, res) => {
        // This closure retains reference to largeData
        res.json({ status: 'ok' });
    };
};

// Good: Avoid unnecessary closures
const createHandler = () => {
    return (req, res) => {
        res.json({ status: 'ok' });
    };
};

// 4. Stream Leaks
const processFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        let data = '';

        stream.on('data', (chunk) => {
            data += chunk;
        });

        stream.on('end', () => {
            resolve(data);
        });

        stream.on('error', (error) => {
            // Critical: Clean up stream on error
            stream.destroy();
            reject(error);
        });

        // Set timeout to prevent hanging streams
        setTimeout(() => {
            if (!stream.destroyed) {
                stream.destroy();
                reject(new Error('Stream timeout'));
            }
        }, 30000);
    });
};
```

**Memory Profiling and Analysis**:
```javascript
// Heap snapshot analysis
const v8 = require('v8');
const fs = require('fs');

const takeHeapSnapshot = (filename) => {
    const heapSnapshot = v8.getHeapSnapshot();
    const fileStream = fs.createWriteStream(filename);

    heapSnapshot.pipe(fileStream);

    return new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
};

// Take snapshots for comparison
const analyzeMemoryLeaks = async () => {
    console.log('Taking initial heap snapshot...');
    await takeHeapSnapshot('heap-before.heapsnapshot');

    // Simulate application usage
    await simulateLoad();

    console.log('Taking final heap snapshot...');
    await takeHeapSnapshot('heap-after.heapsnapshot');

    console.log('Compare snapshots in Chrome DevTools to identify leaks');
};

// Automated leak detection
class MemoryLeakDetector {
    constructor() {
        this.baseline = null;
        this.samples = [];
        this.alertThreshold = 100 * 1024 * 1024; // 100MB growth
    }

    startMonitoring() {
        this.baseline = process.memoryUsage().heapUsed;

        setInterval(() => {
            this.takeSample();
        }, 60000); // Every minute
    }

    takeSample() {
        const currentMemory = process.memoryUsage().heapUsed;
        const growth = currentMemory - this.baseline;

        this.samples.push({
            timestamp: Date.now(),
            heapUsed: currentMemory,
            growth
        });

        // Keep only last 10 samples
        if (this.samples.length > 10) {
            this.samples.shift();
        }

        // Check for consistent growth pattern
        if (this.detectLeak()) {
            this.alertLeak();
        }
    }

    detectLeak() {
        if (this.samples.length < 5) return false;

        // Check if memory consistently grows
        const recentSamples = this.samples.slice(-5);
        const growthTrend = recentSamples.every((sample, index) => {
            if (index === 0) return true;
            return sample.heapUsed > recentSamples[index - 1].heapUsed;
        });

        const totalGrowth = recentSamples[recentSamples.length - 1].growth;

        return growthTrend && totalGrowth > this.alertThreshold;
    }

    alertLeak() {
        console.error('MEMORY LEAK DETECTED!', {
            currentHeap: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
            growth: `${(this.samples[this.samples.length - 1].growth / 1024 / 1024).toFixed(2)}MB`,
            samples: this.samples.slice(-5)
        });

        // Take heap snapshot for analysis
        takeHeapSnapshot(`leak-detected-${Date.now()}.heapsnapshot`);
    }
}

const leakDetector = new MemoryLeakDetector();
leakDetector.startMonitoring();
```

### Q27: How would you debug a performance issue where the application becomes slow under load?

**Answer**: Performance debugging under load requires systematic analysis across multiple layers:

**Load Testing and Profiling Setup**:
```javascript
// Load testing script using Artillery
// artillery-config.yml
/*
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
scenarios:
  - name: "Project workflow"
    weight: 70
    flow:
      - post:
          url: "/api/user/login"
          json:
            email: "test@example.com"
            password: "password"
      - get:
          url: "/api/project/allProjects"
      - post:
          url: "/api/project/create"
          json:
            name: "test-project"
  - name: "Real-time messaging"
    weight: 30
    engine: socketio
    flow:
      - emit:
          channel: "project-message"
          data:
            text: "Hello @ai create a React app"
            projectId: "{{ projectId }}"
*/

// Performance profiling middleware
const performanceProfiler = () => {
    const activeRequests = new Map();

    return (req, res, next) => {
        const requestId = `${req.method}-${req.url}-${Date.now()}`;
        const startTime = process.hrtime.bigint();
        const startMemory = process.memoryUsage();

        activeRequests.set(requestId, {
            url: req.url,
            method: req.method,
            startTime,
            startMemory
        });

        // Monitor CPU usage
        const startCPU = process.cpuUsage();

        res.on('finish', () => {
            const endTime = process.hrtime.bigint();
            const endMemory = process.memoryUsage();
            const endCPU = process.cpuUsage(startCPU);

            const duration = Number(endTime - startTime) / 1000000; // ms
            const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

            const profile = {
                requestId,
                url: req.url,
                method: req.method,
                statusCode: res.statusCode,
                duration: `${duration.toFixed(2)}ms`,
                memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
                cpuUser: `${(endCPU.user / 1000).toFixed(2)}ms`,
                cpuSystem: `${(endCPU.system / 1000).toFixed(2)}ms`,
                activeRequests: activeRequests.size,
                timestamp: new Date().toISOString()
            };

            // Log slow requests
            if (duration > 1000) {
                console.warn('SLOW REQUEST:', profile);
            }

            // Log high memory usage
            if (memoryDelta > 50 * 1024 * 1024) { // 50MB
                console.warn('HIGH MEMORY REQUEST:', profile);
            }

            activeRequests.delete(requestId);

            // Send to monitoring system
            sendMetrics(profile);
        });

        next();
    };
};
```

**Database Performance Analysis**:
```javascript
// Database query profiling
const profileDatabaseQueries = () => {
    const originalExec = mongoose.Query.prototype.exec;

    mongoose.Query.prototype.exec = function() {
        const startTime = Date.now();
        const query = this.getQuery();
        const collection = this.model.collection.name;

        return originalExec.call(this).then(result => {
            const duration = Date.now() - startTime;

            if (duration > 100) { // Log queries > 100ms
                console.warn('SLOW QUERY:', {
                    collection,
                    query: JSON.stringify(query),
                    duration: `${duration}ms`,
                    resultCount: Array.isArray(result) ? result.length : 1
                });
            }

            return result;
        }).catch(error => {
            console.error('QUERY ERROR:', {
                collection,
                query: JSON.stringify(query),
                error: error.message
            });
            throw error;
        });
    };
};

profileDatabaseQueries();

// Connection pool monitoring
const monitorConnectionPool = () => {
    const connections = mongoose.connections;

    connections.forEach((connection, index) => {
        console.log(`Connection ${index}:`, {
            readyState: connection.readyState,
            host: connection.host,
            port: connection.port,
            name: connection.name
        });
    });

    // Monitor for connection leaks
    if (connections.length > 10) {
        console.warn('HIGH CONNECTION COUNT:', connections.length);
    }
};

setInterval(monitorConnectionPool, 30000);
```

**Application-Level Bottleneck Detection**:
```javascript
// CPU profiling for hot spots
const startCPUProfiling = () => {
    const inspector = require('inspector');
    const fs = require('fs');

    const session = new inspector.Session();
    session.connect();

    session.post('Profiler.enable', () => {
        session.post('Profiler.start', () => {
            console.log('CPU profiling started');

            // Stop profiling after 30 seconds
            setTimeout(() => {
                session.post('Profiler.stop', (err, { profile }) => {
                    if (!err) {
                        fs.writeFileSync('cpu-profile.cpuprofile', JSON.stringify(profile));
                        console.log('CPU profile saved to cpu-profile.cpuprofile');
                    }
                    session.disconnect();
                });
            }, 30000);
        });
    });
};

// Async operation tracking
class AsyncTracker {
    constructor() {
        this.operations = new Map();
        this.hooks = require('async_hooks');
        this.init();
    }

    init() {
        const hook = this.hooks.createHook({
            init: (asyncId, type, triggerAsyncId) => {
                if (type === 'PROMISE' || type === 'Timeout') {
                    this.operations.set(asyncId, {
                        type,
                        triggerAsyncId,
                        startTime: Date.now(),
                        stack: new Error().stack
                    });
                }
            },
            destroy: (asyncId) => {
                const operation = this.operations.get(asyncId);
                if (operation) {
                    const duration = Date.now() - operation.startTime;

                    // Log long-running async operations
                    if (duration > 5000) { // 5 seconds
                        console.warn('LONG ASYNC OPERATION:', {
                            asyncId,
                            type: operation.type,
                            duration: `${duration}ms`,
                            stack: operation.stack.split('\n').slice(0, 5).join('\n')
                        });
                    }

                    this.operations.delete(asyncId);
                }
            }
        });

        hook.enable();
    }

    getActiveOperations() {
        const now = Date.now();
        const longRunning = [];

        for (const [asyncId, operation] of this.operations) {
            const duration = now - operation.startTime;
            if (duration > 1000) { // 1 second
                longRunning.push({
                    asyncId,
                    type: operation.type,
                    duration: `${duration}ms`
                });
            }
        }

        return longRunning;
    }
}

const asyncTracker = new AsyncTracker();

// Report long-running operations every 10 seconds
setInterval(() => {
    const longRunning = asyncTracker.getActiveOperations();
    if (longRunning.length > 0) {
        console.warn('LONG RUNNING ASYNC OPERATIONS:', longRunning);
    }
}, 10000);
```

**Real-time Performance Dashboard**:
```javascript
// Performance metrics collection
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: { total: 0, slow: 0, errors: 0 },
            memory: { current: 0, peak: 0 },
            cpu: { user: 0, system: 0 },
            database: { queries: 0, slowQueries: 0 },
            websockets: { connections: 0, messages: 0 }
        };

        this.startMonitoring();
    }

    startMonitoring() {
        // System metrics
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            this.metrics.memory.current = memUsage.heapUsed;
            this.metrics.memory.peak = Math.max(this.metrics.memory.peak, memUsage.heapUsed);
            this.metrics.cpu.user = cpuUsage.user;
            this.metrics.cpu.system = cpuUsage.system;

            // Alert on high memory usage
            if (memUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
                this.sendAlert('high_memory', {
                    current: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                    threshold: '1024MB'
                });
            }
        }, 5000);

        // WebSocket metrics
        setInterval(() => {
            if (global.io) {
                this.metrics.websockets.connections = global.io.engine.clientsCount;
            }
        }, 1000);
    }

    recordRequest(duration, statusCode) {
        this.metrics.requests.total++;

        if (duration > 1000) {
            this.metrics.requests.slow++;
        }

        if (statusCode >= 400) {
            this.metrics.requests.errors++;
        }
    }

    recordDatabaseQuery(duration) {
        this.metrics.database.queries++;

        if (duration > 100) {
            this.metrics.database.slowQueries++;
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            uptime: process.uptime()
        };
    }

    sendAlert(type, data) {
        console.error(`PERFORMANCE ALERT [${type}]:`, data);

        // Send to external monitoring service
        // await sendToMonitoringService(type, data);
    }
}

const performanceMonitor = new PerformanceMonitor();

// Expose metrics endpoint
app.get('/api/metrics', (req, res) => {
    res.json(performanceMonitor.getMetrics());
});
```

This systematic approach to performance debugging helps identify bottlenecks at every layer of the application stack, from database queries to WebSocket connections to memory usage patterns.

---

## Advanced Technical Scenarios

### Q28: How would you implement a feature flag system for gradual feature rollouts?

**Answer**: A feature flag system enables safe deployment and gradual rollouts with real-time control:

**Feature Flag Architecture**:
```javascript
// Feature flag configuration
const featureFlags = {
    'collaborative-editing': {
        enabled: false,
        rolloutPercentage: 0,
        userWhitelist: ['admin@example.com'],
        conditions: {
            userRole: ['admin'],
            projectType: ['premium']
        }
    },
    'ai-code-review': {
        enabled: true,
        rolloutPercentage: 25,
        userWhitelist: [],
        conditions: {}
    },
    'advanced-debugging': {
        enabled: true,
        rolloutPercentage: 100,
        userWhitelist: [],
        conditions: {
            userRole: ['admin', 'developer']
        }
    }
};

class FeatureFlagManager {
    constructor() {
        this.flags = new Map();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.loadFlags();
    }

    async loadFlags() {
        try {
            // Load from database or external service
            const flags = await this.fetchFlagsFromDatabase();
            flags.forEach(flag => {
                this.flags.set(flag.name, flag);
            });
        } catch (error) {
            console.error('Failed to load feature flags:', error);
            // Fallback to default configuration
            Object.entries(featureFlags).forEach(([name, config]) => {
                this.flags.set(name, config);
            });
        }
    }

    isEnabled(flagName, context = {}) {
        const cacheKey = `${flagName}:${JSON.stringify(context)}`;

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.enabled;
        }

        const flag = this.flags.get(flagName);
        if (!flag) {
            console.warn(`Feature flag '${flagName}' not found`);
            return false;
        }

        const enabled = this.evaluateFlag(flag, context);

        // Cache result
        this.cache.set(cacheKey, {
            enabled,
            timestamp: Date.now()
        });

        return enabled;
    }

    evaluateFlag(flag, context) {
        // Check if globally disabled
        if (!flag.enabled) {
            return false;
        }

        // Check user whitelist
        if (flag.userWhitelist.includes(context.userEmail)) {
            return true;
        }

        // Check conditions
        if (flag.conditions) {
            for (const [key, values] of Object.entries(flag.conditions)) {
                if (context[key] && !values.includes(context[key])) {
                    return false;
                }
            }
        }

        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
            const hash = this.hashUser(context.userId || context.userEmail);
            const userPercentile = hash % 100;
            return userPercentile < flag.rolloutPercentage;
        }

        return true;
    }

    hashUser(identifier) {
        // Simple hash function for consistent user bucketing
        let hash = 0;
        for (let i = 0; i < identifier.length; i++) {
            const char = identifier.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    updateFlag(flagName, updates) {
        const flag = this.flags.get(flagName);
        if (flag) {
            Object.assign(flag, updates);
            this.clearCache(flagName);

            // Persist to database
            this.saveFlagToDatabase(flagName, flag);
        }
    }

    clearCache(flagName) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${flagName}:`)) {
                this.cache.delete(key);
            }
        }
    }
}

const featureFlagManager = new FeatureFlagManager();
```

**Frontend Integration**:
```javascript
// React hook for feature flags
const useFeatureFlag = (flagName, dependencies = []) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const checkFlag = async () => {
            try {
                const context = {
                    userId: user?.id,
                    userEmail: user?.email,
                    userRole: user?.role
                };

                const response = await axiosInstance.post('/api/feature-flags/check', {
                    flagName,
                    context
                });

                setIsEnabled(response.data.enabled);
            } catch (error) {
                console.error('Feature flag check failed:', error);
                setIsEnabled(false);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            checkFlag();
        }
    }, [flagName, user, ...dependencies]);

    return { isEnabled, loading };
};

// Feature flag component wrapper
const FeatureFlag = ({ flag, fallback = null, children }) => {
    const { isEnabled, loading } = useFeatureFlag(flag);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isEnabled ? children : fallback;
};

// Usage in components
const ProjectPage = () => {
    const { isEnabled: collaborativeEditingEnabled } = useFeatureFlag('collaborative-editing');

    return (
        <div>
            <CodeEditor
                collaborative={collaborativeEditingEnabled}
            />

            <FeatureFlag
                flag="ai-code-review"
                fallback={<div>AI Code Review coming soon!</div>}
            >
                <AICodeReviewPanel />
            </FeatureFlag>
        </div>
    );
};
```

**Backend Middleware**:
```javascript
// Feature flag middleware
const featureFlagMiddleware = (flagName, options = {}) => {
    return async (req, res, next) => {
        const context = {
            userId: req.user?.userId,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            ...options.context
        };

        const isEnabled = featureFlagManager.isEnabled(flagName, context);

        if (!isEnabled) {
            if (options.fallback) {
                return options.fallback(req, res, next);
            }

            return res.status(403).json({
                success: false,
                message: 'Feature not available',
                featureFlag: flagName
            });
        }

        req.featureFlags = req.featureFlags || {};
        req.featureFlags[flagName] = true;
        next();
    };
};

// Usage in routes
router.get('/api/ai/code-review',
    authUser,
    featureFlagMiddleware('ai-code-review'),
    getCodeReviewController
);

router.post('/api/project/collaborative-edit',
    authUser,
    featureFlagMiddleware('collaborative-editing', {
        context: { projectType: 'premium' },
        fallback: (req, res) => {
            res.status(402).json({
                success: false,
                message: 'Collaborative editing requires premium subscription'
            });
        }
    }),
    collaborativeEditController
);
```

### Q29: Describe how you would implement real-time collaborative cursor tracking.

**Answer**: Real-time collaborative cursor tracking requires precise coordinate synchronization and efficient rendering:

**Cursor Position Tracking**:
```javascript
// Enhanced Monaco editor with cursor tracking
class CollaborativeCursorManager {
    constructor(editor, socketManager, fileId) {
        this.editor = editor;
        this.socketManager = socketManager;
        this.fileId = fileId;
        this.cursors = new Map(); // userId -> cursor data
        this.decorations = new Map(); // userId -> decoration IDs
        this.throttleDelay = 100; // ms

        this.setupCursorTracking();
        this.setupRemoteCursorHandling();
    }

    setupCursorTracking() {
        // Throttled cursor position updates
        const throttledUpdate = this.throttle((position, selection) => {
            this.broadcastCursorUpdate(position, selection);
        }, this.throttleDelay);

        // Track cursor position changes
        this.editor.onDidChangeCursorPosition((e) => {
            throttledUpdate(e.position, e.selection);
        });

        // Track selection changes
        this.editor.onDidChangeCursorSelection((e) => {
            throttledUpdate(e.position, e.selection);
        });

        // Track focus/blur events
        this.editor.onDidFocusEditorText(() => {
            this.broadcastFocusChange(true);
        });

        this.editor.onDidBlurEditorText(() => {
            this.broadcastFocusChange(false);
        });
    }

    broadcastCursorUpdate(position, selection) {
        const cursorData = {
            fileId: this.fileId,
            position: {
                lineNumber: position.lineNumber,
                column: position.column
            },
            selection: {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
            },
            timestamp: Date.now()
        };

        this.socketManager.emit('cursor-update', cursorData);
    }

    broadcastFocusChange(focused) {
        this.socketManager.emit('cursor-focus', {
            fileId: this.fileId,
            focused,
            timestamp: Date.now()
        });
    }

    setupRemoteCursorHandling() {
        this.socketManager.on('cursor-update', (data) => {
            if (data.fileId === this.fileId && data.userId !== this.getCurrentUserId()) {
                this.updateRemoteCursor(data.userId, data);
            }
        });

        this.socketManager.on('cursor-focus', (data) => {
            if (data.fileId === this.fileId && data.userId !== this.getCurrentUserId()) {
                this.updateCursorFocus(data.userId, data.focused);
            }
        });

        this.socketManager.on('user-left', (data) => {
            this.removeRemoteCursor(data.userId);
        });
    }

    updateRemoteCursor(userId, cursorData) {
        const user = this.getUserInfo(userId);
        if (!user) return;

        // Store cursor data
        this.cursors.set(userId, {
            ...cursorData,
            user,
            lastUpdate: Date.now()
        });

        // Update visual representation
        this.renderCursor(userId, cursorData, user);
    }

    renderCursor(userId, cursorData, user) {
        const { position, selection } = cursorData;
        const decorations = [];

        // Cursor decoration
        const cursorRange = new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );

        decorations.push({
            range: cursorRange,
            options: {
                className: `collaborative-cursor cursor-${userId}`,
                hoverMessage: { value: `${user.email}'s cursor` },
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
        });

        // Selection decoration (if different from cursor)
        if (selection.startLineNumber !== selection.endLineNumber ||
            selection.startColumn !== selection.endColumn) {

            const selectionRange = new monaco.Range(
                selection.startLineNumber,
                selection.startColumn,
                selection.endLineNumber,
                selection.endColumn
            );

            decorations.push({
                range: selectionRange,
                options: {
                    className: `collaborative-selection selection-${userId}`,
                    hoverMessage: { value: `${user.email}'s selection` }
                }
            });
        }

        // Apply decorations
        const oldDecorations = this.decorations.get(userId) || [];
        const newDecorations = this.editor.deltaDecorations(oldDecorations, decorations);
        this.decorations.set(userId, newDecorations);

        // Update cursor label
        this.updateCursorLabel(userId, position, user);
    }

    updateCursorLabel(userId, position, user) {
        // Remove existing label
        const existingLabel = document.getElementById(`cursor-label-${userId}`);
        if (existingLabel) {
            existingLabel.remove();
        }

        // Create new label
        const label = document.createElement('div');
        label.id = `cursor-label-${userId}`;
        label.className = `cursor-label cursor-label-${userId}`;
        label.textContent = user.email.split('@')[0]; // Show username part
        label.style.backgroundColor = user.color;

        // Position label
        const coordinates = this.editor.getScrolledVisiblePosition(position);
        if (coordinates) {
            const editorDom = this.editor.getDomNode();
            const rect = editorDom.getBoundingClientRect();

            label.style.position = 'absolute';
            label.style.left = `${coordinates.left}px`;
            label.style.top = `${coordinates.top - 20}px`; // Above cursor
            label.style.zIndex = '1000';

            editorDom.appendChild(label);

            // Auto-hide label after 3 seconds
            setTimeout(() => {
                if (label.parentNode) {
                    label.remove();
                }
            }, 3000);
        }
    }

    removeRemoteCursor(userId) {
        // Remove decorations
        const decorations = this.decorations.get(userId);
        if (decorations) {
            this.editor.deltaDecorations(decorations, []);
            this.decorations.delete(userId);
        }

        // Remove cursor data
        this.cursors.delete(userId);

        // Remove label
        const label = document.getElementById(`cursor-label-${userId}`);
        if (label) {
            label.remove();
        }
    }

    // Utility methods
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;

        return function (...args) {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    getCurrentUserId() {
        return this.socketManager.userId;
    }

    getUserInfo(userId) {
        // Get user info from context or API
        return this.socketManager.getUser(userId);
    }
}
```

**CSS Styling for Cursors**:
```css
/* Collaborative cursor styles */
.collaborative-cursor {
    position: relative;
    border-left: 2px solid;
    animation: cursor-blink 1s infinite;
}

.collaborative-selection {
    background-color: rgba(0, 123, 255, 0.2);
    border: 1px solid rgba(0, 123, 255, 0.4);
}

.cursor-label {
    position: absolute;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    color: white;
    font-weight: bold;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* User-specific colors */
.cursor-user1 { border-color: #ff6b6b; }
.cursor-user2 { border-color: #4ecdc4; }
.cursor-user3 { border-color: #45b7d1; }
.cursor-user4 { border-color: #96ceb4; }
.cursor-user5 { border-color: #feca57; }

.selection-user1 { background-color: rgba(255, 107, 107, 0.2); }
.selection-user2 { background-color: rgba(78, 205, 196, 0.2); }
.selection-user3 { background-color: rgba(69, 183, 209, 0.2); }
.selection-user4 { background-color: rgba(150, 206, 180, 0.2); }
.selection-user5 { background-color: rgba(254, 202, 87, 0.2); }

@keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}
```

This implementation provides smooth, real-time cursor tracking with visual feedback, efficient network usage through throttling, and proper cleanup to prevent memory leaks.

---

## Conclusion

This comprehensive interview questions document covers all major aspects of the CodeCraft AI project, from basic architecture questions to advanced debugging scenarios. The questions progress from fundamental concepts to complex problem-solving situations, providing detailed technical answers that demonstrate deep understanding of modern full-stack development practices.

**Key Areas Covered:**
- System Architecture & Design Patterns
- Frontend Development with React & WebContainers
- Backend Development with Node.js & Express
- Database Design & MongoDB Optimization
- Authentication & Security Best Practices
- AI Integration & Error Handling
- Real-time Collaboration Features
- Performance Optimization & Scalability
- Debugging & Problem-solving Techniques
- Advanced Technical Scenarios

Each answer includes practical code examples, best practices, and real-world considerations that would be valuable in senior-level technical interviews. The questions are designed to assess not just knowledge of the technologies used, but also understanding of software engineering principles, system design thinking, and problem-solving capabilities.

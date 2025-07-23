# CodeCraft AI 🚀

A collaborative development platform that combines AI-powered code generation with real-time collaboration and in-browser code execution. Build, test, and deploy full-stack applications with the power of AI assistance and WebContainer technology.

![CodeCraft AI](https://img.shields.io/badge/CodeCraft-AI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat&logo=socket.io)

## ✨ Features

### 🤖 AI-Powered Development
- **Smart Code Generation**: Leverage Google's Gemini AI to generate complete MERN stack applications
- **Context-Aware Assistance**: AI understands your project context and provides relevant code suggestions
- **WebContainer Integration**: Generated code runs instantly in isolated browser environments
- **Multiple AI Modes**: Support for both full-stack and frontend-only development

### 👥 Real-Time Collaboration
- **Live Project Sharing**: Multiple developers can work on the same project simultaneously
- **Real-Time Chat**: Built-in messaging system with AI integration (`@ai` mentions)
- **Role-Based Access Control**: Admin and member roles with granular permissions
- **Live Code Synchronization**: See changes from team members in real-time

### 💻 In-Browser Development Environment
- **Monaco Editor**: Full-featured code editor with syntax highlighting and IntelliSense
- **WebContainer Runtime**: Run Node.js applications directly in the browser
- **Live Preview**: Instant preview of web applications with hot reload
- **File Management**: Complete file explorer with create, edit, and delete operations

### 🔐 Secure Project Management
- **JWT Authentication**: Secure user authentication and session management
- **Project Permissions**: Control who can access and modify your projects
- **Admin Controls**: Add/remove users, change roles, and manage project settings
- **Data Persistence**: All code and messages stored securely in MongoDB

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **Monaco Editor** - VS Code-powered code editor
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io 4.8.1** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Google Gemini AI** - AI code generation

### Infrastructure
- **WebContainer API** - Browser-based Node.js runtime
- **Redis (IoRedis)** - Session storage and caching
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key
- Redis server (optional, for session storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CodeCraft-AI.git
   cd CodeCraft-AI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in the backend directory:
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

   # Redis (optional)
   REDIS_URL=redis://localhost:6379
   ```

   Create `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📖 Usage Guide

### Creating Your First Project

1. **Register/Login**: Create an account or sign in to your existing account
2. **Create Project**: Click "New Project" and give it a name
3. **Invite Collaborators**: Add team members using their email addresses
4. **Start Coding**: Use the AI assistant or write code manually

### Using AI Assistant

The AI assistant can help you generate complete applications:

```
@ai Create a React todo app with local storage
```

```
@ai Build a Node.js API for user authentication with MongoDB
```

```
@ai Generate a complete MERN stack blog application
```

### Project Collaboration

- **Real-time Chat**: Communicate with team members in the project chat
- **Live Code Sharing**: See changes from other developers instantly
- **Role Management**: Admins can add/remove users and change permissions
- **File Synchronization**: All file changes are synchronized across team members

### Running Code

1. **Generate or Write Code**: Use AI assistance or write code manually
2. **File Management**: Organize your files using the built-in file explorer
3. **Run Project**: Click the "Run" button to execute your application
4. **Live Preview**: View your running application in the integrated preview panel

## 🏗️ Project Structure

```
CodeCraft-AI/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic (AI service)
│   ├── middlewares/        # Custom middleware
│   ├── utils/              # Utility functions
│   ├── db/                 # Database configuration
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── Routes/         # Application routing
│   ├── public/             # Static assets
│   └── dist/               # Build output
└── README.md               # Project documentation
```

## 🔧 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | User login | No |
| POST | `/api/users/logout` | User logout | Yes |
| GET | `/api/users/profile` | Get user profile | Yes |

### Project Management

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/api/projects/create` | Create new project | Yes | No |
| GET | `/api/projects/allProjects` | Get user's projects | Yes | No |
| GET | `/api/projects/:projectId` | Get project details | Yes | No |
| PUT | `/api/projects/update/:projectId` | Update project name | Yes | Yes |
| POST | `/api/projects/addUserToPorject` | Add users to project | Yes | Yes |
| DELETE | `/api/projects/removeUser/:projectId` | Remove user from project | Yes | Yes |
| PUT | `/api/projects/updateRole/:projectId` | Update user role | Yes | Yes |
| GET | `/api/projects/stats/:projectId` | Get project statistics | Yes | No |

### AI Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/ai/get-result` | Generate AI response | Yes |

### Real-time Events (Socket.io)

| Event | Description | Data |
|-------|-------------|------|
| `project-message` | Send/receive project messages | `{text, senderEmail, projectId}` |
| `server-ready` | WebContainer server ready | `{port, url}` |

## 🎯 Key Components

### Frontend Components

- **ProjectPage**: Main project workspace with integrated editor and chat
- **CodeEditor**: Monaco-based code editor with syntax highlighting
- **FileExplorer**: File tree navigation and management
- **ProjectChat**: Real-time messaging with AI integration
- **ProjectRunner**: Code execution and preview management
- **ProjectSidebar**: User management and project settings

### Backend Services

- **AI Service**: Google Gemini integration for code generation
- **Socket Service**: Real-time communication handling
- **Auth Middleware**: JWT-based authentication
- **Project Controller**: Project CRUD operations
- **User Controller**: User management and authentication

### Custom Hooks

- **useWebContainer**: WebContainer management and file operations
- **useProjectData**: Project data fetching and management
- **useSocket**: Socket.io connection and messaging
- **useProjectMessages**: Message state management

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Admin and member role permissions
- **Session Management**: Secure cookie-based sessions

### Data Protection
- **Input Validation**: Express-validator for request validation
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data protection
- **MongoDB Security**: Mongoose schema validation

### Project Security
- **User Permissions**: Role-based project access control
- **Admin Protection**: Cannot remove last admin from project
- **Data Isolation**: Projects are isolated between users
- **Secure WebContainer**: Sandboxed code execution environment

## 🚀 Deployment

### Production Environment Variables

**Backend (.env)**
```env
# Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecraft-ai

# Secure JWT Secret (use a strong, random string)
JWT_SECRET=your-production-jwt-secret-key

# Google AI API
GEMINI_API_KEY=your-production-gemini-api-key

# Production Server
PORT=3000
NODE_ENV=production

# Redis (recommended for production)
REDIS_URL=redis://your-redis-instance

# CORS Origins (add your production domains)
CORS_ORIGINS=https://your-frontend-domain.com,https://your-app.com
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-api.com
VITE_SOCKET_URL=https://your-backend-api.com
```

### Build Commands

**Frontend Build**
```bash
cd frontend
npm run build
```

**Backend Production**
```bash
cd backend
npm start
```

### Deployment Platforms

#### Vercel (Frontend)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Render/Railway (Backend)
1. Connect your GitHub repository
2. Set environment variables in platform dashboard
3. Configure build and start commands
4. Deploy with automatic SSL

#### MongoDB Atlas
1. Create a cluster on MongoDB Atlas
2. Configure network access and database users
3. Get connection string for MONGODB_URI

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

The application includes tests for:
- API endpoints and controllers
- Authentication middleware
- Database models and operations
- React components and hooks
- Socket.io event handling

## 🤝 Contributing

We welcome contributions to CodeCraft AI! Please follow these guidelines:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Reporting Issues

Please use the GitHub issue tracker to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI code generation capabilities
- **StackBlitz WebContainers** - For in-browser Node.js runtime
- **Monaco Editor** - For the excellent code editing experience
- **Socket.io** - For real-time communication
- **React Team** - For the amazing frontend framework
- **Express.js** - For the robust backend framework

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and community support
- **Email**: [amarnathgarai2004@gmail.com](mailto:amarnathgarai2004@gmail.com)
---

<div align="center">

**Built with ❤️ by Amarnath**

[⭐ Star this repo](https://github.com/yourusername/CodeCraft-AI) | [🐛 Report Bug](https://github.com/yourusername/CodeCraft-AI/issues) | [💡 Request Feature](https://github.com/yourusername/CodeCraft-AI/issues)

</div>
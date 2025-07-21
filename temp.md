Of course! As a seasoned MERN stack developer, I'll set up a robust and scalable Express.js server for you using modern ES6 syntax.

Here is a well-structured, modular, and maintainable Express application that follows best practices, including centralized configuration, proper error handling, and consistent API responses.

### Explanation of the Structure:

*   **`src/`**: This is the main directory containing all your source code, keeping your project root clean.
*   **`src/index.js`**: The main entry point of the application. Its primary role is to connect to the database (if any) and start the server. This separates the server initialization logic from the Express application logic.
*   **`src/app.js`**: This file contains the core Express application setup. All middleware, route mounting, and configurations specific to the Express app are handled here.
*   **`src/routes/`**: All your application routes are defined here. I've created a `health.routes.js` as an example to check the application's status. We avoid a generic `index.js` file for better clarity.
*   **`src/controllers/`**: These files contain the business logic for your routes. They handle the request, perform operations, and send a response.
*   **`src/utils/`**: A folder for utility classes and functions.
    *   `ApiError.js`: A custom error class for generating structured, operational errors.
    *   `ApiResponse.js`: A custom class for sending standardized, consistent success responses.
    *   `asyncHandler.js`: A wrapper for your asynchronous route handlers to catch promise rejections and pass them to the error handler, avoiding repetitive `try-catch` blocks.
*   **`src/middlewares/`**: For custom Express middleware.
    *   `errorHandler.js`: A centralized middleware to catch and handle all errors that occur in the application.
*   **`.env`**: Stores all your environment variables. Never commit this file to version control.
*   **`.gitignore`**: Specifies which files and directories should be ignored by Git.
*   **`package.json`**: Defines the project's metadata, dependencies, and scripts. The `"type": "module"` entry is crucial for enabling ES6 `import`/`export` syntax.

This structure ensures that your code is organized, easy to navigate, and scalable for future development.

---

{
    "text": "Absolutely! Here is a modern and modular Express.js server setup using ES6 syntax. I have structured the application following best practices for scalability, maintainability, and robust error handling.",
    "fileTree": {
        "package.json": {
            "file": {
                "contents": "{
  "name": "es6-express-server",
  "version": "1.0.0",
  "description": "A modern Express server with ES6 modules.",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "keywords": [
    "express",
    "es6",
    "nodejs"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}"
            }
        },
        ".env": {
            "file": {
                "contents": "# Port for the server to run on
PORT=8000

# CORS configuration
CORS_ORIGIN=*"
            }
        },
        ".gitignore": {
            "file": {
                "contents": "# Dependencies
/node_modules

# Environment variables
.env

# Production build
/dist

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDEs and editors
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?"
            }
        },
        "src": {
            "directory": {
                "index.js": {
                    "file": {
                        "contents": "// This is the main entry point of the application.
// It's responsible for starting the server.

import 'dotenv/config'; // Loads .env file contents into process.env
import { app } from './app.js';

const port = process.env.PORT || 3000;

// Start listening for incoming requests
app.listen(port, () => {
    console.log(`\u{1F680} Server is running on port: ${port}`);
}).on('error', (err) => {
    // Handle critical server start-up errors
    console.error(`\u{274C} Failed to start server: ${err.message}`);
    process.exit(1);
});
"
                    }
                },
                "app.js": {
                    "file": {
                        "contents": "// This file configures the Express application and its middleware.

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';

// Create an Express app instance
const app = express();

// --- Core Middleware Setup ---

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Parse incoming JSON requests (with a size limit for security)
app.use(express.json({ limit: '16kb' }));

// Parse incoming URL-encoded requests (with extended options)
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files from the 'public' directory (if you have one)
app.use(express.static('public'));

// --- Route Imports ---
import healthRouter from './routes/health.routes.js';

// --- Route Declarations ---
// All requests to /api/v1/health will be handled by healthRouter
app.use('/api/v1/health', healthRouter);


// --- Global Error Handling Middleware ---
// This middleware must be the last one to be added to the app
app.use(errorHandler);

export { app };
"
                    }
                },
                "routes": {
                    "directory": {
                        "health.routes.js": {
                            "file": {
                                "contents": "// This file defines the API endpoints for health checks.

import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller.js';

// Create a new router instance
const router = Router();

// Define the health check route
// GET /api/v1/health
router.route('/').get(healthCheck);

export default router;
"
                            }
                        }
                    }
                },
                "controllers": {
                    "directory": {
                        "health.controller.js": {
                            "file": {
                                "contents": "// This file contains the logic for the health check route.

import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Controller function for the health check
const healthCheck = asyncHandler(async (req, res) => {
    // This function simply confirms that the server is running and responsive.
    return res
        .status(200)
        .json(new ApiResponse(200, { status: 'OK' }, 'Server is healthy and running.'));
});

export { healthCheck };
"
                            }
                        }
                    }
                },
                "utils": {
                    "directory": {
                        "ApiError.js": {
                            "file": {
                                "contents": "// A standardized error class for API-related errors.

class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Standardized field
        this.message = message;
        this.success = false; // Indicates failure
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
"
                            }
                        },
                        "ApiResponse.js": {
                            "file": {
                                "contents": "// A standardized response class for successful API requests.

class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Success is true if status code is in the 2xx or 3xx range
    }
}

export { ApiResponse };
"
                            }
                        },
                        "asyncHandler.js": {
                            "file": {
                                "contents": "// A higher-order function to wrap async route handlers and catch errors.
// This avoids writing try-catch blocks in every controller.

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
"
                            }
                        }
                    }
                },
                "middlewares": {
                    "directory": {
                        "errorHandler.js": {
                            "file": {
                                "contents": "// Centralized error handling middleware.

import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    // Default to 500 if status code is not set
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // If the error is an instance of our custom ApiError, use its properties
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // In development, log the full error for debugging
    // In production, you might want to log to a file or a logging service
    console.error(`[ERROR] ${statusCode} - ${message}\
Stack: ${err.stack}`);

    // Send a structured error response to the client
    res.status(statusCode).json({
        success: false,
        message: message,
        // Optionally, you can include the stack trace in development
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};

export { errorHandler };
"
                            }
                        }
                    }
                }
            }
        }
    },
    "buildCommand": {
        "mainItem": "npm",
        "commands": [ "install" ]
    },
    "startCommand": {
        "mainItem": "npm",
        "commands": [ "run", "dev" ]
    }
}
```
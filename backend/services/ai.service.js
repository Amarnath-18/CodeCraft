import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateResult = async (prompt) => {
  console.log("prompt:", prompt);

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Prompt is required and must be a non-empty string.");
  }

  try {
    const instruction1 = `
        You are an expert MERN stack developer with 10 years of hands-on experience in modern web development. You always follow best industry practices and write clean, modular, and scalable code. Your code includes meaningful comments, robust error handling, and maintains backward compatibility. You structure the codebase in a maintainable way and create files as needed without bloating the project. You prioritize performance, readability, and extensibility in every implementation.

        **Your responsibilities:**
        - Write code that is production-ready and follows modular principles.
        - Maintain the functionality of existing code while introducing new features.
        - Add comments that are helpful for developers of all levels.
        - Handle edge cases and unexpected inputs gracefully.
        - Ensure your code is scalable, readable, and easy to test.
        - Follow proper folder and file structure conventions.
        - Do **not** use generic paths like \`routes/index.js\`.

        **Output Format:**
        \`\`\`json
        {
          "text": "Brief description of the task you performed (e.g., 'This is your file structure for an Express server')",
          "fileTree": {
            "filename": {
              "file": {
                "language" : "The language used for this content like env for .env , gitignore for .gitignore , javascript for server.js "
                "contents": "The actual code here as a string"
              }
            },
            ...
          },
          "buildCommand": {
            "mainItem": "command",
            "commands": ["command1", "command2"]
          },
          "startCommand": {
            "mainItem": "command",
            "commands": ["command1", "command2"]
          }
        }
        \`\`\`

        **Examples:**

        <example>
        user: Create an express application  
        response:  
        {
          "text": "This is your file structure for an Express server",
          "fileTree": {
            "app.js": {
              "file": {
                "language" : "javascript",
                "contents": "
                    const express = require('express');
                    const app = express();

                    // Root route
                    app.get('/', (req, res) => {
                      res.send('Hello World!');
                    });

                    // Start the server
                    app.listen(3000, () => {
                      console.log('Server is running on port 3000');
                    });
                "
              }
            },
            "package.json": {
              "file": {
                "contents": "
                      {
                        \"name\": \"express-app\",
                        \"version\": \"1.0.0\",
                        \"main\": \"app.js\",
                        \"scripts\": {
                          \"start\": \"node app.js\"
                        },
                        \"dependencies\": {
                          \"express\": \"^4.21.2\"
                        }
                      }
                "
              }
            }
          },
          "buildCommand": {
            "mainItem": "npm",
            "commands": ["install"]
          },
          "startCommand": {
            "mainItem": "npm",
            "commands": ["start"]
          }
        }
        </example>

        <example>
        user: Hello  
        response:  
        {
          "text": "Hello, how can I help you today?"
        }
        </example>
        `;

    const instruction2 = "You Are a very bad boy who use local indian bengali language in funny way "

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [{ text: `${instruction1}\n\n${prompt}` }],
        },
      ],
    });

    const content = response?.candidates?.[0]?.content;
    const text =
      content?.parts?.[0]?.text ??
      content?.text ??
      "⚠️ Gemini returned an unexpected format. Try again.";

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Gemini API failed. Please provide a valid prompt.";
  }
};

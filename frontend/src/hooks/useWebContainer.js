import { useState, useEffect } from "react";
import { getWebContainer } from "../config/webContainerInstance";
import { extractTextFromJsonMarkdown, updateFileContent } from "../utils/projectUtils";
import axios from "axios";

/**
 * Custom hook for managing WebContainer functionality
 */
export const useWebContainer = (projectId, messages) => {
  const [webContainer, setWebContainer] = useState(null);
  const [fileTrees, setFileTrees] = useState([]);
  const [currFile, setCurrFile] = useState(null);
  const [runOutput, setRunOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Initialize WebContainer
  useEffect(() => {
    async function startWebContainer() {
      try {
        const container = await getWebContainer();
        setWebContainer(container);
        console.log("WebContainer Started..");
      } catch (error) {
        console.error("Error starting WebContainer:", error);
      }
    }

    if (!webContainer) {
      startWebContainer();
    }
  }, [webContainer]);

  // Extract file tree from AI messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderEmail === "@Ai") {
        const { fileTree } = extractTextFromJsonMarkdown(messages[i].text);
        if (fileTree) {
          console.log("File tree found:", fileTree);
          setFileTrees(fileTree);
          break;
        }
      }
    }
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (file) => {
    setCurrFile(file);
  };

  // Handle file content change
  const handleFileChange = (newContent) => {
    setCurrFile((prev) => ({ ...prev, contents: newContent }));
    setFileTrees((prev) => updateFileContent(prev, currFile.name, newContent));
  };

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

  // Helper to update file content in nested file tree
  const updateFileContent = (tree, filePath, newContent) => {
    const parts = filePath.split("/");
    if (parts.length === 0) return tree;
    
    const [current, ...rest] = parts;
    
    if (rest.length === 0) {
      // At file
      if (tree[current] && tree[current].file) {
        return {
          ...tree,
          [current]: {
            ...tree[current],
            file: {
              ...tree[current].file,
              contents: newContent,
            },
          },
        };
      }
      return tree;
    } else {
      // In directory
      if (tree[current] && tree[current].directory) {
        return {
          ...tree,
          [current]: {
            ...tree[current],
            directory: updateFileContent(
              tree[current].directory,
              rest.join("/"),
              newContent
            ),
          },
        };
      }
      return tree;
    }
  };

  // Run project
  const runProject = async () => {
    if (!webContainer || !fileTrees) return;
    
    setIsRunning(true);
    setRunOutput("");

    // Extract build and start commands from AI messages
    let buildCommand, startCommand;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderEmail === "@Ai") {
        const parsed = extractTextFromJsonMarkdown(messages[i].text);
        buildCommand = parsed.buildCommand;
        startCommand = parsed.startCommand;
        break;
      }
    }

    try {
      if (!webContainer.isMounted) {
        await webContainer.mount(fileTrees);
      }

      // Listen for server events
      webContainer.on('server-ready', (port, url) => {
        setRunOutput((prev) => prev + `\n🌐 Server detected on port ${port}: ${url}\n`);
        setPreviewUrl(url);
        setShowPreview(true);
      });

      // Build command
      if (buildCommand?.mainItem && Array.isArray(buildCommand.commands)) {
        setRunOutput((prev) => prev + "\n=== Running build command ===\n");
        const buildProcess = await webContainer.spawn(buildCommand.mainItem, buildCommand.commands);
        
        buildProcess.output.pipeTo(new WritableStream({
          write(data) {
            setRunOutput((prev) => prev + data);
          }
        }));
        
        await buildProcess.exit;
      }

      // Start command
      if (startCommand?.mainItem && Array.isArray(startCommand.commands)) {
        setRunOutput((prev) => prev + "\n=== Starting project ===\n");
        const startProcess = await webContainer.spawn(startCommand.mainItem, startCommand.commands);
        
        startProcess.output.pipeTo(new WritableStream({
          write(data) {
            setRunOutput((prev) => prev + data);
            
            // Check if server started message appears
            if (data.includes('Server is running on port')) {
              setTimeout(async () => {
                try {
                  const url = await webContainer.url(3001);
                  setRunOutput((prev) => prev + `\n🌐 Auto-detected server: ${url}\n`);
                  setPreviewUrl(url);
                  setShowPreview(true);
                } catch (err) {
                  console.log("Auto-detection failed:", err);
                }
              }, 2000);
            }
          }
        }));
      }
    } catch (err) {
      setRunOutput((prev) => prev + "\nError: " + err.message);
    }

    setIsRunning(false);
  };

  // Toggle preview visibility
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return {
    webContainer,
    fileTrees,
    currFile,
    runOutput,
    isRunning,
    previewUrl,
    showPreview,
    handleFileSelect,
    handleFileChange,
    handleFileSave,
    runProject,
    togglePreview,
    setShowPreview,
  };
};

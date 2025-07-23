import Message from '../models/message.model.js';
import Project from '../models/project.model.js';

// Utility function to extract file tree and commands from AI response
const extractTextFromJsonMarkdown = (text) => {
    try {
        // Remove markdown code block markers and extract JSON
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
            return { fileTree: null, buildCommand: null, startCommand: null };
        }

        const jsonString = jsonMatch[1];
        const parsed = JSON.parse(jsonString);

        return {
            fileTree: parsed.fileTree || null,
            buildCommand: parsed.buildCommand || null,
            startCommand: parsed.startCommand || null,
            text: parsed.text || null
        };
    } catch (error) {
        console.error("Error parsing AI response:", error);
        return { fileTree: null, buildCommand: null, startCommand: null };
    }
};

// Save edited file content back to the latest AI message
export const saveEditedFile = async (req, res) => {
    try {
        const { projectId, filePath, fileName, content } = req.body;
        const { userId } = req.user;

        // Validate required fields
        if (!projectId || !filePath || !fileName || content === undefined) {
            return res.status(400).json({
                success: false,
                message: "ProjectId, filePath, fileName, and content are required"
            });
        }

        // Check if user has access to the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const userInProject = project.users.find(u => u.user.toString() === userId.toString());
        if (!userInProject) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this project"
            });
        }

        // Find the latest AI message for this project
        const latestAiMessage = await Message.findOne({ 
            projectId, 
            senderEmail: "@Ai" 
        }).sort({ createdAt: -1 });

        if (!latestAiMessage) {
            return res.status(404).json({
                success: false,
                message: "No AI message found for this project"
            });
        }

        // Extract current file structure from the AI message
        const { fileTree, buildCommand, startCommand, text } = extractTextFromJsonMarkdown(latestAiMessage.text);

        if (!fileTree) {
            return res.status(400).json({
                success: false,
                message: "No file structure found in the AI message"
            });
        }

        // Update the file content in the file tree
        const updatedFileTree = updateFileInTree(fileTree, filePath, content);

        // Reconstruct the AI message with updated file tree
        const updatedMessage = {
            text: text || "Updated project files",
            fileTree: updatedFileTree,
            buildCommand,
            startCommand
        };

        const updatedMessageText = `\`\`\`json\n${JSON.stringify(updatedMessage, null, 2)}\n\`\`\``;

        // Update the AI message
        await Message.findByIdAndUpdate(latestAiMessage._id, {
            text: updatedMessageText
        });

        res.status(200).json({
            success: true,
            message: "File saved successfully",
            filePath,
            fileName
        });

    } catch (error) {
        console.error("Error saving edited file:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save file",
            error: error.message
        });
    }
};

// Helper function to update a file in the file tree structure
function updateFileInTree(tree, targetPath, newContent) {
    const pathParts = targetPath.split('/');
    
    function updateRecursive(currentTree, parts) {
        if (parts.length === 1) {
            // We're at the file level
            const fileName = parts[0];
            if (currentTree[fileName] && currentTree[fileName].file) {
                return {
                    ...currentTree,
                    [fileName]: {
                        ...currentTree[fileName],
                        file: {
                            ...currentTree[fileName].file,
                            contents: newContent
                        }
                    }
                };
            }
            return currentTree;
        } else {
            // We're in a directory
            const dirName = parts[0];
            const remainingParts = parts.slice(1);
            
            if (currentTree[dirName] && currentTree[dirName].directory) {
                return {
                    ...currentTree,
                    [dirName]: {
                        ...currentTree[dirName],
                        directory: updateRecursive(currentTree[dirName].directory, remainingParts)
                    }
                };
            }
            return currentTree;
        }
    }
    
    return updateRecursive(tree, pathParts);
}

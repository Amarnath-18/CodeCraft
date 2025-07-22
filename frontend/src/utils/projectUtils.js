/**
 * Utility functions for ProjectPage components
 */

/**
 * Extracts text and structured data from JSON markdown format
 * @param {string} input - The input string containing JSON markdown
 * @returns {Object} - Parsed object with text, fileTree, buildCommand, startCommand
 */
export const extractTextFromJsonMarkdown = (input) => {
  const match = input.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match) return { text: input }; // fallback

  try {
    const parsed = JSON.parse(match[1]);
    console.log(parsed);

    return {
      text: parsed.text || "",
      fileTree: parsed.fileTree || null,
      buildCommand: parsed.buildCommand || null,
      startCommand: parsed.startCommand || null,
    };
  } catch (err) {
    console.error("Invalid JSON from AI:", err);
    return { text: input };
  }
};

/**
 * Updates file content in nested file tree structure
 * @param {Object} tree - The file tree object
 * @param {string} filePath - Path to the file to update
 * @param {string} newContent - New content for the file
 * @returns {Object} - Updated file tree
 */
export const updateFileContent = (tree, filePath, newContent) => {
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



/**
 * Formats user email for display
 * @param {string} email - User email
 * @returns {string} - Formatted email or fallback
 */
export const formatUserEmail = (email) => {
  if (!email) return "Unknown User";
  return email;
};

/**
 * Generates avatar URL for user
 * @param {string} email - User email
 * @returns {string} - Avatar URL
 */
export const getAvatarUrl = (email) => {
  return `/api/avatar/${email}`;
};

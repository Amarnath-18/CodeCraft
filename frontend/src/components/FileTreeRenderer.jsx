import React from "react";

/**
 * Renders file tree structure recursively
 * @param {Object} tree - The file tree object
 * @param {string} parentPath - Parent path for building full file paths
 * @param {Function} onFileClick - Callback function when a file is clicked
 * @returns {JSX.Element[]} - Array of JSX elements representing the file tree
 */
export const renderFileTree = (tree, parentPath = "", onFileClick) => {
  if (!tree) return null;

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': 'ri-javascript-line',
      'jsx': 'ri-reactjs-line',
      'ts': 'ri-typescript-line',
      'tsx': 'ri-reactjs-line',
      'html': 'ri-html5-line',
      'css': 'ri-css3-line',
      'json': 'ri-file-code-line',
      'md': 'ri-markdown-line',
      'py': 'ri-file-code-line',
      'default': 'ri-file-text-line'
    };
    return iconMap[extension] || iconMap.default;
  };

  return Object.entries(tree).map(([name, value]) => {
    if (value.file) {
      return (
        <div
          key={parentPath + name}
          className="tree-element cursor-pointer p-2 rounded-md hover:bg-blue-50 ml-4 my-1 transition-colors border border-transparent hover:border-blue-200"
          onClick={() => onFileClick({ name: parentPath + name, ...value.file })}
        >
          <div className="flex items-center gap-2">
            <i className={`${getFileIcon(name)} text-blue-600 text-sm`}></i>
            <p className="font-medium text-sm text-gray-700">{name}</p>
          </div>
        </div>
      );
    } else if (value.directory) {
      return (
        <div key={parentPath + name} className="ml-2 my-1">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-600 py-1">
            <i className="ri-folder-line text-yellow-600"></i>
            <span>{name}/</span>
          </div>
          <div className="ml-2">
            {renderFileTree(value.directory, parentPath + name + "/", onFileClick)}
          </div>
        </div>
      );
    } else if (typeof value === "object" && !value.file) {
      // Handle direct nested structure without 'directory' wrapper
      return (
        <div key={parentPath + name} className="ml-2 my-1">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-600 py-1">
            <i className="ri-folder-line text-yellow-600"></i>
            <span>{name}/</span>
          </div>
          <div className="ml-2">
            {renderFileTree(value, parentPath + name + "/", onFileClick)}
          </div>
        </div>
      );
    }
    return null;
  });
};

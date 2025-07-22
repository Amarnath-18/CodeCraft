import React from "react";
import { renderFileTree } from "./FileTreeRenderer";

const FileExplorer = ({ fileTrees, onFileSelect }) => {
  if (!fileTrees) {
    return (
      <div className="explorer h-full min-w-64 bg-gray-100 border-r border-gray-300 flex items-center justify-center">
        <div className="text-gray-500 text-sm text-center">
          <i className="ri-folder-line text-3xl block mb-2"></i>
          <p>No files available</p>
          <p className="text-xs mt-1">Files will appear here when generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explorer h-full min-w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
          <i className="ri-folder-open-line text-lg text-gray-600"></i>
          <h3 className="font-semibold text-gray-700">Project Files</h3>
        </div>
        <div className="file-tree">
          {renderFileTree(fileTrees, "", onFileSelect)}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;

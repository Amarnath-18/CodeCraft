import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ currentFile, onFileChange, onFileClose }) => {
  if (!currentFile) {
    return (
      <div className="code-editor flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <i className="ri-file-code-line text-4xl mb-3 block"></i>
          <p className="text-lg font-medium">No file selected</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const handleEditorChange = (value) => {
    onFileChange(value);
  };

  const getLanguageFromFileName = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'sh': 'shell',
      'dockerfile': 'dockerfile',
    };
    return languageMap[extension] || currentFile.language || 'plaintext';
  };

  return (
    <div className="code-editor flex-1 flex flex-col">
      <div className="code-editor-header flex justify-between items-center p-3 bg-slate-400 border-b">
        <div className="flex items-center gap-2">
          <i className="ri-file-text-line text-gray-700"></i>
          <h1 className="truncate text-base md:text-lg font-medium text-gray-800">
            {currentFile.name}
          </h1>
        </div>
        <button
          onClick={onFileClose}
          className="p-2 rounded-full hover:bg-slate-300 transition-colors"
          title="Close file"
        >
          <i className="ri-close-line text-gray-700"></i>
        </button>
      </div>

      <div className="editor-container flex-1 bg-white">
        <Editor
          height="100%"
          language={getLanguageFromFileName(currentFile.name)}
          value={currentFile.contents}
          theme="vs-dark"
          options={{
            readOnly: false,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            folding: true,
            lineNumbers: "on",
            renderWhitespace: "selection",
            cursorBlinking: "blink",
            cursorSmoothCaretAnimation: true,
          }}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

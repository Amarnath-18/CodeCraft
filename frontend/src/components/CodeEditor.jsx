import React, { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ currentFile, onFileChange, onFileClose, onFileSave }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset unsaved changes when file changes
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [currentFile]);

  const handleEditorChange = (value) => {
    onFileChange(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || !onFileSave || !currentFile) return;

    setIsSaving(true);
    try {
      await onFileSave(currentFile);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, onFileSave, currentFile]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

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
            {hasUnsavedChanges && <span className="text-orange-600 ml-1">•</span>}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
              title="Save file (Ctrl+S)"
            >
              {isSaving ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-save-line"></i>
              )}
            </button>
          )}
          <button
            onClick={onFileClose}
            className="p-2 rounded-full hover:bg-slate-300 transition-colors"
            title="Close file"
          >
            <i className="ri-close-line text-gray-700"></i>
          </button>
        </div>
      </div>

      <div className="editor-container flex-1 bg-white">
        <Editor
          height="100%"
          language={getLanguageFromFileName(currentFile.name)}
          value={currentFile.contents}
          theme="vs-dark"
          options={{
            readOnly: false, // Make editor editable
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

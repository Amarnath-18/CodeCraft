import React, { useState, useEffect, useRef } from "react";

const ConsoleOutput = ({ runOutput, isRunning }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const outputRef = useRef();

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [runOutput]);

  // Auto-expand when running
  useEffect(() => {
    if (isRunning) {
      setIsExpanded(true);
    }
  }, [isRunning]);

  const getLastLine = () => {
    if (!runOutput) return "Ready to run";
    const lines = runOutput.trim().split('\n');
    return lines[lines.length - 1] || "Running...";
  };

  return (
    <div className="console-output">
      {/* Compact View */}
      {!isExpanded && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-1 bg-black text-green-400 rounded text-xs font-mono hover:bg-gray-800 transition-colors"
            title="Click to expand console"
          >
            <i className="ri-terminal-line"></i>
            <span className="max-w-md truncate">
              {getLastLine()}
            </span>
            <i className="ri-expand-up-down-line text-xs"></i>
          </button>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-white border border-gray-300 rounded-lg shadow-lg z-30">
          <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
            <div className="flex items-center gap-2">
              <i className="ri-terminal-line text-gray-600"></i>
              <span className="font-medium text-gray-700">Console Output</span>
              {isRunning && (
                <i className="ri-loader-4-line animate-spin text-blue-500"></i>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Minimize console"
            >
              <i className="ri-subtract-line text-gray-600"></i>
            </button>
          </div>
          <div
            ref={outputRef}
            className="bg-black text-green-400 p-3 h-64 overflow-auto text-xs font-mono"
          >
            {runOutput || "No output yet. Click 'Run Project' to start."}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsoleOutput;

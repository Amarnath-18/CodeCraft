import React from "react";
import ConsoleOutput from "./ConsoleOutput";

const ProjectRunner = ({
  onRunProject,
  isRunning,
  runOutput,
  previewUrl,
  showPreview,
  onTogglePreview,
}) => {
  return (
    <div className="project-runner">
      {/* Control Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onRunProject}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isRunning ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Running...
              </>
            ) : (
              <>
                <i className="ri-play-line mr-2"></i>
                Run Project
              </>
            )}
          </button>

          {previewUrl && (
            <button
              onClick={onTogglePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className={`${showPreview ? 'ri-eye-off-line' : 'ri-eye-line'} mr-2`}></i>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          )}
        </div>

        {/* Console Output Component */}
        <ConsoleOutput
          runOutput={runOutput}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
};



export default ProjectRunner;

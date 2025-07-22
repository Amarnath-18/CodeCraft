import React, { useContext, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../context/user.context";

// Import custom components
import ProjectChat from "./ProjectChat";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import ProjectRunner from "./ProjectRunner";
import ProjectSidebar from "./ProjectSidebar";

// Import custom hooks
import { useProjectData, useProjectMessages } from "../hooks/useProjectData";
import { useWebContainer } from "../hooks/useWebContainer";
import { useSocket } from "../hooks/useSocket";
import { extractTextFromJsonMarkdown } from "../utils/projectUtils";

const ProjectPage = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  // Get project ID from location state
  const projectId = location.state?._id;

  // Custom hooks for data management
  const { currentProject, loading, handleAddUser, handleUserRemove } = useProjectData(projectId);
  const { messages, messageText, setMessageText, addMessage, clearMessageText } = useProjectMessages(projectId);

  // WebContainer and file management
  const {
    fileTrees,
    currFile,
    runOutput,
    isRunning,
    previewUrl,
    showPreview,
    handleFileSelect,
    handleFileChange,
    runProject,
    togglePreview,
    setShowPreview,
  } = useWebContainer(messages);

  // Socket communication
  const handleMessageReceived = useCallback((msg) => {
    addMessage(msg);
    if (msg.senderEmail === "@Ai") {
      const { fileTree } = extractTextFromJsonMarkdown(msg.text);
      if (fileTree) {
        console.log("File tree received:", fileTree);
      }
    }
  }, [addMessage]);

  const { sendProjectMessage } = useSocket(projectId, handleMessageReceived);

  // Handle sending messages
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    console.log("Send Message calling");

    sendProjectMessage({
      text: messageText.trim(),
      senderEmail: user.email,
      projectId: currentProject._id,
    });

    addMessage({
      text: messageText.trim(),
      senderEmail: user.email,
    });

    clearMessageText();
  };

  // Loading state
  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }



  return (
    <main className="w-full h-full flex overflow-hidden">
      <section className="relative min-w-96 h-[calc(100vh-4rem)] p-2 bg-blue-800 flex flex-col ">
        <header className="flex p-2 rounded-2xl justify-between bg-blue-400">
          <h2 className="font-bold text-white px-2">{currentProject?.name}</h2>
          <button
            onClick={() => setIsSideBarOpen(true)}
            className="p-1 hover:bg-blue-500 cursor-pointer rounded-3xl transition-colors"
            title="Manage project members"
          >
            <i className="ri-group-line"></i>
          </button>
        </header>

        <ProjectChat
          messages={messages}
          messageText={messageText}
          setMessageText={setMessageText}
          onSendMessage={handleSendMessage}
          currentUser={user}
        />
      </section>

      {/* Right Panel - File Explorer and Main Content */}
      <section className="right flex min-h-full grow">
        <FileExplorer
          fileTrees={fileTrees}
          onFileSelect={handleFileSelect}
        />

        {/* Main Content Area with Tabs */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Top Controls */}
          <div className="bg-white border-b border-gray-200 p-3">
            <ProjectRunner
              onRunProject={runProject}
              isRunning={isRunning}
              runOutput={runOutput}
              previewUrl={previewUrl}
              showPreview={showPreview}
              onTogglePreview={togglePreview}
              onClosePreview={() => setShowPreview(false)}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <CodeEditor
                currentFile={currFile}
                onFileChange={handleFileChange}
                onFileClose={() => handleFileSelect(null)}
              />
            </div>

            {/* Preview Panel (when active) */}
            {showPreview && previewUrl && (
              <div className="w-1/2 border-l border-gray-300 bg-white">
                <div className="h-full flex flex-col">
                  <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
                    <span className="text-sm font-medium text-gray-700">
                      Preview: {previewUrl}
                    </span>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Close preview"
                    >
                      <i className="ri-close-line text-gray-600"></i>
                    </button>
                  </div>
                  <iframe
                    src={previewUrl}
                    className="flex-1 w-full border-0"
                    title="App Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Sidebar */}
      <ProjectSidebar
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
        currentProject={currentProject}
        onAddUser={handleAddUser}
        onRemoveUser={handleUserRemove}
      />
    </main>
  );
};

export default ProjectPage;

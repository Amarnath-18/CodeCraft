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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    handleFileSave,
    runProject,
    togglePreview,
    setShowPreview,
  } = useWebContainer(projectId, messages);

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
    <main className="w-full h-[calc(100vh-4rem)] flex overflow-hidden relative">
      {/* Main Content Area - Full Width */}
      <section className="flex h-full w-full">
        <FileExplorer
          fileTrees={fileTrees}
          onFileSelect={handleFileSelect}
        />

        {/* Main Content Area with Tabs */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Top Controls */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Chat toggle button */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Toggle chat"
              >
                <i className="ri-chat-3-line"></i>
                <span className="hidden sm:inline">Chat</span>
              </button>

              {/* Project name */}
              <h1 className="text-lg font-semibold text-gray-800">{currentProject?.name}</h1>

              {/* Members button */}
              <button
                onClick={() => setIsSideBarOpen(true)}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                title="Manage project members"
              >
                <i className="ri-group-line text-gray-600"></i>
              </button>

              {/* Project Runner */}
              <div className="ml-auto">
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
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor - Hidden when preview is shown */}
            {!showPreview && (
              <div className="flex-1 flex flex-col">
                <CodeEditor
                  currentFile={currFile}
                  onFileChange={handleFileChange}
                  onFileClose={() => handleFileSelect(null)}
                  onFileSave={handleFileSave}
                />
              </div>
            )}

            {/* Preview Panel - Takes full width when active */}
            {showPreview && previewUrl && (
              <div className="flex-1 bg-white">
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

      {/* Chat Sidebar Overlay */}
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Chat Sidebar */}
          <div className="fixed left-0 top-0 h-full w-96 bg-blue-800 z-50 flex flex-col shadow-xl">
            <header className="flex p-4 justify-between bg-blue-400">
              <h2 className="font-bold text-white">{currentProject?.name} - Chat</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-blue-500 cursor-pointer rounded-full transition-colors text-white"
                title="Close chat"
              >
                <i className="ri-close-line"></i>
              </button>
            </header>

            <ProjectChat
              messages={messages}
              messageText={messageText}
              setMessageText={setMessageText}
              onSendMessage={handleSendMessage}
              currentUser={user}
            />
          </div>
        </>
      )}

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

import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/AxiosInstance";
import toast from "react-hot-toast";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
// NOTE: Make sure CodeBlock is implemented or remove if not used.
// import CodeBlock from "./CodeBlock";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
  disconnectSocket,
} from "../config/socket";

const ProjectPageTest = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [currentProject, setCurrentProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const messageEndRef = useRef(null);
  const [fileTrees, setFileTrees] = useState([]);
  const [currFile, setCurrFile] = useState(null);
  
  // New state for responsive view management on mobile
  const [activeView, setActiveView] = useState("chat");

  // All your functions (handleAddButton, handleUserRemove, getProject, etc.) remain unchanged.
  // ... (previous functions are here, no changes needed)
  const handleAddButton = async ({ userEmail, projectId }) => {
    try {
      const response = await axiosInstance.post("/project/addUserToPorject", {
        email: userEmail,
        projectId,
      });
      toast.success("New User Added to the Project");
      setCurrentProject(response.data.project);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while adding user");
    }
  };
  const handleUserRemove = async (userId) => {
    try {
      const userToRemove = userId;
      await axiosInstance.delete(`/project/removeUser/${currentProject._id}`, {
        data: { userToRemove },
      });
      console.log("User Removed");
      toast.success("User Removed");
      getProject(currentProject._id);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response.data.message);
    }
  };

  async function getProject(projectId) {
    try {
      const updatedProject = await axiosInstance.get(`/project/${projectId}`);
      setCurrentProject(updatedProject.data.project);
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong!!");
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage("project-message", {
      text: messageText.trim(),
      senderEmail: user.email,
      projectId: currentProject._id,
    });
    setMessages((prev) => [
      ...prev,
      {
        text: messageText.trim(),
        senderEmail: user.email,
      },
    ]);
    setMessageText("");
  };

  const extractTextFromJsonMarkdown = (input) => {
    const match = input.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) return { text: input };
    try {
      const parsed = JSON.parse(match[1]);
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

  useEffect(() => {
    if (!currentProject?._id) return;
    const socket = initializeSocket(currentProject._id);
    const handleIncomingMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.senderEmail === "@Ai") {
        const { fileTree } = extractTextFromJsonMarkdown(msg.text);
        if (fileTree) setFileTrees(fileTree);
      }
    };
    receiveMessage("project-message", handleIncomingMessage);
    return () => {
      socket.off("project-message", handleIncomingMessage);
      disconnectSocket();
    };
  }, [currentProject]);

  async function loadMessages(projectId) {
    try {
      const res = await axiosInstance.get(`/messages/${projectId}`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  }

  useEffect(() => {
    if (location.state?._id) {
      getProject(location.state._id);
      loadMessages(location.state._id);
    }
  }, [location.state]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Update what happens when a file is clicked to also change the active view on mobile
  const handleFileClick = (file) => {
    setCurrFile(file);
    setActiveView("code");
  };

  // Update what happens when the code viewer is closed
  const handleCloseCode = () => {
    setCurrFile(null);
    setActiveView("files"); // Go back to the file explorer on mobile
  };

  const renderFileTree = (tree, parentPath = "") => {
    if (!tree) return null;
    return Object.entries(tree).map(([name, value]) => {
      const fullPath = parentPath + name;
      if (value.file) {
        return (
          <div
            key={fullPath}
            className="tree-element cursor-pointer p-2 rounded-md hover:bg-amber-500 bg-gray-300 ml-4 my-1"
            onClick={() => handleFileClick({ name: fullPath, ...value.file })}
          >
            <p className="font-semibold text-sm truncate">{name}</p>
          </div>
        );
      } else if (value.directory) {
        return (
          <div key={fullPath} className="ml-2 my-1">
            <div className="font-bold text-base text-gray-800">{name}/</div>
            <div className="ml-2">
              {renderFileTree(value.directory, fullPath + "/")}
            </div>
          </div>
        );
      }
      return null;
    });
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Container for the three main panels */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel: Conversation */}
        <section
          className={`h-full bg-blue-800 flex flex-col w-full md:w-96 md:flex-shrink-0 ${
            activeView === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <header className="flex p-2 justify-between items-center bg-blue-400 flex-shrink-0">
            <h2 className="font-bold text-white px-2">Conversation</h2>
            <button
              onClick={() => setIsSideBarOpen(true)}
              className="p-1 hover:bg-blue-500 cursor-pointer rounded-full text-xl"
            >
              <i className="ri-group-line"></i>
            </button>
          </header>
          <div className="flex flex-col flex-1 min-h-0 p-2">
            <div className="messageArea no-scrollbar flex-1 p-2 gap-2 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`bg-amber-50 max-w-xs p-2 flex flex-col rounded-2xl break-words ${
                    msg.senderEmail === user?.email ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div className="flex items-center p-1 gap-2">
                    <img
                      className="h-5 w-5 rounded-full"
                      src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${msg.senderEmail}`}
                      alt="avatar"
                    />
                    <p className="text-xs font-semibold opacity-60 truncate">
                      {msg.senderEmail}
                    </p>
                  </div>
                  {msg.senderEmail === "@Ai" ? (
                    <div className="bg-gray-800 text-gray-100 p-3 rounded-xl text-sm w-fit overflow-hidden">
                      <Markdown>{extractTextFromJsonMarkdown(msg.text).text}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap px-1">
                      {msg.text}
                    </p>
                  )}
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            <div className="inputBox bg-blue-500 w-full rounded-2xl flex mt-2 flex-shrink-0">
              <input
                type="text"
                className="rounded-l-2xl flex-1 outline-none p-3 text-sm"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
              />
              <button
                className="p-3 cursor-pointer rounded-r-2xl text-xl"
                onClick={handleSendMessage}
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel: Explorer and Code Editor */}
        <section className="flex flex-1 min-w-0 h-full">
          {/* File Explorer */}
          <div
            className={`explorer h-full min-w-52 bg-amber-400 overflow-y-auto p-2 w-full md:w-64 ${
              (activeView === "files" && !currFile) || currFile ? "block" : "hidden"
            } ${currFile ? "hidden md:block" : "block"}`}
          >
            <h2 className="font-bold text-gray-800 p-2 text-lg">File Explorer</h2>
            {fileTrees && renderFileTree(fileTrees)}
          </div>

          {/* Code Editor */}
          <div
            className={`code-editor flex-1 min-h-0 w-full flex-col ${
              activeView === "code" && currFile ? "flex" : "hidden md:flex"
            }`}
          >
            {currFile ? (
              <>
                <div className="code-editor-header flex justify-between items-center p-2 bg-slate-400 flex-shrink-0">
                  <h1 className="truncate text-base md:text-lg font-semibold">{currFile.name}</h1>
                  <button
                    onClick={handleCloseCode}
                    className="p-2 rounded-full hover:bg-slate-300 transition"
                    title="Close File"
                  >
                    <i className="ri-close-line text-xl text-gray-700"></i>
                  </button>
                </div>
                <pre className="p-4 bg-gray-800 text-white flex-1 overflow-auto text-xs md:text-sm">
                  <code>{currFile.contents}</code>
                </pre>
              </>
            ) : (
                <div className="hidden md:flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                    <p>Select a file to view its contents</p>
                </div>
            )}
          </div>
        </section>
      </div>

      {/* Mobile Navigation - visible only on small screens */}
      <nav className="md:hidden flex justify-around p-2 bg-blue-900 text-white flex-shrink-0">
        <button onClick={() => setActiveView("chat")} className={`px-4 py-2 rounded ${activeView === 'chat' ? 'bg-blue-600' : ''}`}>Chat</button>
        <button onClick={() => setActiveView("files")} className={`px-4 py-2 rounded ${activeView === 'files' ? 'bg-amber-600' : ''}`}>Files</button>
        <button onClick={() => setActiveView("code")} className={`px-4 py-2 rounded ${activeView === 'code' ? 'bg-slate-600' : ''}`} disabled={!currFile}>Code</button>
      </nav>

      {/* Sidebar for Project Members (no changes needed) */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSideBarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Project Members
            </h2>
            <button
              onClick={() => setIsSideBarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Add Member
            </h3>
            <div className="flex gap-2">
              <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                type="email"
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() =>
                  handleAddButton({ userEmail, projectId: currentProject._id })
                }
                className="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Members ({currentProject.users.length})
            </h3>
            <div className="space-y-3">
              {currentProject.users.map((user) => (
                <div
                  key={user.user._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <img
                      src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.user?.email}`}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {user.user?.email}
                    </p>
                    <p className="text-xs text-blue-600">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => handleUserRemove(user.user._id)}
                    className="p-2 hover:bg-red-100 rounded-full"
                  >
                    <i className="ri-subtract-line text-red-500"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setIsSideBarOpen(false)}
        ></div>
      )}
    </main>
  );
};

export default ProjectPageTest;
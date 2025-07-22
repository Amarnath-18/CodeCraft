import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/AxiosInstance";
import toast from "react-hot-toast";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import Editor from "@monaco-editor/react";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
  disconnectSocket,
} from "../config/socket"; // or your actual socket path
import { getWebContainer } from "../config/webContainerInstance";

const ProjectPage = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState();
  const [currentProject, setCurrentProject] = useState();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const messageEndRef = useRef();
  const [fileTrees, setFileTrees] = useState([]);
  const [currFile, setCurrFile] = useState(null);
  const [webContainer, setWebContainer] = useState();

  const [runOutput, setRunOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const runProject = async () => {
    if (!webContainer || !fileTrees) return;
    setIsRunning(true);
    setRunOutput("");

    let buildCommand, startCommand;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderEmail === "@Ai") {
        const parsed = extractTextFromJsonMarkdown(messages[i].text);
        buildCommand = parsed.buildCommand;
        startCommand = parsed.startCommand;
        break;
      }
    }

    try {
      if (!webContainer.isMounted) {
        await webContainer.mount(fileTrees);
      }

      // Listen for server events
      webContainer.on('server-ready', (port, url) => {
        setRunOutput((prev) => prev + `\n🌐 Server detected on port ${port}: ${url}\n`);
        setPreviewUrl(url);
        setShowPreview(true);
      });

      // Build command
      if (buildCommand?.mainItem && Array.isArray(buildCommand.commands)) {
        setRunOutput((prev) => prev + "\n=== Running build command ===\n");
        const buildProcess = await webContainer.spawn(buildCommand.mainItem, buildCommand.commands);
        
        buildProcess.output.pipeTo(new WritableStream({
          write(data) {
            setRunOutput((prev) => prev + data);
          }
        }));
        
        await buildProcess.exit;
      }

      // Start command
      if (startCommand?.mainItem && Array.isArray(startCommand.commands)) {
        setRunOutput((prev) => prev + "\n=== Starting project ===\n");
        const startProcess = await webContainer.spawn(startCommand.mainItem, startCommand.commands);
        
        startProcess.output.pipeTo(new WritableStream({
          write(data) {
            setRunOutput((prev) => prev + data);
            
            // Check if server started message appears
            if (data.includes('Server is running on port')) {
              setTimeout(async () => {
                try {
                  const url = await webContainer.url(3001);
                  setRunOutput((prev) => prev + `\n🌐 Auto-detected server: ${url}\n`);
                  setPreviewUrl(url);
                  setShowPreview(true);
                } catch (err) {
                  console.log("Auto-detection failed:", err);
                }
              }, 2000);
            }
          }
        }));
      }
    } catch (err) {
      setRunOutput((prev) => prev + "\nError: " + err.message);
    }

    setIsRunning(false);
  };


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
    console.log("Send Message calling");

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

  useEffect(() => {
    if (!currentProject?._id) return;

    const socket = initializeSocket(currentProject._id);
    console.log("Project Message Calling");
    if (!webContainer) {
      async function startWebContainer() {
        try {
          const response = await getWebContainer();
          setWebContainer(response);
          console.log("WebContainer Started..");
        } catch (error) {
          console.log(error);
        }
      }
      startWebContainer();
    }
    const handleIncomingMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.senderEmail === "@Ai") {
        const { fileTree } = extractTextFromJsonMarkdown(msg.text);

        if (fileTree) {
          console.log(fileTree);
          setFileTrees(fileTree);
        }
      }
    };

    receiveMessage("project-message", handleIncomingMessage);

    return () => {
      socket.off("project-message", handleIncomingMessage); // ✅ prevent leak
      disconnectSocket();
    };
  }, [currentProject]);

  async function loadMessages(projectId) {
    try {
      const res = await axiosInstance.get(`/messages/${projectId}`);
      setMessages(res.data.messages);
      console.log(messages);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  }

  useEffect(() => {
    if (location.state._id) {
      getProject(location.state._id);
      loadMessages(location.state._id); // ✅ load past messages
    }
  }, [location.state]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentProject)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );

  const extractTextFromJsonMarkdown = (input) => {
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

  const renderFileTree = (tree, parentPath = "") => {
    if (!tree) return null;
    return Object.entries(tree).map(([name, value]) => {
      if (value.file) {
        return (
          <div
            key={parentPath + name}
            className="tree-element cursor-pointer p-2 rounded-md bg-gray-300 ml-4 my-1"
            onClick={() =>
              setCurrFile({ name: parentPath + name, ...value.file })
            }
          >
            <p className="font-semibold text-sm">{name}</p>
          </div>
        );
      } else if (value.directory) {
        return (
          <div key={parentPath + name} className="ml-2 my-1">
            <div className="font-bold text-base">{name}/</div>
            <div className="ml-2">
              {renderFileTree(value.directory, parentPath + name + "/")}
            </div>
          </div>
        );
      } else if (typeof value === "object" && !value.file) {
        // Handle direct nested structure without 'directory' wrapper
        return (
          <div key={parentPath + name} className="ml-2 my-1">
            <div className="font-bold text-base">{name}/</div>
            <div className="ml-2">
              {renderFileTree(value, parentPath + name + "/")}
            </div>
          </div>
        );
      }
      return null;
    });
  };

  // Helper to update file content in nested file tree
  function updateFileContent(tree, filePath, newContent) {
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
  }

  return (
    <main className="w-full h-full flex overflow-hidden">
      <section className="relative min-w-96 h-[calc(100vh-4rem)] p-2 bg-blue-800 flex flex-col ">
        <header className="flex p-2 rounded-2xl justify-end bg-blue-400 ">
          <button
            onClick={() => setIsSideBarOpen(true)}
            className="p-1 hover:bg-blue-500 cursor-pointer rounded-3xl"
          >
            <i className="ri-group-line"></i>
          </button>
        </header>
        <div className="conversationArea max-w-96 grow flex flex-col">
          <div className="messageArea no-scrollbar grow flex flex-col p-2 gap-2 overflow-y-auto max-h-[550px] ">
            {messages &&
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`bg-amber-50 max-w-44 p-2 flex-col rounded-2xl break-words ${
                    msg.senderEmail === user?.email ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div className="flex justify-center items-center p-1 gap-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      <img
                        className="h-4 w-4 rounded-2xl"
                        src={`/api/avatar/${msg.senderEmail}`}
                        alt="avatar"
                      />
                    </div>
                    <p className="text-sm opacity-55 ">{msg.senderEmail}</p>
                  </div>

                  {msg.senderEmail === "@Ai" ? (
                    <div className="bg-gray-600 text-gray-100 p-3 rounded-xl w-fit overflow-hidden">
                      {(() => {
                        const { text } = extractTextFromJsonMarkdown(msg.text);
                        console.log(text);
                        return (
                          <div className="space-y-3">
                            <Markdown>{text}</Markdown>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}
                </div>
              ))}
            <div ref={messageEndRef} />
          </div>

          <div className="inputBox bg-blue-500 w-full  rounded-2xl flex">
            <input
              type="text"
              className="rounded- grow outline-none p-2"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="p-2 cursor-pointer rounded-2xl"
              onClick={handleSendMessage}
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="right flex  min-h-full grow bg-amber-200">
        <div className="explorer h-full min-w-52 bg-amber-400 ">
          {fileTrees && renderFileTree(fileTrees)}
        </div>
        <div className="code-editor flex-1 min-h-0 w-96">
          <div className="p-2">
            <div className="p-2">
              <button
                onClick={runProject}
                disabled={isRunning}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
              >
                {isRunning ? "Running..." : "Run Project"}
              </button>
              {previewUrl && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              )}
            </div>
            <pre className="bg-black text-green-400 p-2 mt-2 rounded max-h-40 overflow-auto text-xs">
              {runOutput}
            </pre>
          </div>
          {showPreview && previewUrl && (
            <div className="mt-4 border rounded">
              <div className="bg-gray-100 p-2 flex justify-between items-center">
                <span className="text-sm font-medium">Preview: {previewUrl}</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <iframe
                src={previewUrl}
                className="w-full h-96 border-0"
                title="App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          )}
          {currFile && (
            <div className="code-editor-header flex justify-between items-center p-2 bg-slate-400">
              <h1 className="truncate text-base md:text-lg">{currFile.name}</h1>
              <button
                onClick={() => setCurrFile(null)}
                className="p-2 rounded-full hover:bg-slate-300 transition"
                title="Close"
              ></button>
            </div>
          )}
          {currFile && (
            <pre className="p-2 md:p-4 bg-white rounded-b-lg overflow-auto flex-1 min-h-0 max-h-[40vh] md:max-h-[calc(100vh-8rem)] text-xs md:text-sm">
              <Editor
                height="80vh"
                language={currFile.language || "javascript"}
                value={currFile.contents}
                theme="vs-dark"
                options={{
                  readOnly: false,
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
                onChange={(value) => {
                  setCurrFile((prev) => ({ ...prev, contents: value }));
                  setFileTrees((prev) =>
                    updateFileContent(prev, currFile.name, value)
                  );
                }}
              />
            </pre>
          )}
        </div>
      </section>

      {/* Simple Sidebar from left */}
      <div
        className={`fixed left-0 top-0 h-screen w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
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
          {/* Add Member Section */}
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

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Members ({currentProject.users.length})
            </h3>
            <div className="space-y-3">
              {currentProject.users.map((user) => {
                return (
                  <div
                    key={user.user._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      <img
                        className="h-4 w-4 rounded-2xl"
                        src={`/api/avatar/${user?.user?.email}`}
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay with blur effect */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setIsSideBarOpen(false)}
        ></div>
      )}
    </main>
  );
};

export default ProjectPage;

import { useState, useEffect } from "react";
import axiosInstance from "../config/AxiosInstance";
import toast from "react-hot-toast";

/**
 * Custom hook for managing project data and operations
 */
export const useProjectData = (projectId) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProject = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/project/${id}`);
      setCurrentProject(response.data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async ({ userEmail, projectId }) => {
    try {
      const response = await axiosInstance.post("/project/addUserToPorject", {
        email: userEmail,
        projectId,
      });
      toast.success("New User Added to the Project");
      setCurrentProject(response.data.project);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Something went wrong while adding user");
    }
  };

  const handleUserRemove = async (userId) => {
    try {
      await axiosInstance.delete(`/project/removeUser/${currentProject._id}`, {
        data: { userToRemove: userId },
      });
      toast.success("User Removed");
      await getProject(currentProject._id);
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error(error.response?.data?.message || "Failed to remove user");
    }
  };

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId]);

  return {
    currentProject,
    loading,
    getProject,
    handleAddUser,
    handleUserRemove,
  };
};

/**
 * Custom hook for managing messages and chat functionality
 */
export const useProjectMessages = (projectId) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const loadMessages = async (id) => {
    try {
      const response = await axiosInstance.get(`/messages/${id}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessageText = () => {
    setMessageText("");
  };

  useEffect(() => {
    if (projectId) {
      loadMessages(projectId);
    }
  }, [projectId]);

  return {
    messages,
    messageText,
    setMessages,
    setMessageText,
    addMessage,
    clearMessageText,
    loadMessages,
  };
};

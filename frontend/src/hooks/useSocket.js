import { useEffect } from "react";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
  disconnectSocket,
} from "../config/socket";

/**
 * Custom hook for managing socket communication
 */
export const useSocket = (projectId, onMessageReceived) => {
  useEffect(() => {
    if (!projectId) return;

    const socket = initializeSocket(projectId);
    console.log("Socket initialized for project:", projectId);

    const handleIncomingMessage = (msg) => {
      onMessageReceived(msg);
    };

    receiveMessage("project-message", handleIncomingMessage);

    return () => {
      socket.off("project-message", handleIncomingMessage);
      disconnectSocket();
    };
  }, [projectId, onMessageReceived]);

  const sendProjectMessage = (messageData) => {
    sendMessage("project-message", messageData);
  };

  return {
    sendProjectMessage,
  };
};

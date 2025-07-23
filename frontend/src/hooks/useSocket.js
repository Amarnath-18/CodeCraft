import { useEffect, useCallback, useRef } from "react";
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
  const socketRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!projectId) return;

    // Prevent multiple initializations
    if (socketRef.current) return;

    const socket = initializeSocket(projectId);
    socketRef.current = socket;
    console.log("Socket initialized for project:", projectId);

    const handleIncomingMessage = (msg) => {
      callbackRef.current(msg);
    };

    receiveMessage("project-message", handleIncomingMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("project-message", handleIncomingMessage);
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [projectId]);

  const sendProjectMessage = useCallback((messageData) => {
    sendMessage("project-message", messageData);
  }, []);

  return {
    sendProjectMessage,
  };
};


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
    if (socketRef.current) return;

    try {
      const socket = initializeSocket(projectId);
      socketRef.current = socket;
      
      // Add connection debugging
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        
        // Handle authentication errors
        if (error.message.includes('Auth token required') || 
            error.message.includes('Invalid or expired token') ||
            error.message.includes('Authentication failed')) {
          console.error('❌ Authentication error - redirecting to login');
          // Clear invalid token
          localStorage.removeItem('token');
          // You might want to redirect to login or show an error
          window.location.href = '/login';
        }
      });
      
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      if (error.message.includes('Authentication token required')) {
        // Handle case where token is missing
        console.error('❌ No auth token - redirecting to login');
        window.location.href = '/login';
      }
    }

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



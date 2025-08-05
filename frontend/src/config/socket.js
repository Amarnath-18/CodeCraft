import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }
  
  if (socketInstance) {
    socketInstance.disconnect();
  }

  const token = localStorage.getItem('token');
  const wsUrl = import.meta.env.VITE_API_URL_WS;
  
  if (!token) {
    console.error('No auth token found for socket connection');
    throw new Error('Authentication token required for socket connection');
  }
  
  if (!projectId) {
    console.error('No project ID provided for socket connection');
    throw new Error('Project ID required for socket connection');
  }
  
  if (!wsUrl || wsUrl.includes('your-backend-domain.com')) {
    console.error('Invalid WebSocket URL configuration:', wsUrl);
    throw new Error('WebSocket URL not properly configured');
  }
  
  // Validate token format (basic check)
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
  } catch (error) {
    console.error('Invalid token format:', error);
    localStorage.removeItem('token');
    throw new Error('Invalid authentication token');
  }
  
  console.log('Initializing socket connection...', { 
    projectId, 
    hasToken: !!token, 
    wsUrl: wsUrl 
  });
  
  socketInstance = io(wsUrl, {
    auth: {
      token: token,
    },
    query: {
      projectId,
    },
    transports: ['polling', 'websocket'], // Try polling first in production
    upgrade: true,
    timeout: 20000,
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    autoConnect: true
  });
  
  // Add error handling for connection issues
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (error.message.includes('Auth token required') || 
        error.message.includes('Invalid or expired token') ||
        error.message.includes('Authentication failed') ||
        error.message.includes('Token blacklisted')) {
      // Token-related errors - redirect to login or refresh token
      console.error('Authentication error, token may be invalid');
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
  });
  
  socketInstance.on('connect', () => {
    console.log('Socket connected successfully:', socketInstance.id);
  });
  
  socketInstance.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server forcefully disconnected, might be due to auth issues
      console.log('Server disconnected socket, checking authentication...');
    }
  });

  return socketInstance;
};


export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const receiveMessage = (eventName, cb) => {
  if (socketInstance) {
    socketInstance.on(eventName, cb);
  }
};

export const sendMessage = (eventName, data) => {
  if (socketInstance) {
    socketInstance.emit(eventName, data);
  }
};



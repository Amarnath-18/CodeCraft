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
  socketInstance = io(import.meta.env.VITE_API_URL_WS, {
    auth: {
      token: token,
    },
    query: {
      projectId,
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



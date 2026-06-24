import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    let socketClient;

    if (isAuthenticated && user) {
      const backendUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '') 
        : window.location.origin;

      socketClient = io(backendUrl, {
        withCredentials: true,
      });

      // Register active user
      socketClient.emit('registerUser', user.id || user._id);
      setSocket(socketClient);

      console.log('Socket Client connected and user registered');
    }

    return () => {
      if (socketClient) {
        socketClient.disconnect();
        console.log('Socket Client disconnected');
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

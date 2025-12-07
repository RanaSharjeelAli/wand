import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function useSocket(serverUrl) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      upgrade: false,
      auth: {
        token: token || null
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  return socket;
}

export default useSocket;
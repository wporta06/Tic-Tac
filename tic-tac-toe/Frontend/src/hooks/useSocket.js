import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_GAME_ENGINE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('User connected :: ', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Usser disconnected :: ', newSocket.id);
    });

    return () => newSocket.close();
  }, []);

  return [socket, setSocket];
};

export default useSocket;

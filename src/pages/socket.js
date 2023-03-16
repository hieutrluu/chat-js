import { io } from 'socket.io-client';
let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:9000');
  }
  return socket;
};

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (setLanGames, setScreen, setRoomId, setIsHost, setRoomData) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In production, connect to same origin; in dev, use Vite proxy (undefined = current page)
    const serverUrl = import.meta.env.PROD ? window.location.origin : undefined;
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      newSocket.emit('requestRoomList');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('roomCreated', (room) => {
      console.log('Room created:', room);
      setRoomId(room.id);
      setIsHost(true);
      setRoomData(room);
      setScreen('lan_waiting');
    });

    newSocket.on('roomList', (rooms) => {
      // roomList usually comes as an array from server based on broadcastRoomList()
      setLanGames(rooms);
    });

    newSocket.on('roomJoined', (room) => {
      console.log('Joined room:', room);
      setRoomId(room.id);
      setIsHost(false);
      setRoomData(room);
      setScreen('lan_waiting');
    });

    newSocket.on('roomUpdated', (room) => {
      console.log('Room updated:', room);
      setRoomData(room);
    });

    newSocket.on('gameStarted', (room) => {
      console.log('Game started:', room);
      setRoomData(room);
      setScreen('lan_playing');
    });

    newSocket.on('gameUpdated', (room) => {
      console.log('Game updated:', room);
      setRoomData(room);
    });

    newSocket.on('gameReset', (room) => {
      console.log('Game reset:', room);
      setRoomData(room);
      setScreen('lan_waiting');
    });

    newSocket.on('roomClosed', ({ message }) => {
      console.log('Room closed:', message);
      alert(message);
      setRoomData(null);
      setRoomId(null);
      setIsHost(false);
      setScreen('lan_lobby');
    });

    newSocket.on('error', (msg) => {
      alert('Error: ' + msg);
    });

    return () => newSocket.close();
  }, [setLanGames, setScreen, setRoomId, setIsHost, setRoomData]);

  return { socket, isConnected };
};

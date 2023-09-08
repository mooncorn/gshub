import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected\n');
});

socket.on('minecraft/consoleOutput', (data) => {
  console.log(data);
});

socket.on('minecraft/started', () => {
  console.log('MINECRAFT SERVER STARTED\n');
});

socket.on('minecraft/stopped', () => {
  console.log('MINECRAFT SERVER STOPPED\n');
});

socket.on('valheim/consoleOutput', (data) => {
  console.log(data);
});

socket.on('valheim/started', () => {
  console.log('VALHEIM SERVER STARTED\n');
});

socket.on('valheim/stopped', () => {
  console.log('VALHEIM SERVER STOPPED\n');
});

socket.on('disconnect', () => {
  console.log('Disconnected\n');
});

import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected\n');
});

socket.on('minecraft/consoleOutput', (data) => {
  console.log(data);
});

socket.on('minecraft/statusChanged', (status) => {
  console.log(`MINECRAFT SERVER STATUS CHANGED: ${status}\n`);
});

socket.on('valheim/consoleOutput', (data) => {
  console.log(data);
});

socket.on('valheim/statusChanged', (status) => {
  console.log(`VALHEIM SERVER STATUS CHANGED: ${status}\n`);
});

socket.on('disconnect', () => {
  console.log('Disconnected\n');
});

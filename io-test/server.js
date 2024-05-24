const io = require('socket.io-client');

// Replace 'http://localhost:3000' with the URL of your Socket.IO server
const socket = io('http://localhost:3001');

// Listen for the connection event
socket.on('connect', () => {
  console.log('Connected to the server');
});

// Listen for the response to the test event
socket.on('/test/consoleOutput', (data) => {
  console.log('/test - consoleOutput:', data);
});

socket.on('/test/statusChanged', (data) => {
  console.log('/test - statusChanged:', data);
});

// Listen for disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

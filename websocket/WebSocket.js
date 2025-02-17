require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const axios = require('axios');
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const api_uri = process.env.API_URI;
const io = new Server(httpServer, {
  cors: { origin: "*" },
  pingTimeout: process.env.PING_TIMEOUT,
  pingInterval: process.env.PING_INTERVAL,
});
app.use(bodyParser.json());

io.of('/priv').on('connection', (socket) => {
  console.log('\x1b[33m%s\x1b[0m', '/priv connection ' + socket.id);
  axios.post(api_uri + '/websocket/auth', { token: socket.handshake.auth.token })
    .then(response => {
      const user = response.data.user;
      io.of('/priv').emit('user_online', user);
      console.log('\x1b[32m%s\x1b[0m', '/priv user_online: ' + user.name);

      socket.on("disconnect", (reason) => {
        console.log('\x1b[33m%s\x1b[0m', '/priv user_offline: ' + user.name);
        console.log('\x1b[33m%s\x1b[0m', '/priv disconnection: ' + socket.id + ' (' + reason + ')');
        io.of('/priv').emit('user_offline', user);
      });

      // Listen for task updates
      socket.on('task_update', (task) => {
        io.of('/priv').emit('task_updated', task);
      });
    })
    .catch(() => {
      console.log('\x1b[33m%s\x1b[0m', '/priv error: ' + socket.id);
      socket.disconnect();
    });
});

// Route handler for /task_updated
app.post('/task_updated', (req, res) => {
  const task = req.body.task;
  console.log('\x1b[32m%s\x1b[0m', 'Task updated: ' + task.id);
  io.of('/priv').emit('task_updated', task);
  res.status(200).send('Task update broadcasted');
});

httpServer.listen(process.env.LISTEN_PORT, () => {
  console.log('WebSocket started on port ' + process.env.LISTEN_PORT + '...');
});
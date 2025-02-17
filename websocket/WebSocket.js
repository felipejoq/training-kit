/*
ETK - Eniwer Training Kit
Copyright (C) 2025 Felipe Andrés Solís Albanese

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');



if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: process.env.PORT || 3000 + i
    });
  }
  
  return setupPrimary();
}

async function main() {
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
    );
  `);
      
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    adapter: createAdapter()
  });

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  // In-memory store for nicknames
  const nicknames = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Send existing nickname to the newly connected client
    const currentNickname = nicknames[socket.id] || 'Anonymous';
    socket.emit('notification', `${currentNickname} has joined the chat.`);

    // Handle nickname setting
    socket.on('set nickname', (nickname) => {
      // Update nickname store and notify all clients
      nicknames[socket.id] = nickname;
      socket.broadcast.emit('notification', `${nickname} has joined the chat.`);
    });

    // Handle chat messages
    socket.on('chat message', async (msg, clientOffset, callback) => {
      let result;
      try {
        result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
      } catch (e) {
        if (e.errno === 19 /* SQLITE_CONSTRAINT */ ) {
          callback();
        } else {
          // nothing to do, just let the client retry
        }
        return;
      }

      // Broadcast the message to all clients except the sender
      socket.broadcast.emit('chat message', msg, result.lastID, nicknames[socket.id] || 'Anonymous');
      
      if (typeof callback === 'function') {
        callback();
      }
      
    });

    // Handle typing notifications
    socket.on('typing', () => {
      socket.broadcast.emit('typing', nicknames[socket.id] || 'Anonymous');
    });

    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', nicknames[socket.id] || 'Anonymous');
    });

    // Send previous messages to the new client
    if (!socket.recovered) {
      db.each('SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id, 'Anonymous'); // Default nickname
        }
      ).catch(e => console.log("Error sending previous messages:", e));
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      io.emit('notification', `${nicknames[socket.id] || socket.id} has left the chat.`);
      delete nicknames[socket.id];
    });
  });

  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
}

main();

const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const serveStatic = require('serve-static');
const crypto = require('crypto');
const randomId = () => crypto.randomBytes(8).toString('hex');

const PORT = process.env.PORT || 3003;
const dirPath = path.join(__dirname, './dist');

const { Cache } = require('./Cache.js');
const sessionCache = new Cache(path.resolve(__dirname, 'sessions.json'));

const {
  printJson,
  warn,
  highlight,
  info,
  success,
} = require('./utils/colors.js');

const server = express()
  .use(serveStatic(dirPath))
  .listen(PORT, () => {
    console.log(`Client running from ${dirPath}`);
    console.log(highlight(`Listening on http://localhost:${PORT}`));
    console.log('');
    sessionCache.print(null, 'Past Sessions:');
  });
const io = socketIO(server);

io.use((socket, next) => {
  const { sessionID, userID, username } = socket.handshake.auth;
  console.log(
    warn(
      sessionID || 'No stored session',
      '\t',
      userID || 'No userID',
      '\t',
      username || 'No username'
    )
  );

  // if first connection, prompt client for a username
  if (!username) {
    return next(new Error('No username'));
  }

  // see if we have a session for the username
  if (sessionID) {
    const session = sessionCache.get(sessionID);
    sessionCache.print(session, 'Rehydrated session:');

    // if we have seen this session before, ensure the client uses the same
    // userID and username used in the last session
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      console.group('Handshake: Known party');
      console.log(
        highlight(`LEAVING io.use() with  ${sessionID}'s session data.`)
      );
      return next();
    }
  }

  // otherwise, setup the new user...
  console.log('\n', info(new Date().toLocaleString()));
  console.group('Handshake: Unknown party');
  console.log(warn(`Assigning new sessionID and userID for ${username}`));

  //...with a userID, and a sessionID
  socket.sessionID = randomId(); // these values gets attached to the socket so the client knows which session has their data and messages
  socket.userID = randomId();

  socket.username = username; // username is fixed by client

  console.log(success('Leaving io.use()'));
  // handle the connection, storing and returning the session data to client for storage.
  next();
});

io.on('connection', (socket) => {
  const { id: socketID, sessionID, userID, username } = socket;
  //#region Handling socket connection
  console.log('Client connected on socket ', socketID);
  sessionCache.set(sessionID, {
    userID: userID,
    username: username,
    lastInteraction: new Date().toLocaleString(),
    connected: true,
  });

  sessionCache.print(
    sessionID,
    `Binding Session: ${sessionID} to socket ${socketID}:`
  );

  console.log('Returning session data to client');
  // emit session details so the client can store the session in localStorage
  socket.emit('session', {
    sessionID: sessionID,
    userID: userID,
    username: username,
  });
  console.log(
    success(
      `socket ${socketID} joining ${username}'s room with userID ${userID}`
    )
  );

  // join the "userID" room
  // we send alerts using the userID stored in redisGraph for visitors
  socket.join(userID);

  //#endregion Handling socket connection

  //#region Handling Users
  // fetch existing users
  const users = sessionCache.all();
  // send users back to client so they know how widespread LCT usage is
  // (the more users are active, the safer the community)
  socket.emit('users', [...users]);
  const onlineUsers = users.filter((v) => v[1].connected);
  // console.group(`There are ${onlineUsers.length} online users:`);
  console.log(printJson(onlineUsers));
  // console.groupEnd();

  // notify existing users (this is only important if use has opted in to LCT Private Messaging)
  socket.broadcast.emit('userConnected', {
    userID: userID,
    username: username,
    connected: true,
  });
  console.log('Leaving io.on(connect)');
  //#endregion Handling Users

  socket.on('disconnectAsync', async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('user disconnected', socket.userID);
      // update the connection status of the session

      sessionCache.set(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        lastInteraction: new Date().toLocaleString(),
        connected: false,
      });
      const online = sessionCache.all().filter((v) => v[1].connected);
      console.log(
        `There are ${online.length} online sessions after disconnecting ${socket.sessionID}:`
      );
      console.log(printJson(online));
    }
  });

  socket.on('disconnect', async () => {
    io.in(socket.userID)
      .allSockets()
      .then((matchingSockets) => {
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
          // notify other users
          socket.broadcast.emit('user disconnected', socket.userID);
          // update the connection status of the session

          sessionCache.set(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            lastInteraction: new Date().toLocaleString(),
            connected: false,
          });
          const online = sessionCache.all().filter((v) => v[1].connected);
          console.log(
            `There are ${online.length} online sessions after disconnecting ${socket.sessionID}:`
          );
          console.log(printJson(online));
        }
      });
  });
});

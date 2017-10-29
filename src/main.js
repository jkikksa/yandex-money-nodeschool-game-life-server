'use strict';
const LifeGameVirtualDom = require(`../lib/LifeGameVirtualDom`);
const WebSocket = require(`ws`);

const SERVER_PORT = 3000;
const MIN_TOKEN_LENGTH = 2;

const ColorRange = {
  MIN: 273, // #111
  MAX: 2457 // #999
};

const MessageType = {
  INIT: `INITIALIZE`,
  UPDATE: `UPDATE_STATE`,
  ADD_POINT: `ADD_POINT`
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const getRandomColor = () => {
  return `#${getRandomInt(ColorRange.MIN, ColorRange.MAX).toString(16)}`;
};

const getInitMessage = (game, token) => ({
  type: MessageType.INIT,
  data: {
    state: game.state,
    settings: game.settings,
    user: {
      token,
      color: getRandomColor()
    }
  }
});

const isTokenValid = (token) => token.length > MIN_TOKEN_LENGTH;

const onMessage = (msg) => {
  const message = JSON.parse(msg);
  if (message.type === MessageType.ADD_POINT) {
    game.applyUpdates(message.data);
  }
};

const onConnection = (ws, request) => {
  const [, token] = request.url.split(`=`);
  if (isTokenValid(token)) {
    ws.send(JSON.stringify(getInitMessage(game, token)));
    ws.on(`message`, onMessage);
  } else {
    ws.close();
  }
};

const server = new WebSocket.Server({port: SERVER_PORT});
const game = new LifeGameVirtualDom();

game.sendUpdates = (data) => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: MessageType.UPDATE,
        data
      }));
    }
  });
};

server.on(`connection`, onConnection);

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//

const http = require('http');
const express = require('express');
const cors = require('cors');
const colyseus = require('colyseus');
const monitor = require("@colyseus/monitor").monitor;
// const socialRoutes = require("@colyseus/social/express").default;

const MyRoom = require('./MyRoom').MyRoom;

const port = process.env.PORT || 2567;
const app = express()

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server: server,
});

gameServer.define('DOG', MyRoom);

app.use("/colyseus", monitor(gameServer));
gameServer.onShutdown(()=>{
  console.log('game server is going to down')
})


gameServer.listen(port);
console.log(`Listening on ws://localhost:${ port }`)

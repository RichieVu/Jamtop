const express = require("express"); // Create express server
const app = express(); // Create instance of express
const http = require("http"); // Create http server
const { Server } = require("socket.io"); // Create socket.io server
const cors = require("cors");

app.use(cors());

const server = http.createServer(app); // Create http server with Express instance

// Initialize socket.io variable
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.id}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});

module.exports = server;

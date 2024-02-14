const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const request = require("request");
const dotenv = require("dotenv");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Spotify API setup
const port = 5000;
global.access_token = "";

dotenv.config();

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var spotify_redirect_uri = "http://localhost:3000/auth/callback";

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let hostSocketId = null;

// Socket.IO room handling
io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.id}`);
    if (socket.id === hostSocketId) {
      hostSocketId = null;
      io.emit("host_changed", { newHostId: getNewHostId() });
    }
  });

  socket.on("join_room", (room) => {
    socket.join(room);
    if (hostSocketId === null) {
      hostSocketId = socket.id;
    }
    io.in(room).emit("host_designated", { hostId: hostSocketId });
  });

  socket.on("request_sync_data", () => {
    // If you are the host and you are not the one requesting the data
    if (socket.id === hostSocketId) {
      socket.emit("get_sync_data"); // Send the request to the host
    }
  });
});

// Function to get the new host ID when the current host disconnects
function getNewHostId() {
  const connectedSocketIds = Object.keys(io.sockets.sockets);
  const currentHostIndex = connectedSocketIds.indexOf(hostSocketId);
  const nextHostIndex = (currentHostIndex + 1) % connectedSocketIds.length;
  return connectedSocketIds[nextHostIndex];
}

app.get("/auth/login", (req, res) => {
  var scope =
    "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

app.get("/auth/callback", (req, res) => {
  var code = req.query.code;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect("/");
    }
  });
});

app.get("/auth/token", (req, res) => {
  res.json({ access_token: access_token });
});

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

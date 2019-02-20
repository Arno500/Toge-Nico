const express = require("express");
const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var shortid = require("shortid");
var bodyParser = require("body-parser");
var history = require("connect-history-api-fallback");

app.use(bodyParser.json());

app.use(
  history({
    rewrites: [
      {
        from: /^\/api\/.*$/,
        to: function(context) {
          return context.parsedUrl.pathname;
        }
      }
    ]
  })
);

app.use(express.static("ressources/dist"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
  io.origins("*:*");
  next();
});

users = new Map();
rooms = new Map();

app.route("/api/users").get(function(req, res) {
  res.json([...users.values()]);
});
app.route("/api/rooms").get(function(req, res) {
  res.json([...rooms.entries()]);
});
app.route("/api/rooms/add").put(function(req, res) {
  if (req.body.video && req.body.userName) {
    let uniqueId = shortid.generate();
    let roomData = {
      video: req.body.video,
      owner: req.body.userName,
      users: [],
      messages: []
    };
    rooms.set(uniqueId, roomData);
    io.emit("rooms", {
      operation: "add",
      data: [uniqueId, roomData]
    });
    console.log("Nouvelle salle : ", req.body);
    res.send(uniqueId);
  }
});

server.listen(3000, () => console.log("Ready sur le port 3000"));

io.on("connection", socket => {
  socket.on("users", function(data) {
    users.set(socket.id, { userName: data.userName });
    console.log("Nouvel utilisateur : ", data);
    //console.log("Utilisateurs connectés :", users);
  });
  socket.on("rooms", function(data) {
    let currentUser = users.get(socket.id);
    let roomData = rooms.get(data.data.id);
    if (
      data.operation === "remove" &&
      currentUser &&
      roomData &&
      currentUser.userName === roomData.owner
    ) {
      rooms.delete(data.data.id);
      io.emit("rooms", data);
    } else if (data.operation === "connect") {
      if (data.data.id && currentUser && roomData) {
        roomData.users.push(currentUser.userName);
        rooms.set(data.data.id, roomData);
        socket.join("room-" + data.data.id);
        socket.emit("currentRoom", {
          operation: "refreshMessages",
          data: {
            messages: roomData.messages
          }
        });
      }
    } else if (data.operation === "disconnect") {
      if (data.data.id && currentUser && roomData) {
        socket.leave("room-" + data.data.id);
      }
    }
  });

  socket.on("currentRoom", function(data) {
    let user = users.get(socket.id);
    let room = rooms.get(data.data.roomId);
    if (
      (data.operation === "play" ||
        data.operation === "sync" ||
        data.operation === "pause" ||
        data.operation === "seek") &&
      user &&
      room &&
      user.userName === room.owner
    ) {
      socket.to("room-" + data.data.roomId).emit("currentRoom", {
        operation: data.operation,
        data: { timecode: data.data.timecode }
      });
    } else if (
      data.operation === "text" &&
      data.data.text.length <= 101 &&
      user &&
      room
    ) {
      let msgData = {
        text: data.data.text,
        username: user.userName,
        id: shortid.generate(),
        roomId: data.data.roomId
      };
      room.messages.push(msgData);
      rooms.set(data.data.roomId, room);
      io.in("room-" + data.data.roomId).emit("currentRoom", {
        operation: data.operation,
        data: msgData
      });
      console.log("Nouveau message : ", data.data.text);
    } else if (data.operation === "disconnect" && user && room) {
      room.users.splice(room.users.indexOf(user.userName), 1);
      rooms.set(data.data.roomId, room);
    } else if (
      data.operation === "changeLink" &&
      user &&
      room &&
      user.userName === room.owner
    ) {
      room.video = data.data.link;
      rooms.set(data.data.roomId, room);
      io.emit("rooms", {
        operation: data.operation,
        data: {
          roomId: data.data.roomId,
          link: data.data.link
        }
      });
    }
  });

  socket.on("disconnect", function(data) {
    let user = users.get(socket.id);
    if (user && user.timeout) {
      clearTimeout(user.timeout);
    }
    if (user) {
      room.timeout = setTimeout(
        () => onDisconnect(data, socket),
        1000 * 60 * 2
      );
      rooms.set(socket.id);
    }
  });
  socket.on("error", function(data) {
    let user = users.get(socket.id);
    if (user && user.timeout) {
      clearTimeout(user.timeout);
    }
    if (user) {
      room.timeout = setTimeout(
        () => onDisconnect(data, socket),
        1000 * 60 * 5
      );
      rooms.set(socket.id);
    }
  });
  socket.on("reconnect", function(data) {
    let user = users.get(socket.id);
    if (user & user.timeout) {
      clearTimeout(user.timeout);
      users.set(socket.id);
    }
  });
});

function onDisconnect(data, socket) {
  let currentUser = users.get(socket.id);

  rooms.forEach((data, key) => {
    if (currentUser && data.users.find(elm => elm === currentUser.userName)) {
      let roomData = rooms.get(key);
      roomData.users.splice(roomData.users.indexOf(currentUser), 1);
      rooms.set(key, roomData);
      io.to("room-" + key).emit("currentRoom", {
        operation: "text",
        data: {
          type: "system",
          text: currentUser.userName + " s'est déconnecté",
          roomId: key,
          id: shortid.generate()
        }
      });
    }
    if (currentUser && data.owner == currentUser.userName) {
      rooms.delete(key);
      io.emit("rooms", {
        operation: "remove",
        data: {
          id: key
        }
      });
      console.log(key + " s'est déconnecté :(, fermeture de sa/ses salle.s");
    }
    socket.leave("room-" + key);
    if (data.users.length <= 0) {
      rooms.delete(key);
      io.emit("rooms", {
        operation: "remove",
        data: {
          id: key
        }
      });
    }
  });
  users.delete(socket.id);
}

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage(user.username,`Welcome to ${user.room} !`));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(user.username,`${user.username} just joined`));

      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const{ user} = getUser(socket.id)
//console.log(user.user.room);

    const filter = new Filter();
    if (filter.isProfane(msg)) {
      //return callback("Profanity is not allowed");
       //io.to(user.room).emit("message", generateMessage("!! Profanity is not allowed !!"));
       msg = "!! Bless you!!"
    }
    
      io.to(user.room).emit("message", generateMessage(user.username,msg));
    
    
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const {user} = getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );

    callback("Location Shared !");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    //console.log(user);
    
    
    if (user) {
      console.log(user);
      const room = user[0].room
      io.to(room).emit("message", generateMessage(user.username,user[0].username+" just left ! "));
      io.to(room).emit('roomData',{
        room,
        users:getUsersInRoom(room)
      })
    }
  });
});

server.listen(port, () => {
  console.log("listening on port " + port);
});

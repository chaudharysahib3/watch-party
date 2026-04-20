const rooms = {};

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);


    socket.on("join_room", ({ roomId, username }) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: {},
          host: socket.id,
        };
      }


      if (!rooms[roomId].host) {
        rooms[roomId].host = socket.id;
      }

      const isHost = rooms[roomId].host === socket.id;

      rooms[roomId].users[socket.id] = {
        id: socket.id,
        username,
        role: isHost ? "host" : "participant",
      };

      io.to(roomId).emit("user_joined", {
        users: rooms[roomId].users,
      });
    });


    const isHost = (roomId) => {
      return rooms[roomId]?.host === socket.id;
    };

    const isModeratorOrHost = (roomId) => {
      const user = rooms[roomId]?.users[socket.id];
      return user?.role === "host" || user?.role === "moderator";
    };


    socket.on("play", ({ roomId }) => {
      if (!isModeratorOrHost(roomId)) return;
      socket.to(roomId).emit("play");
    });


    socket.on("pause", ({ roomId }) => {
      if (!isModeratorOrHost(roomId)) return;
      socket.to(roomId).emit("pause");
    });


    socket.on("seek", ({ roomId, time }) => {
      if (!isModeratorOrHost(roomId)) return;
      socket.to(roomId).emit("seek", { time });
    });


    socket.on("change_video", ({ roomId, videoId }) => {
      if (!isModeratorOrHost(roomId)) return;
      io.to(roomId).emit("change_video", { videoId });
    });



    socket.on("assign_role", ({ roomId, userId, role }) => {
      const room = rooms[roomId];
      if (!room) return;

      if (room.host !== socket.id) return;

      if (room.users[userId]) {
        room.users[userId].role = role;

        io.to(roomId).emit("role_assigned", {
          users: room.users,
        });
      }
    });


    socket.on("remove_participant", ({ roomId, userId }) => {
      const room = rooms[roomId];
      if (!room) return;

      if (room.host !== socket.id) return;

      delete room.users[userId];

      // force leave
      const targetSocket = io.sockets.sockets.get(userId);
      targetSocket?.leave(roomId);

      io.to(roomId).emit("user_left", {
        users: room.users,
      });
    });


    socket.on("request_sync", ({ roomId }) => {
      const room = rooms[roomId];
      if (!room) return;

      const hostId = room.host;

      io.to(hostId).emit("send_sync", {
        target: socket.id,
      });
    });


    socket.on("sync_state", ({ roomId, state, target }) => {
      io.to(target).emit("sync_state", state);
    });


    socket.on("send_message", ({ roomId, message, username }) => {
      io.to(roomId).emit("receive_message", {
        message,
        username,
        time: new Date().toLocaleTimeString(),
      });
    });


    socket.on("disconnect", () => {
      for (let roomId in rooms) {
        if (rooms[roomId]) {
          delete rooms[roomId].users[socket.id];

          // अगर room empty हो जाए → delete
          if (Object.keys(rooms[roomId].users).length === 0) {
            delete rooms[roomId];
            continue;
          }

          io.to(roomId).emit("user_left", {
            users: rooms[roomId].users,
          });
        }
      }

      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
const roomManager = require("../managers/roomManager");
const { canControl } = require("../utils/roles");

function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        //Join Room
        socket.on("join_room", ({ roomId, username }) => {
            socket.join(roomId);

            roomManager.createRoom(roomId);
            const room = roomManager.getRoom(roomId);

            const role = room.users.length === 0 ? "host" : "participate";

            const user = {
                socketId: socket.id,
                username,
                role,
            };

            roomManager.addUser(roomId, user);

            io.to(roomId).emit("user_joined", {
                users: room.users,
            });

            //sync state to new user
            socket.emit("sync_state", room.videoState);
        });

        //Play
        // socket.on("play", ({ roomId }) => {
        //     const user = roomManager.getUser(roomId, socket.id);
        //     if (!canControl(user)) return;

        //     const room = roomManager.getRoom(roomId);
        //     room.videoState.isPlaying = true;

        //     io.to(roomId).emit("play");
        // });
        socket.on("play", ({ roomId }) => {
            const user = roomManager.getUser(roomId, socket.id);

            if (user.role !== "host") return;

            io.to(roomId).emit("play");
        });

        //PAUSE
        // socket.on("pause", ({ roomId }) => {
        //     const user = roomManager.getUser(roomId, socket.id);
        //     if (!canControl(user)) return;

        //     const room = roomManager.getRoom(roomId);
        //     room.videoState.isPlaying = false;

        //     io.to(roomId).emit("pause");
        // });
        socket.on("pause", ({ roomId }) => {
            const user = roomManager.getUser(roomId, socket.id);

            if (user.role !== "host") return;

            io.to(roomId).emit("pause");
        });

        //SEEK
        // socket.on("seek", ({ roomId, time }) => {
        //     const user = roomManager.getUser(roomId, socket.id);
        //     if (!canControl(user)) return;

        //     const room = roomManager.getRoom(roomId);
        //     room.videoState.currentTime = time;

        //     io.to(roomId).emit("seek", { time });
        // });
        socket.on("seek", ({ roomId, time }) => {
            const user = roomManager.getUser(roomId, socket.id);

            if (user.role !== "host") return;

            io.to(roomId).emit("seek", { time });
        });

        //CHANGE VIDEO
        // socket.on("change_video", ({ roomId, videoId }) => {
        //     const user = roomManager.getUser(roomId, socket.id);
        //     if (!canControl(user)) return;

        //     const room = roomManager.getRoom(roomId);

        //     room.videoState.videoId = videoId;
        //     room.videoState.currentTime = 0;
        //     room.videoState.isPlaying = false;

        //     io.to(roomId).emit("change_video", { videoId });
        // });
        socket.on("change_video", ({ roomId, videoId }) => {
            const user = roomManager.getUser(roomId, socket.id);

            if (user.role !== "host") return;

            io.to(roomId).emit("change_video", { videoId });
        });

        //DISCONNECT
        socket.on("disconnect", () => {
            for (let [roomId, room] of roomManager.rooms) {
                roomManager.removeUser(roomId, socket.id);

                io.to(roomId).emit("user_left", {
                    users: room.users,
                });
            }
        });
    })
}
module.exports = socketHandler;
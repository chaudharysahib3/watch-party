class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: [],
        videoState: {
          videoId: "",
          currentTime: 0,
          isPlaying: false,
        },
      });
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addUser(roomId, user) {
    const room = this.getRoom(roomId);
    room.users.push(user);
  }

  removeUser(roomId, socketId) {
    const room = this.getRoom(roomId);
    room.users = room.users.filter(u => u.socketId !== socketId);
  }

  getUser(roomId, socketId) {
    return this.getRoom(roomId)?.users.find(u => u.socketId === socketId);
  }
}

module.exports = new RoomManager();
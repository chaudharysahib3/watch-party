import { useEffect, useState } from "react";
import socket from "../socket";
import VideoPlayer from "../components/VideoPlayer";
import Participants from "../components/Participants";
import Chat from "../components/Chat";
import "../styles/room.css";

function Room({ username, roomId }) {
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    socket.emit("join_room", { roomId, username });

    socket.on("user_joined", ({ users }) => {
      setUsers(users);

      const me = Object.values(users).find(
        (u) => u.username === username
      );

      setCurrentUser(me);
    });

    socket.on("user_left", ({ users }) => {
      setUsers(users);
    });

    socket.on("role_assigned", ({ users }) => {
      setUsers(users);
    });

    return () => socket.off();
  }, [roomId, username]);

  return (
  <div className="room-container">


    <div className="room-left">
      <h2>Room: {roomId}</h2>

      <div className="video-box">
        <VideoPlayer roomId={roomId} role={currentUser?.role} />
      </div>
    </div>

 
    <div className="room-right">
      <div className="card">
        <Participants roomId={roomId} role={currentUser?.role} />
      </div>

      <div className="card">
        <Chat roomId={roomId} username={username} />
      </div>
    </div>

  </div>
);
}

export default Room;
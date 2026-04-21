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

    
    const handleUserJoined = ({ users }) => {
      setUsers(users);

      const me = Object.values(users).find(
        (u) => u.username === username
      );
      setCurrentUser(me);
    };

    const handleUserLeft = ({ users }) => {
      setUsers(users);
    };

    const handleRoleAssigned = ({ users }) => {
      setUsers(users);
    };

   
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("role_assigned", handleRoleAssigned);

    
    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("role_assigned", handleRoleAssigned);
    };
  }, [roomId, username]);

  return (
    <div className="room-container">

      {/* LEFT SIDE */}
      <div className="room-left">
        <h2 className="room-title">Room: {roomId}</h2>

        <div className="video-box">
          <VideoPlayer roomId={roomId} role={currentUser?.role} />
        </div>
      </div>

     
      <div className="room-right">
        <div className="card">
          <Participants roomId={roomId} role={currentUser?.role} 
           users={users}
          />
        </div>

        <div className="card">
          <Chat roomId={roomId} username={username} />
        </div>
      </div>

    </div>
  );
}

export default Room;
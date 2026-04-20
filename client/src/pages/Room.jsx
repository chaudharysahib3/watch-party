import { useEffect, useState } from "react";
import socket from "../socket";
import VideoPlayer from "../components/VideoPlayer";
import Participants from "../components/Participants";

function Room({ username, roomId }) {
  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   socket.emit("join_room", { roomId, username });

  //   socket.on("user_joined", ({ users }) => setUsers(users));
  //   socket.on("user_left", ({ users }) => setUsers(users));

  //   return () => socket.off();
  // }, [roomId, username]);
const [users, setUsers] = useState([]);
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  socket.emit("join_room", { roomId, username });

  socket.on("user_joined", ({ users }) => {
    setUsers(users);

    const me = users.find((u) => u.username === username);
    setCurrentUser(me);
  });

  return () => socket.off();
}, [roomId, username]);
  return (
    <div>
      <h2>Room: {roomId}</h2>

      {/* <VideoPlayer roomId={roomId} /> */}
      <VideoPlayer roomId={roomId} role={currentUser?.role} />
      <Participants users={users} />
    </div>
  );
}

export default Room;
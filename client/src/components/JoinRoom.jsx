import {useState} from "react";
import "../styles/Home.css"; 

function JoinRoom({ onJoin }) {
    const [username, setUsername]=useState("");
    const [roomId, setRoomId]=useState("");

    const handleJoin=()=>{
        if(!username || !roomId) return;
        onJoin({ username, roomId });
    }
return (
  <div className="home-container">
    <div className="home-card">
      <h1>🎬 Watch Party</h1>

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={handleJoin}>
        Join Watch Party
      </button>
    </div>
  </div>
);
}

export default JoinRoom;
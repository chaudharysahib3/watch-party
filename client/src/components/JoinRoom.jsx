import {useState} from "react";
 
function JoinRoom({ onJoin }) {
    const [username, setUsername]=useState("");
    const [roomId, setRoomId]=useState("");

    const handleJoin=()=>{
        if(!username || !roomId) return;
        onJoin({ username, roomId });
    }
    return(
        <div>
           <h2>Join Watch Party</h2>
                 <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="Room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <br /><br />
      <button onClick={handleJoin}>Join Room</button>
        </div>
    );
}

export default JoinRoom;
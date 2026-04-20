import { useState } from "react";
import JoinRoom from "./components/JoinRoom";
import Room from "./pages/Room";

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <div>
      {!userData ? (
        <JoinRoom onJoin={setUserData} />
      ) : (
        <Room username={userData.username} roomId={userData.roomId} />
      )}
    </div>
  );
}

export default App;

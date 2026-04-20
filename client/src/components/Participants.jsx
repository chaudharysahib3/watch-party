import { useEffect, useState } from "react";
import socket from "../socket";

function Participants({ roomId, role }) {
  const [users, setUsers] = useState({});

  useEffect(() => {
    const handleUsers = ({ users }) => setUsers(users);

    socket.on("user_joined", handleUsers);
    socket.on("user_left", handleUsers);
    socket.on("role_assigned", handleUsers);

    return () => {
      socket.off("user_joined", handleUsers);
      socket.off("user_left", handleUsers);
      socket.off("role_assigned", handleUsers);
    };
  }, []);

  return (
    <div>
      <h3>Participants</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.entries(users).map(([userId, user]) => (
          <li key={userId}>
            {user.username} ({user.role})

            {role === "host" && userId !== socket.id && (
              <>
                <button
                  onClick={() =>
                    socket.emit("assign_role", {
                      roomId,
                      userId,
                      role: "moderator",
                    })
                  }
                > Make Moderator </button>

                <button
                  onClick={() =>
                    socket.emit("remove_participant", {
                      roomId,
                      userId,
                    })
                  }
                >  Remove </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;
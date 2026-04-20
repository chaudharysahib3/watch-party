function Participants({ users }) {
  return (
    <div>
      <h3>Participants</h3>
      <ul>
        {users.map((user) => (
          <li key={user.socketId}>
            {user.username} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;
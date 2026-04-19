function isHost(user) {
  return user?.role === "host";
}

function isModerator(user) {
  return user?.role === "moderator";
}

function canControl(user) {
  return isHost(user) || isModerator(user);
}

module.exports = { isHost, isModerator, canControl };
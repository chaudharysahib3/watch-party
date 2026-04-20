import { io } from "socket.io-client";

const URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"   // 🔥 LOCAL
    : "https://watch-party-7qe9.onrender.com"; // 🔥 LIVE

const socket = io(URL);

export default socket;
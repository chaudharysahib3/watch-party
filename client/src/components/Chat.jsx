import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import "../styles/room.css";

function Chat({ roomId, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);

  //AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      roomId,
      message,
      username,
    });

    setMessage("");
  };

  return (
    <div>
      <h3>Chat</h3>

      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, i) => {
          const isMe = msg.username === username;

          return (
            <div
              key={i}
              className={`chat-message ${isMe ? "me" : "other"}`}
            >
              <div className="chat-bubble">
                <div className="chat-username">
                  {msg.username}
                </div>

                <div>{msg.message}</div>

                {/* <div className="chat-time">
                  {msg.time}
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
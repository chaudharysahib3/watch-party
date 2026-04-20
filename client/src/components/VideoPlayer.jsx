import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function VideoPlayer({ roomId, role }) {
  const playerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  // 🔥 Load YouTube API
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        height: "300",
        width: "500",
        videoId: "",
        playerVars: {
          autoplay: 1,
          controls: 1,
        },
        events: {
          onStateChange: (event) => {
            // 🔥 IMPORTANT: ONLY HOST EMITS
            if (role !== "host") return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              socket.emit("play", { roomId });
            }

            if (event.data === window.YT.PlayerState.PAUSED) {
              socket.emit("pause", { roomId });
            }
          },
        },
      });
    };
  }, [role, roomId]);

  // 🔥 SOCKET EVENTS (ONLY RECEIVE — NO EMIT HERE)
  useEffect(() => {
    socket.on("change_video", ({ videoId }) => {
      playerRef.current?.loadVideoById(videoId);
    });

    socket.on("play", () => {
      playerRef.current?.playVideo();
    });

    socket.on("pause", () => {
      playerRef.current?.pauseVideo();
    });

    socket.on("seek", ({ time }) => {
      playerRef.current?.seekTo(time, true);
    });

    return () => socket.off();
  }, []);

  // 🔥 INPUT HANDLER
  const handleVideoChange = () => {
    if (role !== "host") return; // 🔥 BLOCK NON-HOST

    const url = inputValue.trim();
    let id = "";

    try {
      const urlObj = new URL(url);

      if (urlObj.hostname.includes("youtube.com")) {
        id = urlObj.searchParams.get("v");
      } else if (urlObj.hostname.includes("youtu.be")) {
        id = urlObj.pathname.slice(1);
      }
    } catch {
      alert("Invalid URL");
      return;
    }

    if (!id) {
      alert("Invalid YouTube link");
      return;
    }

    socket.emit("change_video", { roomId, videoId: id });
  };

  return (
    <div>
      <input
        disabled={role !== "host"}
        placeholder="Paste YouTube URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleVideoChange();
        }}
      />

      <button disabled={role !== "host"} onClick={handleVideoChange}>
        Load Video
      </button>

      <br /><br />

      <div id="player"></div>
    </div>
  );
}

export default VideoPlayer;
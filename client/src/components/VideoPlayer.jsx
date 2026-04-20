import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function VideoPlayer({ roomId, role }) {
  const playerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  //Load YouTube API
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
            
            if (role !== "host" && role !== "moderator") return;

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

  useEffect(() => {
  socket.emit("request_sync", { roomId });
}, [roomId]);

useEffect(() => {
  socket.on("send_sync", ({ target }) => {
    if (role !== "host") return;

    const player = playerRef.current;
    if (!player) return;

    socket.emit("sync_state", {
      roomId,
      target,
      state: {
        videoId: player.getVideoData().video_id,
        currentTime: player.getCurrentTime(),
        isPlaying:
          player.getPlayerState() === window.YT.PlayerState.PLAYING,
      },
    });
  });

  return () => socket.off("send_sync");
}, [role]);

useEffect(() => {
  socket.on("sync_state", (state) => {
    const player = playerRef.current;
    if (!player) return;

    player.loadVideoById(state.videoId);
    player.seekTo(state.currentTime, true);

    if (state.isPlaying) player.playVideo();
    else player.pauseVideo();
  });

  return () => socket.off("sync_state");
}, []);

// SYNC TIME (HOST ONLY)
useEffect(() => {
  const interval = setInterval(() => {
    if (role === "host" && playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      socket.emit("seek", { roomId, time });
    }
  }, 2000); // every 2 sec

  return () => clearInterval(interval);
}, [role, roomId]);


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

  const handleVideoChange = () => {
    // if (role !== "host" && role !== "moderator") return;
    if (role !== "host") return;

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
  
  useEffect(() => {
socket.emit("request_sync", { roomId });
}, [roomId]);

useEffect(() => {
  socket.on("send_sync", ({ target }) => {
    if (role !== "host") return;

    const player = playerRef.current;
    if (!player) return;

    const state = {
      videoId: player.getVideoData().video_id,
      currentTime: player.getCurrentTime(),
      isPlaying:
        player.getPlayerState() === window.YT.PlayerState.PLAYING,
    };

    socket.emit("sync_state", {
      roomId,
      state,
      target,
    });
  });

  return () => socket.off("send_sync");
}, [role]);

useEffect(() => {
  socket.on("sync_state", (state) => {
    const player = playerRef.current;
    if (!player) return;

    player.loadVideoById(state.videoId);
    player.seekTo(state.currentTime, true);

    if (state.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  });

  return () => socket.off("sync_state");
}, []);

return (
  <div>

    <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
      <input
        // disabled={role !== "host" && role !== "moderator"}
        disabled={role !== "host"}
        placeholder="Paste YouTube URL..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleVideoChange();
        }}
        style={{ flex: 1 }}
      />

      <button   disabled={role !== "host"}
                onClick={handleVideoChange}>
        Load Video
      </button>
    </div>

    <div className="video-wrapper">
      <div id="player"></div>
    </div>

  </div>
);
}

export default VideoPlayer;



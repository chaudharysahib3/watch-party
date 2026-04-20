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
        height: "400",
        width: "100%",
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

  // 🔥 Request sync when join
  useEffect(() => {
    socket.emit("request_sync", { roomId });
  }, [roomId]);

  // 🔥 Host sends sync
  useEffect(() => {
    const handleSendSync = ({ target }) => {
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
    };

    socket.on("send_sync", handleSendSync);
    return () => socket.off("send_sync", handleSendSync);
  }, [role, roomId]);

  // 🔥 Receive sync
  useEffect(() => {
    const handleSync = (state) => {
      const player = playerRef.current;
      if (!player) return;

      player.loadVideoById(state.videoId);
      player.seekTo(state.currentTime, true);

      if (state.isPlaying) player.playVideo();
      else player.pauseVideo();
    };

    socket.on("sync_state", handleSync);
    return () => socket.off("sync_state", handleSync);
  }, []);

  // 🔥 Host sync time every 2 sec
  useEffect(() => {
    const interval = setInterval(() => {
      if (role === "host" && playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        socket.emit("seek", { roomId, time });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [role, roomId]);

  // 🔥 Socket listeners
  useEffect(() => {
    const handleChangeVideo = ({ videoId }) => {
      playerRef.current?.loadVideoById(videoId);
    };

    const handlePlay = () => playerRef.current?.playVideo();
    const handlePause = () => playerRef.current?.pauseVideo();
    const handleSeek = ({ time }) =>
      playerRef.current?.seekTo(time, true);

    socket.on("change_video", handleChangeVideo);
    socket.on("play", handlePlay);
    socket.on("pause", handlePause);
    socket.on("seek", handleSeek);

    return () => {
      socket.off("change_video", handleChangeVideo);
      socket.off("play", handlePlay);
      socket.off("pause", handlePause);
      socket.off("seek", handleSeek);
    };
  }, []);

  // 🔥 Change video (HOST only)
  const handleVideoChange = () => {
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

  return (
    <div>
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <input
          disabled={role !== "host"}
          placeholder="Paste YouTube URL..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleVideoChange();
          }}
          style={{ flex: 1 }}
        />

        <button disabled={role !== "host"} onClick={handleVideoChange}>
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



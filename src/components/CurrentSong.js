import React, { useState, useEffect } from "react";
import "../pages/Room.css"; // Ensure the CSS file name is correct
import { useSocket } from "../SocketContext";

function CurrentSong({ token, roomCode }) {
  const socket = useSocket();
  const [currentSong, setCurrentSong] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCurrentSong = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentSong(data.item);
          setProgress((data.progress_ms / data.item.duration_ms) * 100);
          console.log("Current song fetched:", data.item);
        } else {
          console.error("Failed to fetch current song");
        }
      } catch (error) {
        console.error("Error fetching current song:", error);
      }
    };

    fetchCurrentSong();
    const intervalId = setInterval(fetchCurrentSong, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [token]);

  useEffect(() => {
    socket.on("supply_sync_current_song", () => {
      socket.emit("host_sync_current_song", {
        currentSong: currentSong,
        roomCode,
      });
      console.log("Current song emitted:", currentSong);
    });
  }, [socket]);

  if (!currentSong)
    return <div className="current-song-loading">Loading current song...</div>;
  return (
    <div className="current-song">
      <div className="current-song-info">
        <img
          className="current-song-image"
          src={currentSong.album.images[0].url}
          alt={currentSong.name}
        />
        <div className="current-song-details">
          <div className="current-song-name">{currentSong.name}</div>
          <div className="current-song-artists">
            {currentSong.artists.map((artist) => artist.name).join(", ")}
          </div>
        </div>
      </div>
      <progress
        className="current-song-progress-bar large-progress-bar"
        value={progress}
        max="100"
      ></progress>
    </div>
  );
}

export default CurrentSong;

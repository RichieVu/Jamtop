import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CurrentSong from "../components/CurrentSong";
import "./Room.css";
import AddSong from "../components/AddSong";
import { useSocket } from "../SocketContext";

function Room({ token }) {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currSong, setCurrSong] = useState(null);

  let { roomCode } = useParams(); // Get the room code from the URL

  useEffect(() => {
    // Define the socket event for the host to supply sync queue
    socket.on("supply_sync_queue", () => {
      socket.emit("host_sync_queue", { queue, roomCode });
      console.log("Sent queue:", queue);
    });

    socket.emit("join_room", roomCode);

    // Listen for the event when the host is designated
    socket.on("host_designated", (data) => {
      const hostId = data.hostId;
      if (socket.id !== hostId) {
        syncWithHost();
      } else {
        setIsHost(true);
        fetchQueue();
      }
      setHostId(hostId);
      console.log(`The host has been designated. Host ID: ${hostId}`);
    });

    // Listen for the event when the host changes
    socket.on("host_changed", (data) => {
      const newHostId = data.newHostId;
      // Update the host ID state
      setHostId(newHostId);
      if (socket.id === hostId) {
        setIsHost(true);
      }
      // When host changes...
      console.log(`The host has changed. New host ID: ${newHostId}`);
    });
  }, [socket, roomCode, isHost]);

  // Sync the queue and the currently playing song with the host's
  const syncWithHost = () => {
    if (!isHost) {
      console.log("Sending request to sync data with host");
      socket.emit("get_sync_data", { roomCode });
      // Listen for the response from the host
      socket.on("end_sync_queue", (data) => {
        console.log("END SYNC QUEUE");
        setQueue(data.queue);
        queueToSpotify();
      });
      socket.on("end_sync_current_song", (data) => {
        console.log("END SYNC CURR SONG");
        setCurrSong(data.currentSong);
        playSongAtProgress();
      });
    }
  };

  // Add all songs in the queue to Spotify's queue
  const queueToSpotify = async () => {
    for (const song of queue) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${song.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 204) {
          console.error(
            `Failed to add song with ID ${song.id} to Spotify queue`
          );
        }
      } catch (error) {
        console.error(
          `Error adding song with ID ${song.id} to Spotify queue:`,
          error
        );
      }
    }
  };

  // Play the current song at the progress percentage
  const playSongAtProgress = async () => {
    console.log("PLAY SONG AT PROGRESS", currSong);
    try {
      // Set the playback to the current song's URI and seek to the progress position
      let response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: currSong.uri,
          position_ms: currSong.position_ms,
        }),
      });

      // If the response is not 204 (No Content), log an error
      if (response.status !== 204) {
        console.error(`Eror playing song`);
      }
    } catch (error) {
      console.error(`Error playing Song:`, error);
      console.log(currSong);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/queue",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue);
        console.log("Queue fetched:", data);
      } else {
        console.error("Failed to fetch queue");
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };

  return (
    <div className="room-container">
      <h2 className="room-title">Room Code: {roomCode}</h2>
      <CurrentSong token={token} roomCode={roomCode} />
      <AddSong token={token} fetchQueue={fetchQueue} />
      <div className="song-queue">
        {queue && queue.length > 0 ? (
          <ul className="song-list">
            {queue.map((song, index) => (
              <li key={index} className="song-item">
                {song.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-songs">No songs in queue</p>
        )}
      </div>
      <div>
        {isHost ? <h3>You are the host</h3> : <h3>Host ID: {hostId}</h3>}
        Your ID: {socket.id}
      </div>
    </div>
  );
}

export default Room;

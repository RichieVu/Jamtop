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
  const { currentSong, progress } = CurrentSong(token);

  let { roomCode } = useParams(); // Get the room code from the URL

  useEffect(() => {
    fetchQueue();
    syncWithHost();
  }, [token]);

  useEffect(() => {
    socket.emit("join_room", roomCode);
    // Listen for the event when the host is designated
    socket.on("host_designated", (data) => {
      const hostId = data.hostId;
      if (socket.id !== hostId) {
        // Sync the queue with the host's queue
        // Sync the current song with the host's
      } else {
        setIsHost(true);
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

    // Define the socket event for the host to supply sync data
    socket.on("get_sync_data", () => {
      const syncData = {
        queue: queue,
        currentSong: currentSong, // Assuming currentSong is an object with song information
        progress: progress,
      };
      // Send the sync data out to be retrieved by the user that requested it
      socket.emit("host_sync_data", syncData);
    });

    // If you are the host, listen for the request to sync the queue
    socket.on("request_sync_data", (userId) => {
      if (isHost && socket.id !== userId) {
        io.to(userId).emit("host_sync_data", {
          queue: queue,
          currentSong: currentSong,
          progress: progress,
        });
      }
    });
  }, [socket, roomCode]);

  // Sync the queue and the currently playing song with the host's
  const syncWithHost = () => {
    if (!isHost) {
      socket.emit("request_sync_data"); // Send the request to the host without the userId
      // Listen for the response from the host
      socket.on("host_sync_data", (data) => {
        setQueue(data.queue);
        setCurrentSong(data.currentSong);
        setProgress(data.progress);
        playSongAtProgress();
        queueToSpotify();
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
    try {
      // Set the playback to the current song's URI and seek to the progress position
      let response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [currentSong.uri],
          position_ms: (currentSong.duration_ms * progress) / 100,
        }),
      });

      // If the response is not 204 (No Content), log an error
      if (response.status !== 204) {
        console.error(`Failed to add song with ID ${song.id} to Spotify queue`);
      }
    } catch (error) {
      console.error(
        `Error adding song with ID ${song.id} to Spotify queue:`,
        error
      );
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
      <CurrentSong token={token} />
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
        {hostId === socket.id ? (
          <h3>You are the host</h3>
        ) : (
          <h3>Host ID: {hostId}</h3>
        )}
      </div>
    </div>
  );
}

export default Room;

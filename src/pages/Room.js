import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CurrentSong from "../components/CurrentSong";
import "./Room.css";
import AddSong from "../components/AddSong";
import { useSocket } from "../SocketContext";

function Room({ token }) {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [messageRecieved, setMessageRecieved] = useState("");

  let { roomCode } = useParams(); // Get the room code from the URL
  const sendMessage = () => {
    socket.emit("send_message", { message: message, room: roomCode });
  };

  useEffect(() => {
    fetchQueue();
  }, [token]);

  useEffect(() => {
    socket.emit("join_room", roomCode);
    socket.on("receive_message", (data) => {
      setMessageRecieved(data.message);
    });
  }, [socket]);

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
        setQueue(data.queue); // Assuming the response has an items array
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
      <input
        placeholder="Enter Message"
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Message:</h1>
      {messageRecieved}
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
    </div>
  );
}

export default Room;

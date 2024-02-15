import React, { useState, useEffect } from "react";

function AddSong({ token, fetchQueue }) {
  const [spotifySongLink, setSpotifySongLink] = useState("");

  const handleAddSong = async () => {
    if (!spotifySongLink) return;

    const trackId = spotifySongLink.split("track/")[1].split("?")[0];

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 204) {
        console.log("Song added to queue");
        fetchQueue(); // Refresh the queue after adding a song
        setSpotifySongLink("");
        console.log("Token", token);
      } else {
        console.error("Failed to add song to queue");
      }
    } catch (error) {
      console.error("Error adding song to queue:", error);
    }
  };

  return (
    <div className="add-song-container">
      <input
        className="add-song-input"
        type="text"
        placeholder="Paste Spotify song link here"
        value={spotifySongLink}
        onChange={(e) => setSpotifySongLink(e.target.value)}
      />
      <button className="add-song-button" onClick={handleAddSong}>
        Add Song to Queue
      </button>
    </div>
  );
}

export default AddSong;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function Homepage({ token }) {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const joinRoom = (code) => {
    if (code.length === 5) {
      navigate(`/${code}`);
    } else {
      alert("Enter a Valid Room Code");
    }
  };

  const createRoom = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomCode(code);
    navigate(`/${code}`);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login Successful!</h2>
      <input
        className="room-input"
        type="text"
        maxLength="5"
        placeholder="Enter 5 Digit Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)} // Update the roomCode state when input changes
      />
      <a className="login-button" onClick={() => joinRoom(roomCode)}>
        Join Room
      </a>
      <button
        className="login-button"
        style={{ marginTop: "20px" }}
        onClick={() => createRoom()}
      >
        Create Room
      </button>
    </div>
  );
}

export default Homepage;

import React from "react";
import { useParams } from "react-router-dom";
import "./LoginPage.css";

function Room({ token }) {
  let { roomCode } = useParams();
  console.log(`Room Code: ${roomCode}`);

  return (
    <div className="login-container">
      <h2 className="login-title">Welcome to Room {roomCode}!</h2>
      <div className="room-info">
        <p>Room Code: {roomCode}</p>
        {/* Additional room information and actions can be added here */}
      </div>
      {/* Add more components or functionality as needed */}
    </div>
  );
}

export default Room;

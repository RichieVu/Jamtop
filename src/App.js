import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WebPlayback from "./pages/WebPlayback";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Room from "./pages/Room";
import "./App.css";
import { SocketProvider } from "./SocketContext";

function App() {
  const [token, setToken] = useState("");
  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();
  }, []);

  if (token === "") {
    return <Login />;
  } else {
    return (
      <SocketProvider>
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<Homepage token={token} />} />
              <Route path="/:roomCode" element={<Room token={token} />} />
            </Routes>
          </Router>
        </div>
      </SocketProvider>
    );
  }
}

export default App;

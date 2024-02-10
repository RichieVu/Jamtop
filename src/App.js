import React, { useState, useEffect } from "react";
import WebPlayback from "./pages/WebPlayback";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage"; // assuming there is a Homepage component
import Room from "./pages/Room";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

  // User must be logged in before getting to the Homepage
  if (token === "") {
    return <Login />;
  } else {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Homepage token={token} />} />
          <Route path="/:roomCode" element={<Room token={token} />} />
        </Routes>
      </Router>
    );
  }

  // If no token display Login, if requested display Homepage
  // return <>{token === "" ? <Login /> : <Homepage token={token} />}</>;
  // return (
  //   <Router>
  //     <Routes>
  //       <Route path="/" element={<Homepage />} />
  //       <Route path="/join-room/:code" element={<Room />} />
  //       <Route path="/create-room/:code" element={<Room />} />
  //     </Routes>
  //   </Router>
  // );
}

export default App;

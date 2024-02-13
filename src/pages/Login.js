import React from "react";
import "./LoginPage.css";

function Login() {
  return (
    <div className="login-container">
      <h2 className="login-title">Welcome to Jamtop</h2>
      <a className="login-button" href="/auth/login">
        Login with Spotify
      </a>
    </div>
  );
}

export default Login;

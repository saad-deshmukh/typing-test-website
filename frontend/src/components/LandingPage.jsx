import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const startGame = () => navigate("/game");
  const goToLogin = () => navigate("/login");
  const goToSignup = () => navigate("/signup");

  return (
    <div style={styles.container}>
      {/* Left Side */}
      <div style={styles.left}>
        <h1 style={styles.title}>Welcome to Typing Challenge!</h1>
        <p style={styles.subtitle}>
          Test your typing speed against the clock or challenge your friends. No login required!
        </p>
        <button style={styles.playButton} onClick={startGame}>
          Play Now
        </button>
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <h2 style={styles.authTitle}>Get Started</h2>
        <div style={styles.authButtons}>
          <button style={styles.loginButton} onClick={goToLogin}>Login</button>
          <button style={styles.signupButton} onClick={goToSignup}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #6e8efb, #a777e3)",
    color: "#fff",
  },
  left: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px",
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    color: "#333",
    padding: "60px 40px",
    borderRadius: "0 30px 30px 0",
    boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "3.5rem",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "1.3rem",
    marginBottom: "40px",
    maxWidth: "500px",
    color: "#e0e0e0",
  },
  playButton: {
    padding: "15px 35px",
    fontSize: "1.2rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ff4b2b",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    transition: "0.3s",
  },
  authTitle: {
    fontSize: "2rem",
    marginBottom: "30px",
  },
  authButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  loginButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid #6e8efb",
    backgroundColor: "#fff",
    color: "#6e8efb",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  signupButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6e8efb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  // Responsive adjustments
  "@media (max-width: 900px)": {
    container: {
      flexDirection: "column",
    },
    left: {
      alignItems: "center",
      textAlign: "center",
      padding: "40px 20px",
    },
    right: {
      borderRadius: "30px 30px 0 0",
      padding: "40px 20px",
      width: "100%",
    },
  },
};

export default LandingPage;

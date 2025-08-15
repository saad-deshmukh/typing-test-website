import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/authContext"; // Import useAuth to get user info

const socket = io("http://localhost:5000"); // Your backend URL

const MultiplayerGame = () => {
  const { user } = useAuth(); // Get user from context
  const [roomToken, setRoomToken] = useState("");
  const [userName, setUserName] = useState(user?.username || ""); // Pre-fill username if logged in
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [testText, setTestText] = useState("The quick brown fox jumps over the lazy dog."); // Default text
  const [finalResults, setFinalResults] = useState([]);

  useEffect(() => {
    // Listen for room updates
    socket.on("updateRoom", ({ users, gameText }) => {
      setPlayers(users);
      if (gameText) {
        setTestText(gameText);
      }
    });

    socket.on("roomFull", () => alert("This room is full!"));
    socket.on("startGame", ({ gameText }) => {
      setTestText(gameText);
      setGameStarted(true);
      setGameEnded(false);
      setInputText("");
      setFinalResults([]);
    });

    socket.on("endGame", (results) => {
      setGameEnded(true);
      setGameStarted(false);
      setFinalResults(results);
    });

    return () => {
      socket.off("updateRoom");
      socket.off("roomFull");
      socket.off("startGame");
      socket.off("endGame");
    };
  }, []);

  const joinRoom = (token) => {
    if (!userName.trim()) {
      alert("Please enter your name!");
      return;
    }
    const roomToJoin = token.trim();
    if (!roomToJoin) {
      alert("Please enter a room token!");
      return;
    }
    socket.emit("joinRoom", { roomToken: roomToJoin, userName });
    setRoomToken(roomToJoin);
    setInRoom(true);
  };

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    const newRoomToken = Math.random().toString(36).substring(2, 8);
    joinRoom(newRoomToken);
  };

  const handleStartGame = () => {
    socket.emit("requestStartGame", { roomToken });
  };

  const handleTyping = (e) => {
    const typedText = e.target.value;
    setInputText(typedText);

    // Calculate stats
    let errors = 0;
    typedText.split("").forEach((char, i) => {
      if (char !== testText[i]) {
        errors++;
      }
    });
    const accuracy = Math.max(0, Math.round(((typedText.length - errors) / typedText.length) * 100)) || 100;
    
    // Emit progress
    socket.emit("playerProgress", { roomToken, progress: (typedText.length / testText.length) * 100, accuracy });

    if (typedText.length === testText.length) {
      socket.emit("playerFinished", { roomToken });
    }
  };

  const renderPlayerCard = (player) => (
    <div key={player.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="font-bold text-cyan-300 truncate">{player.name}</h3>
      <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${player.progress || 0}%` }}></div>
      </div>
      <p className="text-sm text-slate-400 mt-1">Accuracy: {player.accuracy || 100}%</p>
    </div>
  );

  const renderFinalResultCard = (result, index) => (
     <div key={index} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span className="font-bold text-cyan-300">{index + 1}. {result.name}</span>
        <span className="text-slate-300">{result.wpm} WPM</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col items-center justify-center p-4">
      {!inRoom ? (
        <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">Multiplayer</h1>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!!user} // Disable if user is logged in
            />
            <button onClick={handleCreateRoom} className="w-full py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20">
              Create Room
            </button>
            <div className="flex items-center gap-2">
                <hr className="w-full border-slate-700"/>
                <span className="text-slate-500">OR</span>
                <hr className="w-full border-slate-700"/>
            </div>
            <input
              type="text"
              placeholder="Enter Room Token"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onChange={(e) => setRoomToken(e.target.value)}
            />
            <button onClick={() => joinRoom(roomToken)} className="w-full py-3 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300">
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-2 text-center">Room Token: <span className="text-cyan-300 tracking-widest">{roomToken}</span></h2>
          <p className="text-center text-slate-400 mb-6">Waiting for players to join...</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {players.map(renderPlayerCard)}
          </div>

          {!gameStarted && !gameEnded && (
            <div className="text-center">
              <button onClick={handleStartGame} className="bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                Start Game
              </button>
            </div>
          )}

          {gameStarted && (
            <div className="relative">
              <div className="text-2xl leading-relaxed tracking-wider bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-48 overflow-hidden mb-4 backdrop-blur-sm">
                {testText.split("").map((char, index) => (
                  <span key={index} className={index < inputText.length ? (char === inputText[index] ? 'text-cyan-300' : 'text-red-500 bg-red-900/50 rounded') : 'text-slate-500'}>
                    {char}
                  </span>
                ))}
              </div>
              <textarea
                value={inputText}
                onChange={handleTyping}
                className="absolute inset-0 w-full h-full bg-transparent opacity-0 cursor-text"
                rows={4}
                autoFocus
              />
            </div>
          )}

          {gameEnded && (
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg mt-4 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-center text-cyan-300">Final Results</h3>
                <div className="flex flex-col gap-2">
                    {finalResults.sort((a, b) => b.wpm - a.wpm).map(renderFinalResultCard)}
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplayerGame;

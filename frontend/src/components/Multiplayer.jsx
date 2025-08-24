import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

// --- Configuration ---
const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

// --- Socket.IO Connection ---
const socket = io(SOCKET_URL);

const MultiplayerGame = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roomTokenInput, setRoomTokenInput] = useState("");
    const [gameState, setGameState] = useState({
        roomToken: "",
        players: [],
        status: "pending",
        text: "",
        startTime: null,
        playerId: null,
    });
    const [inputText, setInputText] = useState("");
    const [playerProgress, setPlayerProgress] = useState({});
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        socket.on("updateRoom", (updatedPlayers) => {
            setGameState(prev => ({ ...prev, players: updatedPlayers }));
        });

        socket.on("startGame", ({ gameText, startTime }) => {
            setGameState(prev => ({ ...prev, status: 'in-progress', text: gameText, startTime }));
            setInputText("");
            setPlayerProgress({});
            inputRef.current?.focus();
        });

        socket.on("progressUpdate", ({ playerId, progress, accuracy, wpm }) => {
            setPlayerProgress(prev => ({ ...prev, [playerId]: { progress, accuracy, wpm } }));
        });

        socket.on("endGame", (results) => {
            navigate(`/results/${gameState.roomToken}`, { 
                state: { results, players: gameState.players } 
            });
        });

        return () => {
            socket.off("updateRoom");
            socket.off("startGame");
            socket.off("progressUpdate");
            socket.off("endGame");
        };
    }, [gameState.roomToken, gameState.players, navigate]);

    // --- API Functions (Unchanged) ---
    const handleCreateRoom = async () => {
        setError("");
        try {
            const response = await api.post("/game/create-room");
            const { roomToken, playerId } = response.data;
            socket.emit("subscribeToRoom", { roomToken, playerId });
            setGameState({ ...gameState, status: 'lobby', roomToken, playerId });
        } catch (err) {
            setError("Failed to create room. Please try again.");
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError("");
        if (!roomTokenInput.trim()) return;
        try {
            const response = await api.post("/game/join-room", { roomToken: roomTokenInput.trim() });
            const { roomToken, playerId } = response.data;
            socket.emit("subscribeToRoom", { roomToken, playerId });
            setGameState({ ...gameState, status: 'lobby', roomToken, playerId });
        } catch (err) {
            setError("Room not found or game has already started.");
        }
    };

    // --- Game Action Functions ---
    const handleStartGame = () => {
        socket.emit("requestStartGame", { roomToken: gameState.roomToken });
    };

    const handleTyping = (e) => {
        const typedText = e.target.value;
        if (typedText.length > gameState.text.length) return;
        setInputText(typedText);

        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === gameState.text[i]) {
                correctChars++;
            } else {
                break;
            }
        }

        const progress = (correctChars / gameState.text.length) * 100;
        const correctPrefixText = gameState.text.substring(0, correctChars);
        const wordCount = correctPrefixText.trim().split(/\s+/).filter(Boolean).length;
        
        let errors = typedText.length - correctChars;
        const accuracy = Math.max(0, Math.round(((typedText.length - errors) / typedText.length) * 100)) || 100;

        const timeElapsed = (new Date() - new Date(gameState.startTime)) / 1000 / 60;
        const wpm = timeElapsed > 0 ? Math.round(wordCount / timeElapsed) : 0;
        setPlayerProgress(prev => ({ ...prev, [gameState.playerId]: { progress, accuracy, wpm } }));
        
        socket.emit("playerProgress", { roomToken: gameState.roomToken, progress, accuracy, wordCount });

        // --- THIS IS THE FIX ---
        // The race finishes when the typed text length equals the source text length,
        // regardless of accuracy. The final accuracy is sent with the event.
        if (typedText.length === gameState.text.length) {
            socket.emit("playerFinished", { roomToken: gameState.roomToken, accuracy });
        }
        // --- END OF FIX ---
    };

    // --- RENDER FUNCTIONS ---
    const renderPlayerTrack = (player) => {
        const progressData = playerProgress[player.id] || { progress: 0, wpm: 0 };
        return (
            <div key={player.id} className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-cyan-300 truncate">{player.User.username}</span>
                    <span className="font-mono text-lg">{progressData.wpm || 0} WPM</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 relative">
                    <div 
                        className="bg-cyan-500 h-2.5 rounded-full absolute top-0 left-0 transition-all duration-200" 
                        style={{ width: `${progressData.progress}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    const renderTypingText = () => {
        return gameState.text.split("").map((char, index) => {
            let color = "text-slate-500"; // Untyped text
            let cursorClass = "";

            if (index < inputText.length) {
                // This character has been typed
                color = inputText[index] === char ? "text-green-400" : "text-red-500 bg-red-900/50 rounded";
            } else if (index === inputText.length) {
                // This is the cursor position
                cursorClass = "animate-pulse bg-cyan-500/50 rounded";
            }

            return <span key={index} className={`${color} ${cursorClass}`}>{char}</span>;
        });
    };


    // --- Main Component Return ---
    if (gameState.status === 'pending') {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">Multiplayer</h1>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="flex flex-col gap-4">
                        <button onClick={handleCreateRoom} className="w-full py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                            Create Room
                        </button>
                        <div className="flex items-center gap-2">
                            <hr className="w-full border-slate-700"/><span className="text-slate-500">OR</span><hr className="w-full border-slate-700"/>
                        </div>
                        <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Enter Room Token"
                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                value={roomTokenInput}
                                onChange={(e) => setRoomTokenInput(e.target.value)}
                            />
                            <button type="submit" className="w-full py-3 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300">
                                Join Room
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-2 text-center">Room Token: <span className="text-cyan-300 tracking-widest">{gameState.roomToken}</span></h2>
                
                {gameState.status === 'lobby' && <p className="text-center text-slate-400 mb-6">Waiting for players to join...</p>}
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4 mb-6">
                    {gameState.players.map(renderPlayerTrack)}
                </div>

                {gameState.status === 'lobby' && gameState.players.find(p => p.id === gameState.playerId)?.isHost && (
                    <div className="text-center">
                        <button onClick={handleStartGame} className="bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                            Start Game
                        </button>
                    </div>
                )}

                {gameState.status === 'in-progress' && (
                    <div className="relative" onClick={() => inputRef.current?.focus()}>
                        <div className="text-2xl leading-relaxed tracking-wider bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-48 overflow-y-auto mb-4 backdrop-blur-sm select-none">
                            {renderTypingText()}
                        </div>
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={handleTyping}
                            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white outline-none resize-none p-6 text-2xl"
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiplayerGame;



import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import statsService from "../services/statsService";


const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";


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
        gameId: null,
    });
    const [inputText, setInputText] = useState("");
    const [playerProgress, setPlayerProgress] = useState({});
    const [error, setError] = useState("");

    // New states for statistics
    const [gameStartTime, setGameStartTime] = useState(null);
    const [finalStats, setFinalStats] = useState(null);
    const [savingStats, setSavingStats] = useState(false);

    const inputRef = useRef(null);
    
    const totalKeystrokes = useRef(0);

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

        socket.on("startGame", ({ gameText, startTime, gameId }) => {
            setGameState(prev => ({
                ...prev,
                status: 'in-progress',
                text: gameText,
                startTime,
                gameId
            }));
            setInputText("");
            setPlayerProgress({});
            setGameStartTime(new Date());
            
            // RESET keystroke counter for the new game
            totalKeystrokes.current = 0;
            
            inputRef.current?.focus();
        });

        socket.on("progressUpdate", ({ playerId, progress, accuracy, wpm }) => {
            setPlayerProgress(prev => ({ ...prev, [playerId]: { progress, accuracy, wpm } }));
        });

        socket.on("endGame", async (results) => {
            if (user && gameState.playerId) {
                await saveMultiplayerGameStats(results);
            }

            navigate(`/results/${gameState.roomToken}`, {
                state: { results, players: gameState.players, gameStats: finalStats }
            });
        });

        return () => {
            socket.off("updateRoom");
            socket.off("startGame");
            socket.off("progressUpdate");
            socket.off("endGame");
        };
    }, [gameState.roomToken, gameState.players, gameState.playerId, finalStats, user, navigate]);

    // Save multiplayer game statistics
    const saveMultiplayerGameStats = async (results) => {
        try {
            setSavingStats(true);

            const playerResult = results.find(result =>
                result.playerId === gameState.playerId
            );

            if (!playerResult) return;

            const gameEndTime = new Date();
            const timeTaken = Math.round((gameEndTime - gameStartTime) / 1000);

            // Recalculate basic stats for storage based on final result
            const correctChars = Math.floor((playerResult.accuracy / 100) * inputText.length);
            const wordsTyped = Math.floor(correctChars / 5);
            const errorsMade = inputText.length - correctChars;

            const gameData = {
                wpm: playerResult.wpm || 0,
                accuracy: playerResult.accuracy || 0,
                wordsTyped: wordsTyped,
                timeTaken: timeTaken,
                errorsMade: errorsMade,
                gameMode: 'multiplayer',
                textDifficulty: 'medium',
                gameId: gameState.gameId,
                playerId: gameState.playerId
            };

            await statsService.saveGameResult(gameData);
            setFinalStats(gameData);
            console.log('✅ Multiplayer game stats saved!');

        } catch (error) {
            console.error('❌ Failed to save multiplayer game stats:', error);
        } finally {
            setSavingStats(false);
        }
    };

    // --- API Functions ---
    const handleCreateRoom = async () => {
        setError("");
        try {
            const response = await api.post("/game/create-room");
            const { roomToken, playerId, gameId } = response.data;
            socket.emit("subscribeToRoom", { roomToken, playerId });
            setGameState({
                ...gameState,
                status: 'lobby',
                roomToken,
                playerId,
                gameId
            });
        } catch (err) {
            setError("Failed to create battle chamber. Please try again.");
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError("");
        if (!roomTokenInput.trim()) return;
        try {
            const response = await api.post("/game/join-room", { roomToken: roomTokenInput.trim() });
            const { roomToken, playerId, gameId } = response.data;
            socket.emit("subscribeToRoom", { roomToken, playerId });
            setGameState({
                ...gameState,
                status: 'lobby',
                roomToken,
                playerId,
                gameId
            });
        } catch (err) {
            setError("Battle chamber not found or challenge has already begun.");
        }
    };

    // --- Game Action Functions ---
    const handleStartGame = () => {
        if (gameState.players.length < 2) {
            setError("You need at least 2 guild members to start the battle!");
            return;
        }
        setError("");
        socket.emit("requestStartGame", { roomToken: gameState.roomToken });
    };

    const handleTyping = (e) => {
        const typedText = e.target.value;
        if (typedText.length > gameState.text.length) return;
        
        setInputText(typedText);

        // 1. STRICT PROGRESS: Calculate correct characters until the first error
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === gameState.text[i]) {
                correctChars++;
            } else {
                // Stop counting correct chars immediately upon mismatch
                break;
            }
        }

        const progress = (correctChars / gameState.text.length) * 100;
        const correctPrefixText = gameState.text.substring(0, correctChars);
        const wordCount = correctPrefixText.trim().split(/\s+/).filter(Boolean).length;

        let errors = typedText.length - correctChars;
        
        // 2. STRICT ACCURACY: Based on Total Keystrokes vs Correct Characters
        const accuracy = totalKeystrokes.current > 0 
            ? Math.round((correctChars / totalKeystrokes.current) * 100) 
            : 100;

        const timeElapsed = (new Date() - new Date(gameState.startTime)) / 1000 / 60;
        const wpm = timeElapsed > 0 ? Math.round(wordCount / timeElapsed) : 0;
        
        setPlayerProgress(prev => ({ ...prev, [gameState.playerId]: { progress, accuracy, wpm } }));

        socket.emit("playerProgress", { roomToken: gameState.roomToken, progress, accuracy, wordCount });

        // 3. COMPLETION CHECK: Must match length AND be fully correct
        if (typedText.length === gameState.text.length && correctChars === gameState.text.length) {
            const finalPlayerStats = {
                wpm,
                accuracy,
                progress: 100,
                timeTaken: Math.round((new Date() - gameStartTime) / 1000),
                wordsTyped: wordCount,
                errorsMade: errors
            };

            socket.emit("playerFinished", {
                roomToken: gameState.roomToken,
                accuracy,
                stats: finalPlayerStats
            });
        }
    };

    // --- RENDER FUNCTIONS ---
    const renderPlayerTrack = (player) => {
        // player object structure provided by user: player.User.username
        const progressData = playerProgress[player.id] || { progress: 0, wpm: 0, accuracy: 100 };
        const isCurrentPlayer = player.id === gameState.playerId;

        return (
            <div key={player.id} className={`space-y-2 p-4 rounded-xl transition-all duration-300 ${isCurrentPlayer
                ? 'bg-[#C9A227]/20 border-2 border-[#C9A227]/50 shadow-lg shadow-[#C9A227]/20'
                : 'bg-[#4E342E]/40 border border-[#6D4C41]'
                }`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                            ${isCurrentPlayer
                                ? 'bg-gradient-to-br from-[#C9A227] to-[#B8941F] text-[#1C1C1C]'
                                : 'bg-[#6D4C41] text-[#FDF6EC]'
                            }`}>
                            {player.User.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className={`font-semibold truncate ${isCurrentPlayer ? 'text-[#C9A227]' : 'text-[#FDF6EC]'
                                }`}>
                                {player.User.username}
                                {isCurrentPlayer && <span className="text-xs text-[#C9A227]/80 ml-2">(You)</span>}
                                {player.isHost && <span className="text-xs text-[#C9A227] ml-2">👑 Master</span>}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                        <span className="text-[#C9A227]">{progressData.wpm || 0} <span className="text-xs text-[#D7CCC8]">WPM</span></span>
                        <span className="text-[#C9A227]">{progressData.accuracy || 100}<span className="text-xs text-[#D7CCC8]">%</span></span>
                    </div>
                </div>
                <div className="w-full bg-[#4E342E] rounded-full h-3 relative overflow-hidden border border-[#6D4C41]">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${isCurrentPlayer
                            ? 'bg-gradient-to-r from-[#C9A227] to-[#B8941F]'
                            : 'bg-[#6D4C41]'
                            }`}
                        style={{ width: `${progressData.progress}%` }}
                    >
                        {progressData.progress > 10 && (
                            <div className="h-full bg-gradient-to-r from-transparent via-[#FDF6EC]/30 to-transparent animate-pulse"></div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderTypingText = () => {
        return gameState.text.split("").map((char, index) => {
            let color = "text-[#D7CCC8]/70"; // Untyped text
            let cursorClass = "";

            if (index < inputText.length) {
                color = inputText[index] === char
                    ? "text-[#C9A227]"
                    : "text-[#FF6B6B]";

            } else if (index === inputText.length) {
                return (
                    <span key={index} className="relative">
                        <span className="absolute -left-0.5 h-full w-[2px] bg-[#C9A227] animate-pulse"></span>
                        <span className="text-[#D7CCC8]/70">{char}</span>
                    </span>
                );
            }

            return <span key={index} className={`${color} ${cursorClass}`}>{char}</span>;
        });
    };

    // --- Main Component Return ---
    if (gameState.status === 'pending') {
        return (
            <div className="min-h-screen relative overflow-hidden font-body">
                {/* Vintage Wooden Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px'
                        }}
                    />
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform rotate-3 animate-pulse"></div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative">
                            {/* Decorative Corners */}
                            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                            <h1 className="font-heading text-3xl font-bold text-center text-[#FDF6EC] mb-6 drop-shadow-lg">
                                <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                                    Battle Arena
                                </span>
                            </h1>

                            {user && (
                                <div className="text-center mb-6 p-4 bg-[#C9A227]/10 border border-[#C9A227]/20 rounded-xl backdrop-blur-sm">
                                    <p className="text-sm text-[#C9A227] font-medium">📜 Your battle results will be recorded!</p>
                                </div>
                            )}

                            {!user && (
                                <div className="text-center mb-6 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl backdrop-blur-sm">
                                    <p className="text-sm text-[#FF6B6B] font-medium">⚠️ Join to save your battle achievements!</p>
                                </div>
                            )}

                            {error && (
                                <div className="text-center mb-4 p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                                    <p className="text-[#FF6B6B] text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleCreateRoom}
                                    className="group w-full py-4 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold rounded-full 
                                             transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                                             transform hover:scale-[1.02] relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                                     transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                                     transition-transform duration-1000"></div>
                                    ⚔️ Create Battle Chamber
                                </button>

                                <div className="flex items-center gap-2">
                                    <hr className="w-full border-[#6D4C41]" />
                                    <span className="text-[#D7CCC8] text-sm font-medium px-2">OR</span>
                                    <hr className="w-full border-[#6D4C41]" />
                                </div>

                                <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        placeholder="Enter Chamber Token"
                                        className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                                                 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                                                 text-[#FDF6EC] placeholder-[#D7CCC8]/70 transition-all duration-300"
                                        value={roomTokenInput}
                                        onChange={(e) => setRoomTokenInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-[#4E342E]/80 text-[#C9A227] font-bold rounded-full border border-[#6D4C41] 
                                                 hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
                                    >
                                        🏰 Join Chamber
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-body">
            {/* Enhanced Vintage Wooden Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/20 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
                    <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
                            style={{
                                left: `${15 + i * 15}%`,
                                top: `${10 + i * 10}%`,
                                animationDelay: `${i * 2}s`,
                                animationDuration: `${8 + i}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-heading text-2xl font-bold text-[#FDF6EC]">
                                Battle Chamber:
                                <span className="text-[#C9A227] tracking-widest ml-2 font-mono">{gameState.roomToken}</span>
                            </h2>

                            {savingStats && (
                                <div className="bg-[#C9A227]/10 backdrop-blur-sm border border-[#C9A227]/30 rounded-lg px-4 py-2">
                                    <div className="text-[#C9A227] text-sm animate-pulse flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#C9A227] rounded-full animate-bounce"></div>
                                        Recording battle results...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {gameState.status === 'lobby' && (
                        <div className="text-center mb-6">
                            <p className="text-[#D7CCC8] text-lg">
                                ⏳ Gathering warriors... Share the chamber token with fellow members!
                            </p>
                        </div>
                    )}

                    {/* Players Panel */}
                    <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 mb-8 shadow-2xl shadow-[#4E342E]/50 relative">
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                        <h3 className="font-heading text-xl font-semibold text-[#C9A227] mb-4 flex items-center gap-2">
                            ⚔️ Warriors ({gameState.players.length})
                        </h3>
                        <div className="space-y-3">
                            {gameState.players
                                .filter(player => player.User)
                                .map(renderPlayerTrack)}
                        </div>
                    </div>

                    {/* Lobby Controls */}
                    {gameState.status === 'lobby' && gameState.players.find(p => p.id === gameState.playerId)?.isHost && (
                        <div className="text-center mb-8">
                            <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 shadow-lg shadow-[#4E342E]/30">
                                {gameState.players.length >= 2 ? (
                                    <>
                                        <button
                                            onClick={handleStartGame}
                                            className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-4 rounded-full 
                                                     transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                                                     transform hover:scale-105 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                                           transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                                           transition-transform duration-1000"></div>
                                            ⚔️ Commence Battle!
                                        </button>
                                        <p className="text-sm text-[#D7CCC8] mt-3">You are the Master - begin when ready!</p>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            disabled
                                            className="bg-[#4E342E]/60 text-[#D7CCC8]/50 font-bold px-8 py-4 rounded-full cursor-not-allowed border border-[#6D4C41]"
                                        >
                                            ⏳ Awaiting Warriors
                                        </button>
                                        <p className="text-sm text-[#C9A227] mt-3">⚠️ Awaiting at least one opponent to join the battle!</p>
                                        <p className="text-xs text-[#D7CCC8]/70 mt-2">A minimum of 2 members required for battle</p>
                                    </>
                                )}

                                {error && (
                                    <div className="mt-4 p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                                        <p className="text-[#FF6B6B] text-sm font-medium">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active Game */}
                    {gameState.status === 'in-progress' && (
                        <>
                            {/* Typing Area */}
                            <div className="relative mb-8" onClick={() => inputRef.current?.focus()}>
                                <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-1 shadow-2xl shadow-[#4E342E]/50 relative">
                                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                                    <div className="text-2xl leading-relaxed tracking-wider bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-6 h-48 overflow-y-auto select-none
                                                  scrollbar-thin scrollbar-track-[#4E342E] scrollbar-thumb-[#C9A227]">
                                        {renderTypingText()}
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={handleTyping}
                                        onPaste={(e) => e.preventDefault()}
                                        onKeyDown={(e) => {
                                            // Block copy/paste shortcuts
                                            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                                                e.preventDefault();
                                                return;
                                            }

                                            // STRICT MODE: Block Space if current word has errors
                                            if (e.key === ' ') {
                                                const currentInput = inputText;
                                                const targetSlice = gameState.text.substring(0, currentInput.length);
                                                
                                                if (currentInput !== targetSlice) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                            }

                                            // Count physical keystrokes for strict accuracy
                                            if (e.key.length === 1 || e.key === 'Backspace') {
                                                totalKeystrokes.current += 1;
                                            }
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none resize-none p-6 text-2xl select-none"
                                        autoFocus
                                    />

                                </div>
                            </div>

                            {/* Personal Stats */}
                            {playerProgress[gameState.playerId] && (
                                <div className="text-center mb-6">
                                    <div className="inline-flex gap-6 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl px-8 py-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#C9A227]">{playerProgress[gameState.playerId].wpm || 0}</div>
                                            <div className="text-xs text-[#D7CCC8]">Speed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#C9A227]">{playerProgress[gameState.playerId].accuracy || 100}%</div>
                                            <div className="text-xs text-[#D7CCC8]">Precision</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#C9A227]">{Math.round(playerProgress[gameState.playerId].progress || 0)}%</div>
                                            <div className="text-xs text-[#D7CCC8]">Progress</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-20px) translateX(12px);
                        opacity: 0.8;
                    }
                }
                
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }

                /* Custom Wooden Scrollbar */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .scrollbar-track-\\[\\#4E342E\\]::-webkit-scrollbar-track {
                    background: #4E342E;
                    border-radius: 10px;
                }
                
                .scrollbar-thumb-\\[\\#C9A227\\]::-webkit-scrollbar-thumb {
                    background: #C9A227;
                    border-radius: 10px;
                    border: 2px solid #4E342E;
                }
                
                .scrollbar-thumb-\\[\\#C9A227\\]::-webkit-scrollbar-thumb:hover {
                    background: #B8941F;
                }
            `}</style>
        </div>
    );
};

export default MultiplayerGame;
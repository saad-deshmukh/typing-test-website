
import { useState, useEffect, useRef, useMemo } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Castle, Swords } from 'lucide-react';
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';
import statsService from "../services/statsService";

// Configuration 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const MultiplayerGame = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);

    // Initialize Socket with Token
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            withCredentials: true
        });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    const [roomTokenInput, setRoomTokenInput] = useState("");
    const [gameState, setGameState] = useState({
        roomToken: "",
        players: [],
        status: "pending",
        text: "",
        startTime: null,
        gameId: null,
    });

    const currentPlayerId = useMemo(() => {
        if (!user?.id || !gameState.players.length) return null;
        return gameState.players.find(p => p.User?.id === user.id)?.id;
    }, [gameState.players, user?.id]);


    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState("");
    const [waitingForOthers, setWaitingForOthers] = useState(false);

    const [playerProgress, setPlayerProgress] = useState({});
    const [error, setError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [validationError, setValidationError] = useState('');


    // Statistics
    const [gameStartTime, setGameStartTime] = useState(null);
    const [finalStats, setFinalStats] = useState(null);
    const [savingStats, setSavingStats] = useState(false);

    const inputRef = useRef(null);

    const targetWords = useMemo(() => {
        return gameState.text ? gameState.text.split(" ") : [];
    }, [gameState.text]);

    const api = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true
    });

    useEffect(() => {
        if (!socket) return;
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

            // Reset Game Logic
            setActiveWordIndex(0);
            setCurrentInput("");
            setWaitingForOthers(false);
            setPlayerProgress({});
            setGameStartTime(new Date());

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        });

        socket.on("progressUpdate", ({ playerId, progress, accuracy, wpm }) => {
            setPlayerProgress(prev => ({ ...prev, [playerId]: { progress, accuracy, wpm } }));
        });

        socket.on("bulkProgressUpdate", (updates) => {
            setPlayerProgress(prev => {
                const newState = { ...prev };
                updates.forEach(u => {
                    newState[u.playerId] = {
                        progress: u.progress,
                        accuracy: u.accuracy,
                        wpm: u.wpm
                    };
                });
                return newState;
            });
        });

        socket.on("endGame", async (results) => {

            if (user && currentPlayerId) {
                await saveMultiplayerGameStats(results);
            }
            // FETCH players from API + create lookup
            const playersWithUsernames = results.map(result => ({
                id: `player_${result.userId}`,
                User: {
                    id: result.userId,
                    username: result.isHost ? 'Host_Player' : `Player_${result.userId}` // TODO: Fetch real usernames
                }
            }));

            navigate(`/results/${gameState.roomToken}`, {
                state: {
                    results,           // Backend sends correct playerId
                    players: playersWithUsernames,
                    gameStats: finalStats
                }
            });
        });



        socket.on("syncState", ({ startTime, gameText, status, existingProgress, currentWordIndex }) => {
            //  Restore Game Data
            setGameState(prev => ({
                ...prev,
                status: status === 'waiting' ? 'lobby' : status,
                text: gameText,
                startTime: new Date(startTime),
                gameId: prev.gameId
            }));

            //  Restore Typing Progress 
            if (status === 'in-progress') {
                setActiveWordIndex(currentWordIndex || 0); // Jump to the correct word
                setGameStartTime(new Date(startTime)); // Sync timer

                setPlayerProgress(prev => ({
                    ...prev,
                    [currentPlayerId]: { progress: existingProgress, accuracy: 100, wpm: 0 }
                }));
            }
        });

        return () => {
            socket.off("updateRoom");
            socket.off("startGame");
            socket.off("progressUpdate");
            socket.off("bulkProgressUpdate");
            socket.off("endGame");
            socket.off("syncState");
        };
    }, [navigate, user, gameState.roomToken, finalStats]);

    // useeffect for host 
    useEffect(() => {
        if (!socket) return;

        // Listen for the specific destruction event
        socket.on("roomDestroyed", (reason) => {
            alert(`⚠️ ${reason}`);
            navigate("/"); // Redirect to Home
        });

        return () => {
            socket.off("roomDestroyed");
        };
    }, [socket, navigate]);

    const saveMultiplayerGameStats = async (results) => {
        try {
            setSavingStats(true);
            const playerResult = results.find(result => result.playerId === currentPlayerId);
            if (!playerResult) return;

            const stats = playerResult.stats || {};
            const gameData = {
                wpm: stats.wpm || 0,
                accuracy: stats.accuracy || 0,
                wordsTyped: stats.wordsTyped || 0,
                timeTaken: stats.timeTaken || 0,
                errorsMade: stats.errorsMade || 0,
                gameMode: 'multiplayer',
                textDifficulty: 'medium',
                gameId: gameState.gameId,
                playerId: currentPlayerId
            };

            await statsService.saveGameResult(gameData);
            setFinalStats(gameData);
        } catch (error) {
            console.error('Failed to save multiplayer game stats:', error);
        } finally {
            setSavingStats(false);
        }
    };

    // API Functions 

    //  Sanitize and validate token
    const sanitizeAndValidateToken = (input) => {
        if (!input) return { isValid: false, sanitized: '', error: 'Token required' };

        const sanitized = DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        }).trim().replace(/[^a-zA-Z0-9-]/g, '');

        if (sanitized.length === 0) return { isValid: false, sanitized: '', error: 'Invalid token format' };
        if (sanitized.length > 60) return { isValid: false, sanitized: '', error: 'Token too long (max 60 chars)' };
        if (sanitized.length < 4) return { isValid: false, sanitized: '', error: 'Token too short (min 4 chars)' };

        return { isValid: true, sanitized };
    };

    //  Real time input handler
    const handleInputChange = (e) => {
        setRoomTokenInput(e.target.value);
        setValidationError(''); // Clear on typing
    };

    const handleCreateRoom = async () => {
        if (!socket) return;
        try {
            const response = await api.post("/game/create-room");
            const { roomToken, gameId } = response.data;
            socket.emit("subscribeToRoom", { roomToken });
            setGameState({ ...gameState, status: 'lobby', roomToken, gameId });
        } catch (err) {
            // Handle Active Game Conflict 
            if (err.response && err.response.data.error === "ACTIVE_GAME_EXISTS") {
                const oldRoom = err.response.data.roomToken;
                const confirmLeave = window.confirm(
                    `You are already in an active battle (Room: ${oldRoom}).\n\nDo you want to FORFEIT that game to start a new one?`
                );

                if (confirmLeave) {
                    //  Call API to leave the old game
                    await api.post("/game/leave");
                    //  Retry creating the new room
                    handleCreateRoom();
                }
                return;
            }
            setError("Failed to create battle chamber.");
        }
    };


    // Join handler
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationError('');
        setSubmitError('');

        try {
            // Client validation
            const { isValid, sanitized, error } = sanitizeAndValidateToken(roomTokenInput);
            if (!isValid) {
                setValidationError(error);
                setIsSubmitting(false);
                return;
            }

            //  Rate limiting
            const now = Date.now();
            const attempts = JSON.parse(localStorage.getItem('joinAttempts') || '[]');
            const recentAttempts = attempts.filter(a => now - a.timestamp < 60000);

            if (recentAttempts.length >= 3) {
                setValidationError('Too many attempts. Wait 1 minute.');
                setIsSubmitting(false);
                return;
            }

            recentAttempts.push({ timestamp: now });
            localStorage.setItem('joinAttempts', JSON.stringify(recentAttempts.slice(-3)));

            if (!socket) throw new Error('Connection lost. Please refresh.');

            const response = await api.post("/game/join-room", {
                roomToken: sanitized
            }, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            });

            const { roomToken, gameId } = response.data;
            socket.emit("subscribeToRoom", { roomToken: sanitized });

            setRoomTokenInput('');
            localStorage.removeItem('joinAttempts');
            setGameState({ ...gameState, status: 'lobby', roomToken, gameId });

        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setSubmitError('Request timeout. Please try again.');
            } else if (!err.response) {
                setSubmitError('Network error. Check your connection.');
            } else if (err.response.status >= 500) {
                setSubmitError('Server error. Try again later.');
            } else if (err.response?.data?.error === "ACTIVE_GAME_EXISTS") {
                const oldRoom = err.response.data.roomToken || 'Unknown';
                const confirmLeave = window.confirm(
                    ` Active in Room: ${oldRoom}\n\nFORFEIT & join new chamber?`
                );
                if (confirmLeave) {
                    await api.post("/game/leave", {}, { timeout: 5000 });
                    const retryResponse = await api.post("/game/join-room", {
                        roomToken: sanitizeAndValidateToken(roomTokenInput).sanitized
                    });
                    const { roomToken, gameId } = retryResponse.data;
                    socket.emit("subscribeToRoom", { roomToken });
                    setGameState({ ...gameState, status: 'lobby', roomToken, gameId });
                }
            } else {
                setSubmitError(err.response?.data?.error || "Chamber not found.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleStartGame = () => {
        if (gameState.players.length < 2) {
            setError("You need at least 2 guild members to start!");
            return;
        }
        socket.emit("requestStartGame", { roomToken: gameState.roomToken });
    };

    // Sync active session across tabs 
    const checkActiveSession = async () => {
        // Only run if we don't already have a loaded state locally
        if (gameState.roomToken) return;

        try {
            const response = await api.get("/game/status");
            if (response.data.active) {
                const { roomToken, gameId, status } = response.data;
                //  Re-connect Socket
                if (socket) {
                    socket.emit("subscribeToRoom", { roomToken });
                }

                //  Restore State (Redirects UI to Game)
                setGameState(prev => ({
                    ...prev,
                    roomToken,
                    gameId,
                    status: status === 'waiting' ? 'lobby' : 'in-progress'
                }));
            }
        } catch (err) {
            console.error("Session check failed", err);
        }
    };
    useEffect(() => {
        checkActiveSession();
    }, [socket]);

    const handleCancelGame = () => {
        if (window.confirm("Are you sure you want to disband the lobby? All players will be disconnected.")) {
            socket.emit("cancelGame", { roomToken: gameState.roomToken });
        }
    };
    const calculateStats = () => {
        // Calculate total characters typed correctly so far
        let completedChars = 0;
        for (let i = 0; i < activeWordIndex; i++) {
            completedChars += targetWords[i].length + 1; // +1 for the space
        }
        completedChars += currentInput.length;

        // Progress 
        const progress = Math.min((completedChars / gameState.text.length) * 100, 100);

        // Time
        const currentTime = new Date();
        const timeElapsedSec = (currentTime - gameStartTime) / 1000;
        const timeElapsedMin = timeElapsedSec / 60;

        // WPM: (Total Correct Chars / 5) / TimeInMinutes
        let wpm = 0;
        if (timeElapsedMin > 0) {
            wpm = Math.round((completedChars / 5) / timeElapsedMin);
        }

        // Accuracy (Since we block wrong inputs, accuracy is technically always 100%)
        const accuracy = 100;

        return { progress, wpm, accuracy, completedChars, timeElapsedSec };
    };

    // Handle Key Down
    const handleKeyDown = (e) => {
        if (waitingForOthers) return;

        // Only Space and Enter move to next word
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();

            const currentTargetWord = targetWords[activeWordIndex];

            //  Must match word strictly
            if (currentInput === currentTargetWord) {
                const nextIndex = activeWordIndex + 1;

                //  Calculate stats NOW (To capture the speed of the word just typed)
                const { progress, wpm, accuracy } = calculateStats();

                // Check if game is complete
                if (nextIndex >= targetWords.length) {

                    //  Force LOCAL UI to 100% immediately (Visual Snap)
                    setPlayerProgress(prev => ({
                        ...prev,
                        [currentPlayerId]: {
                            progress: 100,
                            accuracy: 100,
                            wpm: wpm
                        }
                    }));

                    finishGame();

                } else {

                    // Move to next word
                    setActiveWordIndex(nextIndex);
                    setCurrentInput("");

                    // Update Local UI
                    setPlayerProgress(prev => ({
                        ...prev,
                        [currentPlayerId]: { progress, accuracy, wpm }  // ✅ CHANGED
                    }));

                    // Emit progress to Server
                    socket.emit("playerProgress", {
                        roomToken: gameState.roomToken,
                        progress,
                        accuracy,
                        wpm: wpm,
                        wordCount: Math.floor(progress / 5),
                        wordIndex: nextIndex
                    });
                }
            }
            return;
        }
    };

    // Strict character logic
    const handleChange = (e) => {
        if (waitingForOthers) return;

        const val = e.target.value;
        const currentTargetWord = targetWords[activeWordIndex];

        // If user deleted characters (backspace), allow it always
        if (val.length < currentInput.length) {
            setCurrentInput(val);
            return;
        }

        //  Strict Typing
        const charIndex = val.length - 1;

        // Don't allow typing past the word length
        if (val.length > currentTargetWord.length) return;

        // Check if the typed character matches the target character
        if (val[charIndex] === currentTargetWord[charIndex]) {
            setCurrentInput(val);

            // Live update WPM even inside word
            const { progress, wpm, accuracy } = calculateStats();
            setPlayerProgress(prev => ({
                ...prev,
                [currentPlayerId]: { progress, accuracy, wpm }
            }));
        }

    };

    // Game Finished Logic 
    const finishGame = () => {
        const { wpm, accuracy, timeElapsedSec, completedChars } = calculateStats();
        //Wait for others
        setWaitingForOthers(true);

        setPlayerProgress(prev => ({
            ...prev,
            [currentPlayerId]: {
                progress: 100,
                accuracy: 100,
                wpm
            }
        }));

        // Send finish signal to server
        const finalPlayerStats = {
            wpm,
            accuracy: 100,
            progress: 100,
            timeTaken: Math.round(timeElapsedSec),
            wordsTyped: Math.round(completedChars / 5),
            errorsMade: 0
        };

        socket.emit("playerFinished", {
            roomToken: gameState.roomToken,
            accuracy: 100,
            stats: finalPlayerStats
        });
    };

    const renderPlayerTrack = (player) => {
        //  Try to get Live Data from the socket
        let progressData = playerProgress[player.id];

        // 2. If no Live Data, check if the Database says they are finished
        if (!progressData) {
            if (player.time && player.speed) {
                // They are finished! Use DB stats.
                progressData = {
                    progress: 100,
                    wpm: player.speed,
                    accuracy: player.accuracy || 100
                };
            } else {
                // Default: They are at the start
                progressData = { progress: 0, wpm: 0, accuracy: 100 };
            }
        }

        // Use dynamic currentPlayerId
        const isCurrentPlayer = player.id === currentPlayerId;

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
                    </div>
                </div>
            </div>
        );
    };

    const renderTypingText = () => {
        return (
            <div className="flex flex-wrap gap-2">
                {targetWords.map((word, wIndex) => {
                    let wordClass = "px-1 rounded ";

                    if (wIndex < activeWordIndex) {
                        // Completed words
                        wordClass += "text-[#C9A227] opacity-60"; // Gold dim
                        return <span key={wIndex} className={wordClass}>{word}</span>;
                    } else if (wIndex === activeWordIndex) {
                        // Current Active Word
                        wordClass += "bg-[#C9A227]/20 border-b-2 border-[#C9A227] ";
                        return (
                            <span key={wIndex} className={wordClass}>
                                {word.split("").map((char, cIndex) => {
                                    let charColor = "text-[#D7CCC8]"; // Default
                                    if (cIndex < currentInput.length) {
                                        charColor = "text-[#C9A227]";
                                    }
                                    // cursor logic
                                    const isCursor = cIndex === currentInput.length;
                                    return (
                                        <span key={cIndex} className={`${charColor} ${isCursor ? 'border-l-2 border-[#FDF6EC] animate-pulse' : ''}`}>
                                            {char}
                                        </span>
                                    );
                                })}
                                {/* Cursor at end of word if needed */}
                                {currentInput.length === word.length && (
                                    <span className="border-l-2 border-[#FDF6EC] animate-pulse">&nbsp;</span>
                                )}
                            </span>
                        );
                    } else {
                        // Future words
                        wordClass += "text-[#D7CCC8]/40";
                        return <span key={wIndex} className={wordClass}>{word}</span>;
                    }
                })}
            </div>
        );
    };

    // Main Component Return
    if (gameState.status === 'pending') {
        return (
            <div className="min-h-screen relative overflow-hidden font-body">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform rotate-3 animate-pulse"></div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative">
                            <h1 className="font-heading text-3xl font-bold text-center text-[#FDF6EC] mb-6 drop-shadow-lg">
                                <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                                    Battle Arena
                                </span>
                            </h1>
                            {user ? (
                                <div className="text-center mb-6 p-4 bg-[#C9A227]/10 border border-[#C9A227]/20 rounded-xl backdrop-blur-sm">
                                    <p className="text-sm text-[#C9A227] font-medium">Your battle results will be recorded!</p>
                                </div>
                            ) : (
                                <div className="text-center mb-6 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl backdrop-blur-sm">
                                    <p className="text-sm text-[#ff4b4b] font-medium">Join to save your battle achievements!</p>
                                </div>
                            )}

                            {error && (
                                <div className="text-center mb-4 p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                                    <p className="text-[#ff4b4b] text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleCreateRoom}
                                    className="w-full py-4 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold rounded-full shadow-lg shadow-[#C9A227]/30 hover:scale-[1.02] transition-transform flex items-center gap-2 justify-center"
                                >
                                    <Swords size={20} className="flex-shrink-0" /> Create Battle Chamber
                                </button>
                                <div className="flex items-center gap-2">
                                    <hr className="w-full border-[#6D4C41]" />
                                    <span className="text-[#D7CCC8] text-sm font-medium px-2">OR</span>
                                    <hr className="w-full border-[#6D4C41]" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Enter Chamber Token"
                                                className={`w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border rounded-xl text-[#FDF6EC] outline-none transition-all duration-200 ${validationError
                                                    ? 'border-red-500/80 bg-red-500/10'
                                                    : 'border-[#6D4C41] focus:border-[#C9A227]'
                                                    } ${isSubmitting ? 'opacity-75' : ''}`}
                                                value={roomTokenInput}
                                                onChange={handleInputChange}
                                                disabled={isSubmitting}
                                                maxLength={60}
                                                autoComplete="off"
                                                spellCheck="false"
                                                aria-invalid={!!validationError}
                                                aria-describedby={validationError ? "token-error" : undefined}
                                            />
                                            {validationError && (
                                                <p id="token-error" className="text-red-400 text-sm mt-1 px-1">
                                                    {validationError}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !roomTokenInput.trim()}
                                            className={`w-full py-4 font-bold rounded-full border transition-all duration-200 flex items-center gap-2 justify-center ${isSubmitting || !roomTokenInput.trim()
                                                ? 'bg-[#4E342E]/40 border-[#6D4C41]/50 text-[#C9A227]/60 cursor-not-allowed'
                                                : 'bg-[#4E342E]/80 text-[#C9A227] border border-[#6D4C41] hover:border-[#C9A227] hover:bg-[#4E342E]/90 active:scale-[0.98]'
                                                }`}
                                            aria-label={isSubmitting ? "Joining chamber..." : "Join chamber"}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin" />
                                                    Joining...
                                                </>
                                            ) : (
                                                <>
                                                    <Castle size={20} className="flex-shrink-0" />
                                                    Join Chamber
                                                </>
                                            )}
                                        </button>
                                        {submitError && (
                                            <p className="text-red-400 text-sm text-center px-2 py-2 bg-red-500/10 rounded-lg border border-red-500/30">
                                                {submitError}
                                            </p>
                                        )}
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-body">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
                <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/20 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-heading text-2xl font-bold text-[#FDF6EC]">
                                Battle Chamber:
                                <span className="text-[#C9A227] tracking-widest ml-2 font-mono">{gameState.roomToken}</span>
                            </h2>
                            {waitingForOthers && (
                                <div className="bg-[#C9A227]/20 backdrop-blur-sm border border-[#C9A227] rounded-lg px-6 py-2 animate-pulse">
                                    <span className="text-[#C9A227] font-bold">🏁 Finished! Awaiting other warriors...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {gameState.status === 'lobby' && (
                        <div className="text-center mb-6">
                            <p className="text-[#D7CCC8] text-lg">⏳ Gathering warriors... Share the chamber token!</p>
                        </div>
                    )}

                    <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 mb-8 shadow-2xl relative">
                        <h3 className="font-heading text-xl font-semibold text-[#C9A227] mb-4 flex items-center gap-2">
                            <Swords /> Warriors ({gameState.players.length})
                        </h3>
                        <div className="space-y-3">
                            {gameState.players.filter(p => p.User).map(renderPlayerTrack)}
                        </div>
                    </div>

                    {/* Lobby Controls */}
                    {gameState.status === 'lobby' && gameState.players.find(p => p.id === currentPlayerId)?.isHost && (  // ✅ CHANGED
                        <div className="text-center mb-8 ">
                            <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 shadow-lg flex items-center justify-center gap-6 ">
                                {gameState.players.length >= 2 ? (
                                    <button
                                        onClick={handleStartGame}
                                        className="bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-4 rounded-full shadow-lg shadow-[#C9A227]/30 hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <Swords /> Commence Battle!
                                    </button>
                                ) : (
                                    <div className="text-[#D7CCC8]/70">Waiting for opponents...</div>
                                )}<button
                                    onClick={handleCancelGame}
                                    className="text-[#FF6B6B] hover:text-[#ff8585] text-lg font-medium border border-[#FF6B6B]/30 hover:border-[#FF6B6B] px-6 py-4 rounded-full transition-all bg-[#FF6B6B]/5 hover:bg-[#FF6B6B]/10"
                                >
                                    ❌ Disband Lobby
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Game */}
                    {gameState.status === 'in-progress' && (
                        <>
                            {/* Typing Area */}
                            <div className="relative mb-8" onClick={() => !waitingForOthers && inputRef.current?.focus()}>
                                <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-1 shadow-2xl shadow-[#4E342E]/50 relative">

                                    {/* Waiting Overlay */}
                                    {waitingForOthers && (
                                        <div className="absolute inset-0 z-50 bg-[#2D1B13]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                                            <div className="text-4xl animate-bounce">🛡️</div>
                                            <h3 className="text-2xl text-[#C9A227] font-bold mt-4">Victory Secured!</h3>
                                            <p className="text-[#D7CCC8] mt-2">Observing the battlefield...</p>
                                        </div>
                                    )}

                                    <div className="text-2xl leading-relaxed tracking-wider bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-6 h-48 overflow-y-auto select-none font-mono">
                                        {renderTypingText()}
                                    </div>

                                    {!waitingForOthers && (
                                        <input
                                            ref={inputRef}
                                            value={currentInput}
                                            onChange={handleChange}
                                            onKeyDown={handleKeyDown}
                                            onPaste={(e) => e.preventDefault()}
                                            className="absolute opacity-0 w-0 h-0"
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div className="mt-2 text-center text-[#D7CCC8]/50 text-sm">
                                    Type the highlighted word. Press <span className="text-[#C9A227] border border-[#C9A227]/30 px-1 rounded">Space</span> to advance. Errors are blocked.
                                </div>
                            </div>

                            {/* Personal Stats */}
                            {playerProgress[currentPlayerId] && (
                                <div className="text-center mb-6">
                                    <div className="inline-flex gap-6 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl px-8 py-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#C9A227]">{playerProgress[currentPlayerId].wpm || 0}</div>  // ✅ CHANGED
                                            <div className="text-xs text-[#D7CCC8]">Speed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#C9A227]">{Math.round(playerProgress[currentPlayerId].progress || 0)}%</div>  // ✅ CHANGED
                                            <div className="text-xs text-[#D7CCC8]">Progress</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MultiplayerGame;

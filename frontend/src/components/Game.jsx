
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import statsService from "../services/statsService";

// A more extensive word list for a better experience
const words = {
    Easy: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"],
    Medium: ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media"],
    Hard: ["organization", "analysis", "strategy", "technology", "community", "definition", "management", "security", "policy", "series", "thought", "basis", "direction", "development", "investment", "maintenance", "negotiation", "performance", "replacement", "significance", "understanding", "consequence", "establishment", "explanation", "interaction", "philosophy", "resolution", "satisfaction", "communication", "distribution", "entertainment", "independence", "opportunity", "psychology", "recommendation", "relationship", "responsibility", "championship"]
};

const Game = () => {
    const [timeLimit, setTimeLimit] = useState(60);
    const [difficulty, setDifficulty] = useState("Medium");
    const [userInput, setUserInput] = useState("");
    const [targetText, setTargetText] = useState("");
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errors, setErrors] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    // New states for statistics
    const [wordsTyped, setWordsTyped] = useState(0);
    const [savingResults, setSavingResults] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [gameStartTime, setGameStartTime] = useState(null);

    const inputRef = useRef(null);
    const textDisplayRef = useRef(null); // New ref for text display area
    const { user } = useAuth();

    // Function to generate a new block of text
    const generateText = () => {
        const wordArray = words[difficulty];
        const text = Array.from(
            { length: 50 }, // Generate a consistent number of words
            () => wordArray[Math.floor(Math.random() * wordArray.length)]
        ).join(" ");
        setTargetText(text);
    };

    // Reset game state and generate new text when settings change
    useEffect(() => {
        resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty, timeLimit]);

    // Game timer logic
    useEffect(() => {
        let timer;
        if (isStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsStarted(false);
            finishGame();
        }
        return () => clearInterval(timer);
    }, [isStarted, timeLeft]);

    // Calculation logic for WPM and Accuracy
    useEffect(() => {
        if (!isStarted && userInput.length === 0) return;

        const typedChars = userInput.length;
        let correctChars = 0;
        let errorCount = 0;

        userInput.split('').forEach((char, index) => {
            if (char === targetText[index]) {
                correctChars++;
            } else {
                errorCount++;
            }
        });
        
        setErrors(errorCount);
        setAccuracy(typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100);

        // Calculate words typed (approximate)
        const wordsCount = Math.floor(correctChars / 5);
        setWordsTyped(wordsCount);

        const elapsedTimeInMinutes = (timeLimit - timeLeft) / 60;
        if (elapsedTimeInMinutes > 0) {
            // WPM is calculated as (all typed characters / 5) / time (min)
            const grossWpm = (typedChars / 5) / elapsedTimeInMinutes;
            setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
        }

        // Auto-scroll to keep cursor in view
        scrollToKeepCursorVisible();

    }, [userInput, targetText, timeLeft, timeLimit, isStarted]);

    // New function to auto-scroll and keep cursor visible
    const scrollToKeepCursorVisible = () => {
        if (!textDisplayRef.current) return;

        const container = textDisplayRef.current;
        const cursorElement = container.querySelector('.cursor-position');
        
        if (cursorElement) {
            const containerRect = container.getBoundingClientRect();
            const cursorRect = cursorElement.getBoundingClientRect();
            
            // Check if cursor is below visible area
            if (cursorRect.bottom > containerRect.bottom) {
                container.scrollTop += cursorRect.bottom - containerRect.bottom + 20;
            }
            // Check if cursor is above visible area
            else if (cursorRect.top < containerRect.top) {
                container.scrollTop -= containerRect.top - cursorRect.top + 20;
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!isStarted && value.length > 0) {
            setIsStarted(true);
            setIsFinished(false);
            setGameStartTime(new Date());
        }
        if (value.length <= targetText.length) {
            setUserInput(value);
        }
    };

    // New function to handle game completion and save results
    const finishGame = async () => {
        setIsFinished(true);
        
        // Only save results if user is logged in and actually typed something
        if (user && userInput.length > 0) {
            await saveGameResults();
        }
    };

    // New function to save game results to backend
    const saveGameResults = async () => {
        try {
            setSavingResults(true);
            setSaveError(null);

            const gameData = {
                wpm: wpm,
                accuracy: accuracy,
                wordsTyped: wordsTyped,
                timeTaken: timeLimit - timeLeft,
                errorsMade: errors,
                gameMode: 'standard',
                textDifficulty: difficulty.toLowerCase(),
                gameId: null, // This is a solo game
                playerId: null // This is a solo game
            };

            await statsService.saveGameResult(gameData);
            console.log('✅ Game result saved successfully!');
            
        } catch (error) {
            console.error('❌ Failed to save game result:', error);
            setSaveError('Failed to save your results. Please check your connection.');
        } finally {
            setSavingResults(false);
        }
    };

    const resetGame = () => {
        setIsStarted(false);
        setIsFinished(false);
        setUserInput("");
        setTimeLeft(timeLimit);
        setWpm(0);
        setAccuracy(100);
        setErrors(0);
        setWordsTyped(0);
        setSavingResults(false);
        setSaveError(null);
        setGameStartTime(null);
        generateText();
        inputRef.current?.focus();
        
        // Reset scroll position
        if (textDisplayRef.current) {
            textDisplayRef.current.scrollTop = 0;
        }
    };

    const renderTargetText = () => {
        return targetText.split("").map((char, index) => {
            let className = "text-slate-500"; // Untyped text
            if (index < userInput.length) {
                className = char === userInput[index]
                    ? "text-cyan-300" // Correctly typed
                    : "text-red-500 bg-red-900/50 rounded"; // Incorrectly typed
            }
            // Render the caret with a special class for scrolling
            if (index === userInput.length) {
                return (
                    <span key={index} className="cursor-position">
                        <span className="animate-pulse text-cyan-300">|</span>
                        <span className={className}>{char}</span>
                    </span>
                );
            }
            return <span key={index} className={className}>{char}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <h1 className="text-4xl font-bold text-center text-cyan-300 mb-2">
                    Typing Challenge
                </h1>
                <p className="text-center text-slate-400 mb-8">
                    {user ? `Welcome, ${user.username}!` : "Hone your typing skills."}
                </p>

                {/* Game Settings */}
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-8">
                    <div className="flex items-center gap-2">
                        <label htmlFor="timeLimit" className="text-slate-400">Time:</label>
                        <select
                            id="timeLimit"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value={15}>15s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                            <option value={120}>120s</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="difficulty" className="text-slate-400">Difficulty:</label>
                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Text Display - FIXED with scrollable container */}
                <div className="relative">
                    <div 
                        ref={textDisplayRef}
                        className="text-2xl leading-relaxed tracking-wider bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-48 overflow-y-auto mb-4 backdrop-blur-sm scroll-smooth"
                        style={{ 
                            scrollBehavior: 'smooth',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {renderTargetText()}
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        disabled={isFinished}
                        className="absolute inset-0 w-full h-full bg-transparent opacity-0 cursor-text"
                        onFocus={() => inputRef.current?.select()}
                    />
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Time Left</p>
                        <p className="text-3xl font-bold text-cyan-300">{timeLeft}s</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">WPM</p>
                        <p className="text-3xl font-bold text-cyan-300">{wpm}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Accuracy</p>
                        <p className="text-3xl font-bold text-cyan-300">{accuracy}%</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm">Errors</p>
                        <p className="text-3xl font-bold text-cyan-300">{errors}</p>
                    </div>
                </div>

                {/* Saving Status (NEW) */}
                {savingResults && (
                    <div className="text-center mb-4">
                        <p className="text-cyan-300 animate-pulse">💾 Saving your results...</p>
                    </div>
                )}

                {/* Save Error (NEW) */}
                {saveError && (
                    <div className="text-center mb-4">
                        <p className="text-red-400">⚠️ {saveError}</p>
                    </div>
                )}

                {/* Reset Button */}
                <div className="text-center">
                    <button
                        onClick={resetGame}
                        className="bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    >
                        Restart Test
                    </button>
                </div>

                {/* Final Score Modal (ENHANCED) */}
                {isFinished && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-md">
                        <div className="bg-slate-800 border border-cyan-500/50 p-8 rounded-xl text-center shadow-2xl max-w-lg mx-4">
                            <h3 className="text-2xl font-bold text-cyan-300 mb-2">Time's Up!</h3>
                            <p className="text-slate-400 mb-6">Here's your final score:</p>
                            
                            {/* Enhanced Results Display */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">WPM</p>
                                    <p className="text-3xl font-bold text-cyan-300">{wpm}</p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">Accuracy</p>
                                    <p className="text-3xl font-bold text-cyan-300">{accuracy}%</p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">Words Typed</p>
                                    <p className="text-2xl font-bold text-cyan-300">{wordsTyped}</p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">Errors</p>
                                    <p className="text-2xl font-bold text-cyan-300">{errors}</p>
                                </div>
                            </div>

                            {/* Save Status in Modal */}
                            {user && savingResults && (
                                <p className="text-cyan-300 text-sm mb-4 animate-pulse">
                                    💾 Saving to your profile...
                                </p>
                            )}
                            
                            {user && !savingResults && !saveError && (
                                <p className="text-green-400 text-sm mb-4">
                                    ✅ Results saved to your profile!
                                </p>
                            )}

                            {saveError && (
                                <p className="text-red-400 text-sm mb-4">
                                    ⚠️ {saveError}
                                </p>
                            )}

                            {!user && (
                                <p className="text-yellow-400 text-sm mb-4">
                                    💡 Sign in to save your results and track progress!
                                </p>
                            )}

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={resetGame}
                                    className="bg-cyan-500 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300"
                                >
                                    Try Again
                                </button>
                                {user && (
                                    <button
                                        onClick={() => window.location.href = '/profile'}
                                        className="bg-slate-600 text-cyan-300 font-bold px-6 py-3 rounded-lg hover:bg-slate-500 transition-all duration-300 border border-cyan-500/30"
                                    >
                                        View Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;

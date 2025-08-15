import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext"; // Assuming you might want to save scores later

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

    const inputRef = useRef(null);
    const { user } = useAuth(); // Example of getting user data

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
            setIsFinished(true);
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

        const elapsedTimeInMinutes = (timeLimit - timeLeft) / 60;
        if (elapsedTimeInMinutes > 0) {
            // WPM is calculated as (all typed characters / 5) / time (min)
            const grossWpm = (typedChars / 5) / elapsedTimeInMinutes;
            setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
        }

    }, [userInput, targetText, timeLeft, timeLimit, isStarted]);


    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!isStarted && value.length > 0) {
            setIsStarted(true);
            setIsFinished(false);
        }
        if (value.length <= targetText.length) {
            setUserInput(value);
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
        generateText();
        inputRef.current?.focus();
    };

    const renderTargetText = () => {
        return targetText.split("").map((char, index) => {
            let className = "text-slate-500"; // Untyped text
            if (index < userInput.length) {
                className = char === userInput[index]
                    ? "text-cyan-300" // Correctly typed
                    : "text-red-500 bg-red-900/50 rounded"; // Incorrectly typed
            }
            // Render the caret
            if (index === userInput.length) {
                return (
                    <span key={index}>
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

                {/* Text Display */}
                <div className="relative">
                    <div className="text-2xl leading-relaxed tracking-wider bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-48 overflow-hidden mb-4 backdrop-blur-sm">
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

                {/* Reset Button */}
                <div className="text-center">
                    <button
                        onClick={resetGame}
                        className="bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    >
                        Restart Test
                    </button>
                </div>

                {/* Final Score Modal */}
                {isFinished && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-md">
                        <div className="bg-slate-800 border border-cyan-500/50 p-8 rounded-xl text-center shadow-2xl">
                            <h3 className="text-2xl font-bold text-cyan-300 mb-2">Time's Up!</h3>
                            <p className="text-slate-400 mb-6">Here's your final score:</p>
                            <div className="flex gap-6 justify-center mb-8">
                                <div>
                                    <p className="text-slate-400">WPM</p>
                                    <p className="text-4xl font-bold text-cyan-300">{wpm}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Accuracy</p>
                                    <p className="text-4xl font-bold text-cyan-300">{accuracy}%</p>
                                </div>
                            </div>
                            <button
                                onClick={resetGame}
                                className="bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-cyan-400 transition-all duration-300"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;

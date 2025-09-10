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
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    // Advanced word-based state management
    const [targetWords, setTargetWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [userTypedWords, setUserTypedWords] = useState([]);
    const [wordStatuses, setWordStatuses] = useState([]);
    const [furthestCorrectWord, setFurthestCorrectWord] = useState(-1);
    
    // Statistics
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errors, setErrors] = useState(0);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [savingResults, setSavingResults] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [gameStartTime, setGameStartTime] = useState(null);

    const inputRef = useRef(null);
    const textDisplayRef = useRef(null);
    const { user } = useAuth();

    // Generate words array
    const generateText = () => {
        const wordArray = words[difficulty];
        const newWords = Array.from(
            { length: 50 },
            () => wordArray[Math.floor(Math.random() * wordArray.length)]
        );
        setTargetWords(newWords);
        setUserTypedWords(new Array(newWords.length).fill(""));
        setWordStatuses(new Array(newWords.length).fill("pending"));
    };

    // Reset game state and generate new text when settings change
    useEffect(() => {
        resetGame();
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

    // Calculate statistics based on word completion
    useEffect(() => {
        if (!isStarted && currentWordIndex === 0 && currentCharIndex === 0) return;

        const completedWords = wordStatuses.filter((status, index) => 
            status === 'correct' && index < currentWordIndex
        ).length;
        
        const totalCompletedWords = wordStatuses.filter(status => 
            status === 'correct' || status === 'incorrect'
        ).length;
        
        const incorrectWords = wordStatuses.filter(status => status === 'incorrect').length;
        
        setWordsTyped(completedWords);
        setErrors(incorrectWords);
        
        if (totalCompletedWords > 0) {
            setAccuracy(Math.round((completedWords / totalCompletedWords) * 100));
        }

        const elapsedTimeInMinutes = (timeLimit - timeLeft) / 60;
        if (elapsedTimeInMinutes > 0) {
            const calculatedWpm = Math.round(completedWords / elapsedTimeInMinutes);
            setWpm(calculatedWpm > 0 ? calculatedWpm : 0);
        }

    }, [currentWordIndex, wordStatuses, timeLeft, timeLimit, isStarted]);

    // Check if user can backtrack to previous words
    const canBacktrackToPreviousWord = (targetWordIndex) => {
        if (targetWordIndex === currentWordIndex - 1) {
            return true;
        }
        
        if (targetWordIndex <= furthestCorrectWord) {
            return false;
        }
        
        for (let i = targetWordIndex; i < currentWordIndex; i++) {
            if (wordStatuses[i] === 'correct') {
                return false;
            }
        }
        
        return true;
    };

    // Advanced keyboard input handler
    const handleKeyDown = (e) => {
        if (isFinished) return;

        const currentWord = targetWords[currentWordIndex];
        const userCurrentWord = userTypedWords[currentWordIndex];

        if (!isStarted && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
            setIsStarted(true);
            setIsFinished(false);
            setGameStartTime(new Date());
        }

        if (e.key === ' ') {
            e.preventDefault();
            
            if (currentCharIndex === 0) {
                return;
            }
            
            if (currentCharIndex < currentWord.length && userCurrentWord === currentWord.slice(0, currentCharIndex)) {
                return;
            }
            
            const newWordStatuses = [...wordStatuses];
            
            if (userCurrentWord === currentWord) {
                newWordStatuses[currentWordIndex] = 'correct';
                setFurthestCorrectWord(currentWordIndex);
            } else {
                newWordStatuses[currentWordIndex] = 'incorrect';
            }
            
            setWordStatuses(newWordStatuses);
            
            if (currentWordIndex < targetWords.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
                setCurrentCharIndex(0);
            }
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            
            if (currentCharIndex > 0) {
                const newUserTypedWords = [...userTypedWords];
                newUserTypedWords[currentWordIndex] = userCurrentWord.slice(0, -1);
                setUserTypedWords(newUserTypedWords);
                setCurrentCharIndex(prev => prev - 1);
                
                const newWordStatuses = [...wordStatuses];
                newWordStatuses[currentWordIndex] = 'pending';
                setWordStatuses(newWordStatuses);
                
            } else if (currentWordIndex > 0) {
                const targetWordIndex = currentWordIndex - 1;
                
                if (canBacktrackToPreviousWord(targetWordIndex)) {
                    setCurrentWordIndex(targetWordIndex);
                    setCurrentCharIndex(userTypedWords[targetWordIndex].length);
                    
                    const newWordStatuses = [...wordStatuses];
                    newWordStatuses[currentWordIndex] = 'pending';
                    newWordStatuses[targetWordIndex] = 'pending';
                    setWordStatuses(newWordStatuses);
                }
            }
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            
            const newUserTypedWords = [...userTypedWords];
            newUserTypedWords[currentWordIndex] = userCurrentWord + e.key;
            setUserTypedWords(newUserTypedWords);
            setCurrentCharIndex(prev => prev + 1);
            
            const newTypedWord = newUserTypedWords[currentWordIndex];
            const newWordStatuses = [...wordStatuses];
            
            if (newTypedWord.length <= currentWord.length) {
                if (newTypedWord === currentWord.slice(0, newTypedWord.length)) {
                    newWordStatuses[currentWordIndex] = newTypedWord.length === currentWord.length ? 'correct' : 'pending';
                } else {
                    newWordStatuses[currentWordIndex] = 'incorrect';
                }
            } else {
                newWordStatuses[currentWordIndex] = 'incorrect';
            }
            
            setWordStatuses(newWordStatuses);
        }
    };

    // **UPDATED: Clean word rendering without background highlights or underlines**
    const renderWords = () => {
        return targetWords.map((word, wordIndex) => {
            const userWord = userTypedWords[wordIndex] || "";
            const status = wordStatuses[wordIndex];
            const isCurrentWord = wordIndex === currentWordIndex;
            
            // **CLEAN STYLING: Only color changes, no backgrounds or underlines**
            let wordClassName = "inline-block whitespace-nowrap mr-2";
            
            if (status === 'correct') {
                wordClassName += " text-[#C9A227]"; // Only brass color, no background
            } else if (status === 'incorrect') {
                wordClassName += " text-[#FF6B6B]"; // Only red color, no background  
            } else if (isCurrentWord) {
                wordClassName += " text-[#D7CCC8]"; // Normal color, no background or underline
            } else {
                wordClassName += " text-[#D7CCC8]/70"; // Untyped words
            }
            
            return (
                <span key={wordIndex} className={wordClassName}>
                    {/* Render each character of the word */}
                    {word.split('').map((char, charIndex) => {
                        let charClass = "";
                        const userChar = userWord[charIndex];
                        
                        if (charIndex < userWord.length) {
                            if (userChar === char) {
                                // **CLEAN: Only color change for correct characters**
                                if (status === 'correct') {
                                    charClass = "text-[#C9A227]"; // Brass for completed correct words
                                } else if (status === 'incorrect') {
                                    charClass = "text-[#FF6B6B]"; // Red for completed incorrect words
                                } else {
                                    charClass = "text-[#C9A227]"; // Brass for current word correct chars
                                }
                            } else {
                                // **CLEAN: Only red color for wrong characters, no background**
                                charClass = "text-[#FF6B6B]";
                            }
                        } else if (isCurrentWord && charIndex === currentCharIndex) {
                            return (
                                <span key={charIndex} className="relative">
                                    <span className="animate-pulse text-[#C9A227] font-bold absolute -ml-0.5">|</span>
                                    <span className="text-[#D7CCC8]/70">{char}</span>
                                </span>
                            );
                        } else {
                            charClass = "text-[#D7CCC8]/70";
                        }
                        
                        return (
                            <span key={charIndex} className={charClass}>
                                {char}
                            </span>
                        );
                    })}
                    
                    {/* **CLEAN: Show over-typed characters in red without background** */}
                    {userWord.length > word.length && isCurrentWord && (
                        <span className="text-[#FF6B6B]">
                            {userWord.slice(word.length)}
                        </span>
                    )}
                    
                    {/* Show cursor at end if over-typing */}
                    {isCurrentWord && currentCharIndex >= word.length && (
                        <span className="animate-pulse text-[#C9A227] font-bold ml-0.5">|</span>
                    )}
                </span>
            );
        });
    };

    const finishGame = async () => {
        setIsFinished(true);
        
        if (user && wordsTyped > 0) {
            await saveGameResults();
        }
    };

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
                gameId: null,
                playerId: null
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
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        setFurthestCorrectWord(-1);
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
        
        if (textDisplayRef.current) {
            textDisplayRef.current.scrollTop = 0;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-body">
            {/* Vintage Wooden Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
                <div 
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                    }}
                />
                
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/20 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
                    <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
                    <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-[#C9A227]/10 via-transparent to-transparent transform rotate-6 animate-pulse delay-2000"></div>
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${8 + i * 8}%`,
                                animationDelay: `${i * 1.5}s`,
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
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-4xl font-bold text-[#FDF6EC] mb-2 drop-shadow-lg">
                            <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                                Advanced Typing Mastery
                            </span>
                        </h1>
                        <p className="text-[#D7CCC8] text-lg">
                            {user ? `Welcome to the forge, ${user.username}!` : "Master advanced typing with precision rules"}
                        </p>
                    </div>

                    {/* Game Settings */}
                    <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 mb-8 shadow-xl shadow-[#4E342E]/50 relative">
                        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                        <div className="flex justify-center items-center gap-8">
                            <div className="flex items-center gap-3">
                                <label htmlFor="timeLimit" className="text-[#D7CCC8] font-medium">Duration:</label>
                                <select
                                    id="timeLimit"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                                    className="bg-[#4E342E]/80 border-2 border-[#6D4C41] rounded-lg px-3 py-2 text-[#C9A227] 
                                             focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                                             transition-all duration-300"
                                >
                                    <option value={15}>15s</option>
                                    <option value={30}>30s</option>
                                    <option value={60}>60s</option>
                                    <option value={120}>120s</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="difficulty" className="text-[#D7CCC8] font-medium">Challenge:</label>
                                <select
                                    id="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="bg-[#4E342E]/80 border-2 border-[#6D4C41] rounded-lg px-3 py-2 text-[#C9A227] 
                                             focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                                             transition-all duration-300"
                                >
                                    <option value="Easy">Novice</option>
                                    <option value="Medium">Apprentice</option>
                                    <option value="Hard">Master</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* **CLEAN TEXT DISPLAY: No background highlights or underlines** */}
                    <div className="relative mb-8">
                        <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-1 shadow-2xl shadow-[#4E342E]/50 relative">
                            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                            <div 
                                ref={textDisplayRef}
                                className="text-2xl leading-relaxed tracking-wider bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-6 h-48 overflow-y-auto scroll-smooth
                                         scrollbar-thin scrollbar-track-[#4E342E] scrollbar-thumb-[#C9A227] scrollbar-thumb-rounded-full"
                                style={{ 
                                    scrollBehavior: 'smooth',
                                    lineHeight: '1.8em'
                                }}
                            >
                                {renderWords()}
                            </div>
                            
                            <input
                                ref={inputRef}
                                type="text"
                                value=""
                                onChange={() => {}}
                                onKeyDown={handleKeyDown}
                                className="absolute -top-96 left-0 w-1 h-1 opacity-0 pointer-events-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Stats Display */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                        <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4 shadow-lg">
                            <p className="text-[#D7CCC8] text-sm font-medium">Time Remaining</p>
                            <p className="text-3xl font-bold text-[#C9A227]">{timeLeft}s</p>
                        </div>
                        <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4 shadow-lg">
                            <p className="text-[#D7CCC8] text-sm font-medium">Speed</p>
                            <p className="text-3xl font-bold text-[#C9A227]">{wpm}</p>
                        </div>
                        <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4 shadow-lg">
                            <p className="text-[#D7CCC8] text-sm font-medium">Precision</p>
                            <p className="text-3xl font-bold text-[#C9A227]">{accuracy}%</p>
                        </div>
                        <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4 shadow-lg">
                            <p className="text-[#D7CCC8] text-sm font-medium">Mistakes</p>
                            <p className="text-3xl font-bold text-[#C9A227]">{errors}</p>
                        </div>
                    </div>

                    {/* Saving Status */}
                    {savingResults && (
                        <div className="text-center mb-4">
                            <p className="text-[#C9A227] animate-pulse font-medium">
                                📜 Recording your advanced mastery in the guild archives...
                            </p>
                        </div>
                    )}

                    {saveError && (
                        <div className="text-center mb-4">
                            <p className="text-[#FF6B6B] font-medium">⚠️ {saveError}</p>
                        </div>
                    )}

                    {/* Reset Button */}
                    <div className="text-center">
                        <button
                            onClick={resetGame}
                            className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-3 rounded-full 
                                     transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                                     transform hover:scale-105 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                           transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                           transition-transform duration-1000"></div>
                            Begin Advanced Challenge
                        </button>
                    </div>

                    {/* Final Score Modal */}
                    {isFinished && (
                        <div className="absolute inset-0 bg-[#2D1B13]/90 flex items-center justify-center backdrop-blur-md">
                            <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/50 rounded-2xl p-8 text-center shadow-2xl max-w-lg mx-4 relative">
                                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                                <h3 className="font-heading text-3xl font-bold text-[#FDF6EC] mb-2">Advanced Challenge Complete!</h3>
                                <p className="text-[#D7CCC8] mb-6">Your advanced mastery has been recorded:</p>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Speed</p>
                                        <p className="text-3xl font-bold text-[#C9A227]">{wpm}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">WPM</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Precision</p>
                                        <p className="text-3xl font-bold text-[#C9A227]">{accuracy}%</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Accuracy</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Words</p>
                                        <p className="text-2xl font-bold text-[#C9A227]">{wordsTyped}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Mastered</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Mistakes</p>
                                        <p className="text-2xl font-bold text-[#C9A227]">{errors}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Words</p>
                                    </div>
                                </div>

                                {user && savingResults && (
                                    <p className="text-[#C9A227] text-sm mb-4 animate-pulse">
                                        📜 Recording in guild chronicles...
                                    </p>
                                )}
                                
                                {user && !savingResults && !saveError && (
                                    <p className="text-[#C9A227] text-sm mb-4">
                                        ✨ Advanced achievement recorded in your guild profile!
                                    </p>
                                )}

                                {saveError && (
                                    <p className="text-[#FF6B6B] text-sm mb-4">
                                        ⚠️ {saveError}
                                    </p>
                                )}

                                {!user && (
                                    <p className="text-[#C9A227] text-sm mb-4">
                                        💡 Join the guild to save your advanced achievements!
                                    </p>
                                )}

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={resetGame}
                                        className="bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                                                 hover:from-[#B8941F] hover:to-[#C9A227] transition-all duration-300 shadow-lg shadow-[#C9A227]/30"
                                    >
                                        New Challenge
                                    </button>
                                    {user && (
                                        <button
                                            onClick={() => window.location.href = '/profile'}
                                            className="bg-[#4E342E]/80 text-[#C9A227] font-bold px-6 py-3 rounded-full border border-[#6D4C41] 
                                                     hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
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

                .scrollbar-thin::-webkit-scrollbar {
                    width: 8px;
                }
                
                .scrollbar-track-[\\#4E342E]::-webkit-scrollbar-track {
                    background: #4E342E;
                    border-radius: 10px;
                }
                
                .scrollbar-thumb-[\\#C9A227]::-webkit-scrollbar-thumb {
                    background: #C9A227;
                    border-radius: 10px;
                }
                
                .scrollbar-thumb-[\\#C9A227]::-webkit-scrollbar-thumb:hover {
                    background: #B8941F;
                }
            `}</style>
        </div>
    );
};

export default Game;

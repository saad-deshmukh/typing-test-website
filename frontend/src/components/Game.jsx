import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/authContext";
import statsService from "../services/statsService";
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from "lucide-react";

const words = {
    Easy: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"],
    Medium: ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media"],
    Hard: ["organization", "analysis", "strategy", "technology", "community", "definition", "management", "security", "policy", "series", "thought", "basis", "direction", "development", "investment", "maintenance", "negotiation", "performance", "replacement", "significance", "understanding", "consequence", "establishment", "explanation", "interaction", "philosophy", "resolution", "satisfaction", "communication", "distribution", "entertainment", "independence", "opportunity", "psychology", "recommendation", "relationship", "responsibility", "championship"]
};

const INITIAL_STATE = {
    timeLimit: 60, difficulty: "Medium", timeLeft: 60,
    isStarted: false, isFinished: false, gameAlreadyEnded: false,
    targetWords: [], currentWordIndex: 0, currentCharIndex: 0,
    userTypedWords: [], wordStatuses: [], furthestCorrectWord: -1,
    wpm: 0, accuracy: 100, errors: 0, wordsTyped: 0, gameStartTime: null
};

const useGameResults = () => {
    const navigate = useNavigate();
    const parseHashParams = () => {
        const hash = window.location.hash.substring(1);
        if (!hash.includes('?')) return { wpm: 0, accuracy: 0, wordsTyped: 0, errors: 0, difficulty: 'Medium' };
        const url = new URL('http://fake.com?' + hash.split('?')[1]);
        return {
            wpm: Number(url.searchParams.get('wpm')) || 0,
            accuracy: Number(url.searchParams.get('acc')) || 0,
            wordsTyped: Number(url.searchParams.get('words')) || 0,
            errors: Number(url.searchParams.get('errors')) || 0,
            difficulty: url.searchParams.get('diff') || 'Medium'
        };
    };

    const results = parseHashParams();
    const saveResults = (gameResults) => {
        const params = new URLSearchParams({
            wpm: Math.round(gameResults.wpm),
            acc: Math.round(gameResults.accuracy),
            words: gameResults.wordsTyped,
            errors: gameResults.errors,
            diff: gameResults.difficulty
        });
        navigate(`#results?${params.toString()}`);
    };
    const clearResults = () => navigate('#');
    return { results, saveResults, clearResults, hasResults: results.wpm > 0 };
};

const Game = () => {

    const [gameState, setGameState] = useState(() => {
        const saved = sessionStorage.getItem('typing_game_session');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.isFinished ? INITIAL_STATE : parsed;
        }
        return INITIAL_STATE;
    });

    const [savingResults, setSavingResults] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [gameSaved, setGameSaved] = useState(false);

    const inputRef = useRef(null);
    const textDisplayRef = useRef(null);
    const wordRefs = useRef([]);
    const channelRef = useRef(null);
    const timerRef = useRef(null);
    const { user } = useAuth();

    const { results, saveResults, clearResults, hasResults } = useGameResults();

    const setSyncedState = useCallback((newStateOrFn) => {
        setGameState((prevState) => {
            const newState = typeof newStateOrFn === 'function' ?
                newStateOrFn(prevState) : newStateOrFn;
            if (channelRef.current) {
                channelRef.current.postMessage(newState);
            }
            return newState;
        });
    }, []);

    const { timeLimit, difficulty, timeLeft, isStarted, isFinished,
        gameAlreadyEnded, targetWords, currentWordIndex, currentCharIndex,
        userTypedWords, wordStatuses, furthestCorrectWord, wpm,
        accuracy, errors, wordsTyped, gameStartTime } = gameState;

    const generateText = (specificDifficulty = difficulty) => {

        const wordArray = words[specificDifficulty];

        if (!wordArray) return { targetWords: [], userTypedWords: [], wordStatuses: [] };

        const newWords = Array.from(
            { length: 50 },
            () => wordArray[Math.floor(Math.random() * wordArray.length)]
        );
        return {
            targetWords: newWords,
            userTypedWords: new Array(newWords.length).fill(""),
            wordStatuses: new Array(newWords.length).fill("pending")
        };
    };

    const updateSettings = (newTimeLimit, newDifficulty) => {

        const wordData = generateText(newDifficulty);

        setSyncedState({
            ...gameState,
            timeLimit: newTimeLimit,
            difficulty: newDifficulty,
            timeLeft: newTimeLimit,
            ...wordData,
            isStarted: false,
            isFinished: false,
            gameAlreadyEnded: false,
            currentWordIndex: 0,
            currentCharIndex: 0,
            furthestCorrectWord: -1,
            wpm: 0,
            accuracy: 100,
            errors: 0,
            wordsTyped: 0,
            gameStartTime: null
        });

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        inputRef.current?.focus();
    };


    useEffect(() => {
        if (gameState.targetWords.length === 0) {
            const wordData = generateText(difficulty);
            setSyncedState(prev => ({
                ...prev,
                ...wordData
            }));
        }
    }, []);// will run only time on mount

    // Game timer logic with sync runs in ALL tabs but syncs
    useEffect(() => {
        if (isStarted && timeLeft > 0 && !isFinished) {
            timerRef.current = setInterval(() => {
                setSyncedState(prev => ({
                    ...prev,
                    timeLeft: prev.timeLeft - 1
                }));
            }, 1000);
        } else if (timeLeft === 0 && !gameAlreadyEnded) {
            setSyncedState(prev => ({
                ...prev,
                isStarted: false,
                timeLeft: 0
            }));
            finishGame();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isStarted, timeLeft, isFinished, gameAlreadyEnded, setSyncedState]);

    // Statistics calculation with sync
    useEffect(() => {
        if (!isStarted && currentWordIndex === 0 && currentCharIndex === 0) return;

        const completedWords = wordStatuses.filter((status, index) =>
            status === 'correct' && index < currentWordIndex
        ).length;

        const totalCompletedWords = wordStatuses.filter(status =>
            status === 'correct' || status === 'incorrect'
        ).length;

        const incorrectWords = wordStatuses.filter(status => status === 'incorrect').length;

        const newWpm = (() => {
            const elapsedTimeInMinutes = (timeLimit - timeLeft) / 60;
            if (elapsedTimeInMinutes > 0) {
                return Math.round(completedWords / elapsedTimeInMinutes);
            }
            return 0;
        })();

        const newAccuracy = totalCompletedWords > 0
            ? Math.round((completedWords / totalCompletedWords) * 100)
            : 100;

        setSyncedState(prev => ({
            ...prev,
            wordsTyped: completedWords,
            errors: incorrectWords,
            accuracy: newAccuracy,
            wpm: newWpm
        }));
    }, [currentWordIndex, wordStatuses, timeLeft, timeLimit, isStarted, setSyncedState]);

    //  backtrack logic
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

    useEffect(() => {
        // We only save if the game has started and isn't finished yet
        if (isStarted && !isFinished) {
            sessionStorage.setItem('typing_game_session', JSON.stringify(gameState));
        }
    }, [gameState, isStarted, isFinished]);

    // Keyboard handler with sync
    const handleKeyDown = (e) => {
        if (isFinished) return;

        const currentWord = targetWords[currentWordIndex];
        const userCurrentWord = userTypedWords[currentWordIndex];

        // Auto start game 
        if (!isStarted && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
            const wordData = generateText();
            setGameState({ 
                ...gameState,
                ...wordData,
                isStarted: true,
                isFinished: false,
                gameStartTime: gameStartTime || new Date().toISOString(),
                timeLeft: timeLeft // Preserve the remaining time from the session
            });
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            if (currentCharIndex === 0) return;

            if (currentCharIndex < currentWord.length && userCurrentWord === currentWord.slice(0, currentCharIndex)) {
                return;
            }

            const newWordStatuses = [...wordStatuses];
            if (userCurrentWord === currentWord) {
                newWordStatuses[currentWordIndex] = 'correct';
            } else {
                newWordStatuses[currentWordIndex] = 'incorrect';
            }

            if (currentWordIndex < targetWords.length - 1) {
                setSyncedState(prev => ({
                    ...prev,
                    wordStatuses: newWordStatuses,
                    currentWordIndex: prev.currentWordIndex + 1,
                    currentCharIndex: 0
                }));
            }
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            if (currentCharIndex > 0) {
                const newUserTypedWords = [...userTypedWords];
                newUserTypedWords[currentWordIndex] = userCurrentWord.slice(0, -1);
                setSyncedState(prev => ({
                    ...prev,
                    userTypedWords: newUserTypedWords,
                    currentCharIndex: prev.currentCharIndex - 1,
                    wordStatuses: [...prev.wordStatuses].map((s, i) =>
                        i === currentWordIndex ? 'pending' : s
                    )
                }));
            } else if (currentWordIndex > 0) {
                const targetWordIndex = currentWordIndex - 1;
                if (canBacktrackToPreviousWord(targetWordIndex)) {
                    setSyncedState(prev => ({
                        ...prev,
                        currentWordIndex: targetWordIndex,
                        currentCharIndex: userTypedWords[targetWordIndex].length,
                        wordStatuses: prev.wordStatuses.map((s, i) => {
                            if (i === currentWordIndex) return 'pending';
                            if (i === targetWordIndex) return 'pending';
                            return s;
                        })
                    }));
                }
            }
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            const newUserTypedWords = [...userTypedWords];
            newUserTypedWords[currentWordIndex] = userCurrentWord + e.key;
            setSyncedState(prev => {
                const newTypedWord = newUserTypedWords[currentWordIndex];
                const newWordStatuses = [...prev.wordStatuses];

                if (newTypedWord.length <= currentWord.length) {
                    if (newTypedWord === currentWord.slice(0, newTypedWord.length)) {
                        newWordStatuses[currentWordIndex] = newTypedWord.length === currentWord.length ? 'correct' : 'pending';
                    } else {
                        newWordStatuses[currentWordIndex] = 'incorrect';
                    }
                } else {
                    newWordStatuses[currentWordIndex] = 'incorrect';
                }

                return {
                    ...prev,
                    userTypedWords: newUserTypedWords,
                    currentCharIndex: prev.currentCharIndex + 1,
                    wordStatuses: newWordStatuses
                };
            });
        }
    };


    const renderWords = () => {
        return targetWords.map((word, wordIndex) => {
            const userWord = userTypedWords[wordIndex] || "";
            const status = wordStatuses[wordIndex];
            const isCurrentWord = wordIndex === currentWordIndex;

            let wordClassName = "inline-block whitespace-nowrap mr-2";

            if (status === 'correct') {
                wordClassName += " text-[#C9A227]";
            } else if (status === 'incorrect') {
                wordClassName += " text-[#FF6B6B]";
            } else if (isCurrentWord) {
                wordClassName += " text-[#D7CCC8]";
            } else {
                wordClassName += " text-[#D7CCC8]/70";
            }

            return (
                <span
                    key={wordIndex}
                    ref={(el) => (wordRefs.current[wordIndex] = el)}
                    className={wordClassName}
                >
                    {word.split('').map((char, charIndex) => {
                        let charClass = "";
                        const userChar = userWord[charIndex];

                        if (charIndex < userWord.length) {
                            if (userChar === char) {
                                if (status === 'correct') {
                                    charClass = "text-[#C9A227]";
                                } else if (status === 'incorrect') {
                                    charClass = "text-[#FF6B6B]";
                                } else {
                                    charClass = "text-[#C9A227]";
                                }
                            } else {
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

                    {userWord.length > word.length && isCurrentWord && (
                        <span className="text-[#FF6B6B]">
                            {userWord.slice(word.length)}
                        </span>
                    )}

                    {isCurrentWord && currentCharIndex >= word.length && (
                        <span className="animate-pulse text-[#C9A227] font-bold ml-0.5">|</span>
                    )}
                </span>
            );
        });
    };


    useEffect(() => {
        const refocusInput = () => {
            if (isStarted && !isFinished) {
                inputRef.current?.focus();
            }
        };
        window.addEventListener("click", refocusInput);
        return () => window.removeEventListener("click", refocusInput);
    }, [isStarted, isFinished]);


    useEffect(() => {
        const container = textDisplayRef.current;
        const currentWordEl = wordRefs.current[currentWordIndex];

        if (!container || !currentWordEl) return;

        const containerRect = container.getBoundingClientRect();
        const wordRect = currentWordEl.getBoundingClientRect();

        const padding = 40;
        if (wordRect.bottom > containerRect.bottom - padding) {
            container.scrollTop += wordRect.bottom - containerRect.bottom + padding;
        }
    }, [currentWordIndex]);

    const finishGame = async () => {
        if (gameAlreadyEnded) return;
        sessionStorage.removeItem('typing_game_session');
        saveResults({
            wpm: gameState.wpm,
            accuracy: gameState.accuracy,
            wordsTyped: gameState.wordsTyped,
            errors: gameState.errors,
            difficulty: gameState.difficulty
        });


        setSyncedState(prev => ({
            ...prev,
            gameAlreadyEnded: true,
            isFinished: true
        }));

        if (user && wordsTyped > 0) {
            await saveGameResults();
        }
    };


    //  saveGameResults 
    const saveGameResults = async () => {
        try {
            setSavingResults(true);
       // Calculate real time vs. game time
            const now = new Date();
            const start = new Date(gameStartTime);
            const actualElapsedSeconds = Math.floor((now - start) / 1000);
            const gameElapsedSeconds = timeLimit - timeLeft;

            // If the gap between real time and game time is too large (e.g., > 5s), 
            // it means they likely refreshed to pause the game.
            const isSuspicious = Math.abs(actualElapsedSeconds - gameElapsedSeconds) > 5;

            const gameData = {
                wpm: wpm,
                accuracy: accuracy,
                wordsTyped: wordsTyped,
                timeTaken: gameElapsedSeconds,
                errorsMade: errors,
                textDifficulty: difficulty.toLowerCase(),
                integrityCheck: !isSuspicious
            };

            await statsService.saveGameResult(gameData);
            setGameSaved(true);
        } catch (error) {
            setSaveError('Failed to save your results.');
        } finally {
            setSavingResults(false);
        }
    };

    // resetGame with sync and cleanup
    const resetGame = () => {
        clearResults();
        sessionStorage.removeItem('typing_game_session');

        //  Generate new words using the current difficulty
        const wordData = generateText(difficulty);

        //  Set the state with INITIAL_STATE + the new words
        setGameState({
            ...INITIAL_STATE,
            ...wordData,
            difficulty, // Preserve current difficulty setting
            timeLimit,   // Preserve current time setting
            timeLeft: timeLimit
        });

        setSavingResults(false);
        setSaveError(null);
        setGameSaved(false);

        // UI Cleanup
        setTimeout(() => inputRef.current?.focus(), 0);
        if (textDisplayRef.current) textDisplayRef.current.scrollTop = 0;
    };



    return (
        <div className="min-h-screen relative overflow-hidden font-body">

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


            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl">

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


                    <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 mb-8 shadow-xl shadow-[#4E342E]/50 relative">
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
                                    onChange={(e) => updateSettings(Number(e.target.value), difficulty)}
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
                                    onChange={(e) => updateSettings(timeLimit, e.target.value)}
                                    className="bg-[#4E342E]/80 border-2 border-[#6D4C41] rounded-lg px-3 py-2 text-[#C9A227] 
                                     focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                                     transition-all duration-300"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Text Display, Stats, Buttons */}
                    <div className="relative mb-8">
                        <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-1 shadow-2xl shadow-[#4E342E]/50 relative">
                            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

                            <div
                                ref={textDisplayRef}

                                className="text-2xl leading-relaxed tracking-wider bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-6 h-48 overflow-hidden relative select-none"
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
                                onChange={() => { }}
                                onKeyDown={handleKeyDown}
                                className="absolute -top-96 left-0 w-1 h-1 opacity-0 pointer-events-none"
                                autoFocus
                            />
                        </div>
                    </div>

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

                    {savingResults && (
                        <div className="text-center mb-4">
                            <p className="text-[#C9A227] animate-pulse font-medium">
                                Recording your advanced mastery in the guild archives...
                            </p>
                        </div>
                    )}

                    {saveError && (
                        <div className="text-center mb-4">
                            <p className="text-[#FF6B6B] font-medium">⚠️ {saveError}</p>
                        </div>
                    )}

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
                    {results && results.wpm > 0 && (
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
                                        <p className="text-3xl font-bold text-[#C9A227]">{results.wpm}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">WPM</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Precision</p>
                                        <p className="text-3xl font-bold text-[#C9A227]">{results.accuracy}%</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Accuracy</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Words</p>
                                        <p className="text-2xl font-bold text-[#C9A227]">{results.wordsTyped}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Mastered</p>
                                    </div>
                                    <div className="bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                                        <p className="text-[#D7CCC8] text-sm">Mistakes</p>
                                        <p className="text-2xl font-bold text-[#C9A227]">{results.errors}</p>
                                        <p className="text-xs text-[#D7CCC8]/70">Words</p>
                                    </div>
                                </div>

                                {user && savingResults && (
                                    <p className="text-[#C9A227] text-sm mb-4 animate-pulse">
                                        Recording in guild chronicles...
                                    </p>
                                )}

                                {user && !savingResults && !saveError && (
                                    <p className="text-[#C9A227] text-sm mb-4">
                                        Advanced achievement recorded in your guild profile!!
                                    </p>
                                )}

                                {saveError && (
                                    <p className="text-[#FF6B6B] text-sm mb-4">
                                        <AlertCircle /> {saveError}
                                    </p>
                                )}

                                {!user && (
                                    <p className="text-[#C9A227] text-sm mb-4">
                                        Join the guild to save your advanced achievements!
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

                    {/* Custom Animations */}
                    <style>{`
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

                        .scrollbar-track-[#4E342E]::-webkit-scrollbar-track {
                            background: #4E342E;
                            border-radius: 10px;
                        }

                        .scrollbar-thumb-[#C9A227]::-webkit-scrollbar-thumb {
                            background: #C9A227;
                            border-radius: 10px;
                        }

                        .scrollbar-thumb-[#C9A227]::-webkit-scrollbar-thumb:hover {
                            background: #B8941F;
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default Game;

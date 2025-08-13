import React, { useState, useEffect, useRef } from "react";

const Game = () => {
  const [timeLimit, setTimeLimit] = useState(60); // default 60s
  const [difficulty, setDifficulty] = useState("Easy");
  const [text, setText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [started, setStarted] = useState(false);

  const inputRef = useRef(null);

  const words = {
    Easy: ["cat", "dog", "sun", "tree", "book", "pen", "cup", "fish", "ball", "hat"],
    Medium: ["computer", "keyboard", "programming", "internet", "network", "monitor", "software", "database"],
    Hard: ["sophisticated", "extraordinary", "metamorphosis", "consequence", "phenomenon", "articulation"]
  };

  const generateText = () => {
    const target = Array.from(
      { length: difficulty === "Easy" ? 10 : difficulty === "Medium" ? 20 : 30 },
      () => {
        const wordArray = words[difficulty];
        return wordArray[Math.floor(Math.random() * wordArray.length)];
      }
    ).join(" ");
    setTargetText(target);
  };

  useEffect(() => {
    generateText();
    resetGame();
    // eslint-disable-next-line
  }, [difficulty, timeLimit]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  useEffect(() => {
    const typedWords = text.trim().split(" ").length;
    const elapsedTime = (timeLimit - timeLeft) / 60; // minutes
    setWpm(elapsedTime > 0 ? Math.round(typedWords / elapsedTime) : 0);

    let correct = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === targetText[i]) correct++;
    }
    setErrors(text.length - correct);
    setAccuracy(text.length > 0 ? Math.round((correct / text.length) * 100) : 100);
  }, [text, timeLeft, targetText, timeLimit]);

  const handleChange = (e) => {
    if (!started) setStarted(true);
    setText(e.target.value);
  };

  const resetGame = () => {
    setText("");
    setTimeLeft(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setStarted(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const renderTargetText = () => {
    return targetText.split("").map((char, idx) => {
      let color = "text-black";
      if (text[idx]) {
        color = text[idx] === char ? "text-green-500" : "text-red-500";
      }
      return <span key={idx} className={color}>{char}</span>;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center bg-gray-50 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Single Player Typing Game</h2>

      <div className="flex flex-col sm:flex-row justify-around items-center gap-4 mb-6">
        <div>
          <label className="mr-2 font-medium">Time Limit:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          >
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={120}>2min</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Difficulty:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          onClick={resetGame}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          {started ? "Restart" : "Start"}
        </button>
      </div>

      <div className="border border-gray-300 p-4 min-h-[80px] mb-4 text-lg rounded bg-white">
        {renderTargetText()}
      </div>

      <input
        type="text"
        ref={inputRef}
        value={text}
        onChange={handleChange}
        disabled={timeLeft <= 0}
        placeholder="Start typing..."
        className="w-full border border-gray-300 rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
      />

      <div className="flex justify-around text-gray-700 font-medium mb-4">
        <p>Time Left: <span className="font-bold">{timeLeft}s</span></p>
        <p>WPM: <span className="font-bold">{wpm}</span></p>
        <p>Accuracy: <span className="font-bold">{accuracy}%</span></p>
        <p>Errors: <span className="font-bold">{errors}</span></p>
      </div>

      {timeLeft === 0 && (
        <h3 className="text-xl font-semibold text-red-500">
          Time's up! Your final WPM: {wpm}, Accuracy: {accuracy}%, Errors: {errors}
        </h3>
      )}
    </div>
  );
};

export default Game;

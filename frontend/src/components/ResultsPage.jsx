import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This component displays the final results of a multiplayer game in a table.
 * It receives the game data via the route's state when navigated to.
 */
const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // The state contains the data passed from the MultiplayerGame component
  const { results, players } = location.state || { results: [], players: [] };

  // A function to find a player's username using their ID
  const getPlayerUsername = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player?.User?.username || 'Unknown Player';
  };

  // Handle the "Play Again" button click
  const handlePlayAgain = () => {
    // Navigate the user back to the multiplayer lobby to start a new game
    navigate('/multiplayer');
  };

  if (!results.length) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col items-center justify-center">
        <h1 className="text-2xl text-red-400">No results found.</h1>
        <button 
          onClick={handlePlayAgain} 
          className="mt-6 py-2 px-6 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-center text-cyan-300 mb-8">Race Over!</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-slate-600">
              <tr>
                <th className="p-3 text-lg">Rank</th>
                <th className="p-3 text-lg">Player</th>
                <th className="p-3 text-lg text-center">Speed (WPM)</th>
                <th className="p-3 text-lg text-center">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.id} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="p-4 text-xl font-bold">{index + 1}</td>
                  <td className="p-4 text-xl text-cyan-300">{getPlayerUsername(result.id)}</td>
                  <td className="p-4 text-xl text-center">{result.speed}</td>
                  <td className="p-4 text-xl text-center">{result.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={handlePlayAgain} 
            className="py-3 px-8 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
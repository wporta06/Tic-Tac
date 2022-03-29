import { FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import useStateRef from '../hooks/useStateRef';
import WINNING_CONDITIONS from '../constants/winningConditions';
import './Game.css';

function Game() {
  const [socket] = useSocket();
  const [hasWon, setHasWon] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [game, setGame, ref] = useStateRef(new Array(9).fill(''));
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on('activeUserCount', checkForAvailableUsers);
      socket.on('updateMoves', updateGameMoves);
      socket.on('restart', restartGame);
    }
    return () => socket?.off();
  }, [socket]);

  useEffect(() => {
    gameStatusChecker();
  }, [game]);

  const updateGameMoves = (move) => {
    const [currentIndex, currentSymbol] = move;
    const newGameState = [...ref.current];
    newGameState[currentIndex] = currentSymbol;
    setGame(newGameState);
    setCurrentPlayer(currentSymbol);
  };

  const gameStatusChecker = () => {
    const hasWinningCriteriaMet = WINNING_CONDITIONS.find((item) => {
      const [a, b, c] = item;
      if (!game[a] || !game[b] || !game[c]) {
        return false;
      }
      return game[a] === game[b] && game[b] === game[c];
    });
    if (hasWinningCriteriaMet) setHasWon(true);
  };

  const handleCellClick = (event) => {
    const currentIndex = event.target.getAttribute('data-cell-index');
    const currentSymbol = currentPlayer === 'X' ? 'O' : 'X';
    if (!game[currentIndex] && !hasWon && activeUsers >= 2) {
      socket.emit('currentMove', [currentIndex, currentSymbol || 'X']);
    }
  };

  const restartGame = () => {
    setHasWon(false);
    setCurrentPlayer('');
    setGame(new Array(9).fill(''));
  };

  const checkForAvailableUsers = (userCount) => {
    setActiveUsers(userCount);
  };

  return (
    <section>
      <h1 className="game--title">Tic Tac Toe</h1>
      {activeUsers > 2 && (
        <div className="game--activeusers">
          <p>{activeUsers - 2}</p>
          <FaEye />
        </div>
      )}
      <div className="game--container">
        {game.map((playerSymbol, index) => (
          <div
            role="button"
            tabIndex={0}
            className="cell"
            aria-label={index}
            data-cell-index={index}
            onClick={handleCellClick}
            onKeyDown={handleCellClick}
            // eslint-disable-next-line react/no-array-index-key
            key={`${playerSymbol}${index}`}
          >
            {playerSymbol}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="game--restart"
        onClick={() => socket.emit('restart')}
      >
        Restart Game
      </button>
      {hasWon && <p>{` Yayy player "${currentPlayer}" has won`}</p>}
    </section>
  );
}
export default Game;

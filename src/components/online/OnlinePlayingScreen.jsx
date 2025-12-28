import { useState, useEffect, useRef } from 'react';
import PhaseHeader from './playing/PhaseHeader';
import WordDisplay from './playing/WordDisplay';
import TurnNotification from './playing/TurnNotification';
import InPersonGameView from './playing/InPersonGameView';
import ChatGameView from './playing/ChatGameView';
import VotingView from './playing/VotingView';
import MonoGuessingView from './playing/MonoGuessingView';
import ResultsView from './playing/ResultsView';

const OnlinePlayingScreen = ({ roomData, playerId, submitHint, submitVote,
  leaveRoom, isHost, resetGame, submitMonoGuess }) => {
  const [hint, setHint] = useState('');
  const [selectedVotes, setSelectedVotes] = useState([]);
  const [monoGuess, setMonoGuess] = useState('');
  const [hasLocallySubmitted, setHasLocallySubmitted] = useState(false);
  const scrollRef = useRef(null);

  // ID-based logic (Requires server refactor to monoIds/playerOrderIds)
  // Fallback support if server sends indices (transitional, though we plan to update server next)
  // We assume server sends gameData with 'monoIds' and 'playerOrderIds'.

  const myPlayer = roomData.players.find(p => p.playerId === playerId) || {};
  const myId = myPlayer.playerId || playerId; // Use session ID

  const gameData = roomData.gameData || {};
  const amIMono = gameData.monoIds ? gameData.monoIds.includes(myId) : (gameData.monoIndices?.includes(roomData.players.findIndex(p => p.playerId === myId)));

  const currentTurnPlayerId = gameData.playerOrderIds ? gameData.playerOrderIds[gameData.currentTurnIndex || 0] : null;
  const isMyTurn = currentTurnPlayerId === myId;

  const gamePhase = gameData.state || 'playing';
  const gameType = roomData.settings.type;

  // My Votes from server
  const myServerVotes = gameData.votes?.[myId]; // Array of target IDs
  const hasVoted = !!myServerVotes || hasLocallySubmitted;

  // Auto-scroll hints
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameData.hints]);

  const handleSubmitHint = () => {
    if (hint.trim()) {
      submitHint(hint.trim());
      setHint('');
    }
  };

  const toggleVote = (targetPlayerId) => {
    if (targetPlayerId === myId) return;

    const maxVotes = roomData.settings.numMonos || 1;

    // Check if ID is in selectedVotes
    if (selectedVotes.includes(targetPlayerId)) {
      setSelectedVotes(selectedVotes.filter(id => id !== targetPlayerId));
    } else {
      if (selectedVotes.length < maxVotes) {
        setSelectedVotes([...selectedVotes, targetPlayerId]);
      } else {
        // Auto-replace: Remove first (oldest), add new
        const newVotes = [...selectedVotes.slice(1), targetPlayerId];
        setSelectedVotes(newVotes);
      }
    }
  };

  const handleSubmitVotes = () => {
    if (selectedVotes.length > 0) {
      submitVote(selectedVotes); // Sends IDs now
      setHasLocallySubmitted(true);
    }
  };

  const handleSubmitMonoGuess = () => {
    if (monoGuess.trim()) {
      submitMonoGuess(monoGuess.trim());
    }
  };

  const getPlayerHint = (targetId) => {
    if (gameType !== 'chat') return null;
    const playerHintObj = gameData.hints?.find(h => h.playerId === targetId);
    return playerHintObj ? playerHintObj.text : null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (gamePhase === 'playing' && gameType === 'in_person' && isHost) {
          resetGame();
        }
        else if (gamePhase === 'voting') {
          if (!hasVoted && selectedVotes.length > 0) {
            handleSubmitVotes();
          }
        }
        else if (gamePhase === 'results' && isHost) {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, gameType, isHost, hasVoted, selectedVotes, resetGame, handleSubmitVotes]);

  // Determine current turn player name safely
  const currentTurnPlayer = roomData.players.find(p => p.playerId === currentTurnPlayerId);

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <PhaseHeader gamePhase={gamePhase} onLeave={leaveRoom} />

      <WordDisplay
        amIMono={amIMono}
        word={gameData.word}
        gamePhase={gamePhase}
      />

      <TurnNotification
        isMyTurn={isMyTurn}
        gamePhase={gamePhase}
        gameType={gameType}
      />

      {/* Playing Phase: In Person */}
      {gamePhase === 'playing' && gameType === 'in_person' && (
        <InPersonGameView
          gameData={gameData}
          roomData={roomData}
          isHost={isHost}
          onReset={resetGame}
        />
      )}

      {/* Playing Phase: Chat */}
      {gamePhase === 'playing' && gameType === 'chat' && (
        <ChatGameView
          gameData={gameData}
          roomData={roomData}
          isMyTurn={isMyTurn}
          currentTurnPlayer={currentTurnPlayer}
          hint={hint}
          setHint={setHint}
          onSubmitHint={handleSubmitHint}
        />
      )}

      {/* Voting Phase */}
      {gamePhase === 'voting' && (
        <VotingView
          roomData={roomData}
          gameType={gameType}
          myId={myId}
          selectedVotes={selectedVotes}
          hasVoted={hasVoted}
          myServerVotes={myServerVotes}
          onToggleVote={toggleVote}
          onSubmitVotes={handleSubmitVotes}
          getPlayerHint={getPlayerHint}
        />
      )}

      {gamePhase === 'mono_guessing' && (
        <MonoGuessingView
          amIMono={amIMono}
          gameData={gameData}
          roomData={roomData}
          currentTurnPlayerId={currentTurnPlayerId}
          monoGuess={monoGuess}
          setMonoGuess={setMonoGuess}
          onSubmitMonoGuess={handleSubmitMonoGuess}
        />
      )}

      {/* Results Phase */}
      {gamePhase === 'results' && (
        <ResultsView
          gameData={gameData}
          roomData={roomData}
          isHost={isHost}
          onReset={resetGame}
        />
      )}
    </div>
  );
};

export default OnlinePlayingScreen;

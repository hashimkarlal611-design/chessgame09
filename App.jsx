import { useState } from 'react'
import { useChessGame } from './hooks/useChessGame'
import Board from './components/Board'
import EvaluationBar from './components/EvaluationBar'
import PlayerCard from './components/PlayerCard'
import CoachPanel from './components/CoachPanel'
import MoveHistory from './components/MoveHistory'
import NewGameModal from './components/NewGameModal'
import GameOverModal from './components/GameOverModal'
import { computeCaptured } from './utils/material'
import { getDifficulty } from './chess/difficulty'

export default function App() {
  const g = useChessGame()

  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false)
  const [boardOrientation, setBoardOrientation] = useState(g.playerColor)
  const [toastMsg, setToastMsg] = useState(null)

  // Keep board orientation synchronized with player color on new games unless user flipped
  const [userFlipped, setUserFlipped] = useState(false)
  const activeOrientation = userFlipped ? boardOrientation : g.playerColor

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const handleFlipBoard = () => {
    setUserFlipped(true)
    setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'))
  }

  const handleStartNewGame = (config) => {
    setUserFlipped(false)
    setBoardOrientation(config.playerColor)
    g.newGame(config)
    showToast(`Started new game vs ${config.elo} Elo!`)
  }

  const handleOfferDraw = () => {
    const result = g.offerDraw()
    showToast(result.message)
  }

  const handleResign = () => {
    if (confirm('Are you sure you want to resign this game?')) {
      g.resign()
    }
  }

  const eloInfo = getDifficulty(g.difficulty)
  const lastMove = g.viewIndex > 0 ? g.moves[g.viewIndex - 1] : null
  const currentFen = g.viewFen

  // Material & captured pieces calculations
  const { whiteCaptured, blackCaptured, whiteAdvantage } = computeCaptured(currentFen)

  // Determine top & bottom player representations based on board orientation
  const isWhiteAtBottom = activeOrientation === 'w'

  const topPlayer = isWhiteAtBottom
    ? {
        name: g.gameMode === 'vs-ai' ? eloInfo.name : 'Black',
        rating: g.gameMode === 'vs-ai' ? `${eloInfo.elo}` : null,
        avatar: g.gameMode === 'vs-ai' ? eloInfo.avatar : '👤',
        isAI: g.gameMode === 'vs-ai',
        isTurn: currentFen.split(' ')[1] === 'b',
        isThinking: g.isAIThinking && g.playerColor === 'w',
        capturedPieces: blackCaptured, // pieces black has captured
        capturedPieceColor: 'w',
        materialAdvantage: -whiteAdvantage > 0 ? -whiteAdvantage : 0,
        time: g.blackTime,
      }
    : {
        name: g.gameMode === 'vs-ai' ? 'You' : 'White',
        rating: null,
        avatar: '👤',
        isAI: false,
        isTurn: currentFen.split(' ')[1] === 'w',
        isThinking: false,
        capturedPieces: whiteCaptured,
        capturedPieceColor: 'b',
        materialAdvantage: whiteAdvantage > 0 ? whiteAdvantage : 0,
        time: g.whiteTime,
      }

  const bottomPlayer = isWhiteAtBottom
    ? {
        name: g.gameMode === 'vs-ai' ? 'You' : 'White',
        rating: null,
        avatar: '👤',
        isAI: false,
        isTurn: currentFen.split(' ')[1] === 'w',
        isThinking: false,
        capturedPieces: whiteCaptured,
        capturedPieceColor: 'b',
        materialAdvantage: whiteAdvantage > 0 ? whiteAdvantage : 0,
        time: g.whiteTime,
      }
    : {
        name: g.gameMode === 'vs-ai' ? eloInfo.name : 'Black',
        rating: g.gameMode === 'vs-ai' ? `${eloInfo.elo}` : null,
        avatar: g.gameMode === 'vs-ai' ? eloInfo.avatar : '👤',
        isAI: g.gameMode === 'vs-ai',
        isTurn: currentFen.split(' ')[1] === 'b',
        isThinking: g.isAIThinking && g.playerColor === 'b',
        capturedPieces: blackCaptured,
        capturedPieceColor: 'w',
        materialAdvantage: -whiteAdvantage > 0 ? -whiteAdvantage : 0,
        time: g.blackTime,
      }

  return (
    <div className="chess-app-layout">
      {/* Top Navigation Bar */}
      <header className="app-nav-bar">
        <div className="nav-brand">
          <span className="brand-logo">♞</span>
          <div className="brand-text">
            <h1>AI Chess Coach</h1>
            <span className="brand-badge">Stockfish 19 UCI Elo</span>
          </div>
        </div>

        <div className="nav-center-info">
          <div className="game-status-pill">
            <span className={`status-indicator ${g.isGameOver ? 'game-over' : 'live'}`} />
            <span className="status-text">
              {g.isLive ? g.status : `Viewing move ${g.viewIndex} of ${g.moves.length}`}
            </span>
          </div>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={g.toggleSound}
            title={g.soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {g.soundMuted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleFlipBoard}
            title="Flip Board Orientation"
          >
            🔄
          </button>
          {!g.isStarted && (
            <button
              type="button"
              className="btn-start-game pulse-glow"
              onClick={g.startGame}
              title="Start Game & Clock"
            >
              ▶ Start Play
            </button>
          )}
          <button
            type="button"
            className="btn-new-game-top"
            onClick={() => setIsNewGameModalOpen(true)}
          >
            ⚙️ Game Settings
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content-grid">
        {/* Left Column: Board & Players */}
        <section className="board-column">
          {/* Opponent Player Card (Top) */}
          <PlayerCard
            name={topPlayer.name}
            rating={topPlayer.rating}
            avatar={topPlayer.avatar}
            isAI={topPlayer.isAI}
            isTurn={topPlayer.isTurn}
            isThinking={topPlayer.isThinking}
            capturedPieces={topPlayer.capturedPieces}
            capturedPieceColor={topPlayer.capturedPieceColor}
            materialAdvantage={topPlayer.materialAdvantage}
            time={topPlayer.time}
            increment={g.timeControl.increment}
            isGameOver={g.isGameOver}
          />

          {/* Board Center Area with Evaluation Bar */}
          <div className="board-center-row">
            <EvaluationBar score={g.evaluation} orientation={activeOrientation} />

            <div className="board-stage">
              {!g.isStarted && g.moves.length === 0 && (
                <div className="board-start-floating-banner">
                  <div className="start-banner-content">
                    <span className="start-banner-title">
                      {topPlayer.avatar} Match vs {topPlayer.name} ({eloInfo.elo} Elo)
                    </span>
                    <span className="start-banner-desc">
                      Time Control: {g.timeControl.label} • Play as {g.playerColor === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-banner-start"
                    onClick={g.startGame}
                  >
                    ▶ Start Game
                  </button>
                </div>
              )}
              <Board
                fen={g.viewFen}
                orientation={activeOrientation}
                canMove={g.canMove}
                onMove={g.tryMove}
                lastMove={lastMove}
                hintMove={g.hint?.bestMove}
              />
            </div>
          </div>

          {/* Bottom Player Card (You) */}
          <PlayerCard
            name={bottomPlayer.name}
            rating={bottomPlayer.rating}
            avatar={bottomPlayer.avatar}
            isAI={bottomPlayer.isAI}
            isTurn={bottomPlayer.isTurn}
            isThinking={bottomPlayer.isThinking}
            capturedPieces={bottomPlayer.capturedPieces}
            capturedPieceColor={bottomPlayer.capturedPieceColor}
            materialAdvantage={bottomPlayer.materialAdvantage}
            time={bottomPlayer.time}
            increment={g.timeControl.increment}
            isGameOver={g.isGameOver}
          />

          {/* Game Action Controls Toolbar */}
          <div className="game-action-toolbar">
            {!g.isStarted ? (
              <button
                type="button"
                className="action-btn btn-start-primary pulse-glow"
                onClick={g.startGame}
                title="Start Game and timer"
              >
                ▶ Start Play
              </button>
            ) : null}
            <button
              type="button"
              className="action-btn"
              onClick={g.askCoachHint}
              disabled={!g.isLive || g.isGameOver || g.isLoadingHint}
              title="Get best move recommendation"
            >
              💡 Hint
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={g.undoMove}
              disabled={g.moves.length === 0 || g.isAIThinking}
              title="Undo last move (Takeback)"
            >
              ↩️ Takeback
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={handleOfferDraw}
              disabled={g.isGameOver}
              title="Offer a draw to opponent"
            >
              🤝 Draw
            </button>
            <button
              type="button"
              className="action-btn btn-danger-action"
              onClick={handleResign}
              disabled={g.isGameOver}
              title="Resign the current game"
            >
              🏳️ Resign
            </button>
            <button
              type="button"
              className="action-btn btn-highlight"
              onClick={() => setIsNewGameModalOpen(true)}
              title="Start a new game"
            >
              ✨ New Game
            </button>
          </div>
        </section>

        {/* Right Column: AI Coach & Move History */}
        <aside className="sidebar-column">
          {/* AI Coach Panel */}
          <CoachPanel
            score={g.evaluation}
            playerColor={g.playerColor}
            onAskHint={g.askCoachHint}
            hint={g.hint}
            isLoadingHint={g.isLoadingHint}
            latestMoveQuality={g.latestMoveQuality}
            eloInfo={g.gameMode === 'vs-ai' ? eloInfo : null}
            onClearHint={g.clearHint}
          />

          {/* Move History & PGN Tools */}
          <MoveHistory
            moves={g.moves}
            viewIndex={g.viewIndex}
            onSelect={g.setViewIndex}
            fen={g.viewFen}
            onCopyFen={g.copyFen}
            onCopyPgn={g.copyPgn}
            onDownloadPgn={g.downloadPgn}
          />
        </aside>
      </main>

      {/* New Game Setup Modal */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartGame={handleStartNewGame}
        currentElo={g.difficulty}
        currentTime={g.timeControlId}
        currentColor={g.playerColor}
        currentGameMode={g.gameMode}
      />

      {/* Game Over Celebration / Rematch Modal */}
      <GameOverModal
        isOpen={g.isGameOver}
        status={g.status}
        winner={g.winner}
        playerColor={g.playerColor}
        moveCount={Math.ceil(g.moves.length / 2)}
        onRematch={() =>
          g.newGame({
            elo: g.difficulty,
            timeControl: g.timeControlId,
            playerColor: g.playerColor,
            gameMode: g.gameMode,
          })
        }
        onNewGame={() => setIsNewGameModalOpen(true)}
        onReview={() => {
          // Keep game over state but close dialog for review
          const el = document.querySelector('.game-over-modal')
          if (el) el.closest('.modal-backdrop')?.remove()
        }}
      />

      {/* Toast Notification */}
      {toastMsg && <div className="app-toast">{toastMsg}</div>}
    </div>
  )
}

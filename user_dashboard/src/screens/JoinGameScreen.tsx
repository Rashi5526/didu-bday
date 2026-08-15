import { useState } from 'react'
import type { Player } from '../types'
import {
  loadSession,
  generatePlayerId,
  addPlayerToSession,
  saveMyIdentity,
} from '../lib/storage'

const PLAYER_COLORS = ['#C4897A', '#8B7355', '#5C7A6B', '#7A6B8B', '#8B5C5C']

interface JoinGameScreenProps {
  onJoined: (roomCode: string) => void
  onBack: () => void
  prefillCode?: string
}

export default function JoinGameScreen({ onJoined, onBack, prefillCode = '' }: JoinGameScreenProps) {
  const [roomCode, setRoomCode] = useState(prefillCode)
  const [playerName, setPlayerName] = useState('')
  const [isBirthdayGirl, setIsBirthdayGirl] = useState(false)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase()
    const name = playerName.trim()
    if (!code) { setError('Enter a room code'); return }
    if (!name)  { setError('Enter your name'); return }

    setJoining(true)
    const session = await loadSession(code)
    if (!session) { setError("Room not found. Check the code and try again."); setJoining(false); return }
    if (session.phase !== 'waiting' && session.phase !== 'playing') {
      setError("This game has already ended."); setJoining(false); return
    }
    if (session.players.length >= 5) { setError("This room is full (5 players max)"); setJoining(false); return }

    const playerId = generatePlayerId()
    const colorIndex = session.players.length % PLAYER_COLORS.length

    const player: Player = {
      id: playerId,
      name,
      isHost: false,
      isBirthdayGirl,
      score: 0,
      color: PLAYER_COLORS[colorIndex],
      joinedAt: Date.now(),
    }

    await addPlayerToSession(code, player)
    saveMyIdentity(playerId, code)
    setJoining(false)
    onJoined(code)
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F0E6D3 100%)' }}>

      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onBack} className="text-espresso/50 text-sm font-sans-ui p-2 -ml-2">
          ← Back
        </button>
        <span className="font-sans-ui text-xs tracking-[0.2em] text-espresso/40 uppercase">
          Join Game
        </span>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <div className="max-w-sm mx-auto">

          <div className="mb-8 mt-2">
            <h2 className="font-display text-4xl font-light italic text-espresso leading-tight">
              Join the<br />birthday crew.
            </h2>
            <p className="font-sans-ui text-sm text-espresso/50 mt-2 leading-relaxed">
              Enter the room code and your name. The host will start the game when everyone's in.
            </p>
          </div>

          <div className="divider-gold mb-8" />

          <div className="flex flex-col gap-5">

            <div>
              <label className="font-sans-ui text-xs font-medium tracking-[0.18em] text-espresso/50 uppercase block mb-2">
                Room Code
              </label>
              <input
                className="input-premium font-display text-2xl tracking-[0.2em] font-bold text-espresso"
                placeholder="BDAY27"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </div>

            <div>
              <label className="font-sans-ui text-xs font-medium tracking-[0.18em] text-espresso/50 uppercase block mb-2">
                Your Name
              </label>
              <input
                className="input-premium"
                placeholder="What they call you..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={25}
              />
            </div>

            {/* Birthday girl toggle */}
            <button
              className="flex items-center gap-3 p-4 rounded-2xl transition-all"
              style={{
                background: isBirthdayGirl ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.5)',
                border: `1.5px solid ${isBirthdayGirl ? '#C9A96E' : '#E2D5C3'}`,
              }}
              onClick={() => setIsBirthdayGirl(!isBirthdayGirl)}
            >
              <span className="text-2xl">🎂</span>
              <div className="text-left">
                <div className="font-sans-ui text-sm font-medium text-espresso">
                  I'm the birthday girl
                </div>
                <div className="font-sans-ui text-xs text-espresso/50 mt-0.5">
                  Tonight is your night
                </div>
              </div>
              <div className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: isBirthdayGirl ? '#C9A96E' : '#DDD0C0' }}>
                {isBirthdayGirl && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
              </div>
            </button>

          </div>

          {error && (
            <p className="mt-4 text-sm font-sans-ui text-rose animate-fade-in">{error}</p>
          )}

          <button
            className="btn-primary w-full mt-6 text-base py-4"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? 'Joining...' : 'Join the Birthday →'}
          </button>

        </div>
      </div>
    </div>
  )
}

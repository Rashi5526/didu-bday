import { useState } from 'react'
import type { GameSession, Player } from '../types'
import { buildDefaultRounds } from '../lib/seedData'
import {
  generateRoomCode,
  generatePlayerId,
  saveSession,
  saveMyIdentity,
} from '../lib/storage'

const PLAYER_COLORS = ['#C4897A', '#8B7355', '#5C7A6B', '#7A6B8B', '#8B5C5C']

interface CreateGameScreenProps {
  onGameCreated: (roomCode: string) => void
  onBack: () => void
}

export default function CreateGameScreen({ onGameCreated, onBack }: CreateGameScreenProps) {
  const [birthdayName, setBirthdayName] = useState('')
  const [hostName, setHostName] = useState('')
  const [birthdayMessage, setBirthdayMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!birthdayName.trim()) { setError('Enter the birthday girl\'s name'); return }
    if (!hostName.trim()) { setError('Enter your name'); return }
    setCreating(true)

    const roomCode = generateRoomCode()
    const hostId = generatePlayerId()

    const hostPlayer: Player = {
      id: hostId,
      name: hostName.trim(),
      isHost: true,
      isBirthdayGirl: false,
      score: 0,
      color: PLAYER_COLORS[0],
      joinedAt: Date.now(),
    }

    const session: GameSession = {
      id: `sess_${Date.now()}`,
      roomCode,
      birthdayGirlName: birthdayName.trim(),
      hostId,
      hostName: hostName.trim(),
      birthdayMessage: birthdayMessage.trim(),
      phase: 'waiting',
      currentRoundIndex: 0,
      players: [hostPlayer],
      rounds: buildDefaultRounds(),
      answers: [],
      revealedQuestionIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await saveSession(session)
    saveMyIdentity(hostId, roomCode)
    setCreating(false)
    onGameCreated(roomCode)
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F0E6D3 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onBack} className="text-espresso/50 text-sm font-sans-ui p-2 -ml-2">
          ← Back
        </button>
        <span className="font-sans-ui text-xs tracking-[0.2em] text-espresso/40 uppercase">
          Create Room
        </span>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <div className="max-w-sm mx-auto">

          {/* Title */}
          <div className="mb-8 mt-2">
            <h2 className="font-display text-4xl font-light italic text-espresso leading-tight">
              Set the stage.
            </h2>
            <p className="font-sans-ui text-sm text-espresso/50 mt-2 leading-relaxed">
              You're creating tonight's experience. Fill this in and share the room code with your crew.
            </p>
          </div>

          <div className="divider-gold mb-8" />

          {/* Form */}
          <div className="flex flex-col gap-5">

            <div>
              <label className="font-sans-ui text-xs font-medium tracking-[0.18em] text-espresso/50 uppercase block mb-2">
                Birthday Girl's Name
              </label>
              <input
                className="input-premium"
                placeholder="Her name..."
                value={birthdayName}
                onChange={e => setBirthdayName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div>
              <label className="font-sans-ui text-xs font-medium tracking-[0.18em] text-espresso/50 uppercase block mb-2">
                Your Name (Host)
              </label>
              <input
                className="input-premium"
                placeholder="Your name..."
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div>
              <label className="font-sans-ui text-xs font-medium tracking-[0.18em] text-espresso/50 uppercase block mb-2">
                Birthday Message <span className="text-espresso/30 normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                className="input-premium resize-none"
                placeholder="A few words for her from you..."
                value={birthdayMessage}
                onChange={e => setBirthdayMessage(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>

          </div>

          {error && (
            <p className="mt-4 text-sm font-sans-ui text-rose animate-fade-in">{error}</p>
          )}

          {/* Info card */}
          <div className="card-champagne p-4 mt-6">
            <p className="font-sans-ui text-xs text-espresso/60 leading-relaxed">
              <span className="font-medium text-espresso/80">How it works:</span> After creating, you'll get a room code to share with 4 other players. They join from their own phones, and you control the game.
            </p>
          </div>

          <button
            className="btn-primary w-full mt-6 text-base py-4"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Room →'}
          </button>

        </div>
      </div>
    </div>
  )
}

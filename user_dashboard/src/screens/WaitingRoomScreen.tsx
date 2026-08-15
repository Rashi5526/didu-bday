import { useEffect, useRef } from 'react'
import type { GameSession, Player } from '../types'
import { useSessionSync, patchSession, saveSession } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'
import FloatingParticles from '../components/FloatingParticles'

const MAX_PLAYERS = 5

interface WaitingRoomScreenProps {
  roomCode: string
  myPlayerId: string
  onGameStart: () => void
}

export default function WaitingRoomScreen({ roomCode, myPlayerId, onGameStart }: WaitingRoomScreenProps) {
  const { session, setSession } = useSessionSync(roomCode)
  const prevCountRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!session) return
    if (session.phase === 'playing' && !startedRef.current) {
      startedRef.current = true
      onGameStart()
    }
    prevCountRef.current = session.players.length
  }, [session, onGameStart])

  const myPlayer = session?.players.find(p => p.id === myPlayerId)
  const isHost = myPlayer?.isHost ?? false
  const allJoined = (session?.players.length ?? 0) >= MAX_PLAYERS

  const handleStart = () => {
    if (!session) return
    const updated = { ...session, phase: 'playing' as const, updatedAt: Date.now() }
    setSession(updated)
    onGameStart()
  }

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  const handleCopyCode = () => {
    try {
      navigator.clipboard?.writeText(roomCode).catch(() => fallbackCopy(roomCode))
    } catch {
      fallbackCopy(roomCode)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?join=${roomCode}`
    if (navigator.share) {
      navigator.share({ title: 'Join the Birthday Game!', text: `Use code ${roomCode} to join the game!`, url })
    } else {
      try {
        navigator.clipboard?.writeText(url).catch(() => fallbackCopy(url))
      } catch {
        fallbackCopy(url)
      }
    }
  }

  const emptySlots = MAX_PLAYERS - (session?.players.length ?? 0)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #EDD8CB 100%)' }}>

      <FloatingParticles count={12} />

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6 px-5 text-center">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase block mb-4">
          The Birthday Crew
        </span>
        <h2 className="font-display text-3xl font-light italic text-espresso">
          {session?.birthdayGirlName
            ? `${session.birthdayGirlName}'s Night`
            : 'Waiting for the crew...'}
        </h2>
      </div>

      {/* Room Code Card */}
      <div className="relative z-10 mx-5 mb-6">
        <div className="card-ivory p-5">
          <div className="text-center">
            <span className="font-sans-ui text-xs tracking-[0.2em] text-espresso/40 uppercase">
              Room Code
            </span>
            <div className="font-display text-5xl font-bold tracking-[0.18em] text-espresso mt-2 mb-4">
              {roomCode}
            </div>
            <div className="flex gap-2 justify-center">
              <button className="btn-ghost text-xs py-2.5 px-4" onClick={handleCopyCode}>
                Copy Code
              </button>
              <button className="btn-gold text-xs py-2.5 px-4" onClick={handleShare}>
                Share Invite →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="relative z-10 mx-5 flex-1">
        <div className="flex flex-col gap-3">

          {session?.players.map((player: Player, i: number) => (
            <div key={player.id} className="player-slot filled">
              <PlayerAvatar name={player.name} color={player.color} size="md" isBirthdayGirl={player.isBirthdayGirl} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans-ui font-medium text-espresso text-sm">{player.name}</span>
                  {player.isBirthdayGirl && (
                    <span className="font-sans-ui text-xs text-gold font-medium">Birthday Girl</span>
                  )}
                  {player.isHost && (
                    <span className="font-sans-ui text-xs text-espresso/40">Host</span>
                  )}
                  {player.id === myPlayerId && (
                    <span className="font-sans-ui text-xs text-espresso/30">(you)</span>
                  )}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          ))}

          {Array.from({ length: emptySlots }, (_, i) => (
            <div key={`empty-${i}`} className="player-slot empty">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-cream-border flex items-center justify-center">
                <span className="text-espresso/20 text-lg">+</span>
              </div>
              <span className="font-sans-ui text-sm text-espresso/30">
                Waiting for player {(session?.players.length ?? 0) + i + 1}…
              </span>
            </div>
          ))}

        </div>

        {/* Status message */}
        <div className="text-center mt-6 mb-6">
          {allJoined ? (
            <p className="font-display italic text-espresso/70 text-lg animate-fade-in">
              Everyone's here 👀
            </p>
          ) : (
            <p className="font-sans-ui text-sm text-espresso/40">
              {session?.players.length ?? 0} / {MAX_PLAYERS} players joined
            </p>
          )}
        </div>

        {/* Host start button */}
        {isHost && (
          <div className="pb-8">
            <button
              className={`btn-primary w-full text-base py-4 ${!allJoined ? 'opacity-50' : ''}`}
              onClick={handleStart}
              disabled={!allJoined}
            >
              Let the chaos begin →
            </button>
            {!allJoined && (
              <p className="text-center font-sans-ui text-xs text-espresso/40 mt-3">
                Waiting for all 5 players before starting
              </p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="pb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 border border-cream-border">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-sans-ui text-xs text-espresso/60">Waiting for host to start…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

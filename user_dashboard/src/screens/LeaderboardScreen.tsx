import { useEffect, useState } from 'react'
import type { GameSession, Player } from '../types'
import { patchSession } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'
import FloatingParticles from '../components/FloatingParticles'

const TITLES = [
  { rank: 1, medal: '🥇', label: 'THE PSYCHIC SIBLING', color: '#C9A96E' },
  { rank: 2, medal: '🥈', label: 'FAMILY DATABASE', color: '#A8A8A8' },
  { rank: 3, medal: '🥉', label: 'I THOUGHT I KNEW HER', color: '#C4897A' },
  { rank: 4, medal: '4', label: 'JUST HERE FOR FOOD', color: '#8A7060' },
  { rank: 5, medal: '5', label: 'ABSOLUTELY CLUELESS', color: '#8A7060' },
]

const AWARDS = [
  'Suspiciously Accurate',
  'Knows Her Too Well',
  'Absolutely Clueless',
  'Just Here For Food',
  'Heart in the Right Place',
]

interface LeaderboardScreenProps {
  session: GameSession
  myPlayerId: string
  isHost: boolean
  roomCode: string
  setSession: (s: GameSession) => void
  onFinale: () => void
}

export default function LeaderboardScreen({
  session, myPlayerId, isHost, roomCode, setSession, onFinale,
}: LeaderboardScreenProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const sorted = [...session.players].sort((a, b) => b.score - a.score)

  const handleFinale = () => {
    const updated = { ...session, phase: 'finale' as const, updatedAt: Date.now() }
    setSession(updated)
    onFinale()
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1C1410 0%, #2D1810 60%, #1C1410 100%)' }}>

      <FloatingParticles count={18} dark gold />

      <div className="relative z-10 pt-12 pb-6 px-5 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold/30" />
          <span className="font-sans-ui text-xs tracking-[0.25em] text-gold/60 uppercase">
            The Birthday Girl Game Night
          </span>
          <div className="h-px w-8 bg-gold/30" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ivory">
          Final Scores
        </h1>
        <p className="font-display italic text-lg text-ivory/40 mt-2">
          The results are in.
        </p>
      </div>

      <div className="relative z-10 px-5 flex-1 flex flex-col gap-3 pb-6">

        {sorted.map((player, i) => {
          const titleInfo = TITLES[i] ?? TITLES[TITLES.length - 1]
          const isMe = player.id === myPlayerId
          const delay = i * 120

          return (
            <div
              key={player.id}
              className="glass-dark rounded-2xl p-4 transition-all"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
                border: i === 0 ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(201,169,110,0.1)',
              }}
            >
              <div className="flex items-center gap-4">

                {/* Rank */}
                <div className="w-10 flex-shrink-0 text-center">
                  {i < 3 ? (
                    <span className="text-2xl">{titleInfo.medal}</span>
                  ) : (
                    <span className="font-display text-xl font-bold text-ivory/30">{i + 1}</span>
                  )}
                </div>

                <PlayerAvatar name={player.name} color={player.color} size="md" isBirthdayGirl={player.isBirthdayGirl} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans-ui font-semibold text-ivory text-sm truncate">
                      {player.name}
                    </span>
                    {isMe && <span className="font-sans-ui text-xs text-ivory/30">(you)</span>}
                  </div>
                  <span className="font-sans-ui text-xs" style={{ color: titleInfo.color }}>
                    {titleInfo.label}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-display text-3xl font-bold text-ivory animate-count-up">
                    {player.score}
                  </span>
                  <p className="font-sans-ui text-xs text-ivory/30">pts</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* The real winner callout */}
        <div className="glass-dark rounded-2xl p-5 text-center mt-2 animate-scale-in"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 700ms',
            border: '1px solid rgba(201,169,110,0.25)',
          }}>
          <p className="font-display italic text-xl text-ivory/60 mb-1">But the real winner?</p>
          <p className="font-display text-3xl font-bold text-gold-shimmer">
            {session.birthdayGirlName} 🎂
          </p>
        </div>

        {isHost && (
          <div className="pt-4">
            <button className="btn-gold w-full py-4 text-base" onClick={handleFinale}>
              The Final Moment →
            </button>
          </div>
        )}

        {!isHost && (
          <div className="pt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-sans-ui text-xs text-gold/60">Waiting for the finale…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

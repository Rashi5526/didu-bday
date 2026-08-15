import { useEffect, useState } from 'react'
import type { GameSession } from '../types'
import { deleteSession, clearMyIdentity } from '../lib/storage'
import FloatingParticles from '../components/FloatingParticles'

const LINES = [
  { text: 'Tonight wasn\'t really about winning.', delay: 800, size: 'large' },
  { text: 'It was about remembering.', delay: 2400, size: 'medium' },
  { text: 'The little things.', delay: 4000, size: 'small' },
  { text: 'The embarrassing things.', delay: 5200, size: 'small' },
  { text: 'The stories.', delay: 6400, size: 'small' },
  { text: 'And all the reasons we love you.', delay: 7800, size: 'medium' },
]

interface FinaleScreenProps {
  session: GameSession
  isHost: boolean
  roomCode: string
  onRestart: () => void
}

export default function FinaleScreen({ session, isHost, roomCode, onRestart }: FinaleScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [showName, setShowName] = useState(false)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, line.delay))
    })

    timers.push(setTimeout(() => setShowName(true), 9800))
    timers.push(setTimeout(() => setShowActions(true), 11500))

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleDelete = async () => {
    await deleteSession(roomCode)
    clearMyIdentity()
    onRestart()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 py-16"
      style={{ background: 'linear-gradient(160deg, #100C08 0%, #1A1008 50%, #0C0906 100%)' }}>

      {/* Animated stars rising from bottom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              animation: `starFloat ${8 + Math.random() * 6}s ease-in infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          >
            <svg width="6" height="6" viewBox="0 0 20 20" fill="#C9A96E" opacity={0.5 + Math.random() * 0.4}>
              <path d="M10 1l2.3 6.5H19l-5.5 4 2.1 6.5L10 14l-5.6 4 2.1-6.5L1 7.5h6.7z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Subtle gold top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.12), transparent 70%)' }} />

      <div className="relative z-10 max-w-sm w-full text-center">

        {/* Lines */}
        <div className="flex flex-col gap-5 mb-8">
          {LINES.map((line, i) => (
            <p
              key={i}
              className="font-display transition-all duration-700"
              style={{
                opacity: visibleLines.includes(i) ? 1 : 0,
                transform: visibleLines.includes(i) ? 'translateY(0)' : 'translateY(16px)',
                fontSize: line.size === 'large' ? '22px' : line.size === 'medium' ? '19px' : '16px',
                color: line.size === 'large'
                  ? '#FAF8F4'
                  : line.size === 'medium'
                    ? 'rgba(250,248,244,0.8)'
                    : 'rgba(250,248,244,0.5)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                fontWeight: line.size === 'large' ? 500 : 300,
                transition: `opacity 0.8s ease, transform 0.8s ease`,
              }}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* Birthday girl's name — the crescendo */}
        {showName && (
          <div className="animate-scale-in">
            <div className="divider-gold mx-auto w-16 mb-8 animate-gold-pulse" />
            <p className="font-display text-4xl font-bold leading-tight" style={{ color: '#C9A96E' }}>
              Happy Birthday,
            </p>
            <p className="font-display text-5xl font-bold mt-1 text-ivory" style={{ letterSpacing: '-0.01em' }}>
              {session.birthdayGirlName}.
            </p>
            <p className="font-display text-3xl mt-3" style={{ color: 'rgba(201,169,110,0.7)' }}>
              ❤️
            </p>

            {/* Birthday message if set */}
            {session.birthdayMessage && (
              <div className="mt-8 px-6">
                <div className="divider-gold mb-5" />
                <p className="font-display italic text-base leading-relaxed"
                  style={{ color: 'rgba(250,248,244,0.45)' }}>
                  "{session.birthdayMessage}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions for host */}
        {showActions && isHost && (
          <div className="flex flex-col gap-3 mt-12 animate-fade-up">
            <div className="divider-gold mb-2" />
            <button className="btn-ghost py-3" style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.25)' }}
              onClick={handleDelete}>
              End & Clear Game Data
            </button>
            <button className="btn-ghost py-3" onClick={onRestart}>
              Back to Home
            </button>
          </div>
        )}

        {showActions && !isHost && (
          <div className="mt-10 animate-fade-up">
            <p className="font-sans-ui text-xs text-ivory/20 tracking-wide">
              Capture a screenshot — she'd want to keep this.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

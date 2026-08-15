import type { RoundDef } from '../types'
import FloatingParticles from '../components/FloatingParticles'

const BG_STYLES: Record<string, React.CSSProperties> = {
  light:      { background: 'linear-gradient(160deg, #FAF8F4 0%, #F0E6D3 100%)' },
  blush:      { background: 'linear-gradient(160deg, #F5EDE0 0%, #EDD8CB 100%)' },
  dark:       { background: 'linear-gradient(160deg, #1C1410 0%, #2D1A12 100%)' },
  'warm-dark': { background: 'linear-gradient(160deg, #120E09 0%, #1C1410 100%)' },
}

interface RoundIntroProps {
  round: RoundDef
  isHost: boolean
  onStart: () => void
}

export default function RoundIntro({ round, isHost, onStart }: RoundIntroProps) {
  const dark = round.backgroundMode === 'dark' || round.backgroundMode === 'warm-dark'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={BG_STYLES[round.backgroundMode]}>

      <FloatingParticles count={14} dark={dark} />

      <div className="relative z-10 text-center max-w-sm w-full animate-scale-in">

        {/* Round number */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-8" style={{ background: dark ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.5)' }} />
          <span className="font-sans-ui text-xs tracking-[0.3em] font-medium"
            style={{ color: dark ? '#C9A96E' : 'rgba(201,169,110,0.9)' }}>
            ROUND {round.number}
          </span>
          <div className="h-px w-8" style={{ background: dark ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.5)' }} />
        </div>

        {/* Round name */}
        <h1 className="font-display text-4xl font-bold mb-4"
          style={{ color: dark ? '#FAF8F4' : '#1C1410' }}>
          {round.label}
        </h1>

        {/* Tagline */}
        <p className="font-display text-xl italic mb-6"
          style={{ color: dark ? 'rgba(250,248,244,0.65)' : 'rgba(28,20,16,0.55)' }}>
          "{round.tagline}"
        </p>

        {/* Divider */}
        <div className="divider-gold mx-auto w-24 mb-6" />

        {/* Description */}
        <p className="font-sans-ui text-sm leading-relaxed mb-10"
          style={{ color: dark ? 'rgba(250,248,244,0.5)' : 'rgba(28,20,16,0.5)' }}>
          {round.description}
        </p>

        {/* Action */}
        {isHost ? (
          <button
            onClick={onStart}
            className={dark ? 'btn-gold w-full py-4 text-base' : 'btn-primary w-full py-4 text-base'}
          >
            Begin Round {round.number} →
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
            style={{
              background: dark ? 'rgba(201,169,110,0.1)' : 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}>
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-sans-ui text-xs" style={{ color: dark ? '#C9A96E' : '#8A7060' }}>
              Waiting for host to start…
            </span>
          </div>
        )}

      </div>
    </div>
  )
}

import FloatingParticles from '../components/FloatingParticles'

interface LandingScreenProps {
  onHost: () => void
  onJoin: () => void
}

export default function LandingScreen({ onHost, onJoin }: LandingScreenProps) {
  return (
    <div className="grain relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F5EDE0 40%, #EDD8CB 100%)' }}>

      <FloatingParticles count={22} />

      {/* Subtle top label */}
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        <span className="font-sans-ui text-xs font-medium tracking-[0.25em] text-espresso/40 uppercase">
          Birthday Edition · 2024
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 py-16 max-w-sm w-full text-center">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-gold opacity-50" />
          <span className="font-sans-ui text-xs font-medium tracking-[0.22em] text-gold uppercase">
            A Private Game Night
          </span>
          <div className="h-px w-10 bg-gold opacity-50" />
        </div>

        {/* Main headline */}
        <h1 className="font-display text-5xl font-light leading-[1.1] text-espresso mb-3"
          style={{ fontStyle: 'italic' }}>
          Tonight is<br />
          <span className="font-bold not-italic">all about her.</span>
        </h1>

        <p className="font-sans-ui text-sm text-espresso/55 leading-relaxed mt-4 mb-12 max-w-xs">
          5 people. One birthday girl.<br />A questionable amount of childhood lore.
        </p>

        {/* CTA buttons */}
        <div className="w-full flex flex-col gap-3">
          <button className="btn-primary w-full text-base py-4" onClick={onHost}>
            Host the Birthday
          </button>
          <button className="btn-ghost w-full" onClick={onJoin}>
            Join a Game
          </button>
        </div>

        {/* Tiny footnote */}
        <p className="font-sans-ui text-xs text-espresso/30 mt-8 tracking-wide">
          A private game night made with love.
        </p>
      </div>

      {/* Decorative bottom arc */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(237,216,203,0.4), transparent)',
        }} />

      {/* Side decorations */}
      <div className="absolute left-4 top-1/3 w-px h-24 opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, #C9A96E, transparent)' }} />
      <div className="absolute right-4 top-1/2 w-px h-16 opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, #C9A96E, transparent)' }} />
    </div>
  )
}

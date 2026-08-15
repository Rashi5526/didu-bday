import { useMemo } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  type: 'star' | 'diamond' | 'dot'
  opacity: number
}

interface FloatingParticlesProps {
  count?: number
  dark?: boolean
  gold?: boolean
}

export default function FloatingParticles({ count = 18, dark = false, gold = false }: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 6,
      type: (['star', 'diamond', 'dot'] as const)[Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.4 + 0.1,
    })), [count])

  const color = gold ? '#C9A96E' : dark ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.5)'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-float-a"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            '--dur': `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          } as React.CSSProperties}
        >
          {p.type === 'star' && (
            <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 20 20" fill={color}>
              <path d="M10 1l2.3 6.5H19l-5.5 4 2.1 6.5L10 14l-5.6 4 2.1-6.5L1 7.5h6.7z" />
            </svg>
          )}
          {p.type === 'diamond' && (
            <svg width={p.size * 1.5} height={p.size * 1.5} viewBox="0 0 20 20" fill={color}>
              <path d="M10 0L20 10L10 20L0 10z" />
            </svg>
          )}
          {p.type === 'dot' && (
            <div style={{
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: color,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

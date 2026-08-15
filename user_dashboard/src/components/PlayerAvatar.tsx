interface PlayerAvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  isBirthdayGirl?: boolean
  showName?: boolean
}

const SIZES = {
  sm: { outer: 36, font: 14 },
  md: { outer: 48, font: 17 },
  lg: { outer: 64, font: 22 },
}

export default function PlayerAvatar({
  name, color, size = 'md', isBirthdayGirl = false, showName = false
}: PlayerAvatarProps) {
  const s = SIZES[size]
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative flex items-center justify-center rounded-full font-display font-semibold"
        style={{
          width: s.outer,
          height: s.outer,
          background: color,
          fontSize: s.font,
          color: '#FAF8F4',
          boxShadow: isBirthdayGirl
            ? `0 0 0 2px #C9A96E, 0 0 0 4px rgba(201,169,110,0.2)`
            : `0 2px 8px rgba(0,0,0,0.12)`,
          flexShrink: 0,
        }}
      >
        {initials}
        {isBirthdayGirl && (
          <span
            className="absolute -top-1 -right-1 text-xs"
            style={{ fontSize: size === 'sm' ? 10 : 13 }}
          >🎂</span>
        )}
      </div>
      {showName && (
        <span className="text-xs font-medium text-espresso/70 text-center leading-tight" style={{ maxWidth: 64 }}>
          {name}
        </span>
      )}
    </div>
  )
}

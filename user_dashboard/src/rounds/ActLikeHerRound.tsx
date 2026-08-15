import type { RoundProps } from './shared'
import { awardPoints } from '../lib/storage'

const SCORES = [
  { label: 'ICONIC', points: 10, color: '#C9A96E', desc: 'Absolutely her.' },
  { label: 'VERY GOOD', points: 7, color: '#8B9B6B', desc: 'Nailed it.' },
  { label: 'DECENT', points: 5, color: '#8B8B8B', desc: 'Getting there.' },
  { label: 'NOT HER AT ALL', points: 0, color: '#C47A6B', desc: 'Who was that?' },
]

export default function ActLikeHerRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion,
}: RoundProps) {
  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const questionNum = round.currentQuestionIndex + 1
  const totalQ = round.questions.length
  const performer = session.players[(round.currentQuestionIndex) % session.players.length]

  const handleScore = async (performerId: string, pts: number) => {
    const updated = await awardPoints(roomCode, performerId, q.id, pts)
    if (updated) {
      setSession(updated)
      setTimeout(onNextQuestion, 800)
    }
  }

  const birthdayGirl = session.players.find(p => p.isBirthdayGirl)
  const isJudge = myPlayer?.isBirthdayGirl || isHost

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #F5EDE0 0%, #EDD8CB 100%)' }}>

      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase">
          Round 03 · Act Like Her
        </span>
        <span className="font-sans-ui text-xs text-espresso/35">{questionNum} / {totalQ}</span>
      </div>

      <div className="px-5 flex-1 flex flex-col gap-5">

        {/* Performer spotlight */}
        <div className="card-ivory p-5 text-center">
          <span className="font-sans-ui text-xs text-espresso/40 uppercase tracking-widest block mb-2">
            Performing
          </span>
          <div className="inline-flex flex-col items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl text-ivory mb-2"
              style={{ background: performer?.color ?? '#C4897A' }}>
              {performer?.name?.[0]?.toUpperCase()}
            </div>
            <p className="font-display text-xl font-medium text-espresso">{performer?.name}</p>
          </div>
        </div>

        {/* Prompt card */}
        <div className="card-dark p-6">
          <span className="font-sans-ui text-xs tracking-[0.2em] text-gold/70 uppercase block mb-3">
            The Prompt
          </span>
          <p className="font-display text-xl font-medium leading-snug text-ivory">
            {q.prompt}
          </p>
        </div>

        {/* Judge info */}
        <div className="text-center">
          <p className="font-sans-ui text-xs text-espresso/50">
            {birthdayGirl ? `${birthdayGirl.name} is judging this performance` : 'The birthday girl is the judge'}
          </p>
        </div>

        {/* Scoring — only for judge/host */}
        {isJudge && (
          <div className="flex flex-col gap-3 mt-2">
            <p className="font-sans-ui text-xs tracking-[0.15em] text-espresso/40 uppercase text-center">
              {myPlayer?.isBirthdayGirl ? 'You\'re the judge — rate this performance:' : 'Award points:'}
            </p>
            {SCORES.map(s => (
              <button
                key={s.label}
                className="flex items-center justify-between p-4 rounded-2xl transition-all active:scale-98"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: `1.5px solid ${s.color}30`,
                }}
                onClick={() => performer && handleScore(performer.id, s.points)}
              >
                <div>
                  <span className="font-sans-ui font-semibold text-sm" style={{ color: s.color }}>
                    {s.label}
                  </span>
                  <p className="font-sans-ui text-xs text-espresso/50 mt-0.5">{s.desc}</p>
                </div>
                <span className="font-display text-2xl font-bold text-espresso/30">
                  {s.points > 0 ? `+${s.points}` : '—'}
                </span>
              </button>
            ))}
          </div>
        )}

        {!isJudge && (
          <div className="text-center pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 border border-cream-border">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-sans-ui text-xs text-espresso/60">
                {myPlayer?.name === performer?.name ? 'Time to perform!' : 'Watching the performance…'}
              </span>
            </div>
          </div>
        )}

        {isHost && (
          <div className="pb-6">
            <div className="divider-gold mb-4" />
            <button className="btn-primary w-full py-3.5" onClick={onNextQuestion}>
              {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Prompt →' : 'End Round →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

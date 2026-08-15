import { useState } from 'react'
import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion, allPlayersAnswered } from './shared'
import { submitAnswer, revealQuestion, awardPoints } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1607729644623-0ad389815f83?w=600&h=450&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1602443394222-300ea8fca02e?w=600&h=450&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1778949367481-04f79bfc76fb?w=600&h=450&fit=crop&auto=format',
]

export default function PhotoRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion,
}: RoundProps) {
  const [freeText, setFreeText] = useState('')

  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)
  const allIn = allPlayersAnswered(session, q.id)

  const photoUrl = q.photoUrl || SAMPLE_PHOTOS[round.currentQuestionIndex % SAMPLE_PHOTOS.length]

  const handleSubmit = async () => {
    if (!freeText.trim() || myAnswer || !myPlayer) return
    const answer: Answer = {
      playerId: myPlayer.id,
      questionId: q.id,
      roundId: round.id,
      value: freeText.trim(),
      submittedAt: Date.now(),
    }
    const updated = await submitAnswer(roomCode, answer)
    if (updated) { setSession(updated); setFreeText('') }
  }

  const handleReveal = async () => {
    const updated = await revealQuestion(roomCode, q.id)
    if (updated) setSession(updated)
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1C1410 0%, #2D1A12 100%)' }}>

      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-ivory/30 uppercase">
          Round 07 · Guess the Photo
        </span>
        <span className="font-sans-ui text-xs text-ivory/25">
          {round.currentQuestionIndex + 1} / {round.questions.length}
        </span>
      </div>

      <div className="px-5 flex-1 flex flex-col gap-4">

        {/* Photo */}
        <div className="relative rounded-2xl overflow-hidden bg-espresso"
          style={{ aspectRatio: '4/3' }}>
          <img
            src={photoUrl}
            alt="Memory photo"
            className="w-full h-full object-cover"
            style={{ filter: revealed ? 'none' : 'blur(2px) brightness(0.85)' }}
          />
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(16,12,8,0.4)' }}>
              <p className="font-sans-ui text-xs text-ivory/70 tracking-[0.15em] uppercase">
                Answer first, then reveal
              </p>
            </div>
          )}
          {/* Photo metadata overlay when revealed */}
          {revealed && (q.photoYear || q.photoLocation) && (
            <div className="absolute bottom-0 left-0 right-0 p-3"
              style={{ background: 'linear-gradient(to top, rgba(16,12,8,0.9), transparent)' }}>
              <div className="flex gap-3">
                {q.photoYear && <span className="font-sans-ui text-xs text-ivory/70">{q.photoYear}</span>}
                {q.photoLocation && <span className="font-sans-ui text-xs text-ivory/50">{q.photoLocation}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="glass-dark rounded-2xl p-4">
          <p className="font-display text-xl font-medium text-ivory leading-snug">{q.text}</p>
        </div>

        {!revealed ? (
          <>
            {!myAnswer ? (
              <div className="flex flex-col gap-3">
                <textarea
                  className="resize-none rounded-2xl p-4 text-sm outline-none transition-all"
                  rows={3}
                  placeholder="Your answer…"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  maxLength={150}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(201,169,110,0.2)',
                    color: '#F5EDE0',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                />
                <button className="btn-gold py-3.5" onClick={handleSubmit}>
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="text-center py-3 animate-scale-in">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full"
                  style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)' }}>
                  <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="font-sans-ui text-xs text-gold">Locked in</span>
                </div>
              </div>
            )}
            <div className="text-center">
              <span className="font-sans-ui text-xs text-ivory/30">
                {answers.length} / {session.players.length} answered
              </span>
              {allIn && <p className="font-display italic text-ivory/50 text-sm mt-1 animate-fade-in">All answered 👀</p>}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-up">
            {q.photoStory && (
              <div className="glass-dark rounded-2xl p-4">
                <p className="font-sans-ui text-xs text-gold/70 uppercase tracking-widest mb-2">The Real Story</p>
                <p className="font-sans-ui text-sm text-ivory/80 leading-relaxed">{q.photoStory}</p>
              </div>
            )}
            {session.players.map(player => {
              const ans = answers.find(a => a.playerId === player.id)
              return (
                <div key={player.id} className="glass-dark rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <PlayerAvatar name={player.name} color={player.color} size="sm" />
                    <div className="flex-1">
                      <p className="font-sans-ui text-xs text-ivory/40 mb-1">{player.name}</p>
                      <p className="font-sans-ui text-sm text-ivory/80">
                        {ans?.value ?? <span className="italic text-ivory/25">No answer</span>}
                      </p>
                    </div>
                    {isHost && ans && (
                      <div className="flex gap-1.5">
                        {[10, 5, 0].map(pts => (
                          <button key={pts}
                            onClick={async () => { const u = await awardPoints(roomCode, player.id, q.id, pts); if (u) setSession(u) }}
                            className="px-2 py-1 rounded-lg text-xs font-sans-ui transition-all"
                            style={{
                              background: ans.markedScore === pts ? '#C9A96E' : 'rgba(255,255,255,0.1)',
                              color: ans.markedScore === pts ? '#1C1410' : '#F5EDE0',
                              border: '1px solid rgba(201,169,110,0.2)',
                            }}>
                            {pts > 0 ? `+${pts}` : '✗'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isHost && (
          <div className="pb-6 flex flex-col gap-3 mt-2">
            <div className="divider-gold" />
            {!revealed ? (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={handleReveal}>
                Reveal Photo & Answers
              </button>
            ) : (
              <button className="btn-primary w-full py-3.5 mt-2" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Photo →' : 'End Round →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

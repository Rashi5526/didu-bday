import { useState } from 'react'
import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion, allPlayersAnswered } from './shared'
import { submitAnswer, revealQuestion, awardPoints } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'

export default function MemoryRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion,
}: RoundProps) {
  const [freeText, setFreeText] = useState('')

  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)
  const allIn = allPlayersAnswered(session, q.id)

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
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F5EDE0 100%)' }}>

      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase">
            Round 05 · Memory
          </span>
          {q.category && (
            <span className="font-sans-ui text-xs text-espresso/30 block mt-0.5">{q.category}</span>
          )}
        </div>
        <span className="font-sans-ui text-xs text-espresso/35">
          {round.currentQuestionIndex + 1} / {round.questions.length}
        </span>
      </div>

      {/* Decorative memory label */}
      <div className="flex items-center gap-2 px-5 mb-4">
        <div className="h-px flex-1 bg-cream-border" />
        <span className="font-sans-ui text-xs tracking-[0.2em] text-espresso/30 uppercase">
          Memory {String(round.currentQuestionIndex + 1).padStart(2, '0')} / {String(round.questions.length).padStart(2, '0')}
        </span>
        <div className="h-px flex-1 bg-cream-border" />
      </div>

      <div className="px-5 flex-1 flex flex-col gap-5">

        <div className="card-champagne p-6">
          <p className="font-display text-2xl font-medium text-espresso leading-snug">{q.text}</p>
        </div>

        {!revealed ? (
          <>
            {!myAnswer ? (
              <div className="flex flex-col gap-3">
                <textarea
                  className="input-premium resize-none"
                  rows={4}
                  placeholder="Your memory of this…"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  maxLength={200}
                />
                <button className="btn-primary py-3.5" onClick={handleSubmit}>
                  Submit Memory
                </button>
              </div>
            ) : (
              <div className="card-ivory p-4 text-center animate-scale-in">
                <p className="font-sans-ui text-xs text-espresso/50 mb-2">Your answer</p>
                <p className="font-display text-lg italic text-espresso">{myAnswer.value}</p>
              </div>
            )}

            <div className="text-center">
              <span className="font-sans-ui text-xs text-espresso/40">
                {answers.length} / {session.players.length} submitted
              </span>
              {allIn && <p className="font-display italic text-espresso/60 text-sm mt-1 animate-fade-in">All memories in 👀</p>}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-up">
            {/* Memory unlocked header */}
            <div className="text-center py-3">
              <span className="font-sans-ui text-xs tracking-[0.3em] text-gold uppercase">✦ Memory Unlocked ✦</span>
            </div>

            {session.players.map(player => {
              const ans = answers.find(a => a.playerId === player.id)
              return (
                <div key={player.id} className="card-ivory p-4">
                  <div className="flex items-start gap-3">
                    <PlayerAvatar name={player.name} color={player.color} size="sm" />
                    <div className="flex-1">
                      <p className="font-sans-ui text-xs text-espresso/50 mb-1">{player.name}</p>
                      <p className="font-sans-ui text-sm text-espresso">
                        {ans?.value ?? <span className="italic text-espresso/30">No answer</span>}
                      </p>
                    </div>
                    {isHost && ans && (
                      <div className="flex gap-1.5">
                        {[10, 5, 0].map(pts => (
                          <button key={pts}
                            onClick={async () => {
                              const u = await awardPoints(roomCode, player.id, q.id, pts)
                              if (u) setSession(u)
                            }}
                            className="px-2 py-1 rounded-lg text-xs font-sans-ui transition-all"
                            style={{
                              background: ans.markedScore === pts
                                ? pts === 10 ? '#6B9B6B' : pts === 5 ? '#C9A96E' : '#C47A6B'
                                : 'rgba(255,255,255,0.8)',
                              color: ans.markedScore === pts ? '#FAF8F4' : '#8A7060',
                              border: '1px solid #E2D5C3',
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
                Reveal Answers
              </button>
            ) : (
              <button className="btn-primary w-full py-3.5 mt-2" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Memory →' : 'End Round →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion } from './shared'
import { submitAnswer, revealQuestion } from '../lib/storage'
import FloatingParticles from '../components/FloatingParticles'

export default function HeartRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion, onNextRound,
}: RoundProps) {
  const [freeText, setFreeText] = useState('')
  const [revealIndex, setRevealIndex] = useState(0)

  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)

  const birthdayGirl = session.players.find(p => p.isBirthdayGirl)
  const isBirthdayGirl = myPlayer?.isBirthdayGirl ?? false

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
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1C1410 0%, #2D1810 100%)' }}>

      <FloatingParticles count={12} dark gold />

      <div className="relative z-10 px-5 pt-10 pb-4 flex items-center justify-between">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-ivory/30 uppercase">
          Round 06 · Who Knows Her Heart?
        </span>
        <span className="font-sans-ui text-xs text-ivory/25">
          {round.currentQuestionIndex + 1} / {round.questions.length}
        </span>
      </div>

      <div className="relative z-10 px-5 flex-1 flex flex-col gap-5">

        {/* No points label */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gold/30" />
          <span className="font-sans-ui text-xs tracking-[0.2em] text-gold/60 uppercase">No Points · Just Truth</span>
          <div className="h-px w-8 bg-gold/30" />
        </div>

        {/* Question */}
        <div className="glass-dark rounded-2xl p-6">
          <p className="font-display text-2xl font-medium text-ivory leading-snug italic">
            "{q.text}"
          </p>
        </div>

        {!revealed ? (
          <>
            {/* Input (anonymous) */}
            {!myAnswer ? (
              <div className="flex flex-col gap-3">
                <p className="font-sans-ui text-xs text-ivory/40 text-center">
                  Your answer is anonymous.
                </p>
                <textarea
                  className="resize-none rounded-2xl p-4 text-sm leading-relaxed outline-none transition-all"
                  rows={4}
                  placeholder="Write honestly…"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  maxLength={300}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(201,169,110,0.25)',
                    color: '#F5EDE0',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                />
                <button className="btn-gold py-3.5 w-full" onClick={handleSubmit}>
                  Send Anonymously
                </button>
              </div>
            ) : (
              <div className="text-center py-4 animate-scale-in">
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
                  style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
                  <span className="text-gold text-sm">✓</span>
                  <span className="font-sans-ui text-xs text-gold">Sent — your words are safe</span>
                </div>
              </div>
            )}

            <div className="text-center">
              <span className="font-sans-ui text-xs text-ivory/30">
                {answers.length} / {session.players.length} answered
              </span>
            </div>
          </>
        ) : (
          /* Birthday girl reads responses one by one */
          <div className="flex flex-col gap-4 animate-fade-up">
            {isBirthdayGirl || isHost ? (
              <>
                {answers[revealIndex] && (
                  <div key={revealIndex} className="glass-dark rounded-2xl p-6 text-center animate-scale-in">
                    <p className="font-sans-ui text-xs tracking-[0.2em] text-gold/60 uppercase mb-4">
                      Someone who loves you wrote…
                    </p>
                    <p className="font-display text-xl font-medium text-ivory leading-relaxed italic">
                      "{answers[revealIndex].value}"
                    </p>
                    <div className="divider-gold mx-auto w-16 mt-6 mb-4" />
                    <p className="font-sans-ui text-xs text-ivory/40">
                      — {session.players.find(p => p.id === answers[revealIndex].playerId)?.name}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {revealIndex > 0 && (
                    <button className="btn-ghost flex-1 py-3" style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.3)' }}
                      onClick={() => setRevealIndex(i => i - 1)}>
                      ← Previous
                    </button>
                  )}
                  {revealIndex < answers.length - 1 && (
                    <button className="btn-gold flex-1 py-3"
                      onClick={() => setRevealIndex(i => i + 1)}>
                      Next →
                    </button>
                  )}
                </div>

                {isHost && revealIndex === answers.length - 1 && (
                  <button className="btn-gold w-full py-3.5 mt-2" onClick={onNextQuestion}>
                    {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Question →' : 'End Round →'}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="font-display italic text-2xl text-ivory/50 mb-2">
                  {birthdayGirl ? `${birthdayGirl.name} is reading…` : 'Reading in progress…'}
                </p>
                <p className="font-sans-ui text-xs text-ivory/30">Give her a moment.</p>
              </div>
            )}
          </div>
        )}

        {isHost && (
          <div className="pb-6 flex flex-col gap-3 mt-auto">
            <div className="divider-gold" />
            {!revealed ? (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={handleReveal}>
                Begin the Reveal
              </button>
            ) : (
              !isBirthdayGirl && revealIndex === answers.length - 1 && (
                <button className="btn-primary w-full py-3.5" onClick={onNextQuestion}>
                  {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Question →' : 'End Round →'}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

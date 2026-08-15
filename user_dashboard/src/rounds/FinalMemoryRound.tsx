import { useState } from 'react'
import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion } from './shared'
import { submitAnswer, revealQuestion } from '../lib/storage'
import FloatingParticles from '../components/FloatingParticles'

export default function FinalMemoryRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion, onNextRound,
}: RoundProps) {
  const [freeText, setFreeText] = useState('')
  const [revealIndex, setRevealIndex] = useState(0)
  const [guessing, setGuessing] = useState<string | null>(null)
  const [guessRevealed, setGuessRevealed] = useState(false)

  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)
  const allIn = answers.length >= session.players.length - 1 // exclude birthday girl maybe

  const isBirthdayGirl = myPlayer?.isBirthdayGirl ?? false
  const birthdayGirl = session.players.find(p => p.isBirthdayGirl)

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

  const currentAnswer = answers[revealIndex]
  const authorName = currentAnswer
    ? session.players.find(p => p.id === currentAnswer.playerId)?.name
    : null

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #100C08 0%, #1C1410 100%)' }}>

      <FloatingParticles count={16} dark gold />

      <div className="relative z-10 px-5 pt-10 pb-4 flex items-center justify-between">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-ivory/25 uppercase">
          Round 08 · Final Memory
        </span>
        <span className="font-sans-ui text-xs text-ivory/20">
          {round.currentQuestionIndex + 1} / {round.questions.length}
        </span>
      </div>

      <div className="relative z-10 px-5 flex-1 flex flex-col gap-5">

        {/* Prompt */}
        <div className="glass-dark rounded-2xl p-6 text-center">
          <p className="font-sans-ui text-xs tracking-[0.2em] text-gold/60 uppercase mb-3">Write to her</p>
          <p className="font-display text-2xl italic font-medium text-ivory leading-snug">
            "{q.text}"
          </p>
        </div>

        {!revealed ? (
          <>
            {!myAnswer && !isBirthdayGirl ? (
              <div className="flex flex-col gap-3">
                <p className="font-sans-ui text-xs text-ivory/35 text-center">
                  Your message is anonymous — she'll read it aloud.
                </p>
                <textarea
                  className="resize-none rounded-2xl p-4 text-sm leading-relaxed outline-none"
                  rows={5}
                  placeholder="Write from the heart…"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  maxLength={400}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(201,169,110,0.2)',
                    color: '#F5EDE0',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                />
                <button className="btn-gold py-3.5 w-full" onClick={handleSubmit}>
                  Send to Her ♡
                </button>
              </div>
            ) : myAnswer ? (
              <div className="text-center py-4 animate-scale-in">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }}>
                    <span className="text-gold">✓</span>
                  </div>
                  <p className="font-sans-ui text-xs text-gold">Your message has been sent</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="font-display italic text-xl text-ivory/40">
                  Everyone is writing to you…
                </p>
              </div>
            )}

            <div className="text-center">
              <span className="font-sans-ui text-xs text-ivory/25">
                {answers.length} / {session.players.length} submitted
              </span>
            </div>
          </>
        ) : (
          /* Reading the messages */
          <div className="flex flex-col gap-4 animate-fade-up">
            {currentAnswer && (
              <div className="glass-dark rounded-2xl p-7 text-center animate-scale-in" key={`${revealIndex}-${currentAnswer.questionId}`}>
                <p className="font-sans-ui text-xs tracking-[0.25em] text-gold/50 uppercase mb-5">
                  Message {revealIndex + 1} of {answers.length}
                </p>
                <p className="font-display text-xl italic font-medium text-ivory leading-relaxed mb-6">
                  "{currentAnswer.value}"
                </p>
                <div className="divider-gold mx-auto w-12 mb-5" />
                {guessRevealed ? (
                  <p className="font-sans-ui text-sm font-medium" style={{ color: '#C9A96E' }}>
                    — {authorName}
                  </p>
                ) : (
                  <>
                    {isBirthdayGirl && (
                      <div className="flex flex-col items-center gap-3">
                        <p className="font-sans-ui text-xs text-ivory/40">Guess who wrote this:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {session.players.filter(p => !p.isBirthdayGirl).map(p => (
                            <button key={p.id}
                              className="px-4 py-2 rounded-xl text-xs font-sans-ui transition-all"
                              style={{
                                background: guessing === p.name ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${guessing === p.name ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: guessing === p.name ? '#C9A96E' : '#F5EDE0',
                              }}
                              onClick={() => setGuessing(p.name)}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                        {guessing && (
                          <button className="btn-gold px-8 py-2.5 text-sm mt-1"
                            onClick={() => setGuessRevealed(true)}>
                            Reveal Author
                          </button>
                        )}
                      </div>
                    )}
                    {!isBirthdayGirl && (
                      <div className="text-center">
                        <p className="font-sans-ui text-xs text-ivory/35">
                          {birthdayGirl ? `${birthdayGirl.name}` : 'Birthday girl'} is reading…
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Navigation */}
            {(isBirthdayGirl || isHost) && (
              <div className="flex gap-3">
                {revealIndex > 0 && (
                  <button className="btn-ghost flex-1 py-3" style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.25)' }}
                    onClick={() => { setRevealIndex(i => i - 1); setGuessing(null); setGuessRevealed(false) }}>
                    ← Prev
                  </button>
                )}
                {revealIndex < answers.length - 1 && (
                  <button className="btn-gold flex-1 py-3"
                    onClick={() => { setRevealIndex(i => i + 1); setGuessing(null); setGuessRevealed(false) }}>
                    Next →
                  </button>
                )}
              </div>
            )}

            {isHost && revealIndex === answers.length - 1 && (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Prompt →' : 'End Round →'}
              </button>
            )}
          </div>
        )}

        {isHost && (
          <div className="pb-6 flex flex-col gap-3 mt-auto">
            <div className="divider-gold" />
            {!revealed ? (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={handleReveal}>
                Begin Reading
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

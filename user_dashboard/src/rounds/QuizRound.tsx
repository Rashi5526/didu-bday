import { useState } from 'react'
import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion, allPlayersAnswered } from './shared'
import { submitAnswer, awardPoints, revealQuestion, patchSession } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'

export default function QuizRound({
  session, round, roundIndex, myPlayer, isHost, roomCode, setSession, onNextQuestion, onNextRound,
}: RoundProps) {
  const [freeText, setFreeText] = useState('')
  const [justSubmitted, setJustSubmitted] = useState(false)

  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)
  const allIn = allPlayersAnswered(session, q.id)
  const questionNum = round.currentQuestionIndex + 1
  const totalQ = round.questions.length

  const handleSelectOption = async (option: string) => {
    if (myAnswer || !myPlayer) return
    const answer: Answer = {
      playerId: myPlayer.id,
      questionId: q.id,
      roundId: round.id,
      value: option,
      submittedAt: Date.now(),
    }
    const updated = await submitAnswer(roomCode, answer)
    if (updated) { setSession(updated); setJustSubmitted(true) }
  }

  const handleSubmitText = async () => {
    if (!freeText.trim() || myAnswer || !myPlayer) return
    const answer: Answer = {
      playerId: myPlayer.id,
      questionId: q.id,
      roundId: round.id,
      value: freeText.trim(),
      submittedAt: Date.now(),
    }
    const updated = await submitAnswer(roomCode, answer)
    if (updated) { setSession(updated); setJustSubmitted(true); setFreeText('') }
  }

  const handleReveal = async () => {
    const updated = await revealQuestion(roomCode, q.id)
    if (updated) setSession(updated)
  }

  const handleAward = async (playerId: string, points: number) => {
    const updated = await awardPoints(roomCode, playerId, q.id, points)
    if (updated) setSession(updated)
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F0E6D3 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase block">
            Round 01 · Who Knows Her Best?
          </span>
          <span className="font-sans-ui text-xs text-espresso/30 mt-0.5 block">
            {q.category}
          </span>
        </div>
        <span className="font-sans-ui text-xs text-espresso/35">
          {questionNum} / {totalQ}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-5 h-0.5 bg-cream-border rounded-full overflow-hidden mb-6">
        <div className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${(questionNum / totalQ) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="px-5 mb-6 flex-1 flex flex-col">
        <div className="card-ivory p-6 mb-6">
          <p className="font-display text-2xl font-medium leading-snug text-espresso">
            {q.text}
          </p>
        </div>

        {/* Options or text input */}
        {!revealed ? (
          q.options && q.options.length > 0 ? (
            <div className="flex flex-col gap-3">
              {q.options.map(opt => (
                <button
                  key={opt}
                  className={`answer-option ${myAnswer?.value === opt ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {!myAnswer ? (
                <>
                  <textarea
                    className="input-premium resize-none"
                    rows={3}
                    placeholder="Your answer…"
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    maxLength={100}
                  />
                  <button className="btn-primary py-3.5" onClick={handleSubmitText}>
                    Lock In Answer
                  </button>
                </>
              ) : (
                <div className="card-champagne p-4 text-center animate-scale-in">
                  <p className="font-sans-ui text-xs text-espresso/50 mb-1">Your answer</p>
                  <p className="font-display text-lg font-medium text-espresso">{myAnswer.value}</p>
                </div>
              )}
            </div>
          )
        ) : (
          /* Revealed answers */
          <div className="flex flex-col gap-3 animate-fade-up">
            <p className="font-sans-ui text-xs tracking-[0.18em] text-espresso/40 uppercase mb-1">
              All Answers
            </p>
            {session.players.map(player => {
              const ans = answers.find(a => a.playerId === player.id)
              const score = ans?.markedScore
              return (
                <div key={player.id} className="card-ivory p-4">
                  <div className="flex items-start gap-3">
                    <PlayerAvatar name={player.name} color={player.color} size="sm" isBirthdayGirl={player.isBirthdayGirl} />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans-ui text-xs text-espresso/50 mb-1">{player.name}</p>
                      <p className="font-sans-ui text-sm font-medium text-espresso break-words">
                        {ans?.value ?? <span className="text-espresso/30 font-normal italic">No answer</span>}
                      </p>
                    </div>
                    {isHost && ans && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        {[10, 5, 0].map(pts => (
                          <button
                            key={pts}
                            onClick={() => handleAward(player.id, pts)}
                            className="px-2 py-1 rounded-lg text-xs font-sans-ui font-medium transition-all"
                            style={{
                              background: score === pts
                                ? pts === 10 ? '#6B9B6B' : pts === 5 ? '#C9A96E' : '#C47A6B'
                                : 'rgba(255,255,255,0.8)',
                              color: score === pts ? '#FAF8F4' : '#8A7060',
                              border: `1px solid ${score === pts ? 'transparent' : '#E2D5C3'}`,
                            }}
                          >
                            {pts > 0 ? `+${pts}` : '✗'}
                          </button>
                        ))}
                      </div>
                    )}
                    {!isHost && score !== undefined && (
                      <span className="font-sans-ui text-sm font-semibold"
                        style={{ color: score === 10 ? '#6B9B6B' : score === 5 ? '#C9A96E' : '#C47A6B' }}>
                        {score > 0 ? `+${score}` : '—'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Submit count */}
        {!revealed && (
          <div className="mt-4 text-center">
            <span className="font-sans-ui text-xs text-espresso/40">
              {answers.length} / {session.players.length} answers locked
            </span>
            {allIn && !revealed && (
              <p className="font-display italic text-espresso/60 text-sm mt-1 animate-fade-in">
                All answers are in 👀
              </p>
            )}
          </div>
        )}

        {/* Host controls */}
        {isHost && (
          <div className="mt-6 pb-6 flex flex-col gap-3">
            <div className="divider-gold" />
            <div className="flex items-center gap-2 mt-2">
              <span className="font-sans-ui text-xs tracking-[0.15em] text-espresso/30 uppercase">
                Host Controls
              </span>
            </div>
            {!revealed ? (
              <button className="btn-gold w-full py-3.5" onClick={handleReveal}
                disabled={answers.length === 0}>
                Reveal Answers
              </button>
            ) : (
              <button className="btn-primary w-full py-3.5" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1
                  ? 'Next Question →'
                  : 'End Round →'}
              </button>
            )}
          </div>
        )}

        {!isHost && myAnswer && !revealed && (
          <div className="mt-4 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 border border-cream-border">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-sans-ui text-xs text-espresso/60">Answer locked in — waiting for others…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

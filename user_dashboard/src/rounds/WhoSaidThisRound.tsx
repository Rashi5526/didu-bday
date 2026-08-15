import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion, allPlayersAnswered } from './shared'
import { submitAnswer, revealQuestion, awardPoints } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'

export default function WhoSaidThisRound({
  session, round, myPlayer, isHost, roomCode, setSession, onNextQuestion,
}: RoundProps) {
  const q = round.questions[round.currentQuestionIndex]
  if (!q) return null

  const answers = getAnswersForQuestion(session, q.id)
  const myAnswer = myPlayer ? myAnswerForQuestion(session, myPlayer.id, q.id) : null
  const revealed = session.revealedQuestionIds.includes(q.id)
  const allIn = allPlayersAnswered(session, q.id)

  const handleVote = async (playerName: string) => {
    if (myAnswer || !myPlayer) return
    const answer: Answer = {
      playerId: myPlayer.id,
      questionId: q.id,
      roundId: round.id,
      value: playerName,
      submittedAt: Date.now(),
    }
    const updated = await submitAnswer(roomCode, answer)
    if (updated) setSession(updated)
  }

  const handleReveal = async () => {
    const updated = await revealQuestion(roomCode, q.id)
    if (updated) setSession(updated)
  }

  const handleAwardAll = async (correctName: string) => {
    let updated = null
    for (const ans of answers) {
      const pts = ans.value === correctName ? 10 : 0
      updated = await awardPoints(roomCode, ans.playerId, q.id, pts)
    }
    if (updated) setSession(updated)
  }

  const voteCounts: Record<string, number> = {}
  for (const ans of answers) {
    voteCounts[ans.value] = (voteCounts[ans.value] ?? 0) + 1
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FAF8F4 0%, #F0E6D3 100%)' }}>

      <div className="px-5 pt-10 pb-4">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase">
          Round 02 · Who Said This?
        </span>
      </div>

      <div className="px-5 flex-1 flex flex-col gap-5">

        {/* Statement */}
        <div className="card-dark p-6 text-center">
          <span className="font-sans-ui text-xs tracking-[0.2em] text-gold/70 uppercase block mb-3">
            Someone said…
          </span>
          <p className="font-display text-2xl font-medium leading-snug text-ivory italic">
            "{q.statement}"
          </p>
        </div>

        {/* Vote */}
        {!revealed ? (
          <div className="flex flex-col gap-3">
            <p className="font-sans-ui text-xs text-espresso/50 text-center">Who said this?</p>
            {session.players.map(player => (
              <button
                key={player.id}
                className={`answer-option flex items-center gap-3 ${myAnswer?.value === player.name ? 'selected' : ''}`}
                onClick={() => handleVote(player.name)}
                disabled={!!myAnswer}
              >
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <span>{player.name}</span>
                {myAnswer?.value === player.name && (
                  <span className="ml-auto text-gold text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-up">
            <p className="font-sans-ui text-xs tracking-[0.18em] text-espresso/40 uppercase text-center">
              The Votes Are In
            </p>
            {session.players.map(player => {
              const count = voteCounts[player.name] ?? 0
              const pct = answers.length > 0 ? (count / answers.length) * 100 : 0
              return (
                <div key={player.id} className="card-ivory p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <PlayerAvatar name={player.name} color={player.color} size="sm" />
                    <span className="font-sans-ui text-sm font-medium text-espresso">{player.name}</span>
                    <span className="ml-auto font-sans-ui text-sm font-semibold text-espresso/70">{count} vote{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 bg-cream-border rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}

            {/* Set correct answer */}
            {isHost && (
              <div className="mt-2">
                <p className="font-sans-ui text-xs text-espresso/50 text-center mb-3">
                  Mark the correct person:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {session.players.map(p => (
                    <button key={p.id}
                      className="btn-ghost text-xs py-2 px-4"
                      onClick={() => handleAwardAll(p.name)}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!revealed && (
          <div className="text-center">
            <span className="font-sans-ui text-xs text-espresso/40">
              {answers.length} / {session.players.length} voted
            </span>
            {allIn && <p className="font-display italic text-espresso/60 text-sm mt-1 animate-fade-in">Everyone's voted 👀</p>}
          </div>
        )}

        {isHost && (
          <div className="pb-6 flex flex-col gap-3 mt-2">
            <div className="divider-gold" />
            {!revealed ? (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={handleReveal}>
                Reveal Votes
              </button>
            ) : (
              <button className="btn-primary w-full py-3.5 mt-2" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Statement →' : 'End Round →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

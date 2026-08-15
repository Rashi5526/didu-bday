import type { Answer } from '../types'
import type { RoundProps } from './shared'
import { getAnswersForQuestion, myAnswerForQuestion, allPlayersAnswered } from './shared'
import { submitAnswer, revealQuestion } from '../lib/storage'
import PlayerAvatar from '../components/PlayerAvatar'

export default function MostLikelyRound({
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

  const voteCounts: Record<string, number> = {}
  for (const ans of answers) voteCounts[ans.value] = (voteCounts[ans.value] ?? 0) + 1
  const maxVotes = Math.max(...Object.values(voteCounts), 1)
  const winner = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #F5EDE0 0%, #EDD8CB 50%, #E8D0C0 100%)' }}>

      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <span className="font-sans-ui text-xs tracking-[0.22em] text-espresso/40 uppercase">
          Round 04 · Most Likely To
        </span>
        <span className="font-sans-ui text-xs text-espresso/35">
          {round.currentQuestionIndex + 1} / {round.questions.length}
        </span>
      </div>

      <div className="px-5 flex-1 flex flex-col gap-5">

        {/* Question */}
        <div className="card-ivory p-6">
          <p className="font-sans-ui text-xs tracking-[0.15em] text-espresso/40 uppercase mb-3">
            Who is most likely to…
          </p>
          <p className="font-display text-2xl font-medium text-espresso leading-snug">
            {(q.text ?? '').replace('Who is most likely to ', '')}
          </p>
        </div>

        {!revealed ? (
          <div className="flex flex-col gap-3">
            {session.players.map(player => (
              <button
                key={player.id}
                className={`answer-option flex items-center gap-3 ${myAnswer?.value === player.name ? 'selected' : ''}`}
                onClick={() => handleVote(player.name)}
                disabled={!!myAnswer}
              >
                <PlayerAvatar name={player.name} color={player.color} size="sm" isBirthdayGirl={player.isBirthdayGirl} />
                <span>{player.name}</span>
                {myAnswer?.value === player.name && <span className="ml-auto text-gold text-sm">✓</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-up">

            {/* Winner callout */}
            {winner && (
              <div className="card-dark p-5 text-center animate-scale-in">
                <p className="font-sans-ui text-xs tracking-[0.2em] text-gold/70 uppercase mb-2">
                  The Family Has Spoken
                </p>
                <p className="font-display text-3xl font-bold text-ivory">{winner[0]}</p>
                <p className="font-sans-ui text-sm text-ivory/50 mt-1">{winner[1]} of {answers.length} votes</p>
              </div>
            )}

            {/* Bar chart */}
            {session.players.map(player => {
              const count = voteCounts[player.name] ?? 0
              const pct = (count / maxVotes) * 100
              return (
                <div key={player.id} className="card-ivory p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <PlayerAvatar name={player.name} color={player.color} size="sm" isBirthdayGirl={player.isBirthdayGirl} />
                    <span className="font-sans-ui text-sm font-medium text-espresso">{player.name}</span>
                    <span className="ml-auto font-sans-ui text-xs font-semibold text-espresso/60">{count}</span>
                  </div>
                  <div className="h-2 bg-cream-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: player.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!revealed && (
          <div className="text-center">
            <span className="font-sans-ui text-xs text-espresso/40">
              {answers.length} / {session.players.length} voted
            </span>
            {allIn && <p className="font-display italic text-espresso/60 text-sm mt-1 animate-fade-in">Everyone voted 👀</p>}
          </div>
        )}

        {isHost && (
          <div className="pb-6 flex flex-col gap-3 mt-2">
            <div className="divider-gold" />
            {!revealed ? (
              <button className="btn-gold w-full py-3.5 mt-2" onClick={handleReveal}>
                Reveal Results
              </button>
            ) : (
              <button className="btn-primary w-full py-3.5 mt-2" onClick={onNextQuestion}>
                {round.currentQuestionIndex < round.questions.length - 1 ? 'Next Question →' : 'End Round →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

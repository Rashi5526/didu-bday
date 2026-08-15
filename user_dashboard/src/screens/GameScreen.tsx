import { useEffect, useRef } from 'react'
import { useSessionSync, patchSession, setRoundPhase, advanceQuestion } from '../lib/storage'
import type { RoundId } from '../types'
import RoundIntro from '../rounds/RoundIntro'
import QuizRound from '../rounds/QuizRound'
import WhoSaidThisRound from '../rounds/WhoSaidThisRound'
import ActLikeHerRound from '../rounds/ActLikeHerRound'
import MostLikelyRound from '../rounds/MostLikelyRound'
import MemoryRound from '../rounds/MemoryRound'
import HeartRound from '../rounds/HeartRound'
import PhotoRound from '../rounds/PhotoRound'
import FinalMemoryRound from '../rounds/FinalMemoryRound'

interface GameScreenProps {
  roomCode: string
  myPlayerId: string
  onLeaderboard: () => void
}

export default function GameScreen({ roomCode, myPlayerId, onLeaderboard }: GameScreenProps) {
  const { session, setSession } = useSessionSync(roomCode, 400)
  const leaderboardFiredRef = useRef(false)

  useEffect(() => {
    if (session?.phase === 'leaderboard' && !leaderboardFiredRef.current) {
      leaderboardFiredRef.current = true
      onLeaderboard()
    }
  }, [session, onLeaderboard])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-espresso/40 font-sans-ui text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  const myPlayer = session.players.find(p => p.id === myPlayerId)
  const isHost = myPlayer?.isHost ?? false
  const roundIndex = session.currentRoundIndex
  const round = session.rounds[roundIndex]

  if (!round) {
    if (isHost) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ivory px-6">
          <p className="font-display text-3xl italic text-espresso text-center">All rounds complete!</p>
          <button className="btn-primary px-10 py-4" onClick={() => {
            const updated = { ...session, phase: 'leaderboard' as const }
            setSession(updated)
          }}>
            See Final Scores →
          </button>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <p className="font-sans-ui text-sm text-espresso/50">Waiting for host…</p>
      </div>
    )
  }

  const handleRoundIntroStart = async () => {
    const s = await setRoundPhase(roomCode, roundIndex, 'active')
    if (s) setSession(s)
  }

  const handleNextQuestion = async () => {
    const s = await advanceQuestion(roomCode, roundIndex)
    if (s) {
      if (s.rounds[roundIndex].phase === 'complete') {
        // Move to next round or leaderboard
        const nextRoundIndex = roundIndex + 1
        if (nextRoundIndex < s.rounds.length) {
          s.currentRoundIndex = nextRoundIndex
          s.rounds[nextRoundIndex].phase = 'intro'
        } else {
          s.phase = 'leaderboard'
        }
        s.updatedAt = Date.now()
      }
      setSession(s)
    }
  }

  const handleNextRound = () => {
    const nextRoundIndex = roundIndex + 1
    if (nextRoundIndex < session.rounds.length) {
      const updated = {
        ...session,
        currentRoundIndex: nextRoundIndex,
        updatedAt: Date.now(),
      }
      updated.rounds[nextRoundIndex].phase = 'intro'
      setSession(updated)
    } else {
      const updated = { ...session, phase: 'leaderboard' as const, updatedAt: Date.now() }
      setSession(updated)
    }
  }

  const sharedProps = {
    session,
    round,
    roundIndex,
    myPlayer: myPlayer ?? null,
    isHost,
    roomCode,
    setSession,
    onNextQuestion: handleNextQuestion,
    onNextRound: handleNextRound,
  }

  if (round.phase === 'intro') {
    return <RoundIntro round={round} isHost={isHost} onStart={handleRoundIntroStart} />
  }

  const roundComponents: Record<RoundId, React.ReactNode> = {
    'quiz':         <QuizRound {...sharedProps} />,
    'who-said-this': <WhoSaidThisRound {...sharedProps} />,
    'act-like-her': <ActLikeHerRound {...sharedProps} />,
    'most-likely':  <MostLikelyRound {...sharedProps} />,
    'memory':       <MemoryRound {...sharedProps} />,
    'heart':        <HeartRound {...sharedProps} />,
    'photo':        <PhotoRound {...sharedProps} />,
    'final-memory': <FinalMemoryRound {...sharedProps} />,
  }

  return <>{roundComponents[round.id]}</>
}

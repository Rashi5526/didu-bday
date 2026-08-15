import type { GameSession, RoundDef, Player } from '../types'

export interface RoundProps {
  session: GameSession
  round: RoundDef
  roundIndex: number
  myPlayer: Player | null
  isHost: boolean
  roomCode: string
  setSession: (s: GameSession) => void
  onNextQuestion: () => void
  onNextRound: () => void
}

export function getAnswersForQuestion(session: GameSession, questionId: string) {
  return session.answers.filter(a => a.questionId === questionId)
}

export function myAnswerForQuestion(session: GameSession, playerId: string, questionId: string) {
  return session.answers.find(a => a.playerId === playerId && a.questionId === questionId)
}

export function allPlayersAnswered(session: GameSession, questionId: string) {
  const submitted = new Set(
    session.answers.filter(a => a.questionId === questionId).map(a => a.playerId)
  )
  return session.players.every(p => submitted.has(p.id))
}

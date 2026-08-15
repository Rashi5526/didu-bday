export type AppScreen =
  | 'landing'
  | 'create-game'
  | 'join-game'
  | 'waiting-room'
  | 'game'
  | 'leaderboard'
  | 'finale'

export type GamePhase =
  | 'waiting'
  | 'playing'
  | 'leaderboard'
  | 'finale'

export type RoundPhase =
  | 'intro'
  | 'active'
  | 'all-submitted'
  | 'reveal'
  | 'scoring'
  | 'complete'

export type RoundId =
  | 'quiz'
  | 'who-said-this'
  | 'act-like-her'
  | 'most-likely'
  | 'memory'
  | 'heart'
  | 'photo'
  | 'final-memory'

export interface Player {
  id: string
  name: string
  isHost: boolean
  isBirthdayGirl: boolean
  score: number
  color: string
  joinedAt: number
}

export interface Question {
  id: string
  text?: string
  options?: string[]
  correctAnswer?: string
  category?: string
  statement?: string
  prompt?: string
  photoUrl?: string
  photoYear?: string
  photoLocation?: string
  photoStory?: string
}

export interface Answer {
  playerId: string
  questionId: string
  roundId: RoundId
  value: string
  markedScore?: number
  submittedAt: number
}

export interface RoundDef {
  id: RoundId
  label: string
  number: string
  tagline: string
  description: string
  backgroundMode: 'light' | 'blush' | 'dark' | 'warm-dark'
  questions: Question[]
  currentQuestionIndex: number
  phase: RoundPhase
}

export interface GameSession {
  id: string
  roomCode: string
  birthdayGirlName: string
  hostId: string
  hostName: string
  birthdayMessage: string
  phase: GamePhase
  currentRoundIndex: number
  players: Player[]
  rounds: RoundDef[]
  answers: Answer[]
  revealedQuestionIds: string[]
  createdAt: number
  updatedAt: number
}

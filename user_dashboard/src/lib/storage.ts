import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient, type RealtimeChannel } from '@supabase/supabase-js'
import type { GameSession, Player, Answer, RoundPhase } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Add them to a .env file (see .env.example) or your Vercel project env vars.'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

const TABLE = 'game_sessions'

/* ---------- Core session read/write (now backed by Supabase, not localStorage) ---------- */

export async function saveSession(session: GameSession): Promise<void> {
  const updated = { ...session, updatedAt: Date.now() }
  const { error } = await supabase
    .from(TABLE)
    .upsert({ room_code: updated.roomCode.toUpperCase(), data: updated }, { onConflict: 'room_code' })
  if (error) console.error('saveSession error:', error.message)
}

export async function loadSession(roomCode: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('room_code', roomCode.toUpperCase())
    .maybeSingle()
  if (error) {
    console.error('loadSession error:', error.message)
    return null
  }
  return (data?.data as GameSession) ?? null
}

export async function deleteSession(roomCode: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('room_code', roomCode.toUpperCase())
  if (error) console.error('deleteSession error:', error.message)
}

/* ---------- Room codes / player ids ---------- */

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function generatePlayerId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/* ---------- "Who am I" identity — intentionally stays per-device in sessionStorage ---------- */

const PLAYER_KEY = 'bgn:me'

export function saveMyIdentity(playerId: string, roomCode: string): void {
  sessionStorage.setItem(PLAYER_KEY, JSON.stringify({ playerId, roomCode }))
}

export function loadMyIdentity(): { playerId: string; roomCode: string } | null {
  const raw = sessionStorage.getItem(PLAYER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearMyIdentity(): void {
  sessionStorage.removeItem(PLAYER_KEY)
}

/* ---------- Mutations: read-modify-write against Supabase ---------- */

export async function submitAnswer(roomCode: string, answer: Answer): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  const existing = session.answers.findIndex(
    a => a.playerId === answer.playerId && a.questionId === answer.questionId
  )
  if (existing >= 0) {
    session.answers[existing] = answer
  } else {
    session.answers.push(answer)
  }
  await saveSession(session)
  return session
}

export async function patchSession(roomCode: string, patch: Partial<GameSession>): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  const updated = { ...session, ...patch, updatedAt: Date.now() }
  await saveSession(updated)
  return updated
}

export async function addPlayerToSession(roomCode: string, player: Player): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  const exists = session.players.find(p => p.id === player.id)
  if (!exists) {
    session.players.push(player)
    await saveSession(session)
  }
  return session
}

export async function awardPoints(
  roomCode: string,
  playerId: string,
  questionId: string,
  points: number
): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  const answer = session.answers.find(
    a => a.playerId === playerId && a.questionId === questionId
  )
  if (answer) answer.markedScore = points
  const player = session.players.find(p => p.id === playerId)
  if (player) player.score = session.answers
    .filter(a => a.playerId === playerId && a.markedScore !== undefined)
    .reduce((sum, a) => sum + (a.markedScore ?? 0), 0)
  await saveSession(session)
  return session
}

export async function setRoundPhase(roomCode: string, roundIndex: number, phase: RoundPhase): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  session.rounds[roundIndex].phase = phase
  await saveSession(session)
  return session
}

export async function advanceQuestion(roomCode: string, roundIndex: number): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  const round = session.rounds[roundIndex]
  if (round.currentQuestionIndex < round.questions.length - 1) {
    round.currentQuestionIndex++
    round.phase = 'active'
  } else {
    round.phase = 'complete'
  }
  await saveSession(session)
  return session
}

export async function revealQuestion(roomCode: string, questionId: string): Promise<GameSession | null> {
  const session = await loadSession(roomCode)
  if (!session) return null
  if (!session.revealedQuestionIds.includes(questionId)) {
    session.revealedQuestionIds.push(questionId)
  }
  await saveSession(session)
  return session
}

/* ---------- Hook: live-sync a room's session across every connected device ----------
   Uses Supabase Realtime (Postgres changes) to push updates instantly, with a slow
   background poll as a safety net in case a realtime event is ever missed. */
export function useSessionSync(roomCode: string | null, intervalMs = 4000) {
  const [session, setSessionState] = useState<GameSession | null>(null)

  useEffect(() => {
    if (!roomCode) {
      setSessionState(null)
      return
    }
    let cancelled = false
    const code = roomCode.toUpperCase()

    loadSession(code).then(s => {
      if (!cancelled) setSessionState(s)
    })

    // Multiple components (App + the active screen) may run this hook at the
    // same time for the same room. Supabase Realtime channels are keyed by
    // name, so two channels named identically ("session-<code>") collide the
    // instant the second one tries to subscribe, throwing an uncaught error
    // that freezes the whole app. A random suffix keeps every subscription's
    // channel name unique while still filtering on the same room_code.
    const uniqueChannelName = `session-${code}-${Math.random().toString(36).slice(2, 8)}`

    const channel: RealtimeChannel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: `room_code=eq.${code}` },
        payload => {
          if (payload.eventType === 'DELETE') {
            setSessionState(null)
            return
          }
          const row = payload.new as { data?: GameSession } | undefined
          if (row?.data) setSessionState(row.data)
        }
      )
      .subscribe()

    // Safety-net poll — realtime should make this redundant, but keeps things
    // working even if a Realtime event is dropped or the socket briefly drops.
    const poll = setInterval(() => {
      loadSession(code).then(s => {
        if (!cancelled && s) setSessionState(s)
      })
    }, intervalMs)

    return () => {
      cancelled = true
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [roomCode, intervalMs])

  const setSession = useCallback((s: GameSession) => {
    setSessionState(s)
    void saveSession(s)
  }, [])

  return { session, setSession }
}

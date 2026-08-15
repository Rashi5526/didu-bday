import { useState, useEffect } from 'react'
import type { AppScreen, GameSession } from './types'
import { loadMyIdentity, loadSession, saveSession, useSessionSync } from './lib/storage'

import LandingScreen from './screens/LandingScreen'
import CreateGameScreen from './screens/CreateGameScreen'
import JoinGameScreen from './screens/JoinGameScreen'
import WaitingRoomScreen from './screens/WaitingRoomScreen'
import GameScreen from './screens/GameScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import FinaleScreen from './screens/FinaleScreen'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing')
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const { session, setSession } = useSessionSync(roomCode)

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const identity = loadMyIdentity()

    const restore = async () => {
      if (identity) {
        const s = await loadSession(identity.roomCode)
        if (s) {
          setRoomCode(identity.roomCode)
          setMyPlayerId(identity.playerId)
          if (s.phase === 'waiting') setScreen('waiting-room')
          else if (s.phase === 'playing') setScreen('game')
          else if (s.phase === 'leaderboard') setScreen('leaderboard')
          else if (s.phase === 'finale') setScreen('finale')
        }
      }

      // Check for join code in URL
      const params = new URLSearchParams(window.location.search)
      const joinCode = params.get('join')
      if (joinCode && !identity) {
        setScreen('join-game')
      }
    }

    void restore()
  }, [])

  // Follow game phase changes from session sync
  useEffect(() => {
    if (!session) return
    if (session.phase === 'playing' && screen === 'waiting-room') setScreen('game')
    if (session.phase === 'leaderboard' && screen === 'game') setScreen('leaderboard')
    if (session.phase === 'finale' && screen === 'leaderboard') setScreen('finale')
  }, [session?.phase])

  const myPlayer = session?.players.find(p => p.id === myPlayerId)
  const isHost = myPlayer?.isHost ?? false

  const handleGameCreated = async (code: string) => {
    setRoomCode(code)
    const s = await loadSession(code)
    const pid = s?.players[0]?.id ?? null
    setMyPlayerId(pid)
    setScreen('waiting-room')
  }

  const handleJoined = (code: string) => {
    setRoomCode(code)
    const identity = loadMyIdentity()
    setMyPlayerId(identity?.playerId ?? null)
    setScreen('waiting-room')
  }

  const handleRestart = () => {
    setRoomCode(null)
    setMyPlayerId(null)
    setScreen('landing')
    window.history.replaceState({}, '', window.location.pathname)
  }

  const urlJoinCode = new URLSearchParams(window.location.search).get('join') ?? ''

  if (screen === 'landing') {
    return <LandingScreen onHost={() => setScreen('create-game')} onJoin={() => setScreen('join-game')} />
  }

  if (screen === 'create-game') {
    return <CreateGameScreen onGameCreated={handleGameCreated} onBack={() => setScreen('landing')} />
  }

  if (screen === 'join-game') {
    return <JoinGameScreen onJoined={handleJoined} onBack={() => setScreen('landing')} prefillCode={urlJoinCode} />
  }

  if (screen === 'waiting-room' && roomCode && myPlayerId) {
    return (
      <WaitingRoomScreen
        roomCode={roomCode}
        myPlayerId={myPlayerId}
        onGameStart={() => setScreen('game')}
      />
    )
  }

  if (screen === 'game' && roomCode && myPlayerId) {
    return (
      <GameScreen
        roomCode={roomCode}
        myPlayerId={myPlayerId}
        onLeaderboard={() => setScreen('leaderboard')}
      />
    )
  }

  if (screen === 'leaderboard' && session && roomCode && myPlayerId) {
    return (
      <LeaderboardScreen
        session={session}
        myPlayerId={myPlayerId}
        isHost={isHost}
        roomCode={roomCode}
        setSession={setSession}
        onFinale={() => setScreen('finale')}
      />
    )
  }

  if (screen === 'finale' && session && roomCode) {
    return (
      <FinaleScreen
        session={session}
        isHost={isHost}
        roomCode={roomCode}
        onRestart={handleRestart}
      />
    )
  }

  // Fallback
  return <LandingScreen onHost={() => setScreen('create-game')} onJoin={() => setScreen('join-game')} />
}

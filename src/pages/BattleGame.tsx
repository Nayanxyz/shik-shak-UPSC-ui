import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Clock, Trophy, Zap, ArrowRight, CheckCircle, XCircle, Crown, Target, LogOut, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'
import { getSocket, disconnectSocket } from '../lib/socket'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import MathHtml from '../components/MathHtml'

export default function BattleGame() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.user)

  const [phase, setPhase] = useState<'playing' | 'results' | 'leaderboard' | 'finished'>('playing')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [finalRankings, setFinalRankings] = useState<any[]>([])
  const [nextQuestionIn, setNextQuestionIn] = useState(3)
  const [showExit, setShowExit] = useState(false)
  const [disconnected, setDisconnected] = useState(false)
  const [error, setError] = useState('')

  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Socket listeners — attach once
  useEffect(() => {
    const socket = getSocket()

    const onQuestionStart = (data: any) => {
      useGameStore.getState().setQuestion(data, data.total_questions)
      setPhase('playing')
      setHasAnswered(false)
      setSelectedOption(null)
      startTimeRef.current = Date.now()
    }

    const onTimerTick = (data: { remaining: number }) => {
      useGameStore.getState().setTimeRemaining(data.remaining)
    }

    const onQuestionResults = (data: any) => {
      useGameStore.getState().setQuestionResults(data)
      setPhase('results')
    }

    const onLeaderboard = (data: any) => {
      setLeaderboard(data.rankings)
      setNextQuestionIn(data.next_question_in || 3)
      setPhase('leaderboard')

      if (timerRef.current) clearInterval(timerRef.current)
      let remaining = data.next_question_in || 3
      timerRef.current = setInterval(() => {
        remaining -= 1
        setNextQuestionIn(remaining)
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }, 1000)
    }

    const onGameOver = (data: any) => {
      useGameStore.getState().setFinalRankings(data.rankings)
      setFinalRankings(data.rankings)
      setPhase('finished')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    const onKicked = () => {
      setError('You were kicked')
      setTimeout(() => navigate('/battle/lobby'), 2000)
    }

    const onError = (data: any) => setError(data.message || 'Error')

    const onConnect = () => {
      setDisconnected(false)
      if (roomCode && authUser?.id) {
        socket.emit('rejoin_room', { room_code: roomCode, user_id: authUser.id })
      }
    }

    const onDisconnect = () => setDisconnected(true)

    socket.on('question_start', onQuestionStart)
    socket.on('timer_tick', onTimerTick)
    socket.on('question_results', onQuestionResults)
    socket.on('leaderboard', onLeaderboard)
    socket.on('game_over', onGameOver)
    socket.on('kicked', onKicked)
    socket.on('error', onError)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    if (socket.connected && roomCode && authUser?.id) {
      socket.emit('rejoin_room', { room_code: roomCode, user_id: authUser.id })
    }

    return () => {
      socket.off('question_start', onQuestionStart)
      socket.off('timer_tick', onTimerTick)
      socket.off('question_results', onQuestionResults)
      socket.off('leaderboard', onLeaderboard)
      socket.off('game_over', onGameOver)
      socket.off('kicked', onKicked)
      socket.off('error', onError)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, roomCode, authUser?.id])

  const submitAnswer = useCallback((option: string | null) => {
    if (hasAnswered) return
    const socket = getSocket()
    const store = useGameStore.getState()
    if (!socket.connected || !store.roomCode) return

    setHasAnswered(true)
    setSelectedOption(option)

    socket.emit('submit_answer', {
      room_code: store.roomCode,
      question_number: store.currentQuestion,
      selected_option: option,
      time_taken_ms: Date.now() - startTimeRef.current,
    })
  }, [hasAnswered])

  const handleExit = () => {
    const socket = getSocket()
    const store = useGameStore.getState()
    if (socket && store.roomCode) {
      socket.emit('leave_room', { room_code: store.roomCode })
    }
    useGameStore.getState().reset()
    disconnectSocket()
    navigate('/battle/lobby')
  }

  const question = useGameStore((s) => s.questions[s.currentQuestion - 1])
  const currentQ = useGameStore((s) => s.currentQuestion)
  const totalQ = useGameStore((s) => s.totalQuestions)
  const timeRemaining = useGameStore((s) => s.timeRemaining)
  const questionResults = useGameStore((s) => s.questionResults)

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence>
        {showExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-yellow-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Leave Battle?</h3>
              </div>
              <p className="text-slate-400">
                {phase === 'finished' ? "Return to lobby?" : "You'll forfeit the battle."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExit(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium"
                >
                  Stay
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


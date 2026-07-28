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


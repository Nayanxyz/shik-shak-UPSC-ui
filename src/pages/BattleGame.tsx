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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-slate-300">Room: {roomCode}</span>
        </div>
        <button
          onClick={() => setShowExit(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" /> Exit
        </button>
      </div>

      {disconnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4 animate-spin" /> Reconnecting...
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'playing' && question && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Swords className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold">Q{currentQ} / {totalQ}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm",
                timeRemaining <= 10 ? "bg-red-500/20 text-red-300" : "bg-slate-800"
              )}>
                <Clock className="w-4 h-4" /> {timeRemaining}s
              </div>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                animate={{ width: `${(currentQ / totalQ) * 100}%` }}
              />
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <MathHtml html={question.question_text} className="text-lg font-medium leading-relaxed" />
            </div>

            <div className="space-y-3">
              {question.options.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => !hasAnswered && submitAnswer(opt.id)}
                  disabled={hasAnswered}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    hasAnswered
                      ? selectedOption === opt.id
                        ? "border-indigo-500 bg-indigo-500/20"
                        : "border-slate-800 opacity-50"
                      : "border-slate-700 hover:border-indigo-500 hover:bg-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      selectedOption === opt.id ? "bg-indigo-500 text-white" : "bg-slate-800"
                    )}>
                      {opt.id}
                    </span>
                    <MathHtml html={opt.text} />
                  </div>
                </button>
              ))}
            </div>

            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-indigo-300">
                  <Zap className="w-5 h-5" /> Answer submitted! Waiting for others...
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'results' && questionResults && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Question Results</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300">
                <Target className="w-4 h-4" /> Correct Answer: {questionResults.correct_option}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <MathHtml html={questionResults.explanation || ''} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              {questionResults.player_results?.map((p: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    p.is_correct ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {p.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className={cn("font-mono font-bold", p.is_correct ? "text-green-300" : "text-red-300")}>
                    +{p.score_gained}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard
              </h2>
              <p className="text-slate-400">Next question in {nextQuestionIn}s</p>
            </div>
            <div className="space-y-2">
              {leaderboard.map((p: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    i === 0 ? "bg-yellow-500/10 border-yellow-500/30" :
                    i === 1 ? "bg-slate-400/10 border-slate-400/30" :
                    i === 2 ? "bg-orange-500/10 border-orange-500/30" :
                    "bg-slate-900 border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      i === 0 ? "bg-yellow-500 text-yellow-950" :
                      i === 1 ? "bg-slate-400 text-slate-950" :
                      i === 2 ? "bg-orange-500 text-orange-950" :
                      "bg-slate-800 text-slate-400"
                    )}>
                      {i === 0 ? <Crown className="w-5 h-5" /> : i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.correct_count} correct • {p.accuracy}% accuracy</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-indigo-300">{p.total_score || p.score}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'finished' && (
          <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold">Battle Complete!</h2>
              <p className="text-slate-400 mt-2">Here are the final standings</p>
            </div>
            <div className="space-y-3">
              {finalRankings.map((p: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border",
                    i === 0 ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30" :
                    i === 1 ? "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/30" :
                    i === 2 ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30" :
                    "bg-slate-900 border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      i === 0 ? "bg-yellow-500 text-yellow-950" :
                      i === 1 ? "bg-slate-400 text-slate-950" :
                      i === 2 ? "bg-orange-500 text-orange-950" :
                      "bg-slate-800 text-slate-400"
                    )}>
                      {i === 0 ? <Crown className="w-6 h-6" /> : i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{p.name}</div>
                      <div className="text-sm text-slate-400">
                        {p.correct_count}/{p.correct_count + p.wrong_count + p.unanswered_count} correct • {p.accuracy}% accuracy • Streak: {p.max_streak}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-300">{p.total_score || p.score}</div>
                    <div className="text-sm text-slate-400">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/battle/lobby')}
                className="flex-1 py-4 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-5 h-5" /> New Battle
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" /> Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
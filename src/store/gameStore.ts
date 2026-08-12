import { create } from 'zustand'

interface Question {
  question_number: number
  question_text: string
  options: { id: string; text: string }[]
  time_limit?: number
}

interface GameState {
  roomCode: string | null
  isHost: boolean
  players: any[]
  currentQuestion: number
  totalQuestions: number
  timeRemaining: number
  questions: Question[]
  questionResults: any
  finalRankings: any[]
  setRoom: (code: string | null, isHost: boolean) => void
  setPlayers: (players: any[]) => void
  setQuestion: (q: Question, total: number) => void
  setTimeRemaining: (t: number) => void
  setQuestionResults: (r: any) => void
  setFinalRankings: (r: any[]) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  roomCode: null,
  isHost: false,
  players: [],
  currentQuestion: 0,
  totalQuestions: 5,
  timeRemaining: 60,
  questions: [],
  questionResults: null,
  finalRankings: [],

  setRoom: (code, isHost) => set({ roomCode: code, isHost }),
  setPlayers: (players) => set({ players }),

  setQuestion: (q, total) => set((state) => {
    const nextQuestions = q.question_number === 1 ? [q] : [...state.questions, q]
    return {
      currentQuestion: q.question_number,
      totalQuestions: total,
      questions: nextQuestions,
      timeRemaining: q.time_limit || 60,
      questionResults: null,
    }
  }),


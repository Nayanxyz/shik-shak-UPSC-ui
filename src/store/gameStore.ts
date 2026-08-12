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

import { create } from 'zustand'

interface Question {
  question_number: number
  question_text: string
  options: { id: string; text: string }[]
  time_limit?: number
}


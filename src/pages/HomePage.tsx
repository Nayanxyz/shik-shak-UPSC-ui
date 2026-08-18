import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Swords,  Target, Users, Clock, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const features = [
  { icon: <Brain className="w-6 h-6" />, title: 'AI-Powered Questions & PYQs ', desc: 'Shik Shak LLM generates fresh JEE/NEET MCQs every time' },
  { icon: <Target className="w-6 h-6" />, title: 'Smart Validation', desc: 'Math/Physics checked with SymPy, Chemistry with PubChem' },
  { icon: <Users className="w-6 h-6" />, title: 'Live Battles', desc: 'Compete with up to 4 players in real-time' },
  { icon: <Clock className="w-6 h-6" />, title: 'Timely Practice', desc: 'Time is of essence , experience the rush!' },
]

const subjects = [
  { id: 'MATH', name: 'Mathematics', color: 'from-blue-500 to-cyan-500', icon: '∫', bg: 'from-blue-500/10 to-cyan-500/10' },
  { id: 'PHYSICS', name: 'Physics', color: 'from-orange-500 to-red-500', icon: '⚡', bg: 'from-orange-500/10 to-red-500/10' },
  { id: 'CHEMISTRY', name: 'Chemistry', color: 'from-green-500 to-emerald-500', icon: '⚗️', bg: 'from-green-500/10 to-emerald-500/10' },
  { id: 'BIOLOGY', name: 'Biology', color: 'from-pink-500 to-rose-500', icon: '🧬', bg: 'from-pink-500/10 to-rose-500/10' },
]


import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, Zap, BookOpen, Dices } from 'lucide-react'
import { cn } from '../lib/utils'
import MathHtml from '../components/MathHtml'
import { apiFetch } from '../lib/api'

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const
const DIFFICULTIES = ['LOW', 'HIGH'] as const


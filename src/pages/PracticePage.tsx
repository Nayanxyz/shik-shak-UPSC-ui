import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, Zap, BookOpen, Dices } from 'lucide-react'
import { cn } from '../lib/utils'
import MathHtml from '../components/MathHtml'
import { apiFetch } from '../lib/api'

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const
const DIFFICULTIES = ['LOW', 'HIGH'] as const

const MASTER_CHAPTER_DATABASE: Record<string, { id: string; name: string }[]> = {
  MATH: [
    { id: 'M1101', name: 'Sets, Relations and Functions' },
    { id: 'M1102', name: 'Trigonometric Functions' },
    { id: 'M1103', name: 'Complex Numbers and Quadratic Equations' },
    { id: 'M1104', name: 'Linear Inequalities' },
    { id: 'M1105', name: 'Permutations and Combinations' },
    { id: 'M1106', name: 'Binomial Theorem' },
    { id: 'M1107', name: 'Sequences and Series' },
    { id: 'M1108', name: 'Straight Lines' },
    { id: 'M1109', name: 'Conic Sections' },
    { id: 'M1110', name: 'Introduction to Three-Dimensional Geometry' },
    { id: 'M1111', name: 'Limits and Derivatives' },
    { id: 'M1112', name: 'Statistics and Probability' },
    { id: 'M1201', name: 'Inverse Trigonometric Functions' },
    { id: 'M1202', name: 'Matrices and Determinants' },
    { id: 'M1203', name: 'Continuity and Differentiability' },
    { id: 'M1204', name: 'Application of Derivatives' },
    { id: 'M1205', name: 'Integrals (Definite and Indefinite)' },
    { id: 'M1206', name: 'Application of Integrals' },
    { id: 'M1207', name: 'Differential Equations' },
    { id: 'M1208', name: 'Vector Algebra' },
    { id: 'M1209', name: 'Three-Dimensional Geometry (Vectors)' },
    { id: 'M1210', name: 'Linear Programming' },
    { id: 'M1211', name: 'Probability (Advanced)' }
  ],

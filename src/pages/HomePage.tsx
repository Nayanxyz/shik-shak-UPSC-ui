import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Swords, Target, Users, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const features = [
  { icon: <Brain className="w-6 h-6" />, title: 'AI-Powered Questions', desc: 'Groq LLM generates fresh JEE/NEET MCQs every time' },
  { icon: <Target className="w-6 h-6" />, title: 'Smart Validation', desc: 'Math/Physics checked with SymPy, Chemistry with PubChem' },
  { icon: <Users className="w-6 h-6" />, title: 'Live Battles', desc: 'Compete with up to 4 players in real-time' },
  { icon: <Clock className="w-6 h-6" />, title: 'Time Bonuses', desc: 'Answer fast for extra points — speed matters!' },
];


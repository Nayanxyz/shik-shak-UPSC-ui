import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Crown, Swords, ArrowRight, Zap, Target, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/gameStore';

export default function BattleResultsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const rankings = useGameStore((s) => s.finalRankings) || [];

  useEffect(() => {
    if (!rankings.length) navigate('/battle/lobby');
  }, [rankings, navigate]);

  if (!rankings.length) return null;


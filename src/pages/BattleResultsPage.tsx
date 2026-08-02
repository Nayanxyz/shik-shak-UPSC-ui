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

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">Battle Complete!</h1>
          <p className="text-slate-400 mt-2">Room: {roomCode}</p>
        </div>

        {rankings[0] && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border border-yellow-500/30 text-center">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg text-yellow-300 font-semibold">Winner</div>
            <div className="text-2xl font-bold mt-1">{rankings[0].name}</div>
            <div className="text-slate-400 mt-1">{rankings[0].total_score || rankings[0].score} points • {rankings[0].accuracy}% accuracy</div>
          </motion.div>
        )}


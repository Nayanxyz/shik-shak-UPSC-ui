import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, CheckCircle, XCircle, RotateCcw, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiFetch } from '../lib/api';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(location.search).get('sessionId');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) { navigate('/practice'); return; }
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const data = await apiFetch('/api/practice/finish', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      });
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400">Loading results...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Failed to load results</h2>
      <p className="text-slate-400 mb-6">{error}</p>
      <button onClick={() => navigate('/practice')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold">Try Again</button>
    </div>
  );

  const accuracy = results?.accuracy || 0;
  const totalScore = results?.total_score || 0;
  const correct = results?.correct || 0;
  const wrong = results?.wrong || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">Practice Complete!</h1>
          <p className="text-slate-400 mt-2">Here's how you performed</p>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 text-center">
          <div className="text-6xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{totalScore}</div>
          <div className="text-slate-400 mt-2">Total Score</div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-300">{correct}</div>
            <div className="text-xs text-slate-400">Correct</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-300">{wrong}</div>
            <div className="text-xs text-slate-400">Wrong</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-300">{correct + wrong}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <Target className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-300">{accuracy}%</div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </div>
        </div>


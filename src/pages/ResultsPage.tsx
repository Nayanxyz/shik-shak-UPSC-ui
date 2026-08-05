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


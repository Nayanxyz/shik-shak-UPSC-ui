import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Earth, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const loadUser = useAuthStore((s) => s.loadUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (isSignUp && !username.trim()) { setError('Username required'); setLoading(false); return; }

    const { error: authError } = isSignUp
      ? await signUpWithEmail(email, password, username)
      : await signInWithEmail(email, password);

    if (authError) setError(authError.message);
    else { await loadUser(); navigate('/'); }
    setLoading(false);
  };


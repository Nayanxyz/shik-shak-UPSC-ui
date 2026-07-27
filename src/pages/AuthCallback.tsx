import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) { console.error('Auth callback error:', error); navigate('/login'); return; }
      if (session) { await loadUser(); navigate('/'); }
      else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) { await loadUser(); navigate('/'); }
        });
        unsubscribe = () => subscription.unsubscribe();
      }
    };

    handleAuthCallback();
    return () => { unsubscribe?.(); };
  }, [loadUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
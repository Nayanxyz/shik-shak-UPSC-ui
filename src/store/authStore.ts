import { create } from 'zustand'
import { getCurrentUser, signOut as sbSignOut } from '../lib/supabase'

interface User {
  id: string
  email: string
  username: string
}

interface AuthState {
  user: User | null
  loading: boolean
  loadUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  loadUser: async () => {
    const u = await getCurrentUser()
    if (!u) { set({ user: null, loading: false }); return }
    const meta = u.user_metadata || {}
    set({
      user: {
        id: u.id,
        email: u.email!,
        username: meta.username || u.email!.split('@')[0],
      },
      loading: false,
    })
  },


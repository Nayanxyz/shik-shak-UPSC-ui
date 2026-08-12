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


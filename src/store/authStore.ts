import { create } from 'zustand'
import { getCurrentUser, signOut as sbSignOut } from '../lib/supabase'

interface User {
  id: string
  email: string
  username: string
}


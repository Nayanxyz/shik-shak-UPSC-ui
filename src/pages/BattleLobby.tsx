import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, Clock, Plus, LogIn, Copy, Check, LogOut, Crown, UserX, RefreshCw, AlertCircle, Zap, BookOpen, Dices } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSocket, disconnectSocket } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';

const SUBJECTS = ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
const DIFFICULTIES = ['LOW', 'HIGH'] as const;


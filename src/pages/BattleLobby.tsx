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

const MASTER_CHAPTER_DATABASE: Record<string, { id: string; name: string }[]> = {
  MATH: [
    { id: 'M1101', name: 'Sets, Relations and Functions' },
    { id: 'M1102', name: 'Trigonometric Functions' },
    { id: 'M1103', name: 'Complex Numbers and Quadratic Equations' },
    { id: 'M1104', name: 'Linear Inequalities' },
    { id: 'M1105', name: 'Permutations and Combinations' },
    { id: 'M1106', name: 'Binomial Theorem' },
    { id: 'M1107', name: 'Sequences and Series' },
    { id: 'M1108', name: 'Straight Lines' },
    { id: 'M1109', name: 'Conic Sections' },
    { id: 'M1110', name: 'Introduction to Three-Dimensional Geometry' },
    { id: 'M1111', name: 'Limits and Derivatives' },
    { id: 'M1112', name: 'Statistics and Probability' },
    { id: 'M1201', name: 'Inverse Trigonometric Functions' },
    { id: 'M1202', name: 'Matrices and Determinants' },
    { id: 'M1203', name: 'Continuity and Differentiability' },
    { id: 'M1204', name: 'Application of Derivatives' },
    { id: 'M1205', name: 'Integrals (Definite and Indefinite)' },
    { id: 'M1206', name: 'Application of Integrals' },
    { id: 'M1207', name: 'Differential Equations' },
    { id: 'M1208', name: 'Vector Algebra' },
    { id: 'M1209', name: 'Three-Dimensional Geometry (Vectors)' },
    { id: 'M1210', name: 'Linear Programming' },
    { id: 'M1211', name: 'Probability (Advanced)' }
  ],
  PHYSICS: [
    { id: 'P1101', name: 'Units and Measurements' },
    { id: 'P1102', name: 'Motion in a Straight Line' },
    { id: 'P1103', name: 'Motion in a Plane (Vectors & Projectiles)' },
    { id: 'P1104', name: 'Laws of Motion and Friction' },
    { id: 'P1105', name: 'Work, Energy and Power' },
    { id: 'P1106', name: 'System of Particles and Rotational Motion' },
    { id: 'P1107', name: 'Gravitation' },
    { id: 'P1108', name: 'Mechanical Properties of Solids' },
    { id: 'P1109', name: 'Mechanical Properties of Fluids' },
    { id: 'P1110', name: 'Thermal Properties of Matter' },
    { id: 'P1111', name: 'Thermodynamics' },
    { id: 'P1112', name: 'Kinetic Theory of Gases' },
    { id: 'P1113', name: 'Oscillations (SHM)' },
    { id: 'P1114', name: 'Waves and Acoustics' },
    { id: 'P1201', name: 'Electric Charges and Fields' },
    { id: 'P1202', name: 'Electrostatic Potential and Capacitance' },
    { id: 'P1203', name: 'Current Electricity' },
    { id: 'P1204', name: 'Moving Charges and Magnetism' },
    { id: 'P1205', name: 'Magnetism and Matter' },
    { id: 'P1206', name: 'Electromagnetic Induction' },
    { id: 'P1207', name: 'Alternating Current' },
    { id: 'P1208', name: 'Electromagnetic Waves' },
    { id: 'P1209', name: 'Ray Optics and Optical Instruments' },
    { id: 'P1210', name: 'Wave Optics (Interference & Diffraction)' },
    { id: 'P1211', name: 'Dual Nature of Radiation and Matter' },
    { id: 'P1212', name: 'Atoms and Nuclei' },
    { id: 'P1213', name: 'Semiconductor Electronics: Materials and Devices' }
  ],
  CHEMISTRY: [
    { id: 'C1101', name: 'Some Basic Concepts of Chemistry (Mole Concept)' },
    { id: 'C1102', name: 'Structure of Atom' },
    { id: 'C1103', name: 'Classification of Elements and Periodicity' },
    { id: 'C1104', name: 'Chemical Bonding and Molecular Structure' },
    { id: 'C1105', name: 'Chemical Thermodynamics' },
    { id: 'C1106', name: 'Equilibrium (Chemical and Ionic)' },
    { id: 'C1107', name: 'Redox Reactions' },
    { id: 'C1108', name: 'Organic Chemistry: Some Basic Principles and Techniques (GOC)' },
    { id: 'C1109', name: 'Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)' },
    { id: 'C1201', name: 'Solutions' },
    { id: 'C1202', name: 'Electrochemistry' },
    { id: 'C1203', name: 'Chemical Kinetics' },
    { id: 'C1204', name: 'The d- and f-Block Elements' },
    { id: 'C1205', name: 'Coordination Compounds' },
    { id: 'C1206', name: 'Haloalkanes and Haloarenes' },
    { id: 'C1207', name: 'Alcohols, Phenols and Ethers' },
    { id: 'C1208', name: 'Aldehydes, Ketones and Carboxylic Acids' },
    { id: 'C1209', name: 'Amines (Organic Compounds Containing Nitrogen)' },
    { id: 'C1210', name: 'Biomolecules' }
  ],
  BIOLOGY: [
    { id: 'B1101', name: 'The Living World and Biological Classification' },
    { id: 'B1102', name: 'Plant Kingdom' },
    { id: 'B1103', name: 'Animal Kingdom' },
    { id: 'B1104', name: 'Morphology and Anatomy of Flowering Plants' },
    { id: 'B1105', name: 'Structural Organisation in Animals' },
    { id: 'B1106', name: 'Cell: The Unit of Life' },
    { id: 'B1107', name: 'Biomolecules (Biological aspect)' },
    { id: 'B1108', name: 'Cell Cycle and Cell Division' },
    { id: 'B1109', name: 'Photosynthesis in Higher Plants' },
    { id: 'B1110', name: 'Respiration in Plants' },
    { id: 'B1111', name: 'Plant Growth and Development' },
    { id: 'B1112', name: 'Breathing and Exchange of Gases' },
    { id: 'B1113', name: 'Body Fluids and Circulation' },
    { id: 'B1114', name: 'Excretory Products and their Elimination' },
    { id: 'B1115', name: 'Locomotion and Movement' },
    { id: 'B1116', name: 'Neural Control and Coordination' },
    { id: 'B1117', name: 'Chemical Coordination and Integration' },
    { id: 'B1201', name: 'Sexual Reproduction in Flowering Plants' },
    { id: 'B1202', name: 'Human Reproduction and Reproductive Health' },
    { id: 'B1203', name: 'Principles of Inheritance and Variation (Genetics I)' },
    { id: 'B1204', name: 'Molecular Basis of Inheritance (Genetics II)' },
    { id: 'B1205', name: 'Evolution' },
    { id: 'B1206', name: 'Human Health and Disease' },
    { id: 'B1207', name: 'Microbes in Human Welfare' },
    { id: 'B1208', name: 'Biotechnology: Principles and Processes' },
    { id: 'B1209', name: 'Biotechnology and its Applications' },
    { id: 'B1210', name: 'Organisms and Populations' },
    { id: 'B1211', name: 'Ecosystem' },
    { id: 'B1212', name: 'Biodiversity and Conservation' }
  ]
};

function getRandomChapters(subject: string, count = 5) {
  const ch = MASTER_CHAPTER_DATABASE[subject];
  if (!ch || ch.length < count) return [];
  return [...ch].sort(() => Math.random() - 0.5).slice(0, count).map(c => c.id);
}

export default function BattleLobby() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [subject, setSubject] = useState('MATH');
  const [difficulty, setDifficulty] = useState('LOW');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [playerName, setPlayerName] = useState(authUser?.username || '');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);

  const roomCode = useGameStore((s) => s.roomCode);
  const isHost = useGameStore((s) => s.isHost);
  const players = useGameStore((s) => s.players);

  // ─── Socket Listeners (attach ONCE, never reattach) ───
  useEffect(() => {
    const socket = getSocket();
    
    const onRoomCreated = (data: any) => {
      useGameStore.getState().setRoom(data.room_code, data.is_host);
      useGameStore.getState().setPlayers(data.players);
      setIsLoading(false);
      setError('');
    };
    
    const onRoomJoined = (data: any) => {
      useGameStore.getState().setRoom(data.room_code, false);
      useGameStore.getState().setPlayers(data.players);
      setIsLoading(false);
      setError('');
    };
    
    const onPlayerJoined = (data: any) => {
      useGameStore.getState().setPlayers(data.players);
    };
    
    const onPlayerLeft = (data: any) => {
      useGameStore.getState().setPlayers(data.players);
    };
    
    const onQuestionsReady = () => setQuestionsReady(true);
    
    const onKicked = () => {
      useGameStore.getState().reset();
      setMode('menu');
      setError('You were kicked from the room');
    };
    
    const onQuestionStart = () => {
      if (!useGameStore.getState().isHost) {
        const code = useGameStore.getState().roomCode;
        if (code) navigate(`/battle/game/${code}`);
      }
    };
    
    const onError = (data: any) => {
      setError(data.message || 'Server error');
      setIsLoading(false);
    };
    
    const onConnect = () => {
      setDisconnected(false);
      // Try to rejoin if we have a room
      const code = useGameStore.getState().roomCode;
      const uid = authUser?.id;
      if (code && uid) {
        socket.emit('rejoin_room', { room_code: code, user_id: uid });
      }
    };
    
    const onDisconnect = () => setDisconnected(true);
    
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('player_joined', onPlayerJoined);
    socket.on('player_left', onPlayerLeft);
    socket.on('questions_ready', onQuestionsReady);
    socket.on('kicked', onKicked);
    socket.on('question_start', onQuestionStart);
    socket.on('error', onError);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    // If already connected, trigger rejoin immediately
    if (socket.connected) onConnect();
    
    return () => {
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_left', onPlayerLeft);
      socket.off('questions_ready', onQuestionsReady);
      socket.off('kicked', onKicked);
      socket.off('question_start', onQuestionStart);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const toggleChapter = (id: string) => {
    setSelectedChapters(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const randomizeChapters = () => {
    setSelectedChapters(getRandomChapters(subject, 5));
  };

  const createRoom = () => {
    if (selectedChapters.length !== 5 || !playerName.trim()) return;
    const socket = getSocket();
    if (!socket.connected) {
      setError('Not connected to server. Please wait or refresh.');
      return;
    }
    setIsLoading(true);
    setError('');
    setQuestionsReady(false);
    
    socket.emit('create_room', {
      subject,
      difficulty,
      chapter_mix: selectedChapters.map(id => {
        const ch = MASTER_CHAPTER_DATABASE[subject].find(c => c.id === id);
        return { id, name: ch?.name || id };
      }),
      player_name: playerName.trim(),
      user_id: authUser?.id,
      max_players: maxPlayers,
      time_per_question: timePerQuestion,
    });
  };

  const joinRoom = () => {
    if (!joinCode.trim() || !playerName.trim()) return;
    const socket = getSocket();
    if (!socket.connected) {
      setError('Not connected to server. Please wait or refresh.');
      return;
    }
    setIsLoading(true);
    setError('');
    socket.emit('join_room', {
      room_code: joinCode.trim().toUpperCase(),
      player_name: playerName.trim(),
      user_id: authUser?.id,
    });
  };


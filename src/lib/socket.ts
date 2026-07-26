import { io, Socket } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    })
  }
  if (!socket.connected && !socket.connecting) socket.connect()
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket.removeAllListeners()
    socket = null
  }
}
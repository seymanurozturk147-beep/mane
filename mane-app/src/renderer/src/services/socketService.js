// ─── MANE Socket Servisi ─────────────────────────────────────────────────────
// Sunucu ile iletişim için tek merkezi bağlantı noktası.

import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

let socket = null

/** Tekil socket bağlantısı döndürür (yoksa oluşturur). */
export function getSocket() {
    if (!socket || socket.disconnected) {
        socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })
    }
    return socket
}

/** Bağlantıyı kapat. */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

// ─── Kolaylık Fonksiyonları ───────────────────────────────────────────────────

export function createRoom({ name, description, emoji, tag, maxMembers }) {
    getSocket().emit('create-room', { name, description, emoji, tag, maxMembers })
}

export function joinRoom(roomId) {
    getSocket().emit('join-room', { roomId })
}

export function leaveRoom() {
    getSocket().emit('leave-room')
}

export function startTimerInRoom() {
    getSocket().emit('start-timer')
}

export function stopTimerInRoom() {
    getSocket().emit('stop-timer')
}

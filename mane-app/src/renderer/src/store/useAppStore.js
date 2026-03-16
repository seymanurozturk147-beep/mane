import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
    loginUser, registerUser, saveSession, getSession,
    clearSession, getUserById, addFocusTime, findUserByQuery,
    onAuthUpdate
} from '../services/auth'
import {
    createFirestoreRoom,
    listenToRooms,
    joinFirestoreRoom,
    leaveFirestoreRoom
} from '../services/rooms'
import {
    listenToNotifications,
    markNotificationRead,
    deleteNotification,
    createFriendRequest,
    establishFriendship,
    getFriends
} from '../services/social'

// ─── Bildirim ID üretici ─────────────────────────────────────────────────────
function notifId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const MOCK_NOTIFICATIONS = []

const FOCUS_DURATION = 25 * 60   // 25 dakika (saniye)
const SHORT_BREAK = 5 * 60       // 5 dakika (saniye)
const LONG_BREAK = 15 * 60       // 15 dakika (saniye)

// ─── Tarih yardımcıları ───────────────────────────────────────────────────────
function todayStr() {
    return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

function mondayStr() {
    const d = new Date()
    const day = d.getDay() // 0=Sun, 1=Mon…
    const diff = (day === 0 ? -6 : 1 - day)
    d.setDate(d.getDate() + diff)
    return d.toISOString().slice(0, 10)
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useAppStore = create(
    persist(
        (set, get) => ({

            // ─── Auth ────────────────────────────────────────────────
            user: null,
            isAuthenticated: false,
            authLoading: true,

            initAuth: () => {
                onAuthUpdate((user) => {
                    if (user) {
                        set({ user, isAuthenticated: true, authLoading: false })
                        
                        // Bildirimleri dinlemeye başla
                        const unsub = listenToNotifications(user.id, (notifs) => {
                            set({ notifications: notifs })
                        })
                        // Çıkışta temizlemek için bir yere kaydetmiyoruz (persistent değil)
                        // ama logout sırasında set({notifications: []}) yapıyoruz.
                    } else {
                        set({ user: null, isAuthenticated: false, authLoading: false, notifications: [] })
                    }
                })
            },

            register: async ({ displayName, email, password }) => {
                try {
                    set({ authLoading: true })
                    const user = await registerUser({ displayName, email, password })
                    set({ user, isAuthenticated: true, authLoading: false })
                    return user
                } catch (error) {
                    set({ authLoading: false })
                    throw error
                }
            },

            login: async ({ email, password }) => {
                try {
                    set({ authLoading: true })
                    const user = await loginUser({ email, password })
                    set({ user, isAuthenticated: true, authLoading: false })
                    return user
                } catch (error) {
                    set({ authLoading: false })
                    throw error
                }
            },

            logout: async () => {
                const { leaveRoom } = get()
                await leaveRoom() // Odadan çık
                await clearSession()
                set({ user: null, isAuthenticated: true, notifications: [], friends: [], activeRoom: null })
                // Not: isAuthenticated'ı false yapmayı unutma
                set({ isAuthenticated: false })
            },


            // ─── İstatistikler (dakika cinsinden, persist'e dahil) ────────────
            // dailyFocus  : bugünkü toplam odak süresi (dakika)
            // weeklyFocus : bu haftaki toplam (dakika)
            // totalFocus  : tüm zamanlar (dakika)
            // lastDayReset  : 'YYYY-MM-DD' — günlük sıfırlamayı takip eder
            // lastWeekReset : 'YYYY-MM-DD' (pazartesi ISO) — haftalık sıfırlama
            dailyFocus: 0,
            weeklyFocus: 0,
            totalFocus: 0,
            lastDayReset: todayStr(),
            lastWeekReset: mondayStr(),

            /**
             * Uygulama açılışında veya odak tamamlandığında istatistikleri kontrol eder.
             * Gün değiştiyse dailyFocus sıfırlanır; hafta değiştiyse weeklyFocus sıfırlanır.
             */
            checkAndResetPeriods: () => {
                const { lastDayReset, lastWeekReset } = get()
                const today = todayStr()
                const monday = mondayStr()
                const updates = {}
                if (lastDayReset !== today) {
                    updates.dailyFocus = 0
                    updates.lastDayReset = today
                }
                if (lastWeekReset !== monday) {
                    updates.weeklyFocus = 0
                    updates.lastWeekReset = monday
                }
                if (Object.keys(updates).length > 0) set(updates)
            },

            /**
             * Odak seansı tamamlandığında istatistiklere dakika ekler.
             * @param {number} minutes - eklenecek dakika sayısı
             */
            addFocusMinutes: (minutes) => {
                get().checkAndResetPeriods()
                set((s) => ({
                    dailyFocus: s.dailyFocus + minutes,
                    weeklyFocus: s.weeklyFocus + minutes,
                    totalFocus: s.totalFocus + minutes,
                }))
            },

            /** Eski auth servisi uyumluluğu için korunuyor */
            addFocusSeconds: async (seconds) => {
                const { user } = get()
                if (!user) return
                const newTotal = await addFocusTime(user.id, seconds)
                set((s) => ({ user: { ...s.user, totalFocusTime: newTotal } }))
            },

            // ─── Çalışma Odası (Firebase) ────────────────────────────
            activeRoom: null,
            availableRooms: [],
            roomsLoading: false,

            initRooms: () => {
                const { user, initFriends } = get()
                if (user) initFriends() // Arkadaşları da çek
                return listenToRooms((rooms) => {
                    set({ availableRooms: rooms })
                })
            },

            registerRoom: async (roomData) => {
                const newRoom = await createFirestoreRoom(roomData)
                set({ activeRoom: newRoom })
                return newRoom
            },

            joinRoom: async (roomId) => {
                const { user } = get()
                const room = await joinFirestoreRoom(roomId, user?.id)
                set({ activeRoom: room })
                return room
            },

            // ─── Sosyal (Arkadaşlar & Bildirimler) ──────────────────
            friends: [],
            notifications: MOCK_NOTIFICATIONS,

            initFriends: async () => {
                const { user } = get()
                if (!user) return
                const list = await getFriends(user.id)
                set({ friends: list })
            },

            addNotification: (notif) => set((s) => ({
                notifications: [
                    { id: notifId(), read: false, createdAt: new Date().toISOString(), ...notif },
                    ...s.notifications,
                ],
            })),

            markRead: async (id) => {
                await markNotificationRead(id)
            },

            markAllRead: () => {
                const { notifications } = get()
                notifications.forEach(n => {
                    if (!n.read) markNotificationRead(n.id)
                })
            },

            dismissNotification: async (id) => {
                await deleteNotification(id)
            },

            acceptFriendRequest: async (notif) => {
                const { user } = get()
                if (!user || !notif.fromId) return
                
                // 1. Arkadaşlığı kur (Firestore)
                await establishFriendship(user.id, notif.fromId)
                
                // 2. Bildirimi sil
                await deleteNotification(notif.id)
                
                // 3. Listeyi güncelle
                get().initFriends()
            },

            declineFriendRequest: async (notif) => {
                await deleteNotification(notif.id)
            },

            sendCongrats: (id) => set((s) => ({
                notifications: s.notifications.map((n) =>
                    n.id === id ? { ...n, read: true, congratsSent: true } : n
                ),
            })),

            joinRoomInvite: (id) => set((s) => ({
                notifications: s.notifications.filter((n) => n.id !== id),
            })),

            declineRoomInvite: (id) => set((s) => ({
                notifications: s.notifications.filter((n) => n.id !== id),
            })),

            /**
             * Arkadaşlık isteği gönder — doğrulama dahil.
             * @returns {{ ok: boolean, message: string }}
             */
            sendFriendRequest: async (queryStr) => {
                const { user } = get()
                if (!queryStr.trim()) return { ok: false, message: 'Lütfen bir kullanıcı adı gir.' }

                const found = await findUserByQuery(queryStr)

                if (!found) return { ok: false, message: 'Kullanıcı bulunamadı.' }
                if (found.id === user?.id) return { ok: false, message: 'Kendinize istek gönderemezsiniz.' }

                // Firebase üzerinden karşı tarafa bildirim gönder
                await createFriendRequest(user, found)
                
                return { ok: true, message: 'Arkadaşlık isteği gönderildi!' }
            },

            setActiveRoom: (room) => set({ activeRoom: room }),
            leaveActiveRoom: () => set({ activeRoom: null }),
            setAvailableRooms: (rooms) => set({ availableRooms: rooms }),
            updateRoomMembers: (count) =>
                set((s) => s.activeRoom ? { activeRoom: { ...s.activeRoom, members: count } } : {}),

            // ─── Pomodoro Timer ───────────────────────────────────────
            timerMode: 'focus',
            timerRunning: false,
            timeLeft: FOCUS_DURATION,
            sessionCount: 0,

            focusDuration: FOCUS_DURATION,
            breakDuration: SHORT_BREAK,

            lastSessionDuration: 0,

            startTimer: () => set({ timerRunning: true }),
            pauseTimer: () => set({ timerRunning: false }),

            setFocusDuration: (seconds) => {
                const { timerMode, timerRunning } = get()
                if (timerMode === 'focus' && !timerRunning) {
                    set({ focusDuration: seconds, timeLeft: seconds })
                } else {
                    set({ focusDuration: seconds })
                }
            },

            setBreakDuration: (seconds) => {
                const { timerMode, timerRunning } = get()
                if (timerMode === 'short-break' && !timerRunning) {
                    set({ breakDuration: seconds, timeLeft: seconds })
                } else {
                    set({ breakDuration: seconds })
                }
            },

            resetTimer: () => {
                const { timerMode, focusDuration, breakDuration } = get()
                const duration = timerMode === 'focus' ? focusDuration : breakDuration
                set({ timerRunning: false, timeLeft: duration })
            },

            switchMode: (mode) => {
                const { focusDuration, breakDuration } = get()
                const duration = mode === 'focus' ? focusDuration : breakDuration
                set({ timerMode: mode, timerRunning: false, timeLeft: duration })
            },

            /** Odak oturumu tamamlandı — istatistikleri güncelle */
            completeSession: () => {
                const { sessionCount, focusDuration } = get()
                const minutes = Math.round(focusDuration / 60)

                // Gerçek istatistiklere ekle
                get().addFocusMinutes(minutes)

                // Eski auth servisi uyumluluğu
                get().addFocusSeconds(focusDuration)

                set({
                    sessionCount: sessionCount + 1,
                    timerRunning: false,
                    timeLeft: focusDuration,
                    timerMode: 'focus',
                    lastSessionDuration: focusDuration,
                })
            },

            tick: () => {
                const { timeLeft, timerMode, timerRunning } = get()
                if (!timerRunning) return
                if (timeLeft <= 0) {
                    if (timerMode === 'focus') get().completeSession()
                    return
                }
                set({ timeLeft: timeLeft - 1 })
            },

            // ─── Babaanne ────────────────────────────────────────────
            babaanneActive: true,
            toggleBabaanne: () => set((s) => ({ babaanneActive: !s.babaanneActive })),

            // ─── UI ──────────────────────────────────────────────────
            sidebarOpen: false,
            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

            // ─── Ambient Sounds ──────────────────────────────────────
            currentAmbientSound: null,   // { file: 'ates.mp3', label: 'Ateş' } | null
            ambientVolume: 0.5,          // 0.0 – 1.0
            isAmbientPlaying: false,
            isAmbientLooping: true,

            setAmbientSound: (sound) => set({ currentAmbientSound: sound }),
            setAmbientVolume: (vol) => set({ ambientVolume: vol }),
            toggleAmbientPlaying: () => set((s) => ({ isAmbientPlaying: !s.isAmbientPlaying })),
            toggleAmbientLooping: () => set((s) => ({ isAmbientLooping: !s.isAmbientLooping })),
            startAmbient: () => set({ isAmbientPlaying: true }),
            stopAmbient: () => set({ isAmbientPlaying: false }),

            // Sabitler
            FOCUS_DURATION,
            SHORT_BREAK,
            LONG_BREAK,
        }),
        {
            name: 'mane-app-firebase-v1',           // Key changed for fresh start
            storage: createJSONStorage(() => localStorage),
            // Persist'e dahil edilecek alanlar (timer çalışma durumu kayıt dışı)
            partialize: (state) => ({
                dailyFocus: state.dailyFocus,
                weeklyFocus: state.weeklyFocus,
                totalFocus: state.totalFocus,
                lastDayReset: state.lastDayReset,
                lastWeekReset: state.lastWeekReset,
                focusDuration: state.focusDuration,
                breakDuration: state.breakDuration,
                sessionCount: state.sessionCount,
                notifications: state.notifications,
                ambientVolume: state.ambientVolume,
                isAmbientLooping: state.isAmbientLooping,
                currentAmbientSound: state.currentAmbientSound,
                lastSessionDuration: state.lastSessionDuration,
            }),
        }
    )
)

export default useAppStore
export { FOCUS_DURATION, SHORT_BREAK, LONG_BREAK }

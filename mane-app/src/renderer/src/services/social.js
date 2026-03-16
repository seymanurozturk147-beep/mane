import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    deleteDoc,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import { db } from "./firebase";

const NOTIFICATIONS_COLLECTION = "notifications";

// ─── Bildirim Gönder ─────────────────────────────────────────────────────────
export async function sendFirestoreNotification(notifData) {
    try {
        const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
            ...notifData,
            createdAt: serverTimestamp(),
            read: false,
        });
        return docRef.id;
    } catch (error) {
        console.error("[Social] Bildirim gönderme hatası:", error);
        throw error;
    }
}

// ─── Bildirimleri Dinle ──────────────────────────────────────────────────────
export function listenToNotifications(userId, callback) {
    if (!userId) return;
    
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where("toId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        callback(notifs);
    }, (error) => {
        console.error("[Social] Bildirim dinleme hatası:", error);
    });
}

// ─── Bildirimi Okundu İşaretle ──────────────────────────────────────────────
export async function markNotificationRead(notifId) {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notifId);
    await updateDoc(notifRef, { read: true });
}

// ─── Bildirimi Sil ───────────────────────────────────────────────────────────
export async function deleteNotification(notifId) {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notifId);
    await deleteDoc(notifRef);
}

// ─── Arkadaşlık İsteği Gönder ────────────────────────────────────────────────
export async function createFriendRequest(fromUser, toUser) {
    return sendFirestoreNotification({
        type: 'friend_request',
        fromId: fromUser.id,
        fromName: fromUser.displayName,
        toId: toUser.id,
        message: `${fromUser.displayName} sana arkadaşlık isteği gönderdi.`,
    });
}

// ─── Arkadaşlık İlişkisi Kur ──────────────────────────────────────────────────
export async function establishFriendship(userA_Id, userB_Id) {
    const friendshipId1 = `${userA_Id}_${userB_Id}`;
    const friendshipId2 = `${userB_Id}_${userA_Id}`;
    
    // Karşılıklı kayıt oluştur (basitlik için iki döküman)
    await setDoc(doc(db, "friends", friendshipId1), {
        userId: userA_Id,
        friendId: userB_Id,
        createdAt: serverTimestamp()
    });
    
    await setDoc(doc(db, "friends", friendshipId2), {
        userId: userB_Id,
        friendId: userA_Id,
        createdAt: serverTimestamp()
    });
}

// ─── Arkadaş Listesini Getir ─────────────────────────────────────────────────
export async function getFriends(userId) {
    if (!userId) return [];
    const q = query(collection(db, "friends"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().friendId);
}

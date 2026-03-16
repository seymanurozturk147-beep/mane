import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    increment, 
    getDoc,
    query,
    orderBy,
    where,
    deleteDoc,
    setDoc
} from "firebase/firestore";
import { db } from "./firebase";

const ROOMS_COLLECTION = "rooms";

// ─── Oda Kur ─────────────────────────────────────────────────────────────────
export async function createFirestoreRoom(roomData) {
    console.log("[Rooms] Oda kuruluyor:", roomData.name);
    try {
        const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
            ...roomData,
            members: 1, // Kurucu zaten içinde
            membersList: [], // Detaylı üye listesi için ileride kullanılabilir
            createdAt: new Date().toISOString(),
            timerRunning: false,
        });
        
        // ID'yi döküman içine de yazalım
        await updateDoc(docRef, { id: docRef.id });
        
        const newRoom = { id: docRef.id, ...roomData, members: 1 };
        return newRoom;
    } catch (error) {
        console.error("[Rooms] Oda kurma hatası:", error);
        throw error;
    }
}

// ─── Oda Listesini Dinle ────────────────────────────────────────────────────
export function listenToRooms(callback) {
    const q = query(collection(db, ROOMS_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(rooms);
    }, (error) => {
        console.error("[Rooms] Dinleme hatası:", error);
    });
}

// ─── Odaya Katıl ─────────────────────────────────────────────────────────────
export async function joinFirestoreRoom(roomId, userId) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Oda bulunamadı.");
    }
    
    const roomData = roomSnap.data();
    if (roomData.maxMembers !== 'unlimited' && roomData.members >= Number(roomData.maxMembers)) {
        throw new Error("Oda dolu!");
    }

    await updateDoc(roomRef, {
        members: increment(1)
    });

    return { id: roomId, ...roomData, members: roomData.members + 1 };
}

// ─── Odadan Ayrıl ────────────────────────────────────────────────────────────
export async function leaveFirestoreRoom(roomId, userId) {
    if (!roomId) return;
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
        const currentMembers = roomSnap.data().members;
        if (currentMembers <= 1) {
            // Son kişi çıkıyorsa odayı silebiliriz veya 0'a çekebiliriz
            await deleteDoc(roomRef);
        } else {
            await updateDoc(roomRef, {
                members: increment(-1)
            });
        }
    }
}

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    increment, 
    collection, 
    query, 
    where, 
    getDocs 
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ─── Kullanıcı kaydı ─────────────────────────────────────────────────────────
export async function registerUser({ displayName, email, password }) {
    console.log("[Auth] Kayıt başlatılıyor:", email);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("[Auth] Firebase kullanıcısı oluştu, UID:", user.uid);

        const userData = {
            id: user.uid,
            displayName: (displayName || "").trim() || email.split('@')[0],
            email: email.trim().toLowerCase(),
            createdAt: new Date().toISOString(),
            totalFocusTime: 0,
            photoURL: null,
        };

        console.log("[Firestore] Profil oluşturuluyor...");
        // Firestore'a profil oluştur
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("[Firestore] Profil başarıyla oluşturuldu.");

        return userData;
    } catch (error) {
        console.error("[Auth] Kayıt hatası:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Bu e-posta adresi zaten kayıtlı.');
        }
        throw error;
    }
}

// ─── Kullanıcı girişi ─────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
    console.log("[Auth] Giriş denemesi:", email);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("[Auth] Firebase girişi başarılı, UID:", user.uid);
        
        console.log("[Firestore] Profil çekiliyor...");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            console.log("[Firestore] Profil bulundu.");
            return userDoc.data();
        } else {
            console.warn("[Firestore] Profil dökümanı bulunamadı, yeni oluşturuluyor...");
            // Otomatik profil oluşturma (Eski hesaplar/kayıplar için)
            const fallbackData = {
                id: user.uid,
                displayName: user.displayName || email.split('@')[0],
                email: user.email,
                createdAt: user.metadata.creationTime || new Date().toISOString(),
                totalFocusTime: 0,
                photoURL: user.photoURL || null,
            };
            await setDoc(doc(db, "users", user.uid), fallbackData);
            return fallbackData;
        }
    } catch (error) {
        console.error("[Auth] Giriş hatası:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('E-posta adresi veya şifre hatalı.');
        }
        throw error;
    }
}

export function saveSession(uid) {}

export function getSession() {
    return auth.currentUser?.uid || null;
}

export async function clearSession() {
    console.log("[Auth] Çıkış yapılıyor...");
    await signOut(auth);
}

export async function getUserById(id) {
    try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (!userDoc.exists()) return null;
        return userDoc.data();
    } catch (e) {
        console.error("[Firestore] Kullanıcı getirme hatası:", e);
        return null;
    }
}

export async function updateUser(id, updates) {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, updates);
    const updated = await getDoc(userRef);
    return updated.data();
}

export async function addFocusTime(userId, seconds) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        totalFocusTime: increment(seconds)
    });
    const updated = await getDoc(userRef);
    return updated.data().totalFocusTime;
}

export async function findUserByQuery(queryStr) {
    const qStr = queryStr.trim().toLowerCase();
    if (!qStr) return null;

    const qEmail = query(collection(db, "users"), where("email", "==", qStr));
    const querySnapshot = await getDocs(qEmail);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
    }

    const qName = query(collection(db, "users"), where("displayName", "==", queryStr.trim()));
    const nameSnapshot = await getDocs(qName);

    if (!nameSnapshot.empty) {
        return nameSnapshot.docs[0].data();
    }

    return null;
}

export function onAuthUpdate(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("[AuthUpdate] Kullanıcı oturumu açık:", user.uid);
            let userData = await getUserById(user.uid);
            
            // Eğer profile dökümanı yoksa loginUser'daki gibi kurtar
            if (!userData) {
                console.warn("[AuthUpdate] Profil bulunamadı, kurtarılıyor...");
                userData = {
                    id: user.uid,
                    displayName: user.displayName || user.email?.split('@')[0] || "Misafir",
                    email: user.email,
                    createdAt: user.metadata.creationTime || new Date().toISOString(),
                    totalFocusTime: 0,
                    photoURL: user.photoURL || null,
                };
                await setDoc(doc(db, "users", user.uid), userData);
            }
            
            callback(userData);
        } else {
            console.log("[AuthUpdate] Oturum kapalı.");
            callback(null);
        }
    });
}



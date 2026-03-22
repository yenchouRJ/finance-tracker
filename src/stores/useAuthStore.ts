import { create } from "zustand";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/services/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User as LocalUser } from "@/types";
import { getDB } from "@/services/db/schema";

interface AuthState {
  user: LocalUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;

  initializeAuthListener: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  error: null,

  initializeAuthListener: () => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ isLoading: true });
        try {
          // 1. Check if user exists in Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let localUser: LocalUser;

          if (!userDoc.exists()) {
            // 2. Create new user record in Firestore
            localUser = {
              id: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Anonymous User",
              email: firebaseUser.email || "",
              photoUrl: firebaseUser.photoURL || undefined,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            await setDoc(userDocRef, localUser);
          } else {
            localUser = userDoc.data() as LocalUser;
          }

          // 3. Upsert user in Local SQLite Database
          const localDb = await getDB();
          await localDb.runAsync(
            `INSERT OR REPLACE INTO users (id, displayName, email, photoUrl, defaultLedgerId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              localUser.id,
              localUser.displayName,
              localUser.email,
              localUser.photoUrl || null,
              localUser.defaultLedgerId || null,
              localUser.createdAt,
              localUser.updatedAt,
            ],
          );

          set({ firebaseUser, user: localUser, isLoading: false });

          // 4. Trigger initial sync when user logs in
          import("@/features/sync/syncEngine").then(({ SyncEngine }) => {
            SyncEngine.syncAll(localUser.id).catch(console.error);
          });
        } catch (error: any) {
          console.error("Auth state handling error", error);
          set({
            error: error.message,
            isLoading: false,
            firebaseUser: null,
            user: null,
          });
        }
      } else {
        // User is logged out
        set({ firebaseUser: null, user: null, isLoading: false });
      }
    });

    return unsubscribe;
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ firebaseUser: null, user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

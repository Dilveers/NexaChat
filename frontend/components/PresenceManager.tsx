"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PresenceManager() {

  useEffect(() => {
    let removeOfflineListener:
      | (() => void)
      | null = null;

    const unsubscribe =
      auth.onAuthStateChanged(
        async (user) => {
          removeOfflineListener?.();
          removeOfflineListener = null;

          if (!user) return;

          // USER ONLINE
          await setDoc(
            doc(db, "presence", user.uid),
            {
              online: true,
              lastSeen: serverTimestamp(),
            },
            { merge: true }
          );

          // USER OFFLINE WHEN TAB CLOSES
          const handleOffline =
            async () => {

              await setDoc(
                doc(
                  db,
                  "presence",
                  user.uid
                ),
                {
                  online: false,
                  lastSeen:
                    serverTimestamp(),
                },
                { merge: true }
              );
            };

          window.addEventListener(
            "beforeunload",
            handleOffline
          );

          removeOfflineListener = () =>
            window.removeEventListener(
              "beforeunload",
              handleOffline
            );
        }
      );

    return () => {
      removeOfflineListener?.();
      unsubscribe();
    };

  }, []);

  return null;
}

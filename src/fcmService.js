import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const VAPID_KEY = "BGxF0Ng-JyQX3T3vcHL3MSn2ckvOytAFQmaRYSDQltuqHn8NMAt8gjgjrJpyeffKkGHAPo-rp_ASOcfRfnsFtRs";

let messaging = null;
const getMessagingInstance = (firebaseApp) => {
  if (!messaging) messaging = getMessaging(firebaseApp);
  return messaging;
};

export const initFCM = async (firebaseApp, db, userId) => {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

    const permission = await Notification.requestPermission();
    console.log("FCM permission:", permission);
    if (permission !== "granted") return null;

    // Enregistre firebase-messaging-sw.js (qui inclut aussi le cache PWA)
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Attendre qu'il soit actif
    await navigator.serviceWorker.ready;

    const msg = getMessagingInstance(firebaseApp);
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("✅ FCM Token obtenu:", token.substring(0, 20) + "...");
      await saveFCMToken(db, userId, token);
      return token;
    }

    console.log("FCM: token vide");
    return null;
  } catch (error) {
    console.error("❌ Erreur FCM init:", error.message);
    return null;
  }
};

export const saveFCMToken = async (db, userId, token) => {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        fcmToken: token,
        fcmTokenUpdatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        notificationsEnabled: true,
      },
      { merge: true }
    );
    console.log("✅ FCM token sauvegardé");
  } catch (error) {
    console.error("❌ Erreur sauvegarde FCM token:", error);
  }
};

export const updateLastActive = async (db, userId) => {
  if (!userId || userId === "demo") return;
  try {
    await setDoc(
      doc(db, "users", userId),
      { lastActiveAt: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error("Erreur update lastActiveAt:", error);
  }
};

export const listenForegroundNotifs = (firebaseApp, onNotifReceived) => {
  try {
    const msg = getMessagingInstance(firebaseApp);
    onMessage(msg, (payload) => {
      console.log("🔔 Notif foreground:", payload.notification?.title);
      if (onNotifReceived) onNotifReceived(payload);
    });
  } catch (error) {
    console.error("Erreur listen foreground:", error);
  }
};

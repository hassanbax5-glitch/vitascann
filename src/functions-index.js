// ============================================
// VITASCANN — functions/index.js
// 📍 Remplace ton functions/index.js existant
// ============================================
// Cron job toutes les 24h :
// → Query users inactifs depuis 3 jours
// → Envoie push FCM bienveillant
// ============================================

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ─── MESSAGES BIENVEILLANTS ───
const MESSAGES_FR = [
  {
    title: "🌿 VitaScann pense à toi",
    body: "Ça fait quelques jours… Prends quelques minutes pour toi aujourd'hui.",
  },
  {
    title: "💚 Ton bien-être t'attend",
    body: "Un petit scan aujourd'hui peut faire une grande différence pour ta santé.",
  },
  {
    title: "🌱 Prends soin de toi",
    body: "Ton corps mérite quelques minutes d'attention. VitaScann est là pour toi.",
  },
  {
    title: "✨ Retour en douceur",
    body: "Pas de pression — juste un rappel que ta santé compte. On t'attend 🙂",
  },
  {
    title: "🌿 Un moment pour toi",
    body: "La santé, ça se construit jour après jour. Même 5 minutes ça compte.",
  },
];

const MESSAGES_EN = [
  {
    title: "🌿 VitaScann is thinking of you",
    body: "It's been a few days… Take a few minutes for yourself today.",
  },
  {
    title: "💚 Your wellness awaits",
    body: "A quick scan today can make a big difference for your health.",
  },
  {
    title: "🌱 Take care of yourself",
    body: "Your body deserves a few minutes of attention. VitaScann is here for you.",
  },
  {
    title: "✨ A gentle comeback",
    body: "No pressure — just a reminder that your health matters. We're here 🙂",
  },
];

// ─── Choisir un message aléatoire ───
const getRandomMessage = (lang = "fr") => {
  const msgs = lang === "en" ? MESSAGES_EN : MESSAGES_FR;
  return msgs[Math.floor(Math.random() * msgs.length)];
};

// ─── CRON JOB — toutes les 24h à 10h00 ───
exports.sendInactivityReminders = onSchedule(
  {
    schedule: "0 10 * * *", // Chaque jour à 10h00 UTC
    timeZone: "America/Toronto",
    region: "europe-west1",
  },
  async (event) => {
    console.log("🔔 Cron notifs inactivité démarré");

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    try {
      // Query users inactifs depuis 3 jours avec un FCM token
      const snapshot = await db
        .collection("users")
        .where("lastActiveAt", "<=", threeDaysAgo)
        .where("notificationsEnabled", "==", true)
        .get();

      if (snapshot.empty) {
        console.log("Aucun user inactif trouvé");
        return;
      }

      console.log(`${snapshot.size} users inactifs trouvés`);

      const sendPromises = [];

      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        const { fcmToken, lang } = userData;

        if (!fcmToken) return;

        const message = getRandomMessage(lang || "fr");

        const fcmMessage = {
          token: fcmToken,
          notification: {
            title: message.title,
            body: message.body,
          },
          webpush: {
            notification: {
              icon: "https://vitascann.vercel.app/logo192.png",
              badge: "https://vitascann.vercel.app/logo192.png",
              vibrate: [200, 100, 200],
              requireInteraction: false,
            },
            fcmOptions: {
              link: "https://vitascann.vercel.app",
            },
          },
          data: {
            type: "inactivity_reminder",
            userId: docSnap.id,
          },
        };

        sendPromises.push(
          messaging
            .send(fcmMessage)
            .then(() => {
              console.log(`✅ Notif envoyée à user: ${docSnap.id}`);
            })
            .catch(async (error) => {
              console.error(`❌ Erreur notif user ${docSnap.id}:`, error);

              // Si token invalide → nettoyer Firestore
              if (
                error.code === "messaging/invalid-registration-token" ||
                error.code === "messaging/registration-token-not-registered"
              ) {
                await db.collection("users").doc(docSnap.id).update({
                  fcmToken: admin.firestore.FieldValue.delete(),
                  notificationsEnabled: false,
                });
                console.log(`🧹 Token invalide nettoyé pour: ${docSnap.id}`);
              }
            })
        );
      });

      await Promise.all(sendPromises);
      console.log(`✅ Cron terminé — ${sendPromises.length} notifs envoyées`);
    } catch (error) {
      console.error("Erreur cron notifs:", error);
    }
  }
);

// ─── ENDPOINT TEST (optionnel) ───
// Pour tester manuellement via: GET /testNotif?uid=TON_UID
exports.testNotif = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    const uid = req.query.uid;
    if (!uid) {
      res.status(400).send("uid requis");
      return;
    }

    try {
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        res.status(404).send("User introuvable");
        return;
      }

      const { fcmToken, lang } = userDoc.data();
      if (!fcmToken) {
        res.status(400).send("Pas de FCM token pour ce user");
        return;
      }

      const message = getRandomMessage(lang || "fr");

      await messaging.send({
        token: fcmToken,
        notification: {
          title: "🧪 TEST — " + message.title,
          body: message.body,
        },
        webpush: {
          fcmOptions: { link: "https://vitascann.vercel.app" },
        },
      });

      res.send(`✅ Notif test envoyée à ${uid}`);
    } catch (error) {
      console.error("Erreur test notif:", error);
      res.status(500).send("Erreur: " + error.message);
    }
  }
);

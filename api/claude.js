// /api/claude.js
// Fonction SERVEUR sur Vercel : ajoute la clé secrète et relaie la requête à Anthropic.
// Accepte les appels du site web ET de l'app installée (iPhone / Android).

const ALLOWED_ORIGINS = [
  "https://vitascann.vercel.app",
  "capacitor://localhost", // app iPhone
  "https://localhost",     // app Android
  "http://localhost",      // app Android (ancien schéma) + dev local
  "http://localhost:3000", // npm start
];

const ALLOWED_MODELS = ["claude-sonnet-4-6", "claude-opus-4-5"];
const MAX_TOKENS_CAP = 4000;

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Requête de vérification envoyée par le téléphone avant le vrai appel
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Bloque les appels venant d'autres sites
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Origine non autorisée" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée côté serveur" });
  }

  // Limites de sécurité : modèle imposé et nombre de tokens plafonné
  const body = { ...(req.body || {}) };
  if (!ALLOWED_MODELS.includes(body.model)) body.model = ALLOWED_MODELS[0];
  body.max_tokens = Math.min(Number(body.max_tokens) || 1000, MAX_TOKENS_CAP);

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error("Erreur proxy Claude:", err);
    return res.status(500).json({ error: "Erreur serveur lors de l'appel à Claude" });
  }
};

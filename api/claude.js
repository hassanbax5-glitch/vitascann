// /api/claude.js
// Cette fonction tourne côté SERVEUR sur Vercel (jamais envoyée au navigateur).
// Elle reçoit le body (model, system, messages, max_tokens...) depuis le front,
// ajoute la vraie clé API secrète, et relaie la requête à Anthropic.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée côté serveur" });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error("Erreur proxy Claude:", err);
    return res.status(500).json({ error: "Erreur serveur lors de l'appel à Claude" });
  }
}
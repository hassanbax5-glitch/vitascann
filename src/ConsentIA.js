// ConsentIA.js — Consentement avant l'envoi de données à Claude (Anthropic)
// Règles Apple 5.1.1 et 5.1.2 : divulguer QUI reçoit les données, QUOI, POURQUOI,
// et obtenir un accord clair AVANT tout envoi.

import React from "react";

const CLE = "vitascann_consentement_ia_v1";
const URL_POLITIQUE = "https://vitascann.vercel.app/politique-confidentialite.html";

// --- Fonctions utilitaires -------------------------------------------------

export function aConsentiIA() {
  try {
    return localStorage.getItem(CLE) === "oui";
  } catch {
    return false;
  }
}

export function enregistrerConsentement(accepte) {
  try {
    localStorage.setItem(CLE, accepte ? "oui" : "non");
    localStorage.setItem(CLE + "_date", new Date().toISOString());
  } catch {}
}

export function retirerConsentement() {
  enregistrerConsentement(false);
}

// --- Écran de consentement -------------------------------------------------

export default function ConsentIA({ onAccepter, onRefuser }) {
  const accepter = () => {
    enregistrerConsentement(true);
    onAccepter && onAccepter();
  };
  const refuser = () => {
    enregistrerConsentement(false);
    onRefuser && onRefuser();
  };

  return (
    <div style={s.fond} role="dialog" aria-modal="true" aria-labelledby="consent-titre">
      <div style={s.boite}>
        <h2 id="consent-titre" style={s.titre}>Avant ton premier scan</h2>

        <p style={s.texte}>
          Pour analyser tes photos et tes réponses, VitaScann les envoie à
          <strong> Claude, un service d'intelligence artificielle d'Anthropic</strong> (États-Unis).
        </p>

        <div style={s.bloc}>
          <p style={s.sousTitre}>Ce qui est envoyé</p>
          <p style={s.texte}>
            Les photos que tu scannes, tes réponses aux questionnaires et les infos
            santé que tu entres (âge, symptômes, objectifs).
          </p>
        </div>

        <div style={s.bloc}>
          <p style={s.sousTitre}>Pourquoi</p>
          <p style={s.texte}>
            Seulement pour générer ton analyse et tes conseils. Anthropic n'utilise
            pas ces données pour entraîner ses modèles et ne les vend pas.
          </p>
        </div>

        <div style={s.bloc}>
          <p style={s.sousTitre}>Ton choix</p>
          <p style={s.texte}>
            Tu peux retirer ton accord en tout temps dans Réglages. Sans accord,
            les fonctions d'analyse IA restent désactivées.
          </p>
        </div>

        <a href={URL_POLITIQUE} target="_blank" rel="noreferrer" style={s.lien}>
          Lire la politique de confidentialité
        </a>

        <button onClick={accepter} style={s.btnOui}>
          J'accepte l'envoi à Anthropic
        </button>
        <button onClick={refuser} style={s.btnNon}>
          Refuser
        </button>
      </div>
    </div>
  );
}

const s = {
  fond: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, zIndex: 9999,
  },
  boite: {
    background: "#fff", color: "#1a1a1a", borderRadius: 16, padding: 22,
    maxWidth: 420, width: "100%", maxHeight: "90vh", overflowY: "auto",
  },
  titre: { margin: "0 0 12px", fontSize: 22 },
  sousTitre: { margin: "0 0 4px", fontWeight: 700, fontSize: 15 },
  texte: { margin: 0, fontSize: 15, lineHeight: 1.5 },
  bloc: { marginTop: 14 },
  lien: { display: "block", margin: "18px 0", color: "#1a7f5a", fontSize: 15 },
  btnOui: {
    width: "100%", padding: 14, border: "none", borderRadius: 12,
    background: "#1a7f5a", color: "#fff", fontSize: 16, fontWeight: 700,
    marginBottom: 8, cursor: "pointer",
  },
  btnNon: {
    width: "100%", padding: 14, border: "1px solid #ccc", borderRadius: 12,
    background: "transparent", color: "#1a1a1a", fontSize: 16, cursor: "pointer",
  },
};

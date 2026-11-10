// PorteConsentement.js
// Entoure toute l'app. Il fait 2 choses :
// 1. Au premier lancement, il montre l'écran de consentement IA.
// 2. Il bloque TOUS les appels vers api/claude tant que l'utilisateur n'a pas accepté,
//    et réaffiche l'écran de consentement si quelqu'un essaie de scanner.
// Avantage : pas besoin de modifier les 34 "fetch" dans les 12 fichiers.

import React, { useEffect, useState } from "react";
import ConsentIA, { aConsentiIA } from "./ConsentIA";

const CLE = "vitascann_consentement_ia_v1";
const EVENEMENT = "vitascann-demande-consentement";

function dejaDecide() {
  try {
    return localStorage.getItem(CLE) !== null;
  } catch {
    return false;
  }
}

// Garde-fou sur fetch : installé une seule fois au chargement
if (typeof window !== "undefined" && !window.__gardeClaudeInstalle) {
  window.__gardeClaudeInstalle = true;
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = (ressource, options) => {
    const url = typeof ressource === "string" ? ressource : (ressource && ressource.url) || "";
    if (url.includes("api/claude") && !aConsentiIA()) {
      window.dispatchEvent(new Event(EVENEMENT));
      return Promise.reject(
        new Error("Analyse IA désactivée : accepte l'envoi à Anthropic pour l'utiliser.")
      );
    }
    return fetchOriginal(ressource, options);
  };
}

export default function PorteConsentement({ children }) {
  const [montrer, setMontrer] = useState(!dejaDecide());

  useEffect(() => {
    const ouvrir = () => setMontrer(true);
    window.addEventListener(EVENEMENT, ouvrir);
    return () => window.removeEventListener(EVENEMENT, ouvrir);
  }, []);

  return (
    <>
      {children}
      {montrer && (
        <ConsentIA
          onAccepter={() => setMontrer(false)}
          onRefuser={() => setMontrer(false)}
        />
      )}
    </>
  );
}

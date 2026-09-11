// ============================================================
// VITASCANN — BilanComplet.js
// 🔬🧠 Fusion "Santé & Scores" + "Mental & Spirituel"
// Regroupe : Scanner Futur, Score Dopamine, Score Énergie,
// Score Immunité, Mindset Guerrier, Santé Émotionnelle, Réalité Brutale
// ============================================================

import { useState } from "react";
import ScannerFutur from "./ScannerFutur";
import ScoreDopamine from "./ScoreDopamine";
import ScoreEnergie from "./ScoreEnergie";
import ScoreImmunite from "./ScoreImmunite";
import SanteEmotionnelle from "./SanteEmotionnelle";
import RealiteBrutale from "./RealiteBrutale";

const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

const SOUS_MODULES = [
  { id: "futur",       emoji: "🔮", color: "#38bdf8", labelFr: "Scanner Futur",     labelEn: "Future Scanner",  subFr: "Prédiction 6 mois",        subEn: "6-month prediction" },
  { id: "dopamine",    emoji: "🧠", color: "#a855f7", labelFr: "Score Dopamine",    labelEn: "Dopamine Score",  subFr: "Addictions numériques",     subEn: "Digital addictions" },
  { id: "energie",     emoji: "⚡", color: EM,         labelFr: "Score Énergie",     labelEn: "Energy Score",    subFr: "Plan quotidien",           subEn: "Daily plan" },
  { id: "immunite",    emoji: "🛡️", color: "#06b6d4", labelFr: "Score Immunité",    labelEn: "Immunity Score",  subFr: "Tibb an-Nabawi 🌿",         subEn: "Tibb an-Nabawi 🌿" },
  { id: "emotionnelle",emoji: "❤️", color: "#c084fc", labelFr: "Santé Émotionnelle",labelEn: "Emotional Health",subFr: "MTC · Respiration",        subEn: "TCM · Breathwork" },
  { id: "realite",     emoji: "⚡", color: "#ef4444", labelFr: "Réalité Brutale",   labelEn: "Brutal Reality",  subFr: "La vérité sur ta vie",     subEn: "The truth about your life" },
];

export default function BilanComplet({ user, profile, onBack, onCoinsEarned, lang, t, onMoodDecline }) {
  const L = lang === "en";
  const [active, setActive] = useState(null); // null = menu, sinon id du sous-module

  // ── Rendu d'un sous-module sélectionné ──
  if (active === "futur") return <ScannerFutur user={user} profile={profile} onBack={() => setActive(null)} onCoinsEarned={onCoinsEarned} lang={lang} />;
  if (active === "dopamine") return <ScoreDopamine user={user} profile={profile} onBack={() => setActive(null)} onCoinsEarned={onCoinsEarned} lang={lang} />;
  if (active === "energie") return <ScoreEnergie user={user} onBack={() => setActive(null)} onCoinsEarned={onCoinsEarned} lang={lang} profile={profile} />;
  if (active === "immunite") return <ScoreImmunite user={user} onBack={() => setActive(null)} onCoinsEarned={onCoinsEarned} lang={lang} />;
  if (active === "emotionnelle") return <SanteEmotionnelle user={user} onBack={() => setActive(null)} onCoinsEarned={onCoinsEarned} lang={lang} t={t} profile={profile} onMoodDecline={onMoodDecline} />;
  if (active === "realite") return <RealiteBrutale onBack={() => setActive(null)} lang={lang} user={user} />;

  // ── Menu principal du hub ──
  return (
    <div style={{ minHeight: "100vh", background: "#060d08", overflowY: "auto", paddingBottom: 40 }}>
      <div style={{ padding: "52px 20px 20px", background: `radial-gradient(ellipse at 50% 0%,${GOLD}12 0%,#060d08 65%)` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, marginBottom: 16, display: "block" }}>
          ← {L ? "Back" : "Retour"}
        </button>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔬🧠</div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 6 }}>
            {L ? "Complete Health & Mind Report" : "Bilan Santé & Mental Complet"}
          </div>
          <div style={{ color: MUT, fontSize: 12, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            {L ? "6 assessments to know exactly where you stand — body, mind, habits." : "6 bilans pour savoir exactement où tu en es — corps, esprit, habitudes."}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SOUS_MODULES.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)}
              style={{
                background: CARD, border: `1.5px solid ${m.color}33`, borderRadius: 16,
                padding: "16px 14px", cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 8,
                fontFamily: "'Outfit',sans-serif", minHeight: 100,
              }}>
              <div style={{ fontSize: 28 }}>{m.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: m.color, lineHeight: 1.2 }}>{L ? m.labelEn : m.labelFr}</div>
                <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>{L ? m.subEn : m.subFr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

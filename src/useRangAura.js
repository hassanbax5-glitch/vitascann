// ============================================
// useRangAura — Hook partagé VitaScann
// Retourne les couleurs/effets d'aura
// selon le rang Solo Leveling de l'user
// ============================================

import { useMemo } from "react";

// Définition des auras par rang
const AURAS = {
  F:   {
    color: "#9ca3af", glow: "#9ca3af",
    gradient: "radial-gradient(ellipse at 50% 0%,#9ca3af08 0%,#060d08 65%)",
    border: "#9ca3af33", intensity: 0,
    particles: false, animation: null,
    badge: "⚪ Rang F", badgeColor: "#9ca3af",
  },
  E:   {
    color: "#22c55e", glow: "#22c55e",
    gradient: "radial-gradient(ellipse at 50% 0%,#22c55e12 0%,#060d08 65%)",
    border: "#22c55e44", intensity: 1,
    particles: false, animation: null,
    badge: "🟢 Rang E", badgeColor: "#22c55e",
  },
  D:   {
    color: "#3b82f6", glow: "#3b82f6",
    gradient: "radial-gradient(ellipse at 50% 0%,#3b82f618 0%,#060d08 65%)",
    border: "#3b82f655", intensity: 2,
    particles: false, animation: "aura-pulse-blue",
    badge: "🔵 Rang D", badgeColor: "#3b82f6",
  },
  C:   {
    color: "#d97706", glow: "#d97706",
    gradient: "radial-gradient(ellipse at 50% 0%,#d9770618 0%,#060d08 65%)",
    border: "#d9770655", intensity: 2,
    particles: false, animation: "aura-pulse-brown",
    badge: "🟤 Rang C", badgeColor: "#d97706",
  },
  B:   {
    color: "#6366f1", glow: "#818cf8",
    gradient: "radial-gradient(ellipse at 50% 0%,#6366f120 0%,#060d08 60%)",
    border: "#6366f166", intensity: 3,
    particles: true, animation: "aura-pulse-indigo",
    badge: "🔷 Rang B", badgeColor: "#6366f1",
  },
  A:   {
    color: "#f59e0b", glow: "#fbbf24",
    gradient: "radial-gradient(ellipse at 50% 0%,#f59e0b22 0%,#060d08 60%)",
    border: "#f59e0b77", intensity: 3,
    particles: true, animation: "aura-pulse-gold",
    badge: "🟡 Rang A", badgeColor: "#f59e0b",
  },
  S:   {
    color: "#e879f9", glow: "#d946ef",
    gradient: "radial-gradient(ellipse at 40% 0%,#e879f928 0%,#060d08 55%)",
    border: "#e879f988", intensity: 4,
    particles: true, animation: "aura-pulse-purple",
    badge: "🟣 Rang S", badgeColor: "#e879f9",
  },
  SS:  {
    color: "#f97316", glow: "#fb923c",
    gradient: "radial-gradient(ellipse at 50% 0%,#f9731630 0%,#060d08 50%)",
    border: "#f97316aa", intensity: 4,
    particles: true, animation: "aura-fire",
    badge: "🔶 Rang SS", badgeColor: "#f97316",
  },
  SSS: {
    color: "#fbbf24", glow: "#fde68a",
    gradient: "linear-gradient(135deg,#1a0a0020,#0a001a20,#001a0a20)",
    border: "#fbbf24cc", intensity: 5,
    particles: true, animation: "aura-rainbow",
    badge: "⭐ Rang SSS", badgeColor: "#fbbf24",
  },
};

// CSS des animations d'aura (à injecter une fois dans l'app)
export const AURA_CSS = `
  @keyframes aura-pulse-blue    { 0%,100%{box-shadow:0 0 20px #3b82f633} 50%{box-shadow:0 0 40px #3b82f666} }
  @keyframes aura-pulse-brown   { 0%,100%{box-shadow:0 0 20px #d9770633} 50%{box-shadow:0 0 40px #d9770666} }
  @keyframes aura-pulse-indigo  { 0%,100%{box-shadow:0 0 25px #6366f144} 50%{box-shadow:0 0 55px #6366f188} }
  @keyframes aura-pulse-gold    { 0%,100%{box-shadow:0 0 25px #f59e0b44} 50%{box-shadow:0 0 60px #f59e0b99} }
  @keyframes aura-pulse-purple  { 0%,100%{box-shadow:0 0 30px #e879f955} 50%{box-shadow:0 0 70px #e879f9bb} }
  @keyframes aura-fire          { 0%,100%{box-shadow:0 0 35px #f9731666,0 0 70px #f9731633} 50%{box-shadow:0 0 60px #f97316cc,0 0 120px #f9731666} }
  @keyframes aura-rainbow       {
    0%  {box-shadow:0 0 40px #ff000088,0 0 80px #ff000033}
    20% {box-shadow:0 0 40px #ff880088,0 0 80px #ff880033}
    40% {box-shadow:0 0 40px #00ff8888,0 0 80px #00ff8833}
    60% {box-shadow:0 0 40px #0088ff88,0 0 80px #0088ff33}
    80% {box-shadow:0 0 40px #8800ff88,0 0 80px #8800ff33}
    100%{box-shadow:0 0 40px #ff000088,0 0 80px #ff000033}
  }
  @keyframes particle-float {
    0%   { transform: translateY(0px) translateX(0px) scale(1); opacity:.8 }
    50%  { transform: translateY(-20px) translateX(5px) scale(1.2); opacity:.4 }
    100% { transform: translateY(-40px) translateX(-5px) scale(0); opacity:0 }
  }
  @keyframes badge-glow {
    0%,100% { opacity:.9 }
    50%     { opacity:1; filter:brightness(1.3) }
  }
`;

// Hook principal
export function useRangAura(user) {
  const rangId = useMemo(() => {
    try {
      const startRaw = localStorage.getItem("vs_solo_start");
      const days_raw = localStorage.getItem("vs_solo_days");
      if (!startRaw) return "F";
      const dayNumber = Math.max(1, Math.floor((new Date() - new Date(startRaw)) / (1000*60*60*24)) + 1);
      const week = Math.ceil(dayNumber / 7);
      const RANG_SEUILS = [
        { id:"SSS", week:16 }, { id:"SS", week:14 }, { id:"S", week:13 },
        { id:"A",   week:11 }, { id:"B", week:9  }, { id:"C", week:7  },
        { id:"D",   week:5  }, { id:"E", week:3  }, { id:"F", week:1  },
      ];
      const rang = RANG_SEUILS.find(r => week >= r.week);
      return rang?.id || "F";
    } catch { return "F"; }
  }, [user]);

  const aura = AURAS[rangId] || AURAS.F;
  return { ...aura, rangId };
}

// Composant particules flottantes
export function AuraParticles({ color, count = 8 }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position:"absolute",
          left: `${10 + Math.random() * 80}%`,
          top:  `${20 + Math.random() * 60}%`,
          width:  `${3 + Math.random() * 4}px`,
          height: `${3 + Math.random() * 4}px`,
          borderRadius: "50%",
          background: color,
          opacity: 0.6,
          animation: `particle-float ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// Composant Badge de rang (affiché dans le header)
export function RangBadge({ aura, lang }) {
  const L = lang === "en";
  if (!aura || aura.rangId === "F") return null;
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:`${aura.color}18`, border:`1.5px solid ${aura.border}`,
      borderRadius:20, padding:"4px 12px",
      animation: aura.animation ? "badge-glow 2s ease-in-out infinite" : "none",
    }}>
      <div style={{
        width:7, height:7, borderRadius:"50%", background:aura.color,
        boxShadow:`0 0 6px ${aura.glow}`,
        animation: aura.intensity >= 3 ? "badge-glow 1.5s ease-in-out infinite" : "none"
      }}/>
      <span style={{ fontSize:11, fontWeight:800, color:aura.color, letterSpacing:.5 }}>
        {aura.badge}
      </span>
    </div>
  );
}

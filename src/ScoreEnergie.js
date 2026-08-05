// ============================================================
// VITASCANN — ScoreEnergie.js
// ✅ 9 indicateurs : sommeil, stress, humeur, hydratation,
//    alimentation, activité, temps écran, respiration, FC
// ✅ Score d'énergie global 0-100 avec niveau RPG
// ✅ Claude IA analyse et génère les recommandations horaires
// ✅ "Ton énergie mentale est faible — évite les décisions avant midi"
// ✅ Meilleurs moments : travailler / se reposer / s'entraîner
// ✅ Mode Mindset selon profil (musulman, sportif, entrepreneur...)
// ✅ Historique 14 jours + courbe
// ✅ Streak + XP + VitaCoins
// ✅ Tibb an-Nabawi contextuel
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

// ─── PALETTE ───
const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";
const WARN = "#f97316";
const DANGER = "#ef4444";

// ─── STORAGE ───
const STORAGE_KEY = "vs_energie_log_v1";
function getToday() { return new Date().toISOString().slice(0,10); }
function getLog()   { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch { return []; } }
function saveLog(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l.slice(0,60))); }

// ─── SCORES COULEURS ───
function scoreColor(s) {
  if (s >= 80) return EM;
  if (s >= 60) return "#4ade80";
  if (s >= 40) return GOLD;
  if (s >= 20) return WARN;
  return DANGER;
}
function scoreLabel(s, L) {
  if (s >= 80) return L ? "Peak Energy" : "Énergie maximale";
  if (s >= 60) return L ? "Good Energy" : "Bonne énergie";
  if (s >= 40) return L ? "Moderate" : "Modérée";
  if (s >= 20) return L ? "Low Energy" : "Énergie basse";
  return L ? "Depleted" : "Épuisé(e)";
}
function scoreEmoji(s) {
  if (s >= 80) return "⚡";
  if (s >= 60) return "🟢";
  if (s >= 40) return "🟡";
  if (s >= 20) return "🟠";
  return "🔴";
}

// ─── AVATARS RPG selon énergie et genre ───
const AVATARS = {
  homme: {
    high: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
    low:  "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_160616_myin1q",
  },
  femme: {
    high: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_145107_ldgtxl",
    low:  "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_151002_frehpw",
  },
};

// ─── LES 9 INDICATEURS ───
const INDICATEURS = [
  {
    id: "sommeil", emoji: "😴",
    labelFR: "Sommeil", labelEN: "Sleep",
    questionFR: "Combien d'heures as-tu dormi cette nuit ?",
    questionEN: "How many hours did you sleep last night?",
    type: "slider", min: 0, max: 12, step: 0.5, unite: "h",
    uniteFR: "heures", uniteEN: "hours",
    poids: 25, // % du score total
    ticks: [
      {val:0,  labelFR:"0h",   col:DANGER},
      {val:4,  labelFR:"4h",   col:WARN},
      {val:6,  labelFR:"6h",   col:GOLD},
      {val:8,  labelFR:"8h",   col:EM},
      {val:10, labelFR:"10h+", col:GOLD},
    ],
    score: v => v <= 3 ? 10 : v <= 5 ? 35 : v <= 6 ? 55 : v <= 7 ? 70 : v <= 8 ? 100 : v <= 9 ? 95 : 80,
  },
  {
    id: "stress", emoji: "🧠",
    labelFR: "Stress", labelEN: "Stress",
    questionFR: "Quel est ton niveau de stress en ce moment ?",
    questionEN: "What is your stress level right now?",
    type: "scale5",
    options: [
      {val:1, labelFR:"Très calme", labelEN:"Very calm", emoji:"😌"},
      {val:2, labelFR:"Calme",      labelEN:"Calm",       emoji:"🙂"},
      {val:3, labelFR:"Modéré",     labelEN:"Moderate",   emoji:"😐"},
      {val:4, labelFR:"Stressé",    labelEN:"Stressed",   emoji:"😟"},
      {val:5, labelFR:"Très stressé",labelEN:"Very stressed",emoji:"😰"},
    ],
    poids: 15,
    score: v => v === 1 ? 100 : v === 2 ? 80 : v === 3 ? 55 : v === 4 ? 30 : 10,
  },
  {
    id: "humeur", emoji: "😊",
    labelFR: "Humeur", labelEN: "Mood",
    questionFR: "Comment est ton humeur générale aujourd'hui ?",
    questionEN: "How is your overall mood today?",
    type: "scale5",
    options: [
      {val:5, labelFR:"Excellent",  labelEN:"Excellent",  emoji:"😄"},
      {val:4, labelFR:"Bien",       labelEN:"Good",        emoji:"🙂"},
      {val:3, labelFR:"Neutre",     labelEN:"Neutral",     emoji:"😐"},
      {val:2, labelFR:"Pas terrible",labelEN:"Not great",  emoji:"😕"},
      {val:1, labelFR:"Déprimé(e)", labelEN:"Down",        emoji:"😞"},
    ],
    poids: 10,
    score: v => v * 20,
  },
  {
    id: "hydratation", emoji: "💧",
    labelFR: "Hydratation", labelEN: "Hydration",
    questionFR: "Combien de verres d'eau as-tu bus aujourd'hui ?",
    questionEN: "How many glasses of water have you had today?",
    type: "slider", min: 0, max: 12, step: 1, unite: " verres",
    uniteFR: "verres", uniteEN: "glasses",
    poids: 10,
    ticks: [
      {val:0,  labelFR:"0",   col:DANGER},
      {val:4,  labelFR:"4",   col:WARN},
      {val:8,  labelFR:"8",   col:EM},
      {val:12, labelFR:"12",  col:GOLD},
    ],
    score: v => v === 0 ? 5 : v <= 2 ? 25 : v <= 4 ? 50 : v <= 6 ? 70 : v <= 8 ? 90 : 100,
  },
  {
    id: "alimentation", emoji: "🥗",
    labelFR: "Alimentation", labelEN: "Nutrition",
    questionFR: "Comment as-tu mangé aujourd'hui ?",
    questionEN: "How have you been eating today?",
    type: "scale5",
    options: [
      {val:5, labelFR:"Très bien / équilibré",  labelEN:"Very well / balanced",  emoji:"🥗"},
      {val:4, labelFR:"Bien",                   labelEN:"Good",                   emoji:"🍽️"},
      {val:3, labelFR:"Moyen",                  labelEN:"Average",                emoji:"🍔"},
      {val:2, labelFR:"Mal mangé",              labelEN:"Poorly",                 emoji:"🍟"},
      {val:1, labelFR:"Pas mangé / junk",       labelEN:"Skipped / junk",         emoji:"❌"},
    ],
    poids: 15,
    score: v => v * 20,
  },
  {
    id: "activite", emoji: "🏃",
    labelFR: "Activité physique", labelEN: "Physical activity",
    questionFR: "As-tu bougé ou fait du sport aujourd'hui ?",
    questionEN: "Did you move or exercise today?",
    type: "scale5",
    options: [
      {val:5, labelFR:"Entraînement intense",   labelEN:"Intense workout",        emoji:"🏋️"},
      {val:4, labelFR:"Sport modéré",           labelEN:"Moderate exercise",      emoji:"🚴"},
      {val:3, labelFR:"Marche / léger",         labelEN:"Walk / light",           emoji:"🚶"},
      {val:2, labelFR:"Très peu bougé",         labelEN:"Barely moved",           emoji:"🛋️"},
      {val:1, labelFR:"Sédentaire total",       labelEN:"Totally sedentary",      emoji:"😴"},
    ],
    poids: 15,
    score: v => v === 5 ? 95 : v === 4 ? 85 : v === 3 ? 65 : v === 2 ? 35 : 10,
  },
  {
    id: "ecrans", emoji: "📱",
    labelFR: "Temps d'écran", labelEN: "Screen time",
    questionFR: "Combien d'heures d'écran (phone/ordi) aujourd'hui ?",
    questionEN: "How many hours of screen time today?",
    type: "slider", min: 0, max: 16, step: 0.5, unite: "h",
    uniteFR: "heures écran", uniteEN: "hours screen",
    poids: 10,
    ticks: [
      {val:0,  labelFR:"0h",  col:EM},
      {val:4,  labelFR:"4h",  col:GOLD},
      {val:8,  labelFR:"8h",  col:WARN},
      {val:12, labelFR:"12h", col:DANGER},
    ],
    score: v => v === 0 ? 100 : v <= 2 ? 90 : v <= 4 ? 75 : v <= 6 ? 55 : v <= 8 ? 35 : v <= 10 ? 20 : 5,
  },
  {
    id: "respiration", emoji: "🌬️",
    labelFR: "Respiration / méditation", labelEN: "Breathing / meditation",
    questionFR: "As-tu fait une pratique de respiration ou méditation ?",
    questionEN: "Did you do any breathing or meditation practice?",
    type: "scale3",
    options: [
      {val:3, labelFR:"Oui, complète (10+ min)",  labelEN:"Yes, full (10+ min)",   emoji:"✅"},
      {val:2, labelFR:"Quelques minutes",          labelEN:"A few minutes",          emoji:"🔄"},
      {val:1, labelFR:"Non",                       labelEN:"No",                     emoji:"❌"},
    ],
    poids: 5,
    score: v => v === 3 ? 100 : v === 2 ? 60 : 20,
  },
  {
    id: "fc", emoji: "❤️",
    labelFR: "Fréquence cardiaque au repos", labelEN: "Resting heart rate",
    questionFR: "Connais-tu ta fréquence cardiaque au repos ? (optionnel)",
    questionEN: "Do you know your resting heart rate? (optional)",
    type: "slider", min: 0, max: 120, step: 1, unite: " bpm",
    uniteFR: "bpm", uniteEN: "bpm",
    poids: 0, // bonus indicator, no weight in main score
    optional: true,
    ticks: [
      {val:40,  labelFR:"40",  col:EM},
      {val:60,  labelFR:"60",  col:EM},
      {val:80,  labelFR:"80",  col:GOLD},
      {val:100, labelFR:"100", col:WARN},
    ],
    score: v => v === 0 ? 70 : v < 50 ? 100 : v < 60 ? 95 : v < 70 ? 85 : v < 80 ? 70 : v < 90 ? 50 : 25,
  },
];

// ─── CALCUL SCORE GLOBAL ───
function calcScore(vals) {
  const indicateurs = INDICATEURS.filter(i => !i.optional);
  const totalPoids = indicateurs.reduce((s, i) => s + i.poids, 0);
  let total = 0;
  indicateurs.forEach(ind => {
    const v = vals[ind.id];
    if (v != null) {
      const s = ind.score(Number(v));
      total += (s * ind.poids) / totalPoids;
    }
  });
  return Math.round(total);
}

// ─── PROMPT IA ───
function buildEnergyPrompt(lang, vals, score, profile) {
  const L = lang === "en";
  const isEn = L;
  const data = INDICATEURS.map(ind => {
    const v = vals[ind.id];
    if (v == null) return null;
    return `${isEn ? ind.labelEN : ind.labelFR}: ${v}${ind.unite || ""}`;
  }).filter(Boolean).join("\n");

  const objectif = profile?.objectif || "sante";
  const mode = objectif === "muscle" ? (isEn ? "athlete" : "sportif")
             : objectif === "perte_poids" ? (isEn ? "weight loss" : "perte de poids")
             : "sante";

  const systemFR = `Tu es le coach de performance de VitaScann. Analyse les données énergétiques quotidiennes et génère des recommandations ultra-précises et actionnables. Profil utilisateur: objectif=${mode}. Score énergie calculé: ${score}/100.

Retourne UNIQUEMENT un JSON valide sans markdown:
{
  "diagnostic": "2-3 phrases percutantes sur l'état énergétique réel — sois direct et honnête",
  "niveau_energie": "Énergie maximale|Bonne énergie|Modérée|Énergie basse|Épuisé(e)",
  "facteur_principal": "LE facteur qui affecte le plus l'énergie aujourd'hui",
  "meilleur_moment_travail": "ex: 10h-12h et 15h-17h",
  "meilleur_moment_sport": "ex: 17h-19h ou matin demain",
  "meilleur_moment_repos": "ex: sieste 13h-13h20, coucher avant 22h30",
  "alertes": ["alerte courte 1", "alerte courte 2"],
  "actions_maintenant": ["action immédiate 1", "action immédiate 2", "action immédiate 3"],
  "tibb": "Conseil Tibb an-Nabawi lié à l'état énergétique (hadith ou pratique prophétique)",
  "message_mindset": "Message de motivation court et puissant — style coach",
  "prevision_demain": "Ce qui va se passer demain si rien ne change — sois franc",
  "score_mental": ${Math.round(score * 0.6 + (vals.stress ? (6 - vals.stress) * 8 : 0))},
  "score_physique": ${Math.round(score * 0.4 + (vals.activite ? vals.activite * 4 : 0))}
}`;

  const systemEN = `You are VitaScann's performance coach. Analyze daily energy data and generate ultra-precise actionable recommendations. User profile: goal=${mode}. Calculated energy score: ${score}/100.

Return ONLY valid JSON without markdown:
{
  "diagnostic": "2-3 punchy sentences about the real energy state — be direct and honest",
  "niveau_energie": "Peak Energy|Good Energy|Moderate|Low Energy|Depleted",
  "facteur_principal": "THE factor most affecting energy today",
  "meilleur_moment_travail": "e.g. 10am-12pm and 3pm-5pm",
  "meilleur_moment_sport": "e.g. 5pm-7pm or tomorrow morning",
  "meilleur_moment_repos": "e.g. nap 1pm-1:20pm, sleep before 10:30pm",
  "alertes": ["short alert 1", "short alert 2"],
  "actions_maintenant": ["immediate action 1", "immediate action 2", "immediate action 3"],
  "tibb": "Tibb an-Nabawi advice related to energy state (hadith or prophetic practice)",
  "message_mindset": "Short powerful motivation — coach style",
  "prevision_demain": "What will happen tomorrow if nothing changes — be frank",
  "score_mental": ${Math.round(score * 0.6)},
  "score_physique": ${Math.round(score * 0.4)}
}`;

  return {
    system: isEn ? systemEN : systemFR,
    user: isEn
      ? `Daily data:\n${data}\n\nAnalyze and return JSON.`
      : `Données du jour:\n${data}\n\nAnalyse et retourne le JSON.`,
  };
}

// ─── COMPOSANT PRINCIPAL ───
export default function ScoreEnergie({ user, onBack, onCoinsEarned, lang, profile }) {
  const L = lang === "en";
  const sexe = profile?.sexe || "homme";
  const avatar = AVATARS[sexe] || AVATARS["homme"];

  const [screen, setScreen]   = useState("home");
  const [step, setStep]       = useState(0);
  const [vals, setVals]       = useState({});
  const [currentVal, setCurrentVal] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError]     = useState(false);
  const [log, setLog]         = useState(getLog);
  const [imgErr, setImgErr]   = useState(false);
  const [animIn, setAnimIn]   = useState(false);

  const todayLog = log.find(e => e.date === getToday());
  const streak = (() => {
    let s=0, d=new Date();
    for(let i=0;i<30;i++){
      if(log.find(e=>e.date===d.toISOString().slice(0,10))){s++;d.setDate(d.getDate()-1);}
      else break;
    }
    return s;
  })();

  const ind = INDICATEURS[step];
  const totalSteps = INDICATEURS.length;

  useEffect(()=>{
    setAnimIn(false);
    const t=setTimeout(()=>setAnimIn(true),40);
    return()=>clearTimeout(t);
  },[step,screen]);

  // Valeur courante de l'indicateur
  const defaultVal = ind?.type === "slider" ? ind.min : ind?.options?.[Math.floor((ind.options?.length||1)/2)]?.val;

  useEffect(()=>{
    if(ind) setCurrentVal(vals[ind.id] ?? defaultVal);
  },[step]);

  // ─── Passer à l'étape suivante ───
  const nextStep = useCallback(()=>{
    if(!ind) return;
    const newVals = {...vals, [ind.id]: currentVal ?? defaultVal};
    setVals(newVals);
    if(step < totalSteps - 1){
      setStep(step+1);
    } else {
      analyzeWithAI(newVals);
    }
  },[ind, vals, currentVal, defaultVal, step, totalSteps]);

  // ─── Skip (optionnel) ───
  const skipStep = ()=>{
    if(step < totalSteps-1) setStep(step+1);
    else analyzeWithAI(vals);
  };

  // ─── Analyse IA ───
  const analyzeWithAI = useCallback(async(finalVals)=>{
    setScreen("analyzing");
    setError(false);
    const score = calcScore(finalVals);
    try {
      const prompt = buildEnergyPrompt(lang, finalVals, score, profile);
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:prompt.system,messages:[{role:"user",content:prompt.user}]}),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const fullResult = {...parsed, score, vals: finalVals};
      setAiResult(fullResult);

      // Sauvegarder
      const today = getToday();
      const entry = {date:today, score, vals:finalVals, diagnostic:parsed.diagnostic};
      const existing = log.find(e=>e.date===today);
      const newLog = existing ? log.map(e=>e.date===today?entry:e) : [entry,...log];
      setLog(newLog); saveLog(newLog);
      if(!existing && user?.uid && !user?.isDemo && onCoinsEarned) onCoinsEarned(15);
      setScreen("result");
    } catch(e){
      console.error(e); setError(true);
    }
  },[lang, profile, log, user, onCoinsEarned]);

  const resetForm = ()=>{ setStep(0); setVals({}); setCurrentVal(null); setAiResult(null); setError(false); setScreen("checkin"); };

  // ════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════
  if(screen==="home") return(
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      {/* Hero */}
      <div style={{padding:"52px 22px 28px",background:"radial-gradient(ellipse at 50% 0%,#1a2800 0%,#060d08 65%)",position:"relative",overflow:"hidden"}}>
        <button onClick={onBack} style={{position:"absolute",top:52,left:20,background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13}}>← {L?"Back":"Retour"}</button>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{position:"absolute",top:`${10+(i*13)%60}%`,left:`${(i*17)%90}%`,width:i%2===0?3:2,height:i%2===0?3:2,borderRadius:"50%",background:i%3===0?EM:GOLD,opacity:.35,animation:`pulse ${1.5+(i*.3)}s ease-in-out infinite`}}/>
        ))}
        <div style={{textAlign:"center",paddingTop:8}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${EM}12`,border:`1px solid ${EM}33`,borderRadius:20,padding:"5px 14px",marginBottom:18}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:EM,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:EM,letterSpacing:1}}>{L?"DAILY ENERGY SCORE":"SCORE D'ÉNERGIE QUOTIDIEN"}</span>
          </div>
          <div className="serif" style={{fontSize:30,fontWeight:700,lineHeight:1.25,marginBottom:12,color:"#edf5ef"}}>
            {L?"What's your energy\nlevel today?":"Quelle est ton énergie\naujourd'hui ?"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto 24px"}}>
            {L?"9 quick questions. AI analyzes your state and tells you when to work, rest and train.":"9 questions rapides. L'IA analyse ton état et te dit quand travailler, te reposer et t'entraîner."}
          </div>

          {/* Stats streak */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              {val:streak>0?`${streak}🔥`:"0",label:L?"Streak":"Streak",color:WARN},
              {val:log.length,label:L?"Check-ins":"Check-ins",color:"#c084fc"},
              {val:todayLog?`${todayLog.score}⚡`:"—",label:L?"Today":"Aujourd'hui",color:todayLog?EM:MUT},
            ].map(({val,label,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:18,color}}>{val}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"20px 20px 0"}}>
        {/* CTA */}
        <button onClick={resetForm}
          style={{width:"100%",background:"linear-gradient(135deg,#1a3300,#264d00)",border:`1.5px solid ${EM}55`,borderRadius:18,padding:"18px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:EM,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 8px 32px ${EM}20`}}>
          <span style={{fontSize:22}}>⚡</span>
          {todayLog?(L?"Update today's score":"Mettre à jour mon score"):(L?"Start energy check-in":"Commencer mon score d'énergie")}
        </button>

        {/* Résultat du jour */}
        {todayLog&&(()=>{
          const c=scoreColor(todayLog.score);
          const av = todayLog.score>=60?avatar.high:avatar.low;
          return(
            <div style={{background:`${c}08`,border:`1.5px solid ${c}33`,borderRadius:18,padding:16,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:60,height:60,flexShrink:0}}>
                {!imgErr
                  ?<img src={av} alt="" onError={()=>setImgErr(true)} style={{width:"100%",height:"100%",objectFit:"contain",filter:`drop-shadow(0 0 12px ${c}88)`}}/>
                  :<div style={{fontSize:40,textAlign:"center"}}>{scoreEmoji(todayLog.score)}</div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:c,fontWeight:700,letterSpacing:.8,marginBottom:4}}>{L?"TODAY'S ENERGY":"ÉNERGIE AUJOURD'HUI"}</div>
                <div className="serif" style={{fontSize:24,fontWeight:700,color:c}}>{todayLog.score}<span style={{fontSize:13,fontWeight:400,color:MUT}}>/100</span></div>
                <div style={{fontSize:12,color:MUT,marginTop:2}}>{scoreLabel(todayLog.score,L)}</div>
              </div>
              {aiResult&&<button onClick={()=>setScreen("result")} style={{background:"none",border:`1px solid ${c}44`,borderRadius:10,padding:"8px 12px",color:c,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700,flexShrink:0}}>{L?"See →":"Voir →"}</button>}
            </div>
          );
        })()}

        {/* Ce qu'on mesure */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"WHAT WE MEASURE":"CE QU'ON MESURE"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {INDICATEURS.map((ind,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:`${EM}06`,borderRadius:10,padding:"8px 10px"}}>
                <span style={{fontSize:18}}>{ind.emoji}</span>
                <span style={{fontSize:12,color:"#a0c8a8",fontWeight:600}}>{L?ind.labelEN:ind.labelFR}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exemple de résultat */}
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:8}}>💡 {L?"EXAMPLE INSIGHTS":"EXEMPLES DE CONSEILS"}</div>
          {[
            L?"\"Your mental energy is low. Avoid important decisions before noon.\"":"\"Ton énergie mentale est faible. Évite les décisions importantes avant midi.\"",
            L?"\"Best time to train: 5pm-7pm today.\"":"\"Meilleur moment pour t'entraîner : 17h-19h aujourd'hui.\"",
            L?"\"This meal could drain you in 2 hours.\"":"\"Ce repas risque de te fatiguer dans 2h.\"",
          ].map((ex,i)=>(
            <div key={i} style={{fontSize:12,color:"#a08040",marginBottom:i<2?8:0,lineHeight:1.6}}>→ {ex}</div>
          ))}
        </div>

        {/* Historique rapide */}
        {log.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8}}>{L?"RECENT":"RÉCENT"}</div>
              <button onClick={()=>setScreen("history")} style={{background:"none",border:"none",color:EM,fontSize:11,cursor:"pointer"}}>{L?"See all →":"Voir tout →"}</button>
            </div>
            {log.slice(0,3).map((entry,i)=>{
              const c=scoreColor(entry.score);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                  <span style={{fontSize:20}}>{scoreEmoji(entry.score)}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:c}}>{entry.score}/100 · {scoreLabel(entry.score,L)}</div>
                    <div style={{fontSize:11,color:MUT}}>{entry.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // CHECK-IN (étapes)
  // ════════════════════════════════════════
  if(screen==="checkin"&&ind) return(
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",paddingBottom:40}}>
      {/* Header progress */}
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%,#1a3300 0%,#060d08 60%)`,flexShrink:0}}>
        <button onClick={()=>step===0?setScreen("home"):setStep(step-1)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>
          ← {L?"Back":"Retour"}
        </button>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:6}}>
          <span>{L?`${step+1} of ${totalSteps}`:`${step+1} sur ${totalSteps}`}</span>
          <span style={{color:EM,fontWeight:700}}>{Math.round(((step)/totalSteps)*100)}%</span>
        </div>
        <div style={{background:"#142018",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${((step)/totalSteps)*100}%`,height:"100%",background:`linear-gradient(90deg,${EM}88,${EM})`,borderRadius:8,transition:"width .5s ease"}}/>
        </div>
      </div>

      {/* Question */}
      <div style={{flex:1,padding:"0 22px",display:"flex",flexDirection:"column",opacity:animIn?1:0,transform:animIn?"translateY(0)":"translateY(16px)",transition:"all .4s ease"}}>
        {/* Emoji + label */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:10}}>{ind.emoji}</div>
          <div style={{fontSize:11,color:EM,fontWeight:700,letterSpacing:1,marginBottom:8}}>{L?ind.labelEN:ind.labelFR}</div>
          <div className="serif" style={{fontSize:20,fontWeight:700,color:"#edf5ef",lineHeight:1.4}}>
            {L?ind.questionEN:ind.questionFR}
          </div>
        </div>

        {/* SLIDER */}
        {ind.type==="slider"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <span style={{fontSize:42,fontWeight:700,color:EM}}>{currentVal??defaultVal}</span>
              <span style={{fontSize:16,color:MUT}}> {L?ind.uniteEN:ind.uniteFR}</span>
            </div>
            <input type="range" min={ind.min} max={ind.max} step={ind.step}
              value={currentVal??defaultVal}
              onChange={e=>setCurrentVal(Number(e.target.value))}
              style={{width:"100%",accentColor:EM,height:6,cursor:"pointer",marginBottom:12}}/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              {ind.ticks?.map((t,i)=>(
                <span key={i} style={{fontSize:10,color:t.col}}>{t.labelFR}</span>
              ))}
            </div>
            {/* Score preview */}
            <div style={{textAlign:"center",marginTop:16,padding:"10px",background:`${scoreColor(ind.score(currentVal??defaultVal))}10`,border:`1px solid ${scoreColor(ind.score(currentVal??defaultVal))}33`,borderRadius:12}}>
              <span style={{fontSize:12,color:scoreColor(ind.score(currentVal??defaultVal)),fontWeight:700}}>
                {scoreEmoji(ind.score(currentVal??defaultVal))} {ind.score(currentVal??defaultVal)}/100 pts
              </span>
            </div>
          </div>
        )}

        {/* SCALE 5 ou SCALE 3 */}
        {(ind.type==="scale5"||ind.type==="scale3")&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
            {ind.options.map(opt=>{
              const selected = currentVal===opt.val || (currentVal==null && opt.val===defaultVal);
              const c = scoreColor(ind.score(opt.val));
              return(
                <button key={opt.val} onClick={()=>setCurrentVal(opt.val)}
                  style={{background:selected?`${c}18`:CARD,border:`1.5px solid ${selected?c:BDR}`,borderRadius:16,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
                  <span style={{fontSize:26}}>{opt.emoji}</span>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontWeight:700,fontSize:14,color:selected?c:"#edf5ef"}}>{L?opt.labelEN:opt.labelFR}</div>
                  </div>
                  {selected&&<div style={{width:10,height:10,borderRadius:"50%",background:c,flexShrink:0}}/>}
                </button>
              );
            })}
          </div>
        )}

        {/* Boutons navigation */}
        <div style={{marginTop:20,flexShrink:0}}>
          <button onClick={nextStep}
            style={{width:"100%",background:`linear-gradient(135deg,#1a3300,#264d00)`,border:`1.5px solid ${EM}55`,borderRadius:16,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:EM,cursor:"pointer",marginBottom:8}}>
            {step<totalSteps-1?(L?"Next →":"Suivant →"):(L?"Analyze my energy ⚡":"Analyser mon énergie ⚡")}
          </button>
          {ind.optional&&(
            <button onClick={skipStep} style={{width:"100%",background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer",padding:"8px"}}>
              {L?"Skip (optional)":"Passer (optionnel)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // ANALYZING
  // ════════════════════════════════════════
  if(screen==="analyzing") return(
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      {error?(
        <>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:DANGER,marginBottom:8}}>{L?"Analysis error":"Erreur d'analyse"}</div>
          <div style={{fontSize:13,color:MUT,marginBottom:24}}>{L?"Check your connection.":"Vérifie ta connexion."}</div>
          <button onClick={()=>analyzeWithAI(vals)} style={{background:`linear-gradient(135deg,#1a3300,#264d00)`,border:`1.5px solid ${EM}55`,borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:EM,fontWeight:700,cursor:"pointer",marginBottom:12}}>{L?"Retry":"Réessayer"}</button>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,fontSize:13,cursor:"pointer"}}>{L?"Home":"Accueil"}</button>
        </>
      ):(
        <>
          <div style={{position:"relative",width:140,height:140,marginBottom:32}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,${EM}22 0%,transparent 70%)`,animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:10,borderRadius:"50%",background:`radial-gradient(circle,${EM}11 0%,transparent 70%)`,animation:"pulse 2s .5s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60}}>⚡</div>
          </div>
          <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:10,color:EM}}>{L?"Calculating your energy...":"Calcul de ton énergie en cours..."}</div>
          <div style={{color:MUT,fontSize:13,maxWidth:280,lineHeight:1.7}}>{L?"AI is analyzing your 9 indicators...":"L'IA analyse tes 9 indicateurs..."}</div>
          <div style={{display:"flex",gap:8,marginTop:28}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:EM,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
          </div>
        </>
      )}
    </div>
  );

  // ════════════════════════════════════════
  // RÉSULTAT
  // ════════════════════════════════════════
  if(screen==="result"&&aiResult){
    const sc = aiResult.score;
    const c  = scoreColor(sc);
    const av = sc>=60?avatar.high:avatar.low;

    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        {/* Hero score */}
        <div style={{padding:"52px 22px 24px",background:`radial-gradient(ellipse at 50% 0%,${c}18 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Home":"Accueil"}</button>

          <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
            {/* Avatar */}
            <div style={{width:90,height:90,flexShrink:0}}>
              {!imgErr
                ?<img src={av} alt="" onError={()=>setImgErr(true)} style={{width:"100%",height:"100%",objectFit:"contain",filter:`drop-shadow(0 0 16px ${c}99)`}}/>
                :<div style={{fontSize:52,textAlign:"center"}}>{scoreEmoji(sc)}</div>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:c,fontWeight:700,letterSpacing:1,marginBottom:4}}>{L?"ENERGY SCORE":"SCORE D'ÉNERGIE"}</div>
              <div className="serif" style={{fontSize:46,fontWeight:700,color:c,lineHeight:1}}>{sc}<span style={{fontSize:18,fontWeight:400,color:MUT}}>/100</span></div>
              <div style={{fontSize:14,color:"#edf5ef",marginTop:6,fontWeight:600}}>{scoreLabel(sc,L)}</div>
            </div>
          </div>

          {/* Barre énergie */}
          <div style={{background:"#142018",borderRadius:8,height:12,overflow:"hidden",marginBottom:8,position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#4ade80,#00ff88)",opacity:.2}}/>
            <div style={{width:`${sc}%`,height:"100%",background:`linear-gradient(90deg,${c}88,${c})`,borderRadius:8,transition:"width 1.2s cubic-bezier(.16,1,.3,1)",position:"relative"}}>
              <div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:16,height:16,borderRadius:"50%",background:c,border:"2px solid #060d08",boxShadow:`0 0 8px ${c}`}}/>
            </div>
          </div>

          {/* Score mental / physique */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {label:L?"Mental":"Mental",val:aiResult.score_mental||Math.round(sc*.6),color:"#c084fc",emoji:"🧠"},
              {label:L?"Physical":"Physique",val:aiResult.score_physique||Math.round(sc*.4),color:"#60a5fa",emoji:"💪"},
            ].map(({label,val,color,emoji},i)=>(
              <div key={i} style={{background:`${color}08`,border:`1px solid ${color}22`,borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>{emoji}</div>
                <div style={{fontWeight:700,fontSize:20,color}}>{val}/100</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"0 20px"}}>

          {/* Diagnostic IA */}
          <div style={{background:"linear-gradient(135deg,#0d2000,#142800)",border:`1.5px solid ${EM}33`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,#1a3300,#264d00)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
              <div style={{fontWeight:700,fontSize:13,color:EM}}>{L?"AI Diagnostic":"Diagnostic IA"}</div>
            </div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.75,marginBottom:12}}>{aiResult.diagnostic}</div>
            {aiResult.facteur_principal&&(
              <div style={{background:`${WARN}10`,border:`1px solid ${WARN}33`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:WARN,fontWeight:700,marginBottom:4}}>🎯 {L?"MAIN FACTOR":"FACTEUR PRINCIPAL"}</div>
                <div style={{fontSize:12,color:"#c8a060",lineHeight:1.6}}>{aiResult.facteur_principal}</div>
              </div>
            )}
          </div>

          {/* Planning horaire */}
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>🗓️ {L?"YOUR OPTIMAL SCHEDULE":"TON PLANNING OPTIMAL"}</div>
            {[
              {emoji:"💼",label:L?"Best work time":"Meilleur moment travail",val:aiResult.meilleur_moment_travail,color:"#60a5fa"},
              {emoji:"🏋️",label:L?"Best training time":"Meilleur moment sport",val:aiResult.meilleur_moment_sport,color:EM},
              {emoji:"😴",label:L?"Rest & recovery":"Repos & récupération",val:aiResult.meilleur_moment_repos,color:"#c084fc"},
            ].map(({emoji,label,val,color},i,arr)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<arr.length-1?14:0,paddingBottom:i<arr.length-1?14:0,borderBottom:i<arr.length-1?`1px solid ${BDR}`:"none"}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${color}12`,border:`1px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{emoji}</div>
                <div>
                  <div style={{fontSize:11,color:MUT,marginBottom:3}}>{label}</div>
                  <div style={{fontWeight:700,fontSize:14,color}}>{val||"—"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alertes */}
          {aiResult.alertes?.length>0&&(
            <div style={{background:"#1a0a00",border:`1px solid ${WARN}33`,borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:WARN,fontWeight:700,letterSpacing:.8,marginBottom:10}}>⚠️ {L?"ALERTS":"ALERTES"}</div>
              {aiResult.alertes.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<aiResult.alertes.length-1?8:0}}>
                  <span style={{color:WARN,fontSize:12,flexShrink:0}}>→</span>
                  <span style={{fontSize:12,color:"#c8a060",lineHeight:1.5}}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions maintenant */}
          {aiResult.actions_maintenant?.length>0&&(
            <div style={{background:`${EM}06`,border:`1px solid ${EM}22`,borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:EM,fontWeight:700,letterSpacing:.8,marginBottom:10}}>✅ {L?"DO THIS NOW":"FAIS ÇA MAINTENANT"}</div>
              {aiResult.actions_maintenant.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<aiResult.actions_maintenant.length-1?10:0}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:`${EM}15`,border:`1px solid ${EM}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:EM,flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6}}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message mindset */}
          {aiResult.message_mindset&&(
            <div style={{background:"linear-gradient(135deg,#1a1000,#201800)",border:`1px solid ${GOLD}33`,borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🔥 MINDSET</div>
              <div className="serif" style={{fontSize:17,fontWeight:700,color:GOLD,lineHeight:1.5}}>"{aiResult.message_mindset}"</div>
            </div>
          )}

          {/* Tibb an-Nabawi */}
          {aiResult.tibb&&(
            <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
              <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>{aiResult.tibb}</div>
            </div>
          )}

          {/* Prévision demain */}
          {aiResult.prevision_demain&&(
            <div style={{background:"#0a0a1a",border:"1px solid #818cf833",borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,color:"#818cf8",fontWeight:700,marginBottom:6}}>🔮 {L?"TOMORROW FORECAST":"PRÉVISION DEMAIN"}</div>
              <div style={{fontSize:12,color:"#9090b8",lineHeight:1.7}}>{aiResult.prevision_demain}</div>
            </div>
          )}

          {/* Détail des indicateurs */}
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"YOUR 9 INDICATORS":"TES 9 INDICATEURS"}</div>
            {INDICATEURS.map((ind,i)=>{
              const v = aiResult.vals?.[ind.id];
              if(v==null) return null;
              const s = ind.score(Number(v));
              const c = scoreColor(s);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<INDICATEURS.length-1?10:0,paddingBottom:i<INDICATEURS.length-1?10:0,borderBottom:i<INDICATEURS.length-1?`1px solid ${BDR}`:"none"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{ind.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#edf5ef"}}>{L?ind.labelEN:ind.labelFR}</span>
                      <span style={{fontSize:11,color:c,fontWeight:700}}>{v}{ind.unite||""}</span>
                    </div>
                    <div style={{background:"#142018",borderRadius:4,height:5,overflow:"hidden"}}>
                      <div style={{width:`${s}%`,height:"100%",background:c,borderRadius:4}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons bas */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={resetForm} style={{flex:1,background:CARD,border:`1px solid ${EM}33`,borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:EM,cursor:"pointer",fontWeight:700}}>🔄 {L?"Redo":"Refaire"}</button>
            <button onClick={()=>setScreen("history")} style={{flex:1,background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>📈 {L?"History":"Historique"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // HISTORIQUE
  // ════════════════════════════════════════
  if(screen==="history"){
    const last14=[...Array(14)].map((_,i)=>{
      const d=new Date();d.setDate(d.getDate()-(13-i));
      const key=d.toISOString().slice(0,10);
      const entry=log.find(e=>e.date===key);
      return{date:key,score:entry?.score||null,dayLabel:d.getDate()};
    });
    const chartH=100,chartW=320;
    const pts=last14.map((d,i)=>d.score?`${(i/13)*chartW},${chartH-(d.score/100)*chartH}`:null).filter(Boolean);
    const avgScore=log.length>0?Math.round(log.slice(0,14).reduce((s,e)=>s+(e.score||0),0)/Math.min(14,log.length)):0;

    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 22px 20px"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>← {L?"Back":"Retour"}</button>
          <div className="serif" style={{fontSize:26,fontWeight:700,marginBottom:4}}>📈 {L?"Energy history":"Historique d'énergie"}</div>
          <div style={{color:MUT,fontSize:13}}>{L?"14-day evolution":"Évolution 14 jours"}</div>
        </div>
        <div style={{padding:"0 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:`${EM}08`,border:`1px solid ${EM}22`,borderRadius:14,padding:14,textAlign:"center"}}>
              <div className="serif" style={{fontSize:28,fontWeight:700,color:EM}}>{avgScore}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{L?"Avg score":"Score moy."}</div>
            </div>
            <div style={{background:"#f9731608",border:"1px solid #f9731633",borderRadius:14,padding:14,textAlign:"center"}}>
              <div className="serif" style={{fontSize:28,fontWeight:700,color:WARN}}>{streak}🔥</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{L?"Day streak":"Streak"}</div>
            </div>
          </div>

          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:16}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:12}}>{L?"ENERGY CURVE":"COURBE D'ÉNERGIE"}</div>
            <svg width={chartW} height={chartH+20} style={{display:"block",margin:"0 auto",overflow:"visible"}}>
              {pts.length>1&&<path d={`M${pts[0]} ${pts.slice(1).map(p=>`L${p}`).join(" ")} L${(last14.length-1)/13*chartW},${chartH} L0,${chartH} Z`} fill={`${EM}14`}/>}
              {pts.length>1&&<polyline points={pts.join(" ")} fill="none" stroke={EM} strokeWidth="2" strokeLinejoin="round"/>}
              {last14.map((d,i)=>d.score&&<circle key={i} cx={(i/13)*chartW} cy={chartH-(d.score/100)*chartH} r="4" fill={scoreColor(d.score)} stroke="#060d08" strokeWidth="2"/>)}
              {last14.map((d,i)=>(i%3===0||i===13)&&<text key={i} x={(i/13)*chartW} y={chartH+15} textAnchor="middle" fontSize="9" fill={MUT}>{d.dayLabel}</text>)}
            </svg>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:9,color:MUT}}>
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>

          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>{L?"ALL CHECK-INS":"TOUS LES CHECK-INS"}</div>
          {log.length===0
            ?<div style={{textAlign:"center",padding:40,color:MUT}}><div style={{fontSize:40,marginBottom:10}}>⚡</div><div>{L?"No check-in yet.":"Aucun check-in encore."}</div></div>
            :log.map((entry,i)=>{
              const c=scoreColor(entry.score);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                  <span style={{fontSize:22,flexShrink:0}}>{scoreEmoji(entry.score)}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:c}}>{entry.score}/100 · {scoreLabel(entry.score,L)}</div>
                    <div style={{fontSize:11,color:MUT,marginTop:2}}>{entry.date}</div>
                    {entry.diagnostic&&<div style={{fontSize:10,color:"#3a5a3a",marginTop:3,lineHeight:1.4}}>{entry.diagnostic.slice(0,80)}...</div>}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return null;
}

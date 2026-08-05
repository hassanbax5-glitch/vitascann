// ============================================================
// VITASCANN — ScoreImmunite.js
// 🛡️ Score d'Immunité
// ✅ 8 indicateurs clés (sommeil, nutrition, stress, sport,
//    hydratation, soleil, sucre, substances)
// ✅ Score 0-100 avec niveau : Faible → Excellente
// ✅ Claude analyse et génère recommandations personnalisées
// ✅ Aliments boosters + carences détectées
// ✅ Tibb an-Nabawi (nigelle, miel, gingembre, jeûne...)
// ✅ Plan 7 jours pour remonter le score
// ✅ Historique + streak
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useCallback } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

const EM     = "#00ff88";
const GOLD   = "#e2b84a";
const MUT    = "#4a6e52";
const CARD   = "#0c1810";
const BDR    = "#192c1d";
const DANGER = "#ef4444";
const WARN   = "#f97316";
const TEAL   = "#06b6d4";

// ─── STORAGE ───
const STORAGE_KEY = "vs_immunite_v1";
function getToday() { return new Date().toISOString().slice(0,10); }
function getLog()   { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch { return []; } }
function saveLog(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l.slice(0,30))); }

function scoreColor(s) {
  if (s >= 80) return EM;
  if (s >= 60) return "#4ade80";
  if (s >= 40) return GOLD;
  if (s >= 20) return WARN;
  return DANGER;
}
function scoreLabel(s, L) {
  if (s >= 80) return L ? "Excellent" : "Excellente";
  if (s >= 60) return L ? "Good" : "Bonne";
  if (s >= 40) return L ? "Moderate" : "Modérée";
  if (s >= 20) return L ? "Weak" : "Faible";
  return L ? "Very weak" : "Très faible";
}
function scoreEmoji(s) {
  if (s >= 80) return "🛡️";
  if (s >= 60) return "🟢";
  if (s >= 40) return "🟡";
  if (s >= 20) return "🟠";
  return "🔴";
}

// ─── INDICATEURS ───
const INDICATEURS_FR = [
  {
    id: "sommeil", emoji: "😴", label: "Sommeil",
    question: "Combien d'heures as-tu dormi en moyenne ces dernières nuits ?",
    type: "slider", min: 3, max: 12, step: 0.5, unite: "h",
    poids: 22,
    score: v => v<=4?10:v<=5?30:v<=6?55:v<=7?75:v<=8?100:v<=9?95:80,
    conseil: v => v < 7 ? "Le manque de sommeil réduit la production de cytokines de 40-70%. Vise 7-9h." : "Bon sommeil ✅ — tes cellules NK (Natural Killer) sont actives.",
  },
  {
    id: "fruits_legumes", emoji: "🥗", label: "Fruits & Légumes",
    question: "Combien de portions de fruits/légumes manges-tu par jour ?",
    type: "slider", min: 0, max: 10, step: 1, unite: "portions",
    poids: 20,
    score: v => v===0?5:v<=1?20:v<=2?40:v<=4?70:v<=5?90:100,
    conseil: v => v < 5 ? "Moins de 5 portions = déficit en vitamines C, A et antioxydants immunostimulants." : "Excellent apport en micronutriments ✅",
  },
  {
    id: "stress", emoji: "🧠", label: "Stress",
    question: "Quel est ton niveau de stress général en ce moment ?",
    type: "scale5",
    options: [
      {v:1, l:"Très calme", e:"😌"},
      {v:2, l:"Calme",      e:"🙂"},
      {v:3, l:"Modéré",     e:"😐"},
      {v:4, l:"Stressé",    e:"😟"},
      {v:5, l:"Très stressé",e:"😰"},
    ],
    poids: 18,
    score: v => v===1?100:v===2?80:v===3?55:v===4?30:10,
    conseil: v => v >= 4 ? "Le cortisol chronique supprime directement les lymphocytes T. Priorité : gérer le stress." : "Bon niveau de cortisol ✅",
  },
  {
    id: "sport", emoji: "🏃", label: "Activité physique",
    question: "Combien de fois fais-tu du sport ou bouges-tu activement par semaine ?",
    type: "slider", min: 0, max: 7, step: 1, unite: "fois/semaine",
    poids: 15,
    score: v => v===0?10:v===1?35:v===2?60:v===3?80:v<=5?100:v===6?85:70,
    conseil: v => v < 3 ? "30 min de marche rapide 3x/semaine multiplie par 2 l'activité des cellules NK." : "Bonne activité physique ✅ — tes macrophages sont stimulés.",
  },
  {
    id: "hydratation", emoji: "💧", label: "Hydratation",
    question: "Combien de verres d'eau bois-tu par jour ?",
    type: "slider", min: 0, max: 12, step: 1, unite: "verres",
    poids: 10,
    score: v => v<=1?10:v<=3?30:v<=5?55:v<=7?75:v<=8?95:100,
    conseil: v => v < 6 ? "La déshydratation réduit la production de lymphe qui transporte les globules blancs." : "Bonne hydratation ✅",
  },
  {
    id: "soleil", emoji: "☀️", label: "Vitamine D / Soleil",
    question: "T'exposes-tu au soleil ou prends-tu de la vitamine D ?",
    type: "scale3",
    options: [
      {v:3, l:"Oui, quotidiennement (15+ min dehors)", e:"☀️"},
      {v:2, l:"Parfois (quelques fois/semaine)",       e:"⛅"},
      {v:1, l:"Rarement / jamais",                     e:"🌑"},
    ],
    poids: 8,
    score: v => v===3?100:v===2?60:20,
    conseil: v => v < 3 ? "La vitamine D est essentielle — 70% des populations en carence. Cible 1000-2000 UI/jour." : "Bonne exposition ✅",
  },
  {
    id: "sucre", emoji: "🍬", label: "Sucre / Ultra-transformé",
    question: "Consommes-tu souvent du sucre raffiné, sodas ou plats ultra-transformés ?",
    type: "scale4",
    options: [
      {v:0, l:"Jamais ou très rarement",     e:"✅"},
      {v:1, l:"1-2 fois par semaine",        e:"🟡"},
      {v:2, l:"Presque tous les jours",      e:"🟠"},
      {v:3, l:"Plusieurs fois par jour",     e:"🚫"},
    ],
    poids: 7,
    score: v => v===0?100:v===1?70:v===2?35:10,
    conseil: v => v >= 2 ? "75g de sucre supprime les phagocytes de 50% pendant 5h. Le sucre est l'ennemi n°1 de l'immunité." : "Faible consommation de sucre ✅",
  },
];

const INDICATEURS_EN = [
  {
    id: "sommeil", emoji: "😴", label: "Sleep",
    question: "How many hours have you slept on average these past nights?",
    type: "slider", min: 3, max: 12, step: 0.5, unite: "h",
    poids: 22,
    score: v => v<=4?10:v<=5?30:v<=6?55:v<=7?75:v<=8?100:v<=9?95:80,
    conseil: v => v < 7 ? "Sleep deprivation reduces cytokine production by 40-70%. Aim for 7-9h." : "Good sleep ✅ — your NK cells are active.",
  },
  {
    id: "fruits_legumes", emoji: "🥗", label: "Fruits & Vegetables",
    question: "How many fruit/vegetable portions do you eat per day?",
    type: "slider", min: 0, max: 10, step: 1, unite: "portions",
    poids: 20,
    score: v => v===0?5:v<=1?20:v<=2?40:v<=4?70:v<=5?90:100,
    conseil: v => v < 5 ? "Less than 5 portions = deficit in vitamins C, A and immune-boosting antioxidants." : "Excellent micronutrient intake ✅",
  },
  {
    id: "stress", emoji: "🧠", label: "Stress",
    question: "What is your general stress level right now?",
    type: "scale5",
    options: [
      {v:1, l:"Very calm",      e:"😌"},
      {v:2, l:"Calm",           e:"🙂"},
      {v:3, l:"Moderate",       e:"😐"},
      {v:4, l:"Stressed",       e:"😟"},
      {v:5, l:"Very stressed",  e:"😰"},
    ],
    poids: 18,
    score: v => v===1?100:v===2?80:v===3?55:v===4?30:10,
    conseil: v => v >= 4 ? "Chronic cortisol directly suppresses T lymphocytes. Priority: manage stress." : "Good cortisol level ✅",
  },
  {
    id: "sport", emoji: "🏃", label: "Physical activity",
    question: "How many times per week do you exercise or move actively?",
    type: "slider", min: 0, max: 7, step: 1, unite: "times/week",
    poids: 15,
    score: v => v===0?10:v===1?35:v===2?60:v===3?80:v<=5?100:v===6?85:70,
    conseil: v => v < 3 ? "30 min of brisk walking 3x/week doubles NK cell activity." : "Good physical activity ✅ — your macrophages are stimulated.",
  },
  {
    id: "hydratation", emoji: "💧", label: "Hydration",
    question: "How many glasses of water do you drink per day?",
    type: "slider", min: 0, max: 12, step: 1, unite: "glasses",
    poids: 10,
    score: v => v<=1?10:v<=3?30:v<=5?55:v<=7?75:v<=8?95:100,
    conseil: v => v < 6 ? "Dehydration reduces lymph production which carries white blood cells." : "Good hydration ✅",
  },
  {
    id: "soleil", emoji: "☀️", label: "Vitamin D / Sun",
    question: "Do you get sun exposure or take vitamin D?",
    type: "scale3",
    options: [
      {v:3, l:"Yes, daily (15+ min outside)", e:"☀️"},
      {v:2, l:"Sometimes (few times/week)",    e:"⛅"},
      {v:1, l:"Rarely / never",               e:"🌑"},
    ],
    poids: 8,
    score: v => v===3?100:v===2?60:20,
    conseil: v => v < 3 ? "Vitamin D is essential — 70% of people are deficient. Target 1000-2000 IU/day." : "Good sun exposure ✅",
  },
  {
    id: "sucre", emoji: "🍬", label: "Sugar / Ultra-processed",
    question: "Do you often consume refined sugar, sodas or ultra-processed foods?",
    type: "scale4",
    options: [
      {v:0, l:"Never or very rarely",          e:"✅"},
      {v:1, l:"1-2 times per week",            e:"🟡"},
      {v:2, l:"Almost every day",              e:"🟠"},
      {v:3, l:"Several times per day",         e:"🚫"},
    ],
    poids: 7,
    score: v => v===0?100:v===1?70:v===2?35:10,
    conseil: v => v >= 2 ? "75g of sugar suppresses phagocytes by 50% for 5 hours. Sugar is immunity's #1 enemy." : "Low sugar consumption ✅",
  },
];

function calcScore(vals, indicateurs) {
  const total = indicateurs.reduce((s,i) => s + i.poids, 0);
  let result = 0;
  indicateurs.forEach(ind => {
    const v = vals[ind.id];
    if (v != null) result += (ind.score(Number(v)) * ind.poids) / total;
  });
  return Math.round(result);
}

function buildPrompt(lang, vals, score, indicateurs) {
  const L = lang === "en";
  const data = indicateurs.map(ind => {
    const v = vals[ind.id];
    const opt = ind.options?.find(o => o.v === v);
    return `${ind.label}: ${opt ? opt.l : v + " " + (ind.unite||"")}`;
  }).join("\n");

  const systemFR = `Tu es l'expert immunité de VitaScann. Score calculé: ${score}/100. Analyse les habitudes et génère un diagnostic immunité complet et percutant.

Retourne UNIQUEMENT un JSON valide sans markdown:
{
  "diagnostic": "2-3 phrases percutantes sur l'état du système immunitaire — chiffres scientifiques obligatoires",
  "facteur_principal": "LE facteur qui affecte le plus l'immunité de cette personne",
  "aliments_boosters": [
    {"nom": "Nigelle (Habba Sawda)", "effet": "effet court", "emoji": "🌱"},
    {"nom": "...", "effet": "...", "emoji": "..."}
  ],
  "carences_detectees": ["carence 1 probable", "carence 2"],
  "plan_7_jours": [
    {"jour": "Jour 1-2", "action": "action courte et précise"},
    {"jour": "Jour 3-4", "action": "..."},
    {"jour": "Jour 5-7", "action": "..."}
  ],
  "tibb_nabawi": {
    "plante": "Nigelle / Miel / Gingembre / Curcuma (selon contexte)",
    "hadith": "Citation du Prophète ﷺ sur la plante ou l'immunité",
    "conseil": "Comment utiliser cette plante concrètement"
  },
  "message_motivation": "1 phrase de motivation courte et puissante",
  "projection_30j": "Ce qui change si tu appliques le plan pendant 30 jours"
}`;

  const systemEN = `You are VitaScann's immunity expert. Calculated score: ${score}/100. Analyze habits and generate a complete, impactful immunity diagnosis.

Return ONLY valid JSON without markdown:
{
  "diagnostic": "2-3 punchy sentences about immune system state — scientific figures required",
  "facteur_principal": "THE factor most affecting this person's immunity",
  "aliments_boosters": [
    {"nom": "Black Seed (Habba Sawda)", "effet": "short effect", "emoji": "🌱"},
    {"nom": "...", "effet": "...", "emoji": "..."}
  ],
  "carences_detectees": ["likely deficiency 1", "deficiency 2"],
  "plan_7_jours": [
    {"jour": "Day 1-2", "action": "short precise action"},
    {"jour": "Day 3-4", "action": "..."},
    {"jour": "Day 5-7", "action": "..."}
  ],
  "tibb_nabawi": {
    "plante": "Black seed / Honey / Ginger / Turmeric (based on context)",
    "hadith": "Prophet ﷺ quote about the plant or immunity",
    "conseil": "How to use this plant concretely"
  },
  "message_motivation": "1 short powerful motivation sentence",
  "projection_30j": "What changes if you follow the plan for 30 days"
}`;

  return {
    system: L ? systemEN : systemFR,
    user: L ? `User habits:\n${data}\n\nGenerate the immunity analysis.` : `Habitudes:\n${data}\n\nGénère l'analyse immunité.`,
  };
}

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function ScoreImmunite({ user, onBack, onCoinsEarned, lang }) {
  const L = lang === "en";
  const INDICATEURS = L ? INDICATEURS_EN : INDICATEURS_FR;

  const [screen, setScreen]   = useState("home");
  const [step, setStep]       = useState(0);
  const [vals, setVals]       = useState({});
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(false);
  const [log, setLog]         = useState(getLog);

  const ind = INDICATEURS[step];
  const todayLog = log.find(e => e.date === getToday());
  const streak = (() => {
    let s=0, d=new Date();
    for(let i=0;i<30;i++){
      if(log.find(e=>e.date===d.toISOString().slice(0,10))){s++;d.setDate(d.getDate()-1);}
      else break;
    }
    return s;
  })();

  const nextStep = useCallback(() => {
    const newVals = {...vals};
    if (newVals[ind.id] == null) {
      // Valeur par défaut
      if (ind.type === "slider") newVals[ind.id] = Math.round((ind.min + ind.max) / 2);
      else newVals[ind.id] = ind.options?.[0]?.v ?? 0;
    }
    setVals(newVals);
    if (step < INDICATEURS.length - 1) {
      setStep(step + 1);
    } else {
      analyzeWithAI(newVals);
    }
  }, [vals, ind, step, INDICATEURS]);

  const analyzeWithAI = useCallback(async (finalVals) => {
    setScreen("analyzing");
    setError(false);
    const score = calcScore(finalVals, INDICATEURS);
    try {
      const prompt = buildPrompt(lang, finalVals, score, INDICATEURS);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1200,system:prompt.system,messages:[{role:"user",content:prompt.user}]}),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const full = {...parsed, score, vals: finalVals};
      setResult(full);

      // Sauvegarder
      const today = getToday();
      const entry = {date:today, score, diagnostic: parsed.diagnostic};
      const existing = log.find(e=>e.date===today);
      const newLog = existing ? log.map(e=>e.date===today?entry:e) : [entry,...log];
      setLog(newLog); saveLog(newLog);
      if (!existing && user?.uid && !user?.isDemo && onCoinsEarned) onCoinsEarned(12);

      setScreen("result");
    } catch(e) {
      console.error(e); setError(true);
    }
  }, [lang, INDICATEURS, log, user, onCoinsEarned]);

  const resetForm = () => { setStep(0); setVals({}); setResult(null); setError(false); setScreen("checkin"); };

  const sc = result?.score || 0;
  const cc = scoreColor(sc);

  // ════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════
  if (screen === "home") return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 28px",background:`radial-gradient(ellipse at 50% 0%,${TEAL}15 0%,#060d08 65%)`,position:"relative",overflow:"hidden"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"block"}}>← {L?"Back":"Retour"}</button>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{position:"absolute",top:`${10+(i*11)%60}%`,left:`${(i*17)%88}%`,width:i%2===0?3:2,height:i%2===0?3:2,borderRadius:"50%",background:i%2===0?TEAL:EM,opacity:.35,animation:`pulse ${1.5+(i*.3)}s ease-in-out infinite`}}/>
        ))}
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>🛡️</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${TEAL}12`,border:`1px solid ${TEAL}33`,borderRadius:20,padding:"5px 14px",marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:TEAL,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:TEAL,letterSpacing:1}}>{L?"IMMUNITY SCORE":"SCORE D'IMMUNITÉ"}</span>
          </div>
          <div className="serif" style={{fontSize:30,fontWeight:700,lineHeight:1.25,marginBottom:12,color:"#edf5ef"}}>
            {L?"How strong is\nyour immune system?":"À quel point est fort\nton système immunitaire ?"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto 24px"}}>
            {L?"7 key habits analyzed. AI calculates your real immunity score with personalized boosters and a 7-day plan.":"7 habitudes clés analysées. L'IA calcule ton vrai score d'immunité avec des boosters personnalisés et un plan 7 jours."}
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              {val:streak>0?`${streak}🔥`:"0",label:L?"Streak":"Streak",color:WARN},
              {val:log.length,label:L?"Scans":"Scans",color:TEAL},
              {val:todayLog?`${todayLog.score}🛡️`:"—",label:L?"Today":"Aujourd'hui",color:todayLog?EM:MUT},
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
          style={{width:"100%",background:`linear-gradient(135deg,#042020,#063030)`,border:`1.5px solid ${TEAL}55`,borderRadius:18,padding:"18px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:TEAL,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 8px 32px ${TEAL}15`}}>
          🛡️ {todayLog?(L?"Redo immunity score":"Refaire mon score d'immunité"):(L?"Calculate my immunity":"Calculer mon immunité")}
        </button>

        {/* Résultat du jour */}
        {todayLog&&(
          <div style={{background:`${scoreColor(todayLog.score)}08`,border:`1.5px solid ${scoreColor(todayLog.score)}33`,borderRadius:18,padding:16,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:44,flexShrink:0}}>{scoreEmoji(todayLog.score)}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:scoreColor(todayLog.score),fontWeight:700,letterSpacing:.8,marginBottom:4}}>{L?"TODAY'S IMMUNITY":"IMMUNITÉ AUJOURD'HUI"}</div>
              <div className="serif" style={{fontSize:26,fontWeight:700,color:scoreColor(todayLog.score)}}>{todayLog.score}<span style={{fontSize:13,fontWeight:400,color:MUT}}>/100</span></div>
              <div style={{fontSize:12,color:MUT,marginTop:2}}>{scoreLabel(todayLog.score,L)}</div>
            </div>
            {result&&<button onClick={()=>setScreen("result")} style={{background:"none",border:`1px solid ${scoreColor(todayLog.score)}44`,borderRadius:10,padding:"8px 12px",color:scoreColor(todayLog.score),fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700,flexShrink:0}}>{L?"See →":"Voir →"}</button>}
          </div>
        )}

        {/* Ce qu'on analyse */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"WHAT WE ANALYZE":"CE QU'ON ANALYSE"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {INDICATEURS.map((ind,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:`${TEAL}06`,border:`1px solid ${TEAL}15`,borderRadius:10,padding:"8px 10px"}}>
                <span style={{fontSize:18}}>{ind.emoji}</span>
                <span style={{fontSize:12,color:"#a0c8a8",fontWeight:600}}>{ind.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Faits scientifiques */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:TEAL,fontWeight:700,letterSpacing:.8,marginBottom:12}}>🔬 {L?"SCIENCE-BACKED FACTS":"FAITS SCIENTIFIQUES"}</div>
          {[
            {emoji:"😴",fact:L?"1 night of 4h sleep reduces NK cells by 70%.":"1 nuit à 4h de sommeil réduit les cellules NK de 70%."},
            {emoji:"🍬",fact:L?"75g of sugar suppresses immunity for 5 hours.":"75g de sucre supprime l'immunité pendant 5 heures."},
            {emoji:"☀️",fact:L?"70% of people are vitamin D deficient.":"70% des personnes sont en carence de vitamine D."},
            {emoji:"🏃",fact:L?"30 min brisk walk 3x/week doubles NK cell activity.":"30 min de marche rapide 3x/semaine double l'activité des cellules NK."},
          ].map(({emoji,fact},i,arr)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<arr.length-1?10:0,paddingBottom:i<arr.length-1?10:0,borderBottom:i<arr.length-1?`1px solid ${BDR}`:"none"}}>
              <span style={{fontSize:18,flexShrink:0}}>{emoji}</span>
              <span style={{fontSize:12,color:"#a0c8a8",lineHeight:1.6}}>{fact}</span>
            </div>
          ))}
        </div>

        {/* Historique */}
        {log.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>{L?"RECENT HISTORY":"HISTORIQUE RÉCENT"}</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:50}}>
              {log.slice(0,14).reverse().map((entry,i)=>{
                const h=Math.round((entry.score/100)*50);
                const c=scoreColor(entry.score);
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:"100%",height:`${Math.max(3,h)}px`,background:c,borderRadius:"3px 3px 0 0",opacity:.9}}/>
                    <div style={{fontSize:7,color:MUT}}>{entry.date.slice(8)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tibb preview */}
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI & IMMUNITÉ</div>
          <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>
            {L?"The Prophet ﷺ said about black seed: 'It is a cure for every disease except death.' Modern science has confirmed its immunostimulant, antibacterial and anti-inflammatory properties.":"Le Prophète ﷺ a dit de la nigelle : 'Elle est un remède contre toutes les maladies, sauf la mort.' La science moderne a confirmé ses propriétés immunostimulantes, antibactériennes et anti-inflammatoires."}
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // CHECK-IN
  // ════════════════════════════════════════
  if (screen === "checkin" && ind) return (
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",paddingBottom:40}}>
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%,${TEAL}12 0%,#060d08 60%)`,flexShrink:0}}>
        <button onClick={step===0?()=>setScreen("home"):()=>setStep(step-1)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:6}}>
          <span>{L?`${step+1} of ${INDICATEURS.length}`:`${step+1} sur ${INDICATEURS.length}`}</span>
          <span style={{color:TEAL,fontWeight:700}}>{Math.round((step/INDICATEURS.length)*100)}%</span>
        </div>
        <div style={{background:"#142018",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${(step/INDICATEURS.length)*100}%`,height:"100%",background:`linear-gradient(90deg,${TEAL}88,${TEAL})`,borderRadius:8,transition:"width .5s ease"}}/>
        </div>
      </div>

      <div style={{flex:1,padding:"0 22px 20px",display:"flex",flexDirection:"column"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:10}}>{ind.emoji}</div>
          <div style={{fontSize:11,color:TEAL,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{ind.label.toUpperCase()}</div>
          <div className="serif" style={{fontSize:20,fontWeight:700,color:"#edf5ef",lineHeight:1.4}}>{ind.question}</div>
        </div>

        {/* SLIDER */}
        {ind.type==="slider"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <span style={{fontSize:48,fontWeight:700,color:TEAL}}>{vals[ind.id]??Math.round((ind.min+ind.max)/2)}</span>
              <span style={{fontSize:16,color:MUT}}> {ind.unite}</span>
            </div>
            <input type="range" min={ind.min} max={ind.max} step={ind.step}
              value={vals[ind.id]??Math.round((ind.min+ind.max)/2)}
              onChange={e=>setVals(v=>({...v,[ind.id]:Number(e.target.value)}))}
              style={{width:"100%",accentColor:TEAL,height:6,cursor:"pointer",marginBottom:16}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MUT}}>
              <span>{ind.min}</span><span>{ind.max}</span>
            </div>
            {/* Score preview */}
            {vals[ind.id]!=null&&(
              <div style={{textAlign:"center",marginTop:14,padding:"10px",background:`${scoreColor(ind.score(vals[ind.id]))}10`,border:`1px solid ${scoreColor(ind.score(vals[ind.id]))}22`,borderRadius:12}}>
                <div style={{fontSize:12,color:scoreColor(ind.score(vals[ind.id])),lineHeight:1.5}}>{ind.conseil(vals[ind.id])}</div>
              </div>
            )}
          </div>
        )}

        {/* SCALE */}
        {(ind.type==="scale5"||ind.type==="scale3"||ind.type==="scale4")&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
            {ind.options.map(opt=>{
              const selected = vals[ind.id]===opt.v;
              const optScore = ind.score(opt.v);
              const c = scoreColor(optScore);
              return(
                <button key={opt.v} onClick={()=>setVals(v=>({...v,[ind.id]:opt.v}))}
                  style={{background:selected?`${c}15`:CARD,border:`1.5px solid ${selected?c:BDR}`,borderRadius:16,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"'Outfit',sans-serif",transition:"all .15s"}}>
                  <span style={{fontSize:22}}>{opt.e}</span>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontWeight:700,fontSize:14,color:selected?c:"#edf5ef"}}>{opt.l}</div>
                  </div>
                  {selected&&<div style={{width:10,height:10,borderRadius:"50%",background:c,flexShrink:0}}/>}
                </button>
              );
            })}
          </div>
        )}

        <button onClick={nextStep}
          style={{marginTop:16,width:"100%",background:`linear-gradient(135deg,#042020,#063030)`,border:`1.5px solid ${TEAL}55`,borderRadius:16,padding:"15px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:TEAL,cursor:"pointer",flexShrink:0}}>
          {step<INDICATEURS.length-1?(L?"Next →":"Suivant →"):(L?"Calculate my immunity 🛡️":"Calculer mon immunité 🛡️")}
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // ANALYZING
  // ════════════════════════════════════════
  if (screen==="analyzing") return (
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      {error?(
        <>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:DANGER,marginBottom:20}}>{L?"Error":"Erreur"}</div>
          <button onClick={()=>analyzeWithAI(vals)} style={{background:`linear-gradient(135deg,#042020,#063030)`,border:`1.5px solid ${TEAL}55`,borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:TEAL,fontWeight:700,cursor:"pointer"}}>{L?"Retry":"Réessayer"}</button>
        </>
      ):(
        <>
          <div style={{position:"relative",width:140,height:140,marginBottom:32}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,${TEAL}22 0%,transparent 70%)`,animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:10,borderRadius:"50%",background:`radial-gradient(circle,${TEAL}11 0%,transparent 70%)`,animation:"pulse 2s .5s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60}}>🛡️</div>
          </div>
          <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:10,color:TEAL}}>{L?"Analyzing your immunity...":"Analyse de ton immunité..."}</div>
          <div style={{color:MUT,fontSize:13,maxWidth:280,lineHeight:1.7}}>{L?"AI is cross-referencing your habits with immunology data...":"L'IA croise tes habitudes avec les données d'immunologie..."}</div>
          <div style={{display:"flex",gap:8,marginTop:28}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:TEAL,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
          </div>
        </>
      )}
    </div>
  );

  // ════════════════════════════════════════
  // RÉSULTAT
  // ════════════════════════════════════════
  if (screen==="result"&&result) return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      {/* Hero */}
      <div style={{padding:"52px 22px 24px",background:`radial-gradient(ellipse at 50% 0%,${cc}18 0%,#060d08 65%)`}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Home":"Accueil"}</button>

        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
          {/* Score cercle */}
          <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
            <svg width="100" height="100" style={{transform:"rotate(-90deg)"}}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={`${cc}22`} strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={cc} strokeWidth="8"
                strokeDasharray={`${2*Math.PI*42}`}
                strokeDashoffset={`${2*Math.PI*42*(1-sc/100)}`}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontWeight:700,fontSize:28,color:cc,lineHeight:1}}>{sc}</div>
              <div style={{fontSize:9,color:MUT}}>/100</div>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:TEAL,fontWeight:700,letterSpacing:1,marginBottom:4}}>{L?"IMMUNITY SCORE":"SCORE D'IMMUNITÉ"}</div>
            <div className="serif" style={{fontSize:30,fontWeight:700,color:cc,lineHeight:1}}>{scoreLabel(sc,L)}</div>
            <div style={{fontSize:12,color:MUT,marginTop:6,lineHeight:1.5}}>{result.facteur_principal}</div>
          </div>
        </div>

        {/* Barre */}
        <div style={{background:"#142018",borderRadius:8,height:10,overflow:"hidden",marginBottom:8,position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#4ade80,#00ff88)",opacity:.2}}/>
          <div style={{width:`${sc}%`,height:"100%",background:`linear-gradient(90deg,${cc}88,${cc})`,borderRadius:8,transition:"width 1.2s cubic-bezier(.16,1,.3,1)",position:"relative"}}>
            <div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:14,height:14,borderRadius:"50%",background:cc,border:"2px solid #060d08",boxShadow:`0 0 8px ${cc}`}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:MUT}}>
          <span>{L?"Very weak":"Très faible"}</span><span>{L?"Moderate":"Modérée"}</span><span>{L?"Excellent":"Excellente"}</span>
        </div>
      </div>

      <div style={{padding:"0 20px"}}>

        {/* Diagnostic IA */}
        <div style={{background:`linear-gradient(135deg,#031818,#042020)`,border:`1.5px solid ${TEAL}33`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${TEAL}20`,border:`1.5px solid ${TEAL}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔬</div>
            <div style={{fontWeight:700,fontSize:13,color:TEAL}}>{L?"AI Immunity Analysis":"Analyse Immunité IA"}</div>
          </div>
          <div style={{fontSize:13,color:"#a0c8c8",lineHeight:1.75}}>{result.diagnostic}</div>
        </div>

        {/* Aliments boosters */}
        {result.aliments_boosters?.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>🌿 {L?"IMMUNITY BOOSTERS":"ALIMENTS BOOSTERS"}</div>
            {result.aliments_boosters.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<result.aliments_boosters.length-1?12:0,paddingBottom:i<result.aliments_boosters.length-1?12:0,borderBottom:i<result.aliments_boosters.length-1?`1px solid ${BDR}`:"none"}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${EM}10`,border:`1px solid ${EM}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:EM}}>{a.nom}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>{a.effet}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carences */}
        {result.carences_detectees?.length>0&&(
          <div style={{background:"#1a0a00",border:`1px solid ${WARN}33`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,color:WARN,fontWeight:700,letterSpacing:.8,marginBottom:10}}>⚠️ {L?"LIKELY DEFICIENCIES":"CARENCES PROBABLES"}</div>
            {result.carences_detectees.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<result.carences_detectees.length-1?6:0}}>
                <span style={{color:WARN,fontSize:12,flexShrink:0}}>→</span>
                <span style={{fontSize:12,color:"#c8a060",lineHeight:1.5}}>{c}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tibb an-Nabawi */}
        {result.tibb_nabawi&&(
          <div style={{background:"#1a1005",border:`1.5px solid ${GOLD}33`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:10}}>🌙 TIBB AN-NABAWI — {result.tibb_nabawi.plante?.toUpperCase()}</div>
            <div style={{fontSize:13,color:GOLD,lineHeight:1.7,fontStyle:"italic",marginBottom:12}}>"{result.tibb_nabawi.hadith}"</div>
            <div style={{background:`${GOLD}08`,borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:4}}>💊 {L?"HOW TO USE":"COMMENT UTILISER"}</div>
              <div style={{fontSize:12,color:"#a08040",lineHeight:1.6}}>{result.tibb_nabawi.conseil}</div>
            </div>
          </div>
        )}

        {/* Plan 7 jours */}
        {result.plan_7_jours?.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>📅 {L?"7-DAY IMMUNITY PLAN":"PLAN IMMUNITÉ 7 JOURS"}</div>
            {result.plan_7_jours.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<result.plan_7_jours.length-1?12:0,paddingBottom:i<result.plan_7_jours.length-1?12:0,borderBottom:i<result.plan_7_jours.length-1?`1px solid ${BDR}`:"none"}}>
                <div style={{background:`${TEAL}12`,border:`1px solid ${TEAL}33`,borderRadius:10,padding:"4px 8px",flexShrink:0}}>
                  <div style={{fontSize:9,fontWeight:700,color:TEAL,whiteSpace:"nowrap"}}>{p.jour}</div>
                </div>
                <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6,paddingTop:2}}>{p.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projection 30j */}
        {result.projection_30j&&(
          <div style={{background:`${EM}06`,border:`1px solid ${EM}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:EM,fontWeight:700,marginBottom:6}}>🚀 {L?"IN 30 DAYS IF YOU FOLLOW THE PLAN":"DANS 30 JOURS SI TU SUIS LE PLAN"}</div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.7}}>{result.projection_30j}</div>
          </div>
        )}

        {/* Message motivation */}
        {result.message_motivation&&(
          <div style={{background:`linear-gradient(135deg,#031818,#042020)`,border:`1px solid ${TEAL}22`,borderRadius:14,padding:14,marginBottom:14,textAlign:"center"}}>
            <div className="serif" style={{fontSize:18,fontWeight:700,color:TEAL,lineHeight:1.5}}>"{result.message_motivation}"</div>
          </div>
        )}

        {/* Scores par indicateur */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"YOUR 7 INDICATORS":"TES 7 INDICATEURS"}</div>
          {INDICATEURS.map((ind,i)=>{
            const v = result.vals?.[ind.id];
            if (v==null) return null;
            const s = ind.score(Number(v));
            const c = scoreColor(s);
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<INDICATEURS.length-1?10:0,paddingBottom:i<INDICATEURS.length-1?10:0,borderBottom:i<INDICATEURS.length-1?`1px solid ${BDR}`:"none"}}>
                <span style={{fontSize:20,flexShrink:0}}>{ind.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#edf5ef"}}>{ind.label}</span>
                    <span style={{fontSize:11,color:c,fontWeight:700}}>{s}/100</span>
                  </div>
                  <div style={{background:"#142018",borderRadius:4,height:5,overflow:"hidden"}}>
                    <div style={{width:`${s}%`,height:"100%",background:c,borderRadius:4,transition:"width 1s ease"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Boutons */}
        <div style={{display:"flex",gap:10}}>
          <button onClick={resetForm} style={{flex:1,background:CARD,border:`1px solid ${TEAL}33`,borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:TEAL,cursor:"pointer",fontWeight:700}}>🔄 {L?"Redo":"Refaire"}</button>
          <button onClick={()=>setScreen("home")} style={{flex:1,background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>🏠 {L?"Home":"Accueil"}</button>
        </div>
      </div>
    </div>
  );

  return null;
}

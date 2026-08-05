// ============================================================
// VITASCANN — RealiteBrutale.js
// ⚡ IA Réalité Brutale
// ✅ Questionnaire 6 questions sur les habitudes réelles
// ✅ Claude calcule temps perdu, potentiel gâché, impact futur
// ✅ Graphiques choquants (barres, cercles, timeline)
// ✅ Simulation "Si tu changes maintenant"
// ✅ Électrochoc émotionnel → viral garanti
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useCallback } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;
const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";
const DANGER = "#ef4444";
const WARN = "#f97316";

const QUESTIONS_FR = [
  { id:"ecrans",  emoji:"📱", label:"Temps d'écran / réseaux sociaux", question:"Combien d'heures par jour passes-tu sur les réseaux sociaux (TikTok, Instagram, YouTube shorts...)?", type:"slider", min:0, max:12, step:0.5, unite:"h/jour" },
  { id:"sommeil", emoji:"😴", label:"Qualité du sommeil", question:"Combien d'heures dors-tu en moyenne par nuit ?", type:"slider", min:3, max:12, step:0.5, unite:"h/nuit" },
  { id:"sport",   emoji:"🏃", label:"Activité physique", question:"Combien de fois fais-tu du sport ou bouges-tu activement par semaine ?", type:"slider", min:0, max:7, step:1, unite:"fois/semaine" },
  { id:"objectif",emoji:"🎯", label:"Objectifs concrets", question:"Depuis combien de mois as-tu un objectif important que tu n'as pas encore commencé ou terminé ?", type:"slider", min:0, max:36, step:1, unite:"mois" },
  { id:"nutrition",emoji:"🍔", label:"Alimentation", question:"Combien de repas peu sains (fast food, junk food, sodas...) manges-tu par semaine ?", type:"slider", min:0, max:21, step:1, unite:"repas/semaine" },
  { id:"revenus", emoji:"💰", label:"Potentiel financier", question:"Quel est ton revenu mensuel actuel approximatif (en $) ?", type:"slider", min:0, max:10000, step:100, unite:"$/mois" },
];

const QUESTIONS_EN = [
  { id:"ecrans",  emoji:"📱", label:"Screen time / social media", question:"How many hours per day do you spend on social media (TikTok, Instagram, YouTube shorts...)?", type:"slider", min:0, max:12, step:0.5, unite:"h/day" },
  { id:"sommeil", emoji:"😴", label:"Sleep quality", question:"How many hours do you sleep on average per night?", type:"slider", min:3, max:12, step:0.5, unite:"h/night" },
  { id:"sport",   emoji:"🏃", label:"Physical activity", question:"How many times per week do you exercise or move actively?", type:"slider", min:0, max:7, step:1, unite:"times/week" },
  { id:"objectif",emoji:"🎯", label:"Concrete goals", question:"For how many months have you had an important goal you haven't started or finished?", type:"slider", min:0, max:36, step:1, unite:"months" },
  { id:"nutrition",emoji:"🍔", label:"Nutrition", question:"How many unhealthy meals (fast food, junk food, sodas...) do you eat per week?", type:"slider", min:0, max:21, step:1, unite:"meals/week" },
  { id:"revenus", emoji:"💰", label:"Financial potential", question:"What is your approximate current monthly income (in $)?", type:"slider", min:0, max:10000, step:100, unite:"$/month" },
];

function buildPrompt(lang, vals) {
  const L = lang === "en";
  const Q = L ? QUESTIONS_EN : QUESTIONS_FR;
  const data = Q.map(q => `${q.label}: ${vals[q.id]} ${q.unite}`).join("\n");

  const heuresEcrans = vals.ecrans || 0;
  const joursEcransAn = Math.round(heuresEcrans * 365 / 24);
  const joursEcrans10ans = joursEcransAn * 10;

  const systemFR = `Tu es le module "Réalité Brutale" de VitaScann. Tu analyses les habitudes d'un utilisateur et tu génères un diagnostic CHOC — honnête, direct, sans filtre, mais constructif. Tu utilises des chiffres concrets et percutants. Pas de morale, pas de jugement — juste la vérité mathématique sur où vont ses heures, son énergie et son potentiel.

Retourne UNIQUEMENT un JSON valide sans markdown :
{
  "titre_choc": "Titre accrocheur et percutant (max 8 mots)",
  "score_potentiel": number (0-100, ton potentiel utilisé actuellement),
  "chiffres_chocs": [
    {"label": "ex: Jours perdus sur les réseaux cette année", "valeur": "ex: 43 jours", "emoji": "📱", "couleur": "danger|warn|ok"},
    {"label": "...", "valeur": "...", "emoji": "...", "couleur": "..."}
  ],
  "realite_maintenant": "2-3 phrases brutales sur l'état actuel — chiffres concrets obligatoires",
  "projection_1an": "Ce qui se passe si rien ne change dans 1 an",
  "projection_5ans": "Ce qui se passe si rien ne change dans 5 ans",
  "si_tu_changes": {
    "dans_30j": "Ce qui se passe si tu changes dès aujourd'hui — dans 30 jours",
    "dans_1an": "Ce qui se passe si tu changes dès aujourd'hui — dans 1 an",
    "dans_5ans": "Ce qui se passe si tu changes dès aujourd'hui — dans 5 ans"
  },
  "action_numero_1": "LA seule action la plus impactante à faire aujourd'hui — ultra précise",
  "potentiel_revenu": "Estimation du revenu potentiel réaliste dans 1 an si les habitudes changent (basé sur ${vals.revenus}$/mois actuel)"
}`;

  const systemEN = `You are VitaScann's "Brutal Reality" module. You analyze a user's habits and generate a SHOCK diagnosis — honest, direct, unfiltered, but constructive. Use concrete, impactful numbers. No moralizing, no judgment — just the mathematical truth about where their hours, energy and potential are going.

Return ONLY valid JSON without markdown:
{
  "titre_choc": "Catchy shocking title (max 8 words)",
  "score_potentiel": number (0-100, currently used potential),
  "chiffres_chocs": [
    {"label": "e.g. Days lost on social media this year", "valeur": "e.g. 43 days", "emoji": "📱", "couleur": "danger|warn|ok"},
    {"label": "...", "valeur": "...", "emoji": "...", "couleur": "..."}
  ],
  "realite_maintenant": "2-3 brutal sentences about current state — concrete numbers required",
  "projection_1an": "What happens if nothing changes in 1 year",
  "projection_5ans": "What happens if nothing changes in 5 years",
  "si_tu_changes": {
    "dans_30j": "What happens if you change today — in 30 days",
    "dans_1an": "What happens if you change today — in 1 year",
    "dans_5ans": "What happens if you change today — in 5 years"
  },
  "action_numero_1": "THE single most impactful action to take today — ultra precise",
  "potentiel_revenu": "Realistic estimated income potential in 1 year if habits change (based on current $${vals.revenus}/month)"
}`;

  return {
    system: L ? systemEN : systemFR,
    user: L ? `User habits:\n${data}\n\nGenerate the brutal reality analysis.` : `Habitudes de l'utilisateur:\n${data}\n\nGénère l'analyse réalité brutale.`,
  };
}

export default function RealiteBrutale({ onBack, lang, user }) {
  const L = lang === "en";
  const QUESTIONS = L ? QUESTIONS_EN : QUESTIONS_FR;

  const [screen, setScreen] = useState("home"); // home | questions | analyzing | result
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState({ ecrans:3, sommeil:7, sport:2, objectif:6, nutrition:5, revenus:2000 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  const currentQ = QUESTIONS[step];

  const analyzeWithAI = useCallback(async (finalVals) => {
    setScreen("analyzing");
    setError(false);
    try {
      const prompt = buildPrompt(lang, finalVals);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:2500, system:prompt.system, messages:[{role:"user",content:prompt.user}] }),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      let clean = text.replace(/```json|```/g,"").trim();
      // Protection anti-troncature : si le JSON est coupé (pas de } final), on tente de le réparer
      if (!clean.endsWith("}")) {
        const lastBrace = clean.lastIndexOf("}");
        if (lastBrace > 0) clean = clean.substring(0, lastBrace + 1);
      }
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setScreen("result");
    } catch(e) {
      console.error(e); setError(true);
    }
  }, [lang]);

  const nextStep = () => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else analyzeWithAI(vals);
  };

  const getCouleurVal = (c) => c==="danger" ? DANGER : c==="warn" ? WARN : EM;

  // ─── HOME ───
  if (screen === "home") return (
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 28px",background:"radial-gradient(ellipse at 50% 0%,#2a000022 0%,#060d08 65%)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>⚡</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#ef444415",border:"1px solid #ef444433",borderRadius:20,padding:"5px 14px",marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:DANGER,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:DANGER,letterSpacing:1}}>{L?"BRUTAL REALITY":"RÉALITÉ BRUTALE"}</span>
          </div>
          <div className="serif" style={{fontSize:28,fontWeight:700,lineHeight:1.25,marginBottom:12,color:"#edf5ef"}}>
            {L?"The truth about\nwhere your life is going":"La vérité sur où\nva ta vie en ce moment"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto 24px"}}>
            {L?"6 honest questions. AI calculates the real cost of your current habits in days, months and dollars.":"6 questions honnêtes. L'IA calcule le vrai coût de tes habitudes actuelles en jours, mois et dollars."}
          </div>
          <button onClick={()=>{setStep(0);setScreen("questions");}}
            style={{background:"linear-gradient(135deg,#7f1d1d,#991b1b)",border:"1.5px solid #ef444455",borderRadius:18,padding:"16px 32px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#fff",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px #ef444420"}}>
            ⚡ {L?"See my brutal reality":"Voir ma réalité brutale"}
          </button>
        </div>
      </div>
      <div style={{padding:"20px 20px 0"}}>
        {/* Exemples chocs */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"EXAMPLE SHOCKING FACTS":"EXEMPLES DE FAITS CHOCS"}</div>
          {[
            {emoji:"📱",text:L?'"You lost 43 days this year on TikTok."':'"Tu as perdu 43 jours cette année sur TikTok."',c:DANGER},
            {emoji:"💰",text:L?'"Your bad habits cost you $8,400/year."':'"Tes mauvaises habitudes te coûtent 8 400$/an."',c:WARN},
            {emoji:"🧠",text:L?'"At this rate, you will work 20% less efficiently in 3 years."':'"À ce rythme, tu travailleras 20% moins efficacement dans 3 ans."',c:"#818cf8"},
            {emoji:"✅",text:L?'"If you change today: +$3,200/month in 1 year."':'"Si tu changes aujourd\'hui : +3 200$/mois dans 1 an."',c:EM},
          ].map(({emoji,text,c},i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<3?12:0,paddingBottom:i<3?12:0,borderBottom:i<3?`1px solid ${BDR}`:"none"}}>
              <span style={{fontSize:20,flexShrink:0}}>{emoji}</span>
              <span style={{fontSize:13,color:c,lineHeight:1.6,fontStyle:"italic"}}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{background:"#1a0505",border:"1px solid #ef444422",borderRadius:14,padding:14}}>
          <div style={{fontSize:10,color:DANGER,fontWeight:700,marginBottom:6}}>⚡ {L?"WHY THIS WORKS":"POURQUOI ÇA MARCHE"}</div>
          <div style={{fontSize:12,color:"#c08080",lineHeight:1.7}}>
            {L?"We don't judge. We calculate. The numbers are mathematical — not emotional. Seeing the real cost of habits in days and dollars changes behavior where motivation fails.":"On ne juge pas. On calcule. Les chiffres sont mathématiques — pas émotionnels. Voir le vrai coût des habitudes en jours et en dollars change les comportements là où la motivation échoue."}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (screen === "questions") return (
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",paddingBottom:40}}>
      <div style={{padding:"52px 22px 20px",background:"radial-gradient(ellipse at 50% 0%,#2a0005 0%,#060d08 60%)",flexShrink:0}}>
        <button onClick={step===0?()=>setScreen("home"):()=>setStep(step-1)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:6}}>
          <span>{L?`Question ${step+1} of ${QUESTIONS.length}`:`Question ${step+1} sur ${QUESTIONS.length}`}</span>
          <span style={{color:DANGER,fontWeight:700}}>{Math.round((step/QUESTIONS.length)*100)}%</span>
        </div>
        <div style={{background:"#142018",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${(step/QUESTIONS.length)*100}%`,height:"100%",background:`linear-gradient(90deg,${DANGER}88,${DANGER})`,borderRadius:8,transition:"width .5s ease"}}/>
        </div>
      </div>

      <div style={{flex:1,padding:"0 22px 20px",display:"flex",flexDirection:"column"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:10}}>{currentQ.emoji}</div>
          <div style={{fontSize:11,color:DANGER,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{currentQ.label.toUpperCase()}</div>
          <div className="serif" style={{fontSize:20,fontWeight:700,color:"#edf5ef",lineHeight:1.4}}>{currentQ.question}</div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <span style={{fontSize:48,fontWeight:700,color:DANGER}}>{vals[currentQ.id]}</span>
            <span style={{fontSize:16,color:MUT}}> {currentQ.unite}</span>
          </div>
          <input type="range" min={currentQ.min} max={currentQ.max} step={currentQ.step}
            value={vals[currentQ.id]}
            onChange={e=>setVals(v=>({...v,[currentQ.id]:Number(e.target.value)}))}
            style={{width:"100%",accentColor:DANGER,height:6,cursor:"pointer",marginBottom:12}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MUT}}>
            <span>{currentQ.min}</span><span>{currentQ.max}</span>
          </div>
        </div>

        <button onClick={nextStep}
          style={{width:"100%",background:"linear-gradient(135deg,#7f1d1d,#991b1b)",border:"1.5px solid #ef444455",borderRadius:16,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer"}}>
          {step<QUESTIONS.length-1?(L?"Next →":"Suivant →"):(L?"See my brutal reality ⚡":"Voir ma réalité ⚡")}
        </button>
      </div>
    </div>
  );

  // ─── ANALYZING ───
  if (screen === "analyzing") return (
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      {error ? (
        <>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:DANGER,marginBottom:20}}>{L?"Error":"Erreur"}</div>
          <button onClick={()=>analyzeWithAI(vals)} style={{background:"linear-gradient(135deg,#7f1d1d,#991b1b)",border:"none",borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#fff",fontWeight:700,cursor:"pointer"}}>{L?"Retry":"Réessayer"}</button>
        </>
      ) : (
        <>
          <div style={{position:"relative",width:120,height:120,marginBottom:28}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,${DANGER}22 0%,transparent 70%)`,animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>⚡</div>
          </div>
          <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:10,color:DANGER}}>{L?"Calculating your reality...":"Calcul de ta réalité en cours..."}</div>
          <div style={{color:MUT,fontSize:13,maxWidth:260,lineHeight:1.7}}>{L?"AI is analyzing your habits and calculating the real impact...":"L'IA analyse tes habitudes et calcule l'impact réel..."}</div>
          <div style={{display:"flex",gap:8,marginTop:24}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:DANGER,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
          </div>
        </>
      )}
    </div>
  );

  // ─── RÉSULTAT ───
  if (screen === "result" && result) return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 24px",background:`radial-gradient(ellipse at 50% 0%,${DANGER}12 0%,#060d08 65%)`}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Home":"Accueil"}</button>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#ef444415",border:"1px solid #ef444433",borderRadius:20,padding:"5px 14px",marginBottom:14}}>
          <span style={{fontSize:14}}>⚡</span>
          <span style={{fontSize:11,fontWeight:700,color:DANGER,letterSpacing:1}}>{L?"BRUTAL REALITY":"RÉALITÉ BRUTALE"}</span>
        </div>
        <div className="serif" style={{fontSize:28,fontWeight:700,color:"#edf5ef",lineHeight:1.2,marginBottom:16}}>{result.titre_choc}</div>

        {/* Score potentiel */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
            <svg width="90" height="90" style={{transform:"rotate(-90deg)"}}>
              <circle cx="45" cy="45" r="38" fill="none" stroke={`${DANGER}22`} strokeWidth="8"/>
              <circle cx="45" cy="45" r="38" fill="none" stroke={result.score_potentiel>60?EM:result.score_potentiel>30?WARN:DANGER} strokeWidth="8"
                strokeDasharray={`${2*Math.PI*38}`}
                strokeDashoffset={`${2*Math.PI*38*(1-result.score_potentiel/100)}`}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontWeight:700,fontSize:22,color:result.score_potentiel>60?EM:result.score_potentiel>30?WARN:DANGER}}>{result.score_potentiel}</div>
              <div style={{fontSize:8,color:MUT}}>/100</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:MUT,marginBottom:4}}>{L?"POTENTIAL USED":"POTENTIEL UTILISÉ"}</div>
            <div style={{fontSize:13,color:"#edf5ef",lineHeight:1.6}}>{result.realite_maintenant}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 20px"}}>

        {/* Chiffres chocs */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>💥 {L?"SHOCKING NUMBERS":"CHIFFRES CHOCS"}</div>
          {result.chiffres_chocs?.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<result.chiffres_chocs.length-1?12:0,paddingBottom:i<result.chiffres_chocs.length-1?12:0,borderBottom:i<result.chiffres_chocs.length-1?`1px solid ${BDR}`:"none"}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${getCouleurVal(c.couleur)}10`,border:`1px solid ${getCouleurVal(c.couleur)}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:MUT,marginBottom:3}}>{c.label}</div>
                <div style={{fontWeight:700,fontSize:18,color:getCouleurVal(c.couleur)}}>{c.valeur}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Projections si rien ne change */}
        <div style={{background:"#1a0505",border:"1.5px solid #ef444433",borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:DANGER,fontWeight:700,letterSpacing:.8,marginBottom:14}}>📉 {L?"IF NOTHING CHANGES":"SI RIEN NE CHANGE"}</div>
          {[
            {label:L?"In 1 year":"Dans 1 an",val:result.projection_1an,c:WARN},
            {label:L?"In 5 years":"Dans 5 ans",val:result.projection_5ans,c:DANGER},
          ].map(({label,val,c},i)=>(
            <div key={i} style={{marginBottom:i===0?14:0,paddingBottom:i===0?14:0,borderBottom:i===0?`1px solid #ef444422`:"none"}}>
              <div style={{fontSize:10,color:c,fontWeight:700,marginBottom:4}}>⏰ {label.toUpperCase()}</div>
              <div style={{fontSize:13,color:"#c08080",lineHeight:1.6}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Si tu changes */}
        <div style={{background:`${EM}06`,border:`1.5px solid ${EM}33`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:EM,fontWeight:700,letterSpacing:.8,marginBottom:14}}>🚀 {L?"IF YOU CHANGE TODAY":"SI TU CHANGES AUJOURD'HUI"}</div>
          {[
            {label:L?"In 30 days":"Dans 30 jours",val:result.si_tu_changes?.dans_30j,c:"#4ade80"},
            {label:L?"In 1 year":"Dans 1 an",val:result.si_tu_changes?.dans_1an,c:EM},
            {label:L?"In 5 years":"Dans 5 ans",val:result.si_tu_changes?.dans_5ans,c:GOLD},
          ].map(({label,val,c},i,arr)=>(
            <div key={i} style={{marginBottom:i<arr.length-1?12:0,paddingBottom:i<arr.length-1?12:0,borderBottom:i<arr.length-1?`1px solid ${EM}14`:"none"}}>
              <div style={{fontSize:10,color:c,fontWeight:700,marginBottom:4}}>✅ {label.toUpperCase()}</div>
              <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Action #1 */}
        <div style={{background:"linear-gradient(135deg,#1a3300,#142800)",border:`1.5px solid ${EM}44`,borderRadius:14,padding:16,marginBottom:14}}>
          <div style={{fontSize:10,color:EM,fontWeight:700,marginBottom:6}}>🎯 {L?"ACTION #1 — DO THIS NOW":"ACTION N°1 — FAIS ÇA MAINTENANT"}</div>
          <div style={{fontSize:14,color:"#a0c8a8",lineHeight:1.7,fontWeight:600}}>{result.action_numero_1}</div>
        </div>

        {/* Potentiel revenu */}
        {result.potentiel_revenu && (
          <div style={{background:`${GOLD}08`,border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>💰 {L?"FINANCIAL POTENTIAL":"POTENTIEL FINANCIER"}</div>
            <div style={{fontSize:13,color:"#c8a060",lineHeight:1.7}}>{result.potentiel_revenu}</div>
          </div>
        )}

        {/* Refaire */}
        <button onClick={()=>{setStep(0);setScreen("questions");setResult(null);}}
          style={{width:"100%",background:CARD,border:`1px solid ${DANGER}33`,borderRadius:14,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:DANGER,cursor:"pointer",fontWeight:700}}>
          🔄 {L?"Redo with different habits":"Refaire avec d'autres habitudes"}
        </button>
      </div>
    </div>
  );

  return null;
}

// ============================================================
// VITASCANN — ScanEnvironnement.js
// 🌫️ Scan Environnement Toxique
// ✅ Questionnaire intelligent 7 dimensions
// ✅ Claude détecte l'environnement toxique pour le cerveau
// ✅ Score par catégorie (chambre, travail, social, digital)
// ✅ Recommandations concrètes et actionnables
// ✅ Tibb an-Nabawi sur l'environnement
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
const PURPLE = "#a855f7";

const CATEGORIES_FR = [
  {
    id:"chambre", emoji:"🛏️", label:"Environnement Chambre/Sommeil",
    questions:[
      {id:"lumiere_soir", q:"Regardes-tu ton écran dans les 30 minutes avant de dormir ?", opts:[{v:0,l:"Jamais"},{v:1,l:"Parfois"},{v:2,l:"Souvent"},{v:3,l:"Toujours"}]},
      {id:"temp_chambre",  q:"Quelle est la température de ta chambre la nuit ?", opts:[{v:0,l:"Fraîche (16-19°C)"},{v:1,l:"Idéale (19-21°C)"},{v:2,l:"Tiède (22-24°C)"},{v:3,l:"Chaude (25°C+)"}]},
      {id:"bruit_nuit",   q:"Y a-t-il du bruit perturbateur la nuit ? (rue, coloc, télé...)", opts:[{v:0,l:"Aucun bruit"},{v:1,l:"Léger"},{v:2,l:"Modéré"},{v:3,l:"Fort/constant"}]},
    ]
  },
  {
    id:"digital", emoji:"📱", label:"Environnement Digital",
    questions:[
      {id:"notifs",       q:"Combien de notifications reçois-tu par heure en moyenne ?", opts:[{v:0,l:"0-2"},{v:1,l:"3-10"},{v:2,l:"11-30"},{v:3,l:"30+"}]},
      {id:"flux_negatif", q:"Tes réseaux sociaux t'exposent-ils souvent à du contenu négatif ou stressant ?", opts:[{v:0,l:"Rarement"},{v:1,l:"Parfois"},{v:2,l:"Souvent"},{v:3,l:"Très souvent"}]},
      {id:"ecran_matin",  q:"Regardes-tu ton téléphone dans les 10 premières minutes après le réveil ?", opts:[{v:0,l:"Jamais"},{v:1,l:"Parfois"},{v:2,l:"Souvent"},{v:3,l:"Toujours"}]},
    ]
  },
  {
    id:"social", emoji:"👥", label:"Environnement Social",
    questions:[
      {id:"entourage",    q:"Ton entourage proche est-il plutôt positif et motivant ?", opts:[{v:0,l:"Très positif"},{v:1,l:"Neutre"},{v:2,l:"Plutôt négatif"},{v:3,l:"Très négatif/toxique"}]},
      {id:"conversations",q:"Combien de conversations négatives (plaintes, critiques, ragots) as-tu par jour ?", opts:[{v:0,l:"Aucune"},{v:1,l:"1-2"},{v:2,l:"3-5"},{v:3,l:"5+"}]},
    ]
  },
  {
    id:"travail", emoji:"💼", label:"Environnement Travail/Études",
    questions:[
      {id:"stress_travail",q:"Ton environnement de travail/études est-il stressant ?", opts:[{v:0,l:"Non, épanouissant"},{v:1,l:"Légèrement"},{v:2,l:"Modérément"},{v:3,l:"Très stressant"}]},
      {id:"lumiere_jour",  q:"As-tu accès à de la lumière naturelle pendant la journée ?", opts:[{v:0,l:"Oui, en abondance"},{v:1,l:"Un peu"},{v:2,l:"Rarement"},{v:3,l:"Jamais (intérieur constant)"}]},
    ]
  },
  {
    id:"alimentation_env", emoji:"🥗", label:"Environnement Alimentaire",
    questions:[
      {id:"junk_visible",  q:"Y a-t-il de la junk food facilement accessible chez toi (vue, à portée) ?", opts:[{v:0,l:"Non"},{v:1,l:"Un peu"},{v:2,l:"Souvent"},{v:3,l:"Partout"}]},
      {id:"eau_acces",     q:"As-tu de l'eau facilement accessible pour rester hydraté ?", opts:[{v:0,l:"Toujours (bouteille à portée)"},{v:1,l:"Généralement"},{v:2,l:"Parfois"},{v:3,l:"Rarement"}]},
    ]
  },
];

const CATEGORIES_EN = [
  {
    id:"chambre", emoji:"🛏️", label:"Bedroom/Sleep Environment",
    questions:[
      {id:"lumiere_soir", q:"Do you look at screens within 30 minutes of sleeping?", opts:[{v:0,l:"Never"},{v:1,l:"Sometimes"},{v:2,l:"Often"},{v:3,l:"Always"}]},
      {id:"temp_chambre",  q:"What is your bedroom temperature at night?", opts:[{v:0,l:"Cool (61-67°F)"},{v:1,l:"Ideal (67-70°F)"},{v:2,l:"Warm (72-75°F)"},{v:3,l:"Hot (77°F+)"}]},
      {id:"bruit_nuit",   q:"Is there disturbing noise at night? (street, roommate, TV...)", opts:[{v:0,l:"No noise"},{v:1,l:"Light"},{v:2,l:"Moderate"},{v:3,l:"Loud/constant"}]},
    ]
  },
  {
    id:"digital", emoji:"📱", label:"Digital Environment",
    questions:[
      {id:"notifs",       q:"How many notifications do you receive per hour on average?", opts:[{v:0,l:"0-2"},{v:1,l:"3-10"},{v:2,l:"11-30"},{v:3,l:"30+"}]},
      {id:"flux_negatif", q:"Do your social media often expose you to negative or stressful content?", opts:[{v:0,l:"Rarely"},{v:1,l:"Sometimes"},{v:2,l:"Often"},{v:3,l:"Very often"}]},
      {id:"ecran_matin",  q:"Do you check your phone within the first 10 minutes of waking up?", opts:[{v:0,l:"Never"},{v:1,l:"Sometimes"},{v:2,l:"Often"},{v:3,l:"Always"}]},
    ]
  },
  {
    id:"social", emoji:"👥", label:"Social Environment",
    questions:[
      {id:"entourage",    q:"Is your close circle generally positive and motivating?", opts:[{v:0,l:"Very positive"},{v:1,l:"Neutral"},{v:2,l:"Rather negative"},{v:3,l:"Very negative/toxic"}]},
      {id:"conversations",q:"How many negative conversations (complaints, gossip) do you have per day?", opts:[{v:0,l:"None"},{v:1,l:"1-2"},{v:2,l:"3-5"},{v:3,l:"5+"}]},
    ]
  },
  {
    id:"travail", emoji:"💼", label:"Work/Study Environment",
    questions:[
      {id:"stress_travail",q:"Is your work/study environment stressful?", opts:[{v:0,l:"No, fulfilling"},{v:1,l:"Slightly"},{v:2,l:"Moderately"},{v:3,l:"Very stressful"}]},
      {id:"lumiere_jour",  q:"Do you have access to natural light during the day?", opts:[{v:0,l:"Yes, abundantly"},{v:1,l:"A little"},{v:2,l:"Rarely"},{v:3,l:"Never (always indoors)"}]},
    ]
  },
  {
    id:"alimentation_env", emoji:"🥗", label:"Food Environment",
    questions:[
      {id:"junk_visible",  q:"Is junk food easily accessible at home (visible, within reach)?", opts:[{v:0,l:"No"},{v:1,l:"A little"},{v:2,l:"Often"},{v:3,l:"Everywhere"}]},
      {id:"eau_acces",     q:"Do you have easy access to water to stay hydrated?", opts:[{v:0,l:"Always (bottle nearby)"},{v:1,l:"Generally"},{v:2,l:"Sometimes"},{v:3,l:"Rarely"}]},
    ]
  },
];

function buildEnvPrompt(lang, allAnswers) {
  const L = lang === "en";
  const CATS = L ? CATEGORIES_EN : CATEGORIES_FR;
  const data = CATS.map(cat => {
    const catAnswers = cat.questions.map(q => {
      const opt = q.opts.find(o => o.v === allAnswers[q.id]);
      return `  ${q.q} → ${opt?.l || allAnswers[q.id]}`;
    }).join("\n");
    return `${cat.label}:\n${catAnswers}`;
  }).join("\n\n");

  const systemFR = `Tu es l'expert en environnement optimal de VitaScann. Analyse l'environnement de l'utilisateur dans 5 dimensions et génère un diagnostic complet avec des recommandations actionnables. Sois direct et concret.

Retourne UNIQUEMENT un JSON valide sans markdown:
{
  "score_global": number (0-100, 100 = environnement optimal),
  "verdict": "1 phrase résumant l'état de l'environnement",
  "scores_categories": {
    "chambre": number (0-100),
    "digital": number (0-100),
    "social": number (0-100),
    "travail": number (0-100),
    "alimentation_env": number (0-100)
  },
  "toxines_principales": ["toxine 1 identifiée", "toxine 2", "toxine 3"],
  "impact_cerveau": "Comment cet environnement affecte concrètement le cerveau, la concentration et l'énergie",
  "changement_immediat": "LE changement #1 à faire aujourd'hui — ultra précis et concret",
  "plan_7_jours": ["Action jour 1-2", "Action jour 3-4", "Action jour 5-7"],
  "environnement_ideal": "Description courte de l'environnement optimal à créer",
  "tibb": "Conseil du Prophète ﷺ sur l'environnement, la propreté, ou le cadre de vie (hadith ou pratique prophétique)"
}`;

  const systemEN = `You are VitaScann's optimal environment expert. Analyze the user's environment across 5 dimensions and generate a complete diagnosis with actionable recommendations. Be direct and concrete.

Return ONLY valid JSON without markdown:
{
  "score_global": number (0-100, 100 = optimal environment),
  "verdict": "1 sentence summarizing the environment state",
  "scores_categories": {
    "chambre": number (0-100),
    "digital": number (0-100),
    "social": number (0-100),
    "travail": number (0-100),
    "alimentation_env": number (0-100)
  },
  "toxines_principales": ["toxin 1 identified", "toxin 2", "toxin 3"],
  "impact_cerveau": "How this environment concretely affects the brain, focus and energy",
  "changement_immediat": "THE #1 change to make today — ultra precise and concrete",
  "plan_7_jours": ["Action day 1-2", "Action day 3-4", "Action day 5-7"],
  "environnement_ideal": "Short description of the optimal environment to create",
  "tibb": "Prophet ﷺ advice on environment, cleanliness, or living space (hadith or prophetic practice)"
}`;

  return {
    system: L ? systemEN : systemFR,
    user: L ? `User environment:\n\n${data}\n\nGenerate the analysis.` : `Environnement de l'utilisateur:\n\n${data}\n\nGénère l'analyse.`,
  };
}

function scoreColor(s) {
  if (s >= 75) return EM;
  if (s >= 50) return GOLD;
  if (s >= 25) return WARN;
  return DANGER;
}
function scoreLabel(s, L) {
  if (s >= 75) return L ? "Optimal" : "Optimal";
  if (s >= 50) return L ? "Acceptable" : "Acceptable";
  if (s >= 25) return L ? "Toxic" : "Toxique";
  return L ? "Very toxic" : "Très toxique";
}

export default function ScanEnvironnement({ onBack, lang, user }) {
  const L = lang === "en";
  const CATEGORIES = L ? CATEGORIES_EN : CATEGORIES_FR;
  const allQuestions = CATEGORIES.flatMap(c => c.questions);

  const [screen, setScreen] = useState("home");
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  const currentCat = CATEGORIES[catIdx];
  const currentQ = currentCat?.questions[qIdx];
  const totalQ = allQuestions.length;
  const answeredQ = Object.keys(answers).length;

  const analyzeWithAI = useCallback(async (finalAnswers) => {
    setScreen("analyzing");
    setError(false);
    try {
      const prompt = buildEnvPrompt(lang, finalAnswers);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1200, system:prompt.system, messages:[{role:"user",content:prompt.user}] }),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
      setScreen("result");
    } catch(e) {
      console.error(e); setError(true);
    }
  }, [lang]);

  const selectAnswer = (val) => {
    const newAnswers = {...answers, [currentQ.id]: val};
    setAnswers(newAnswers);
    // Passer à la question suivante
    if (qIdx < currentCat.questions.length - 1) {
      setQIdx(qIdx + 1);
    } else if (catIdx < CATEGORIES.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
    } else {
      analyzeWithAI(newAnswers);
    }
  };

  const goBack = () => {
    if (qIdx > 0) {
      setQIdx(qIdx - 1);
    } else if (catIdx > 0) {
      setCatIdx(catIdx - 1);
      setQIdx(CATEGORIES[catIdx - 1].questions.length - 1);
    } else {
      setScreen("home");
    }
  };

  // ─── HOME ───
  if (screen === "home") return (
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 28px",background:"radial-gradient(ellipse at 50% 0%,#1a001a 0%,#060d08 65%)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>🌫️</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${PURPLE}15`,border:`1px solid ${PURPLE}33`,borderRadius:20,padding:"5px 14px",marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:PURPLE,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:PURPLE,letterSpacing:1}}>{L?"TOXIC ENVIRONMENT SCAN":"SCAN ENVIRONNEMENT TOXIQUE"}</span>
          </div>
          <div className="serif" style={{fontSize:28,fontWeight:700,lineHeight:1.25,marginBottom:12,color:"#edf5ef"}}>
            {L?"Is your environment\ndestroying your brain?":"Ton environnement\ndétruit-il ton cerveau ?"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto 24px"}}>
            {L?"${totalQ} questions across 5 dimensions. AI detects what in your daily environment is silently degrading your performance, sleep and mental health.".replace("${totalQ}",totalQ):`${totalQ} questions sur 5 dimensions. L'IA détecte ce qui dans ton environnement quotidien dégrade silencieusement tes performances, ton sommeil et ta santé mentale.`}
          </div>
          <button onClick={()=>{setCatIdx(0);setQIdx(0);setAnswers({});setResult(null);setScreen("questions");}}
            style={{background:`linear-gradient(135deg,#2d1060,#3b0764)`,border:`1.5px solid ${PURPLE}55`,borderRadius:18,padding:"16px 32px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#fff",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:10,boxShadow:`0 8px 32px ${PURPLE}20`}}>
            🌫️ {L?"Scan my environment":"Scanner mon environnement"}
          </button>
        </div>
      </div>
      <div style={{padding:"20px 20px 0"}}>
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"5 DIMENSIONS ANALYZED":"5 DIMENSIONS ANALYSÉES"}</div>
          {CATEGORIES.map((cat,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",marginBottom:i<CATEGORIES.length-1?12:0,paddingBottom:i<CATEGORIES.length-1?12:0,borderBottom:i<CATEGORIES.length-1?`1px solid ${BDR}`:"none"}}>
              <div style={{fontSize:24,flexShrink:0}}>{cat.emoji}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#edf5ef"}}>{cat.label}</div>
                <div style={{fontSize:11,color:MUT}}>{cat.questions.length} {L?"questions":"questions"}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
          <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>
            {L?"The Prophet ﷺ said: 'Cleanliness is half of faith.' A clean, organized environment is not just aesthetic — it directly impacts mental clarity and spiritual state.":"Le Prophète ﷺ a dit : 'La propreté est la moitié de la foi.' Un environnement propre et organisé n'est pas qu'esthétique — il impacte directement la clarté mentale et l'état spirituel."}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (screen === "questions" && currentQ) return (
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",paddingBottom:40}}>
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%,${PURPLE}15 0%,#060d08 60%)`,flexShrink:0}}>
        <button onClick={goBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:6}}>
          <span style={{color:PURPLE,fontWeight:700}}>{currentCat.emoji} {currentCat.label}</span>
          <span style={{color:MUT}}>{answeredQ}/{totalQ}</span>
        </div>
        <div style={{background:"#142018",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${(answeredQ/totalQ)*100}%`,height:"100%",background:`linear-gradient(90deg,${PURPLE}88,${PURPLE})`,borderRadius:8,transition:"width .4s ease"}}/>
        </div>
      </div>

      <div style={{flex:1,padding:"0 22px 20px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:10}}>{currentCat.emoji}</div>
          <div className="serif" style={{fontSize:20,fontWeight:700,color:"#edf5ef",lineHeight:1.4}}>{currentQ.q}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {currentQ.opts.map(opt=>(
            <button key={opt.v} onClick={()=>selectAnswer(opt.v)}
              style={{background:CARD,border:`1.5px solid ${answers[currentQ.id]===opt.v?PURPLE:BDR}`,borderRadius:14,padding:"14px 18px",cursor:"pointer",textAlign:"left",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:12,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=PURPLE}
              onMouseLeave={e=>e.currentTarget.style.borderColor=answers[currentQ.id]===opt.v?PURPLE:BDR}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${PURPLE}${answers[currentQ.id]===opt.v?"20":"08"}`,border:`1.5px solid ${PURPLE}${answers[currentQ.id]===opt.v?"55":"22"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:PURPLE,flexShrink:0}}>{opt.v}</div>
              <div style={{fontSize:14,fontWeight:500,color:answers[currentQ.id]===opt.v?"#edf5ef":MUT}}>{opt.l}</div>
            </button>
          ))}
        </div>
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
          <button onClick={()=>analyzeWithAI(answers)} style={{background:`linear-gradient(135deg,#2d1060,#3b0764)`,border:"none",borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#fff",fontWeight:700,cursor:"pointer"}}>{L?"Retry":"Réessayer"}</button>
        </>
      ) : (
        <>
          <div style={{position:"relative",width:120,height:120,marginBottom:28}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`radial-gradient(circle,${PURPLE}22 0%,transparent 70%)`,animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>🌫️</div>
          </div>
          <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:10,color:PURPLE}}>{L?"Scanning your environment...":"Scan de ton environnement..."}</div>
          <div style={{color:MUT,fontSize:13,maxWidth:260,lineHeight:1.7}}>{L?"AI is analyzing your 5 environment dimensions...":"L'IA analyse tes 5 dimensions environnementales..."}</div>
          <div style={{display:"flex",gap:8,marginTop:24}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:PURPLE,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
          </div>
        </>
      )}
    </div>
  );

  // ─── RÉSULTAT ───
  if (screen === "result" && result) {
    const sc = result.score_global || 50;
    const c = scoreColor(sc);
    return (
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 22px 24px",background:`radial-gradient(ellipse at 50% 0%,${c}12 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Home":"Accueil"}</button>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${PURPLE}15`,border:`1px solid ${PURPLE}33`,borderRadius:20,padding:"5px 14px",marginBottom:14}}>
            <span>🌫️</span>
            <span style={{fontSize:11,fontWeight:700,color:PURPLE,letterSpacing:1}}>{L?"ENVIRONMENT SCAN":"SCAN ENVIRONNEMENT"}</span>
          </div>

          {/* Score global */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg width="90" height="90" style={{transform:"rotate(-90deg)"}}>
                <circle cx="45" cy="45" r="38" fill="none" stroke={`${c}22`} strokeWidth="8"/>
                <circle cx="45" cy="45" r="38" fill="none" stroke={c} strokeWidth="8"
                  strokeDasharray={`${2*Math.PI*38}`}
                  strokeDashoffset={`${2*Math.PI*38*(1-sc/100)}`}
                  strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontWeight:700,fontSize:22,color:c}}>{sc}</div>
                <div style={{fontSize:8,color:MUT}}>/100</div>
              </div>
            </div>
            <div>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:c,marginBottom:4}}>{scoreLabel(sc,L)}</div>
              <div style={{fontSize:13,color:"#edf5ef",lineHeight:1.6}}>{result.verdict}</div>
            </div>
          </div>

          {/* Scores par catégorie */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {CATEGORIES.map(cat=>{
              const s = result.scores_categories?.[cat.id] || 50;
              const cc = scoreColor(s);
              return(
                <div key={cat.id} style={{background:`${cc}08`,border:`1px solid ${cc}22`,borderRadius:12,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:16}}>{cat.emoji}</span>
                    <span style={{fontSize:10,color:MUT}}>{cat.label.split(" ")[0]}</span>
                  </div>
                  <div style={{fontWeight:700,fontSize:18,color:cc}}>{s}<span style={{fontSize:10,fontWeight:400,color:MUT}}>/100</span></div>
                  <div style={{background:"#142018",borderRadius:4,height:4,marginTop:4,overflow:"hidden"}}>
                    <div style={{width:`${s}%`,height:"100%",background:cc,borderRadius:4}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:"0 20px"}}>

          {/* Toxines principales */}
          {result.toxines_principales?.length>0&&(
            <div style={{background:"#1a0505",border:`1.5px solid ${DANGER}33`,borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{fontSize:11,color:DANGER,fontWeight:700,letterSpacing:.8,marginBottom:12}}>☠️ {L?"MAIN TOXINS DETECTED":"TOXINES PRINCIPALES DÉTECTÉES"}</div>
              {result.toxines_principales.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<result.toxines_principales.length-1?8:0}}>
                  <span style={{color:DANGER,fontSize:12,flexShrink:0}}>⚠️</span>
                  <span style={{fontSize:13,color:"#f87171",lineHeight:1.5}}>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Impact cerveau */}
          {result.impact_cerveau&&(
            <div style={{background:CARD,border:`1px solid ${PURPLE}33`,borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{fontSize:11,color:PURPLE,fontWeight:700,letterSpacing:.8,marginBottom:10}}>🧠 {L?"BRAIN IMPACT":"IMPACT SUR LE CERVEAU"}</div>
              <div style={{fontSize:13,color:"#c0a0e0",lineHeight:1.7}}>{result.impact_cerveau}</div>
            </div>
          )}

          {/* Changement immédiat */}
          {result.changement_immediat&&(
            <div style={{background:`${EM}06`,border:`1.5px solid ${EM}33`,borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{fontSize:10,color:EM,fontWeight:700,marginBottom:6}}>⚡ {L?"IMMEDIATE CHANGE #1":"CHANGEMENT IMMÉDIAT N°1"}</div>
              <div style={{fontSize:14,color:"#a0c8a8",lineHeight:1.7,fontWeight:600}}>{result.changement_immediat}</div>
            </div>
          )}

          {/* Plan 7 jours */}
          {result.plan_7_jours?.length>0&&(
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>📅 {L?"7-DAY PLAN":"PLAN 7 JOURS"}</div>
              {result.plan_7_jours.map((action,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<result.plan_7_jours.length-1?12:0,paddingBottom:i<result.plan_7_jours.length-1?12:0,borderBottom:i<result.plan_7_jours.length-1?`1px solid ${BDR}`:"none"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`${EM}12`,border:`1px solid ${EM}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:EM,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6,paddingTop:4}}>{action}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tibb */}
          {result.tibb&&(
            <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
              <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>{result.tibb}</div>
            </div>
          )}

          {/* Refaire */}
          <button onClick={()=>{setCatIdx(0);setQIdx(0);setAnswers({});setResult(null);setScreen("questions");}}
            style={{width:"100%",background:CARD,border:`1px solid ${PURPLE}33`,borderRadius:14,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:PURPLE,cursor:"pointer",fontWeight:700}}>
            🔄 {L?"Redo scan":"Refaire le scan"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

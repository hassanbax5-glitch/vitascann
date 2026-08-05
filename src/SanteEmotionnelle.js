// ============================================================
// VITASCANN — SanteEmotionnelle.js  v2.0
// ✅ Check-in IA conversationnel (5 questions naturelles)
// ✅ Claude analyse → niveau vibratoire Bronze→Maître
// ✅ Médecine Traditionnelle Chinoise (émotions → organes)
// ✅ 4 personnages RPG Cloudinary selon niveau
// ✅ Respiration guidée animée
// ✅ Aide santé mentale (ressources + chat de soutien IA)
// ✅ Historique + courbe 14 jours
// ✅ Streak + XP + VitaCoins
// ✅ Tibb an-Nabawi contextuel
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

// ─── CLOUDINARY PERSOS RPG ───
const RPG_CHARS = {
  low:     "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_160616_myin1q",
  neutral: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_151002_frehpw",
  high:    "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_145107_ldgtxl",
  elite:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
};

// ─── PALETTE ───
const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

// ─── NIVEAUX VIBRATOIRES ───
const NIVEAUX_VIBRATOIRES = [
  { id:"honte",        label:"Honte",        labelEn:"Shame",         vibration:20,  niveau:10, rang:"BRONZE",  color:"#ef4444", organe:"Reins",   organeEn:"Kidneys", perso:"low",    xp:5  },
  { id:"culpabilite",  label:"Culpabilité",  labelEn:"Guilt",         vibration:30,  niveau:14, rang:"BRONZE",  color:"#f87171", organe:"Foie",    organeEn:"Liver",   perso:"low",    xp:5  },
  { id:"apathie",      label:"Apathie",      labelEn:"Apathy",        vibration:50,  niveau:18, rang:"BRONZE",  color:"#fca5a5", organe:"Rate",    organeEn:"Spleen",  perso:"low",    xp:5  },
  { id:"peine",        label:"Peine",        labelEn:"Grief",         vibration:75,  niveau:20, rang:"ARGENT",  color:"#fb923c", organe:"Poumons", organeEn:"Lungs",   perso:"low",    xp:8  },
  { id:"peur",         label:"Peur",         labelEn:"Fear",          vibration:100, niveau:22, rang:"ARGENT",  color:"#fdba74", organe:"Reins",   organeEn:"Kidneys", perso:"low",    xp:8  },
  { id:"desir",        label:"Désir",        labelEn:"Desire",        vibration:125, niveau:24, rang:"ARGENT",  color:"#fde68a", organe:"Cœur",    organeEn:"Heart",   perso:"neutral",xp:10 },
  { id:"colere",       label:"Colère",       labelEn:"Anger",         vibration:150, niveau:26, rang:"OR",      color:"#d4d422", organe:"Foie",    organeEn:"Liver",   perso:"neutral",xp:12 },
  { id:"fierte",       label:"Fierté",       labelEn:"Pride",         vibration:175, niveau:28, rang:"OR",      color:"#a3e635", organe:"Cœur",    organeEn:"Heart",   perso:"neutral",xp:12 },
  { id:"courage",      label:"Courage",      labelEn:"Courage",       vibration:200, niveau:30, rang:"OR",      color:"#4ade80", organe:"Poumons", organeEn:"Lungs",   perso:"neutral",xp:15 },
  { id:"neutralite",   label:"Neutralité",   labelEn:"Neutrality",    vibration:250, niveau:32, rang:"PLATINE", color:"#34d399", organe:"Rate",    organeEn:"Spleen",  perso:"high",   xp:18 },
  { id:"volonte",      label:"Volonté",      labelEn:"Willingness",   vibration:310, niveau:34, rang:"PLATINE", color:"#2dd4bf", organe:"Foie",    organeEn:"Liver",   perso:"high",   xp:20 },
  { id:"acceptation",  label:"Acceptation",  labelEn:"Acceptance",    vibration:350, niveau:36, rang:"PLATINE", color:"#22d3ee", organe:"Poumons", organeEn:"Lungs",   perso:"high",   xp:22 },
  { id:"raison",       label:"Raison",       labelEn:"Reason",        vibration:400, niveau:38, rang:"DIAMANT", color:"#818cf8", organe:"Cerveau", organeEn:"Brain",   perso:"high",   xp:25 },
  { id:"amour",        label:"Amour",        labelEn:"Love",          vibration:500, niveau:40, rang:"DIAMANT", color:"#c084fc", organe:"Cœur",    organeEn:"Heart",   perso:"elite",  xp:30 },
  { id:"joie",         label:"Joie",         labelEn:"Joy",           vibration:540, niveau:42, rang:"DIAMANT", color:"#e879f9", organe:"Cœur",    organeEn:"Heart",   perso:"elite",  xp:35 },
  { id:"paix",         label:"Paix",         labelEn:"Peace",         vibration:600, niveau:46, rang:"MAÎTRE",  color:"#f0abfc", organe:"Cœur",    organeEn:"Heart",   perso:"elite",  xp:40 },
  { id:"illumination", label:"Illumination", labelEn:"Enlightenment", vibration:700, niveau:50, rang:"MAÎTRE",  color:"#ffffff", organe:"Tout",    organeEn:"All",     perso:"elite",  xp:50 },
];

// ─── MTC ───
const MTC_DATA = {
  "Foie":    { emoji:"🫀", symptomes:["Migraines","Digestion lente","Tensions dos"],       symptomesEn:["Migraines","Slow digestion","Back tension"],    nutrition:["Artichaut","Citron","Curcuma"],     nutritionEn:["Artichoke","Lemon","Turmeric"],      breathwork:"Respiration 4-7-8",          color:"#4ade80" },
  "Reins":   { emoji:"💧", symptomes:["Douleurs lombaires","Troubles du sommeil","Fatigue"],symptomesEn:["Lower back pain","Sleep issues","Fatigue"],     nutrition:["Noix","Haricots noirs","Sésame"],   nutritionEn:["Walnuts","Black beans","Sesame"],    breathwork:"Respiration carrée",          color:"#60a5fa" },
  "Poumons": { emoji:"🫁", symptomes:["Fatigue","Respiration courte","Peau sèche"],        symptomesEn:["Fatigue","Short breath","Dry skin"],            nutrition:["Poire","Ail","Gingembre"],          nutritionEn:["Pear","Garlic","Ginger"],            breathwork:"Respiration cohérente",       color:"#fb923c" },
  "Cœur":    { emoji:"❤️", symptomes:["Palpitations","Insomnie","Anxiété"],               symptomesEn:["Palpitations","Insomnia","Anxiety"],            nutrition:["Grenade","Myrtilles","Avoine"],     nutritionEn:["Pomegranate","Blueberries","Oats"],  breathwork:"Cohérence cardiaque",         color:"#f87171" },
  "Rate":    { emoji:"🟡", symptomes:["Ballonnements","Fatigue post-repas","Pensées en boucle"],symptomesEn:["Bloating","Post-meal fatigue","Rumination"],nutrition:["Potiron","Riz complet","Fenouil"],  nutritionEn:["Pumpkin","Brown rice","Fennel"],     breathwork:"Respiration diaphragmatique", color:"#fbbf24" },
  "Cerveau": { emoji:"🧠", symptomes:["Brouillard mental","Indécision"],                  symptomesEn:["Brain fog","Indecision"],                       nutrition:["Noix","Omega-3","Thé vert"],        nutritionEn:["Walnuts","Omega-3","Green tea"],     breathwork:"Respiration alternée",        color:"#c084fc" },
  "Tout":    { emoji:"✨", symptomes:["Corps en harmonie complète"],                      symptomesEn:["Body in full harmony"],                         nutrition:["Tout est équilibré"],               nutritionEn:["All is balanced"],                   breathwork:"Méditation",                 color:"#ffffff" },
};

// ─── BREATHWORK ───
const BREATHWORK = {
  "Respiration 4-7-8":           { steps:["Expire complètement","Inspire 4 secondes","Retiens 7 secondes","Expire lentement 8 secondes"], stepsEn:["Exhale fully","Inhale 4 seconds","Hold 7 seconds","Exhale slowly 8 seconds"], cycles:4, stepDuration:4000 },
  "Respiration carrée":          { steps:["Inspire 4s","Retiens 4s","Expire 4s","Pause 4s"],           stepsEn:["Inhale 4s","Hold 4s","Exhale 4s","Pause 4s"],    cycles:4, stepDuration:4000 },
  "Respiration cohérente":       { steps:["Inspire 5 secondes","Expire 5 secondes"],                   stepsEn:["Inhale 5 seconds","Exhale 5 seconds"],            cycles:6, stepDuration:5000 },
  "Cohérence cardiaque":         { steps:["Inspire 5 secondes","Expire 5 secondes"],                   stepsEn:["Inhale 5 seconds","Exhale 5 seconds"],            cycles:6, stepDuration:5000 },
  "Respiration diaphragmatique": { steps:["Main sur le ventre","Inspire (ventre gonfle)","Expire (ventre rentre)"], stepsEn:["Hand on belly","Inhale (belly rises)","Exhale (belly falls)"], cycles:5, stepDuration:4000 },
  "Méditation":                  { steps:["Ferme les yeux","Observe ta respiration","Laisse passer les pensées"], stepsEn:["Close your eyes","Observe your breath","Let thoughts pass"], cycles:0, stepDuration:5000 },
  "Respiration alternée":        { steps:["Inspire narine gauche 4s","Expire narine droite 4s"],       stepsEn:["Inhale left nostril 4s","Exhale right nostril 4s"], cycles:5, stepDuration:4000 },
};

// ─── RANGS ───
const RANG_INFO = {
  "BRONZE":  { color:"#cd7f32", icon:"🥉", bg:"#2a1505" },
  "ARGENT":  { color:"#c0c0c0", icon:"🥈", bg:"#1a1a1a" },
  "OR":      { color:"#e2b84a", icon:"🥇", bg:"#1a1200" },
  "PLATINE": { color:"#4dd9d9", icon:"💠", bg:"#052020" },
  "DIAMANT": { color:"#9580ff", icon:"💎", bg:"#0d0520" },
  "MAÎTRE":  { color:"#ffffff", icon:"👑", bg:"#0a0010" },
};

// ─── TIBB ───
const TIBB = {
  low:     "Le Prophète ﷺ a dit : 'Étonnant l'affaire du croyant — tout ce qui lui arrive est un bien.' La tristesse est une étape, pas une destination.",
  neutral: "Le Prophète ﷺ recommandait : 'Hasbiyallahu wa ni'mal wakeel.' Allah me suffit, quel excellent garant.",
  high:    "Le Prophète ﷺ : 'Allah aime voir son serviteur utiliser ses dons.' Un état élevé est une forme de gratitude.",
  elite:   "Le Prophète ﷺ : 'Les meilleurs sont ceux qui ont le meilleur caractère.' La paix intérieure est la plus haute station.",
};

// ─── RESSOURCES SANTÉ MENTALE ───
const RESSOURCES_FR = [
  { nom:"Ligne Espoir (Canada)", tel:"1-855-783-8833", desc:"Lignes d'écoute confidentielles 24h/24", emoji:"📞", couleur:"#60a5fa", urgence:true },
  { nom:"Tel-Aide Québec", tel:"514-935-1101", desc:"Soutien émotionnel gratuit, Montréal", emoji:"🤝", couleur:"#4ade80", urgence:false },
  { nom:"Suicide.ca", tel:"1-866-APPELLE", desc:"Chat & téléphone, soutien en crise", emoji:"💬", couleur:"#f87171", urgence:true },
  { nom:"Association canadienne santé mentale", tel:"1-833-456-4566", desc:"Ressources & orientation professionnelle", emoji:"🧠", couleur:"#c084fc", urgence:false },
];
const RESSOURCES_EN = [
  { nom:"Crisis Services Canada", tel:"1-833-456-4566", desc:"24/7 confidential support line", emoji:"📞", couleur:"#60a5fa", urgence:true },
  { nom:"Kids Help Phone", tel:"1-800-668-6868", desc:"Free counseling for all ages", emoji:"🤝", couleur:"#4ade80", urgence:false },
  { nom:"CAMH", tel:"1-800-463-2338", desc:"Mental health & addiction resources", emoji:"🧠", couleur:"#c084fc", urgence:false },
];

// ─── POOL DE QUESTIONS (20 FR / 20 EN) ───
const POOL_FR = [
  // Sommeil
  "Comment tu as dormi cette nuit ? Tu t'es réveillé reposé ou épuisé ?",
  "Est-ce que ton sommeil a été agité, ou tu as bien dormi ?",
  // Corps
  "Quand tu penses à ta journée d'aujourd'hui, tu ressens quoi physiquement dans le corps ?",
  "Est-ce qu'il y a des tensions dans ton corps en ce moment — épaules, mâchoire, ventre ?",
  "Comment est ton niveau d'énergie là, maintenant — 1 à 10 ?",
  // Mental
  "Est-ce qu'il y a quelque chose qui te pèse en ce moment — une pensée, une situation, une personne ?",
  "Est-ce que tu as eu du mal à te concentrer aujourd'hui, ou ton esprit était clair ?",
  "Est-ce qu'il y a des pensées qui reviennent en boucle en ce moment ?",
  // Émotions
  "Est-ce que tu as vécu un moment de joie ou de gratitude aujourd'hui — même tout petit ?",
  "Qu'est-ce qui t'a irrité ou mis mal à l'aise aujourd'hui, si quelque chose ?",
  "Est-ce que tu te sens connecté aux gens autour de toi, ou plutôt isolé ?",
  "As-tu eu peur de quelque chose aujourd'hui, ou une anxiété en arrière-plan ?",
  // Spirituel/sens
  "Est-ce que tu te sens aligné avec tes valeurs en ce moment, ou tu as l'impression de trahir quelque chose ?",
  "Quand tu penses à l'avenir proche, tu ressens de l'espoir ou de l'appréhension ?",
  "Est-ce que tu as fait quelque chose aujourd'hui dont tu es fier, même petite chose ?",
  // Introspection
  "En une ou deux phrases honnêtes, décris exactement comment tu te sens là, maintenant.",
  "Si ton état émotionnel était une météo, ce serait quoi — soleil, nuages, orage ?",
  "Qu'est-ce qui te manque en ce moment pour te sentir vraiment bien ?",
  "Est-ce que tu te sens dans un flux naturel aujourd'hui, ou tu forces chaque chose ?",
  "Qu'est-ce que tu gardes pour toi en ce moment et que tu n'as pas dit à quelqu'un ?",
];

const POOL_EN = [
  "How did you sleep last night? Did you wake up rested or exhausted?",
  "Was your sleep restless, or did you sleep well?",
  "When you think about today, what do you physically feel in your body?",
  "Are there any tensions in your body right now — shoulders, jaw, stomach?",
  "What's your energy level right now — on a scale of 1 to 10?",
  "Is there something weighing on you right now — a thought, a situation, a person?",
  "Did you struggle to focus today, or was your mind clear?",
  "Are there any thoughts running on loop in your mind right now?",
  "Did you experience a moment of joy or gratitude today — even a small one?",
  "What irritated you or made you uncomfortable today, if anything?",
  "Do you feel connected to the people around you, or more isolated?",
  "Did you feel fear or background anxiety about anything today?",
  "Do you feel aligned with your values right now, or like you're betraying something?",
  "When you think about the near future, do you feel hope or dread?",
  "Did you do something today you're proud of, even something small?",
  "In one or two honest sentences, describe exactly how you feel right now.",
  "If your emotional state were weather, what would it be — sunshine, clouds, storm?",
  "What's missing right now for you to truly feel good?",
  "Do you feel in flow today, or are you forcing everything?",
  "What are you keeping to yourself right now that you haven't told anyone?",
];

// ─── SÉLECTION DYNAMIQUE DES QUESTIONS ───
// Logique Option C : pool aléatoire + adaptation selon dernier résultat
function pickQuestions(lang, lastLog) {
  const pool = lang === "en" ? POOL_EN : POOL_FR;
  // Questions contextuelles selon dernier état émotionnel
  let contextIndices = [];
  if (lastLog) {
    const v = lastLog.vibration || 0;
    if (v < 100)       contextIndices = [1, 3, 7, 11, 15]; // axé corps + rumination + peur
    else if (v < 200)  contextIndices = [2, 6, 9, 12, 15]; // axé énergie + irritation + valeurs
    else if (v < 350)  contextIndices = [4, 8, 13, 18, 15]; // axé flux + espoir + gratitude
    else               contextIndices = [8, 14, 16, 17, 19]; // axé joie + sens + ce qui manque
  }
  // Si on a des indices contextuels, on prend 2 contextuels + 3 aléatoires différents
  if (contextIndices.length > 0) {
    const contextPick = contextIndices.slice(0, 2).map(i => pool[Math.min(i, pool.length-1)]);
    const remaining = pool.filter((_, i) => !contextIndices.includes(i));
    const shuffled = remaining.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...contextPick, ...shuffled].sort(() => Math.random() - 0.5);
  }
  // Sinon 5 questions aléatoires du pool
  return pool.sort(() => Math.random() - 0.5).slice(0, 5);
}

// ─── PROMPT IA ───
function buildAnalysisPrompt(lang, questions, answers) {
  const isEn = lang === "en";
  const qa = answers.map((a, i) => `Q${i+1}: ${questions[i]}\nRéponse: ${a}`).join("\n\n");
  const systemFR = `Tu es le coach d'intelligence émotionnelle de VitaScann. Analyse les réponses selon l'Échelle de Conscience (Hawkins). IDs: honte(20),culpabilite(30),apathie(50),peine(75),peur(100),desir(125),colere(150),fierte(175),courage(200),neutralite(250),volonte(310),acceptation(350),raison(400),amour(500),joie(540),paix(600),illumination(700). Sois honnête — ne mets PAS un niveau élevé pour faire plaisir. Retourne UNIQUEMENT un JSON valide sans markdown: {"niveau_id":"string","vibration":number,"rang":"BRONZE|ARGENT|OR|PLATINE|DIAMANT|MAÎTRE","analyse":"2-3 phrases basées sur les réponses","point_fort":"observation positive concrète","conseil":"action concrète pour aujourd'hui","alerte_mentale":boolean}`;
  const systemEN = `You are VitaScann's emotional coach. Analyze answers using Hawkins' Scale of Consciousness. IDs: honte(20),culpabilite(30),apathie(50),peine(75),peur(100),desir(125),colere(150),fierte(175),courage(200),neutralite(250),volonte(310),acceptation(350),raison(400),amour(500),joie(540),paix(600),illumination(700). Be honest — do NOT inflate the level. Return ONLY valid JSON no markdown: {"niveau_id":"string","vibration":number,"rang":"BRONZE|ARGENT|OR|PLATINE|DIAMANT|MAÎTRE","analyse":"2-3 sentences based on answers","point_fort":"concrete positive observation","conseil":"concrete action for today","alerte_mentale":boolean}`;
  return {
    system: isEn ? systemEN : systemFR,
    user: isEn ? `User answers:\n\n${qa}\n\nAnalyze and return JSON.` : `Réponses:\n\n${qa}\n\nAnalyse et retourne le JSON.`,
  };
}

// ─── STORAGE ───
const STORAGE_KEY = "vs_emotion_log_v2";
function getToday() { return new Date().toISOString().slice(0,10); }
function getLog() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch { return []; } }
function saveLog(log) { localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0,60))); }

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function SanteEmotionnelle({ user, onBack, onCoinsEarned, lang, profile }) {
  const L = lang === "en";

  // Sélection dynamique des questions au montage (Option C)
  const logInit = getLog();
  const lastLog = logInit[0] || null;
  const [QUESTIONS] = useState(() => pickQuestions(lang, lastLog));

  const [screen, setScreen]           = useState("home");
  const [qIndex, setQIndex]           = useState(0);
  const [answers, setAnswers]         = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [aiResult, setAiResult]       = useState(null);
  const [analyzeError, setAnalyzeError] = useState(false);
  const [log, setLog]                 = useState(logInit);
  const [imgError, setImgError]       = useState({});
  const [typingDone, setTypingDone]   = useState(false);
  const [displayedQ, setDisplayedQ]   = useState("");
  const [breathStep, setBreathStep]   = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathDone, setBreathDone]   = useState(false);
  const [mentalMessages, setMentalMessages] = useState([]);
  const [mentalInput, setMentalInput] = useState("");
  const [mentalLoading, setMentalLoading] = useState(false);

  const breathTimerRef   = useRef(null);
  const breathProgressRef= useRef(null);
  const textareaRef      = useRef(null);
  const chatEndRef       = useRef(null);

  // Avatars selon genre (profile.sexe)
  const sexe = profile?.sexe || "homme";
  const RPG_CHARS_GENRED = {
    homme: {
      low:     "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_160616_myin1q",
      neutral: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
      high:    "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
      elite:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
    },
    femme: {
      low:     "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_151002_frehpw",
      neutral: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_151002_frehpw",
      high:    "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_145107_ldgtxl",
      elite:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_145107_ldgtxl",
    },
  };
  const RPG_CHARS = RPG_CHARS_GENRED[sexe] || RPG_CHARS_GENRED["homme"];

  const todayLog = log.find(e => e.date === getToday());
  const streak = (() => {
    let s=0, d=new Date();
    for(let i=0;i<30;i++){
      if(log.find(e=>e.date===d.toISOString().slice(0,10))){s++;d.setDate(d.getDate()-1);}
      else break;
    }
    return s;
  })();

  // ─── Typewriter ───
  useEffect(()=>{
    if(screen!=="checkin") return;
    const q=QUESTIONS[qIndex]; setDisplayedQ(""); setTypingDone(false);
    let i=0;
    const t=setInterval(()=>{ i++; setDisplayedQ(q.slice(0,i)); if(i>=q.length){clearInterval(t);setTypingDone(true);} },22);
    return ()=>clearInterval(t);
  },[screen,qIndex,lang]);

  useEffect(()=>{
    if(typingDone && textareaRef.current) setTimeout(()=>textareaRef.current?.focus(),100);
  },[typingDone]);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[mentalMessages]);

  // ─── Submit réponse ───
  const submitAnswer = useCallback(()=>{
    if(!currentAnswer.trim()) return;
    const newAnswers=[...answers, currentAnswer.trim()];
    setAnswers(newAnswers); setCurrentAnswer("");
    if(qIndex<QUESTIONS.length-1){ setQIndex(qIndex+1); setTypingDone(false); }
    else analyzeWithAI(newAnswers);
  },[currentAnswer,answers,qIndex,QUESTIONS]);

  // ─── Analyse IA ───
  const analyzeWithAI = useCallback(async(finalAnswers)=>{
    setScreen("analyzing"); setAnalyzeError(false);
    try {
      const prompt = buildAnalysisPrompt(lang, QUESTIONS, finalAnswers);
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:800, system:prompt.system, messages:[{role:"user",content:prompt.user}] }),
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      const niv=NIVEAUX_VIBRATOIRES.find(n=>n.id===parsed.niveau_id)||NIVEAUX_VIBRATOIRES[4];
      const fullResult={...parsed,niv};
      setAiResult(fullResult);
      const today=getToday();
      const entry={date:today,id:niv.id,vibration:niv.vibration,rang:niv.rang,xp:niv.xp,analyse:parsed.analyse};
      const existing=log.find(e=>e.date===today);
      const newLog=existing?log.map(e=>e.date===today?entry:e):[entry,...log];
      setLog(newLog); saveLog(newLog);
      if(!existing&&user?.uid&&!user?.isDemo&&onCoinsEarned) onCoinsEarned(niv.xp);
      setScreen("result");
    } catch(e){ console.error(e); setAnalyzeError(true); }
  },[lang,log,user,onCoinsEarned]);

  // ─── Reset ───
  const resetCheckin=()=>{ setQIndex(0);setAnswers([]);setCurrentAnswer("");setAiResult(null);setAnalyzeError(false);setScreen("checkin"); };

  // ─── Breathwork ───
  const startBreathwork=useCallback(()=>{
    if(!aiResult?.niv) return;
    const mtc=MTC_DATA[aiResult.niv.organe]||MTC_DATA["Cœur"];
    const bw=BREATHWORK[mtc.breathwork]||BREATHWORK["Cohérence cardiaque"];
    setBreathStep(0);setBreathCount(0);setBreathProgress(0);setBreathActive(true);setBreathDone(false);setScreen("breathwork");
    let step=0;
    breathTimerRef.current=setInterval(()=>{
      step=(step+1)%bw.steps.length; setBreathStep(step);
      if(step===0) setBreathCount(c=>{ const n=c+1; if(bw.cycles>0&&n>=bw.cycles){clearInterval(breathTimerRef.current);clearInterval(breathProgressRef.current);setBreathActive(false);setBreathDone(true);} return n; });
    },bw.stepDuration);
    breathProgressRef.current=setInterval(()=>setBreathProgress(p=>p>=100?0:p+1),bw.stepDuration/100);
  },[aiResult]);

  // ─── Mental health chat IA ───
  const sendMentalMessage = useCallback(async()=>{
    if(!mentalInput.trim()||mentalLoading) return;
    const userMsg={role:"user",text:mentalInput.trim()};
    const newMessages=[...mentalMessages,userMsg];
    setMentalMessages(newMessages); setMentalInput(""); setMentalLoading(true);
    try {
      const systemPrompt = L
        ? `You are a compassionate mental wellness companion integrated in the VitaScann health app. Your role is to listen with empathy, provide emotional support, and offer Islamic-inspired wellness tips when relevant. You are NOT a therapist and always encourage professional help when needed. Keep responses warm, short (3-5 sentences), and actionable. Never be dismissive. If the person seems in serious distress, gently encourage them to call a crisis line.`
        : `Tu es un compagnon de bien-être mental intégré dans l'app santé VitaScann. Ton rôle est d'écouter avec empathie, offrir un soutien émotionnel, et proposer des conseils de bien-être inspirés de l'Islam quand c'est pertinent. Tu n'es PAS thérapeute et encourages toujours l'aide professionnelle quand nécessaire. Garde tes réponses chaleureuses, courtes (3-5 phrases) et actionnables. Ne minimise jamais la douleur de la personne. Si elle semble en grande détresse, encourage doucement à appeler une ligne d'écoute.`;
      const messages=newMessages.map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:400, system:systemPrompt, messages }),
      });
      const data=await res.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"";
      setMentalMessages(prev=>[...prev,{role:"assistant",text:reply}]);
    } catch(e){ setMentalMessages(prev=>[...prev,{role:"assistant",text:L?"I'm here for you. Please try again.":"Je suis là pour toi. Réessaie."}]); }
    finally{ setMentalLoading(false); }
  },[mentalInput,mentalMessages,mentalLoading,L]);

  const openMentalHealth=()=>{
    if(mentalMessages.length===0){
      const greeting={ role:"assistant", text: L
        ? "Salam 🌿 I'm here to listen, without judgment. How are you feeling? You can tell me anything."
        : "Salam 🌿 Je suis là pour t'écouter, sans jugement. Comment tu te sens ? Tu peux me dire ce que tu veux."
      };
      setMentalMessages([greeting]);
    }
    setScreen("mental_health");
  };

  // ════════════════════════════════════════════════
  // SCREEN : HOME
  // ════════════════════════════════════════════════
  if(screen==="home") return(
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 28px",background:"radial-gradient(ellipse at 50% 0%,#3a005088 0%,#060d08 65%)",position:"relative",overflow:"hidden"}}>
        <button onClick={onBack} style={{position:"absolute",top:52,left:20,background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13}}>← {L?"Back":"Retour"}</button>
        {[...Array(10)].map((_,i)=>(
          <div key={i} style={{position:"absolute",top:`${8+(i*11)%60}%`,left:`${(i*17)%88}%`,width:i%2===0?3:2,height:i%2===0?3:2,borderRadius:"50%",background:i%3===0?"#c084fc":GOLD,opacity:.4,animation:`pulse ${1.5+(i*.25)}s ease-in-out infinite`}}/>
        ))}
        <div style={{textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#3a005020",border:"1px solid #c084fc44",borderRadius:20,padding:"5px 14px",marginBottom:18}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#c084fc",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"#c084fc",letterSpacing:1}}>{L?"EMOTIONAL HEALTH":"SANTÉ ÉMOTIONNELLE"}</span>
          </div>
          <div className="serif" style={{fontSize:30,fontWeight:700,lineHeight:1.25,marginBottom:12,color:"#edf5ef"}}>
            {L?"How are you really\nfeeling today?":"Comment tu te sens\nvraiment aujourd'hui ?"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto 28px"}}>
            {L?"Answer 5 honest questions. AI analyzes your emotional vibration and affected organs.":"Réponds à 5 questions honnêtes. L'IA analyse ta vibration émotionnelle et tes organes affectés."}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              {val:streak>0?`${streak}🔥`:"0",label:L?"Streak":"Streak",color:"#f97316"},
              {val:log.length,label:L?"Check-ins":"Check-ins",color:"#c084fc"},
              {val:todayLog?"✓":"—",label:L?"Today":"Aujourd'hui",color:todayLog?EM:MUT},
            ].map(({val,label,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:20,color}}>{val}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"20px 20px 0"}}>
        {/* CTA principal */}
        <button onClick={resetCheckin}
          style={{width:"100%",background:"linear-gradient(135deg,#5b21b6,#7c3aed)",color:"#fff",border:"none",borderRadius:18,padding:"18px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 8px 32px #5b21b640"}}>
          <span style={{fontSize:22}}>🔮</span>
          {todayLog?(L?"Redo check-in":"Refaire mon check-in"):(L?"Start check-in":"Commencer mon check-in")}
        </button>

        {/* Aide santé mentale */}
        <button onClick={openMentalHealth}
          style={{width:"100%",background:"linear-gradient(135deg,#0a1f2e,#0d2a1a)",border:"1.5px solid #60a5fa44",borderRadius:18,padding:"16px 18px",cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:14,fontFamily:"'Outfit',sans-serif",textAlign:"left"}}>
          <div style={{fontSize:32,flexShrink:0}}>🫂</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:15,color:"#60a5fa"}}>{L?"Mental Health Support":"Aide Santé Mentale"}</div>
            <div style={{color:MUT,fontSize:12,marginTop:2}}>{L?"Talk to AI · Resources · Crisis lines":"Parler à l'IA · Ressources · Lignes d'écoute"}</div>
          </div>
          <div style={{fontSize:20,color:"#60a5fa"}}>→</div>
        </button>

        {/* Résultat du jour si dispo */}
        {todayLog&&(()=>{
          const niv=NIVEAUX_VIBRATOIRES.find(n=>n.id===todayLog.id);
          const ri=RANG_INFO[todayLog.rang]||RANG_INFO["BRONZE"];
          if(!niv) return null;
          return(
            <div style={{background:`${niv.color}08`,border:`1.5px solid ${niv.color}33`,borderRadius:18,padding:16,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,flexShrink:0}}>
                {!imgError[niv.perso]
                  ?<img src={RPG_CHARS[niv.perso]} alt="" onError={()=>setImgError(e=>({...e,[niv.perso]:true}))} style={{width:"100%",height:"100%",objectFit:"contain",filter:`drop-shadow(0 0 10px ${niv.color}88)`}}/>
                  :<div style={{fontSize:36,textAlign:"center"}}>{ri.icon}</div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:niv.color,fontWeight:700,letterSpacing:.8,marginBottom:4}}>{L?"TODAY":"AUJOURD'HUI"}</div>
                <div className="serif" style={{fontSize:22,fontWeight:700,color:niv.color}}>{L?niv.labelEn:niv.label}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>🔮 {niv.vibration} Hz · {niv.rang}</div>
              </div>
              {aiResult&&<button onClick={()=>setScreen("result")} style={{background:"none",border:`1px solid ${niv.color}44`,borderRadius:10,padding:"8px 12px",color:niv.color,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700,flexShrink:0}}>{L?"See →":"Voir →"}</button>}
            </div>
          );
        })()}

        {/* Comment ça marche */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"HOW IT WORKS":"COMMENT ÇA MARCHE"}</div>
          {[
            {ic:"💬",t:L?"5 honest questions":"5 questions honnêtes",s:L?"Answer naturally":"Réponds naturellement"},
            {ic:"🧠",t:L?"AI analyzes you":"L'IA t'analyse",s:L?"Detects real vibration":"Détecte ta vraie vibration"},
            {ic:"🫀",t:L?"Organ + breathwork":"Organe + respiration",s:L?"TCM + breathing":"MTC + respiration guidée"},
            {ic:"🫂",t:L?"Mental health":"Santé mentale",s:L?"Support & resources":"Soutien & ressources"},
          ].map(({ic,t,s},i,arr)=>(
            <div key={i} style={{display:"flex",gap:12,marginBottom:i<arr.length-1?14:0,paddingBottom:i<arr.length-1?14:0,borderBottom:i<arr.length-1?`1px solid ${BDR}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#3a005015",border:"1px solid #c084fc22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ic}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#edf5ef"}}>{t}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Historique rapide */}
        {log.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8}}>{L?"RECENT":"RÉCENT"}</div>
              <button onClick={()=>setScreen("history")} style={{background:"none",border:"none",color:"#c084fc",fontSize:11,cursor:"pointer"}}>{L?"See all →":"Voir tout →"}</button>
            </div>
            {log.slice(0,3).map((entry,i)=>{
              const niv=NIVEAUX_VIBRATOIRES.find(n=>n.id===entry.id);
              const ri=RANG_INFO[entry.rang]||RANG_INFO["BRONZE"];
              if(!niv) return null;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:niv.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:niv.color}}>{L?niv.labelEn:niv.label}</div>
                    <div style={{fontSize:11,color:MUT}}>🔮 {niv.vibration} Hz · {entry.date}</div>
                  </div>
                  <div style={{fontSize:10,background:`${RANG_INFO[entry.rang]?.color||"#fff"}15`,color:RANG_INFO[entry.rang]?.color||"#fff",borderRadius:20,padding:"2px 8px",fontWeight:700}}>{ri.icon} {entry.rang}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tibb */}
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:20}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
          <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>{L?"The Prophet ﷺ said: 'Verily there is a piece of flesh — if it is sound, the whole body is sound.' Emotional health is the foundation of physical health.":"Le Prophète ﷺ a dit : 'Il y a dans le corps un morceau de chair — s'il est sain, tout le corps l'est.' La santé émotionnelle est la base de la santé physique."}</div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════
  // SCREEN : CHECK-IN
  // ════════════════════════════════════════════════
  if(screen==="checkin") return(
    <div style={{minHeight:"100vh",paddingBottom:60,background:"#060d08",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"52px 22px 20px",background:"radial-gradient(ellipse at 50% 0%,#200035 0%,#060d08 60%)"}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUT,marginBottom:6}}>
            <span>{L?`Question ${qIndex+1} of ${QUESTIONS.length}`:`Question ${qIndex+1} sur ${QUESTIONS.length}`}</span>
            <span style={{color:"#c084fc",fontWeight:700}}>{Math.round((qIndex/QUESTIONS.length)*100)}%</span>
          </div>
          <div style={{background:"#142018",borderRadius:8,height:6,overflow:"hidden"}}>
            <div style={{width:`${(qIndex/QUESTIONS.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#7c3aed,#c084fc)",borderRadius:8,transition:"width .5s ease"}}/>
          </div>
        </div>
      </div>

      <div style={{flex:1,padding:"0 22px 20px",display:"flex",flexDirection:"column"}}>
        {/* Bulle IA */}
        <div style={{display:"flex",gap:12,marginBottom:24,alignItems:"flex-start"}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#5b21b6,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,marginTop:4}}>🔮</div>
          <div style={{flex:1,background:"#1a0030",border:"1px solid #c084fc33",borderRadius:"4px 18px 18px 18px",padding:"14px 16px",minHeight:70}}>
            <div style={{fontSize:15,color:"#edf5ef",lineHeight:1.65}}>
              {displayedQ}
              {!typingDone&&<span style={{animation:"pulse 1s infinite",color:"#c084fc"}}>|</span>}
            </div>
          </div>
        </div>

        {/* Réponses précédentes */}
        {answers.map((a,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:8,justifyContent:"flex-end"}}>
            <div style={{background:"#0c2010",border:`1px solid ${EM}22`,borderRadius:"18px 4px 18px 18px",padding:"10px 14px",maxWidth:"80%",fontSize:13,color:"#a0c8a8",lineHeight:1.5}}>{a}</div>
          </div>
        ))}

        {/* Input */}
        {typingDone&&(
          <div style={{marginTop:"auto"}}>
            <textarea ref={textareaRef} value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&currentAnswer.trim()){e.preventDefault();submitAnswer();}}}
              placeholder={L?"Type your answer...":"Tape ta réponse..."} rows={3}
              style={{width:"100%",background:"#0c1810",border:"1.5px solid #c084fc44",borderRadius:14,padding:"14px 16px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#edf5ef",outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#c084fc"}
              onBlur={e=>e.target.style.borderColor="#c084fc44"}/>
            <button onClick={submitAnswer} disabled={!currentAnswer.trim()}
              style={{width:"100%",marginTop:10,background:currentAnswer.trim()?"linear-gradient(135deg,#5b21b6,#7c3aed)":"#1a1a2a",color:currentAnswer.trim()?"#fff":MUT,border:"none",borderRadius:14,padding:"15px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,cursor:currentAnswer.trim()?"pointer":"not-allowed"}}>
              {qIndex<QUESTIONS.length-1?(L?"Next →":"Suivant →"):(L?"Analyze ✨":"Analyser ✨")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════
  // SCREEN : ANALYZING
  // ════════════════════════════════════════════════
  if(screen==="analyzing") return(
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      {analyzeError?(
        <>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:"#ff5555",marginBottom:8}}>{L?"Error":"Erreur d'analyse"}</div>
          <div style={{fontSize:13,color:MUT,marginBottom:24}}>{L?"Check your connection.":"Vérifie ta connexion."}</div>
          <button onClick={()=>analyzeWithAI(answers)} style={{background:"linear-gradient(135deg,#5b21b6,#7c3aed)",color:"#fff",border:"none",borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>{L?"Retry":"Réessayer"}</button>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,fontSize:13,cursor:"pointer"}}>{L?"Home":"Accueil"}</button>
        </>
      ):(
        <>
          <div style={{position:"relative",width:140,height:140,marginBottom:32}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,#7c3aed33 0%,transparent 70%)",animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:10,borderRadius:"50%",background:"radial-gradient(circle,#c084fc22 0%,transparent 70%)",animation:"pulse 2s .5s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>🔮</div>
          </div>
          <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:10,color:"#c084fc"}}>{L?"Reading your vibration...":"Lecture de ta vibration..."}</div>
          <div style={{color:MUT,fontSize:13,maxWidth:280,lineHeight:1.7}}>{L?"Analyzing your 5 answers...":"Analyse de tes 5 réponses en cours..."}</div>
          <div style={{display:"flex",gap:8,marginTop:28}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#c084fc",animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
          </div>
        </>
      )}
    </div>
  );

  // ════════════════════════════════════════════════
  // SCREEN : RÉSULTAT
  // ════════════════════════════════════════════════
  if(screen==="result"&&aiResult){
    const {niv,analyse,point_fort,conseil,alerte_mentale}=aiResult;
    if(!niv) return null;
    const mtc=MTC_DATA[niv.organe]||MTC_DATA["Cœur"];
    const ri=RANG_INFO[niv.rang]||RANG_INFO["BRONZE"];
    const tibbKey=["BRONZE","ARGENT"].includes(niv.rang)?"low":["OR"].includes(niv.rang)?"neutral":["PLATINE","DIAMANT"].includes(niv.rang)?"high":"elite";
    const nextNiv=NIVEAUX_VIBRATOIRES[NIVEAUX_VIBRATOIRES.findIndex(n=>n.id===niv.id)+1];

    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 22px 0",background:`radial-gradient(ellipse at 50% 0%,${niv.color}18 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Home":"Accueil"}</button>

          {/* Alerte santé mentale */}
          {alerte_mentale&&(
            <div style={{background:"#0a1f2e",border:"1.5px solid #60a5fa66",borderRadius:16,padding:"14px 16px",marginBottom:16,display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0}}>🫂</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#60a5fa",marginBottom:4}}>{L?"We notice you may need support":"On remarque que tu pourrais avoir besoin de soutien"}</div>
                <div style={{fontSize:12,color:"#6a9ab8",lineHeight:1.6,marginBottom:10}}>{L?"It's okay to not be okay. Talking helps.":"C'est correct de ne pas aller bien. Parler aide."}</div>
                <button onClick={openMentalHealth} style={{background:"#60a5fa20",border:"1px solid #60a5fa44",borderRadius:10,padding:"8px 14px",color:"#60a5fa",fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:700}}>
                  🫂 {L?"Get support →":"Obtenir du soutien →"}
                </button>
              </div>
            </div>
          )}

          {/* Badge + titre */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${ri.color}15`,border:`1px solid ${ri.color}44`,borderRadius:20,padding:"5px 14px",marginBottom:16}}>
            <span>{ri.icon}</span>
            <span style={{fontSize:11,fontWeight:700,color:ri.color,letterSpacing:1}}>{niv.rang} · NIV. {niv.niveau}</span>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div style={{flex:1}}>
              <div className="serif" style={{fontSize:38,fontWeight:700,color:niv.color,lineHeight:1}}>{L?niv.labelEn:niv.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
                <div style={{background:`${niv.color}10`,border:`1px solid ${niv.color}33`,borderRadius:20,padding:"4px 12px"}}><span style={{fontWeight:700,fontSize:16,color:niv.color}}>🔮 {niv.vibration} Hz</span></div>
                <div style={{background:`${GOLD}10`,borderRadius:20,padding:"4px 12px"}}><span style={{fontSize:11,color:GOLD,fontWeight:700}}>+{niv.xp} XP</span></div>
              </div>
            </div>
            <div style={{width:100,height:100,flexShrink:0}}>
              {!imgError[niv.perso]
                ?<img src={RPG_CHARS[niv.perso]} alt="" onError={()=>setImgError(e=>({...e,[niv.perso]:true}))} style={{width:"100%",height:"100%",objectFit:"contain",filter:`drop-shadow(0 0 18px ${niv.color}99)`}}/>
                :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{ri.icon}</div>}
            </div>
          </div>

          {/* Barre */}
          <div style={{marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:MUT,marginBottom:5}}><span>20 Hz</span><span>700 Hz</span></div>
            <div style={{background:"#142018",borderRadius:8,height:10,overflow:"hidden",position:"relative"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#ef4444,#fbbf24,#4ade80,#60a5fa,#c084fc)",opacity:.2,borderRadius:8}}/>
              <div style={{width:`${(niv.vibration/700)*100}%`,height:"100%",background:`linear-gradient(90deg,${niv.color}88,${niv.color})`,borderRadius:8,transition:"width 1.2s cubic-bezier(.16,1,.3,1)",position:"relative"}}>
                <div style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",width:14,height:14,borderRadius:"50%",background:niv.color,border:"2px solid #060d08",boxShadow:`0 0 8px ${niv.color}`}}/>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding:"0 20px"}}>
          {/* Analyse IA */}
          <div style={{background:"linear-gradient(135deg,#1a0030,#200035)",border:"1.5px solid #c084fc33",borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#5b21b6,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔮</div>
              <div style={{fontWeight:700,fontSize:13,color:"#c084fc"}}>{L?"AI Analysis":"Analyse IA"}</div>
            </div>
            <div style={{fontSize:13,color:"#d4b8f0",lineHeight:1.75,marginBottom:14}}>{analyse}</div>
            {point_fort&&<div style={{background:`${EM}08`,border:`1px solid ${EM}22`,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:10,color:EM,fontWeight:700,marginBottom:4}}>✅ {L?"STRENGTH":"POINT FORT"}</div>
              <div style={{fontSize:12,color:"#a0c8a8",lineHeight:1.6}}>{point_fort}</div>
            </div>}
            {conseil&&<div style={{background:`${GOLD}08`,border:`1px solid ${GOLD}22`,borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:4}}>💡 {L?"ACTION":"ACTION DU JOUR"}</div>
              <div style={{fontSize:12,color:"#c8a060",lineHeight:1.6}}>{conseil}</div>
            </div>}
          </div>

          {/* MTC */}
          <div style={{background:CARD,border:`1.5px solid ${mtc.color}33`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontSize:28}}>{mtc.emoji}</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:mtc.color}}>{L?`Affected organ: ${niv.organeEn}`:`Organe affecté : ${niv.organe}`}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{L?"Traditional Chinese Medicine":"Médecine Traditionnelle Chinoise"}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{L?"SYMPTOMS":"SYMPTÔMES"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {(L?mtc.symptomesEn:mtc.symptomes).map((s,i)=><span key={i} style={{background:`${mtc.color}10`,border:`1px solid ${mtc.color}33`,borderRadius:20,padding:"3px 10px",fontSize:11,color:mtc.color}}>{s}</span>)}
            </div>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{L?"HEALING FOODS":"ALIMENTS"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {(L?mtc.nutritionEn:mtc.nutrition).map((a,i)=><span key={i} style={{background:`${EM}10`,border:`1px solid ${EM}33`,borderRadius:20,padding:"3px 10px",fontSize:11,color:EM}}>🥗 {a}</span>)}
            </div>
          </div>

          {/* Breathwork CTA */}
          <button onClick={startBreathwork} style={{width:"100%",background:`linear-gradient(135deg,${niv.color}15,${niv.color}08)`,border:`1.5px solid ${niv.color}55`,borderRadius:18,padding:16,cursor:"pointer",marginBottom:12,fontFamily:"'Outfit',sans-serif",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>🌬️</div>
            <div style={{fontWeight:700,fontSize:15,color:niv.color}}>{mtc.breathwork}</div>
            <div style={{fontSize:12,color:MUT,marginTop:4}}>{L?"Guided breathwork to elevate vibration":"Respiration guidée pour élever ta vibration"}</div>
          </button>

          {/* Mental health CTA */}
          <button onClick={openMentalHealth} style={{width:"100%",background:"#0a1f2e10",border:"1.5px solid #60a5fa33",borderRadius:18,padding:14,cursor:"pointer",marginBottom:12,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>🫂</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#60a5fa"}}>{L?"Talk to someone":"Parler à quelqu'un"}</div>
              <div style={{fontSize:12,color:MUT}}>{L?"AI support + crisis lines":"Soutien IA + lignes d'écoute"}</div>
            </div>
          </button>

          {/* Tibb */}
          <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
            <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>{TIBB[tibbKey]}</div>
          </div>

          {/* Prochain niveau */}
          {nextNiv&&<div style={{background:CARD,border:`1px solid ${EM}22`,borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:10,color:EM,fontWeight:700,letterSpacing:.8,marginBottom:10}}>⬆ {L?"NEXT LEVEL":"NIVEAU SUIVANT"}</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:`${nextNiv.color}15`,border:`1.5px solid ${nextNiv.color}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:nextNiv.color}}/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:nextNiv.color}}>{L?nextNiv.labelEn:nextNiv.label} — {nextNiv.vibration} Hz</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>+{nextNiv.vibration-niv.vibration} Hz · {nextNiv.rang}</div>
              </div>
            </div>
          </div>}

          <div style={{display:"flex",gap:10}}>
            <button onClick={resetCheckin} style={{flex:1,background:CARD,border:"1px solid #c084fc33",borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:"#c084fc",cursor:"pointer",fontWeight:700}}>🔄 {L?"Redo":"Refaire"}</button>
            <button onClick={()=>setScreen("history")} style={{flex:1,background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>📈 {L?"History":"Historique"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SCREEN : BREATHWORK
  // ════════════════════════════════════════════════
  if(screen==="breathwork"&&aiResult?.niv){
    const niv=aiResult.niv;
    const mtc=MTC_DATA[niv.organe]||MTC_DATA["Cœur"];
    const bw=BREATHWORK[mtc.breathwork]||BREATHWORK["Cohérence cardiaque"];
    const steps=L?bw.stepsEn:bw.steps;
    return(
      <div style={{minHeight:"100vh",paddingBottom:60,background:"#060d08",textAlign:"center"}}>
        <div style={{padding:"52px 24px 0"}}>
          <button onClick={()=>{clearInterval(breathTimerRef.current);clearInterval(breathProgressRef.current);setScreen("result");}} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:28,display:"block",textAlign:"left"}}>← {L?"Back":"Retour"}</button>
          <div style={{fontSize:12,color:niv.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>🌬️ {mtc.breathwork.toUpperCase()}</div>
          <div style={{color:MUT,fontSize:12,marginBottom:40}}>{L?"Breathe with the circle.":"Respire avec le cercle."}</div>
          <div style={{position:"relative",width:200,height:200,margin:"0 auto 36px"}}>
            <div style={{position:"absolute",inset:-16,borderRadius:"50%",background:`${niv.color}06`,animation:breathActive?"glow 3s ease-in-out infinite":"none"}}/>
            <svg width="200" height="200" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
              <circle cx="100" cy="100" r="88" fill="none" stroke={`${niv.color}22`} strokeWidth="4"/>
              <circle cx="100" cy="100" r="88" fill="none" stroke={niv.color} strokeWidth="4"
                strokeDasharray={`${2*Math.PI*88}`} strokeDashoffset={`${2*Math.PI*88*(1-breathProgress/100)}`}
                strokeLinecap="round" style={{transition:"stroke-dashoffset .1s linear"}}/>
            </svg>
            <div style={{position:"absolute",inset:18,borderRadius:"50%",background:`${niv.color}10`,border:`1.5px solid ${niv.color}33`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 12px"}}>
              {breathDone
                ?<><div style={{fontSize:36}}>✨</div><div style={{fontSize:13,fontWeight:700,color:niv.color,marginTop:4}}>{L?"Done!":"Terminé !"}</div></>
                :<><div className="serif" style={{fontSize:14,fontWeight:700,color:niv.color,lineHeight:1.4}}>{steps[breathStep]||steps[0]}</div>{bw.cycles>0&&<div style={{fontSize:11,color:MUT,marginTop:6}}>{breathCount}/{bw.cycles}</div>}</>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:36}}>
            {steps.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i===breathStep?niv.color:`${niv.color}22`,transition:"background .3s"}}/>)}
          </div>
          {breathDone
            ?<><div style={{fontSize:17,fontWeight:700,color:EM,marginBottom:8}}>{L?"Well done! 🌿":"Bien joué ! 🌿"}</div><button onClick={()=>setScreen("result")} style={{width:"85%",background:`linear-gradient(135deg,${niv.color},${niv.color}bb)`,color:"#060d08",border:"none",borderRadius:14,padding:16,fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer"}}>{L?"See results →":"Voir résultats →"}</button></>
            :<button onClick={()=>{clearInterval(breathTimerRef.current);clearInterval(breathProgressRef.current);setScreen("result");}} style={{background:"none",border:`1px solid ${BDR}`,borderRadius:12,padding:"12px 24px",fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>{L?"Stop":"Arrêter"}</button>}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SCREEN : SANTÉ MENTALE
  // ════════════════════════════════════════════════
  if(screen==="mental_health") {
    const ressources = L ? RESSOURCES_EN : RESSOURCES_FR;
    return(
      <div style={{minHeight:"100vh",paddingBottom:80,background:"#060d08",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"52px 22px 20px",background:"radial-gradient(ellipse at 50% 0%,#0a1f2e 0%,#060d08 65%)",flexShrink:0}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#60a5fa15",border:"1px solid #60a5fa33",borderRadius:20,padding:"5px 14px",marginBottom:12}}>
            <span style={{fontSize:14}}>🫂</span>
            <span style={{fontSize:11,fontWeight:700,color:"#60a5fa",letterSpacing:1}}>{L?"MENTAL HEALTH":"SANTÉ MENTALE"}</span>
          </div>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:"#edf5ef",marginBottom:6}}>{L?"You're not alone":"Tu n'es pas seul(e)"}</div>
          <div style={{fontSize:13,color:MUT,lineHeight:1.6}}>{L?"Talk to our AI or contact a crisis line. Everything here is confidential.":"Parle à notre IA ou contacte une ligne d'écoute. Tout ici est confidentiel."}</div>
        </div>

        {/* Lignes d'urgence */}
        <div style={{padding:"0 20px",flexShrink:0}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10,marginTop:4}}>{L?"CRISIS LINES":"LIGNES D'ÉCOUTE"}</div>
          {ressources.map((r,i)=>(
            <div key={i} style={{background:CARD,border:`1.5px solid ${r.couleur}33`,borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${r.couleur}15`,border:`1px solid ${r.couleur}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,color:r.couleur}}>{r.nom}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{r.desc}</div>
                <div style={{fontSize:12,color:"#edf5ef",marginTop:4,fontWeight:600}}>{r.tel}</div>
              </div>
              {r.urgence&&<div style={{background:"#ff555520",border:"1px solid #ff555544",borderRadius:20,padding:"2px 8px",fontSize:9,color:"#ff5555",fontWeight:700,flexShrink:0}}>URGENT</div>}
            </div>
          ))}
        </div>

        {/* Chat IA soutien */}
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 20px",minHeight:0}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>{L?"AI SUPPORT CHAT":"CHAT SOUTIEN IA"}</div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:14,marginBottom:12,minHeight:200,maxHeight:320}}>
            {mentalMessages.map((msg,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:14,justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                {msg.role==="assistant"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1a4a6e,#0d2a3a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,alignSelf:"flex-end"}}>🫂</div>}
                <div style={{maxWidth:"80%",background:msg.role==="user"?"#0c2010":"#0d1f2e",border:msg.role==="user"?`1px solid ${EM}22`:"1px solid #60a5fa22",borderRadius:msg.role==="user"?"18px 4px 18px 18px":"4px 18px 18px 18px",padding:"10px 14px"}}>
                  <div style={{fontSize:13,color:msg.role==="user"?"#a0c8a8":"#a8c8e8",lineHeight:1.65}}>{msg.text}</div>
                </div>
              </div>
            ))}
            {mentalLoading&&(
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1a4a6e,#0d2a3a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🫂</div>
                <div style={{background:"#0d1f2e",border:"1px solid #60a5fa22",borderRadius:"4px 18px 18px 18px",padding:"12px 16px",display:"flex",gap:6,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#60a5fa",animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Input chat */}
          <div style={{display:"flex",gap:10,flexShrink:0}}>
            <input value={mentalInput} onChange={e=>setMentalInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&mentalInput.trim())sendMentalMessage();}}
              placeholder={L?"Write how you feel...":"Écris ce que tu ressens..."}
              style={{flex:1,background:"#0c1810",border:"1.5px solid #60a5fa44",borderRadius:14,padding:"12px 16px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#edf5ef",outline:"none"}}
              onFocus={e=>e.target.style.borderColor="#60a5fa"}
              onBlur={e=>e.target.style.borderColor="#60a5fa44"}/>
            <button onClick={sendMentalMessage} disabled={!mentalInput.trim()||mentalLoading}
              style={{width:48,height:48,borderRadius:14,background:mentalInput.trim()?"linear-gradient(135deg,#1a4a6e,#0d5a8e)":"#142018",border:"none",cursor:mentalInput.trim()?"pointer":"not-allowed",fontSize:20,flexShrink:0}}>
              {mentalLoading?"⏳":"→"}
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{textAlign:"center",fontSize:10,color:MUT,marginTop:10,lineHeight:1.5,flexShrink:0}}>
            {L?"This AI is not a therapist. If you're in crisis, please call a crisis line above.":"Cette IA n'est pas une thérapeute. Si tu es en crise, appelle l'une des lignes ci-dessus."}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SCREEN : HISTORIQUE
  // ════════════════════════════════════════════════
  if(screen==="history"){
    const last14=[...Array(14)].map((_,i)=>{
      const d=new Date();d.setDate(d.getDate()-(13-i));
      const key=d.toISOString().slice(0,10);
      const entry=log.find(e=>e.date===key);
      return{date:key,vibration:entry?.vibration||null,dayLabel:d.getDate()};
    });
    const chartH=100,chartW=320;
    const pts=last14.map((d,i)=>d.vibration?`${(i/13)*chartW},${chartH-(d.vibration/700)*chartH}`:null).filter(Boolean);
    const avgVib=log.length>0?Math.round(log.slice(0,14).reduce((s,e)=>s+(e.vibration||0),0)/Math.min(14,log.length)):0;
    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 22px 20px"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>← {L?"Back":"Retour"}</button>
          <div className="serif" style={{fontSize:26,fontWeight:700,marginBottom:4}}>📈 {L?"Vibration history":"Historique vibratoire"}</div>
          <div style={{color:MUT,fontSize:13}}>{L?"14-day evolution":"Évolution 14 jours"}</div>
        </div>
        <div style={{padding:"0 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{background:"#3a005015",border:"1px solid #c084fc33",borderRadius:14,padding:14,textAlign:"center"}}>
              <div className="serif" style={{fontSize:28,fontWeight:700,color:"#c084fc"}}>{avgVib}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>Hz {L?"avg":"moy"}</div>
            </div>
            <div style={{background:"#f9731608",border:"1px solid #f9731633",borderRadius:14,padding:14,textAlign:"center"}}>
              <div className="serif" style={{fontSize:28,fontWeight:700,color:"#f97316"}}>{streak}🔥</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{L?"Streak":"Streak"}</div>
            </div>
          </div>
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:16}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:12}}>{L?"CURVE":"COURBE"}</div>
            <svg width={chartW} height={chartH+20} style={{display:"block",margin:"0 auto",overflow:"visible"}}>
              {pts.length>1&&<path d={`M${pts[0]} ${pts.slice(1).map(p=>`L${p}`).join(" ")} L${(last14.length-1)/13*chartW},${chartH} L0,${chartH} Z`} fill="#c084fc14"/>}
              {pts.length>1&&<polyline points={pts.join(" ")} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinejoin="round"/>}
              {last14.map((d,i)=>d.vibration&&<circle key={i} cx={(i/13)*chartW} cy={chartH-(d.vibration/700)*chartH} r="4" fill="#c084fc" stroke="#060d08" strokeWidth="2"/>)}
              {last14.map((d,i)=>(i%3===0||i===13)&&<text key={i} x={(i/13)*chartW} y={chartH+15} textAnchor="middle" fontSize="9" fill="#4a6e52">{d.dayLabel}</text>)}
            </svg>
          </div>
          {log.length===0
            ?<div style={{textAlign:"center",padding:40,color:MUT}}><div style={{fontSize:40,marginBottom:10}}>🔮</div><div>{L?"No check-in yet.":"Aucun check-in encore."}</div></div>
            :log.map((entry,i)=>{
              const niv=NIVEAUX_VIBRATOIRES.find(n=>n.id===entry.id);
              const ri=RANG_INFO[entry.rang]||RANG_INFO["BRONZE"];
              if(!niv) return null;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:`${niv.color}12`,border:`1.5px solid ${niv.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{ri.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:niv.color}}>{L?niv.labelEn:niv.label}</div>
                    <div style={{fontSize:11,color:MUT,marginTop:2}}>🔮 {niv.vibration} Hz · {entry.date}</div>
                    {entry.analyse&&<div style={{fontSize:10,color:"#4a3060",marginTop:3,lineHeight:1.4}}>{entry.analyse.slice(0,80)}...</div>}
                  </div>
                  <div style={{fontSize:10,background:`${ri.color}15`,color:ri.color,borderRadius:20,padding:"2px 8px",fontWeight:700,flexShrink:0}}>{entry.rang}</div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return null;
}

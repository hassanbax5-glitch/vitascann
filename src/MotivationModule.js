// ============================================================
// VITASCANN — MotivationModule.js v2
// ✨ Journal de Gratitude + Affirmations IA
// 🌙 Calendrier islamique sacré automatique
// 📿 Dou'as par catégorie + Tasbih digital
// 🤲 Dhikr quotidien + Mantras
// 🔔 Rappels jours sacrés (Arafah, jours blancs, vendredi...)
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;
const GOLD   = "#e2b84a";
const MUT    = "#4a6e52";
const CARD   = "#0c1810";
const BDR    = "#192c1d";
const EM     = "#00ff88";
const DANGER = "#ef4444";

// ── PROFILS ──
const PROFILS = {
  musulman:     { label:"Musulman",     emoji:"🌙", color:"#e2b84a", colorBg:"#1a1005" },
  entrepreneur: { label:"Entrepreneur", emoji:"💼", color:"#60a5fa", colorBg:"#05101a" },
  sportif:      { label:"Sportif",      emoji:"⚡", color:"#00ff88", colorBg:"#051a0a" },
  etudiant:     { label:"Étudiant",     emoji:"📚", color:"#c084fc", colorBg:"#0d0520" },
};

// ── CALENDRIER ISLAMIQUE SACRÉ ──
// Basé sur les dates connues 2026 (Dhul Hijjah 1447)
const JOURS_SACRES = [
  { date:"2026-05-18", nom:"1 Dhul Hijjah",       emoji:"🌙", desc:"Début des 10 jours les plus bénis de l'année.",      couleur:"#e2b84a", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah" },
  { date:"2026-05-19", nom:"2 Dhul Hijjah",        emoji:"🌙", desc:"Les bonnes actions en ces jours valent plus qu'en tout autre moment.", couleur:"#e2b84a", dhikr:"Subhanallah wa bihamdihi 100x" },
  { date:"2026-05-20", nom:"3 Dhul Hijjah",        emoji:"🌙", desc:"Multiplie tes actes d'adoration — ils sont décuplés.", couleur:"#e2b84a", dhikr:"Astaghfirullah 100x" },
  { date:"2026-05-21", nom:"4 Dhul Hijjah",        emoji:"🌙", desc:"Jours sacrés de Dhul Hijjah — fais du bien aujourd'hui.", couleur:"#e2b84a", dhikr:"La hawla wala quwwata illa billah" },
  { date:"2026-05-22", nom:"5 Dhul Hijjah",        emoji:"🌙", desc:"Rappelle-toi d'Allah souvent — dhikr, sadaqa, istighfar.", couleur:"#e2b84a", dhikr:"Subhanallah 33x · Alhamdulillah 33x · Allahu Akbar 34x" },
  { date:"2026-05-23", nom:"6 Dhul Hijjah",        emoji:"🌙", desc:"Les pèlerins se préparent — accompagne-les dans tes dou'as.", couleur:"#e2b84a", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah" },
  { date:"2026-05-24", nom:"7 Dhul Hijjah",        emoji:"🌙", desc:"Jeûne recommandé en ces jours bénis.", couleur:"#e2b84a", dhikr:"La ilaha illa Anta subhanaka inni kuntu minaz-zalimin" },
  { date:"2026-05-25", nom:"8 Dhul Hijjah — Tarwiya", emoji:"🕋", desc:"Les pèlerins partent vers Mina. Accompagne-les dans tes prières.", couleur:"#f97316", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah wa Allahu Akbar wa lillahil hamd" },
  { date:"2026-05-26", nom:"9 Dhul Hijjah — ARAFAH ✨", emoji:"🌟", desc:"LE jour le plus béni de l'année ! Allah pardonne en ce jour. Jeûne aujourd'hui — efface 2 années de péchés. Fais beaucoup de dou'a !", couleur:"#00ff88", dhikr:"La ilaha illa Allah wahdahu la sharika lah, lahul mulk wa lahul hamd wa huwa ala kulli shay'in qadir" },
  { date:"2026-05-27", nom:"10 Dhul Hijjah — Aïd al-Adha 🎉", emoji:"🎊", desc:"Aïd Moubarak ! Jour de fête et de sacrifice. Eid Mubarak à toi et ta famille !", couleur:"#e2b84a", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah Allahu Akbar Allahu Akbar wa lillahil hamd" },
  { date:"2026-05-28", nom:"11 Dhul Hijjah — Tashriq",  emoji:"🌙", desc:"Jours de Tashriq — mange, bois et rappelle-toi d'Allah.", couleur:"#e2b84a", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah" },
  { date:"2026-05-29", nom:"12 Dhul Hijjah — Tashriq",  emoji:"🌙", desc:"Continue les takbirats de Tashriq après chaque prière.", couleur:"#e2b84a", dhikr:"Allahu Akbar Allahu Akbar La ilaha illa Allah" },
  { date:"2026-05-30", nom:"13 Dhul Hijjah — Jour Blanc", emoji:"⚪", desc:"Jour blanc (Ayyam al-Bid) — jeûne recommandé.", couleur:"#c4b5fd", dhikr:"Subhanallah wa bihamdihi Subhanallah al-Azim" },
  { date:"2026-05-31", nom:"14 Dhul Hijjah — Jour Blanc", emoji:"⚪", desc:"2ème jour blanc — jeûne recommandé ce mois-ci.", couleur:"#c4b5fd", dhikr:"Astaghfirullah al-Azim allazi la ilaha illa huwa al-hayyal qayyum wa atubu ilayh" },
  { date:"2026-06-01", nom:"15 Dhul Hijjah — Jour Blanc", emoji:"⚪", desc:"3ème jour blanc — comme jeûner tout le mois.", couleur:"#c4b5fd", dhikr:"La ilaha illa Allah wahdahu la sharika lah" },
];

// Jours vendredi récurrents
function isJumua(date) {
  return new Date(date).getDay() === 5;
}

function getJourSacre() {
  const today = new Date().toISOString().slice(0, 10);
  return JOURS_SACRES.find(j => j.date === today) || null;
}

// ── DOU'AS PAR CATÉGORIE ──
const DOUAS = {
  sante: {
    label: "Santé & Guérison",
    emoji: "🌿",
    color: "#00ff88",
    items: [
      {
        titre: "Dou'a de la maladie",
        arabe: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِهِ وَأَنْتَ الشَّافِي",
        phonetique: "Allahumma Rabb an-nas, adhhibil ba's, ishfihi wa anta ash-Shafi",
        traduction: "Ô Allah, Seigneur des hommes, enlève la souffrance, guéris-le/la, Tu es le Guérisseur.",
        source: "Bukhari & Muslim"
      },
      {
        titre: "Protection le matin",
        arabe: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
        phonetique: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wala fis-sama'i",
        traduction: "Au nom d'Allah, avec Son Nom, rien ne peut nuire ni sur terre ni dans le ciel.",
        source: "Abu Dawud · 3 fois le matin"
      },
      {
        titre: "Ruqya personnelle",
        arabe: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        phonetique: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
        traduction: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
        source: "Muslim · 3 fois le soir"
      },
    ]
  },
  confiance: {
    label: "Confiance & Force",
    emoji: "⚡",
    color: "#fbbf24",
    items: [
      {
        titre: "Dou'a de l'anxiété",
        arabe: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
        phonetique: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
        traduction: "Ô Allah, je cherche refuge en Toi contre l'anxiété et la tristesse.",
        source: "Bukhari"
      },
      {
        titre: "Dou'a de Yunus ﷺ",
        arabe: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        phonetique: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin",
        traduction: "Il n'y a de dieu que Toi, gloire à Toi, j'ai été vraiment du nombre des injustes.",
        source: "Coran 21:87 · Dou'a de détresse"
      },
      {
        titre: "Hasbunallah",
        arabe: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        phonetique: "Hasbunallahu wa ni'mal wakil",
        traduction: "Allah nous suffit, Il est le meilleur des garants.",
        source: "Coran 3:173 · Dou'a d'Ibrahim ﷺ dans le feu"
      },
    ]
  },
  gratitude: {
    label: "Gratitude & Sabr",
    emoji: "🙏",
    color: "#e2b84a",
    items: [
      {
        titre: "Alhamdulillah complet",
        arabe: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        phonetique: "Alhamdulillahil-ladhi bini'matihi tatimmus-salihat",
        traduction: "Louange à Allah par Whose grâce les bonnes choses s'accomplissent.",
        source: "Ibn Majah"
      },
      {
        titre: "Dou'a du matin — gratitude",
        arabe: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ",
        phonetique: "Allahumma ma asbaha bi min ni'matin fa minka wahdak",
        traduction: "Ô Allah, tout bienfait que je reçois ce matin ne vient que de Toi seul.",
        source: "Abu Dawud · Chaque matin"
      },
      {
        titre: "Patience et récompense",
        arabe: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
        phonetique: "Inna lillahi wa inna ilayhi raji'un",
        traduction: "Nous appartenons à Allah et c'est vers Lui que nous retournons.",
        source: "Coran 2:156 · En cas d'épreuve"
      },
    ]
  },
  protection: {
    label: "Protection & Famille",
    emoji: "🛡️",
    color: "#60a5fa",
    items: [
      {
        titre: "Ayat al-Kursi",
        arabe: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        phonetique: "Allahu la ilaha illa huwal-hayyul-qayyum...",
        traduction: "Allah, il n'y a de dieu que Lui, le Vivant, Celui qui subsiste par Lui-même.",
        source: "Coran 2:255 · La plus grande protection"
      },
      {
        titre: "Protection de la famille",
        arabe: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ",
        phonetique: "A'udhu bikalimatil-lahit-tammati min kulli shaytanin wa hammah",
        traduction: "Je cherche refuge dans les paroles parfaites d'Allah contre tout démon et toute bête nuisible.",
        source: "Bukhari · Pour les enfants"
      },
      {
        titre: "Dou'a pour les parents",
        arabe: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        phonetique: "Rabbi irhamhuma kama rabbayani saghira",
        traduction: "Seigneur, fais-leur miséricorde comme ils m'ont élevé tout petit.",
        source: "Coran 17:24"
      },
    ]
  },
  grossesse: {
    label: "Grossesse & Bébé",
    emoji: "🤰",
    color: "#f9a8d4",
    items: [
      {
        titre: "Dou'a pour l'enfant à naître",
        arabe: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً",
        phonetique: "Rabbi hab li min ladunka dhurriyyatan tayyibah",
        traduction: "Seigneur, accorde-moi de Ta part une descendance vertueuse.",
        source: "Coran 3:38 · Dou'a de Zakariya ﷺ"
      },
      {
        titre: "Protection du bébé",
        arabe: "أُعِيذُهَا بِكَ وَذُرِّيَّتَهَا مِنَ الشَّيْطَانِ الرَّجِيمِ",
        phonetique: "U'idhuhuma bika wa dhurriyyataha minash-shaytanir-rajim",
        traduction: "Je les confie à Ta protection contre Satan le maudit.",
        source: "Coran 3:36 · Dou'a de Maryam ﷺ"
      },
      {
        titre: "Dou'a pour un accouchement facile",
        arabe: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        phonetique: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin",
        traduction: "Dou'a de Yunus ﷺ — pour chaque difficulté. Répète 40x.",
        source: "Coran 21:87"
      },
    ]
  },
};

// ── DHIKR / TASBIH ──
const DHIKR_LIST = [
  { id:"subhanallah",    arabe:"سُبْحَانَ اللَّهِ",    phonetique:"Subhanallah",              traduction:"Gloire à Allah",                   cible:33,  color:"#00ff88" },
  { id:"alhamdulillah",  arabe:"الْحَمْدُ لِلَّهِ",    phonetique:"Alhamdulillah",            traduction:"Louange à Allah",                  cible:33,  color:"#e2b84a" },
  { id:"allahuakbar",    arabe:"اللَّهُ أَكْبَرُ",     phonetique:"Allahu Akbar",             traduction:"Allah est le Plus Grand",           cible:34,  color:"#f97316" },
  { id:"astaghfirullah", arabe:"أَسْتَغْفِرُ اللَّهَ", phonetique:"Astaghfirullah",           traduction:"Je demande pardon à Allah",         cible:100, color:"#c084fc" },
  { id:"lailaha",        arabe:"لَا إِلَهَ إِلَّا اللَّهُ", phonetique:"La ilaha illa Allah", traduction:"Il n'y a de dieu qu'Allah",        cible:100, color:"#60a5fa" },
  { id:"salawat",        arabe:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", phonetique:"Allahumma salli 'ala Muhammad", traduction:"Ô Allah, bénis Muhammad ﷺ", cible:100, color:"#f9a8d4" },
];

// ── AFFIRMATIONS FALLBACK ──
const AFFIRMATIONS_BASE = {
  musulman:     ["Allah est avec ceux qui persévèrent. Chaque effort est une ibadah. 🌙","Tawakkul — fais confiance à Allah après avoir fait de ton mieux.","La gratitude multiplie les bienfaits. Compte tes bénédictions aujourd'hui."],
  entrepreneur: ["Chaque jour sans action est une opportunité perdue. Qu'est-ce que tu construis aujourd'hui ?","Discipline = Liberté. Chaque sacrifice est un investissement dans ton futur.","Pense grand, commence petit, avance vite."],
  sportif:      ["Ton corps est capable de bien plus que ton esprit ne le croit.","La douleur est temporaire. La fierté de l'accomplissement est permanente.","Chaque rep, chaque pas — tu construis la version la plus forte de toi-même."],
  etudiant:     ["Chaque page lue aujourd'hui est une victoire sur ta version d'hier.","La concentration est un muscle — entraîne-le chaque jour.","Tu n'es pas en compétition avec les autres. Tu l'es avec qui tu étais hier."],
};

function buildAffirmationPrompt(profil, lang) {
  const L = lang === "en";
  const today = new Date().toLocaleDateString(L?"en-US":"fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const jourSacre = getJourSacre();
  const contexteSacre = jourSacre ? `\nContexte islamique important: Aujourd'hui c'est ${jourSacre.nom} — ${jourSacre.desc}` : "";
  const profiles = { musulman:"Musulman cherchant force spirituelle et proximité avec Allah", entrepreneur:"Entrepreneur construisant son business", sportif:"Sportif focalisé sur la performance", etudiant:"Étudiant travaillant sur ses études" };
  return L
    ? `You are VitaScann's motivation coach. Generate a powerful daily affirmation for ${today} for a ${profiles[profil] || profiles.musulman}.${contexteSacre}\nReturn ONLY valid JSON: {"affirmation":"2-3 powerful sentences","citation":"inspiring quote","action":"1 micro-action today (max 15 words)","mot_cle":"1 power word"}`
    : `Tu es le coach motivation de VitaScann. Génère une affirmation pour aujourd'hui ${today} pour un profil : ${profiles[profil] || profiles.musulman}.${contexteSacre}\nRetourne UNIQUEMENT un JSON valide: {"affirmation":"2-3 phrases percutantes","citation":"citation inspirante","action":"1 micro-action (max 15 mots)","mot_cle":"1 mot-clé puissant"}`;
}

// ── STORAGE ──
function getToday() { return new Date().toISOString().slice(0,10); }
function getEntries() { try { return JSON.parse(localStorage.getItem("vs_motivation_v1")||"[]"); } catch { return []; } }
function saveEntries(e) { localStorage.setItem("vs_motivation_v1", JSON.stringify(e.slice(0,60))); }
function getTasbihCounts() { try { return JSON.parse(localStorage.getItem("vs_tasbih_v1")||"{}"); } catch { return {}; } }
function saveTasbihCounts(c) { localStorage.setItem("vs_tasbih_v1", JSON.stringify(c)); }
function canUseAI(isPrem) { if(isPrem) return true; try { const d=JSON.parse(localStorage.getItem("vs_usage_affirmations_ia")||"{}"); const m=`${new Date().getFullYear()}-${new Date().getMonth()+1}`; return (d[m]||0)<3; } catch { return true; } }
function incrementAI() { try { const k="vs_usage_affirmations_ia"; const d=JSON.parse(localStorage.getItem(k)||"{}"); const m=`${new Date().getFullYear()}-${new Date().getMonth()+1}`; d[m]=(d[m]||0)+1; localStorage.setItem(k,JSON.stringify(d)); } catch {} }

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function MotivationModule({ user, profile, onBack, onCoinsEarned, lang }) {
  const L = lang === "en";
  const profil = profile?.objectif || "musulman";
  const P = PROFILS[profil] || PROFILS.musulman;
  const isPrem = user?.plan==="premium"||user?.isDemo;
  const jourSacre = getJourSacre();
  const isVendredi = new Date().getDay() === 5;

  const [tab, setTab]                 = useState("accueil");
  const [affirmation, setAffirmation] = useState(null);
  const [loadingAff, setLoadingAff]   = useState(false);
  const [douaTab, setDouaTab]         = useState("sante");
  const [selectedDoua, setSelectedDoua] = useState(null);
  const [tasbihId, setTasbihId]       = useState("subhanallah");
  const [tasbihCounts, setTasbihCounts] = useState(getTasbihCounts);
  const [vibrating, setVibrating]     = useState(false);
  const [merci1,setMerci1]            = useState("");
  const [merci2,setMerci2]            = useState("");
  const [merci3,setMerci3]            = useState("");
  const [intention,setIntention]      = useState("");
  const [humeur,setHumeur]            = useState(null);
  const [saved,setSaved]              = useState(false);
  const [entries,setEntries]          = useState(getEntries);
  const todayEntry = entries.find(e=>e.date===getToday());
  const streak = (() => { let s=0,d=new Date(); for(let i=0;i<60;i++){ if(entries.find(e=>e.date===d.toISOString().slice(0,10))){s++;d.setDate(d.getDate()-1);}else break; } return s; })();

  const activeTasbih = DHIKR_LIST.find(d=>d.id===tasbihId) || DHIKR_LIST[0];
  const todayKey = getToday();
  const currentCount = tasbihCounts[`${todayKey}_${tasbihId}`] || 0;

  const incrementTasbih = () => {
    if(window.navigator?.vibrate) window.navigator.vibrate(30);
    setVibrating(true); setTimeout(()=>setVibrating(false),150);
    const key = `${todayKey}_${tasbihId}`;
    const nc = {...tasbihCounts, [key]:(tasbihCounts[key]||0)+1};
    setTasbihCounts(nc); saveTasbihCounts(nc);
    if((tasbihCounts[key]||0)+1 === activeTasbih.cible && onCoinsEarned) onCoinsEarned(3);
  };

  const resetTasbih = () => {
    const key = `${todayKey}_${tasbihId}`;
    const nc = {...tasbihCounts, [key]:0};
    setTasbihCounts(nc); saveTasbihCounts(nc);
  };

  const loadAffirmation = useCallback(async () => {
    if(!canUseAI(isPrem)){
      const arr = AFFIRMATIONS_BASE[profil]||AFFIRMATIONS_BASE.musulman;
      setAffirmation({affirmation:arr[Math.floor(Math.random()*arr.length)], citation:"✨ Passe Premium pour des affirmations IA illimitées.", action:"", mot_cle:"GRATITUDE"});
      return;
    }
    if(!isPrem) incrementAI();
    setLoadingAff(true);
    try {
      const system = buildAffirmationPrompt(profil, lang);
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:500,system,messages:[{role:"user",content:"Génère l'affirmation."}]})});
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      setAffirmation(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch {
      const arr = AFFIRMATIONS_BASE[profil]||AFFIRMATIONS_BASE.musulman;
      setAffirmation({affirmation:arr[Math.floor(Math.random()*arr.length)], citation:"", action:"", mot_cle:""});
    } finally { setLoadingAff(false); }
  }, [profil, lang, isPrem]);

  useEffect(()=>{ if(tab==="accueil"&&!affirmation) loadAffirmation(); },[tab]);

  const saveJournal = () => {
    if(!merci1&&!merci2&&!merci3&&!intention) return;
    const entry={date:getToday(),profil,humeur,merci:[merci1,merci2,merci3].filter(Boolean),intention,affirmation:affirmation?.affirmation||""};
    const ex=entries.find(e=>e.date===getToday());
    const nl=ex?entries.map(e=>e.date===getToday()?entry:e):[entry,...entries];
    setEntries(nl); saveEntries(nl);
    if(!ex&&onCoinsEarned) onCoinsEarned(10);
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const HUMEURS = ["😞","😕","😐","🙂","😄"];
  const prog = Math.min(100, Math.round((currentCount/activeTasbih.cible)*100));

  const TABS = [
    {id:"accueil",   emoji:"✨", label:"Accueil"},
    {id:"islamique", emoji:"🌙", label:"Islam"},
    {id:"douas",     emoji:"🤲", label:"Dou'as"},
    {id:"tasbih",    emoji:"📿", label:"Tasbih"},
    {id:"journal",   emoji:"📝", label:"Journal"},
  ];

  return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>

      {/* HEADER */}
      <div style={{padding:"52px 20px 16px",background:`radial-gradient(ellipse at 50% 0%,${P.color}15 0%,#060d08 65%)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:12,display:"block"}}>← {L?"Back":"Retour"}</button>

        {/* Bannière jour sacré */}
        {(jourSacre||isVendredi)&&(
          <div style={{background:jourSacre?`${jourSacre.couleur}15`:"#1a0510",border:`1.5px solid ${jourSacre?jourSacre.couleur:"#f9a8d4"}55`,borderRadius:16,padding:"12px 14px",marginBottom:14,cursor:"pointer"}} onClick={()=>setTab("islamique")}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:28}}>{jourSacre?jourSacre.emoji:"🕌"}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:jourSacre?jourSacre.couleur:"#f9a8d4"}}>{jourSacre?jourSacre.nom:"Aujourd'hui c'est Vendredi 🕌"}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2,lineHeight:1.5}}>{jourSacre?jourSacre.desc.slice(0,80)+"...":"Lis Sourate Al-Kahf · Fais beaucoup de Salawat sur le Prophète ﷺ"}</div>
              </div>
              <div style={{fontSize:11,color:jourSacre?jourSacre.couleur:"#f9a8d4",fontWeight:700}}>Voir →</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {val:streak>0?`${streak}🔥`:"0",label:"Streak",color:GOLD},
            {val:entries.length,label:"Entrées",color:"#06b6d4"},
            {val:todayEntry?"✅":"—",label:"Aujourd'hui",color:todayEntry?EM:MUT},
          ].map(({val,label,color},i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontWeight:700,fontSize:18,color}}>{val}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?`${P.color}20`:CARD,border:`1.5px solid ${tab===t.id?P.color:BDR}`,borderRadius:14,padding:"8px 12px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",flexShrink:0,transition:"all .2s"}}>
              <div style={{fontSize:16,marginBottom:2}}>{t.emoji}</div>
              <div style={{fontSize:10,fontWeight:tab===t.id?700:400,color:tab===t.id?P.color:MUT,whiteSpace:"nowrap"}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px"}}>

        {/* ══ ACCUEIL ══ */}
        {tab==="accueil"&&(
          <>
            {loadingAff?(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:48,marginBottom:16}}>✨</div>
                <div className="serif" style={{fontSize:18,color:P.color,marginBottom:8}}>Génération de ton affirmation...</div>
                <div style={{display:"flex",gap:8,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:P.color,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}</div>
              </div>
            ):affirmation&&(
              <>
                {affirmation.mot_cle&&(
                  <div style={{textAlign:"center",padding:"20px 0 12px"}}>
                    <div style={{fontSize:10,color:MUT,fontWeight:700,letterSpacing:1,marginBottom:8}}>MOT-CLÉ DU JOUR</div>
                    <div className="serif" style={{fontSize:42,fontWeight:700,color:P.color,textTransform:"uppercase",letterSpacing:2}}>{affirmation.mot_cle}</div>
                  </div>
                )}
                <div style={{background:`linear-gradient(135deg,${P.colorBg},#060d08)`,border:`1.5px solid ${P.color}44`,borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:.04}}>{P.emoji}</div>
                  <div style={{fontSize:10,color:P.color,fontWeight:700,letterSpacing:1,marginBottom:12}}>✨ AFFIRMATION DU JOUR</div>
                  <div className="serif" style={{fontSize:17,lineHeight:1.75,color:"#edf5ef",marginBottom:16}}>{affirmation.affirmation}</div>
                  {affirmation.citation&&<div style={{borderTop:`1px solid ${P.color}22`,paddingTop:12,fontSize:13,color:P.color,fontStyle:"italic",lineHeight:1.6}}>"{affirmation.citation}"</div>}
                </div>
                {affirmation.action&&(
                  <div style={{background:CARD,border:`1px solid ${EM}22`,borderRadius:14,padding:14,marginBottom:14}}>
                    <div style={{fontSize:10,color:EM,fontWeight:700,marginBottom:6}}>⚡ MICRO-ACTION DU JOUR</div>
                    <div style={{fontSize:14,color:"#a0c8a8",lineHeight:1.6}}>{affirmation.action}</div>
                  </div>
                )}
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <button onClick={loadAffirmation} style={{flex:1,background:CARD,border:`1px solid ${P.color}33`,borderRadius:12,padding:12,fontFamily:"'Outfit',sans-serif",fontSize:13,color:P.color,cursor:"pointer",fontWeight:700}}>🔄 Nouvelle</button>
                  <button onClick={()=>setTab("journal")} style={{flex:1,background:`linear-gradient(135deg,${P.colorBg},#060d08)`,border:`1.5px solid ${P.color}55`,borderRadius:12,padding:12,fontFamily:"'Outfit',sans-serif",fontSize:13,color:P.color,cursor:"pointer",fontWeight:700}}>📝 Journal</button>
                  <button onClick={()=>setTab("tasbih")} style={{flex:1,background:"#1a1005",border:`1px solid ${GOLD}33`,borderRadius:12,padding:12,fontFamily:"'Outfit',sans-serif",fontSize:13,color:GOLD,cursor:"pointer",fontWeight:700}}>📿 Tasbih</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ ISLAMIQUE ══ */}
        {tab==="islamique"&&(
          <>
            <div style={{padding:"16px 0 12px"}}>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:"#edf5ef",marginBottom:4}}>Rappels Islamiques 🌙</div>
              <div style={{color:MUT,fontSize:13}}>Jours sacrés · Dhul Hijjah 1447</div>
            </div>

            {/* Vendredi */}
            {isVendredi&&(
              <div style={{background:"#1a0510",border:"1.5px solid #f9a8d455",borderRadius:18,padding:16,marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:14,color:"#f9a8d4",marginBottom:8}}>🕌 C'est Vendredi — Yawm al-Jum'a</div>
                {["Lis Sourate Al-Kahf (18) — protection jusqu'au vendredi prochain","Fais beaucoup de Salawat sur le Prophète ﷺ","La dou'a est exaucée le vendredi — profite-en","Prière du vendredi obligatoire pour les hommes"].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?6:0}}>
                    <span style={{color:"#f9a8d4",fontSize:12,flexShrink:0}}>→</span>
                    <span style={{fontSize:12,color:"#e0a0c0",lineHeight:1.5}}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Jours Dhul Hijjah */}
            {JOURS_SACRES.map((jour,i)=>{
              const isToday = jour.date === getToday();
              const isPast = jour.date < getToday();
              return(
                <div key={i} style={{background:isToday?`${jour.couleur}10`:CARD,border:`1.5px solid ${isToday?jour.couleur:isPast?"#1a2a1a":BDR}`,borderRadius:16,padding:"12px 14px",marginBottom:8,opacity:isPast?0.6:1,position:"relative",overflow:"hidden"}}>
                  {isToday&&<div style={{position:"absolute",top:0,right:0,background:jour.couleur,color:"#060d08",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:"0 0 0 10px"}}>AUJOURD'HUI</div>}
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{jour.emoji}</span>
                    <div style={{flex:1,paddingRight:isToday?50:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:isToday?jour.couleur:"#edf5ef",marginBottom:4}}>{jour.nom}</div>
                      <div style={{fontSize:12,color:MUT,lineHeight:1.5,marginBottom:isToday?8:0}}>{jour.desc}</div>
                      {isToday&&(
                        <div style={{background:`${jour.couleur}15`,borderRadius:10,padding:"8px 10px",border:`1px solid ${jour.couleur}30`}}>
                          <div style={{fontSize:10,color:jour.couleur,fontWeight:700,marginBottom:4}}>📿 DHIKR RECOMMANDÉ</div>
                          <div style={{fontSize:12,color:"#a0c8a8",lineHeight:1.6}}>{jour.dhikr}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ══ DOU'AS ══ */}
        {tab==="douas"&&(
          <>
            <div style={{padding:"16px 0 12px"}}>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:"#edf5ef",marginBottom:4}}>Dou'as & Invocations 🤲</div>
              <div style={{color:MUT,fontSize:13}}>Dou'as authentiques du Coran et de la Sunnah</div>
            </div>

            {selectedDoua?(
              <>
                <button onClick={()=>setSelectedDoua(null)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:14,display:"block"}}>← Retour</button>
                <div style={{background:"#1a1005",border:`1.5px solid ${GOLD}44`,borderRadius:20,padding:20,marginBottom:14}}>
                  <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:10}}>{selectedDoua.titre.toUpperCase()}</div>
                  <div style={{fontSize:24,color:GOLD,textAlign:"right",lineHeight:1.8,marginBottom:14,fontFamily:"serif"}}>{selectedDoua.arabe}</div>
                  <div style={{background:`${GOLD}10`,borderRadius:12,padding:"10px 12px",marginBottom:10}}>
                    <div style={{fontSize:12,color:GOLD,fontStyle:"italic",lineHeight:1.6}}>{selectedDoua.phonetique}</div>
                  </div>
                  <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.7,marginBottom:10}}>{selectedDoua.traduction}</div>
                  <div style={{fontSize:11,color:MUT,borderTop:`1px solid ${BDR}`,paddingTop:8}}>📖 Source : {selectedDoua.source}</div>
                </div>
                <button onClick={()=>setTab("tasbih")} style={{width:"100%",background:"#1a1005",border:`1px solid ${GOLD}33`,borderRadius:14,padding:12,fontFamily:"'Outfit',sans-serif",fontSize:13,color:GOLD,cursor:"pointer",fontWeight:700}}>📿 Aller au Tasbih</button>
              </>
            ):(
              <>
                {/* Catégories */}
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
                  {Object.entries(DOUAS).map(([key,cat])=>(
                    <button key={key} onClick={()=>setDouaTab(key)}
                      style={{background:douaTab===key?`${cat.color}20`:CARD,border:`1.5px solid ${douaTab===key?cat.color:BDR}`,borderRadius:14,padding:"8px 12px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>
                      <div style={{fontSize:16,marginBottom:2}}>{cat.emoji}</div>
                      <div style={{fontSize:10,fontWeight:douaTab===key?700:400,color:douaTab===key?cat.color:MUT,whiteSpace:"nowrap"}}>{cat.label}</div>
                    </button>
                  ))}
                </div>

                {DOUAS[douaTab]?.items.map((doua,i)=>(
                  <button key={i} onClick={()=>setSelectedDoua(doua)}
                    style={{width:"100%",background:CARD,border:`1px solid ${DOUAS[douaTab].color}22`,borderRadius:16,padding:"14px 16px",cursor:"pointer",textAlign:"left",marginBottom:10,fontFamily:"'Outfit',sans-serif"}}>
                    <div style={{fontWeight:700,fontSize:13,color:DOUAS[douaTab].color,marginBottom:6}}>{doua.titre}</div>
                    <div style={{fontSize:16,color:GOLD,textAlign:"right",lineHeight:1.7,marginBottom:8,fontFamily:"serif"}}>{doua.arabe}</div>
                    <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>{doua.traduction}</div>
                    <div style={{fontSize:10,color:MUT,marginTop:6}}>📖 {doua.source}</div>
                  </button>
                ))}
              </>
            )}
          </>
        )}

        {/* ══ TASBIH DIGITAL ══ */}
        {tab==="tasbih"&&(
          <>
            <div style={{padding:"16px 0 12px"}}>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:"#edf5ef",marginBottom:4}}>Tasbih Digital 📿</div>
              <div style={{color:MUT,fontSize:13}}>Appuie pour compter ton dhikr</div>
            </div>

            {/* Sélecteur dhikr */}
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
              {DHIKR_LIST.map(d=>(
                <button key={d.id} onClick={()=>setTasbihId(d.id)}
                  style={{background:tasbihId===d.id?`${d.color}20`:CARD,border:`1.5px solid ${tasbihId===d.id?d.color:BDR}`,borderRadius:14,padding:"8px 10px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:tasbihId===d.id?700:400,color:tasbihId===d.id?d.color:MUT,whiteSpace:"nowrap"}}>{d.phonetique}</div>
                </button>
              ))}
            </div>

            {/* Bouton principal */}
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:20,color:activeTasbih.color,fontFamily:"serif",marginBottom:6}}>{activeTasbih.arabe}</div>
              <div style={{fontSize:13,color:MUT,marginBottom:4}}>{activeTasbih.phonetique}</div>
              <div style={{fontSize:12,color:MUT,marginBottom:20}}>{activeTasbih.traduction}</div>

              {/* Cercle de progression */}
              <div style={{position:"relative",width:180,height:180,margin:"0 auto 20px"}}>
                <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="90" cy="90" r="80" fill="none" stroke={`${activeTasbih.color}20`} strokeWidth="12"/>
                  <circle cx="90" cy="90" r="80" fill="none" stroke={activeTasbih.color} strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*80}`}
                    strokeDashoffset={`${2*Math.PI*80*(1-prog/100)}`}
                    strokeLinecap="round" style={{transition:"stroke-dashoffset .3s ease"}}/>
                </svg>
                <button onClick={incrementTasbih}
                  style={{position:"absolute",inset:12,borderRadius:"50%",background:vibrating?`${activeTasbih.color}30`:`${activeTasbih.color}12`,border:`2px solid ${activeTasbih.color}44`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .1s",transform:vibrating?"scale(0.95)":"scale(1)"}}>
                  <div style={{fontSize:48,fontWeight:700,color:activeTasbih.color,lineHeight:1}}>{currentCount}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:4}}>/ {activeTasbih.cible}</div>
                </button>
              </div>

              {prog>=100&&(
                <div style={{background:`${activeTasbih.color}15`,border:`1.5px solid ${activeTasbih.color}44`,borderRadius:14,padding:12,marginBottom:14}}>
                  <div style={{fontWeight:700,color:activeTasbih.color,fontSize:14}}>🎉 Mashaa Allah ! {activeTasbih.cible}x accompli !</div>
                  <div style={{fontSize:12,color:MUT,marginTop:4}}>+3 VitaCoins gagnés 🪙</div>
                </div>
              )}

              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button onClick={resetTasbih} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:"10px 20px",fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>↩ Reset</button>
                <button onClick={incrementTasbih} style={{background:`${activeTasbih.color}15`,border:`1.5px solid ${activeTasbih.color}55`,borderRadius:12,padding:"10px 24px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:activeTasbih.color,cursor:"pointer",fontWeight:700}}>+1 Dhikr</button>
              </div>
            </div>

            {/* Dhikr du soir recommandé */}
            <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:10}}>🌙 DHIKR APRÈS PRIÈRE</div>
              {[["Subhanallah","33x"],["Alhamdulillah","33x"],["Allahu Akbar","34x — puis Ayat al-Kursi"]].map(([d,n],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<2?8:0,paddingBottom:i<2?8:0,borderBottom:i<2?`1px solid ${BDR}`:"none"}}>
                  <span style={{fontSize:13,color:"#a08040"}}>{d}</span>
                  <span style={{fontSize:12,color:GOLD,fontWeight:700}}>{n}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ JOURNAL ══ */}
        {tab==="journal"&&(
          <>
            <div style={{padding:"16px 0 8px"}}>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:"#edf5ef",marginBottom:4}}>Journal de Gratitude 📝</div>
              <div style={{color:MUT,fontSize:13}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>

            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:MUT,fontWeight:700,marginBottom:12}}>COMMENT TU TE SENS AUJOURD'HUI ?</div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                {HUMEURS.map((e,i)=>(
                  <button key={i} onClick={()=>setHumeur(i+1)} style={{fontSize:32,background:humeur===i+1?`${P.color}20`:"transparent",border:`1.5px solid ${humeur===i+1?P.color:"transparent"}`,borderRadius:12,padding:"6px 10px",cursor:"pointer"}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:P.color,fontWeight:700,marginBottom:12}}>🙏 3 CHOSES POUR LESQUELLES JE SUIS RECONNAISSANT(E)</div>
              {[{val:merci1,set:setMerci1,ph:"Je suis reconnaissant(e) pour..."},{val:merci2,set:setMerci2,ph:"J'apprécie..."},{val:merci3,set:setMerci3,ph:"Aujourd'hui j'ai remarqué..."}].map(({val,set,ph},i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<2?10:0}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:`${P.color}20`,border:`1px solid ${P.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:P.color,flexShrink:0,marginTop:10}}>{i+1}</div>
                  <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{flex:1,background:"#0a1510",border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 12px",fontFamily:"'Outfit',sans-serif",fontSize:13,color:"#edf5ef",resize:"none",height:60,outline:"none",lineHeight:1.5}}/>
                </div>
              ))}
            </div>

            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:EM,fontWeight:700,marginBottom:10}}>🎯 MON INTENTION D'AUJOURD'HUI</div>
              <textarea value={intention} onChange={e=>setIntention(e.target.value)} placeholder="Aujourd'hui j'ai l'intention de..." style={{width:"100%",background:"#0a1510",border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 12px",fontFamily:"'Outfit',sans-serif",fontSize:13,color:"#edf5ef",resize:"none",height:80,outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
            </div>

            {affirmation?.affirmation&&(
              <div style={{background:`${P.color}08`,border:`1px solid ${P.color}22`,borderRadius:14,padding:14,marginBottom:14}}>
                <div style={{fontSize:10,color:P.color,fontWeight:700,marginBottom:6}}>✨ AFFIRMATION DU JOUR</div>
                <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6,fontStyle:"italic"}}>"{affirmation.affirmation}"</div>
              </div>
            )}

            <button onClick={saveJournal}
              style={{width:"100%",background:saved?`${EM}15`:"linear-gradient(135deg,#1a3300,#264d00)",border:`1.5px solid ${saved?EM:EM+"55"}`,borderRadius:16,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:EM,cursor:"pointer",transition:"all .3s"}}>
              {saved?`✅ Sauvegardé ! +10 🪙`:`💾 Sauvegarder mon journal (+10 🪙)`}
            </button>

            {/* Historique rapide */}
            {entries.length>0&&(
              <div style={{marginTop:20}}>
                <div style={{fontSize:11,color:MUT,fontWeight:700,marginBottom:10}}>📖 HISTORIQUE RÉCENT</div>
                {entries.slice(0,5).map((entry,i)=>{
                  const pr=PROFILS[entry.profil]||PROFILS.musulman;
                  return(
                    <div key={i} style={{background:CARD,border:`1px solid ${pr.color}22`,borderRadius:14,padding:14,marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:12,color:pr.color,fontWeight:700}}>{new Date(entry.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}</div>
                        {entry.humeur&&<span style={{fontSize:16}}>{HUMEURS[entry.humeur-1]}</span>}
                      </div>
                      {entry.merci?.slice(0,2).map((m,j)=>(
                        <div key={j} style={{fontSize:12,color:"#a0c8a8",marginBottom:2}}>🙏 {m}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

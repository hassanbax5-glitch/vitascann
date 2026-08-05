// ============================================================
// VITASCANN — MindsetGuerrier.js
// 🗡️ Mode Mindset Guerrier
// ✅ 4 profils : Musulman, Entrepreneur, Sportif, Étudiant
// ✅ Message IA du matin personnalisé
// ✅ Défi quotidien unique par profil
// ✅ Système de niveaux : Recrue → Soldat → Guerrier → Commandant → Légende
// ✅ Streak, XP, progression visuelle
// ✅ Citations contextuelles + Tibb an-Nabawi
// ✅ Connexion Score Énergie + Santé Émotionnelle
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

// ─── STORAGE ───
const STORAGE_KEY = "vs_mindset_v1";
function getToday() { return new Date().toISOString().slice(0, 10); }
function getData()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

// ─── NIVEAUX GUERRIER ───
const NIVEAUX = [
  { id:"recrue",      label:"Recrue",      labelEn:"Recruit",     minJours:0,  color:"#cd7f32", icon:"🪖",  xpReq:0   },
  { id:"soldat",      label:"Soldat",      labelEn:"Soldier",     minJours:7,  color:"#c0c0c0", icon:"⚔️",  xpReq:70  },
  { id:"guerrier",    label:"Guerrier",    labelEn:"Warrior",     minJours:21, color:EM,        icon:"🗡️",  xpReq:210 },
  { id:"commandant",  label:"Commandant",  labelEn:"Commander",   minJours:60, color:GOLD,      icon:"🛡️",  xpReq:600 },
  { id:"legende",     label:"Légende",     labelEn:"Legend",      minJours:100,color:"#ffffff",  icon:"👑",  xpReq:1000},
];

function getNiveau(xp) {
  let n = NIVEAUX[0];
  for (const niv of NIVEAUX) { if (xp >= niv.xpReq) n = niv; }
  return n;
}
function getNextNiveau(xp) {
  return NIVEAUX.find(n => n.xpReq > xp) || null;
}

// ─── AVATARS selon profil et genre ───
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

// ─── 4 PROFILS MINDSET ───
const PROFILS = {
  musulman: {
    id: "musulman",
    emoji: "🕌",
    labelFR: "Musulman",
    labelEN: "Muslim",
    colorPrimary: "#fbbf24",
    colorSecondary: "#92400e",
    bg: "#1a1000",
    border: "#fbbf2444",
    descFR: "Discipline islamique · Wird · Akhira + Dunya",
    descEN: "Islamic discipline · Wird · Akhira + Dunya",
    piliersFR: ["Fajr à l'heure", "Wird / Dhikr", "Éviter le haram", "Donner de la valeur", "Grateful mindset"],
    piliersEN: ["Fajr on time", "Wird / Dhikr", "Avoid haram", "Give value", "Grateful mindset"],
    defis_fr: [
      "Lis 1 page du Coran après Fajr et note ce que tu as retenu",
      "Fais 100 Astaghfirullah avant midi",
      "Coupe les réseaux sociaux pendant 3h aujourd'hui",
      "Rends service à quelqu'un sans qu'il te le demande",
      "Fais tes 5 prières à l'heure exacte sans exception",
      "Jeûne aujourd'hui — Lundi ou Jeudi Sunna",
      "Récite Ayat Al-Kursi 3x après chaque prière",
      "Éteins ton écran 1h avant le coucher — remplace par du Dhikr",
      "Donne en sadaqa aujourd'hui, même 1$",
      "Appelle un proche que tu n'as pas contacté depuis longtemps",
      "Révise ta niya — pourquoi tu fais ce que tu fais aujourd'hui",
      "Fais une muraja'a de 3 sourates que tu connais",
      "Passe 10 minutes en tafakkur (réflexion sur la création d'Allah)",
      "Évite toute backbiting (ghibah) pendant toute la journée",
      "Commence chaque action par Bismillah consciemment",
    ],
    defis_en: [
      "Read 1 page of Quran after Fajr and note what you learned",
      "Say 100 Astaghfirullah before noon",
      "Cut social media for 3 hours today",
      "Do something kind for someone without being asked",
      "Pray all 5 prayers on time, no exceptions",
      "Fast today — Monday or Thursday Sunnah",
      "Recite Ayat Al-Kursi 3x after each prayer",
      "Turn off screens 1h before bed — replace with Dhikr",
      "Give sadaqa today, even $1",
      "Call someone you haven't spoken to in a while",
      "Review your niya — why are you doing what you're doing today",
      "Review 3 surahs you've memorized",
      "Spend 10 minutes in tafakkur (reflection on Allah's creation)",
      "Avoid all backbiting (ghibah) for the entire day",
      "Start every action with Bismillah consciously",
    ],
    citations_fr: [
      "\"Le plus fort n'est pas celui qui terrasse les autres, mais celui qui se maîtrise lui-même.\" — Prophète ﷺ",
      "\"La richesse n'est pas l'abondance des biens, mais la richesse de l'âme.\" — Prophète ﷺ",
      "\"Allah n'impose à aucune âme une charge supérieure à sa capacité.\" — Coran 2:286",
      "\"Après la difficulté vient le soulagement. Après la difficulté vient le soulagement.\" — Coran 94:5-6",
      "\"Attache ton chameau, puis fais confiance à Allah.\" — Prophète ﷺ",
      "\"Nul ne mange meilleur repas que celui qui mange de son propre travail.\" — Prophète ﷺ",
    ],
    citations_en: [
      "\"The strong person is not the one who wrestles others down, but the one who controls himself.\" — Prophet ﷺ",
      "\"Richness is not having many possessions, but richness is the richness of the soul.\" — Prophet ﷺ",
      "\"Allah does not burden a soul beyond that it can bear.\" — Quran 2:286",
      "\"With hardship comes ease. With hardship comes ease.\" — Quran 94:5-6",
      "\"Tie your camel, then put your trust in Allah.\" — Prophet ﷺ",
      "\"No one eats better food than that which he eats from his own work.\" — Prophet ﷺ",
    ],
  },
  entrepreneur: {
    id: "entrepreneur",
    emoji: "💼",
    labelFR: "Entrepreneur",
    labelEN: "Entrepreneur",
    colorPrimary: "#60a5fa",
    colorSecondary: "#1e3a5f",
    bg: "#0a1520",
    border: "#60a5fa44",
    descFR: "Focus · Productivité · Build · Wealth mindset",
    descEN: "Focus · Productivity · Build · Wealth mindset",
    piliersFR: ["1 action business/jour", "Deep work 2h+", "Apprendre quelque chose", "Réseau actif", "Vision long terme"],
    piliersEN: ["1 business action/day", "2h+ deep work", "Learn something new", "Active network", "Long-term vision"],
    defis_fr: [
      "Fais 1 action qui génère ou rapproche de revenus — pas de la planification, de l'action",
      "2h de deep work sans téléphone. Minuteur. Maintenant.",
      "Envoie 3 messages de valeur à 3 contacts différents",
      "Apprends une compétence pendant 30 minutes aujourd'hui",
      "Définis tes 3 priorités absolues pour la semaine — et supprime tout le reste",
      "Crée quelque chose aujourd'hui : post, vidéo, email, produit, solution",
      "Appelle ou DM quelqu'un que tu admires — pas pour demander, pour donner de la valeur",
      "Fais un audit de ton temps de cette semaine — où vas l'argent de tes heures ?",
      "Refuse quelque chose qui te volait du temps ou de l'énergie",
      "Lis 20 pages d'un livre business / biographie",
      "Documente un processus dans ton business — systématise",
      "Mets de côté 1% de tout ce que tu as gagné ce mois",
      "Identifie ton ennemi n°1 de productivité et bloque-le pour 24h",
      "Écris 3 idées de business ou d'amélioration — sans filtre",
      "Témoigne ou partage quelque chose de valeur publiquement aujourd'hui",
    ],
    defis_en: [
      "Do 1 action that generates or moves toward revenue — not planning, action",
      "2h deep work, no phone. Timer. Now.",
      "Send 3 value messages to 3 different contacts",
      "Learn a skill for 30 minutes today",
      "Define your 3 absolute priorities for the week — delete everything else",
      "Create something today: post, video, email, product, solution",
      "Call or DM someone you admire — not to ask, but to give value",
      "Audit your time this week — where does your hour-money go?",
      "Refuse something that was stealing your time or energy",
      "Read 20 pages of a business book / biography",
      "Document a process in your business — systematize",
      "Set aside 1% of everything you earned this month",
      "Identify your #1 productivity enemy and block it for 24h",
      "Write 3 business ideas or improvements — without filtering",
      "Testify or share something valuable publicly today",
    ],
    citations_fr: [
      "\"Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.\" — Churchill",
      "\"Ne cherche pas l'approbation. Construis quelque chose qui parle pour toi.\"",
      "\"Ton réseau est ton patrimoine. Invest dedans chaque jour.\"",
      "\"L'action batte la perfection à chaque fois. Ship it.\"",
      "\"Les gens ordinaires pensent à éviter les pertes. Les gagnants pensent à créer des gains.\"",
      "\"Le temps est la seule chose que tu ne peux pas récupérer. Dépense-le intentionnellement.\"",
    ],
    citations_en: [
      "\"Success is going from failure to failure without losing your enthusiasm.\" — Churchill",
      "\"Don't seek approval. Build something that speaks for itself.\"",
      "\"Your network is your net worth. Invest in it daily.\"",
      "\"Action beats perfection every time. Ship it.\"",
      "\"Ordinary people think about avoiding losses. Winners think about creating gains.\"",
      "\"Time is the only thing you can't recover. Spend it intentionally.\"",
    ],
  },
  sportif: {
    id: "sportif",
    emoji: "🏋️",
    labelFR: "Sportif",
    labelEN: "Athlete",
    colorPrimary: EM,
    colorSecondary: "#064020",
    bg: "#061008",
    border: "#00ff8844",
    descFR: "Performance · Récupération · Nutrition · Résultats",
    descEN: "Performance · Recovery · Nutrition · Results",
    piliersFR: ["S'entraîner dur", "Manger pour performer", "Récupération active", "Mindset compétiteur", "Progresser chaque semaine"],
    piliersEN: ["Train hard", "Eat to perform", "Active recovery", "Competitor mindset", "Progress every week"],
    defis_fr: [
      "Fais ta séance même si tu n'as pas envie — surtout si tu n'as pas envie",
      "Mange tes protéines : calcule et atteins ton objectif aujourd'hui",
      "Dors avant 22h30 — la récupération se passe la nuit",
      "Fais 10 minutes d'étirements ou mobilité avant de te coucher",
      "Bois 2.5L d'eau minimum aujourd'hui — tracke-le",
      "Ajoute 2.5kg ou 1 rep sur ton exercice principal aujourd'hui",
      "Enregistre ta séance en vidéo et analyse ta technique",
      "Mange un repas 100% propre aujourd'hui — zéro junk",
      "Fais 20 minutes de cardio en zone 2 (conversation possible)",
      "Prépare tes repas pour demain ce soir",
      "Évite l'alcool et les aliments inflammatoires pendant 48h",
      "Teste un exercice que tu n'as jamais fait",
      "Lis ou regarde quelque chose sur la nutrition sportive aujourd'hui",
      "Fais une séance de récupération active : marche, natation légère, yoga",
      "Définis ton objectif physique pour dans 90 jours — écris-le",
    ],
    defis_en: [
      "Do your session even if you don't feel like it — especially if you don't",
      "Hit your protein goal today — calculate and track it",
      "Sleep before 10:30pm — recovery happens at night",
      "Do 10 minutes of stretching or mobility before bed",
      "Drink 2.5L of water minimum today — track it",
      "Add 2.5kg or 1 rep to your main exercise today",
      "Record your session on video and analyze your technique",
      "Eat one 100% clean meal today — zero junk",
      "Do 20 minutes of zone 2 cardio (conversational pace)",
      "Prep your meals for tomorrow tonight",
      "Avoid alcohol and inflammatory foods for 48h",
      "Try an exercise you've never done before",
      "Read or watch something about sports nutrition today",
      "Do an active recovery session: walk, light swim, yoga",
      "Define your physical goal for 90 days from now — write it down",
    ],
    citations_fr: [
      "\"Le corps accomplit ce que l'esprit croit.\" — Napoleon Hill",
      "\"La douleur est temporaire. Abandonner dure toujours.\"",
      "\"Chaque rep te rapproche de la version que tu veux être.\"",
      "\"Ton corps peut faire n'importe quoi. C'est ton cerveau que tu dois convaincre.\"",
      "\"Les champions s'entraînent quand ils n'en ont pas envie. C'est pour ça qu'ils sont champions.\"",
      "\"Le muscle ne se construit pas en salle. Il se reconstruit pendant que tu dors.\"",
    ],
    citations_en: [
      "\"The body achieves what the mind believes.\" — Napoleon Hill",
      "\"Pain is temporary. Quitting lasts forever.\"",
      "\"Every rep brings you closer to the version you want to be.\"",
      "\"Your body can do anything. It's your brain you need to convince.\"",
      "\"Champions train when they don't feel like it. That's why they're champions.\"",
      "\"Muscle isn't built in the gym. It's rebuilt while you sleep.\"",
    ],
  },
  etudiant: {
    id: "etudiant",
    emoji: "📚",
    labelFR: "Étudiant",
    labelEN: "Student",
    colorPrimary: "#c084fc",
    colorSecondary: "#2d1060",
    bg: "#0d0520",
    border: "#c084fc44",
    descFR: "Concentration · Mémoire · Discipline · Excellence",
    descEN: "Focus · Memory · Discipline · Excellence",
    piliersFR: ["Réviser chaque jour", "Comprendre, pas mémoriser", "Éliminer les distractions", "Santé = performance", "Vision long terme"],
    piliersEN: ["Study every day", "Understand, don't memorize", "Eliminate distractions", "Health = performance", "Long-term vision"],
    defis_fr: [
      "2h de révisions en Pomodoro — 25min focus, 5min pause, répéter",
      "Éteins ton téléphone pendant tes révisions — entier",
      "Explique à voix haute ce que tu as appris aujourd'hui à quelqu'un (ou à toi-même)",
      "Fais des fiches sur le chapitre le plus difficile de ta semaine",
      "Dors 8h ce soir — le sommeil consolide la mémoire",
      "Commence à réviser l'exam le plus éloigné — c'est là que les bons gagnent",
      "Mange un repas nutritif avant tes révisions — pas de junk",
      "Fais une session de révision en marchant dehors",
      "Crée un mind map du cours le plus important du mois",
      "Pose une question à ton prof / tuteur aujourd'hui",
      "Identifie tes 3 lacunes principales et consacre-leur 30min chacune",
      "Lis 10 pages d'un livre qui t'inspire hors cours",
      "Désactive toutes les notifs pendant 3h — test le vrai focus",
      "Note 5 choses que tu as apprises cette semaine — ancre-les",
      "Organise ton espace de travail : cerveau propre = bureau propre",
    ],
    defis_en: [
      "2h study session in Pomodoro — 25min focus, 5min break, repeat",
      "Turn your phone completely off during study sessions",
      "Explain out loud what you learned today to someone (or yourself)",
      "Make flashcards on the hardest chapter of your week",
      "Sleep 8 hours tonight — sleep consolidates memory",
      "Start reviewing for the farthest exam now — that's where good students win",
      "Eat a nutritious meal before studying — no junk",
      "Do a study session while walking outside",
      "Create a mind map of the most important course this month",
      "Ask your professor / tutor a question today",
      "Identify your 3 main knowledge gaps and give each 30min",
      "Read 10 pages of an inspiring book outside coursework",
      "Disable all notifications for 3h — test real focus",
      "Write 5 things you learned this week — anchor them",
      "Organize your workspace: clean brain = clean desk",
    ],
    citations_fr: [
      "\"L'éducation est l'arme la plus puissante pour changer le monde.\" — Mandela",
      "\"Celui qui lit, vit mille vies. Celui qui ne lit pas n'en vit qu'une.\"",
      "\"La discipline est le pont entre tes objectifs et leurs accomplissements.\"",
      "\"Il n'y a pas de raccourci pour un endroit qui vaut le voyage.\"",
      "\"La connaissance est la seule chose qu'on ne peut pas voler.\"",
      "\"Travailler dur bat le talent quand le talent ne travaille pas dur.\"",
    ],
    citations_en: [
      "\"Education is the most powerful weapon to change the world.\" — Mandela",
      "\"A reader lives a thousand lives. A non-reader lives only one.\"",
      "\"Discipline is the bridge between your goals and their accomplishment.\"",
      "\"There are no shortcuts to anywhere worth going.\"",
      "\"Knowledge is the only thing that can't be stolen.\"",
      "\"Hard work beats talent when talent doesn't work hard.\"",
    ],
  },
};

// ─── DÉFI DU JOUR (basé sur date pour consistance) ───
function getDefiDuJour(profil, lang) {
  const p = PROFILS[profil];
  if (!p) return "";
  const defis = lang === "en" ? p.defis_en : p.defis_fr;
  const seed = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const idx = parseInt(seed) % defis.length;
  return defis[idx];
}

function getCitationDuJour(profil, lang) {
  const p = PROFILS[profil];
  if (!p) return "";
  const citations = lang === "en" ? p.citations_en : p.citations_fr;
  const seed = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const idx = (parseInt(seed) + 3) % citations.length;
  return citations[idx];
}

// ─── PROMPT IA MESSAGE DU MATIN ───
function buildMorningPrompt(lang, profil, data, profile) {
  const L = lang === "en";
  const p = PROFILS[profil];
  const streak = data.streak || 0;
  const niveau = getNiveau(data.xp || 0);
  const defi = getDefiDuJour(profil, lang);

  const systemFR = `Tu es le coach mindset de VitaScann. Tu génères un message d'activation du matin ultra-personnalisé pour un guerrier en mode "${p.labelFR}". 
Niveau actuel: ${niveau.label} (${streak} jours de streak, ${data.xp || 0} XP).
Défi du jour: "${defi}"
Profil utilisateur: ${profile?.objectif || "sante"}, ${profile?.sexe || "homme"}.

Génère un message qui:
- Commence fort — comme si tu secouais le guerrier pour qu'il se lève
- Mentionne son niveau et son streak si impressionnant
- Intègre le défi du jour naturellement
- Cite une vérité dure si besoin
- Termine avec un appel à l'action immédiat

Retourne UNIQUEMENT un JSON valide sans markdown:
{
  "message": "Le message complet en 4-6 phrases percutantes",
  "cri_de_guerre": "1 phrase ultra-courte style battle cry — max 8 mots",
  "tibb": "Conseil Tibb an-Nabawi ou hadith lié au profil",
  "focus_du_jour": "1 chose unique sur laquelle se concentrer aujourd'hui"
}`;

  const systemEN = `You are VitaScann's mindset coach. Generate an ultra-personalized morning activation message for a warrior in "${p.labelEN}" mode.
Current level: ${niveau.labelEn || niveau.label} (${streak}-day streak, ${data.xp || 0} XP).
Today's challenge: "${defi}"
User profile: ${profile?.objectif || "health"}, ${profile?.sexe || "homme"}.

Generate a message that:
- Starts strong — like shaking the warrior awake
- Mentions their level and streak if impressive
- Naturally integrates today's challenge
- Cites a hard truth if needed
- Ends with an immediate call to action

Return ONLY valid JSON without markdown:
{
  "message": "Full message in 4-6 punchy sentences",
  "cri_de_guerre": "1 ultra-short battle cry — max 8 words",
  "tibb": "Tibb an-Nabawi advice or hadith related to the profile",
  "focus_du_jour": "1 unique thing to focus on today"
}`;

  return {
    system: L ? systemEN : systemFR,
    user: L ? "Generate the morning message." : "Génère le message du matin.",
  };
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function MindsetGuerrier({ user, onBack, onCoinsEarned, lang, profile }) {
  const L = lang === "en";
  const sexe = profile?.sexe || "homme";
  const avatarSet = AVATARS[sexe] || AVATARS["homme"];

  const [data, setData] = useState(() => getData());
  const [screen, setScreen] = useState(data.profil ? "home" : "choix_profil");
  const [morningMsg, setMorningMsg] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [defiDone, setDefiDone] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  const profil = data.profil;
  const p = PROFILS[profil] || null;
  const niveau = getNiveau(data.xp || 0);
  const nextNiv = getNextNiveau(data.xp || 0);
  const streak = data.streak || 0;
  const xp = data.xp || 0;

  // Check si défi déjà complété aujourd'hui
  useEffect(() => {
    const d = getData();
    setDefiDone(d.lastDefi === getToday());
  }, []);

  useEffect(() => {
    setAnimIn(false);
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, [screen]);

  // ─── Choisir un profil ───
  const choisirProfil = (id) => {
    const newData = { ...data, profil: id, xp: data.xp || 0, streak: data.streak || 0 };
    setData(newData);
    saveData(newData);
    setScreen("home");
    loadMorningMessage(id, newData);
  };

  // ─── Message du matin IA ───
  const loadMorningMessage = useCallback(async (profilId, currentData) => {
    const pid = profilId || profil;
    if (!pid) return;
    const cached = currentData?.lastMsgDate === getToday() && currentData?.morningMsg;
    if (cached) { setMorningMsg(currentData.morningMsg); return; }
    setLoadingMsg(true);
    try {
      const prompt = buildMorningPrompt(lang, pid, currentData || data, profile);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 600, system: prompt.system, messages: [{ role: "user", content: prompt.user }] }),
      });
      const d2 = await res.json();
      const text = d2.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setMorningMsg(parsed);
      const newData = { ...(currentData || data), morningMsg: parsed, lastMsgDate: getToday() };
      setData(newData);
      saveData(newData);
    } catch (e) { console.error(e); }
    finally { setLoadingMsg(false); }
  }, [lang, profil, data, profile]);

  useEffect(() => {
    if (profil && screen === "home") loadMorningMessage(profil, data);
  }, [profil]);

  // ─── Compléter le défi ───
  const completerDefi = () => {
    if (defiDone) return;
    const today = getToday();
    const lastStreak = data.lastDefi;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const newStreak = lastStreak === yKey ? (data.streak || 0) + 1 : 1;
    const xpGain = 15 + newStreak * 2;
    const newData = { ...data, lastDefi: today, streak: newStreak, xp: (data.xp || 0) + xpGain, history: [{ date: today, profil, xp: xpGain }, ...(data.history || [])].slice(0, 60) };
    setData(newData);
    saveData(newData);
    setDefiDone(true);
    if (onCoinsEarned) onCoinsEarned(xpGain);
  };

  // ─── Progress barre XP ───
  const xpProgress = nextNiv ? Math.round(((xp - niveau.xpReq) / (nextNiv.xpReq - niveau.xpReq)) * 100) : 100;

  // ════════════════════════════════════════
  // SCREEN : CHOIX PROFIL
  // ════════════════════════════════════════
  if (screen === "choix_profil") return (
    <div style={{ minHeight: "100vh", paddingBottom: 100, overflowY: "auto", background: "#060d08" }}>
      <div style={{ padding: "52px 22px 28px", background: "radial-gradient(ellipse at 50% 0%,#1a0a00 0%,#060d08 65%)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, marginBottom: 20, display: "block" }}>← {L ? "Back" : "Retour"}</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🗡️</div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "#edf5ef", marginBottom: 10 }}>
            {L ? "Choose your warrior mode" : "Choisis ton mode guerrier"}
          </div>
          <div style={{ color: MUT, fontSize: 13, lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
            {L ? "Your profile defines your daily challenges, AI messages and focus areas." : "Ton profil définit tes défis quotidiens, messages IA et axes de focus."}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {Object.values(PROFILS).map((p2) => (
          <button key={p2.id} onClick={() => choisirProfil(p2.id)}
            style={{ width: "100%", background: p2.bg, border: `1.5px solid ${p2.border}`, borderRadius: 20, padding: "20px 18px", cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 16, textAlign: "left", fontFamily: "'Outfit',sans-serif", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = p2.colorPrimary}
            onMouseLeave={e => e.currentTarget.style.borderColor = p2.border}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${p2.colorPrimary}15`, border: `1.5px solid ${p2.colorPrimary}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{p2.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: p2.colorPrimary, marginBottom: 4 }}>{L ? p2.labelEN : p2.labelFR}</div>
              <div style={{ fontSize: 12, color: MUT, lineHeight: 1.5 }}>{L ? p2.descEN : p2.descFR}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {(L ? p2.piliersEN : p2.piliersFR).slice(0, 3).map((pill, i) => (
                  <span key={i} style={{ background: `${p2.colorPrimary}10`, border: `1px solid ${p2.colorPrimary}33`, borderRadius: 20, padding: "2px 8px", fontSize: 10, color: p2.colorPrimary }}>{pill}</span>
                ))}
              </div>
            </div>
            <div style={{ color: p2.colorPrimary, fontSize: 20 }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // SCREEN : HOME (profil choisi)
  // ════════════════════════════════════════
  if (screen === "home" && p) {
    const defi = getDefiDuJour(profil, lang);
    const citation = getCitationDuJour(profil, lang);
    const avatarImg = xp >= 210 ? avatarSet.high : avatarSet.low;

    return (
      <div style={{ minHeight: "100vh", paddingBottom: 100, overflowY: "auto", background: "#060d08" }}>

        {/* Hero */}
        <div style={{ padding: "52px 22px 24px", background: `radial-gradient(ellipse at 50% 0%,${p.colorPrimary}18 0%,#060d08 65%)`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 52, left: 20, display: "flex", gap: 8 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13 }}>← {L ? "Back" : "Retour"}</button>
          </div>
          <button onClick={() => setScreen("choix_profil")} style={{ position: "absolute", top: 52, right: 20, background: `${p.colorPrimary}15`, border: `1px solid ${p.colorPrimary}33`, borderRadius: 20, padding: "4px 10px", fontSize: 10, color: p.colorPrimary, cursor: "pointer", fontWeight: 700 }}>
            {p.emoji} {L ? "Change" : "Changer"}
          </button>

          {/* Avatar + niveau */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 20, marginBottom: 20, opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(16px)", transition: "all .5s ease" }}>
            <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
              {!imgErr
                ? <img src={avatarImg} alt="" onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "contain", filter: `drop-shadow(0 0 16px ${p.colorPrimary}88)` }} />
                : <div style={{ fontSize: 52, textAlign: "center" }}>{p.emoji}</div>}
              <div style={{ position: "absolute", bottom: -6, right: -6, background: `${niveau.color}20`, border: `1.5px solid ${niveau.color}`, borderRadius: 20, padding: "2px 7px", fontSize: 10, color: niveau.color, fontWeight: 700, whiteSpace: "nowrap" }}>
                {niveau.icon} {L ? (niveau.labelEn || niveau.label) : niveau.label}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: p.colorPrimary, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                {L ? "MODE" : "MODE"} {(L ? p.labelEN : p.labelFR).toUpperCase()}
              </div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: "#edf5ef", lineHeight: 1.1 }}>
                {streak > 0 ? `${streak} ${L ? "days 🔥" : "jours 🔥"}` : (L ? "Day 1 💪" : "Jour 1 💪")}
              </div>
              <div style={{ fontSize: 12, color: MUT, marginTop: 4 }}>{xp} XP · {L ? "Goal" : "Objectif"} {nextNiv ? `${nextNiv.xpReq} XP` : "MAX"}</div>

              {/* XP bar */}
              <div style={{ background: "#142018", borderRadius: 6, height: 6, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${xpProgress}%`, height: "100%", background: `linear-gradient(90deg,${p.colorPrimary}88,${p.colorPrimary})`, borderRadius: 6, transition: "width 1s ease" }} />
              </div>
            </div>
          </div>

          {/* Stats streak */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { val: streak, label: L ? "Day streak" : "Streak jours", color: "#f97316", suffix: "🔥" },
              { val: xp, label: "XP Total", color: p.colorPrimary, suffix: "" },
              { val: (data.history || []).length, label: L ? "Challenges done" : "Défis faits", color: EM, suffix: "" },
            ].map(({ val, label, color, suffix }, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${color}33`, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 18, color }}>{val}{suffix}</div>
                <div style={{ fontSize: 9, color: MUT, marginTop: 2, lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>

          {/* Message du matin IA */}
          <div style={{ background: `linear-gradient(135deg,${p.bg},${p.bg}dd)`, border: `1.5px solid ${p.colorPrimary}44`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${p.colorPrimary}20`, border: `1.5px solid ${p.colorPrimary}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🗡️</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: p.colorPrimary }}>{L ? "Morning Message" : "Message du matin"}</div>
              {loadingMsg && <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: p.colorPrimary, animation: `pulse 1.2s ${i * .2}s ease-in-out infinite` }} />)}</div>}
            </div>

            {morningMsg ? (
              <>
                {/* Cri de guerre */}
                {morningMsg.cri_de_guerre && (
                  <div style={{ background: `${p.colorPrimary}12`, border: `1px solid ${p.colorPrimary}33`, borderRadius: 10, padding: "8px 14px", marginBottom: 12, textAlign: "center" }}>
                    <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: p.colorPrimary }}>"{morningMsg.cri_de_guerre}"</div>
                  </div>
                )}
                <div style={{ fontSize: 13, color: "#c8d8c8", lineHeight: 1.75, marginBottom: 12 }}>{morningMsg.message}</div>
                {morningMsg.focus_du_jour && (
                  <div style={{ background: `${EM}08`, border: `1px solid ${EM}22`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: EM, fontWeight: 700, marginBottom: 4 }}>🎯 {L ? "FOCUS OF THE DAY" : "FOCUS DU JOUR"}</div>
                    <div style={{ fontSize: 12, color: "#a0c8a8", lineHeight: 1.6 }}>{morningMsg.focus_du_jour}</div>
                  </div>
                )}
                {morningMsg.tibb && (
                  <div style={{ background: "#1a100508", border: `1px solid ${GOLD}22`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginBottom: 4 }}>🌙 TIBB AN-NABAWI</div>
                    <div style={{ fontSize: 12, color: "#a08040", lineHeight: 1.6 }}>{morningMsg.tibb}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: MUT, fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                {loadingMsg ? (L ? "Generating your message..." : "Génération de ton message...") : (L ? "Loading..." : "Chargement...")}
              </div>
            )}
          </div>

          {/* Défi du jour */}
          <div style={{ background: defiDone ? `${EM}08` : CARD, border: `1.5px solid ${defiDone ? EM : p.colorPrimary}44`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 24 }}>⚔️</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: defiDone ? EM : p.colorPrimary }}>{L ? "TODAY'S CHALLENGE" : "DÉFI DU JOUR"}</div>
                <div style={{ fontSize: 10, color: MUT }}>{defiDone ? (L ? "✅ Completed!" : "✅ Complété !") : `+${15 + streak * 2} XP`}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#edf5ef", lineHeight: 1.7, marginBottom: 16, fontWeight: 500 }}>{defi}</div>
            {!defiDone ? (
              <button onClick={completerDefi}
                style={{ width: "100%", background: `linear-gradient(135deg,${p.colorPrimary}22,${p.colorPrimary}11)`, border: `1.5px solid ${p.colorPrimary}66`, borderRadius: 14, padding: "14px", fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, color: p.colorPrimary, cursor: "pointer" }}>
                ✅ {L ? "Challenge completed!" : "Défi accompli !"}
              </button>
            ) : (
              <div style={{ textAlign: "center", color: EM, fontSize: 14, fontWeight: 700 }}>
                🔥 {streak} {L ? "day streak! Keep going!" : "jours de streak ! Continue !"}
              </div>
            )}
          </div>

          {/* Piliers du profil */}
          <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>{L ? "YOUR WARRIOR PILLARS" : "TES PILIERS GUERRIER"}</div>
            {(L ? p.piliersEN : p.piliersFR).map((pill, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < (L ? p.piliersEN : p.piliersFR).length - 1 ? 12 : 0, paddingBottom: i < (L ? p.piliersEN : p.piliersFR).length - 1 ? 12 : 0, borderBottom: i < (L ? p.piliersEN : p.piliersFR).length - 1 ? `1px solid ${BDR}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${p.colorPrimary}12`, border: `1px solid ${p.colorPrimary}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {["🌟", "⚡", "🎯", "🤝", "🔮"][i]}
                </div>
                <div style={{ fontSize: 13, color: "#edf5ef", fontWeight: 500 }}>{pill}</div>
              </div>
            ))}
          </div>

          {/* Citation du jour */}
          <button onClick={() => setShowCitation(!showCitation)}
            style={{ width: "100%", background: `${GOLD}08`, border: `1px solid ${GOLD}22`, borderRadius: 14, padding: 16, cursor: "pointer", marginBottom: 14, textAlign: "left", fontFamily: "'Outfit',sans-serif" }}>
            <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginBottom: showCitation ? 8 : 0 }}>💬 {L ? "QUOTE OF THE DAY" : "CITATION DU JOUR"} {showCitation ? "▲" : "▼"}</div>
            {showCitation && <div className="serif" style={{ fontSize: 15, color: GOLD, lineHeight: 1.6, fontStyle: "italic" }}>{citation}</div>}
          </button>

          {/* Niveaux */}
          <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>{L ? "WARRIOR LEVELS" : "NIVEAUX GUERRIER"}</div>
            {NIVEAUX.map((niv, i) => {
              const unlocked = xp >= niv.xpReq;
              const current = niv.id === niveau.id;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < NIVEAUX.length - 1 ? 10 : 0, opacity: unlocked ? 1 : .4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${niv.color}${unlocked ? "20" : "08"}`, border: `1.5px solid ${niv.color}${current ? "" : "44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{niv.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: current ? 700 : 500, fontSize: 13, color: current ? niv.color : "#edf5ef" }}>{L ? (niv.labelEn || niv.label) : niv.label} {current ? (L ? "← YOU" : "← TOI") : ""}</div>
                    <div style={{ fontSize: 10, color: MUT }}>{niv.xpReq} XP · {niv.minJours} {L ? "days" : "jours"}</div>
                  </div>
                  {unlocked && <div style={{ color: niv.color, fontSize: 14 }}>✓</div>}
                </div>
              );
            })}
          </div>

          {/* Historique */}
          {(data.history || []).length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>{L ? "RECENT ACTIVITY" : "ACTIVITÉ RÉCENTE"}</div>
              {(data.history || []).slice(0, 5).map((h, i) => {
                const hp = PROFILS[h.profil];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 4 ? 8 : 0 }}>
                    <span style={{ fontSize: 18 }}>{hp?.emoji || "⚔️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#edf5ef" }}>{L ? "Challenge completed" : "Défi accompli"} — {hp ? (L ? hp.labelEN : hp.labelFR) : ""}</div>
                      <div style={{ fontSize: 10, color: MUT }}>{h.date}</div>
                    </div>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>+{h.xp} XP</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

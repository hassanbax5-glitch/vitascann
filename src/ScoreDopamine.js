// ============================================
// SCORE DOPAMINE V2 — VitaScann
// Détecte les addictions numériques
// Score partageable · Viral TikTok
// ============================================

import { useState } from "react";

const EM = "#00ff88", GOLD = "#e2b84a", MUT = "#4a6e52";
const CARD = "#0c1810", BDR = "#192c1d";
const DANGER = "#ef4444", WARN = "#f97316";
const DOPAMINE_COLOR = "#a855f7";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

// ─── Questions dopamine (FR + EN) ───
// Tirage aléatoire de 10 questions parmi la bank (seed = date du jour)
function pickRandomQsDopamine(bank, n=10) {
  const today = new Date().toISOString().slice(0,10);
  let seed = today.split("").reduce((a,c)=>a+c.charCodeAt(0),0) + 7; // +7 pour diff de ScannerFutur
  const shuffled = [...bank];
  for (let i = shuffled.length-1; i>0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(seed) % (i+1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0,n);
}

// Questions additionnelles FR
const EXTRA_QUESTIONS_FR = [
  { id:"musique", category:"🎵 Musique", question:"Tu écoutes de la musique constamment (même pour dormir/travailler) ?",
    options:["Oui, silence = impossible 😬","Souvent","Parfois","Je gère facilement le silence ✅"],
    weights:[0,30,65,100] },
  { id:"shopping", category:"🛍️ Shopping", question:"Tu fais des achats impulsifs en ligne ?",
    options:["Souvent, je résiste pas 💳","Parfois","Rarement","Presque jamais ✅"],
    weights:[0,30,65,100] },
  { id:"caféine", category:"☕ Caféine", question:"Ta consommation de café / energy drinks ?",
    options:["3+ cafés/jour, j'en ai besoin ☕😬","2-3/jour","1-2/jour","Peu ou jamais ✅"],
    weights:[0,30,65,100] },
  { id:"validation", category:"👍 Validation sociale", question:"Tu vérifies souvent les likes/vues sur tes posts ?",
    options:["Constamment, ça m'affecte 😬","Souvent","Parfois","Je m'en fous vraiment ✅"],
    weights:[0,20,60,100] },
  { id:"multitask", category:"🔄 Multitâche", question:"Tu peux regarder une vidéo sans faire autre chose en même temps ?",
    options:["Impossible, je scrolle toujours 📱","Très difficile","Parfois oui","Facilement ✅"],
    weights:[0,25,65,100] },
];

const EXTRA_QUESTIONS_EN = [
  { id:"musique", category:"🎵 Music", question:"Do you listen to music constantly (even to sleep/work)?",
    options:["Yes, silence is impossible 😬","Often","Sometimes","I handle silence easily ✅"],
    weights:[0,30,65,100] },
  { id:"shopping", category:"🛍️ Shopping", question:"Do you make impulse purchases online?",
    options:["Often, I can't resist 💳","Sometimes","Rarely","Almost never ✅"],
    weights:[0,30,65,100] },
  { id:"caféine", category:"☕ Caffeine", question:"Your coffee / energy drink consumption?",
    options:["3+ coffees/day, I need it ☕😬","2-3/day","1-2/day","Little or none ✅"],
    weights:[0,30,65,100] },
  { id:"validation", category:"👍 Social validation", question:"Do you often check likes/views on your posts?",
    options:["Constantly, it affects me 😬","Often","Sometimes","I genuinely don't care ✅"],
    weights:[0,20,60,100] },
  { id:"multitask", category:"🔄 Multitasking", question:"Can you watch a video without doing something else at the same time?",
    options:["Impossible, I always scroll 📱","Very hard","Sometimes yes","Easily ✅"],
    weights:[0,25,65,100] },
];

const QUESTIONS_FR = [
  {
    id: "ecran_matin",
    category: "📱 Téléphone",
    question: "Tu regardes ton téléphone combien de temps après le réveil ?",
    options: ["Immédiatement (< 1 min) 😬", "Dans les 10 minutes 📱", "Après 30 minutes ⏰", "Après 1h ou jamais ✅"],
    weights: [0, 30, 70, 100]
  },
  {
    id: "reseaux",
    category: "📱 Réseaux sociaux",
    question: "Ton temps total sur les réseaux sociaux par jour ?",
    options: ["4h+ (TikTok, Insta, YouTube) 😵", "2-4h 📱", "1-2h ⚖️", "Moins de 1h ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "notification",
    category: "🔔 Notifications",
    question: "Tu vérifies ton téléphone sans raison précise combien de fois ?",
    options: ["Constamment, sans m'en rendre compte 🔄", "Très souvent (50x+/jour) 😬", "Parfois (20-30x) ⚖️", "Rarement, je contrôle 🧘"],
    weights: [0, 20, 60, 100]
  },
  {
    id: "ennui",
    category: "🧠 Tolérance à l'ennui",
    question: "Tu peux rester sans téléphone / écran pendant 1 heure ?",
    options: ["Impossible, j'ai essayé 😅", "Très difficile, je résiste 😤", "Difficile mais faisable 😐", "Facilement, sans problème ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "dopamine_food",
    category: "🍫 Nourriture & sucre",
    question: "Ta consommation de sucre / snacks / fast food ?",
    options: ["Tous les jours, j'en ai besoin 🍫", "Souvent, c'est dur de résister 🍕", "Parfois, je me contrôle ⚖️", "Rarement, alimentation propre 🥗"],
    weights: [0, 30, 65, 100]
  },
  {
    id: "pornographie",
    category: "🔞 Contenu explicite",
    question: "Consommation de contenu pornographique ?",
    options: ["Régulièrement (ça affecte ma vie) ❌", "Parfois (je voudrais arrêter) ⚠️", "Rarement 🟡", "Jamais (alhamdulillah) ✅"],
    weights: [0, 20, 60, 100]
  },
  {
    id: "jeux",
    category: "🎮 Jeux vidéo / streaming",
    question: "Temps sur jeux vidéo ou séries par jour (hors travail) ?",
    options: ["5h+ par jour 🎮😵", "3-5h 🎮", "1-3h ⚖️", "Moins de 1h ou jamais ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "concentration",
    category: "🎯 Concentration",
    question: "Tu peux travailler / lire sans interruption pendant 30 min ?",
    options: ["Impossible, mon cerveau décroche 🧠💥", "Très difficile 😬", "Difficile mais je tiens 😐", "Oui, sans problème ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "dopamine_reset",
    category: "🌿 Reset naturel",
    question: "Tu pratiques des activités sans écran / sans stimulation ?",
    options: ["Jamais vraiment 🤷", "Rarement (1x/semaine max) 😬", "Parfois (quelques fois/semaine) ⚖️", "Régulièrement (sport, lecture, prière) ✅"],
    weights: [0, 30, 65, 100]
  },
  {
    id: "sommeil_ecran",
    category: "😴 Écran avant sommeil",
    question: "Tu regardes un écran avant de dormir ?",
    options: ["Jusqu'à m'endormir 📱😴", "Moins de 30 min avant 😬", "Je coupe 1h avant ⚖️", "Pas d'écran le soir ✅"],
    weights: [0, 30, 70, 100]
  },
];

const QUESTIONS_EN = [
  {
    id: "ecran_matin",
    category: "📱 Phone",
    question: "How soon after waking up do you check your phone?",
    options: ["Immediately (< 1 min) 😬", "Within 10 minutes 📱", "After 30 minutes ⏰", "After 1 hour or never ✅"],
    weights: [0, 30, 70, 100]
  },
  {
    id: "reseaux",
    category: "📱 Social Media",
    question: "Total daily time on social media?",
    options: ["4h+ (TikTok, Insta, YouTube) 😵", "2-4h 📱", "1-2h ⚖️", "Less than 1h ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "notification",
    category: "🔔 Notifications",
    question: "How often do you check your phone for no reason?",
    options: ["Constantly, without realizing 🔄", "Very often (50x+/day) 😬", "Sometimes (20-30x) ⚖️", "Rarely, I'm in control 🧘"],
    weights: [0, 20, 60, 100]
  },
  {
    id: "ennui",
    category: "🧠 Boredom Tolerance",
    question: "Can you stay off screens for 1 hour?",
    options: ["Impossible, I've tried 😅", "Very hard, I resist 😤", "Hard but doable 😐", "Easily, no problem ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "dopamine_food",
    category: "🍫 Food & Sugar",
    question: "Your sugar / snacks / fast food consumption?",
    options: ["Every day, I need it 🍫", "Often, hard to resist 🍕", "Sometimes, I control it ⚖️", "Rarely, eating clean 🥗"],
    weights: [0, 30, 65, 100]
  },
  {
    id: "pornographie",
    category: "🔞 Explicit content",
    question: "Do you consume pornographic content?",
    options: ["Regularly (it affects my life) ❌", "Sometimes (I want to stop) ⚠️", "Rarely 🟡", "Never (alhamdulillah) ✅"],
    weights: [0, 20, 60, 100]
  },
  {
    id: "jeux",
    category: "🎮 Gaming / Streaming",
    question: "Daily time on games or shows (outside work)?",
    options: ["5h+ per day 🎮😵", "3-5h 🎮", "1-3h ⚖️", "Less than 1h or never ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "concentration",
    category: "🎯 Focus",
    question: "Can you work/read without interruption for 30 min?",
    options: ["Impossible, my brain drifts 🧠💥", "Very hard 😬", "Hard but I manage 😐", "Yes, no problem ✅"],
    weights: [0, 25, 65, 100]
  },
  {
    id: "dopamine_reset",
    category: "🌿 Natural Reset",
    question: "Do you do screen-free / unstimulating activities?",
    options: ["Never really 🤷", "Rarely (1x/week max) 😬", "Sometimes (a few times/week) ⚖️", "Regularly (sport, reading, prayer) ✅"],
    weights: [0, 30, 65, 100]
  },
  {
    id: "sommeil_ecran",
    category: "😴 Screens before sleep",
    question: "Do you look at screens before sleeping?",
    options: ["Until I fall asleep 📱😴", "Less than 30 min before 😬", "I stop 1h before ⚖️", "No screens in the evening ✅"],
    weights: [0, 30, 70, 100]
  },
];

function calcDopamineScore(answers, questions) {
  const vals = Object.entries(answers);
  if (!vals.length) return 0;
  let total = 0;
  vals.forEach(([id, idx]) => {
    const q = questions.find(q => q.id === id);
    if (q) total += (q.weights[idx] ?? 0);
  });
  return Math.round(total / vals.length);
}

function getLevel(score) {
  if (score >= 80) return { label: "🧘 Maître du dopamine", labelEn: "🧘 Dopamine Master", color: EM, bg: "#00ff8812", desc: "Ton cerveau est libre. Tu es rare.", descEn: "Your brain is free. You are rare." };
  if (score >= 65) return { label: "⚖️ Équilibré", labelEn: "⚖️ Balanced", color: GOLD, bg: "#e2b84a12", desc: "Bonnes bases, quelques habitudes à affiner.", descEn: "Good foundation, a few habits to refine." };
  if (score >= 45) return { label: "📱 Dépendant modéré", labelEn: "📱 Moderately Addicted", color: WARN, bg: "#f9731612", desc: "Le dopamine te contrôle plus que tu ne le crois.", descEn: "Dopamine controls you more than you think." };
  if (score >= 25) return { label: "🔴 Dopamine hijacké", labelEn: "🔴 Dopamine Hijacked", color: "#ef4444", bg: "#ef444412", desc: "Ton cerveau est en mode survie permanente.", descEn: "Your brain is in permanent survival mode." };
  return { label: "💀 Addiction sévère", labelEn: "💀 Severe Addiction", color: "#ff0000", bg: "#ff000015", desc: "Alerte maximale. Il faut agir maintenant.", descEn: "Maximum alert. You need to act now." };
}

export default function ScoreDopamine({ user, profile, onBack, onCoinsEarned, lang }) {
  const L = lang === "en";
  const [QUESTIONS] = useState(() => pickRandomQsDopamine([...(L ? QUESTIONS_EN : QUESTIONS_FR), ...(L ? EXTRA_QUESTIONS_EN : EXTRA_QUESTIONS_FR)], 10));

  const [step, setStep]       = useState("intro");
  const [qIdx, setQIdx]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [shared, setShared]   = useState(false);

  const finalScore = calcDopamineScore(answers, QUESTIONS);
  const level      = getLevel(finalScore);

  const analyze = async (finalAnswers) => {
    setLoading(true);
    setStep("analyzing");

    const score = calcDopamineScore(finalAnswers, QUESTIONS);
    const habitudes = QUESTIONS.map(q => {
      const idx = finalAnswers[q.id] ?? 0;
      return `${q.category}: ${q.options[idx]}`;
    }).join("\n");

    const systemPrompt = `Tu es un expert en neurosciences et addictions numériques. Tu analyses le profil dopamine d'un utilisateur et fournis un diagnostic précis et actionnable.
Réponds UNIQUEMENT en JSON valide sans aucun texte avant ou après. Format exact :
{
  "score": ${score},
  "niveau": "<label court du niveau>",
  "diagnostic": "<2-3 phrases percutantes sur l'état actuel du cerveau dopaminergique de l'user. Sois direct, sans jugement, factuel.>",
  "addictions_principales": ["<addiction #1 identifiée>", "<addiction #2>", "<addiction #3>"],
  "impact_cerveau": "<1-2 phrases sur l'impact neurologique concret (concentration, motivation, sommeil, relations)>",
  "dopamine_reset_plan": [
    {"jour": "Jour 1-3", "action": "<action concrète>"},
    {"jour": "Jour 4-7", "action": "<action concrète>"},
    {"jour": "Semaine 2", "action": "<action concrète>"},
    {"jour": "Semaine 3-4", "action": "<action concrète>"}
  ],
  "quick_wins": ["<action immédiate dès aujourd'hui #1>", "<action #2>", "<action #3>"],
  "message_islam": "<conseil islamique lié à la maîtrise des désirs (nafs), avec référence Coran/hadith si possible>",
  "score_partage": "<phrase courte et percutante pour partager sur TikTok/Insta, max 15 mots, en ${L ? "English" : "français"}>"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: `Score dopamine calculé: ${score}/100\n\nRéponses détaillées:\n${habitudes}\n\nGénère le diagnostic complet.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setStep("result");
      if (onCoinsEarned) onCoinsEarned(15);
    } catch (e) {
      console.error(e);
      setStep("questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optIdx) => {
    const q = QUESTIONS[qIdx];
    const newAnswers = { ...answers, [q.id]: optIdx };
    setAnswers(newAnswers);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      analyze(newAnswers);
    }
  };

  // ─── INTRO ───
  if (step === "intro") return (
    <div style={{ minHeight: "100vh", background: "#060d08", overflowY: "auto" }}>
      <div style={{ padding: "52px 22px 40px", textAlign: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 24, textAlign: "left" }}>
          ← {L ? "Back" : "Retour"}
        </button>

        {/* Hero */}
        <div style={{ position: "relative", marginBottom: 28, display: "inline-block" }}>
          <div style={{ fontSize: 72, filter: `drop-shadow(0 0 30px ${DOPAMINE_COLOR}66)` }}>🧠</div>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 120, height: 120, borderRadius: "50%",
            background: `radial-gradient(ellipse, ${DOPAMINE_COLOR}10 0%, transparent 70%)`,
            border: `1px solid ${DOPAMINE_COLOR}22`, pointerEvents: "none"
          }} />
        </div>

        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 800, color: "#edf5ef", lineHeight: 1.2, marginBottom: 12 }}>
          {L ? "What's your Dopamine Score?" : "Quel est ton Score Dopamine ?"}
        </div>
        <div style={{ color: MUT, fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 28px" }}>
          {L
            ? "TikTok, sugar, porn, gaming... Your brain may be hijacked without you realizing it. Find out your real score in 2 minutes."
            : "TikTok, sucre, porn, jeux vidéo... Ton cerveau est peut-être hijacké sans que tu t'en rendes compte. Découvre ton vrai score en 2 minutes."}
        </div>

        {/* Score examples */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32, maxWidth: 320, margin: "0 auto 32px" }}>
          {[
            { score: 15, label: L ? "💀 Severe addiction" : "💀 Addiction sévère", color: "#ff4444" },
            { score: 48, label: L ? "📱 Moderately addicted" : "📱 Dépendant modéré", color: WARN },
            { score: 82, label: L ? "🧘 Dopamine Master" : "🧘 Maître du dopamine", color: EM },
          ].map(ex => (
            <div key={ex.score} style={{ display: "flex", alignItems: "center", gap: 12, background: CARD, border: `1px solid ${ex.color}33`, borderRadius: 14, padding: "12px 16px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: ex.color, minWidth: 44 }}>{ex.score}</div>
              <div style={{ fontSize: 13, color: "#edf5ef" }}>{ex.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep("questions")}
          style={{
            width: "100%", maxWidth: 320,
            background: `linear-gradient(135deg,${DOPAMINE_COLOR},#7c3aed)`,
            border: "none", borderRadius: 18, padding: "16px 24px",
            fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff",
            cursor: "pointer", display: "block", margin: "0 auto"
          }}>
          {L ? "🧠 Test my brain →" : "🧠 Tester mon cerveau →"}
        </button>
        <div style={{ color: MUT, fontSize: 11, marginTop: 12 }}>
          {L ? "10 questions • 2 minutes • Shareable result" : "10 questions • 2 minutes • Résultat partageable"}
        </div>
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (step === "questions") {
    const q = QUESTIONS[qIdx];
    const progress = (qIdx / QUESTIONS.length) * 100;
    const partialScore = calcDopamineScore(answers, QUESTIONS);

    return (
      <div style={{ minHeight: "100vh", background: "#060d08", padding: "52px 22px 40px", overflowY: "auto" }}>
        <button onClick={() => qIdx === 0 ? setStep("intro") : setQIdx(qIdx - 1)}
          style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 20 }}>
          ← {L ? "Back" : "Retour"}
        </button>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: MUT }}>{q.category}</span>
            <span style={{ fontSize: 11, color: DOPAMINE_COLOR, fontWeight: 700 }}>{qIdx + 1}/{QUESTIONS.length}</span>
          </div>
          <div style={{ background: BDR, borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${DOPAMINE_COLOR},#7c3aed)`, borderRadius: 6, transition: "width .4s ease" }} />
          </div>
        </div>

        {/* Score live */}
        {qIdx > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${DOPAMINE_COLOR}10`, border: `1px solid ${DOPAMINE_COLOR}33`, borderRadius: 14, padding: "10px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>🧠</span>
            <span style={{ fontSize: 13, color: "#edf5ef" }}>{L ? "Score so far:" : "Score en cours :"}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: DOPAMINE_COLOR, marginLeft: "auto" }}>{partialScore}</span>
          </div>
        )}

        <div style={{ fontSize: 20, fontWeight: 700, color: "#edf5ef", lineHeight: 1.4, marginBottom: 28, fontFamily: "'Outfit',sans-serif" }}>
          {q.question}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)}
              style={{
                background: CARD, border: `1.5px solid ${BDR}`, borderRadius: 16,
                padding: "15px 18px", cursor: "pointer", textAlign: "left",
                fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#edf5ef",
                transition: "all .2s", display: "flex", alignItems: "center", gap: 12
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = DOPAMINE_COLOR; e.currentTarget.style.background = `${DOPAMINE_COLOR}0a`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.background = CARD; }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${BDR}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: MUT, fontWeight: 700, flexShrink: 0
              }}>{String.fromCharCode(65 + i)}</div>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── ANALYZING ───
  if (step === "analyzing") return (
    <div style={{ minHeight: "100vh", background: "#060d08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🧠</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 12, textAlign: "center" }}>
        {L ? "Analyzing your brain..." : "Analyse de ton cerveau..."}
      </div>
      <div style={{ color: MUT, fontSize: 13, textAlign: "center", maxWidth: 280 }}>
        {L ? "Detecting your addictions and dopamine patterns." : "Détection de tes addictions et patterns dopaminergiques."}
      </div>
      <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: DOPAMINE_COLOR,
            animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );

  // ─── RESULT ───
  if (step === "result" && result) {
    const score = result.score ?? finalScore;
    const lvl   = getLevel(score);

    // Jauge visuelle
    const gaugeColor = score >= 65 ? EM : score >= 45 ? GOLD : score >= 25 ? WARN : DANGER;

    return (
      <div style={{ minHeight: "100vh", background: "#060d08", overflowY: "auto", paddingBottom: 40 }}>
        {/* Hero résultat */}
        <div style={{
          padding: "52px 22px 28px",
          background: `radial-gradient(ellipse at 50% 0%, ${DOPAMINE_COLOR}10 0%, #060d08 65%)`
        }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 20 }}>
            ← {L ? "Back" : "Retour"}
          </button>

          {/* Score principal — carte partageable */}
          <div style={{
            background: `linear-gradient(135deg,${DOPAMINE_COLOR}10,#0c0315)`,
            border: `2px solid ${gaugeColor}44`, borderRadius: 24, padding: "28px 20px",
            textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden"
          }}>
            {/* Glow bg */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 200, height: 200, borderRadius: "50%",
              background: `radial-gradient(ellipse,${gaugeColor}08 0%,transparent 70%)`,
              pointerEvents: "none"
            }} />

            <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>
              {L ? "DOPAMINE SCORE" : "SCORE DOPAMINE"}
            </div>

            {/* Cercle score */}
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
              <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke={BDR} strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={gaugeColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 314} 314`}
                  style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${gaugeColor})` }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: gaugeColor, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: MUT }}>/ 100</div>
              </div>
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, color: "#edf5ef", marginBottom: 6 }}>
              {L ? lvl.labelEn : lvl.label}
            </div>
            <div style={{ fontSize: 13, color: MUT, maxWidth: 260, margin: "0 auto" }}>
              {L ? lvl.descEn : lvl.desc}
            </div>

            {/* Phrase partage */}
            {result.score_partage && (
              <div style={{ marginTop: 16, background: `${gaugeColor}10`, border: `1px solid ${gaugeColor}33`, borderRadius: 12, padding: "10px 16px" }}>
                <div style={{ fontSize: 12, color: gaugeColor, fontStyle: "italic" }}>"{result.score_partage}"</div>
              </div>
            )}
          </div>

          {/* Bouton partage */}
          <button onClick={() => {
            const text = `Mon Score Dopamine sur VitaScann : ${score}/100 — ${L ? lvl.labelEn : lvl.label} 🧠\n${result.score_partage || ""}\nvitascann.vercel.app`;
            if (navigator.share) navigator.share({ text });
            else { navigator.clipboard?.writeText(text); setShared(true); setTimeout(() => setShared(false), 2000); }
          }}
            style={{
              width: "100%", background: `linear-gradient(135deg,${DOPAMINE_COLOR},#7c3aed)`,
              border: "none", borderRadius: 16, padding: "14px",
              fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer"
            }}>
            {shared ? (L ? "✅ Copied!" : "✅ Copié !") : (L ? "📤 Share my score" : "📤 Partager mon score")}
          </button>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Diagnostic IA */}
          <div style={{ background: CARD, border: `1.5px solid ${DOPAMINE_COLOR}33`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: DOPAMINE_COLOR, fontWeight: 700, letterSpacing: .8, marginBottom: 12 }}>
              🧠 {L ? "AI DIAGNOSIS" : "DIAGNOSTIC IA"}
            </div>
            <div style={{ fontSize: 14, color: "#edf5ef", lineHeight: 1.7, marginBottom: 16 }}>{result.diagnostic}</div>
            {result.impact_cerveau && (
              <div style={{ background: `${DOPAMINE_COLOR}08`, border: `1px solid ${DOPAMINE_COLOR}22`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: DOPAMINE_COLOR, fontWeight: 700, marginBottom: 6 }}>{L ? "🎯 BRAIN IMPACT" : "🎯 IMPACT CERVEAU"}</div>
                <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.6 }}>{result.impact_cerveau}</div>
              </div>
            )}
          </div>

          {/* Addictions principales */}
          {result.addictions_principales?.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#1a0505,#200808)", border: `1.5px solid ${DANGER}22`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: DANGER, fontWeight: 700, letterSpacing: .8, marginBottom: 12 }}>
                ⚠️ {L ? "MAIN ADDICTIONS DETECTED" : "ADDICTIONS PRINCIPALES DÉTECTÉES"}
              </div>
              {result.addictions_principales.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < result.addictions_principales.length - 1 ? 10 : 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: DANGER, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#edf5ef" }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Plan reset dopamine */}
          {result.dopamine_reset_plan?.length > 0 && (
            <div style={{ background: CARD, border: `1.5px solid ${EM}22`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: .8, marginBottom: 16 }}>
                📅 {L ? "DOPAMINE RESET PLAN" : "PLAN DOPAMINE RESET"}
              </div>
              {result.dopamine_reset_plan.map((p, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12,
                  marginBottom: i < result.dopamine_reset_plan.length - 1 ? 14 : 0,
                  paddingBottom: i < result.dopamine_reset_plan.length - 1 ? 14 : 0,
                  borderBottom: i < result.dopamine_reset_plan.length - 1 ? `1px solid ${BDR}` : "none"
                }}>
                  <div style={{
                    minWidth: 72, background: `${EM}10`, border: `1px solid ${EM}22`,
                    borderRadius: 10, padding: "6px 8px", textAlign: "center",
                    fontSize: 10, fontWeight: 700, color: EM, lineHeight: 1.3, flexShrink: 0
                  }}>{p.jour}</div>
                  <div style={{ fontSize: 13, color: "#edf5ef", lineHeight: 1.5, paddingTop: 4 }}>{p.action}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick wins */}
          {result.quick_wins?.length > 0 && (
            <div style={{ background: `${GOLD}06`, border: `1.5px solid ${GOLD}22`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: .8, marginBottom: 12 }}>
                ⚡ {L ? "3 QUICK WINS TODAY" : "3 QUICK WINS AUJOURD'HUI"}
              </div>
              {result.quick_wins.map((qw, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < result.quick_wins.length - 1 ? 12 : 0 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", background: `${GOLD}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: GOLD, flexShrink: 0
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: "#edf5ef", lineHeight: 1.5, paddingTop: 4 }}>{qw}</div>
                </div>
              ))}
            </div>
          )}

          {/* Message islamique */}
          {result.message_islam && (
            <div style={{ background: "linear-gradient(135deg,#0a1505,#0d1a08)", border: `1px solid ${EM}22`, borderRadius: 18, padding: 18, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🌿</div>
              <div style={{ fontSize: 13, color: "#b8d4bc", fontStyle: "italic", lineHeight: 1.7 }}>{result.message_islam}</div>
            </div>
          )}

          {/* Refaire */}
          <button onClick={() => { setStep("intro"); setAnswers({}); setQIdx(0); setResult(null); }}
            style={{
              width: "100%", background: "none", border: `1.5px solid ${BDR}`,
              borderRadius: 16, padding: "14px", cursor: "pointer",
              fontFamily: "'Outfit',sans-serif", fontSize: 14, color: MUT
            }}>
            🔄 {L ? "Redo the test" : "Refaire le test"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

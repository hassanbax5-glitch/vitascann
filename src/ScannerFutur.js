// ============================================
// SCANNER FUTUR — VitaScann
// Montre à l'user où il sera dans 6 mois
// Version sombre + version lumineuse
// Émotionnel · Partageable · Viral
// ============================================

import { useState } from "react";

const EM = "#00ff88", GOLD = "#e2b84a", MUT = "#4a6e52";
const CARD = "#0c1810", BDR = "#192c1d";
const DANGER = "#ef4444", WARN = "#f97316";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

// ─── Questions habitudes ───
// Bank de 14 questions — 7 tirées aléatoirement à chaque session
const QUESTIONS_BANK_FR = [
  { id:"sommeil",      question:"Tu dors combien d'heures par nuit en moyenne ?",         options:["Moins de 5h 😵","5-6h 😴","7-8h 😊","Plus de 9h 🛌"] },
  { id:"sport",        question:"Tu fais du sport combien de fois par semaine ?",          options:["Jamais 🛋️","1-2x 🚶","3-4x 🏃","5x+ 💪"] },
  { id:"alimentation", question:"Tu décris ton alimentation comment ?",                    options:["Fast food souvent 🍔","Correcte mais peu variée 🍱","Équilibrée la plupart du temps 🥗","Très propre & maison 🌿"] },
  { id:"stress",       question:"Ton niveau de stress au quotidien ?",                     options:["Très stressé(e) 😰","Stressé(e) souvent 😟","Parfois stressé(e) 😐","Calme & serein(e) 😌"] },
  { id:"ecran",        question:"Ton temps d'écran non-travail par jour ?",                options:["6h+ 📱😬","4-6h 📱","2-4h 📱","Moins de 2h ✅"] },
  { id:"hydratation",  question:"Tu bois combien d'eau par jour ?",                        options:["Moins de 1L 😬","1-1,5L","1,5-2L 💧","2L+ 💧💧"] },
  { id:"alcool",       question:"Tu consommes de l'alcool ?",                              options:["Non (alhamdulillah) ✅","Rarement","Parfois","Souvent"] },
  { id:"marche",       question:"Tu marches combien de pas par jour en moyenne ?",         options:["Moins de 2000 🛋️","2000-5000 🚶","5000-8000 🏃","8000-12000 💪","12000+ ⚡"] },
  { id:"meditation",   question:"Tu pratiques la méditation ou la prière régulièrement ?", options:["Jamais","Rarement","Parfois","Régulièrement 🕌","Tous les jours ✅"] },
  { id:"repas",        question:"Combien de repas équilibrés tu manges par jour ?",        options:["0-1 repas 😬","2 repas","3 repas 🍽️","3 repas + collation saine ✅"] },
  { id:"sucre",        question:"Ta consommation de sucre / snacks sucrés ?",             options:["Tous les jours en grande quantité 🍫","Souvent","Parfois","Rarement ✅"] },
  { id:"soleil",       question:"Tu t'exposes au soleil ou à l'air frais ?",               options:["Presque jamais 🏠","Quelques fois par semaine","La plupart des jours","Tous les jours ☀️"] },
  { id:"social",       question:"Tes relations sociales te donnent de l'énergie ?",        options:["Je me sens souvent seul(e) 😞","Plutôt isolé(e)","Réseau social correct","Entouré(e) et soutenu(e) 💚"] },
  { id:"travail",      question:"Ton équilibre travail / vie personnelle ?",               options:["Complètement déséquilibré 😵","Difficile à gérer","Correct","Bien équilibré ✅"] },
];

const QUESTIONS_BANK_EN = [
  { id:"sommeil",      question:"How many hours do you sleep per night on average?",      options:["Less than 5h 😵","5-6h 😴","7-8h 😊","More than 9h 🛌"] },
  { id:"sport",        question:"How many times a week do you exercise?",                 options:["Never 🛋️","1-2x 🚶","3-4x 🏃","5x+ 💪"] },
  { id:"alimentation", question:"How would you describe your diet?",                      options:["Fast food often 🍔","Decent but not varied 🍱","Balanced most of the time 🥗","Very clean & home-cooked 🌿"] },
  { id:"stress",       question:"Your daily stress level?",                               options:["Very stressed 😰","Often stressed 😟","Sometimes stressed 😐","Calm & serene 😌"] },
  { id:"ecran",        question:"Daily non-work screen time?",                            options:["6h+ 📱😬","4-6h 📱","2-4h 📱","Less than 2h ✅"] },
  { id:"hydratation",  question:"How much water do you drink daily?",                     options:["Less than 1L 😬","1-1.5L","1.5-2L 💧","2L+ 💧💧"] },
  { id:"alcool",       question:"Do you consume alcohol?",                                options:["No (alhamdulillah) ✅","Rarely","Sometimes","Often"] },
  { id:"marche",       question:"How many steps do you walk per day on average?",         options:["Less than 2000 🛋️","2000-5000 🚶","5000-8000 🏃","8000-12000 💪","12000+ ⚡"] },
  { id:"meditation",   question:"Do you meditate or pray regularly?",                     options:["Never","Rarely","Sometimes","Regularly 🕌","Every day ✅"] },
  { id:"repas",        question:"How many balanced meals do you eat per day?",            options:["0-1 meal 😬","2 meals","3 meals 🍽️","3 meals + healthy snack ✅"] },
  { id:"sucre",        question:"Your sugar / sweet snack consumption?",                  options:["Every day in large amounts 🍫","Often","Sometimes","Rarely ✅"] },
  { id:"soleil",       question:"Do you get outside in sunlight or fresh air?",           options:["Almost never 🏠","A few times a week","Most days","Every day ☀️"] },
  { id:"social",       question:"Do your social relationships give you energy?",          options:["I often feel lonely 😞","Rather isolated","Decent social network","Surrounded & supported 💚"] },
  { id:"travail",      question:"Your work-life balance?",                                options:["Completely off 😵","Hard to manage","Decent","Well balanced ✅"] },
];

// Tirage aléatoire de 7 questions parmi les 14 (seed = date du jour)
function pickRandomQuestions(bank, n=7) {
  const today = new Date().toISOString().slice(0,10);
  let seed = today.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const shuffled = [...bank];
  for (let i = shuffled.length-1; i>0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(seed) % (i+1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0,n);
}

const QUESTIONS_FR = QUESTIONS_BANK_FR; // garde compatibilité
const QUESTIONS_EN = QUESTIONS_BANK_EN;

// Score par réponse (index 0 = pire, 3 = meilleur)
const SCORES = [10, 35, 70, 100];

function calcScore(answers) {
  const vals = Object.values(answers);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, v) => a + (SCORES[v] || 0), 0) / vals.length);
}

export default function ScannerFutur({ user, profile, onBack, onCoinsEarned, lang }) {
  const L = lang === "en";
  const [QUESTIONS] = useState(() => pickRandomQuestions(L ? QUESTIONS_BANK_EN : QUESTIONS_BANK_FR, 7));

  const [step, setStep]       = useState("intro");    // intro | questions | analyzing | result
  const [qIdx, setQIdx]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dark"); // dark | light

  const currentScore = calcScore(answers);

  // ─── Analyse IA ───
  const analyze = async (finalAnswers) => {
    setLoading(true);
    setStep("analyzing");

    const pc = profile
      ? `Âge: ${profile.age || "?"}ans, sexe: ${profile.sexe || "?"}, objectif: ${profile.objectif || "?"}.`
      : "Profil non renseigné.";

    const habitudes = QUESTIONS.map((q, i) => {
      const idx = finalAnswers[q.id] ?? 0;
      return `${q.question} → ${q.options[idx]}`;
    }).join("\n");

    const scoreActuel = calcScore(finalAnswers);
    const systemPrompt = `Tu es un expert en santé prédictive. Tu analyses les habitudes actuelles d'un utilisateur et tu préds son état de santé dans 6 mois selon DEUX scénarios :
1. SCÉNARIO SOMBRE : si l'utilisateur NE CHANGE RIEN (continue exactement comme maintenant)
2. SCÉNARIO LUMINEUX : si l'utilisateur APPLIQUE les recommandations optimales

Réponds UNIQUEMENT en JSON valide sans aucun texte avant ou après. Format exact :
{
  "score_actuel": <nombre 0-100>,
  "score_dark_6m": <nombre 0-100, doit être ≤ score_actuel si mauvaises habitudes>,
  "score_light_6m": <nombre 0-100, doit être > score_actuel>,
  "dark_titre": "<titre choc court, max 6 mots, en ${L ? "English" : "français"}>",
  "dark_corps": "<2-3 phrases réalistes et émotionnelles sur les conséquences dans 6 mois si rien ne change. Sois direct et impactant.>",
  "dark_symptomes": ["<symptôme 1>", "<symptôme 2>", "<symptôme 3>", "<symptôme 4>"],
  "light_titre": "<titre inspirant court, max 6 mots, en ${L ? "English" : "français"}>",
  "light_corps": "<2-3 phrases motivantes et précises sur ce que l'user peut accomplir en 6 mois avec les bons changements.>",
  "light_victoires": ["<victoire concrète 1>", "<victoire concrète 2>", "<victoire concrète 3>", "<victoire concrète 4>"],
  "action_1": "<action #1 la plus impactante à faire cette semaine — précise et actionnable>",
  "action_2": "<action #2>",
  "action_3": "<action #3>",
  "message_islam": "<message court de sagesse islamique lié à la santé ou au changement, avec une référence hadith ou Coran si possible>"
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
            content: `Profil: ${pc}\nScore actuel calculé: ${scoreActuel}/100\n\nHabitudes actuelles:\n${habitudes}\n\nGénère la prédiction 6 mois.`
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
      <div style={{ padding: "52px 22px 32px", textAlign: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 24, textAlign: "left" }}>
          ← {L ? "Back" : "Retour"}
        </button>
        {/* Hero visual */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div style={{ fontSize: 80, marginBottom: 0, filter: "drop-shadow(0 0 30px #00ff8844)" }}>🔮</div>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 140, height: 140, borderRadius: "50%",
            background: "radial-gradient(ellipse, #00ff8808 0%, transparent 70%)",
            border: "1px solid #00ff8822", pointerEvents: "none"
          }} />
        </div>

        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800, color: "#edf5ef", lineHeight: 1.2, marginBottom: 12 }}>
          {L ? "Where will you be in 6 months?" : "Où seras-tu dans 6 mois ?"}
        </div>
        <div style={{ color: MUT, fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 32px" }}>
          {L
            ? "Your current habits are writing your future body. We show you two versions: if you keep going as is, and if you make the right changes."
            : "Tes habitudes actuelles écrivent ton corps de demain. On te montre deux versions : si tu continues comme ça, et si tu fais les bons changements."}
        </div>

        {/* Cards preview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" }}>
          <div style={{ background: "linear-gradient(135deg,#1a0505,#2a0808)", border: "1.5px solid #ef444444", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>🌑</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginTop: 8 }}>{L ? "Dark scenario" : "Scénario sombre"}</div>
            <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>{L ? "If nothing changes" : "Si rien ne change"}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#051a0a,#0a2812)", border: "1.5px solid #00ff8844", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>☀️</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: EM, marginTop: 8 }}>{L ? "Light scenario" : "Scénario lumineux"}</div>
            <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>{L ? "With the right changes" : "Avec les bons changements"}</div>
          </div>
        </div>

        <button
          onClick={() => setStep("questions")}
          style={{
            width: "100%", maxWidth: 320, background: `linear-gradient(135deg,${EM},#00cc66)`,
            border: "none", borderRadius: 18, padding: "16px 24px",
            fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#050d06",
            cursor: "pointer", display: "block", margin: "0 auto"
          }}>
          {L ? "🔮 Predict my future →" : "🔮 Prédire mon futur →"}
        </button>
        <div style={{ color: MUT, fontSize: 11, marginTop: 12 }}>
          {L ? "7 questions • 2 minutes" : "7 questions • 2 minutes"}
        </div>
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (step === "questions") {
    const q = QUESTIONS[qIdx];
    const progress = ((qIdx) / QUESTIONS.length) * 100;
    return (
      <div style={{ minHeight: "100vh", background: "#060d08", padding: "52px 22px 40px", overflowY: "auto" }}>
        <button onClick={() => qIdx === 0 ? setStep("intro") : setQIdx(qIdx - 1)}
          style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 24 }}>
          ← {L ? "Back" : "Retour"}
        </button>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: MUT }}>{L ? "Question" : "Question"} {qIdx + 1}/{QUESTIONS.length}</span>
            <span style={{ fontSize: 11, color: EM, fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: BDR, borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${EM},#00cc66)`, borderRadius: 6, transition: "width .4s ease" }} />
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: "#edf5ef", lineHeight: 1.4, marginBottom: 32, fontFamily: "'Outfit',sans-serif" }}>
          {q.question}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)}
              style={{
                background: CARD, border: `1.5px solid ${BDR}`, borderRadius: 16,
                padding: "16px 18px", cursor: "pointer", textAlign: "left",
                fontFamily: "'Outfit',sans-serif", fontSize: 15, color: "#edf5ef",
                transition: "all .2s", display: "flex", alignItems: "center", gap: 12
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = EM; e.currentTarget.style.background = `${EM}0a`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.background = CARD; }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${BDR}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: MUT, fontWeight: 700, flexShrink: 0
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
    <div style={{ minHeight: "100vh", background: "#060d08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ fontSize: 64, marginBottom: 24, animation: "pulse 2s infinite" }}>🔮</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 12, textAlign: "center" }}>
        {L ? "Analyzing your future..." : "Analyse de ton futur..."}
      </div>
      <div style={{ color: MUT, fontSize: 13, textAlign: "center", maxWidth: 280 }}>
        {L ? "The AI is calculating your two futures based on your habits." : "L'IA calcule tes deux futurs selon tes habitudes."}
      </div>
      <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: EM,
            animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:.8} 50%{opacity:1} }
      `}</style>
    </div>
  );

  // ─── RESULT ───
  if (step === "result" && result) {
    const isDark = activeTab === "dark";
    const darkScore = result.score_dark_6m ?? 30;
    const lightScore = result.score_light_6m ?? 80;
    const currentS = result.score_actuel ?? currentScore;

    const darkColor = darkScore >= 50 ? WARN : DANGER;
    const lightColor = EM;

    return (
      <div style={{ minHeight: "100vh", background: "#060d08", overflowY: "auto", paddingBottom: 40 }}>
        {/* Header */}
        <div style={{
          padding: "52px 22px 24px",
          background: isDark
            ? "radial-gradient(ellipse at 50% 0%, #2a050518 0%, #060d08 65%)"
            : "radial-gradient(ellipse at 50% 0%, #00ff8812 0%, #060d08 65%)"
        }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, display: "block", marginBottom: 20 }}>
            ← {L ? "Back" : "Retour"}
          </button>

          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, color: "#edf5ef", marginBottom: 4 }}>
            {L ? "Your 6-month prediction" : "Ta prédiction 6 mois"}
          </div>
          <div style={{ color: MUT, fontSize: 13 }}>
            {L ? "Based on your current habits" : "Basé sur tes habitudes actuelles"}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Score actuel */}
          <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: currentS >= 65 ? EM : currentS >= 40 ? WARN : DANGER }}>{currentS}</div>
              <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>/ 100</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 4 }}>{L ? "YOUR SCORE TODAY" : "TON SCORE AUJOURD'HUI"}</div>
              <div style={{ fontSize: 13, color: "#edf5ef" }}>
                {currentS >= 70 ? (L ? "Good habits! But there's room for more." : "Bonnes habitudes ! Mais il y a de la marge.") :
                  currentS >= 45 ? (L ? "Average level — key areas to improve." : "Niveau moyen — des zones clés à améliorer.") :
                    (L ? "Alert! Your habits are affecting your health." : "Alerte ! Tes habitudes impactent ta santé.")}
              </div>
            </div>
          </div>

          {/* Tabs sombre / lumineux */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { key: "dark", icon: "🌑", label: L ? "Dark" : "Sombre", color: DANGER, score: darkScore },
              { key: "light", icon: "☀️", label: L ? "Light" : "Lumineux", color: EM, score: lightScore }
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? `${tab.color}15` : CARD,
                  border: `2px solid ${activeTab === tab.key ? tab.color : BDR}`,
                  borderRadius: 16, padding: "14px 10px", cursor: "pointer", textAlign: "center",
                  transition: "all .2s"
                }}>
                <div style={{ fontSize: 24 }}>{tab.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: tab.color, marginTop: 6 }}>{tab.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: tab.color, marginTop: 4 }}>{tab.score}</div>
                <div style={{ fontSize: 9, color: MUT }}>{L ? "in 6 months" : "dans 6 mois"}</div>
              </button>
            ))}
          </div>

          {/* Contenu du scénario actif */}
          {isDark ? (
            <div style={{ background: "linear-gradient(135deg,#1a0505,#250808)", border: `1.5px solid ${DANGER}33`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>🌑</div>
                <div>
                  <div style={{ fontSize: 10, color: DANGER, fontWeight: 700, letterSpacing: .8 }}>{L ? "DARK SCENARIO — +6 MONTHS" : "SCÉNARIO SOMBRE — +6 MOIS"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#edf5ef", lineHeight: 1.2 }}>{result.dark_titre}</div>
                </div>
              </div>
              <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{result.dark_corps}</div>
              <div style={{ fontSize: 11, color: DANGER, fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>
                {L ? "⚠️ SYMPTOMS TO EXPECT" : "⚠️ SYMPTÔMES À ATTENDRE"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(result.dark_symptomes || []).map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: `${DANGER}08`, border: `1px solid ${DANGER}22`, borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14 }}>⚠️</span>
                    <span style={{ fontSize: 13, color: "#edf5ef" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#051a0a,#082012)", border: `1.5px solid ${EM}33`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>☀️</div>
                <div>
                  <div style={{ fontSize: 10, color: EM, fontWeight: 700, letterSpacing: .8 }}>{L ? "LIGHT SCENARIO — +6 MONTHS" : "SCÉNARIO LUMINEUX — +6 MOIS"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#edf5ef", lineHeight: 1.2 }}>{result.light_titre}</div>
                </div>
              </div>
              <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{result.light_corps}</div>
              <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>
                {L ? "✅ VICTORIES TO CLAIM" : "✅ VICTOIRES À ATTEINDRE"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(result.light_victoires || []).map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: `${EM}08`, border: `1px solid ${EM}22`, borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span style={{ fontSize: 13, color: "#edf5ef" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions prioritaires */}
          <div style={{ background: CARD, border: `1.5px solid ${GOLD}33`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>
              ⚡ {L ? "3 PRIORITY ACTIONS THIS WEEK" : "3 ACTIONS PRIORITAIRES CETTE SEMAINE"}
            </div>
            {[result.action_1, result.action_2, result.action_3].filter(Boolean).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? `1px solid ${BDR}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${GOLD}20`, border: `1.5px solid ${GOLD}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: GOLD, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "#edf5ef", lineHeight: 1.5, paddingTop: 4 }}>{a}</div>
              </div>
            ))}
          </div>

          {/* Message islamique */}
          {result.message_islam && (
            <div style={{ background: "linear-gradient(135deg,#0a1505,#0d1a08)", border: `1px solid ${EM}22`, borderRadius: 18, padding: 18, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>🌿</div>
              <div style={{ fontSize: 13, color: "#b8d4bc", fontStyle: "italic", lineHeight: 1.7 }}>{result.message_islam}</div>
            </div>
          )}

          {/* CTA refaire */}
          <button onClick={() => { setStep("intro"); setAnswers({}); setQIdx(0); setResult(null); }}
            style={{
              width: "100%", background: "none", border: `1.5px solid ${BDR}`,
              borderRadius: 16, padding: "14px", cursor: "pointer",
              fontFamily: "'Outfit',sans-serif", fontSize: 14, color: MUT
            }}>
            🔄 {L ? "Redo the scan" : "Refaire le scan"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

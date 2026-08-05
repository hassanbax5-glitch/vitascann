// ============================================================
// VITASCANN — ModuleRichesse.js
// 🌙 Clés spirituelles de la richesse en Islam
// ✅ Compteur tactile Astaghfirullah (objectif 10 000)
// ✅ Suivi de progression sur plusieurs jours
// ✅ Module gratitude quotidienne
// ✅ Rappels sur la confiance en Allah (tawakkul)
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";

const EM    = "#00ff88";
const GOLD  = "#e2b84a";
const MUT   = "#4a6e52";
const CARD  = "#0c1810";
const BDR   = "#192c1d";
const PURPLE= "#c084fc";

const STORAGE_KEY = "vs_richesse_v1";
const OBJECTIF_TOTAL = 10000;
const getTodayKey = () => new Date().toISOString().slice(0,10);

const loadData = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
};
const saveData = (d) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
};

const GRATITUDE_PROMPTS_FR = [
  "Une chose qu'Allah t'a donnée aujourd'hui sans que tu la demandes ?",
  "Un obstacle que tu pensais être un mal, mais qui s'est avéré un bien ?",
  "Une personne pour qui tu es reconnaissant aujourd'hui ?",
  "Une faveur d'Allah que tu prends souvent pour acquise ?",
  "Un moment de paix que tu as ressenti récemment ?",
  "Une porte qu'Allah a fermée pour t'en ouvrir une meilleure ?",
  "Une compétence ou un don qu'Allah t'a accordé ?",
];
const GRATITUDE_PROMPTS_EN = [
  "Something Allah gave you today without you asking?",
  "An obstacle you thought was bad, but turned out good?",
  "A person you're grateful for today?",
  "A favor from Allah you often take for granted?",
  "A moment of peace you felt recently?",
  "A door Allah closed to open a better one?",
  "A skill or gift Allah has granted you?",
];

const CLES_RICHESSE = [
  {
    icon:"🤲", titleFr:"Istighfar (Astaghfirullah)", titleEn:"Istighfar (Astaghfirullah)",
    textFr:"« Demandez pardon à votre Seigneur, car Il est grand Pardonneur. Il vous enverra du ciel une pluie abondante, et vous accordera des biens et des enfants, et vous donnera des jardins et vous donnera des rivières. »",
    textEn:"\"Seek forgiveness from your Lord, for He is Most Forgiving. He will send rain from the sky in abundance, and give you increase in wealth and children, and bestow on you gardens and rivers.\"",
    refFr:"Sourate Nuh, 10-12", refEn:"Surah Nuh, 10-12",
  },
  {
    icon:"🙏", titleFr:"Gratitude (Shukr)", titleEn:"Gratitude (Shukr)",
    textFr:"« Si vous êtes reconnaissants, J'augmenterai certes Mes faveurs pour vous. »",
    textEn:"\"If you are grateful, I will surely increase you [in favor].\"",
    refFr:"Sourate Ibrahim, 7", refEn:"Surah Ibrahim, 7",
  },
  {
    icon:"💚", titleFr:"Confiance en Allah (Tawakkul)", titleEn:"Trust in Allah (Tawakkul)",
    textFr:"« Et quiconque place sa confiance en Allah, Il lui suffit. » Douter de la provision d'Allah revient à douter de Sa promesse — la confiance totale est la clé.",
    textEn:"\"And whoever relies upon Allah — then He is sufficient for him.\" Doubting Allah's provision is doubting His promise — total trust is the key.",
    refFr:"Sourate At-Talaq, 3", refEn:"Surah At-Talaq, 3",
  },
  {
    icon:"💸", titleFr:"La Sadaqa (charité)", titleEn:"Sadaqa (charity)",
    textFr:"« La sadaqa n'a jamais diminué une richesse. » Donner ouvre des portes, ça ne les ferme jamais.",
    textEn:"\"Charity does not decrease wealth.\" Giving opens doors, it never closes them.",
    refFr:"Rapporté par Muslim", refEn:"Reported by Muslim",
  },
  {
    icon:"🌅", titleFr:"Prière de Fajr", titleEn:"Fajr prayer",
    textFr:"« Ô Allah, bénis ma communauté dans ses matinées. » Le Prophète ﷺ a lié la baraka (bénédiction) du rizq (subsistance) au lever tôt.",
    textEn:"\"O Allah, bless my nation in its early mornings.\" The Prophet ﷺ linked barakah (blessing) in rizq (provision) to waking early.",
    refFr:"Rapporté par Abu Dawud", refEn:"Reported by Abu Dawud",
  },
];

function AstaghfirullahCounter({ lang, onCoinsEarned, user }) {
  const L = lang === "en";
  const [data, setData] = useState(() => loadData());
  const [pulse, setPulse] = useState(false);
  const today = getTodayKey();
  const todayCount = data[today]?.count || 0;
  const totalAllTime = Object.values(data).reduce((sum, d) => sum + (d.count || 0), 0);
  const lastMilestone = useRef(Math.floor(todayCount / 100));

  const tap = useCallback(() => {
    setData(prev => {
      const nd = { ...prev };
      const cur = nd[today] || { count: 0 };
      const newCount = cur.count + 1;
      nd[today] = { count: newCount };
      saveData(nd);

      // Coins tous les 100
      const milestone = Math.floor(newCount / 100);
      if (milestone > lastMilestone.current) {
        lastMilestone.current = milestone;
        if (onCoinsEarned && user?.uid && !user?.isDemo) onCoinsEarned(10);
      }
      return nd;
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
    if (navigator.vibrate) navigator.vibrate(8);
  }, [today, onCoinsEarned, user]);

  const reset = () => {
    const nd = { ...data };
    delete nd[today];
    saveData(nd);
    setData(nd);
    lastMilestone.current = 0;
  };

  const pct = Math.min(100, Math.round((todayCount / OBJECTIF_TOTAL) * 100));
  const daysActive = Object.keys(data).length;

  return (
    <div style={{ background: CARD, border: `1.5px solid ${PURPLE}33`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize:11, color:PURPLE, fontWeight:700, letterSpacing:.8, marginBottom:14, textAlign:"center" }}>
        🤲 {L ? "ASTAGHFIRULLAH COUNTER" : "COMPTEUR ASTAGHFIRULLAH"}
      </div>

      {/* Cercle de progression tactile */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
        <button
          onClick={tap}
          style={{
            width:180, height:180, borderRadius:"50%",
            background:`conic-gradient(${PURPLE} ${pct}%, #1a1025 ${pct}%)`,
            border:"none", cursor:"pointer", position:"relative",
            transform: pulse ? "scale(0.96)" : "scale(1)",
            transition:"transform .12s ease",
            padding:8,
          }}>
          <div style={{
            width:"100%", height:"100%", borderRadius:"50%", background:"#0a0612",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{ fontSize:38, fontWeight:900, color:PURPLE, lineHeight:1 }}>{todayCount.toLocaleString()}</div>
            <div style={{ fontSize:11, color:MUT, marginTop:6 }}>/ {OBJECTIF_TOTAL.toLocaleString()}</div>
            <div style={{ fontSize:10, color:PURPLE, marginTop:8, fontWeight:700 }}>{L ? "TAP HERE" : "APPUIE ICI"}</div>
          </div>
        </button>
      </div>

      <div style={{ textAlign:"center", color:MUT, fontSize:12, marginBottom:14 }}>
        {pct}% {L ? "of today's goal" : "de l'objectif du jour"}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <div style={{ background:"#0a0612", borderRadius:12, padding:"10px 8px", textAlign:"center", border:`1px solid ${PURPLE}22` }}>
          <div style={{ fontWeight:700, fontSize:18, color:PURPLE }}>{totalAllTime.toLocaleString()}</div>
          <div style={{ fontSize:10, color:MUT, marginTop:2 }}>{L ? "All-time total" : "Total cumulé"}</div>
        </div>
        <div style={{ background:"#0a0612", borderRadius:12, padding:"10px 8px", textAlign:"center", border:`1px solid ${PURPLE}22` }}>
          <div style={{ fontWeight:700, fontSize:18, color:PURPLE }}>{daysActive}</div>
          <div style={{ fontSize:10, color:MUT, marginTop:2 }}>{L ? "Active days" : "Jours actifs"}</div>
        </div>
      </div>

      {todayCount > 0 && (
        <button onClick={reset} style={{
          width:"100%", background:"transparent", border:`1px solid ${BDR}`, borderRadius:10,
          padding:"8px", fontFamily:"'Outfit',sans-serif", fontSize:11, color:MUT, cursor:"pointer",
        }}>
          🔄 {L ? "Reset today's count" : "Remettre à zéro aujourd'hui"}
        </button>
      )}
    </div>
  );
}

function ProgressionChart({ lang }) {
  const L = lang === "en";
  const data = loadData();
  const days = Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14);

  if (days.length === 0) return null;
  const maxVal = Math.max(...days.map(([, d]) => d.count || 0), 100);

  return (
    <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize:11, color:MUT, fontWeight:700, letterSpacing:.8, marginBottom:14 }}>
        📊 {L ? "14-DAY PROGRESS" : "PROGRESSION 14 JOURS"}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:90 }}>
        {days.map(([date, d], i) => {
          const h = Math.max(4, Math.round(((d.count || 0) / maxVal) * 80));
          const isToday = date === getTodayKey();
          return (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <div style={{ fontSize:8, color: isToday ? PURPLE : MUT, fontWeight: isToday ? 700 : 400 }}>{d.count || 0}</div>
              <div style={{
                width:"100%", height:`${h}px`,
                background: isToday ? PURPLE : `${PURPLE}66`,
                borderRadius:"3px 3px 0 0",
              }}/>
              <div style={{ fontSize:7, color:MUT }}>{date.slice(8)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GratitudeJournal({ lang, onCoinsEarned, user }) {
  const L = lang === "en";
  const prompts = L ? GRATITUDE_PROMPTS_EN : GRATITUDE_PROMPTS_FR;
  const [promptIdx] = useState(() => Math.floor(Math.random() * prompts.length));
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vs_gratitude_v1") || "[]"); }
    catch { return []; }
  });

  const todayKey = getTodayKey();
  const alreadyDoneToday = entries.some(e => e.date === todayKey);

  const submit = () => {
    if (!text.trim() || alreadyDoneToday) return;
    const ne = [{ date: todayKey, text: text.trim(), prompt: prompts[promptIdx] }, ...entries].slice(0, 60);
    setEntries(ne);
    localStorage.setItem("vs_gratitude_v1", JSON.stringify(ne));
    setSaved(true);
    setText("");
    if (onCoinsEarned && user?.uid && !user?.isDemo) onCoinsEarned(15);
  };

  return (
    <div style={{ background: CARD, border: `1.5px solid ${GOLD}33`, borderRadius: 20, padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize:11, color:GOLD, fontWeight:700, letterSpacing:.8, marginBottom:14 }}>
        📖 {L ? "DAILY GRATITUDE" : "GRATITUDE QUOTIDIENNE"}
      </div>

      {alreadyDoneToday ? (
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
          <div style={{ color:EM, fontSize:13, fontWeight:700 }}>{L ? "Done for today!" : "Fait pour aujourd'hui !"}</div>
          <div style={{ color:MUT, fontSize:11, marginTop:4 }}>{L ? "Come back tomorrow" : "Reviens demain"}</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize:13, color:"#edf5ef", marginBottom:12, lineHeight:1.6, fontStyle:"italic" }}>
            {prompts[promptIdx]}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={L ? "Write a few words..." : "Écris quelques mots..."}
            rows={3}
            style={{
              width:"100%", background:"#0a0f0a", border:`1px solid ${BDR}`, borderRadius:10,
              padding:"10px 12px", color:"#edf5ef", fontSize:13, fontFamily:"'Outfit',sans-serif",
              resize:"none", marginBottom:10, boxSizing:"border-box",
            }}
          />
          <button onClick={submit} disabled={!text.trim()} style={{
            width:"100%", background: text.trim() ? `linear-gradient(135deg,${GOLD},#c49a2e)` : "#1a2a1e",
            color: text.trim() ? "#080400" : MUT, border:"none", borderRadius:12, padding:"12px",
            fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700,
            cursor: text.trim() ? "pointer" : "not-allowed",
          }}>
            ✍️ {L ? "Save (+15 🪙)" : "Sauvegarder (+15 🪙)"}
          </button>
        </>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${BDR}` }}>
          <div style={{ fontSize:10, color:MUT, fontWeight:700, marginBottom:8 }}>{L ? "RECENT ENTRIES" : "ENTRÉES RÉCENTES"}</div>
          {entries.slice(0, 3).map((e, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 8 : 0, fontSize:11, color:"#a0c8a8", lineHeight:1.5 }}>
              <span style={{ color:GOLD, fontWeight:700 }}>{e.date.slice(5)}</span> — {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModuleRichesse({ onBack, lang, onCoinsEarned, user }) {
  const L = lang === "en";
  const [tab, setTab] = useState("compteur"); // compteur | cles | gratitude

  return (
    <div style={{ minHeight:"100vh", paddingBottom:90, overflowY:"auto", background:"#060d08" }}>
      <div style={{ padding:"52px 20px 20px", background:`radial-gradient(ellipse at 50% 0%,${PURPLE}15 0%,#060d08 65%)` }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:13, marginBottom:16, display:"block" }}>
          ← {L ? "Back" : "Retour"}
        </button>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🌙</div>
          <div className="serif" style={{ fontSize:24, fontWeight:700, color:"#edf5ef", marginBottom:6 }}>
            {L ? "Spiritual Keys to Wealth" : "Clés Spirituelles de la Richesse"}
          </div>
          <div style={{ color:MUT, fontSize:12, lineHeight:1.6, maxWidth:280, margin:"0 auto" }}>
            {L
              ? "Istighfar, gratitude, and trust in Allah — the keys that open doors."
              : "Istighfar, gratitude, et confiance en Allah — les clés qui ouvrent les portes."}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            ["compteur", "🤲", L ? "Counter" : "Compteur"],
            ["cles", "🔑", L ? "Keys" : "Clés"],
            ["gratitude", "📖", L ? "Gratitude" : "Gratitude"],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? `${PURPLE}20` : CARD,
              border: `1.5px solid ${tab === id ? PURPLE : BDR}`,
              borderRadius:14, padding:"10px 4px", cursor:"pointer", textAlign:"center",
              fontFamily:"'Outfit',sans-serif",
            }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
              <div style={{ fontSize:10, fontWeight: tab === id ? 700 : 400, color: tab === id ? PURPLE : MUT }}>{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 18px" }}>
        {tab === "compteur" && (
          <>
            <AstaghfirullahCounter lang={lang} onCoinsEarned={onCoinsEarned} user={user} />
            <ProgressionChart lang={lang} />
            <div style={{ background:"#1a1005", border:`1px solid ${GOLD}22`, borderRadius:14, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:10, color:GOLD, fontWeight:700, marginBottom:6 }}>🌙 TIBB AN-NABAWI</div>
              <div style={{ fontSize:12, color:"#a08040", lineHeight:1.7 }}>
                {L
                  ? "The Prophet ﷺ said: \"Whoever constantly seeks forgiveness, Allah will appoint for him a way out of every distress, relief from every anxiety, and will provide for him from where he does not expect.\""
                  : "Le Prophète ﷺ a dit : « Quiconque persiste dans l'istighfar, Allah lui accordera une issue à chaque difficulté, un soulagement à chaque angoisse, et le pourvoira de là où il ne s'y attend pas. »"}
              </div>
            </div>
          </>
        )}

        {tab === "cles" && (
          <div style={{ paddingTop:8 }}>
            {CLES_RICHESSE.map((cle, i) => (
              <div key={i} style={{ background:CARD, border:`1px solid ${BDR}`, borderRadius:16, padding:16, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{cle.icon}</span>
                  <div style={{ fontWeight:700, fontSize:14, color:EM }}>{L ? cle.titleEn : cle.titleFr}</div>
                </div>
                <div style={{ fontSize:13, color:"#a0c8a8", lineHeight:1.7, fontStyle:"italic", marginBottom:8 }}>
                  {L ? cle.textEn : cle.textFr}
                </div>
                <div style={{ fontSize:10, color:MUT }}>— {L ? cle.refEn : cle.refFr}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "gratitude" && (
          <div style={{ paddingTop:8 }}>
            <GratitudeJournal lang={lang} onCoinsEarned={onCoinsEarned} user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

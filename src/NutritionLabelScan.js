// ============================================================
// VITASCANN — NutritionLabelScan.js
// ✅ Photo d'étiquette nutritionnelle → analyse IA complète
// ✅ Score global 0-100 (Excellent / Bon / Passable / Éviter)
// ✅ Analyse sucres, graisses, protéines, sel, additifs
// ✅ Alertes rouges pour ingrédients problématiques
// ✅ Tips personnalisés + alternatives saines
// ✅ Tibb an-Nabawi (aliments halal/tayyib)
// ✅ Bilingue FR / EN
// ============================================================

import { useState, useRef, useCallback } from "react";

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

function getScoreColor(score) {
  if (score >= 75) return "#00ff88";
  if (score >= 50) return "#fbbf24";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}
function getScoreLabel(score, L) {
  if (score >= 75) return L ? "Excellent" : "Excellent";
  if (score >= 50) return L ? "Acceptable" : "Acceptable";
  if (score >= 25) return L ? "Be careful" : "À limiter";
  return L ? "Avoid" : "À éviter";
}
function getScoreEmoji(score) {
  if (score >= 75) return "✅";
  if (score >= 50) return "⚠️";
  if (score >= 25) return "🔶";
  return "🚫";
}

const SYSTEM_PROMPT_FR = `Tu es l'expert nutrition de VitaScann. On te donne une photo d'étiquette nutritionnelle ou d'ingrédients. Analyse-la et retourne UNIQUEMENT un JSON valide sans markdown :
{
  "produit": "nom du produit si visible",
  "score": number (0-100, basé sur la qualité nutritionnelle globale),
  "verdict": "1 phrase résumant la qualité",
  "pour_100g": {
    "calories": number,
    "proteines": number,
    "glucides": number,
    "sucres": number,
    "lipides": number,
    "graisses_saturees": number,
    "fibres": number,
    "sel": number
  },
  "notes_nutriments": [
    {"nom": "Sucres", "valeur": "X g", "statut": "bon|moyen|mauvais", "commentaire": "phrase courte"}
  ],
  "alertes": ["liste d'ingrédients ou nutriments problématiques"],
  "points_positifs": ["liste de points positifs"],
  "additifs": ["liste d'additifs identifiés (E-numbers, colorants, conservateurs)"],
  "alternatives": ["2-3 alternatives plus saines"],
  "tibb": "conseil islamique/halal si pertinent (ex: présence de porc caché, alcool, gélatine animale, ou conseil tayyib)",
  "pour_qui": "qui devrait éviter ce produit (diabétiques, enfants, etc.)"
}
Si l'image n'est pas une étiquette nutritionnelle, retourne {"erreur": "Pas une étiquette nutritionnelle"}.`;

const SYSTEM_PROMPT_EN = `You are VitaScann's nutrition expert. You receive a photo of a nutritional label or ingredients list. Analyze it and return ONLY valid JSON without markdown:
{
  "produit": "product name if visible",
  "score": number (0-100, based on overall nutritional quality),
  "verdict": "1 sentence summarizing quality",
  "pour_100g": {
    "calories": number,
    "proteines": number,
    "glucides": number,
    "sucres": number,
    "lipides": number,
    "graisses_saturees": number,
    "fibres": number,
    "sel": number
  },
  "notes_nutriments": [
    {"nom": "Sugars", "valeur": "X g", "statut": "bon|moyen|mauvais", "commentaire": "short sentence"}
  ],
  "alertes": ["list of problematic ingredients or nutrients"],
  "points_positifs": ["list of positive points"],
  "additifs": ["list of identified additives (E-numbers, colorants, preservatives)"],
  "alternatives": ["2-3 healthier alternatives"],
  "tibb": "Islamic/halal advice if relevant (e.g. hidden pork, alcohol, animal gelatin, or tayyib advice)",
  "pour_qui": "who should avoid this product (diabetics, children, etc.)"
}
If the image is not a nutritional label, return {"erreur": "Not a nutritional label"}.`;

export default function NutritionLabelScan({ onBack, lang }) {
  const L = lang === "en";
  const [screen, setScreen]     = useState("home"); // home | capture | analyzing | result | error
  const [preview, setPreview]   = useState(null);
  const [b64, setB64]           = useState(null);
  const [result, setResult]     = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef                 = useRef(null);
  const cameraRef               = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      setB64(dataUrl.split(",")[1]);
      setScreen("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = useCallback(async () => {
    if (!b64) return;
    setScreen("analyzing");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: L ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_FR,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
              { type: "text", text: L ? "Analyze this nutritional label." : "Analyse cette étiquette nutritionnelle." }
            ]
          }]
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (parsed.erreur) { setErrorMsg(parsed.erreur); setScreen("error"); return; }
      setResult(parsed);
      setScreen("result");
    } catch (e) {
      console.error(e);
      setErrorMsg(L ? "Analysis error. Please try again." : "Erreur d'analyse. Réessaye.");
      setScreen("error");
    }
  }, [b64, L]);

  // ─── HOME ───
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "#060d08", overflowY: "auto" }}>
      <div style={{ padding: "52px 22px 28px", background: "radial-gradient(ellipse at 50% 0%,#0a2800 0%,#060d08 65%)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 52, left: 20, background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13 }}>← {L ? "Back" : "Retour"}</button>
        <div style={{ textAlign: "center", paddingTop: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${EM}10`, border: `1px solid ${EM}33`, borderRadius: 20, padding: "5px 14px", marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: EM, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: EM, letterSpacing: 1 }}>{L ? "NUTRITION SCAN" : "SCAN NUTRITIONNEL"}</span>
          </div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12, color: "#edf5ef" }}>
            {L ? "Scan your food label" : "Scanne ton étiquette"}
          </div>
          <div style={{ color: MUT, fontSize: 13, lineHeight: 1.7, maxWidth: 300, margin: "0 auto 28px" }}>
            {L ? "Take a photo of any nutritional label. AI analyzes the quality and tells you if it's good for you." : "Prends une photo de n'importe quelle étiquette. L'IA analyse la qualité et te dit si c'est bon pour toi."}
          </div>

          {/* Score exemple */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
            {[
              { score: 85, label: L ? "Excellent" : "Excellent", color: "#00ff88" },
              { score: 55, label: L ? "Acceptable" : "Acceptable", color: "#fbbf24" },
              { score: 15, label: L ? "Avoid" : "À éviter", color: "#ef4444" },
            ].map(({ score, label, color }, i) => (
              <div key={i} style={{ background: `${color}10`, border: `1px solid ${color}33`, borderRadius: 14, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontWeight: 700, fontSize: 20, color }}>{score}</div>
                <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {/* CTA Caméra */}
        <button onClick={() => cameraRef.current?.click()}
          style={{ width: "100%", background: `linear-gradient(135deg,#0a3020,#0d5030)`, border: `1.5px solid ${EM}44`, borderRadius: 18, padding: "20px", cursor: "pointer", marginBottom: 12, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: EM }}>{L ? "Take a photo" : "Prendre une photo"}</div>
            <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>{L ? "Point at the nutritional label" : "Pointe vers l'étiquette nutritionnelle"}</div>
          </div>
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

        {/* CTA Galerie */}
        <button onClick={() => fileRef.current?.click()}
          style={{ width: "100%", background: CARD, border: `1.5px solid ${BDR}`, borderRadius: 18, padding: "16px", cursor: "pointer", marginBottom: 20, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🖼️</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#edf5ef" }}>{L ? "Choose from gallery" : "Choisir depuis la galerie"}</div>
            <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>{L ? "Select an existing photo" : "Sélectionne une photo existante"}</div>
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

        {/* Ce qu'on analyse */}
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>{L ? "WHAT WE ANALYZE" : "CE QU'ON ANALYSE"}</div>
          {[
            { ic: "🍬", t: L ? "Sugars & carbs" : "Sucres & glucides", s: L ? "Hidden sugars, glycemic index" : "Sucres cachés, index glycémique" },
            { ic: "🧂", t: L ? "Salt & sodium" : "Sel & sodium", s: L ? "Cardiovascular risk" : "Risque cardiovasculaire" },
            { ic: "⚗️", t: L ? "Additives & E-numbers" : "Additifs & E-numbers", s: L ? "Colorants, preservatives, emulsifiers" : "Colorants, conservateurs, émulsifiants" },
            { ic: "💪", t: L ? "Proteins & good fats" : "Protéines & bonnes graisses", s: L ? "Nutritional quality" : "Qualité nutritionnelle" },
            { ic: "🌙", t: L ? "Halal & Tayyib" : "Halal & Tayyib", s: L ? "Hidden pork, alcohol, animal gelatin" : "Porc caché, alcool, gélatine animale" },
          ].map(({ ic, t, s }, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < arr.length - 1 ? 12 : 0, paddingBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${BDR}` : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${EM}10`, border: `1px solid ${EM}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{ic}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#edf5ef" }}>{t}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips photo */}
        <div style={{ background: "#1a1005", border: `1px solid ${GOLD}22`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginBottom: 6 }}>💡 {L ? "TIPS FOR A GOOD PHOTO" : "TIPS POUR UNE BONNE PHOTO"}</div>
          <div style={{ fontSize: 12, color: "#a08040", lineHeight: 1.7 }}>
            {L ? "• Good lighting, no flash\n• Hold still, focus on the label\n• Include the full ingredients list" : "• Bonne lumière, sans flash\n• Tiens stable, focus sur l'étiquette\n• Inclus la liste d'ingrédients complète"}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── PREVIEW ───
  if (screen === "preview") return (
    <div style={{ minHeight: "100vh", background: "#060d08", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 22px 20px" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, marginBottom: 16, display: "block" }}>← {L ? "Retake" : "Recommencer"}</button>
        <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>{L ? "Ready to analyze?" : "Prêt à analyser ?"}</div>
        <div style={{ color: MUT, fontSize: 13 }}>{L ? "Make sure the label is readable" : "Assure-toi que l'étiquette est lisible"}</div>
      </div>
      <div style={{ flex: 1, padding: "0 22px" }}>
        {preview && <img src={preview} alt="label" style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 18, border: `1px solid ${BDR}`, marginBottom: 20 }} />}
        <button onClick={analyze}
          style={{ width: "100%", background: `linear-gradient(135deg,#0a3020,#0d5030)`, border: `1.5px solid ${EM}55`, borderRadius: 18, padding: "18px", fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: EM, cursor: "pointer", marginBottom: 12 }}>
          🔬 {L ? "Analyze this label" : "Analyser cette étiquette"}
        </button>
        <button onClick={() => { cameraRef.current?.click(); }}
          style={{ width: "100%", background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: "14px", fontFamily: "'Outfit',sans-serif", fontSize: 14, color: MUT, cursor: "pointer" }}>
          📷 {L ? "Retake photo" : "Reprendre la photo"}
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>
    </div>
  );

  // ─── ANALYZING ───
  if (screen === "analyzing") return (
    <div style={{ minHeight: "100vh", background: "#060d08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 28 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle,${EM}22 0%,transparent 70%)`, animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>🔬</div>
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: EM, marginBottom: 10 }}>{L ? "Scanning label..." : "Scan de l'étiquette..."}</div>
      <div style={{ color: MUT, fontSize: 13, lineHeight: 1.7 }}>{L ? "AI is analyzing the nutritional values, ingredients and additives." : "L'IA analyse les valeurs nutritives, ingrédients et additifs."}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: EM, animation: `pulse 1.2s ${i * .2}s ease-in-out infinite` }} />)}
      </div>
    </div>
  );

  // ─── ERROR ───
  if (screen === "error") return (
    <div style={{ minHeight: "100vh", background: "#060d08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#ff5555", marginBottom: 8 }}>{L ? "Scan failed" : "Scan échoué"}</div>
      <div style={{ fontSize: 13, color: MUT, marginBottom: 28, lineHeight: 1.6 }}>{errorMsg}</div>
      <button onClick={() => setScreen("home")} style={{ background: `linear-gradient(135deg,#0a3020,#0d5030)`, border: `1.5px solid ${EM}55`, borderRadius: 14, padding: "14px 28px", fontFamily: "'Outfit',sans-serif", fontSize: 15, color: EM, fontWeight: 700, cursor: "pointer" }}>
        {L ? "Try again" : "Réessayer"}
      </button>
    </div>
  );

  // ─── RESULT ───
  if (screen === "result" && result) {
    const scoreColor = getScoreColor(result.score);
    return (
      <div style={{ minHeight: "100vh", paddingBottom: 100, overflowY: "auto", background: "#060d08" }}>
        {/* Hero score */}
        <div style={{ padding: "52px 22px 24px", background: `radial-gradient(ellipse at 50% 0%,${scoreColor}15 0%,#060d08 65%)` }}>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 13, marginBottom: 16, display: "block" }}>← {L ? "New scan" : "Nouveau scan"}</button>

          {result.produit && <div style={{ fontSize: 13, color: MUT, marginBottom: 8 }}>📦 {result.produit}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            {/* Score cercle */}
            <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke={`${scoreColor}22`} strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.score / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 26, color: scoreColor }}>{result.score}</div>
                <div style={{ fontSize: 9, color: MUT }}>/100</div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{getScoreEmoji(result.score)}</span>
                <span className="serif" style={{ fontSize: 24, fontWeight: 700, color: scoreColor }}>{getScoreLabel(result.score, L)}</span>
              </div>
              <div style={{ fontSize: 13, color: "#a0c8a8", lineHeight: 1.6, maxWidth: 220 }}>{result.verdict}</div>
            </div>
          </div>

          {/* Preview image petite */}
          {preview && <img src={preview} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 14, opacity: .7 }} />}
        </div>

        <div style={{ padding: "0 20px" }}>

          {/* Alertes rouges */}
          {result.alertes?.length > 0 && (
            <div style={{ background: "#2a0505", border: "1.5px solid #ef444444", borderRadius: 18, padding: 18, marginTop: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>🚨 {L ? "ALERTS" : "ALERTES"}</div>
              {result.alertes.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < result.alertes.length - 1 ? 8 : 0 }}>
                  <span style={{ color: "#ef4444", fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <span style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Valeurs pour 100g */}
          {result.pour_100g && (
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 14, marginTop: result.alertes?.length > 0 ? 0 : 16 }}>
              <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>{L ? "PER 100g" : "POUR 100g"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: L ? "Calories" : "Calories", val: result.pour_100g.calories, unit: "kcal", color: "#f97316" },
                  { label: L ? "Proteins" : "Protéines", val: result.pour_100g.proteines, unit: "g", color: "#60a5fa" },
                  { label: L ? "Carbs" : "Glucides", val: result.pour_100g.glucides, unit: "g", color: "#fbbf24" },
                  { label: L ? "Sugars" : "Sucres", val: result.pour_100g.sucres, unit: "g", color: result.pour_100g.sucres > 10 ? "#ef4444" : "#fbbf24" },
                  { label: L ? "Fat" : "Lipides", val: result.pour_100g.lipides, unit: "g", color: "#a3e635" },
                  { label: L ? "Sat. fat" : "G. saturées", val: result.pour_100g.graisses_saturees, unit: "g", color: result.pour_100g.graisses_saturees > 5 ? "#f97316" : "#a3e635" },
                  { label: L ? "Fiber" : "Fibres", val: result.pour_100g.fibres, unit: "g", color: EM },
                  { label: L ? "Salt" : "Sel", val: result.pour_100g.sel, unit: "g", color: result.pour_100g.sel > 1.5 ? "#ef4444" : "#c0c0c0" },
                ].map(({ label, val, unit, color }, i) => (
                  <div key={i} style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: MUT, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color }}>
                      {val != null ? val : "—"}<span style={{ fontSize: 11, fontWeight: 400 }}> {unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes par nutriment */}
          {result.notes_nutriments?.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 14 }}>{L ? "NUTRIENT ANALYSIS" : "ANALYSE DES NUTRIMENTS"}</div>
              {result.notes_nutriments.map((n, i) => {
                const c = n.statut === "bon" ? EM : n.statut === "moyen" ? "#fbbf24" : "#ef4444";
                const emoji = n.statut === "bon" ? "✅" : n.statut === "moyen" ? "⚠️" : "🚫";
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < result.notes_nutriments.length - 1 ? 12 : 0, paddingBottom: i < result.notes_nutriments.length - 1 ? 12 : 0, borderBottom: i < result.notes_nutriments.length - 1 ? `1px solid ${BDR}` : "none" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: c }}>{n.nom}</span>
                        <span style={{ fontSize: 12, color: c, fontWeight: 600 }}>{n.valeur}</span>
                      </div>
                      <div style={{ fontSize: 11, color: MUT, marginTop: 3, lineHeight: 1.5 }}>{n.commentaire}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Points positifs */}
          {result.points_positifs?.length > 0 && (
            <div style={{ background: `${EM}06`, border: `1px solid ${EM}22`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>✅ {L ? "POSITIVE POINTS" : "POINTS POSITIFS"}</div>
              {result.points_positifs.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < result.points_positifs.length - 1 ? 6 : 0 }}>
                  <span style={{ color: EM, fontSize: 12 }}>→</span>
                  <span style={{ fontSize: 12, color: "#a0c8a8", lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* Additifs */}
          {result.additifs?.length > 0 && (
            <div style={{ background: "#1a0a00", border: "1px solid #f9731633", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>⚗️ {L ? "ADDITIVES DETECTED" : "ADDITIFS DÉTECTÉS"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.additifs.map((a, i) => (
                  <span key={i} style={{ background: "#f9731610", border: "1px solid #f9731633", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#f97316" }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tibb */}
          {result.tibb && (
            <div style={{ background: "#1a1005", border: `1px solid ${GOLD}22`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginBottom: 6 }}>🌙 TIBB AN-NABAWI & HALAL</div>
              <div style={{ fontSize: 12, color: "#a08040", lineHeight: 1.7 }}>{result.tibb}</div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: MUT, fontWeight: 700, letterSpacing: .8, marginBottom: 10 }}>🔄 {L ? "HEALTHIER ALTERNATIVES" : "ALTERNATIVES PLUS SAINES"}</div>
              {result.alternatives.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: i < result.alternatives.length - 1 ? 8 : 0 }}>
                  <span style={{ fontSize: 14 }}>🌿</span>
                  <span style={{ fontSize: 13, color: "#a0c8a8" }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pour qui éviter */}
          {result.pour_qui && (
            <div style={{ background: "#1a0a1a", border: "1px solid #c084fc22", borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#c084fc", fontWeight: 700, marginBottom: 6 }}>👥 {L ? "WHO SHOULD AVOID IT" : "QUI DEVRAIT L'ÉVITER"}</div>
              <div style={{ fontSize: 12, color: "#b090d0", lineHeight: 1.7 }}>{result.pour_qui}</div>
            </div>
          )}

          {/* Nouveau scan */}
          <button onClick={() => { setScreen("home"); setResult(null); setPreview(null); setB64(null); }}
            style={{ width: "100%", background: `linear-gradient(135deg,#0a3020,#0d5030)`, border: `1.5px solid ${EM}44`, borderRadius: 18, padding: "16px", fontFamily: "'Outfit',sans-serif", fontSize: 15, color: EM, fontWeight: 700, cursor: "pointer" }}>
            🔬 {L ? "Scan another label" : "Scanner une autre étiquette"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

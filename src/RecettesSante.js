// ============================================================
// VITASCANN — RecettesSante.js
// ✅ Recettes de grand-mère — combinaisons naturelles
// ✅ Catégories : Vue, Digestion, Circulation, Énergie, etc.
// ✅ Premium gated
// ✅ Bilingue FR / EN
// ============================================================

import { useState } from "react";
import { RECETTES } from "./recettesData";

const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

const CATEGORIES = [
  { id: "all",      label_fr: "Tout",        label_en: "All",         emoji: "🌿" },
  { id: "vue",      label_fr: "Vue",         label_en: "Vision",      emoji: "👁️" },
  { id: "digestion",label_fr: "Digestion",   label_en: "Digestion",   emoji: "🫁" },
  { id: "coeur",    label_fr: "Cœur",        label_en: "Heart",       emoji: "❤️" },
  { id: "energie",  label_fr: "Énergie",     label_en: "Energy",      emoji: "⚡" },
  { id: "immunite", label_fr: "Immunité",    label_en: "Immunity",    emoji: "🛡️" },
  { id: "drainage", label_fr: "Drainage",    label_en: "Drainage",    emoji: "💧" },
  { id: "glycemie", label_fr: "Glycémie",    label_en: "Blood Sugar", emoji: "🩸" },
  { id: "cerveau",  label_fr: "Cerveau",     label_en: "Brain",       emoji: "🧠" },
  { id: "mineraux", label_fr: "Minéraux",    label_en: "Minerals",    emoji: "⛰️" },
  { id: "fertilite",label_fr: "Fertilité",   label_en: "Fertility",   emoji: "👶" },
];

export default function RecettesSante({ onBack, user, onPaywall, lang }) {
  const L = lang === "en";
  const [categorie, setCategorie] = useState("all");
  const [selected, setSelected] = useState(null);

  if (user?.plan !== "premium" && !user?.isDemo) return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",display:"flex",flexDirection:"column",background:"#060d08"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:32}}>← {L?"Back":"Retour"}</button>
      <div style={{textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:64,marginBottom:16}}>🌿</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:GOLD,marginBottom:8}}>
          {L?"Grandma's Recipes":"Recettes de Grand-Mère"}
        </div>
        <div style={{color:MUT,fontSize:14,marginBottom:8,maxWidth:280,lineHeight:1.7}}>
          {L?"Natural ingredient combinations used for centuries to boost health, naturally.":"Des combinaisons d'ingrédients naturels utilisées depuis des siècles pour booster la santé."}
        </div>
        <div style={{color:"#4a6e52",fontSize:12,marginBottom:28,maxWidth:260,lineHeight:1.6,fontStyle:"italic"}}>
          {L?"12 recipes + Tibb an-Nabawi wisdom":"12 recettes + sagesse Tibb an-Nabawi"}
        </div>
        <button style={{background:`linear-gradient(135deg,${GOLD},#f59e0b)`,border:"none",borderRadius:18,padding:"16px 32px",color:"#0a0a0a",fontSize:15,fontWeight:700,cursor:"pointer"}} onClick={onPaywall}>
          ✨ {L?"Unlock Premium — 9.99$/month":"Débloquer Premium — 9,99$/mois"}
        </button>
      </div>
    </div>
  );

  const filtered = categorie === "all" ? RECETTES : RECETTES.filter(r => r.categorie === categorie);

  // ── DÉTAIL RECETTE ──
  if (selected) {
    const r = selected;
    return (
      <div style={{minHeight:"100vh",background:"#060d08",overflowY:"auto",paddingBottom:40}}>
        {/* Header */}
        <div style={{padding:"52px 22px 24px",background:`radial-gradient(ellipse at 50% 0%, ${r.couleur}18 0%, #060d08 70%)`}}>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>← {L?"Back":"Retour"}</button>
          <div style={{fontSize:52,marginBottom:12,textAlign:"center"}}>{r.emoji}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:GOLD,textAlign:"center",marginBottom:8}}>
            {L ? r.titre_en : r.titre_fr}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:16}}>
            {r.ingredients.map((ing,i)=>(
              <span key={i} style={{background:`${r.couleur}18`,border:`1px solid ${r.couleur}44`,borderRadius:20,padding:"4px 12px",fontSize:12,color:r.couleur,fontWeight:600}}>
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div style={{padding:"0 20px"}}>
          {/* Bienfait principal */}
          <div style={{background:`${r.couleur}10`,border:`1.5px solid ${r.couleur}33`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:r.couleur,fontWeight:700,letterSpacing:.8,marginBottom:8}}>✨ {L?"MAIN BENEFIT":"BIENFAIT PRINCIPAL"}</div>
            <div style={{fontSize:15,color:"#e8f5ea",lineHeight:1.7,fontWeight:500}}>{L ? r.bienfait_en : r.bienfait_fr}</div>
          </div>

          {/* Explication scientifique */}
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:8}}>🔬 {L?"HOW IT WORKS":"COMMENT ÇA MARCHE"}</div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.7}}>{L ? r.detail_en : r.detail_fr}</div>
          </div>

          {/* Nutriments clés */}
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:12}}>💊 {L?"KEY NUTRIENTS":"NUTRIMENTS CLÉS"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {r.nutrients.map((n,i)=>(
                <span key={i} style={{background:`${EM}10`,border:`1px solid ${EM}30`,borderRadius:20,padding:"5px 12px",fontSize:12,color:EM,fontWeight:600}}>
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Préparation */}
          <div style={{background:"#0a1a0e",border:`1.5px solid ${GOLD}33`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:.8,marginBottom:8}}>👩‍🍳 {L?"PREPARATION":"PRÉPARATION"}</div>
            <div style={{fontSize:13,color:"#c8a84a",lineHeight:1.8}}>{L ? r.preparation_en : r.preparation_fr}</div>
          </div>

          {/* Tibb an-Nabawi */}
          <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:.8,marginBottom:8}}>🌙 TIBB AN-NABAWI</div>
            <div style={{fontSize:12,color:"#a08040",lineHeight:1.8,fontStyle:"italic"}}>{L ? r.tibb_en : r.tibb_fr}</div>
          </div>

          {/* Attention (si présent) */}
          {r.attention_fr && (
            <div style={{background:"#ff555510",border:"1px solid #ff555533",borderRadius:14,padding:14,marginBottom:20}}>
              <div style={{fontSize:12,color:"#ff8888",lineHeight:1.6}}>⚠️ {L ? r.attention_en : r.attention_fr}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LISTE RECETTES ──
  return (
    <div style={{minHeight:"100vh",background:"#060d08",overflowY:"auto",paddingBottom:40}}>
      {/* Header */}
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%, ${GOLD}12 0%, #060d08 70%)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>← {L?"Back":"Retour"}</button>
        <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>🌿 {L?"PREMIUM":"PREMIUM"}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:GOLD,marginBottom:6}}>
          {L?"Grandma's Recipes":"Recettes de Grand-Mère"}
        </div>
        <div style={{color:MUT,fontSize:13,lineHeight:1.6}}>
          {L?"Natural combinations used for centuries":"Des combinaisons naturelles éprouvées depuis des siècles"}
        </div>
      </div>

      {/* Filtre catégories */}
      <div style={{padding:"0 22px 16px",overflowX:"auto"}}>
        <div style={{display:"flex",gap:8,paddingBottom:4}}>
          {CATEGORIES.map(cat=>(
            <button key={cat.id} onClick={()=>setCategorie(cat.id)}
              style={{
                background: categorie===cat.id ? `linear-gradient(135deg,${GOLD},#f59e0b)` : CARD,
                border: categorie===cat.id ? "none" : `1px solid ${BDR}`,
                borderRadius:20, padding:"7px 14px", cursor:"pointer", whiteSpace:"nowrap",
                color: categorie===cat.id ? "#0a0a0a" : MUT,
                fontSize:12, fontWeight: categorie===cat.id ? 700 : 400,
                fontFamily:"'Outfit',sans-serif"
              }}>
              {cat.emoji} {L ? cat.label_en : cat.label_fr}
            </button>
          ))}
        </div>
      </div>

      {/* Grille recettes */}
      <div style={{padding:"0 18px",display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(r=>(
          <button key={r.id} onClick={()=>setSelected(r)}
            style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:20,padding:"18px 16px",cursor:"pointer",textAlign:"left",display:"flex",gap:14,alignItems:"flex-start",fontFamily:"'Outfit',sans-serif"}}>
            {/* Emoji grand */}
            <div style={{fontSize:40,lineHeight:1,flexShrink:0}}>{r.emoji}</div>
            <div style={{flex:1}}>
              {/* Titre */}
              <div style={{fontWeight:700,fontSize:15,color:GOLD,marginBottom:4}}>{L ? r.titre_en : r.titre_fr}</div>
              {/* Ingrédients */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                {r.ingredients.map((ing,i)=>(
                  <span key={i} style={{background:`${r.couleur}15`,borderRadius:12,padding:"2px 8px",fontSize:11,color:r.couleur,fontWeight:600}}>
                    {ing}
                  </span>
                ))}
              </div>
              {/* Bienfait court */}
              <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>
                {(L ? r.bienfait_en : r.bienfait_fr).slice(0, 70)}...
              </div>
            </div>
            <div style={{color:MUT,fontSize:18,flexShrink:0,alignSelf:"center"}}>›</div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <div style={{padding:"20px 22px 0",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#2a4a32",lineHeight:1.6}}>
          {L?"These recipes are traditional wellness tips, not medical advice.":"Ces recettes sont des conseils bien-être traditionnels, pas un avis médical."}
        </div>
      </div>
    </div>
  );
}

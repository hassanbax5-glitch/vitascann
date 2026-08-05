// ============================================================
// VITASCANN — RecettesSante.js
// ✅ Recettes de grand-mère — combinaisons naturelles
// ✅ Catégories : Vue, Digestion, Circulation, Énergie, etc.
// ✅ Premium gated
// ✅ Bilingue FR / EN
// ============================================================

import { useState } from "react";

const EM   = "#00ff88";
const GOLD = "#e2b84a";
const MUT  = "#4a6e52";
const CARD = "#0c1810";
const BDR  = "#192c1d";

const RECETTES = [
  {
    id: 1,
    emoji: "🥕🍊",
    ingredients: ["Carotte", "Orange"],
    titre_fr: "Vision & Antioxydants",
    titre_en: "Vision & Antioxidants",
    bienfait_fr: "Soutient la vue et apporte une grande quantité d'antioxydants protecteurs.",
    bienfait_en: "Supports vision and delivers powerful antioxidant protection.",
    detail_fr: "La bêta-carotène de la carotte + la vitamine C de l'orange forment un duo imbattable pour la santé oculaire et la neutralisation des radicaux libres.",
    detail_en: "Beta-carotene from carrot + vitamin C from orange create an unbeatable duo for eye health and free radical neutralization.",
    nutrients: ["Bêta-carotène", "Vit. C", "Vit. A"],
    categorie: "vue",
    couleur: "#f97316",
    preparation_fr: "Presser 2 carottes + 1 orange. Boire le matin à jeun.",
    preparation_en: "Juice 2 carrots + 1 orange. Drink in the morning on an empty stomach.",
    tibb_fr: "La carotte est mentionnée comme légume bénéfique dans la médecine prophétique.",
    tibb_en: "Carrots are mentioned as a beneficial vegetable in prophetic medicine.",
  },
  {
    id: 2,
    emoji: "🍏🫚",
    ingredients: ["Pomme verte", "Cannelle"],
    titre_fr: "Glycémie & Équilibre",
    titre_en: "Blood Sugar & Balance",
    bienfait_fr: "Aide à mieux réguler la glycémie et limite les pics de sucre.",
    bienfait_en: "Helps regulate blood sugar and limits sugar spikes.",
    detail_fr: "Les polyphénols de la pomme ralentissent l'absorption du sucre, tandis que la cannelle améliore la sensibilité à l'insuline.",
    detail_en: "Polyphenols in apple slow sugar absorption, while cinnamon improves insulin sensitivity.",
    nutrients: ["Polyphénols", "Fibres", "Cinnamaldéhyde"],
    categorie: "glycemie",
    couleur: "#a3e635",
    preparation_fr: "Couper une pomme verte en tranches, saupoudrer de cannelle. Consommer en collation.",
    preparation_en: "Slice a green apple, sprinkle with cinnamon. Eat as a snack.",
    tibb_fr: "La cannelle (qirfa) est recommandée par le Prophète ﷺ pour ses vertus digestives.",
    tibb_en: "Cinnamon (qirfa) is recommended by the Prophet ﷺ for its digestive benefits.",
  },
  {
    id: 3,
    emoji: "🍍🫚",
    ingredients: ["Ananas", "Gingembre"],
    titre_fr: "Digestion & Anti-ballonnement",
    titre_en: "Digestion & Anti-bloating",
    bienfait_fr: "Favorise la digestion et aide à soulager les ballonnements.",
    bienfait_en: "Promotes digestion and helps relieve bloating.",
    detail_fr: "La bromélaïne de l'ananas est une enzyme digestive puissante. Le gingembre stimule les sucs gastriques et réduit l'inflammation intestinale.",
    detail_en: "Bromelain from pineapple is a powerful digestive enzyme. Ginger stimulates gastric juices and reduces intestinal inflammation.",
    nutrients: ["Bromélaïne", "Gingérols", "Vit. B1"],
    categorie: "digestion",
    couleur: "#fbbf24",
    preparation_fr: "Mixer 2 tranches d'ananas + 1 cm de gingembre frais + 200ml d'eau. Boire après le repas.",
    preparation_en: "Blend 2 pineapple slices + 1 cm fresh ginger + 200ml water. Drink after meals.",
    tibb_fr: "Le gingembre (zanjabīl) est cité dans le Coran (76:17) et recommandé pour la digestion.",
    tibb_en: "Ginger (zanjabīl) is mentioned in the Quran (76:17) and recommended for digestion.",
  },
  {
    id: 4,
    emoji: "🌿🍋",
    ingredients: ["Épinard", "Citron"],
    titre_fr: "Fer & Anti-fatigue",
    titre_en: "Iron & Anti-fatigue",
    bienfait_fr: "Apporte du fer et aide à combattre la fatigue chronique.",
    bienfait_en: "Provides iron and helps fight chronic fatigue.",
    detail_fr: "La vitamine C du citron multiplie par 3 l'absorption du fer non-héminique des épinards. Combo essentiel contre l'anémie.",
    detail_en: "Vitamin C from lemon triples the absorption of non-heme iron from spinach. Essential combo against anemia.",
    nutrients: ["Fer", "Vit. C", "Folates", "Magnésium"],
    categorie: "energie",
    couleur: "#00ff88",
    preparation_fr: "Smoothie : 2 poignées d'épinards + jus d'1 citron + 250ml d'eau. Ne pas cuire les épinards.",
    preparation_en: "Smoothie: 2 handfuls of spinach + juice of 1 lemon + 250ml water. Do not cook the spinach.",
    tibb_fr: "La consommation de légumes verts feuillus est encouragée dans la Sunnah pour maintenir la santé.",
    tibb_en: "Consuming leafy green vegetables is encouraged in the Sunnah to maintain health.",
  },
  {
    id: 5,
    emoji: "🫀🍎",
    ingredients: ["Betterave", "Grenade"],
    titre_fr: "Circulation & Cœur",
    titre_en: "Circulation & Heart",
    bienfait_fr: "Soutient la circulation sanguine et aide à protéger le cœur.",
    bienfait_en: "Supports blood circulation and helps protect the heart.",
    detail_fr: "Les nitrates de la betterave dilatent les vaisseaux et réduisent la pression artérielle. Les polyphénols de la grenade protègent les artères.",
    detail_en: "Nitrates in beet dilate vessels and reduce blood pressure. Pomegranate polyphenols protect arteries.",
    nutrients: ["Nitrates", "Polyphénols", "Vit. B9", "Potassium"],
    categorie: "coeur",
    couleur: "#f43f5e",
    preparation_fr: "Jus : 1 betterave crue + graines d'1/2 grenade. Presser ou mixer.",
    preparation_en: "Juice: 1 raw beet + seeds from 1/2 pomegranate. Press or blend.",
    tibb_fr: "La grenade (rumman) est mentionnée 3 fois dans le Coran. Ibn Al-Qayyim la recommande pour le cœur.",
    tibb_en: "Pomegranate (rumman) is mentioned 3 times in the Quran. Ibn Al-Qayyim recommends it for the heart.",
  },
  {
    id: 6,
    emoji: "🌶️🍋🥒",
    ingredients: ["Gingembre", "Citron", "Concombre"],
    titre_fr: "Anti-inflammation & Immunité",
    titre_en: "Anti-inflammation & Immunity",
    bienfait_fr: "Aide à lutter contre l'inflammation et soutient les défenses naturelles.",
    bienfait_en: "Helps fight inflammation and supports natural defenses.",
    detail_fr: "Le gingembre inhibe les cytokines pro-inflammatoires. Le citron alcalinise et apporte la vit. C. Le concombre hydrate et apporte des minéraux.",
    detail_en: "Ginger inhibits pro-inflammatory cytokines. Lemon alkalizes and provides vitamin C. Cucumber hydrates and provides minerals.",
    nutrients: ["Gingérols", "Vit. C", "Silice", "Eau"],
    categorie: "immunite",
    couleur: "#38bdf8",
    preparation_fr: "Eau détox : 500ml d'eau + 1/2 concombre en rondelles + jus de citron + 3 rondelles de gingembre. Infuser 2h au frigo.",
    preparation_en: "Detox water: 500ml water + 1/2 sliced cucumber + lemon juice + 3 ginger slices. Infuse 2h in fridge.",
    tibb_fr: "Le gingembre est décrit dans la médecine prophétique comme 'chaud et humide' — parfait pour l'hiver.",
    tibb_en: "Ginger is described in prophetic medicine as 'hot and moist' — perfect for winter.",
  },
  {
    id: 7,
    emoji: "🥒🌿",
    ingredients: ["Concombre", "Céleri"],
    titre_fr: "Drainage & Rétention d'eau",
    titre_en: "Drainage & Water Retention",
    bienfait_fr: "Favorise l'élimination de l'excès d'eau et aide contre la rétention.",
    bienfait_en: "Promotes elimination of excess water and helps against water retention.",
    detail_fr: "Le concombre (96% d'eau) et le céleri ont des propriétés diurétiques naturelles. Ils stimulent les reins sans les fatiguer.",
    detail_en: "Cucumber (96% water) and celery have natural diuretic properties. They stimulate the kidneys without tiring them.",
    nutrients: ["Eau", "Potassium", "Manganèse", "Vit. K"],
    categorie: "drainage",
    couleur: "#6ee7b7",
    preparation_fr: "Jus vert : 1 concombre + 3 branches de céleri. Presser et boire immédiatement.",
    preparation_en: "Green juice: 1 cucumber + 3 celery stalks. Press and drink immediately.",
    tibb_fr: "Le concombre (qiththāʾ) est mentionné dans un hadith où le Prophète ﷺ le consommait avec des dattes.",
    tibb_en: "Cucumber (qiththāʾ) is mentioned in a hadith where the Prophet ﷺ ate it with dates.",
  },
  {
    id: 8,
    emoji: "🫐🥛",
    ingredients: ["Myrtilles", "Lait d'amande"],
    titre_fr: "Mémoire & Cerveau",
    titre_en: "Memory & Brain",
    bienfait_fr: "Améliore la concentration et protège les cellules du cerveau.",
    bienfait_en: "Improves concentration and protects brain cells.",
    detail_fr: "Les anthocyanes des myrtilles traversent la barrière hémato-encéphalique et réduisent le stress oxydatif neuronal. La vitamine E des amandes complète.",
    detail_en: "Blueberry anthocyanins cross the blood-brain barrier and reduce neuronal oxidative stress. Almond vitamin E completes the action.",
    nutrients: ["Anthocyanes", "Vit. E", "Oméga-3", "Magnésium"],
    categorie: "cerveau",
    couleur: "#818cf8",
    preparation_fr: "Smoothie : 1 poignée de myrtilles + 250ml lait d'amande + 1 c.à.c de miel de Manuka.",
    preparation_en: "Smoothie: 1 handful blueberries + 250ml almond milk + 1 tsp Manuka honey.",
    tibb_fr: "Le miel est cité dans le Coran (16:69) comme guérison pour les hommes. Préférer le miel brut.",
    tibb_en: "Honey is cited in the Quran (16:69) as a healing for people. Prefer raw honey.",
  },
  {
    id: 9,
    emoji: "🧄🍯",
    ingredients: ["Ail", "Miel"],
    titre_fr: "Antibactérien & Immunité",
    titre_en: "Antibacterial & Immunity",
    bienfait_fr: "Puissant combo antibactérien naturel pour booster les défenses.",
    bienfait_en: "Powerful natural antibacterial combo to boost defenses.",
    detail_fr: "L'allicine de l'ail est l'un des antibiotiques naturels les plus puissants. Le miel renforce l'effet et adoucit le goût.",
    detail_en: "Allicin from garlic is one of the most powerful natural antibiotics. Honey enhances the effect and softens the taste.",
    nutrients: ["Allicine", "Peroxyde d'hydrogène", "Zinc", "Sélénium"],
    categorie: "immunite",
    couleur: "#fbbf24",
    preparation_fr: "Écraser 1 gousse d'ail, laisser reposer 10min (active l'allicine), mélanger avec 1 c.à.c de miel. Avaler le matin.",
    preparation_en: "Crush 1 garlic clove, let sit 10min (activates allicin), mix with 1 tsp honey. Take in the morning.",
    tibb_fr: "L'ail (thūm) est mentionné dans la Sunnah. Ibn Sina le recommande pour renforcer l'immunité.",
    tibb_en: "Garlic (thūm) is mentioned in the Sunnah. Ibn Sina recommends it for strengthening immunity.",
  },
];

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
          {L?"9 recipes + Tibb an-Nabawi wisdom":"9 recettes + sagesse Tibb an-Nabawi"}
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
          <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:18,padding:18,marginBottom:20}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:.8,marginBottom:8}}>🌙 TIBB AN-NABAWI</div>
            <div style={{fontSize:12,color:"#a08040",lineHeight:1.8,fontStyle:"italic"}}>{L ? r.tibb_en : r.tibb_fr}</div>
          </div>
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

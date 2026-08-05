// ============================================================
// PATCH App.js — Intégration NutritionLabelScan
// ============================================================

// ─── ÉTAPE 1 — Import (en haut de App.js, après SanteEmotionnelle) ───
import NutritionLabelScan from "./NutritionLabelScan";


// ─── ÉTAPE 2 — Ajouter le bouton dans MealCapture OU dans le Dashboard ───
// Option A : dans le Dashboard, APRÈS le bouton scan repas existant
// Cherche le bouton qui appelle onMealScan et ajoute juste après :

        <button onClick={onNutritionScan}
          style={{width:"100%",background:"linear-gradient(135deg,#0a1a08,#0d2a0a)",border:"1.5px solid #00ff8844",borderRadius:18,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:10,textAlign:"left",fontFamily:"'Outfit',sans-serif"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#00ff8899"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#00ff8844"}>
          <div style={{fontSize:32,flexShrink:0}}>🔬</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:15,color:"#00ff88"}}>
              {lang==="en"?"Nutrition Label Scan":"Scan Étiquette Nutritionnelle"}
            </div>
            <div style={{color:"#4a6e52",fontSize:12,marginTop:2}}>
              {lang==="en"?"Photo → AI analysis + Halal check":"Photo → Analyse IA + Vérif Halal 🌙"}
            </div>
          </div>
          <div style={{fontSize:11,background:"#00ff8820",color:"#00ff88",borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0}}>NEW</div>
        </button>


// ─── ÉTAPE 3 — Ajouter onNutritionScan dans les props Dashboard ───
// Cherche la définition de function Dashboard({...}) et ajoute onNutritionScan après onSanteEmo :
// AVANT : ...onSanteEmo,history...
// APRÈS : ...onSanteEmo,onNutritionScan,history...


// ─── ÉTAPE 4 — Ajouter le screen dans le return de App() ───
// APRÈS la ligne sante_emo, ajoute :
        {screen==="nutrition_scan" && <NutritionLabelScan onBack={()=>setScreen("dashboard")} lang={lang}/>}


// ─── ÉTAPE 5 — Ajouter onNutritionScan sur le composant Dashboard dans le return ───
// Cherche onSanteEmo={()=>setScreen("sante_emo")} et ajoute juste après :
        onNutritionScan={()=>setScreen("nutrition_scan")}

// ============================================================
// PATCH App.js — Intégration SanteEmotionnelle
// Copie SanteEmotionnelle.js dans le même dossier que App.js
// Puis applique les 4 changements ci-dessous dans App.js
// ============================================================

// ─────────────────────────────────────────────
// ÉTAPE 1 — Import en haut de App.js (ligne ~32)
// Ajoute après le dernier import :
// ─────────────────────────────────────────────
import SanteEmotionnelle from "./SanteEmotionnelle";


// ─────────────────────────────────────────────
// ÉTAPE 2 — Dashboard : ajouter le bouton
// Dans la fonction Dashboard, après le bouton Longévité Articulaire
// (cherche "Longévité Articulaire" dans le code), ajoute CE bouton JUSTE AVANT :
// ─────────────────────────────────────────────

        <button onClick={onSanteEmo}
          style={{width:"100%",background:"linear-gradient(135deg,#0d0520,#200035)",border:"1.5px solid #7c3aed44",borderRadius:18,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:10,textAlign:"left",fontFamily:"'Outfit',sans-serif"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#7c3aed88"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#7c3aed44"}>
          <div style={{fontSize:32,flexShrink:0}}>🔮</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:15,color:"#c084fc"}}>
              {lang==="en"?"Emotional Health":"Santé Émotionnelle"}
            </div>
            <div style={{color:"#4a6e52",fontSize:12,marginTop:2}}>
              {lang==="en"?"Vibration · TCM · Breathwork 🌬️":"Vibration · MTC · Respiration 🌬️"}
            </div>
          </div>
          <div style={{fontSize:11,background:"#7c3aed20",color:"#c084fc",borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0}}>
            {lang==="en"?"DAILY":"QUOTIDIEN"}
          </div>
        </button>


// ─────────────────────────────────────────────
// ÉTAPE 3 — Dashboard : ajouter onSanteEmo dans les props
// Cherche la ligne :
//   function Dashboard({user,onScan,onMealScan,...,onScanCorps,history,profile,...})
// Ajoute "onSanteEmo" dans la liste des props destructurés
// ─────────────────────────────────────────────
// AVANT :
function Dashboard({user,onScan,onMealScan,onPaywall,onLogout,onProfile,onFamily,onChallenge,onProgress,onMealPlan,onPedometer,onReferral,onWallet,onGymCoach,onCaliCoach,onLongevite,onScanCorps,history,profile,vitaCoins,lang,setLang,t})

// APRÈS :
function Dashboard({user,onScan,onMealScan,onPaywall,onLogout,onProfile,onFamily,onChallenge,onProgress,onMealPlan,onPedometer,onReferral,onWallet,onGymCoach,onCaliCoach,onLongevite,onScanCorps,onSanteEmo,history,profile,vitaCoins,lang,setLang,t})


// ─────────────────────────────────────────────
// ÉTAPE 4 — Dans le return principal de App()
// Cherche la ligne avec screen==="scan_corps" et ajoute JUSTE APRÈS :
// ─────────────────────────────────────────────

// AVANT (la dernière ligne du return) :
        {screen==="scan_corps"   && <ScanCorpsComplet user={user} profile={profile} onBack={()=>setScreen("dashboard")} onPaywall={()=>setScreen("paywall")} t={t} lang={lang}/>}

// APRÈS (ajoute cette ligne) :
        {screen==="scan_corps"   && <ScanCorpsComplet user={user} profile={profile} onBack={()=>setScreen("dashboard")} onPaywall={()=>setScreen("paywall")} t={t} lang={lang}/>}
        {screen==="sante_emo"    && <SanteEmotionnelle user={user} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Check-in émotionnel")} lang={lang} t={t}/>}


// ─────────────────────────────────────────────
// ÉTAPE 5 — Dans le return principal de App()
// Cherche la ligne Dashboard et ajoute onSanteEmo :
// ─────────────────────────────────────────────

// AVANT :
        {screen==="dashboard"    && user && <Dashboard ... onScanCorps={()=>setScreen("scan_corps")} history={history} ...

// APRÈS (ajoute onSanteEmo dans les props) :
        {screen==="dashboard"    && user && <Dashboard ... onScanCorps={()=>setScreen("scan_corps")} onSanteEmo={()=>setScreen("sante_emo")} history={history} ...

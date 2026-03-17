// ============================================
// VITASCANN — APP.JS v3.0
// ✅ Scan corporel (8 zones)
// ✅ Scan repas (photo assiette → calories + carences)
// ✅ Profil santé complet (âge, poids, objectifs)
// ✅ Onboarding WOW + Démo 1 scan gratuit
// ✅ Paywall honnête — 7,99$/mois (14,99$ barré)
// ✅ Partage résultats + Compte à rebours
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc,
  query, where, getDocs, orderBy, serverTimestamp
} from "firebase/firestore";

// ─── FIREBASE ───
const firebaseConfig = {
  apiKey: "AIzaSyC6P_gy_ZKyU-GuvisD5wweAVeUhGhrOcg",
  authDomain: "vitascann.firebaseapp.com",
  projectId: "vitascann",
  storageBucket: "vitascann.firebasestorage.app",
  messagingSenderId: "863137345831",
  appId: "1:863137345831:web:caacf5989a7e9c7d947902"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

// ─── SERVICES ───
const AuthService = {
  register: async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, plan: "free", scansCount: 0, createdAt: serverTimestamp()
    });
    return cred.user;
  },
  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    return { ...cred.user, ...userDoc.data() };
  },
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  logout: () => signOut(auth),
  onAuthChange: (cb) => onAuthStateChanged(auth, cb),
};

const ScanService = {
  saveScan: async (userId, scanData) => {
    const ref = await addDoc(collection(db, "scans"), { userId, ...scanData, createdAt: serverTimestamp() });
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    await setDoc(userRef, { scansCount: (userDoc.data()?.scansCount || 0) + 1 }, { merge: true });
    return ref.id;
  },
  getHistory: async (userId) => {
    const q = query(collection(db, "scans"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  saveProfile: async (userId, profile) => {
    await setDoc(doc(db, "users", userId), { profile }, { merge: true });
  }
};

// ─── STYLES ───
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#060d08;}
::-webkit-scrollbar{width:0;}
.app{font-family:'Outfit',sans-serif;background:#060d08;color:#edf5ef;max-width:430px;margin:0 auto;min-height:100vh;overflow-x:hidden;}
.serif{font-family:'Cormorant Garamond',serif;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes glow{0%,100%{box-shadow:0 0 24px #00ff8820}50%{box-shadow:0 0 60px #00ff8855}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes scanPulse{0%,100%{opacity:.3;transform:scaleX(.6)}50%{opacity:1;transform:scaleX(1)}}
@keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.fu{animation:fadeUp .5s ease both;}
.fu1{animation:fadeUp .5s .07s ease both;}
.fu2{animation:fadeUp .5s .14s ease both;}
.fu3{animation:fadeUp .5s .21s ease both;}
.fu4{animation:fadeUp .5s .28s ease both;}
.inp{width:100%;background:#0c1810;border:1.5px solid #1a2e1e;border-radius:12px;padding:15px 18px;font-family:'Outfit',sans-serif;font-size:15px;color:#edf5ef;outline:none;transition:border .2s,box-shadow .2s;}
.inp:focus{border-color:#00ff88;box-shadow:0 0 0 3px #00ff8812;}
.inp::placeholder{color:#3a5040;}
.bem{width:100%;background:linear-gradient(135deg,#00ff88,#00cc66);color:#020a04;border:none;border-radius:12px;padding:16px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;}
.bem:hover{transform:translateY(-2px);box-shadow:0 8px 32px #00ff8840;}
.bem:disabled{opacity:.45;cursor:not-allowed;transform:none;}
.bgh{width:100%;background:transparent;color:#4a6e52;border:1.5px solid #1a2e1e;border-radius:12px;padding:14px;font-family:'Outfit',sans-serif;font-size:14px;cursor:pointer;transition:all .2s;}
.bgh:hover{border-color:#00ff88;color:#00ff88;}
.bgold{width:100%;background:linear-gradient(135deg,#e2b84a,#c49a2e);color:#080400;border:none;border-radius:12px;padding:16px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;}
.bgold:hover{transform:translateY(-2px);box-shadow:0 8px 32px #e2b84a40;}
.card{background:#0c1810;border:1px solid #192c1d;border-radius:18px;padding:18px;}
`;

const EM="#00ff88",GOLD="#e2b84a",MUT="#4a6e52",DANGER="#ff5555",WARN="#ffaa33";
const CARD="#0c1810",BDR="#192c1d";

const ZONES = [
  {id:"nails", icon:"💅", label:"Ongles",     hint:"Posez votre main à plat",       vitamins:"B12 · C · Fer · Zinc",   color:"#c084fc", premium:false},
  {id:"eyes",  icon:"👁️", label:"Yeux",       hint:"Blanc de l'œil visible",        vitamins:"A · Fer",                color:"#38bdf8", premium:false},
  {id:"skin",  icon:"🖐️", label:"Peau",       hint:"Face interne du poignet",       vitamins:"D · B3 · Zinc",          color:"#fb923c", premium:true},
  {id:"hair",  icon:"💇", label:"Cheveux",    hint:"Cuir chevelu, racines",         vitamins:"Biotine · Fer · B7",     color:"#f472b6", premium:true},
  {id:"tongue",icon:"👅", label:"Langue",     hint:"Tirée, bonne lumière",          vitamins:"B2 · B3 · B12",          color:"#f87171", premium:true},
  {id:"feet",  icon:"🦶", label:"Pieds",      hint:"Plante du pied, talons",        vitamins:"B3 · E · Zinc",          color:"#a3e635", premium:true},
  {id:"belly", icon:"🫃", label:"Ventre",     hint:"Zone abdominale",               vitamins:"D · Magnésium · B12",    color:"#fbbf24", premium:true},
  {id:"scalp", icon:"🧠", label:"Cuir chev.", hint:"Zones de chute ou irritation",  vitamins:"Biotine · Zinc · B5",    color:"#e879f9", premium:true},
];

const BODY_PROMPT = `Tu es VitaScann, assistant visuel en nutrition. Tu analyses des photos et donnes des PISTES nutritionnelles indicatives — pas un diagnostic médical.
Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"score":0-100,"urgence":"normal|attention|urgent","carences":[{"nom":"Vitamine X","niveau":"critique|faible|limite|normal","pct":0-100,"emoji":"🟡","signes":"observation visuelle","aliments":["a1","a2","a3"],"complement":"Nom","dose":"500mg/j"}],"positifs":["p1","p2"],"conseil":"Conseil pratique en 2 phrases.","prochain":"zone suivante recommandée"}`;

const MEAL_PROMPT = `Tu es VitaScann, assistant nutrition. Analyse cette photo de repas et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"nom_repas":"Nom du plat","calories_estimees":0-2000,"proteines_g":0-100,"glucides_g":0-200,"lipides_g":0-100,"score_nutrition":0-100,"carences_comblees":[{"nutriment":"Vitamine X","emoji":"🟢","niveau":"bien|moyen|faible"}],"manque":[{"nutriment":"Zinc","conseil":"Ajouter des graines de courge"}],"conseil_global":"Conseil en 2 phrases.","note_halal":"halal|inconnu|attention"}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── COMPOSANTS ───
function Spin() {
  return <div style={{width:18,height:18,border:"2.5px solid #00000033",borderTopColor:"#000",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;
}

function Input({label,type="text",value,onChange,placeholder,left,error,disabled,right}) {
  const [show,setShow] = useState(false);
  const ip = type==="password";
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{color:MUT,fontSize:11,fontWeight:600,letterSpacing:.8,marginBottom:5}}>{label}</div>}
      <div style={{position:"relative"}}>
        {left&&<div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:17}}>{left}</div>}
        <input className="inp" type={ip&&!show?"password":"text"} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          style={{paddingLeft:left?44:16,paddingRight:(ip||right)?44:16,borderColor:error?DANGER:undefined,opacity:disabled?.6:1}}/>
        {ip&&<button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:MUT}}>{show?"🙈":"👁️"}</button>}
        {right&&!ip&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:MUT}}>{right}</div>}
      </div>
      {error&&<div style={{color:DANGER,fontSize:11,marginTop:4}}>⚠ {error}</div>}
    </div>
  );
}

function Select({label,value,onChange,options,disabled}) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{color:MUT,fontSize:11,fontWeight:600,letterSpacing:.8,marginBottom:5}}>{label}</div>}
      <select className="inp" value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} style={{appearance:"none",cursor:"pointer"}}>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Bar({v,c}) {
  return (
    <div style={{background:"#142018",borderRadius:4,height:5,overflow:"hidden",marginTop:5}}>
      <div style={{width:`${v}%`,height:"100%",background:c||EM,borderRadius:4,boxShadow:`0 0 6px ${c||EM}`,transition:"width 1.6s ease"}}/>
    </div>
  );
}

function ScoreRing({score,size=130}) {
  const r=size*.37,circ=2*Math.PI*r,fill=(score/100)*circ;
  const c=score>=75?EM:score>=50?WARN:DANGER;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#142018" strokeWidth={size*.075}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={size*.075}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.8s ease",filter:`drop-shadow(0 0 6px ${c})`}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div className="serif" style={{fontSize:size*.27,fontWeight:700,color:c,lineHeight:1}}>{score}</div>
        <div style={{fontSize:size*.09,color:MUT,marginTop:2}}>/ 100</div>
      </div>
    </div>
  );
}

function NivPill({n}) {
  const m={critique:[DANGER,"#1a0808"],faible:[WARN,"#1a1000"],limite:["#fbbf24","#1a1500"],normal:[EM,"#001a0a"]};
  const [fg,bg]=m[n]||[MUT,CARD];
  return <span style={{background:bg,color:fg,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{n?.toUpperCase()}</span>;
}

function ErrorBanner({msg,onClose}) {
  if(!msg)return null;
  return (
    <div style={{background:"#ff555514",border:`1px solid ${DANGER}44`,borderRadius:10,padding:"10px 14px",color:DANGER,fontSize:12,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span>⚠ {msg}</span>
      {onClose&&<button onClick={onClose} style={{background:"none",border:"none",color:DANGER,cursor:"pointer",fontSize:16}}>×</button>}
    </div>
  );
}

// ─── SPLASH ───
function Splash({onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,2400);return()=>clearTimeout(t);},[]);
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 40%,#061a0a 0%,#060d08 70%)"}}>
      <div style={{animation:"glow 2s ease infinite,floatY 3s ease-in-out infinite",marginBottom:28}}>
        <div style={{width:110,height:110,borderRadius:30,background:`linear-gradient(135deg,${EM},#007744)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60}}>🌿</div>
      </div>
      <div className="serif fu" style={{fontSize:48,fontWeight:700,color:"#edf5ef",letterSpacing:-1}}>VitaScann</div>
      <div className="fu1" style={{color:MUT,fontSize:13,letterSpacing:2,marginTop:6}}>INTELLIGENCE NUTRITIONNELLE</div>
      <div className="fu2" style={{marginTop:32,display:"flex",gap:16}}>
        {["Corps","Repas","Santé"].map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,color:MUT,fontSize:12}}>
            <div style={{width:6,height:6,borderRadius:3,background:EM}}/>{l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ONBOARDING WOW ───
const SARAH = {
  score:68,urgence:"attention",zone:"💅 Ongles",
  carences:[
    {nom:"Vitamine D",niveau:"faible",pct:32,emoji:"☀️",signes:"Stries verticales sur les ongles, légère fragilité"},
    {nom:"Fer",niveau:"limite",pct:52,emoji:"🔴",signes:"Lit de l'ongle légèrement pâle"},
  ],
  positifs:["Bonne hydratation","Kératine saine"],
  conseil:"Exposez-vous 15 min au soleil le matin et ajoutez des lentilles 3x/semaine.",
};

function Onboarding({onDemo,onRegister,onLogin}) {
  const [step,setStep] = useState(0);

  if(step===3) return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 18px",background:"radial-gradient(ellipse at 50% 0%,#071c0c 0%,#060d08 70%)"}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <span style={{background:"#00ff8818",color:EM,borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700}}>
            👁 EXEMPLE RÉEL — Résultat de Sarah, 28 ans
          </span>
        </div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="serif" style={{fontSize:22,fontWeight:700}}>Rapport de Sarah</div>
          <span style={{background:`${WARN}14`,color:WARN,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>👁 Attention</span>
        </div>
        <div className="fu1" style={{display:"flex",alignItems:"center",gap:18,marginBottom:8}}>
          <ScoreRing score={68} size={100}/>
          <div>
            <div style={{color:MUT,fontSize:11}}>Zone · {SARAH.zone}</div>
            <div style={{color:MUT,fontSize:11,marginTop:8}}>Carences détectées</div>
            <div style={{color:WARN,fontWeight:700,fontSize:28}}>2</div>
          </div>
        </div>
      </div>
      <div style={{padding:"14px 18px"}}>
        <div className="card" style={{marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>🔍 Ce que VitaScann a détecté</div>
          {SARAH.carences.map((c,i)=>(
            <div key={i} style={{marginBottom:i<1?12:0,paddingBottom:i<1?12:0,borderBottom:i<1?`1px solid ${BDR}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:13}}>{c.emoji} {c.nom}</span>
                <NivPill n={c.niveau}/>
              </div>
              <div style={{fontSize:11,color:MUT,marginBottom:4}}>{c.signes}</div>
              <Bar v={c.pct} c={c.niveau==="faible"?WARN:DANGER}/>
            </div>
          ))}
        </div>
        <div style={{background:"#0a1a0c",border:`1.5px solid ${EM}33`,borderRadius:14,padding:14,marginBottom:12,fontSize:12,color:"#a0bcaa",lineHeight:1.7}}>
          💬 <strong style={{color:EM}}>Conseil :</strong> {SARAH.conseil}
        </div>
        <div style={{background:"#0f1a0a",border:`2px solid ${EM}44`,borderRadius:18,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:28,marginBottom:8}}>🔬</div>
          <div className="serif" style={{fontSize:18,fontWeight:700,marginBottom:6}}>Et toi, qu'est-ce que tes ongles révèlent ?</div>
          <div style={{color:MUT,fontSize:13,marginBottom:16}}>1 photo suffit. Résultat en 30 secondes.</div>
          <button className="bem" onClick={onRegister} style={{marginBottom:10}}>Créer mon compte gratuit →</button>
          <button className="bgh" onClick={onDemo}>Essayer sans compte (1 scan offert)</button>
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>Déjà un compte ? Se connecter</button>
        </div>
      </div>
    </div>
  );

  const slides = [
    {icon:"🌿",title:"Votre corps vous parle",sub:"Vos ongles, yeux et peau révèlent des pistes sur votre santé nutritionnelle. VitaScann les analyse en 30 secondes."},
    {icon:"🍽️",title:"Scannez aussi vos repas",sub:"Photographiez votre assiette. VitaScann calcule calories, protéines et vous dit ce qui manque à votre alimentation."},
    {icon:"🧬",title:"Conseils sur mesure",sub:"Votre profil personnalisé — âge, objectifs, mode de vie — pour des suggestions qui collent vraiment à votre quotidien."},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"radial-gradient(ellipse at 50% 30%,#061a0a 0%,#060d08 70%)"}}>
      <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={onRegister} style={{background:"none",border:"none",color:MUT,fontSize:13,cursor:"pointer"}}>Passer →</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
        <div key={step} style={{animation:"slideIn .4s ease both"}}>
          <div style={{fontSize:80,marginBottom:24,animation:"floatY 3s ease-in-out infinite"}}>{slides[step].icon}</div>
          <div className="serif" style={{fontSize:28,fontWeight:700,marginBottom:12,lineHeight:1.2}}>{slides[step].title}</div>
          <div style={{color:MUT,fontSize:15,lineHeight:1.7}}>{slides[step].sub}</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:24}}>
        {slides.map((_,i)=>(
          <div key={i} onClick={()=>setStep(i)} style={{width:i===step?22:7,height:7,borderRadius:4,background:i===step?EM:BDR,transition:"all .3s",cursor:"pointer"}}/>
        ))}
      </div>
      <div style={{padding:"0 24px 48px"}}>
        {step<2
          ? <button className="bem" onClick={()=>setStep(s=>s+1)}>Suivant →</button>
          : <>
              <button className="bem" onClick={()=>setStep(3)} style={{marginBottom:10}}>Voir un vrai résultat 👁</button>
              <button className="bgh" onClick={onRegister}>Créer mon compte gratuit</button>
            </>
        }
        {step===0&&(
          <div style={{textAlign:"center",marginTop:14}}>
            <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>Déjà un compte ? Se connecter</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH ───
function Register({onSuccess,onLogin}) {
  const [f,setF] = useState({name:"",email:"",pass:"",conf:""});
  const [errs,setErrs] = useState({});
  const [load,setLoad] = useState(false);
  const [step,setStep] = useState(1);
  const [globalErr,setGlobalErr] = useState("");

  const validate = () => {
    const e={};
    if(!f.name.trim())e.name="Nom requis";
    if(!f.email.includes("@"))e.email="Email invalide";
    if(f.pass.length<8)e.pass="8 caractères minimum";
    if(f.pass!==f.conf)e.conf="Mots de passe différents";
    setErrs(e); return Object.keys(e).length===0;
  };

  const submit = async () => {
    if(!validate())return;
    setLoad(true); setGlobalErr("");
    try {
      const user = await AuthService.register(f.email,f.pass,f.name);
      setStep(2); await sleep(1500);
      onSuccess({uid:user.uid,name:f.name,email:f.email,plan:"free"});
    } catch(e) {
      setGlobalErr(e.code==="auth/email-already-in-use"?"Email déjà utilisé.":e.code==="auth/weak-password"?"Mot de passe trop faible.":"Erreur. Réessayez.");
    } finally { setLoad(false); }
  };

  const strength = f.pass.length>=12?4:f.pass.length>=8?3:f.pass.length>=5?2:f.pass.length>0?1:0;

  if(step===2) return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>
      <div style={{fontSize:80,animation:"pop .5s ease",marginBottom:20}}>✅</div>
      <div className="serif" style={{fontSize:28,fontWeight:700,marginBottom:8}}>Compte créé !</div>
      <div style={{color:MUT,fontSize:14}}>Bienvenue {f.name} 🌿</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>Créer votre compte</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>1 scan gratuit offert dès l'inscription</div>
      </div>
      <ErrorBanner msg={globalErr} onClose={()=>setGlobalErr("")}/>
      <Input label="NOM COMPLET" value={f.name} onChange={v=>setF({...f,name:v})} placeholder="Votre prénom" left="👤" error={errs.name} disabled={load}/>
      <Input label="EMAIL" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="vous@email.com" left="✉️" error={errs.email} disabled={load}/>
      <Input label="MOT DE PASSE" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="8 caractères minimum" left="🔒" error={errs.pass} disabled={load}/>
      {f.pass.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:4,marginBottom:4}}>
            {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?(strength>=4?EM:strength>=3?WARN:DANGER):BDR,transition:"background .3s"}}/>)}
          </div>
          <div style={{fontSize:10,color:strength>=4?EM:strength>=3?WARN:DANGER}}>{["","Faible","Moyen","Fort","Très fort"][strength]}</div>
        </div>
      )}
      <Input label="CONFIRMER" type="password" value={f.conf} onChange={v=>setF({...f,conf:v})} placeholder="Répétez le mot de passe" left="✅" error={errs.conf} disabled={load}/>
      <button className="bem" onClick={submit} disabled={load} style={{marginBottom:12,marginTop:4}}>{load?<Spin/>:"Créer mon compte →"}</button>
      <button className="bgh" onClick={onLogin}>Déjà un compte ? Se connecter</button>
    </div>
  );
}

function Login({onSuccess,onRegister,onForgot}) {
  const [f,setF] = useState({email:"",pass:""});
  const [load,setLoad] = useState(false);
  const [err,setErr] = useState("");

  const submit = async () => {
    if(!f.email||!f.pass)return setErr("Remplissez tous les champs.");
    setLoad(true); setErr("");
    try {
      const u = await AuthService.login(f.email,f.pass);
      onSuccess({uid:u.uid,name:u.displayName||u.name||"Utilisateur",email:u.email,plan:u.plan||"free"});
    } catch(e) {
      setErr(e.code==="auth/wrong-password"||e.code==="auth/user-not-found"?"Email ou mot de passe incorrect.":"Erreur de connexion.");
    } finally { setLoad(false); }
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>Bon retour</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>Connectez-vous à VitaScann</div>
      </div>
      <ErrorBanner msg={err} onClose={()=>setErr("")}/>
      <Input label="EMAIL" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="vous@email.com" left="✉️" disabled={load}/>
      <Input label="MOT DE PASSE" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="Votre mot de passe" left="🔒" disabled={load}/>
      <div style={{textAlign:"right",marginBottom:18}}>
        <button onClick={onForgot} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>Mot de passe oublié ?</button>
      </div>
      <button className="bem" onClick={submit} disabled={load} style={{marginBottom:12}}>{load?<Spin/>:"Se connecter →"}</button>
      <button className="bgh" onClick={onRegister}>Créer un compte gratuit</button>
    </div>
  );
}

function ForgotPassword({onBack}) {
  const [email,setEmail]=useState(""); const [sent,setSent]=useState(false); const [load,setLoad]=useState(false);
  const submit=async()=>{if(!email.includes("@"))return;setLoad(true);await AuthService.resetPassword(email).catch(()=>{});setSent(true);setLoad(false);};
  if(sent) return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>
      <div style={{fontSize:64,marginBottom:20}}>📧</div>
      <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:8}}>Email envoyé !</div>
      <div style={{color:MUT,fontSize:14,marginBottom:24}}>Vérifiez votre boîte mail.</div>
      <button className="bgh" onClick={onBack}>← Retour</button>
    </div>
  );
  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:28,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div className="serif fu" style={{fontSize:24,fontWeight:700,marginBottom:6}}>Mot de passe oublié</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>Entrez votre email pour recevoir un lien.</div>
      <Input label="EMAIL" value={email} onChange={setEmail} placeholder="vous@email.com" left="✉️" disabled={load}/>
      <button className="bem" onClick={submit} disabled={load||!email.includes("@")}>{load?<Spin/>:"Envoyer le lien →"}</button>
    </div>
  );
}

// ─── PROFIL SANTÉ ───
function ProfileSetup({user,onSave,onSkip}) {
  const [p,setP] = useState({age:"",poids:"",sexe:"homme",objectif:"energie",activite:"modere",halal:false});
  const [load,setLoad] = useState(false);

  const save = async () => {
    setLoad(true);
    if(user?.uid&&!user?.isDemo) await ScanService.saveProfile(user.uid,p).catch(()=>{});
    setLoad(false); onSave(p);
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:40,marginBottom:10}}>🧬</div>
        <div className="serif fu" style={{fontSize:24,fontWeight:700}}>Votre profil santé</div>
        <div className="fu1" style={{color:MUT,fontSize:13,marginTop:5}}>Pour des conseils vraiment personnalisés</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
        <Input label="ÂGE" value={p.age} onChange={v=>setP({...p,age:v})} placeholder="28" right="ans" disabled={load}/>
        <Input label="POIDS" value={p.poids} onChange={v=>setP({...p,poids:v})} placeholder="65" right="kg" disabled={load}/>
      </div>
      <Select label="SEXE BIOLOGIQUE" value={p.sexe} onChange={v=>setP({...p,sexe:v})} disabled={load}
        options={[{v:"homme",l:"Homme"},{v:"femme",l:"Femme"},{v:"autre",l:"Autre"}]}/>
      <Select label="OBJECTIF PRINCIPAL" value={p.objectif} onChange={v=>setP({...p,objectif:v})} disabled={load}
        options={[
          {v:"energie",l:"⚡ Améliorer mon énergie"},
          {v:"peau",l:"✨ Peau & cheveux"},
          {v:"immunite",l:"🛡️ Renforcer l'immunité"},
          {v:"sport",l:"💪 Performance sportive"},
          {v:"poids",l:"⚖️ Gestion du poids"},
          {v:"grossesse",l:"🤱 Grossesse / allaitement"},
        ]}/>
      <Select label="NIVEAU D'ACTIVITÉ" value={p.activite} onChange={v=>setP({...p,activite:v})} disabled={load}
        options={[
          {v:"sedentaire",l:"🛋️ Sédentaire (peu de sport)"},
          {v:"modere",l:"🚶 Modéré (2-3x/sem)"},
          {v:"actif",l:"🏃 Actif (4-5x/sem)"},
          {v:"intense",l:"🔥 Très actif (quotidien)"},
        ]}/>
      <button onClick={()=>setP({...p,halal:!p.halal})}
        style={{width:"100%",background:p.halal?`${EM}12`:"#0c1810",border:`1.5px solid ${p.halal?EM:BDR}`,borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all .2s"}}>
        <div style={{width:22,height:22,borderRadius:6,background:p.halal?EM:BDR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,transition:"all .2s"}}>{p.halal?"✓":""}</div>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:14,fontWeight:600,color:p.halal?EM:"#edf5ef"}}>🌙 Recommandations halal</div>
          <div style={{fontSize:11,color:MUT,marginTop:2}}>Compléments et aliments conformes</div>
        </div>
      </button>
      <button className="bem" onClick={save} disabled={load} style={{marginBottom:10}}>{load?<Spin/>:"Enregistrer mon profil →"}</button>
      <button className="bgh" onClick={onSkip}>Passer pour l'instant</button>
    </div>
  );
}

// ─── DASHBOARD ───
function Dashboard({user,onScan,onMealScan,onPaywall,onLogout,onProfile,history,profile}) {
  const scansLeft = user.plan==="free"?Math.max(0,3-(history?.length||0)):null;
  return (
    <div style={{minHeight:"100vh",paddingBottom:90,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 18px",background:"radial-gradient(ellipse at 50% 0%,#061a0a 0%,#060d08 70%)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <div className="serif fu" style={{fontSize:24,fontWeight:700}}>Bonjour, {user.name?.split(" ")[0]} 👋</div>
            <div className="fu1" style={{color:MUT,fontSize:13,marginTop:3}}>
              {user.plan==="premium"
                ?<span style={{color:GOLD}}>👑 Compte Premium actif</span>
                :<span>Gratuit · <span style={{color:EM,fontWeight:600}}>{scansLeft} scan{scansLeft!==1?"s":""} restant{scansLeft!==1?"s":""}</span></span>
              }
            </div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:`1px solid ${BDR}`,borderRadius:10,padding:"6px 12px",color:MUT,fontSize:12,cursor:"pointer"}}>Déco.</button>
        </div>
        {profile&&(
          <div className="fu2" style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {profile.age&&<span style={{background:`${EM}10`,color:EM,borderRadius:20,padding:"3px 10px",fontSize:11}}>👤 {profile.age} ans</span>}
            {profile.objectif&&<span style={{background:`${EM}10`,color:EM,borderRadius:20,padding:"3px 10px",fontSize:11}}>🎯 {profile.objectif}</span>}
            {profile.halal&&<span style={{background:`${GOLD}10`,color:GOLD,borderRadius:20,padding:"3px 10px",fontSize:11}}>🌙 Halal</span>}
          </div>
        )}
      </div>
      <div style={{padding:"14px 18px"}}>
        <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <button onClick={onScan} style={{background:"linear-gradient(135deg,#0c2812,#071a0a)",border:`1.5px solid ${EM}44`,borderRadius:18,padding:"18px 12px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:30,marginBottom:8}}>🔬</div>
            <div style={{fontWeight:700,fontSize:14,color:"#edf5ef"}}>Scan corporel</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>Ongles, yeux, peau...</div>
          </button>
          <button onClick={onMealScan} style={{background:"linear-gradient(135deg,#12180c,#0a1207)",border:`1.5px solid ${GOLD}44`,borderRadius:18,padding:"18px 12px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:30,marginBottom:8}}>🍽️</div>
            <div style={{fontWeight:700,fontSize:14,color:GOLD}}>Scan repas</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>Calories & carences</div>
            {user.plan!=="premium"&&<div style={{fontSize:9,color:GOLD,marginTop:3,fontWeight:700}}>✨ PREMIUM</div>}
          </button>
        </div>
        {history.length>0&&(
          <div className="fu3 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📅 Derniers scans</div>
            {history.slice(0,3).map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<Math.min(2,history.length-1)?12:0,paddingBottom:i<Math.min(2,history.length-1)?12:0,borderBottom:i<Math.min(2,history.length-1)?`1px solid ${BDR}`:"none"}}>
                <ScoreRing score={h.score||75} size={48}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{h.zone||h.nom_repas||"Scan"}</div>
                  <div style={{color:MUT,fontSize:11,marginTop:2}}>{h.createdAt?.toDate?.()?.toLocaleDateString("fr")||"Récent"}</div>
                </div>
                <span style={{background:h.score>=75?`${EM}20`:WARN+"20",color:h.score>=75?EM:WARN,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{h.score>=75?"Bien":"Attention"}</span>
              </div>
            ))}
          </div>
        )}
        {user.plan==="free"&&(
          <div className="fu4" style={{background:"linear-gradient(135deg,#181005,#100b03)",border:`1.5px solid ${GOLD}38`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:28}}>👑</div>
              <div>
                <div className="serif" style={{fontSize:17,fontWeight:700,color:GOLD}}>Passez Premium</div>
                <div style={{color:MUT,fontSize:12}}>Moins cher qu'un café par semaine</div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div className="serif" style={{fontSize:20,fontWeight:700,color:GOLD}}>7,99$</div>
                <div style={{color:MUT,fontSize:10}}>/mois</div>
              </div>
            </div>
            <button className="bgold" onClick={onPaywall} style={{fontSize:13}}>Débloquer tout →</button>
          </div>
        )}
        <div className="card" style={{border:`1px solid ${GOLD}28`}}>
          <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:7}}>✨ CONSEIL DU JOUR</div>
          <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>
            {profile?.halal
              ?"Consommez des dattes et des amandes chaque matin — riches en Fer, Magnésium et bons acides gras."
              :"15 min de soleil le matin + sardines 2x/semaine couvrent l'essentiel de vos besoins en Vitamine D et Oméga-3."}
          </div>
        </div>
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(8,14,10,.95)",backdropFilter:"blur(20px)",borderTop:`1px solid ${BDR}`,padding:"10px 0 22px",display:"flex",justifyContent:"space-around"}}>
        {[["🏠","Accueil"],["🔬","Scan corps"],["🍽️","Scan repas"],["🧬","Profil"]].map(([ic,lb])=>(
          <button key={lb} onClick={lb==="Scan corps"?onScan:lb==="Scan repas"?onMealScan:lb==="Profil"?onProfile:undefined}
            style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:19}}>{ic}</div>
            <div style={{fontSize:10,color:lb==="Accueil"?EM:MUT,fontWeight:lb==="Accueil"?600:400}}>{lb}</div>
            {lb==="Accueil"&&<div style={{width:4,height:4,borderRadius:2,background:EM}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ZONE PICKER ───
function ZonePick({onSelect,onBack,user,onPaywall}) {
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>Choisir une zone</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>
        {user?.plan==="premium"
          ?<span style={{color:GOLD}}>👑 Toutes les zones débloquées</span>
          :<span><span style={{color:EM,fontWeight:600}}>2 zones gratuites</span> · <span style={{color:GOLD}}>6 zones Premium 🔒</span></span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {ZONES.map(z=>{
          const locked=z.premium&&user?.plan!=="premium";
          return (
            <button key={z.id} onClick={()=>locked?onPaywall():onSelect(z)}
              style={{display:"flex",alignItems:"center",gap:14,background:locked?"#0a0e0b":CARD,border:`1px solid ${locked?"#1a2e1e":BDR}`,borderRadius:16,padding:"15px 16px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .2s",opacity:locked?.75:1}}
              onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${locked?GOLD+"44":z.color+"55"}`;if(!locked)e.currentTarget.style.background=`${z.color}08`;}}
              onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${locked?"#1a2e1e":BDR}`;e.currentTarget.style.background=locked?"#0a0e0b":CARD;}}>
              <div style={{width:50,height:50,borderRadius:14,background:locked?`${GOLD}10`:`${z.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{locked?"🔒":z.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:locked?MUT:"#edf5ef"}}>{z.label}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{locked?"Zone Premium — Débloquez pour analyser":z.hint}</div>
                {!locked&&<div style={{fontSize:10,color:z.color,marginTop:4,fontWeight:600}}>Détecte : {z.vitamins}</div>}
                {locked&&<div style={{fontSize:10,color:GOLD,marginTop:4,fontWeight:600}}>✨ Premium · 7,99$/mois</div>}
              </div>
              <div style={{color:locked?GOLD:MUT,fontSize:locked?13:18,fontWeight:locked?700:400}}>{locked?"👑":"›"}</div>
            </button>
          );
        })}
      </div>
      {user?.plan!=="premium"&&(
        <div style={{marginTop:20,background:"linear-gradient(135deg,#181005,#100b03)",border:`1.5px solid ${GOLD}38`,borderRadius:18,padding:18}}>
          <div className="serif" style={{fontSize:16,fontWeight:700,color:GOLD,marginBottom:5}}>👑 Débloquez les 6 zones Premium</div>
          <div style={{color:MUT,fontSize:12,lineHeight:1.6,marginBottom:14}}>Peau, Cheveux, Langue, Pieds, Ventre, Cuir chevelu — analyse complète de votre corps.</div>
          <button className="bgold" onClick={onPaywall}>Passer Premium · 7,99$/mois →</button>
        </div>
      )}
    </div>
  );
}

// ─── CAPTURE CORPS ───
function Capture({zone,onCapture,onBack}) {
  const ref=useRef();
  const handle=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>onCapture(ev.target.result.split(",")[1],ev.target.result);r.readAsDataURL(file);};
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:3}}>Photographier</div>
      <div className="fu1" style={{color:zone.color,fontSize:17,fontWeight:600,marginBottom:20}}>{zone.icon} {zone.label}</div>
      <div className="fu2" onClick={()=>ref.current?.click()}
        style={{flex:1,maxHeight:300,background:"#080f0a",borderRadius:24,border:`2px solid ${zone.color}38`,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,cursor:"pointer"}}>
        <div style={{position:"absolute",left:16,right:16,height:2,background:`linear-gradient(90deg,transparent,${zone.color},transparent)`,animation:"scanPulse 2s ease-in-out infinite",top:"50%"}}/>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:52,marginBottom:10}}>{zone.icon}</div>
          <div style={{color:zone.color,fontWeight:600,fontSize:13}}>Appuyez pour photographier</div>
          <div style={{color:MUT,fontSize:11,marginTop:4}}>{zone.hint}</div>
        </div>
      </div>
      <div className="fu3 card" style={{marginBottom:16}}>
        <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:8}}>💡 CONSEILS PHOTO</div>
        {["Lumière naturelle ou LED blanche","Distance 10-15 cm","Image bien nette, pas floue"].map(t=>(
          <div key={t} style={{display:"flex",gap:7,marginBottom:5,fontSize:12,color:MUT}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:GOLD,marginTop:4,flexShrink:0}}/>{t}
          </div>
        ))}
      </div>
      <button className="bem fu4" onClick={()=>ref.current?.click()}>📷 Prendre la photo</button>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handle} style={{display:"none"}}/>
    </div>
  );
}

// ─── CAPTURE REPAS ───
function MealCapture({onCapture,onBack,user,onPaywall}) {
  const ref=useRef();

  if(user?.plan!=="premium"&&!user?.isDemo) return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:32,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:60,marginBottom:12}}>🍽️</div>
        <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:8,color:GOLD}}>Scan Repas</div>
        <div style={{color:MUT,fontSize:14,lineHeight:1.7,marginBottom:20}}>
          Photographiez votre assiette et obtenez :<br/>
          <span style={{color:"#edf5ef"}}>calories · protéines · glucides · lipides</span><br/>et quelles carences ce repas comble.
        </div>
      </div>
      <div className="card" style={{marginBottom:24,border:`1px solid ${GOLD}33`}}>
        {["📸 Analyse visuelle de n'importe quel repas","🔢 Calories et macros estimés","💊 Carences comblées par ce repas","🌙 Statut halal signalé automatiquement","🔗 Croisé avec vos scans corporels"].map((f,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:i<4?10:0,fontSize:13,color:"#b0c8b8"}}>
            <span style={{color:EM}}>✓</span>{f}
          </div>
        ))}
      </div>
      <button className="bgold" onClick={onPaywall} style={{marginBottom:10}}>👑 Débloquer le Scan Repas — 7,99$/mois</button>
      <button className="bgh" onClick={onBack}>Retour</button>
    </div>
  );

  const handle=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>onCapture(ev.target.result.split(",")[1],ev.target.result);r.readAsDataURL(file);};
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:3}}>Scan Repas</div>
      <div className="fu1" style={{color:GOLD,fontSize:15,fontWeight:600,marginBottom:20}}>🍽️ Photographiez votre assiette</div>
      <div className="fu2" onClick={()=>ref.current?.click()}
        style={{flex:1,maxHeight:300,background:"#080f0a",borderRadius:24,border:`2px solid ${GOLD}38`,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,cursor:"pointer"}}>
        <div style={{position:"absolute",left:16,right:16,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,animation:"scanPulse 2s ease-in-out infinite",top:"50%"}}/>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:52,marginBottom:10}}>🍽️</div>
          <div style={{color:GOLD,fontWeight:600,fontSize:13}}>Appuyez pour photographier</div>
          <div style={{color:MUT,fontSize:11,marginTop:4}}>Vue du dessus, repas complet visible</div>
        </div>
      </div>
      <div className="fu3 card" style={{marginBottom:16}}>
        <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:8}}>💡 POUR UN MEILLEUR RÉSULTAT</div>
        {["Photo du dessus, tout le repas visible","Bonne lumière naturelle ou LED","Évitez les assiettes à motifs chargés"].map(t=>(
          <div key={t} style={{display:"flex",gap:7,marginBottom:5,fontSize:12,color:MUT}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:GOLD,marginTop:4,flexShrink:0}}/>{t}
          </div>
        ))}
      </div>
      <button className="bem fu4" onClick={()=>ref.current?.click()} style={{background:`linear-gradient(135deg,${GOLD},#c49a2e)`,color:"#080400"}}>📷 Photographier mon repas</button>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handle} style={{display:"none"}}/>
    </div>
  );
}

// ─── PREVIEW ───
function Preview({zone,preview,onAnalyze,onRetake,isMeal}) {
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:16}}>{isMeal?"Aperçu du repas":"Aperçu du scan"}</div>
      <div className="fu1" style={{borderRadius:22,overflow:"hidden",marginBottom:16,position:"relative",boxShadow:"0 20px 60px #00000066"}}>
        <img src={preview} alt="scan" style={{width:"100%",maxHeight:300,objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",bottom:14,left:14}}>
          <span style={{background:isMeal?GOLD:zone?.color,color:"#000",borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700}}>
            {isMeal?"🍽️ Repas":zone?.icon+" "+zone?.label}
          </span>
        </div>
      </div>
      <button className="bem fu2" onClick={onAnalyze} style={{marginBottom:10,background:isMeal?`linear-gradient(135deg,${GOLD},#c49a2e)`:undefined,color:isMeal?"#080400":undefined}}>
        {isMeal?"🍽️ Analyser ce repas":"🔬 Analyser avec VitaScann IA"}
      </button>
      <button className="bgh fu3" onClick={onRetake}>↩ Reprendre la photo</button>
    </div>
  );
}

// ─── ANALYZING ───
function Analyzing({zone,isMeal}) {
  const [cur,setCur]=useState(0);
  const steps=isMeal
    ?["Identification du repas...","Calcul des calories...","Analyse des nutriments...","Vérification carences comblées...","Rapport prêt..."]
    :["Détection de la zone...","Analyse des pigmentations...","Comparaison base médicale...","Calcul des carences...","Génération du rapport..."];
  useEffect(()=>{const t=setInterval(()=>setCur(s=>Math.min(s+1,steps.length-1)),850);return()=>clearInterval(t);},[]);
  const color=isMeal?GOLD:zone?.color;
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{position:"relative",width:120,height:120,marginBottom:28}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`3px solid ${color}20`}}/>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"3px solid transparent",borderTopColor:color,animation:"spin 1s linear infinite"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{isMeal?"🍽️":zone?.icon}</div>
      </div>
      <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:6}}>Analyse en cours</div>
      <div style={{color:MUT,fontSize:13,marginBottom:36}}>{isMeal?"Analyse nutritionnelle du repas":`Examen de vos ${zone?.label}`}</div>
      <div style={{width:"100%",maxWidth:300}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,opacity:i<=cur?1:.18,transition:"opacity .4s"}}>
            <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:i<cur?EM:i===cur?color:BDR,transition:"background .3s"}}/>
            <div style={{fontSize:13,color:i<=cur?"#edf5ef":MUT,fontWeight:i===cur?600:400}}>{s}</div>
            {i<cur&&<div style={{marginLeft:"auto",color:EM,fontSize:13}}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RÉSULTAT REPAS ───
function MealResult({result,onNewScan,onHome}) {
  const sc=result?.score_nutrition||0;
  const scoreColor=sc>=75?EM:sc>=50?WARN:DANGER;
  const handleShare=async()=>{
    const text=`🍽️ Mon analyse repas VitaScann\n\n${result.nom_repas||"Mon repas"} — ${result.calories_estimees} kcal\nScore nutrition : ${sc}/100\n\nCarences comblées : ${result.carences_comblees?.filter(c=>c.niveau==="bien").map(c=>c.nutriment).join(", ")||"—"}\n\n🌿 vitascann.vercel.app`;
    if(navigator.share){await navigator.share({title:"Mon repas VitaScann",text}).catch(()=>{});}
    else{await navigator.clipboard.writeText(text);alert("📋 Résultats copiés !");}
  };
  return (
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 22px",background:"radial-gradient(ellipse at 50% 0%,#1a1200 0%,#060d08 70%)"}}>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="serif" style={{fontSize:22,fontWeight:700}}>Analyse repas</div>
          <span style={{background:`${scoreColor}14`,color:scoreColor,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
            {sc>=75?"✅ Excellent":sc>=50?"👁 Correct":"⚠️ Incomplet"}
          </span>
        </div>
        <div className="fu1" style={{display:"flex",alignItems:"center",gap:18}}>
          <ScoreRing score={sc} size={100}/>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:GOLD}}>{result.nom_repas||"Votre repas"}</div>
            {result.note_halal==="halal"&&<span style={{background:`${GOLD}14`,color:GOLD,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>🌙 Halal</span>}
            {result.note_halal==="attention"&&<span style={{background:`${WARN}14`,color:WARN,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>⚠️ Vérifier halal</span>}
            <div style={{color:MUT,fontSize:11,marginTop:8}}>Calories estimées</div>
            <div style={{color:GOLD,fontWeight:700,fontSize:24}}>{result.calories_estimees}<span style={{fontSize:12,fontWeight:400}}> kcal</span></div>
          </div>
        </div>
      </div>
      <div style={{padding:"14px 18px"}}>
        <div className="fu2 card" style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Macronutriments</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[["Protéines",result.proteines_g,"g","#38bdf8"],["Glucides",result.glucides_g,"g","#fbbf24"],["Lipides",result.lipides_g,"g","#fb923c"]].map(([l,v,u,c])=>(
              <div key={l} style={{background:"#0a140c",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:700,color:c}}>{v||"?"}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{l} ({u})</div>
              </div>
            ))}
          </div>
        </div>
        {result.carences_comblees?.length>0&&(
          <div className="fu3 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>✅ Carences comblées par ce repas</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {result.carences_comblees.map((c,i)=>{
                const col=c.niveau==="bien"?EM:c.niveau==="moyen"?WARN:MUT;
                return <span key={i} style={{background:`${col}14`,color:col,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>{c.emoji} {c.nutriment}</span>;
              })}
            </div>
          </div>
        )}
        {result.manque?.length>0&&(
          <div className="fu3 card" style={{marginBottom:14,border:`1px solid ${WARN}22`}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:WARN}}>⚠️ Ce qui manque</div>
            {result.manque.map((m,i)=>(
              <div key={i} style={{marginBottom:i<result.manque.length-1?10:0,paddingBottom:i<result.manque.length-1?10:0,borderBottom:i<result.manque.length-1?`1px solid ${BDR}`:"none"}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{m.nutriment}</div>
                <div style={{fontSize:12,color:MUT}}>{m.conseil}</div>
              </div>
            ))}
          </div>
        )}
        {result.conseil_global&&(
          <div className="fu4 card" style={{border:`1px solid ${GOLD}28`,marginBottom:14}}>
            <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:7}}>💬 CONSEIL PERSONNALISÉ</div>
            <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>{result.conseil_global}</div>
          </div>
        )}
        <div style={{background:"#120f06",border:"1px solid #2a2010",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#806040",lineHeight:1.6,marginBottom:16}}>
          ⚠️ Estimation indicative basée sur l'analyse visuelle. Les valeurs peuvent varier selon portions et préparation.
        </div>
        <button onClick={handleShare} style={{width:"100%",background:"linear-gradient(135deg,#1a2e20,#0f1e14)",border:`1.5px solid ${EM}55`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          📤 Partager mon analyse
        </button>
        <button className="bem" onClick={onNewScan} style={{marginBottom:10}}>🍽️ Scanner un autre repas</button>
        <button className="bgh" onClick={onHome}>🏠 Retour à l'accueil</button>
      </div>
    </div>
  );
}

// ─── RÉSULTAT CORPS ───
async function shareResult(result,zone) {
  const text=`🌿 Mon rapport VitaScann\n\nZone : ${zone.icon} ${zone.label}\nScore : ${result.score}/100\nStatut : ${result.urgence==="urgent"?"⚠️ Urgent":result.urgence==="attention"?"👁 Attention":"✅ Normal"}\n\n${result.carences?.length>0?`Carences : ${result.carences.map(c=>c.nom).join(", ")}`:"Aucune carence majeure ✅"}\n\n💬 ${result.conseil||""}\n\n🔬 vitascann.vercel.app`;
  if(navigator.share){await navigator.share({title:"Mon rapport VitaScann",text,url:"https://vitascann.vercel.app"}).catch(()=>{});}
  else{await navigator.clipboard.writeText(text);alert("📋 Résultats copiés !");}
}

async function generatePDF(result,zone,user) {
  const {jsPDF}=await import("jspdf");
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,MARGIN=18,COL=W-MARGIN*2;let y=0;
  const GREEN=[0,200,100],GOLDC=[220,175,60],DARK=[6,13,8],WHITE=[237,245,239],GRAY=[74,110,82],RED=[255,85,85],ORANGE=[255,170,51],PURPLE=[192,132,252];
  const rgb=c=>doc.setTextColor(...c);const fill=c=>doc.setFillColor(...c);const line=c=>doc.setDrawColor(...c);
  fill(DARK);doc.rect(0,0,W,297,"F");fill([0,30,15]);doc.rect(0,0,W,44,"F");
  doc.setFontSize(26);doc.setFont("helvetica","bold");rgb(WHITE);doc.text("VitaScann",MARGIN+4,16);
  doc.setFontSize(9);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("INTELLIGENCE NUTRITIONNELLE",MARGIN+4,22);
  const now=new Date();
  doc.setFontSize(8);rgb(GRAY);doc.text(`Rapport généré le ${now.toLocaleDateString("fr-CA",{day:"2-digit",month:"long",year:"numeric"})}`,W-MARGIN,12,{align:"right"});
  doc.text(`Patient : ${user?.name||"Utilisateur"}`,W-MARGIN,18,{align:"right"});
  const isPremium=user?.plan==="premium";fill(isPremium?GOLDC:GREEN);doc.roundedRect(W-MARGIN-28,24,28,8,2,2,"F");
  doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(DARK);doc.text(isPremium?"PREMIUM":"GRATUIT",W-MARGIN-14,29.5,{align:"center"});
  y=50;fill([12,24,16]);doc.roundedRect(MARGIN,y,COL,28,3,3,"F");line(GREEN);doc.setLineWidth(0.3);doc.roundedRect(MARGIN,y,COL,28,3,3,"S");
  doc.setFontSize(8);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("ZONE ANALYSEE",MARGIN+8,y+7);
  doc.setFontSize(14);doc.setFont("helvetica","bold");rgb(WHITE);doc.text(`${zone?.label||""}`,MARGIN+8,y+17);
  const score=result?.score||0;const sc2=score>=75?GREEN:score>=50?ORANGE:RED;
  fill(sc2);doc.circle(W-MARGIN-20,y+14,12,"F");doc.setFontSize(14);doc.setFont("helvetica","bold");rgb(DARK);doc.text(`${score}`,W-MARGIN-20,y+15.5,{align:"center"});
  doc.setFontSize(6);doc.text("/100",W-MARGIN-20,y+20,{align:"center"});
  const urgColor=result?.urgence==="urgent"?RED:result?.urgence==="attention"?ORANGE:GREEN;
  const urgLabel=result?.urgence==="urgent"?"URGENT":result?.urgence==="attention"?"ATTENTION":"NORMAL";
  fill(urgColor);doc.roundedRect(W-MARGIN-60,y+6,32,8,2,2,"F");doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(DARK);doc.text(urgLabel,W-MARGIN-44,y+11.2,{align:"center"});
  y+=35;
  if(result?.carences?.length>0){
    doc.setFontSize(10);doc.setFont("helvetica","bold");rgb(WHITE);doc.text("Carences identifiees",MARGIN,y);y+=6;
    result.carences.forEach(c=>{
      if(y>250){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
      const nc=c.niveau==="critique"?RED:c.niveau==="faible"?ORANGE:c.niveau==="limite"?[251,191,36]:GREEN;
      fill([12,24,16]);doc.roundedRect(MARGIN,y,COL,40,3,3,"F");line(nc);doc.setLineWidth(0.4);doc.roundedRect(MARGIN,y,COL,40,3,3,"S");
      fill(nc);doc.roundedRect(MARGIN,y,3,40,1,1,"F");
      doc.setFontSize(11);doc.setFont("helvetica","bold");rgb(WHITE);doc.text(`${c.nom}`,MARGIN+8,y+9);
      fill(nc);doc.roundedRect(W-MARGIN-30,y+3,28,7,2,2,"F");doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(DARK);doc.text((c.niveau||"").toUpperCase(),W-MARGIN-16,y+8,{align:"center"});
      doc.setFontSize(8);doc.setFont("helvetica","normal");rgb([176,200,184]);doc.text(doc.splitTextToSize(c.signes||"",COL-16),MARGIN+8,y+17);
      fill([20,32,24]);doc.roundedRect(MARGIN+8,y+21,COL-16,3,1,1,"F");fill(nc);doc.roundedRect(MARGIN+8,y+21,(COL-16)*((c.pct||50)/100),3,1,1,"F");
      doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(GREEN);doc.text(`Aliments : ${(c.aliments||[]).slice(0,4).join(" - ")}`,MARGIN+8,y+30);
      if(c.complement){rgb(PURPLE);doc.text(`Complement : ${c.complement}${c.dose?" — "+c.dose:""}`,MARGIN+8,y+37);}
      y+=46;
    });
  }
  if(result?.positifs?.length>0){
    if(y>240){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
    const bH=10+result.positifs.length*7;fill([8,20,8]);doc.roundedRect(MARGIN,y,COL,bH,3,3,"F");line(GREEN);doc.setLineWidth(0.3);doc.roundedRect(MARGIN,y,COL,bH,3,3,"S");
    doc.setFontSize(8);doc.setFont("helvetica","bold");rgb(GREEN);doc.text("POINTS POSITIFS",MARGIN+6,y+6);y+=10;
    result.positifs.forEach(p=>{doc.setFontSize(8);doc.setFont("helvetica","normal");rgb([176,200,184]);doc.text(`• ${p}`,MARGIN+6,y);y+=7;});y+=4;
  }
  if(result?.conseil){
    if(y>240){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
    const cl=doc.splitTextToSize(result.conseil,COL-12);const cH=12+cl.length*6;
    fill([24,16,6]);doc.roundedRect(MARGIN,y,COL,cH,3,3,"F");line(GOLDC);doc.setLineWidth(0.3);doc.roundedRect(MARGIN,y,COL,cH,3,3,"S");
    doc.setFontSize(8);doc.setFont("helvetica","bold");rgb(GOLDC);doc.text("CONSEIL PERSONNALISE",MARGIN+6,y+6);
    doc.setFontSize(8.5);doc.setFont("helvetica","normal");rgb([160,188,170]);doc.text(cl,MARGIN+6,y+13);y+=cH+6;
    if(result?.prochain){doc.setFontSize(8);rgb(GRAY);doc.text("Prochain scan : ",MARGIN,y);doc.setFont("helvetica","bold");rgb(GOLDC);doc.text(result.prochain,MARGIN+35,y);y+=8;}
  }
  if(y>260){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
  fill([18,15,6]);doc.roundedRect(MARGIN,y+4,COL,14,2,2,"F");doc.setFontSize(7);doc.setFont("helvetica","normal");rgb([128,96,64]);
  doc.text(doc.splitTextToSize("Ce rapport est indicatif et ne remplace pas un avis medical professionnel. Consultez un medecin pour tout diagnostic.",COL-8),MARGIN+4,y+10);
  const pc=doc.getNumberOfPages();
  for(let i=1;i<=pc;i++){doc.setPage(i);fill([0,20,10]);doc.rect(0,285,W,12,"F");doc.setFontSize(7);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("vitascann.vercel.app",MARGIN,291);doc.text(`Page ${i} / ${pc}`,W/2,291,{align:"center"});doc.text("© 2026 VitaScann",W-MARGIN,291,{align:"right"});}
  doc.save(`VitaScann_${zone?.label||"rapport"}_${now.toISOString().slice(0,10)}.pdf`);
}

function Result({result,zone,user,onNewScan,onHome}) {
  const [exp,setExp]=useState(null);
  const [sharing,setSharing]=useState(false);
  const uc=result?.urgence==="urgent"?DANGER:result?.urgence==="attention"?WARN:EM;
  return (
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 22px",background:"radial-gradient(ellipse at 50% 0%,#071c0c 0%,#060d08 70%)"}}>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="serif" style={{fontSize:22,fontWeight:700}}>Votre rapport</div>
          <span style={{background:`${uc}14`,color:uc,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
            {result?.urgence==="urgent"?"⚠️ Urgent":result?.urgence==="attention"?"👁 Attention":"✅ Normal"}
          </span>
        </div>
        <div className="fu1" style={{display:"flex",alignItems:"center",gap:18}}>
          <ScoreRing score={result?.score||0} size={110}/>
          <div>
            <div style={{color:MUT,fontSize:11,marginBottom:3}}>Zone analysée</div>
            <div style={{fontWeight:700,fontSize:15}}>{zone.icon} {zone.label}</div>
            <div style={{color:MUT,fontSize:11,marginTop:8}}>Carences</div>
            <div style={{color:result?.carences?.length>0?DANGER:EM,fontWeight:700,fontSize:24}}>{result?.carences?.length||0}</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 18px"}}>
        {result?.carences?.length>0&&(
          <div className="fu2 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>🔍 Carences identifiées</div>
            {result.carences.map((c,i)=>(
              <div key={i} style={{marginBottom:14,borderBottom:i<result.carences.length-1?`1px solid ${BDR}`:"none",paddingBottom:i<result.carences.length-1?14:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:18}}>{c.emoji||"💊"}</span>
                    <span style={{fontWeight:700,fontSize:14}}>{c.nom}</span>
                  </div>
                  <NivPill n={c.niveau}/>
                </div>
                <div style={{fontSize:12,color:MUT,marginBottom:5,lineHeight:1.5}}>{c.signes}</div>
                <Bar v={c.pct||50} c={c.niveau==="critique"?DANGER:c.niveau==="faible"?WARN:"#c084fc"}/>
                <button onClick={()=>setExp(exp===i?null:i)} style={{background:"none",border:"none",color:EM,fontSize:11,fontWeight:600,cursor:"pointer",marginTop:7,padding:0}}>
                  {exp===i?"▲ Masquer":"▼ Recommandations"}
                </button>
                {exp===i&&(
                  <div style={{marginTop:10}}>
                    {c.aliments?.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:EM,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:6}}>🥗 ALIMENTS</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {c.aliments.map(a=><span key={a} style={{background:`${EM}12`,color:EM,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600}}>{a}</span>)}
                        </div>
                      </div>
                    )}
                    {c.complement&&(
                      <div style={{background:"#14102a",border:"1px solid #2a1f50",borderRadius:12,padding:"10px 13px"}}>
                        <div style={{color:"#c084fc",fontSize:10,fontWeight:700,marginBottom:3}}>💊 COMPLÉMENT</div>
                        <div style={{fontWeight:600,fontSize:13}}>{c.complement}</div>
                        {c.dose&&<div style={{color:MUT,fontSize:11,marginTop:2}}>{c.dose}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {result?.positifs?.length>0&&(
          <div className="fu3" style={{background:"#081408",border:`1px solid ${EM}28`,borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{color:EM,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:8}}>✅ POINTS POSITIFS</div>
            {result.positifs.map((p,i)=><div key={i} style={{fontSize:13,color:"#b0c8b8",marginBottom:5,lineHeight:1.5}}>• {p}</div>)}
          </div>
        )}
        {result?.conseil&&(
          <div className="fu4 card" style={{border:`1px solid ${GOLD}28`,marginBottom:14}}>
            <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:7}}>💬 CONSEIL PERSONNALISÉ</div>
            <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>{result.conseil}</div>
            {result.prochain&&<div style={{marginTop:10,fontSize:11,color:MUT}}>📍 Prochain scan : <span style={{color:GOLD,fontWeight:600}}>{result.prochain}</span></div>}
          </div>
        )}
        <div style={{background:"#120f06",border:"1px solid #2a2010",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#806040",lineHeight:1.6,marginBottom:16}}>
          ⚠️ Rapport indicatif. Consultez un professionnel de santé pour tout diagnostic médical.
        </div>
        <button onClick={async()=>{setSharing(true);await shareResult(result,zone);setSharing(false);}}
          style={{width:"100%",background:"linear-gradient(135deg,#1a2e20,#0f1e14)",border:`1.5px solid ${EM}55`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {sharing?"Partage...":"📤 Partager mon score"}
        </button>
        <button className="bem" onClick={()=>generatePDF(result,zone,user)} style={{marginBottom:10,background:"linear-gradient(135deg,#e2b84a,#c49a2e)",color:"#080400"}}>📄 Télécharger le rapport PDF</button>
        <button className="bem" onClick={onNewScan} style={{marginBottom:10}}>🔬 Scanner une autre zone</button>
        <button className="bgh" onClick={onHome}>🏠 Retour à l'accueil</button>
      </div>
    </div>
  );
}

// ─── PAYWALL 7,99$ ───
function Paywall({user,onBack,onSuccess}) {
  const [secs,setSecs]=useState(12*60);
  useEffect(()=>{const t=setInterval(()=>setSecs(s=>s>0?s-1:0),1000);return()=>clearInterval(t);},[]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");
  const urgent=secs<3*60;

  const handleCheckout=()=>{
    const url=`https://buy.stripe.com/test_7sY8wObvB8GV8hBcIaeQM00?prefilled_email=${encodeURIComponent(user?.email||"")}&client_reference_id=${user?.uid||""}`;
    window.location.href=url;
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Retour</button>

      {/* Compte à rebours */}
      <div style={{background:urgent?"#1a0505":"#0f1505",border:`1.5px solid ${urgent?DANGER:GOLD}44`,borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,color:urgent?DANGER:GOLD,fontWeight:700,letterSpacing:.8}}>{urgent?"🔥 OFFRE EXPIRE BIENTÔT":"⏰ OFFRE DE LANCEMENT"}</div>
          <div style={{fontSize:24,fontWeight:700,color:urgent?DANGER:GOLD,fontVariantNumeric:"tabular-nums",animation:urgent?"pulse 1s ease infinite":undefined}}>{mm}:{ss}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:MUT}}>Prix habituel</div>
          <div style={{fontSize:14,color:MUT,textDecoration:"line-through"}}>14,99$/mois</div>
          <div style={{fontSize:18,fontWeight:700,color:GOLD}}>7,99$/mois</div>
        </div>
      </div>

      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:50,marginBottom:12}}>👑</div>
        <div className="serif" style={{fontSize:26,fontWeight:700,color:GOLD,marginBottom:8}}>VitaScann Premium</div>
        <div style={{color:MUT,fontSize:14,lineHeight:1.7}}>
          Moins cher qu'un café par semaine.<br/>
          <span style={{color:"#edf5ef"}}>Connaître ce que votre corps vous dit, ça n'a pas de prix.</span>
        </div>
      </div>

      <div className="card" style={{marginBottom:20,border:`1px solid ${GOLD}33`}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:14}}>✨ CE QUE VOUS DÉBLOQUEZ</div>
        {[
          ["🔬","Scans corporels illimités","Ongles, yeux, peau, cheveux, langue, pieds, ventre, cuir chevelu"],
          ["🍽️","Scan Repas","Photo de votre assiette → calories, macros et carences comblées"],
          ["🧬","Profil santé personnalisé","Conseils adaptés à votre âge, poids et objectifs"],
          ["🌙","Mode halal","Compléments et aliments conformes signalés automatiquement"],
          ["📄","Rapport PDF","Téléchargeable et partageable avec votre médecin"],
          ["📈","Historique complet","Suivez votre progression semaine après semaine"],
        ].map(([ic,title,sub],i)=>(
          <div key={i} style={{display:"flex",gap:12,marginBottom:i<5?14:0,paddingBottom:i<5?14:0,borderBottom:i<5?`1px solid ${BDR}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${GOLD}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ic}</div>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{title}</div>
              <div style={{fontSize:11,color:MUT,marginTop:2,lineHeight:1.5}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"baseline",gap:10,marginBottom:4}}>
          <span style={{color:MUT,fontSize:15,textDecoration:"line-through"}}>14,99$</span>
          <div className="serif" style={{fontSize:44,fontWeight:700,color:GOLD}}>7,99<span style={{fontSize:20}}>$ CAD</span></div>
        </div>
        <div style={{color:MUT,fontSize:13}}>par mois · Annulez quand vous voulez</div>
        <div style={{color:EM,fontSize:12,fontWeight:600,marginTop:4}}>✅ -47% tarif de lancement</div>
      </div>

      <button className="bgold" onClick={handleCheckout} style={{marginBottom:12,fontSize:16,padding:"18px",boxShadow:urgent?`0 0 24px ${DANGER}33`:undefined}}>
        💳 S'abonner maintenant →
      </button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["🔒","Paiement sécurisé Stripe"],["❌","Sans engagement"],["💬","Support rapide"]].map(([ic,lb])=>(
          <div key={lb} style={{background:CARD,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:3}}>{ic}</div>
            <div style={{fontSize:9,color:MUT,lineHeight:1.4}}>{lb}</div>
          </div>
        ))}
      </div>

      <div style={{background:"#0a1a0c",border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontSize:12,color:MUT,lineHeight:1.6,textAlign:"center"}}>
        ⚠️ VitaScann fournit des <strong style={{color:"#edf5ef"}}>pistes nutritionnelles indicatives</strong>, pas des diagnostics médicaux. Consultez toujours un professionnel pour tout diagnostic.
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function VitaScann() {
  const [screen,setScreen]=useState("splash");
  const [user,setUser]=useState(null);
  const [zone,setZone]=useState(null);
  const [b64,setB64]=useState(null);
  const [prev,setPrev]=useState(null);
  const [result,setResult]=useState(null);
  const [mealResult,setMealResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [profile,setProfile]=useState(null);
  const [demoUsed,setDemoUsed]=useState(false);
  const [isMeal,setIsMeal]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("premium")==="success"){
      const uid=params.get("uid");
      if(uid){setDoc(doc(db,"users",uid),{plan:"premium"},{merge:true});setUser(u=>u?{...u,plan:"premium"}:u);}
      window.history.replaceState({},"",window.location.pathname);
    }
  },[]);

  useEffect(()=>{
    const unsub=AuthService.onAuthChange(async firebaseUser=>{
      if(firebaseUser){
        const userDoc=await getDoc(doc(db,"users",firebaseUser.uid));
        const userData=userDoc.exists()?userDoc.data():{};
        const u={uid:firebaseUser.uid,name:firebaseUser.displayName||userData.name||"Utilisateur",email:firebaseUser.email,plan:userData.plan||"free"};
        setUser(u);
        if(userData.profile)setProfile(userData.profile);
        const h=await ScanService.getHistory(firebaseUser.uid);
        setHistory(h);
        setScreen(userData.profile?"dashboard":"profile");
      } else {
        const seen=localStorage.getItem("vs_onboarding");
        setScreen(seen?"login":"onboarding");
      }
    });
    return()=>unsub();
  },[]);

  const analyze=useCallback(async()=>{
    setScreen("analyzing");
    try {
      const pc=profile?`Profil : ${profile.age||"?"}ans, ${profile.sexe||"?"}, objectif: ${profile.objectif||"?"}, activité: ${profile.activite||"?"}, halal: ${profile.halal?"oui":"non"}.`:"";
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:BODY_PROMPT,messages:[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
          {type:"text",text:`Zone : ${zone?.label}. ${pc} Analyse complète.`}
        ]}]})
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
      if(user?.uid&&!user?.isDemo){
        const sd={zone:zone?.label,score:parsed.score,urgence:parsed.urgence,carences:parsed.carences?.length||0};
        setHistory(h=>[{...sd,createdAt:{toDate:()=>new Date()}},...h]);
        await ScanService.saveScan(user.uid,sd);
      }
      if(user?.isDemo)setDemoUsed(true);
      setScreen("result");
    } catch(e){console.error(e);setScreen("capture");}
  },[b64,zone,user,profile]);

  const analyzeMeal=useCallback(async()=>{
    setScreen("analyzing");
    setIsMeal(true);
    try {
      const pc=profile?`Profil : ${profile.age||"?"}ans, ${profile.sexe||"?"}, objectif: ${profile.objectif||"?"}, halal: ${profile.halal?"oui":"non"}.`:"";
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:MEAL_PROMPT,messages:[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
          {type:"text",text:`Analyse ce repas. ${pc}`}
        ]}]})
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setMealResult(parsed);
      if(user?.uid&&!user?.isDemo){
        const sd={nom_repas:parsed.nom_repas,score:parsed.score_nutrition,type:"repas",calories:parsed.calories_estimees};
        setHistory(h=>[{...sd,createdAt:{toDate:()=>new Date()}},...h]);
        await ScanService.saveScan(user.uid,sd);
      }
      setScreen("meal_result");
    } catch(e){console.error(e);setScreen("meal_capture");}
  },[b64,user,profile]);

  const handleAuthSuccess=async u=>{
    setUser(u);
    const h=await ScanService.getHistory(u.uid).catch(()=>[]);
    setHistory(h);
    setScreen("profile");
  };

  const handleLogout=async()=>{
    await AuthService.logout();
    setUser(null);setHistory([]);setProfile(null);
    setScreen("login");
  };

  const handleDemo=()=>{
    if(demoUsed){setScreen("register");return;}
    setUser({uid:"demo",name:"Visiteur",email:"",plan:"free",isDemo:true});
    setHistory([]);
    setIsMeal(false);
    setScreen("zones");
  };

  const handleScan=()=>{
    if(user?.isDemo&&demoUsed){setScreen("register");return;}
    if(user?.plan==="free"&&!user?.isDemo&&history.length>=3){setScreen("paywall");return;}
    setIsMeal(false);
    setScreen("zones");
  };

  const handleMealScan=()=>{
    if(user?.plan!=="premium"&&!user?.isDemo){setScreen("paywall");return;}
    setIsMeal(true);
    setScreen("meal_capture");
  };

  return (
    <>
      <style>{G}</style>
      <div className="app" style={{overflowY:"auto"}}>
        {screen==="splash"       && <Splash onDone={()=>{}}/>}
        {screen==="onboarding"   && <Onboarding onDemo={handleDemo} onRegister={()=>{localStorage.setItem("vs_onboarding","1");setScreen("register");}} onLogin={()=>{localStorage.setItem("vs_onboarding","1");setScreen("login");}}/>}
        {screen==="register"     && <Register onSuccess={handleAuthSuccess} onLogin={()=>setScreen("login")}/>}
        {screen==="login"        && <Login onSuccess={handleAuthSuccess} onRegister={()=>setScreen("register")} onForgot={()=>setScreen("forgot")}/>}
        {screen==="forgot"       && <ForgotPassword onBack={()=>setScreen("login")}/>}
        {screen==="profile"      && <ProfileSetup user={user} onSave={p=>{setProfile(p);setScreen("dashboard");}} onSkip={()=>setScreen("dashboard")}/>}
        {screen==="dashboard"    && user && <Dashboard user={user} onScan={handleScan} onMealScan={handleMealScan} onPaywall={()=>setScreen("paywall")} onLogout={handleLogout} onProfile={()=>setScreen("profile")} history={history} profile={profile}/>}
        {screen==="zones"        && <ZonePick onSelect={z=>{setZone(z);setScreen("capture");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")}/>}
        {screen==="capture"      && zone && <Capture zone={zone} onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("preview");}} onBack={()=>setScreen("zones")}/>}
        {screen==="meal_capture" && <MealCapture onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("meal_preview");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")}/>}
        {screen==="preview"      && zone && <Preview zone={zone} preview={prev} onAnalyze={analyze} onRetake={()=>setScreen("capture")} isMeal={false}/>}
        {screen==="meal_preview" && <Preview zone={null} preview={prev} onAnalyze={analyzeMeal} onRetake={()=>setScreen("meal_capture")} isMeal={true}/>}
        {screen==="analyzing"    && <Analyzing zone={zone} isMeal={isMeal}/>}
        {screen==="result"       && result&&zone && <Result result={result} zone={zone} user={user} onNewScan={()=>setScreen("zones")} onHome={()=>setScreen("dashboard")}/>}
        {screen==="meal_result"  && mealResult && <MealResult result={mealResult} onNewScan={()=>setScreen("meal_capture")} onHome={()=>setScreen("dashboard")}/>}
        {screen==="paywall"      && <Paywall user={user} onBack={()=>setScreen(user&&!user.isDemo?"dashboard":"onboarding")} onSuccess={()=>{setUser(u=>({...u,plan:"premium"}));setScreen("dashboard");}}/>}
      </div>
    </>
  );
}

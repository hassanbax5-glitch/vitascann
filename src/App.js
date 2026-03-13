// ============================================
// VITASCANN — APP COMPLÈTE AVEC FIREBASE AUTH
// Copier dans src/App.jsx de ton projet Expo/React
// ============================================
//
// INSTALLATION REQUISE :
// npm install firebase
// npm install @stripe/stripe-react-native
//
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// ─── FIREBASE INIT ───
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

// ─── ANTHROPIC CONFIG ───
// ⚠️ EN PRODUCTION : mettre cette clé dans Firebase Cloud Functions
// Pour le développement local uniquement :
const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;
// ─── STRIPE CONFIG ───
const STRIPE_PK = process.env.REACT_APP_STRIPE_PK;
// ─── FIREBASE SERVICES ───
const AuthService = {
  // Inscription
  register: async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Créer le profil dans Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      plan: "free",
      scansCount: 0,
      createdAt: serverTimestamp(),
    });
    return cred.user;
  },

  // Connexion
  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Récupérer le profil Firestore
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    return { ...cred.user, ...userDoc.data() };
  },

  // Mot de passe oublié
  resetPassword: (email) => sendPasswordResetEmail(auth, email),

  // Déconnexion
  logout: () => signOut(auth),

  // Écouter l'état auth
  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
};

const ScanService = {
  // Sauvegarder un scan
  saveScan: async (userId, scanData) => {
    const ref = await addDoc(collection(db, "scans"), {
      userId,
      ...scanData,
      createdAt: serverTimestamp(),
    });
    // Incrémenter le compteur
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    await setDoc(userRef, { scansCount: (userDoc.data()?.scansCount || 0) + 1 }, { merge: true });
    return ref.id;
  },

  // Récupérer l'historique
  getHistory: async (userId) => {
    const q = query(
      collection(db, "scans"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

// ─── GLOBAL STYLES ───
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#060d08;}
::-webkit-scrollbar{width:0;}
.app{font-family:'Outfit',sans-serif;background:#060d08;color:#edf5ef;max-width:430px;margin:0 auto;min-height:100vh;overflow-x:hidden;}
.serif{font-family:'Cormorant Garamond',serif;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes glow{0%,100%{box-shadow:0 0 24px #00ff8820}50%{box-shadow:0 0 60px #00ff8855}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes scanPulse{0%,100%{opacity:.3;transform:scaleX(.6)}50%{opacity:1;transform:scaleX(1)}}
@keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
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
.card{background:#0c1810;border:1px solid #192c1d;border-radius:18px;padding:18px;}
`;

const EM="#00ff88",GOLD="#e2b84a",MUT="#4a6e52",DANGER="#ff5555",WARN="#ffaa33";
const CARD="#0c1810",BDR="#192c1d";

const ZONES=[
  {id:"nails",icon:"💅",label:"Ongles",hint:"Posez votre main à plat",vitamins:"B12 · C · Fer · Zinc",color:"#c084fc"},
  {id:"skin", icon:"🖐️",label:"Peau",  hint:"Face interne du poignet",vitamins:"D · B3 · Zinc",color:"#fb923c"},
  {id:"hair", icon:"💇",label:"Cheveux",hint:"Cuir chevelu, racines",vitamins:"Biotine · Fer · B7",color:"#f472b6"},
  {id:"eyes", icon:"👁️",label:"Yeux",  hint:"Blanc de l'œil visible",vitamins:"A · Fer",color:"#38bdf8"},
  {id:"tongue",icon:"👅",label:"Langue",hint:"Tirée, bonne lumière",vitamins:"B2 · B3 · B12",color:"#f87171"},
];

const AI_PROMPT=`Tu es VitaScann, IA médicale spécialisée en détection visuelle de carences nutritionnelles.
Analyse l'image et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"score":0-100,"urgence":"normal|attention|urgent","carences":[{"nom":"Vitamine X","niveau":"critique|faible|limite|normal","pct":0-100,"emoji":"🟡","signes":"observation","aliments":["a1","a2","a3"],"complement":"Nom","dose":"500mg/j"}],"positifs":["p1","p2"],"conseil":"2 phrases.","prochain":"zone suivante"}`;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// ─── UI COMPONENTS ───
function Spin(){return <div style={{width:18,height:18,border:"2.5px solid #00000033",borderTopColor:"#000",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;}

function Input({label,type="text",value,onChange,placeholder,left,error,disabled}){
  const[show,setShow]=useState(false);const ip=type==="password";
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{color:MUT,fontSize:11,fontWeight:600,letterSpacing:.8,marginBottom:5}}>{label}</div>}
      <div style={{position:"relative"}}>
        {left&&<div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:17}}>{left}</div>}
        <input className="inp" type={ip&&!show?"password":"text"} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={{paddingLeft:left?44:16,paddingRight:ip?44:16,borderColor:error?DANGER:undefined,opacity:disabled?.6:1}}/>
        {ip&&<button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:MUT}}>{show?"🙈":"👁️"}</button>}
      </div>
      {error&&<div style={{color:DANGER,fontSize:11,marginTop:4}}>⚠ {error}</div>}
    </div>
  );
}

function Bar({v,c}){return(<div style={{background:"#142018",borderRadius:4,height:5,overflow:"hidden",marginTop:5}}><div style={{width:`${v}%`,height:"100%",background:c||EM,borderRadius:4,boxShadow:`0 0 6px ${c||EM}`,transition:"width 1.6s ease"}}/></div>);}

function ScoreRing({score,size=130}){
  const r=size*.37,circ=2*Math.PI*r,fill=(score/100)*circ;
  const c=score>=75?EM:score>=50?WARN:DANGER;
  return(
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#142018" strokeWidth={size*.075}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={size*.075} strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1.8s ease",filter:`drop-shadow(0 0 6px ${c})`}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div className="serif" style={{fontSize:size*.27,fontWeight:700,color:c,lineHeight:1}}>{score}</div>
        <div style={{fontSize:size*.09,color:MUT,marginTop:2}}>/ 100</div>
      </div>
    </div>
  );
}

function NivPill({n}){
  const m={critique:[DANGER,"#1a0808"],faible:[WARN,"#1a1000"],limite:["#fbbf24","#1a1500"],normal:[EM,"#001a0a"]};
  const[fg,bg]=m[n]||[MUT,CARD];
  return <span style={{background:bg,color:fg,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{n?.toUpperCase()}</span>;
}

function ErrorBanner({msg,onClose}){
  if(!msg)return null;
  return(
    <div style={{background:"#ff555514",border:`1px solid ${DANGER}44`,borderRadius:10,padding:"10px 14px",color:DANGER,fontSize:12,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span>⚠ {msg}</span>
      {onClose&&<button onClick={onClose} style={{background:"none",border:"none",color:DANGER,cursor:"pointer",fontSize:16}}>×</button>}
    </div>
  );
}

// ─── SCREENS ───

function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2200);return()=>clearTimeout(t);},[]);
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 40%,#061a0a 0%,#060d08 70%)"}}>
      <div style={{animation:"glow 2s ease infinite,floatY 3s ease-in-out infinite",marginBottom:28}}>
        <div style={{width:110,height:110,borderRadius:30,background:`linear-gradient(135deg,${EM},#007744)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60}}>🌿</div>
      </div>
      <div className="serif fu" style={{fontSize:48,fontWeight:700,color:"#edf5ef",letterSpacing:-1}}>VitaScann</div>
      <div className="fu1" style={{color:MUT,fontSize:13,letterSpacing:2,marginTop:6}}>INTELLIGENCE NUTRITIONNELLE</div>
    </div>
  );
}

// ─── AUTH SCREENS ───
function Register({onSuccess,onLogin}){
  const[f,setF]=useState({name:"",email:"",pass:"",conf:""});
  const[errs,setErrs]=useState({});
  const[load,setLoad]=useState(false);
  const[step,setStep]=useState(1);
  const[globalErr,setGlobalErr]=useState("");

  const validate=()=>{
    const e={};
    if(!f.name.trim())e.name="Nom requis";
    if(!f.email.includes("@"))e.email="Email invalide";
    if(f.pass.length<8)e.pass="8 caractères minimum";
    if(f.pass!==f.conf)e.conf="Les mots de passe ne correspondent pas";
    setErrs(e);return Object.keys(e).length===0;
  };

  const submit=async()=>{
    if(!validate())return;
    setLoad(true);setGlobalErr("");
    try{
      const user=await AuthService.register(f.email,f.pass,f.name);
      setStep(2);
      await sleep(1500);
      onSuccess({uid:user.uid,name:f.name,email:f.email,plan:"free"});
    }catch(e){
      const msg=e.code==="auth/email-already-in-use"?"Cet email est déjà utilisé.":e.code==="auth/weak-password"?"Mot de passe trop faible.":"Erreur lors de l'inscription. Réessayez.";
      setGlobalErr(msg);
    }finally{setLoad(false);}
  };

  const strength=f.pass.length>=12?4:f.pass.length>=8?3:f.pass.length>=5?2:f.pass.length>0?1:0;

  if(step===2)return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>
      <div style={{fontSize:80,animation:"pop .5s ease",marginBottom:20}}>✅</div>
      <div className="serif" style={{fontSize:28,fontWeight:700,marginBottom:8}}>Compte créé !</div>
      <div style={{color:MUT,fontSize:14}}>Bienvenue Hassan 🌿</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>Créer votre compte</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>Commencez votre bilan gratuit</div>
      </div>
      <ErrorBanner msg={globalErr} onClose={()=>setGlobalErr("")}/>
      <Input label="NOM COMPLET" value={f.name} onChange={v=>setF({...f,name:v})} placeholder="Votre nom" left="👤" error={errs.name} disabled={load}/>
      <Input label="EMAIL" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="vous@email.com" left="✉️" error={errs.email} disabled={load}/>
      <Input label="MOT DE PASSE" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="8 caractères minimum" left="🔒" error={errs.pass} disabled={load}/>
      {f.pass.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:4,marginBottom:4}}>
            {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?(strength>=4?EM:strength>=3?WARN:DANGER):BDR,transition:"background .3s"}}/>)}
          </div>
          <div style={{fontSize:10,color:MUT}}>{strength>=4?"🟢 Fort":strength>=3?"🟡 Moyen":"🔴 Faible"}</div>
        </div>
      )}
      <Input label="CONFIRMER" type="password" value={f.conf} onChange={v=>setF({...f,conf:v})} placeholder="Répétez le mot de passe" left="🔒" error={errs.conf} disabled={load}/>
      <div style={{fontSize:11,color:MUT,lineHeight:1.6,marginBottom:18}}>
        En créant un compte vous acceptez nos <span style={{color:EM,cursor:"pointer"}}>CGU</span> et <span style={{color:EM,cursor:"pointer"}}>Politique de confidentialité</span>.
      </div>
      <button className="bem" onClick={submit} disabled={load}>{load?<Spin/>:"Créer mon compte →"}</button>
      <div style={{textAlign:"center",marginTop:16,fontSize:13,color:MUT}}>Déjà un compte ? <span style={{color:EM,cursor:"pointer",fontWeight:600}} onClick={onLogin}>Se connecter</span></div>
    </div>
  );
}

function Login({onSuccess,onRegister,onForgot}){
  const[f,setF]=useState({email:"",pass:""});
  const[err,setErr]=useState("");
  const[load,setLoad]=useState(false);

  const go=async()=>{
    if(!f.email||!f.pass){setErr("Remplissez tous les champs");return;}
    setLoad(true);setErr("");
    try{
      const user=await AuthService.login(f.email,f.pass);
      onSuccess({uid:user.uid,name:user.displayName||user.name||f.email.split("@")[0],email:f.email,plan:user.plan||"free"});
    }catch(e){
      const msg=e.code==="auth/invalid-credential"||e.code==="auth/wrong-password"?"Email ou mot de passe incorrect.":e.code==="auth/user-not-found"?"Aucun compte avec cet email.":"Erreur de connexion. Réessayez.";
      setErr(msg);
    }finally{setLoad(false);}
  };

  return(
    <div style={{minHeight:"100vh",padding:"52px 24px 40px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>Bon retour !</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>Connectez-vous à votre compte</div>
      </div>
      <ErrorBanner msg={err} onClose={()=>setErr("")}/>
      <Input label="EMAIL" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="vous@email.com" left="✉️" disabled={load}/>
      <Input label="MOT DE PASSE" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="Votre mot de passe" left="🔒" disabled={load}/>
      <div style={{textAlign:"right",marginBottom:18,marginTop:-6}}>
        <span style={{color:EM,fontSize:12,cursor:"pointer"}} onClick={onForgot}>Mot de passe oublié ?</span>
      </div>
      <button className="bem" onClick={go} disabled={load}>{load?<Spin/>:"Se connecter →"}</button>
      <div style={{textAlign:"center",marginTop:16,fontSize:13,color:MUT}}>Pas de compte ? <span style={{color:EM,cursor:"pointer",fontWeight:600}} onClick={onRegister}>S'inscrire</span></div>
    </div>
  );
}

function ForgotPassword({onBack}){
  const[email,setEmail]=useState("");
  const[sent,setSent]=useState(false);
  const[load,setLoad]=useState(false);
  const[err,setErr]=useState("");

  const handle=async()=>{
    if(!email.includes("@")){setErr("Email invalide");return;}
    setLoad(true);
    try{
      await AuthService.resetPassword(email);
      setSent(true);
    }catch(e){setErr("Erreur. Vérifiez l'email.");}
    finally{setLoad(false);}
  };

  return(
    <div style={{minHeight:"100vh",padding:"52px 24px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:48,marginBottom:12}}>{sent?"📬":"🔑"}</div>
        <div className="serif fu1" style={{fontSize:22,fontWeight:700}}>{sent?"Email envoyé !":"Mot de passe oublié"}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:6,lineHeight:1.6}}>
          {sent?`Lien envoyé à ${email}. Vérifiez vos spams.`:"Entrez votre email pour recevoir un lien de réinitialisation."}
        </div>
      </div>
      {!sent&&(<>
        <ErrorBanner msg={err} onClose={()=>setErr("")}/>
        <Input value={email} onChange={setEmail} placeholder="vous@email.com" left="✉️"/>
        <button className="bem" onClick={handle} disabled={load||!email.includes("@")}>{load?<Spin/>:"Envoyer le lien →"}</button>
      </>)}
      {sent&&<button className="bem" onClick={onBack}>← Retour à la connexion</button>}
    </div>
  );
}

// ─── DASHBOARD ───
function Dashboard({user,onScan,onPaywall,onLogout,history}){
  const avgScore=history.length>0?Math.round(history.reduce((a,b)=>a+(b.score||0),0)/history.length):76;
  return(
    <div style={{minHeight:"100vh",paddingBottom:90}}>
      <div style={{padding:"52px 22px 22px",background:"radial-gradient(ellipse at 50% 0%,#071c0c 0%,#060d08 70%)"}}>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{color:MUT,fontSize:12,marginBottom:3}}>Bonjour 👋</div>
            <div className="serif" style={{fontSize:26,fontWeight:700}}>{user.name}</div>
            <span style={{background:user.plan==="premium"?`${GOLD}20`:`${EM}12`,color:user.plan==="premium"?GOLD:EM,border:`1px solid ${user.plan==="premium"?GOLD:EM}33`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,display:"inline-block",marginTop:6}}>
              {user.plan==="premium"?"👑 Premium":"🌱 Plan Gratuit"}
            </span>
          </div>
          <button onClick={onLogout} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:11,color:MUT,fontFamily:"'Outfit',sans-serif"}}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{padding:"0 18px"}}>
        {/* Score card */}
        <div className="fu1" style={{background:"linear-gradient(135deg,#0b1e10,#081408)",border:`1px solid ${EM}28`,borderRadius:18,padding:"22px 18px",display:"flex",alignItems:"center",gap:18,marginBottom:14,animation:"glow 3s ease infinite"}}>
          <ScoreRing score={avgScore} size={105}/>
          <div>
            <div style={{color:MUT,fontSize:11,fontWeight:600,letterSpacing:.8,marginBottom:5}}>SCORE SANTÉ MOYEN</div>
            <div className="serif" style={{fontSize:20,fontWeight:700}}>{avgScore>=75?"Très bien !":avgScore>=50?"Peut mieux faire":"À améliorer"}</div>
            <div style={{color:MUT,fontSize:12,marginTop:3}}>{history.length} scan{history.length>1?"s":""} effectué{history.length>1?"s":""}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <button onClick={onScan} style={{background:`${EM}0e`,border:`1px solid ${EM}30`,borderRadius:16,padding:"18px 12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
            <div style={{fontSize:30,marginBottom:8}}>🔬</div>
            <div style={{color:EM,fontWeight:700,fontSize:14}}>Nouveau Scan</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>Analyser maintenant</div>
          </button>
          <div className="card" style={{padding:"18px 12px"}}>
            <div style={{fontSize:30,marginBottom:8}}>📊</div>
            <div style={{fontWeight:700,fontSize:14}}>Historique</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>{history.length} scans</div>
          </div>
        </div>

        {/* Historique récent */}
        {history.length>0&&(
          <div className="fu3 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📅 Scans récents</div>
            {history.slice(0,3).map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?`1px solid ${BDR}`:"none"}}>
                <ScoreRing score={h.score||75} size={52}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{h.zone||"Scan"}</div>
                  <div style={{color:MUT,fontSize:11,marginTop:2}}>
                    {h.createdAt?.toDate?.()?.toLocaleDateString("fr")||"Récent"}
                  </div>
                </div>
                <span style={{background:h.score>=75?`${EM}20`:WARN+"20",color:h.score>=75?EM:WARN,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>
                  {h.score>=75?"Bien":"Attention"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade */}
        {user.plan==="free"&&(
          <div className="fu4" style={{background:"linear-gradient(135deg,#181005,#100b03)",border:`1.5px solid ${GOLD}38`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:28,marginBottom:8}}>👑</div>
            <div className="serif" style={{fontSize:18,fontWeight:700,color:GOLD,marginBottom:5}}>Passez Premium</div>
            <div style={{color:MUT,fontSize:13,lineHeight:1.6,marginBottom:14}}>Scans illimités, 5 zones, rapport PDF et conseils IA.</div>
            <button className="bgold" onClick={onPaywall}>Essai 7 jours gratuit →</button>
          </div>
        )}

        {/* Conseil */}
        <div className="card" style={{border:`1px solid ${GOLD}28`}}>
          <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:7}}>✨ CONSEIL DU JOUR</div>
          <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>15 min de soleil chaque matin booste naturellement votre Vitamine D. Mangez sardines et œufs cette semaine.</div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(8,14,10,.95)",backdropFilter:"blur(20px)",borderTop:`1px solid ${BDR}`,padding:"10px 0 22px",display:"flex",justifyContent:"space-around"}}>
        {[["🏠","Accueil",true],["🔬","Scanner",false],["📊","Stats",false],["👤","Profil",false]].map(([ic,lb,act])=>(
          <button key={lb} onClick={lb==="Scanner"?onScan:undefined} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:20}}>{ic}</div>
            <div style={{fontSize:10,color:act?EM:MUT,fontWeight:act?600:400}}>{lb}</div>
            {act&&<div style={{width:4,height:4,borderRadius:2,background:EM}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SCAN SCREENS ───
function ZonePick({onSelect,onBack}){
  return(
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>Choisir une zone</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>Sélectionnez la zone à analyser</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {ZONES.map((z,i)=>(
          <button key={z.id} onClick={()=>onSelect(z)}
            style={{display:"flex",alignItems:"center",gap:14,background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"15px 16px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${z.color}55`;e.currentTarget.style.background=`${z.color}08`;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${BDR}`;e.currentTarget.style.background=CARD;}}>
            <div style={{width:50,height:50,borderRadius:14,background:`${z.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{z.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{z.label}</div>
              <div style={{fontSize:11,color:MUT,marginTop:2}}>{z.hint}</div>
              <div style={{fontSize:10,color:z.color,marginTop:4,fontWeight:600}}>Détecte : {z.vitamins}</div>
            </div>
            <div style={{color:MUT,fontSize:18}}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Capture({zone,onCapture,onBack}){
  const ref=useRef();
  const handle=e=>{
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=ev=>onCapture(ev.target.result.split(",")[1],ev.target.result);
    r.readAsDataURL(file);
  };
  return(
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

function Preview({zone,preview,onAnalyze,onRetake}){
  return(
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:16}}>Aperçu du scan</div>
      <div className="fu1" style={{borderRadius:22,overflow:"hidden",marginBottom:16,position:"relative",boxShadow:"0 20px 60px #00000066"}}>
        <img src={preview} alt="scan" style={{width:"100%",maxHeight:300,objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",bottom:14,left:14}}>
          <span style={{background:zone.color,color:"#000",borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700}}>{zone.icon} {zone.label}</span>
        </div>
      </div>
      <button className="bem fu2" onClick={onAnalyze} style={{marginBottom:10}}>🔬 Analyser avec VitaScann IA</button>
      <button className="bgh fu3" onClick={onRetake}>↩ Reprendre la photo</button>
    </div>
  );
}

function Analyzing({zone}){
  const[cur,setCur]=useState(0);
  const steps=["Détection de la zone...","Analyse des pigmentations...","Comparaison base médicale...","Calcul des carences...","Génération du rapport..."];
  useEffect(()=>{const t=setInterval(()=>setCur(s=>Math.min(s+1,steps.length-1)),850);return()=>clearInterval(t);},[]);
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{position:"relative",width:120,height:120,marginBottom:28}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`3px solid ${zone.color}20`}}/>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"3px solid transparent",borderTopColor:zone.color,animation:"spin 1s linear infinite"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{zone.icon}</div>
      </div>
      <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:6}}>Analyse en cours</div>
      <div style={{color:MUT,fontSize:13,marginBottom:36}}>Examen de vos {zone.label}</div>
      <div style={{width:"100%",maxWidth:300}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,opacity:i<=cur?1:.18,transition:"opacity .4s"}}>
            <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:i<cur?EM:i===cur?zone.color:BDR,transition:"background .3s"}}/>
            <div style={{fontSize:13,color:i<=cur?"#edf5ef":MUT,fontWeight:i===cur?600:400}}>{s}</div>
            {i<cur&&<div style={{marginLeft:"auto",color:EM,fontSize:13}}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Result({result,zone,onNewScan,onHome}){
  const[exp,setExp]=useState(null);
  const uc=result?.urgence==="urgent"?DANGER:result?.urgence==="attention"?WARN:EM;
  return(
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
        <button className="bem" onClick={onNewScan} style={{marginBottom:10}}>🔬 Scanner une autre zone</button>
        <button className="bgh" onClick={onHome}>🏠 Retour à l'accueil</button>
      </div>
    </div>
  );
}

// ─── PAYWALL ───
const STRIPE_PRICE_ID = "price_1TAd31C4YmUeoFrhAKUzpnPf";

function Paywall({user, onBack, onSuccess}){
  const[load,setLoad]=useState(false);

  const handleCheckout=async()=>{
    setLoad(true);
    try{
      // Charger Stripe dynamiquement
      const {loadStripe}=await import("https://esm.sh/@stripe/stripe-js");
      const stripe=await loadStripe(STRIPE_PK);
      await stripe.redirectToCheckout({
        lineItems:[{price:STRIPE_PRICE_ID,quantity:1}],
        mode:"subscription",
        successUrl:`${window.location.origin}?premium=success&uid=${user?.uid}`,
        cancelUrl:`${window.location.origin}?premium=cancel`,
        customerEmail:user?.email,
      });
    }catch(e){
      console.error(e);
      setLoad(false);
    }
  };

  return(
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",textAlign:"center"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>← Retour</button>
      <div style={{fontSize:56,marginBottom:16}}>👑</div>
      <div className="serif fu" style={{fontSize:28,fontWeight:700,color:GOLD,marginBottom:8}}>VitaScann Premium</div>
      <div className="fu1" style={{color:MUT,fontSize:14,marginBottom:32}}>Débloquez toutes les fonctionnalités</div>
      
      <div className="fu2 card" style={{textAlign:"left",marginBottom:24,border:`1px solid ${GOLD}33`}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:14}}>✨ INCLUS DANS PREMIUM</div>
        {["🔬 Scans illimités","📊 8+ zones d'analyse (pieds, ventre, etc.)","📄 Rapport PDF téléchargeable","📈 Historique complet","🥗 Recommandations halal & Maghrébi","💊 Compléments alimentaires personnalisés"].map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,fontSize:13,color:"#b0c8b8"}}>
            <span style={{color:EM,fontSize:16}}>✓</span>{f}
          </div>
        ))}
      </div>

      <div style={{marginBottom:24}}>
        <div className="serif" style={{fontSize:42,fontWeight:700,color:GOLD}}>9,99<span style={{fontSize:20}}>$ CAD</span></div>
        <div style={{color:MUT,fontSize:13}}>par mois · Annulez à tout moment</div>
      </div>

      <button className="bgold" onClick={handleCheckout} disabled={load} style={{marginBottom:12}}>
        {load?<Spin/>:"💳 S'abonner maintenant →"}
      </button>
      <div style={{color:MUT,fontSize:11,lineHeight:1.6}}>🔒 Paiement sécurisé par Stripe · SSL · Aucun engagement</div>
    </div>
  );
}

// ─── MAIN APP ───
export default function VitaScann(){
  const[screen,setScreen]=useState("splash");
  const[user,setUser]=useState(null);
  const[zone,setZone]=useState(null);
  const[b64,setB64]=useState(null);
  const[prev,setPrev]=useState(null);
  const[result,setResult]=useState(null);
  const[history,setHistory]=useState([]);

  // Gérer le retour Stripe
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("premium")==="success"){
      const uid=params.get("uid");
      if(uid){
        setDoc(doc(db,"users",uid),{plan:"premium"},{merge:true});
        setUser(u=>u?{...u,plan:"premium"}:u);
      }
      window.history.replaceState({},"",window.location.pathname);
    }
  },[]);

  // Écouter l'état Firebase Auth au démarrage
  useEffect(()=>{
    const unsub=AuthService.onAuthChange(async(firebaseUser)=>{
      if(firebaseUser){
        const userDoc=await getDoc(doc(db,"users",firebaseUser.uid));
        const userData=userDoc.exists()?userDoc.data():{};
        const u={uid:firebaseUser.uid,name:firebaseUser.displayName||userData.name||"Utilisateur",email:firebaseUser.email,plan:userData.plan||"free"};
        setUser(u);
        // Charger l'historique
        const h=await ScanService.getHistory(firebaseUser.uid);
        setHistory(h);
        setScreen("dashboard");
      }
    });
    return()=>unsub();
  },[]);

  const analyze=useCallback(async()=>{
    setScreen("analyzing");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:AI_PROMPT,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
            {type:"text",text:`Zone : ${zone?.label}. Analyse complète.`}
          ]}]
        })
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
      // Sauvegarder dans Firestore
      if(user?.uid){
        const scanData={zone:zone?.label,score:parsed.score,urgence:parsed.urgence,carences:parsed.carences?.length||0};
        const newScan={...scanData,createdAt:{toDate:()=>new Date()}};
        setHistory(h=>[newScan,...h]);
        await ScanService.saveScan(user.uid,scanData);
      }
      setScreen("result");
    }catch(e){
      console.error(e);
      setScreen("capture");
    }
  },[b64,zone,user]);

  const handleAuthSuccess=async(u)=>{
    setUser(u);
    const h=await ScanService.getHistory(u.uid).catch(()=>[]);
    setHistory(h);
    setScreen("dashboard");
  };

  const handleLogout=async()=>{
    await AuthService.logout();
    setUser(null);setHistory([]);
    setScreen("login");
  };

  return(
    <>
      <style>{G}</style>
      <div className="app" style={{overflowY:"auto"}}>
        {screen==="splash"    && <Splash onDone={()=>setScreen(user?"dashboard":"login")}/>}
        {screen==="register"  && <Register onSuccess={handleAuthSuccess} onLogin={()=>setScreen("login")}/>}
        {screen==="login"     && <Login onSuccess={handleAuthSuccess} onRegister={()=>setScreen("register")} onForgot={()=>setScreen("forgot")}/>}
        {screen==="forgot"    && <ForgotPassword onBack={()=>setScreen("login")}/>}
        {screen==="dashboard" && user && <Dashboard user={user} onScan={()=>setScreen("zones")} onPaywall={()=>setScreen("paywall")} onLogout={handleLogout} history={history}/>}
        {screen==="zones"     && <ZonePick onSelect={z=>{setZone(z);setScreen("capture");}} onBack={()=>setScreen("dashboard")}/>}
        {screen==="capture"   && zone && <Capture zone={zone} onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("preview");}} onBack={()=>setScreen("zones")}/>}
        {screen==="preview"   && zone && <Preview zone={zone} preview={prev} onAnalyze={analyze} onRetake={()=>setScreen("capture")}/>}
        {screen==="analyzing" && zone && <Analyzing zone={zone}/>}
        {screen==="result"    && result && zone && <Result result={result} zone={zone} onNewScan={()=>setScreen("zones")} onHome={()=>setScreen("dashboard")}/>}
        {screen==="paywall" && <Paywall user={user} onBack={()=>setScreen("dashboard")} onSuccess={()=>{setUser(u=>({...u,plan:"premium"}));setScreen("dashboard");}}/>}
      </div>
    </>
  );
}

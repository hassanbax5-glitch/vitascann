// ============================================
// SOLO LEVELING CHALLENGE — VitaScann
// Défi 7 jours · 9 rangs F→SSS compressés
// 3 séries validées une par une avec caméra
// Push-ups · Squats · Hanging Leg Raises · Pull-ups
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";

const EM = "#00ff88", GOLD = "#e2b84a", MUT = "#4a6e52";
const CARD = "#0c1810", BDR = "#192c1d";
const DANGER = "#ef4444";

// ─── Images Sung Jin-Woo (remplace par tes URLs Cloudinary) ───
// Upload les 10 images sur Cloudinary dpkpzqdni et colle les URLs ici
const SJW_IMAGES = {
  F:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140750_xjojg6",
  E:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140758_gqamvs",
  D:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140813_ldgtxl",
  C:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140822_qzmd83",
  B:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140833_e03htd",
  A:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140844_syfvio",
  S:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140857_k6fvos",
  SS:  "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140907_bjs9u3",
  SSS: "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-27_140805_spo9bh",
};

// ─── Configuration des 9 rangs — 7 jours, 1 rang/jour ───
// Chaque rang = 1 jour du défi 7 jours
// 3 séries par séance · reps progressives
const RANGS = [
  { id:"F",   label:"Rang F",   jour:1, color:"#9ca3af", bg:"#1a1a1a", glow:"#9ca3af33",
    reps:{ pushup:15, squat:20, legRaise:10, pullup:3 }, series:3,
    desc:"L'éveil commence.", descEn:"The awakening begins.",
    badge:"⚪", unlock:"Jour 1" },
  { id:"E",   label:"Rang E",   jour:2, color:"#22c55e", bg:"#051a0a", glow:"#22c55e33",
    reps:{ pushup:20, squat:25, legRaise:15, pullup:4 }, series:3,
    desc:"Tu te relèves.", descEn:"You rise.",
    badge:"🟢", unlock:"Jour 2" },
  { id:"D",   label:"Rang D",   jour:3, color:"#3b82f6", bg:"#05101a", glow:"#3b82f633",
    reps:{ pushup:30, squat:35, legRaise:20, pullup:6 }, series:3,
    desc:"La discipline s'installe.", descEn:"Discipline sets in.",
    badge:"🔵", unlock:"Jour 3" },
  { id:"C",   label:"Rang C",   jour:4, color:"#a16207", bg:"#1a1005", glow:"#a1620733",
    reps:{ pushup:40, squat:45, legRaise:25, pullup:8 }, series:3,
    desc:"Confiance et régularité.", descEn:"Confidence and consistency.",
    badge:"🟤", unlock:"Jour 4" },
  { id:"B",   label:"Rang B",   jour:5, color:"#6366f1", bg:"#0d0520", glow:"#6366f133",
    reps:{ pushup:50, squat:55, legRaise:30, pullup:10 }, series:3,
    desc:"Tu transcendes tes limites.", descEn:"You transcend your limits.",
    badge:"🔷", unlock:"Jour 5" },
  { id:"A",   label:"Rang A",   jour:6, color:"#f59e0b", bg:"#1a1005", glow:"#f59e0b33",
    reps:{ pushup:65, squat:70, legRaise:40, pullup:15 }, series:3,
    desc:"La maîtrise de soi.", descEn:"Mastery of self.",
    badge:"🟡", unlock:"Jour 6" },
  { id:"S",   label:"Rang S",   jour:7, color:"#e879f9", bg:"#1a0520", glow:"#e879f933",
    reps:{ pushup:80, squat:80, legRaise:50, pullup:20 }, series:3,
    desc:"Élite. Très peu y arrivent.", descEn:"Elite. Very few make it.",
    badge:"🟣", unlock:"Jour 7" },
  { id:"SS",  label:"Rang SS",  jour:7, color:"#f97316", bg:"#1a0a00", glow:"#f9731633",
    reps:{ pushup:90, squat:90, legRaise:60, pullup:25 }, series:3,
    desc:"Au-delà de l'humain.", descEn:"Beyond human.",
    badge:"🔶", unlock:"Jour 7 complété" },
  { id:"SSS", label:"Rang SSS", jour:7, color:"#fbbf24", bg:"#1a1000", glow:"#fbbf2433",
    reps:{ pushup:100, squat:100, legRaise:75, pullup:30 }, series:3,
    desc:"Le chasseur qui domine l'ombre.", descEn:"The hunter who dominates the shadow.",
    badge:"⭐", unlock:"Défi 7j x3 complété" },
];

// ─── Questions évaluation rang initial ───
const EVAL_QUESTIONS_FR = [
  { id:"pushup_max", question:"Combien de push-ups tu peux faire d'affilée sans pause ?",
    options:["Moins de 10 😬", "10-20 🌱", "20-40 💪", "40-60 🔥", "60-100 ⚡", "100+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"squat_max", question:"Combien de squats consécutifs tu peux faire ?",
    options:["Moins de 15 😬", "15-30 🌱", "30-50 💪", "50-80 🔥", "80-120 ⚡", "120+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"pullup_max", question:"Combien de pull-ups tu peux faire ?",
    options:["0 — j'y arrive pas encore 😅", "1-3 🌱", "4-8 💪", "9-15 🔥", "16-25 ⚡", "25+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"frequence", question:"Tu t'entraînes combien de fois par semaine ?",
    options:["Jamais ou presque 🛋️", "1-2x par semaine 🚶", "3-4x par semaine 🏃", "5-6x par semaine 💪", "Tous les jours ⚡"],
    weights:[0,1,2,3,4] },
  { id:"experience", question:"Depuis combien de temps tu fais de la calisthenics ?",
    options:["Je débute 🌱", "Moins de 6 mois 📅", "6 mois - 1 an 💪", "1-3 ans 🔥", "3+ ans 👑"],
    weights:[0,1,2,3,4] },
];

const EVAL_QUESTIONS_EN = [
  { id:"pushup_max", question:"How many push-ups can you do in a row without stopping?",
    options:["Less than 10 😬", "10-20 🌱", "20-40 💪", "40-60 🔥", "60-100 ⚡", "100+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"squat_max", question:"How many squats can you do consecutively?",
    options:["Less than 15 😬", "15-30 🌱", "30-50 💪", "50-80 🔥", "80-120 ⚡", "120+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"pullup_max", question:"How many pull-ups can you do?",
    options:["0 — can't yet 😅", "1-3 🌱", "4-8 💪", "9-15 🔥", "16-25 ⚡", "25+ 👑"],
    weights:[0,1,2,3,4,5] },
  { id:"frequence", question:"How many times per week do you train?",
    options:["Never or almost 🛋️", "1-2x per week 🚶", "3-4x per week 🏃", "5-6x per week 💪", "Every day ⚡"],
    weights:[0,1,2,3,4] },
  { id:"experience", question:"How long have you been doing calisthenics?",
    options:["Just starting 🌱", "Less than 6 months 📅", "6 months - 1 year 💪", "1-3 years 🔥", "3+ years 👑"],
    weights:[0,1,2,3,4] },
];

// Calcul du rang initial selon les réponses
function calcRangInitial(answers) {
  const total = Object.entries(answers).reduce((sum, [id, idx]) => {
    const q = [...EVAL_QUESTIONS_FR].find(q => q.id === id);
    return sum + (q?.weights[idx] ?? 0);
  }, 0);
  const max = 5+5+5+4+4; // 23 max
  const pct = total / max;
  if (pct >= 0.90) return "SSS";
  if (pct >= 0.78) return "SS";
  if (pct >= 0.65) return "S";
  if (pct >= 0.52) return "A";
  if (pct >= 0.40) return "B";
  if (pct >= 0.28) return "C";
  if (pct >= 0.18) return "D";
  if (pct >= 0.08) return "E";
  return "F";
}


// ─── CSS animations intro aura ───
const SOLO_AURA_CSS = `
  @keyframes solo-fade-in    { from{opacity:0} to{opacity:1} }
  @keyframes solo-scale-up   { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes solo-glow-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes solo-rise       { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes solo-particles  {
    0%  {transform:translateY(0) translateX(0) scale(1);opacity:.9}
    50% {transform:translateY(-30px) translateX(8px) scale(1.3);opacity:.5}
    100%{transform:translateY(-60px) translateX(-8px) scale(0);opacity:0}
  }
  @keyframes solo-rainbow {
    0%  {box-shadow:0 0 60px #ff000099,0 0 120px #ff000044}
    20% {box-shadow:0 0 60px #ff880099,0 0 120px #ff880044}
    40% {box-shadow:0 0 60px #00ff8899,0 0 120px #00ff8844}
    60% {box-shadow:0 0 60px #0088ff99,0 0 120px #0088ff44}
    80% {box-shadow:0 0 60px #8800ff99,0 0 120px #8800ff44}
    100%{box-shadow:0 0 60px #ff000099,0 0 120px #ff000044}
  }
  @keyframes solo-fire {
    0%,100%{box-shadow:0 0 50px #f9731699,0 0 100px #f9731644}
    50%    {box-shadow:0 0 80px #f97316cc,0 0 160px #f9731677}
  }
  @keyframes solo-shimmer {
    0%  {background-position:200% center}
    100%{background-position:-200% center}
  }
`;


// ─── Exercices du défi ───
const EXERCICES_DEFI = [
  { id:"pushup",  nom:"Push-ups",     nomEn:"Push-ups",     emoji:"💪", mediapipeTarget:"pushup",
    desc:"Corps gainé, coudes à 45°, poitrine touche presque le sol.",
    descEn:"Core tight, elbows at 45°, chest nearly touches floor." },
  { id:"squat",   nom:"Squats",       nomEn:"Squats",       emoji:"🦵", mediapipeTarget:"squat",
    desc:"Pieds écartés, descend jusqu'aux cuisses parallèles au sol.",
    descEn:"Feet shoulder-width, lower until thighs parallel to floor." },
  { id:"legRaise", nom:"Relevés de jambes", nomEn:"Hanging Leg Raises", emoji:"🔥", mediapipeTarget:"legRaise",
    desc:"Suspendu à la barre, jambes tendues qui montent à 90°. Contrôle la descente.",
    descEn:"Hang from bar, raise straight legs to 90°. Control the descent." },
  { id:"pullup",  nom:"Pull-ups",     nomEn:"Pull-ups",     emoji:"🏋️", mediapipeTarget:"pullup",
    desc:"Barre au-dessus, monte jusqu'au menton au-dessus de la barre.",
    descEn:"Bar overhead, pull until chin above bar." },
];

function getRangFromDay(day) {
  // 7 jours → rang 1 par jour, plafonné à Rang S (jour 7)
  // SS et SSS se débloquent par répétition du défi
  const idx = Math.min(day - 1, 6); // 0→F, 1→E, 2→D, 3→C, 4→B, 5→A, 6→S
  return RANGS[idx] || RANGS[0];
}

function getDayProgress(completedDays) {
  return Object.keys(completedDays).length;
}

function getTotalSeries(completedDays) {
  // Total de séries validées tous jours confondus
  return Object.values(completedDays).reduce((acc, day) => {
    if (typeof day === "object" && day.seriesValidated) return acc + day.seriesValidated;
    if (day === true) return acc + 3;
    return acc;
  }, 0);
}

// ─── Composant LiveCoach (MediaPipe) ───
function LiveCoach({ exercise, targetReps, onComplete, onClose, lang }) {
  const L = lang === "en";
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const poseRef    = useRef(null);
  const cameraRef  = useRef(null);
  const countRef   = useRef(0);
  const stageRef   = useRef("up"); // up | down

  const [count, setCount]         = useState(0);
  const [stage, setStage]         = useState("up");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [done, setDone]           = useState(false);
  const [feedback, setFeedback]   = useState("");
  const [mpLoaded, setMpLoaded]   = useState(false);

  // Charger MediaPipe dynamiquement
  useEffect(() => {
    let mounted = true;

    const loadMediaPipe = async () => {
      try {
        // Charger les scripts MediaPipe depuis CDN
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
        if (mounted) setMpLoaded(true);
      } catch (e) {
        if (mounted) setError(L ? "MediaPipe failed to load. Try manual mode." : "MediaPipe n'a pas pu se charger. Mode manuel disponible.");
      }
    };

    loadMediaPipe();
    return () => { mounted = false; };
  }, []);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.crossOrigin = "anonymous";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Calcul d'angle entre 3 points
  function calcAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  // Détection selon l'exercice
  function detectRep(landmarks) {
    const ex = exercise.mediapipeTarget;

    try {
      if (ex === "pushup") {
        // Coude gauche : épaule(11) — coude(13) — poignet(15)
        const shoulder = landmarks[11], elbow = landmarks[13], wrist = landmarks[15];
        const angle = calcAngle(shoulder, elbow, wrist);
        if (angle > 160) {
          stageRef.current = "up";
          setStage("up");
          setFeedback(L ? "Arms straight ✅" : "Bras tendus ✅");
        }
        if (angle < 90 && stageRef.current === "up") {
          stageRef.current = "down";
          setStage("down");
          countRef.current += 1;
          setCount(countRef.current);
          setFeedback(L ? `Rep ${countRef.current} ✅` : `Rép ${countRef.current} ✅`);
        }
      } else if (ex === "squat") {
        // Genou gauche : hanche(23) — genou(25) — cheville(27)
        const hip = landmarks[23], knee = landmarks[25], ankle = landmarks[27];
        const angle = calcAngle(hip, knee, ankle);
        if (angle > 160) {
          stageRef.current = "up";
          setStage("up");
          setFeedback(L ? "Standing ✅" : "Debout ✅");
        }
        if (angle < 90 && stageRef.current === "up") {
          stageRef.current = "down";
          setStage("down");
          countRef.current += 1;
          setCount(countRef.current);
          setFeedback(L ? `Rep ${countRef.current} ✅` : `Rép ${countRef.current} ✅`);
        }
      } else if (ex === "legRaise") {
        // Hanging Leg Raises : angle torse-hanche-genou
        const hip = landmarks[23], knee = landmarks[25], shoulder = landmarks[11];
        const angle = calcAngle(shoulder, hip, knee);
        if (angle > 150) {
          stageRef.current = "down";
          setStage("down");
          setFeedback(L ? "Hanging — raise your legs ✅" : "Suspendu — monte les jambes ✅");
        }
        if (angle < 100 && stageRef.current === "down") {
          stageRef.current = "up";
          setStage("up");
          countRef.current += 1;
          setCount(countRef.current);
          setFeedback(L ? `Rep ${countRef.current} ✅` : `Rép ${countRef.current} ✅`);
        }
      } else if (ex === "legRaise") {
        // Hanging Leg Raises : hanche(23) — genou(25) — cheville(27)
        // Position basse : jambes verticales vers le bas (angle ~180°)
        // Position haute : jambes à 90° (angle ~90° entre torse et jambes)
        const hip    = landmarks[23], knee  = landmarks[25], ankle = landmarks[27];
        const shoulder = landmarks[11];
        // Angle torse-hanche-genou pour détecter la montée
        const angle = calcAngle(shoulder, hip, knee);
        if (angle > 150) {
          stageRef.current = "down";
          setStage("down");
          setFeedback(L ? "Hanging — raise your legs ✅" : "Suspendu — monte les jambes ✅");
        }
        if (angle < 100 && stageRef.current === "down") {
          stageRef.current = "up";
          setStage("up");
          countRef.current += 1;
          setCount(countRef.current);
          setFeedback(L ? `Rep ${countRef.current} ✅` : `Rép ${countRef.current} ✅`);
        }
      } else if (ex === "pullup") {
        // Coude gauche : épaule(11) — coude(13) — poignet(15) + hauteur poignet vs épaule
        const shoulder = landmarks[11], elbow = landmarks[13], wrist = landmarks[15];
        const angle = calcAngle(shoulder, elbow, wrist);
        // Bras tendu = en bas ; bras plié + poignet proche épaule = en haut
        if (angle > 160) {
          stageRef.current = "down";
          setStage("down");
          setFeedback(L ? "Hanging ✅" : "Suspendu ✅");
        }
        if (angle < 60 && stageRef.current === "down") {
          stageRef.current = "up";
          setStage("up");
          countRef.current += 1;
          setCount(countRef.current);
          setFeedback(L ? `Rep ${countRef.current} ✅` : `Rép ${countRef.current} ✅`);
        }
      }
    } catch (e) {}

    // Terminé ?
    if (countRef.current >= targetReps && !done) {
      setDone(true);
      stopCamera();
    }
  }

  // Initialiser caméra + pose
  useEffect(() => {
    if (!mpLoaded) return;
    let mounted = true;

    const initPose = async () => {
      try {
        if (!window.Pose) { setError(L ? "Pose not available." : "Pose non disponible."); return; }

        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        pose.onResults((results) => {
          if (!mounted) return;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!ctx || !canvas) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Dessiner la vidéo
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          if (results.poseLandmarks) {
            // Dessiner le squelette
            if (window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
              window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS,
                { color: "#00ff8866", lineWidth: 2 });
              window.drawLandmarks(ctx, results.poseLandmarks,
                { color: "#00ff88", lineWidth: 1, radius: 3 });
            }
            detectRep(results.poseLandmarks);
          }
        });
        poseRef.current = pose;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (window.Camera) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640, height: 480
          });
          await camera.start();
          cameraRef.current = camera;
        }

        if (mounted) setLoading(false);
      } catch (e) {
        if (mounted) {
          if (e.name === "NotAllowedError") {
            setError(L ? "Camera access denied. Use manual mode." : "Accès caméra refusé. Utilise le mode manuel.");
          } else {
            setError(L ? "Camera error. Use manual mode." : "Erreur caméra. Mode manuel disponible.");
          }
          setLoading(false);
        }
      }
    };

    initPose();
    return () => { mounted = false; stopCamera(); };
  }, [mpLoaded]);

  const stopCamera = () => {
    try { cameraRef.current?.stop(); } catch {}
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    try { poseRef.current?.close(); } catch {}
  };

  const handleClose = () => { stopCamera(); onClose(); };
  const handleDone  = () => { stopCamera(); onComplete(count); };

  const progress = Math.min((count / targetReps) * 100, 100);
  const ex = exercise;

  return (
    <div style={{
      position:"fixed", inset:0, background:"#000", zIndex:1000,
      display:"flex", flexDirection:"column", overflow:"hidden"
    }}>
      {/* Header */}
      <div style={{ padding:"12px 16px", background:"#060d08", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={handleClose} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:13 }}>
          ✕ {L ? "Close" : "Fermer"}
        </button>
        <div style={{ flex:1, textAlign:"center" }}>
          <span style={{ fontSize:16, fontWeight:700, color:"#edf5ef" }}>{ex.emoji} {L ? ex.nomEn : ex.nom}</span>
        </div>
        <span style={{ fontSize:12, color:EM, fontWeight:700 }}>{count}/{targetReps}</span>
      </div>

      {/* Caméra / Canvas */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <video ref={videoRef} style={{ display:"none" }} playsInline muted />
        <canvas ref={canvasRef} width={640} height={480}
          style={{ width:"100%", height:"100%", objectFit:"cover" }} />

        {loading && !error && (
          <div style={{
            position:"absolute", inset:0, background:"#000a",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16
          }}>
            <div style={{ fontSize:40 }}>📷</div>
            <div style={{ color:"#edf5ef", fontSize:14 }}>{L ? "Initializing camera..." : "Initialisation caméra..."}</div>
            <div style={{ display:"flex", gap:8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:EM,
                  animation:`bounce 1.4s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            position:"absolute", inset:0, background:"#060d08",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:16, padding:24, textAlign:"center"
          }}>
            <div style={{ fontSize:48 }}>📵</div>
            <div style={{ color:DANGER, fontSize:14, lineHeight:1.6 }}>{error}</div>
            <div style={{ color:MUT, fontSize:13 }}>
              {L ? "You can still count manually below." : "Tu peux quand même compter manuellement ci-dessous."}
            </div>
          </div>
        )}

        {done && (
          <div style={{
            position:"absolute", inset:0, background:"#000c",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16
          }}>
            <div style={{ fontSize:64, animation:"pulse 1s infinite" }}>🏆</div>
            <div style={{ fontSize:28, fontWeight:800, color:EM }}>
              {L ? "DONE!" : "TERMINÉ !"}
            </div>
            <div style={{ fontSize:16, color:"#edf5ef" }}>
              {count} {L ? ex.nomEn : ex.nom} ✅
            </div>
          </div>
        )}

        {/* Feedback live */}
        {!loading && !error && !done && feedback && (
          <div style={{
            position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
            background:"#000a", borderRadius:20, padding:"6px 16px",
            fontSize:13, color:EM, fontWeight:700, whiteSpace:"nowrap"
          }}>{feedback}</div>
        )}

        {/* Indicateur position */}
        {!loading && !error && !done && (
          <div style={{
            position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
            background: stage === "down" ? `${EM}33` : "#0008",
            border: `1.5px solid ${stage === "down" ? EM : "#444"}`,
            borderRadius:20, padding:"6px 18px",
            fontSize:12, color: stage === "down" ? EM : MUT, fontWeight:700
          }}>
            {stage === "down"
              ? (L ? "⬇ DOWN" : "⬇ BAS")
              : (L ? "⬆ UP"   : "⬆ HAUT")}
          </div>
        )}
      </div>

      {/* Barre de progression + boutons */}
      <div style={{ padding:"12px 16px 24px", background:"#060d08", flexShrink:0 }}>
        {/* Compteur visuel */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
          <div style={{ fontSize:48, fontWeight:900, color:EM, lineHeight:1 }}>{count}</div>
          <div style={{ fontSize:20, color:MUT, alignSelf:"flex-end", marginLeft:6 }}>/ {targetReps}</div>
        </div>

        {/* Progress bar */}
        <div style={{ background:BDR, borderRadius:8, height:8, overflow:"hidden", marginBottom:14 }}>
          <div style={{
            width:`${progress}%`, height:"100%",
            background:`linear-gradient(90deg,${EM},#00cc66)`,
            borderRadius:8, transition:"width .3s ease"
          }} />
        </div>

        {/* Boutons */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {/* Compteur manuel */}
          <button onClick={() => {
            countRef.current += 1;
            setCount(countRef.current);
            if (countRef.current >= targetReps) { setDone(true); stopCamera(); }
          }}
            style={{
              background:CARD, border:`1.5px solid ${BDR}`, borderRadius:14,
              padding:"12px", cursor:"pointer", fontFamily:"'Outfit',sans-serif",
              fontSize:14, color:"#edf5ef", fontWeight:600
            }}>
            {L ? "➕ Manual +1" : "➕ Manuel +1"}
          </button>

          {/* Valider */}
          <button onClick={handleDone}
            style={{
              background:done || count > 0
                ? `linear-gradient(135deg,${EM},#00cc66)`
                : "#142018",
              border:`1.5px solid ${count > 0 ? EM : BDR}`,
              borderRadius:14, padding:"12px", cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:14,
              color: count > 0 ? "#050d06" : MUT, fontWeight:700
            }}>
            {L ? "✅ Validate" : "✅ Valider"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:.8}50%{opacity:1}}
      `}</style>
    </div>
  );
}

// ─── Composant principal SoloLevelingChallenge ───
export default function SoloLevelingChallenge({ user, profile, onBack, onCoinsEarned, lang }) {
  const L = lang === "en";

  const [screen, setScreen]         = useState(() => {
    // Première ouverture → intro aura cinématique
    const seen = sessionStorage.getItem("vs_solo_intro_seen");
    return seen ? "home" : "intro_aura";
  });
  const [evalStep, setEvalStep]     = useState(0);
  const [evalAnswers, setEvalAnswers] = useState({});
  const [rangInitial, setRangInitial] = useState(() => {
    return localStorage.getItem("vs_solo_rang_initial") || null;
  });
  const [auraPhase, setAuraPhase]   = useState(0); // 0=noir 1=image 2=aura 3=texte
  const [selectedEx, setSelectedEx] = useState(null);
  const [viewRang, setViewRang]     = useState(null);
  const [imgErrors, setImgErrors]   = useState({});
  const [currentSerie, setCurrentSerie] = useState(1); // 1, 2, 3
  const [restTimer, setRestTimer]       = useState(60);
  const restIntervalRef = useRef(null);

  // Progression sauvegardée
  // Structure: { "2026-05-28": { series: [{pushup:15,squat:15,...}, ...], validated:false } }
  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vs_solo_days") || "{}"); } catch { return {}; }
  });
  // seriesProgress[serie][exId] = count validé
  const [seriesProgress, setSeriesProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vs_solo_series") || "{}"); } catch { return {}; }
  });
  const [startDate] = useState(() => {
    const saved = localStorage.getItem("vs_solo_start");
    if (saved) return new Date(saved);
    const now = new Date();
    localStorage.setItem("vs_solo_start", now.toISOString());
    return now;
  });

  const todayKey    = new Date().toISOString().slice(0,10);
  const dayNumberRaw = Math.max(1, Math.floor((new Date() - startDate) / (1000*60*60*24)) + 1);
  // Si rang initial évalué, commencer au bon jour
  const rangInitialIdx = rangInitial ? RANGS.findIndex(r => r.id === rangInitial) : -1;
  const dayNumber = rangInitialIdx > 0
    ? Math.min(7, Math.max(dayNumberRaw, rangInitialIdx + 1))
    : dayNumberRaw;
  const currentRang = getRangFromDay(dayNumber);
  const totalDays   = getDayProgress(completedDays);
  const todayDone   = completedDays[todayKey]?.validated;

  // Progression de la série en cours
  const curSerieProgress = seriesProgress[currentSerie] || {};

  const isSerieComplete = (serieIdx) => {
    const sp = seriesProgress[serieIdx] || {};
    return EXERCICES_DEFI.every(ex => (sp[ex.id] || 0) >= currentRang.reps[ex.id]);
  };

  const allSeriesDone = [1,2,3].every(s => isSerieComplete(s));

  const saveSeriesProgress = (serieIdx, exId, count) => {
    const newSP = {
      ...seriesProgress,
      [serieIdx]: { ...(seriesProgress[serieIdx] || {}), [exId]: count }
    };
    setSeriesProgress(newSP);
    localStorage.setItem("vs_solo_series", JSON.stringify(newSP));
  };

  const startRestTimer = (nextSerie) => {
    setRestTimer(60);
    setScreen("rest");
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current);
          setCurrentSerie(nextSerie);
          setScreen("today");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, []);

  const validateDay = () => {
    if (!allSeriesDone) return;
    const newDays = { ...completedDays, [todayKey]: { validated:true, rang:currentRang.id, date:todayKey } };
    setCompletedDays(newDays);
    localStorage.setItem("vs_solo_days", JSON.stringify(newDays));
    localStorage.removeItem("vs_solo_series");
    setSeriesProgress({});
    setCurrentSerie(1);
    if (onCoinsEarned) onCoinsEarned(75);
    setScreen("home");
  };

  const handleLiveComplete = (exId, count) => {
    saveSeriesProgress(currentSerie, exId, count);
    // Vérifier si la série est complète après cet exo
    const updatedSP = { ...(seriesProgress[currentSerie] || {}), [exId]: count };
    const serieComplete = EXERCICES_DEFI.every(ex => (updatedSP[ex.id] || 0) >= currentRang.reps[ex.id]);
    if (serieComplete && currentSerie < 3) {
      startRestTimer(currentSerie + 1);
    } else {
      setScreen("today");
    }
  };

  // ─── INTRO AURA CINÉMATIQUE ───
  // S'affiche une fois par session à l'ouverture du module
  if (screen === "intro_aura") {
    const rang = rangInitial ? (RANGS.find(r => r.id === rangInitial) || RANGS[0]) : RANGS[0];
    const hasRang = !!rangInitial && rangInitial !== "F";
    const imgSrc = SJW_IMAGES[rang.id];

    // Glow animation selon le rang
    const glowAnim = rang.id === "SSS" ? "solo-rainbow 2s ease-in-out infinite"
      : rang.id === "SS" ? "solo-fire 1.5s ease-in-out infinite"
      : rang.id === "S"  ? "solo-glow-pulse 1.5s ease-in-out infinite"
      : "solo-glow-pulse 2s ease-in-out infinite";

    const shimmerGradient = rang.id === "SSS"
      ? "linear-gradient(90deg,#ff444400,#fbbf2488,#ff444400)"
      : `linear-gradient(90deg,transparent,${rang.color}44,transparent)`;

    return (
      <div style={{
        position:"fixed", inset:0, background:"#000",
        display:"flex", flexDirection:"column",
        overflow:"hidden", zIndex:100
      }}>
        <style>{SOLO_AURA_CSS}</style>

        {/* Image plein écran */}
        <div style={{
          position:"absolute", inset:0,
          animation:"solo-fade-in .8s ease forwards"
        }}>
          {!imgErrors[rang.id]
            ? <img src={imgSrc} alt={rang.label}
                onError={()=>setImgErrors(p=>({...p,[rang.id]:true}))}
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top",filter:"brightness(.7)"}}/>
            : <div style={{width:"100%",height:"100%",background:`radial-gradient(ellipse at 50% 30%,${rang.color}22,#000)`}}/>
          }

          {/* Overlay gradient bas */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to top, #000 0%, #000a 30%, transparent 60%)"
          }}/>

          {/* Overlay aura couleur */}
          <div style={{
            position:"absolute", inset:0,
            background:`radial-gradient(ellipse at 50% 40%, ${rang.color}18 0%, transparent 70%)`,
            animation:"solo-glow-pulse 2s ease-in-out infinite"
          }}/>
        </div>

        {/* Particules flottantes */}
        {rang.id !== "F" && Array.from({length:12}).map((_,i)=>(
          <div key={i} style={{
            position:"absolute",
            left:`${10+((i*37)%80)}%`,
            top:`${10+((i*53)%70)}%`,
            width:`${2+((i*7)%5)}px`,
            height:`${2+((i*7)%5)}px`,
            borderRadius:"50%",
            background: rang.id==="SSS"
              ? ["#ff4444","#fbbf24","#00ff88","#0088ff","#e879f9"][i%5]
              : rang.color,
            opacity:.8,
            animation:`solo-particles ${2+((i*.7)%3)}s ease-in-out ${(i*.35)%2}s infinite`,
            zIndex:2
          }}/>
        ))}

        {/* Contenu bas */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding:"0 24px 52px",
          zIndex:3
        }}>
          {/* Badge rang */}
          <div style={{
            animation:"solo-rise .6s ease .3s both",
            marginBottom:16
          }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:10,
              background:`${rang.color}18`,
              border:`2px solid ${rang.color}66`,
              borderRadius:24, padding:"8px 20px",
              animation: glowAnim,
              backdropFilter:"blur(8px)"
            }}>
              <span style={{fontSize:20}}>{rang.badge}</span>
              <span style={{
                fontSize:18, fontWeight:900,
                color: rang.id==="SSS" ? "transparent" : rang.color,
                background: rang.id==="SSS"
                  ? "linear-gradient(90deg,#ff4444,#fbbf24,#00ff88,#0088ff,#e879f9)"
                  : "none",
                backgroundClip: rang.id==="SSS" ? "text" : "none",
                WebkitBackgroundClip: rang.id==="SSS" ? "text" : "none",
                backgroundSize: "200% auto",
                animation: rang.id==="SSS" ? "solo-shimmer 3s linear infinite" : "none",
                letterSpacing:1
              }}>
                {rang.label}
              </span>
            </div>
          </div>

          {/* Titre */}
          <div style={{
            fontFamily:"'Outfit',sans-serif",
            fontSize:32, fontWeight:900,
            color:"#fff", lineHeight:1.1,
            marginBottom:8,
            animation:"solo-rise .6s ease .5s both",
            textShadow:`0 0 30px ${rang.color}88`
          }}>
            {hasRang
              ? (L ? "Welcome back, Hunter." : "Bienvenue, Chasseur.")
              : (L ? "The hunt begins." : "La chasse commence.")}
          </div>

          {/* Description rang */}
          <div style={{
            fontSize:14, color:"#ffffff99",
            fontStyle:"italic", marginBottom:28,
            animation:"solo-rise .6s ease .7s both"
          }}>
            "{L ? rang.descEn : rang.desc}"
          </div>

          {/* Reps preview */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8,
            marginBottom:24,
            animation:"solo-rise .6s ease .85s both"
          }}>
            {EXERCICES_DEFI.map(ex=>(
              <div key={ex.id} style={{
                background:"#ffffff10",
                border:`1px solid ${rang.color}33`,
                borderRadius:14, padding:"10px 6px",
                textAlign:"center",
                backdropFilter:"blur(8px)"
              }}>
                <div style={{fontSize:20,marginBottom:4}}>{ex.emoji}</div>
                <div style={{fontSize:16,fontWeight:800,color:rang.color}}>{rang.reps[ex.id]}</div>
                <div style={{fontSize:9,color:"#ffffff66",marginTop:2}}>×3 {L?ex.nomEn:ex.nom}</div>
              </div>
            ))}
          </div>

          {/* Bouton entrer */}
          <button
            onClick={()=>{
              sessionStorage.setItem("vs_solo_intro_seen","1");
              setAuraPhase(0);
              if (!rangInitial) {
                setScreen("eval");
              } else {
                setScreen("home");
              }
            }}
            style={{
              width:"100%",
              background: rang.id==="SSS"
                ? "linear-gradient(90deg,#ff4444,#fbbf24,#00ff88,#0088ff)"
                : `linear-gradient(135deg,${rang.color},${rang.color}99)`,
              border:"none", borderRadius:20, padding:"18px",
              fontFamily:"'Outfit',sans-serif", fontSize:18,
              fontWeight:800,
              color: rang.id==="SSS" ? "#fff" : "#050d06",
              cursor:"pointer",
              animation:"solo-rise .6s ease 1s both",
              boxShadow:`0 0 30px ${rang.color}44`,
              letterSpacing:.5
            }}>
            {hasRang
              ? `⚔️ ${L?"Continue the hunt":"Continuer la chasse"}`
              : `⚔️ ${L?"Begin my journey":"Commencer mon voyage"}`}
          </button>

          {/* Skip si déjà vu */}
          <button onClick={()=>{
            sessionStorage.setItem("vs_solo_intro_seen","1");
            setScreen(rangInitial ? "home" : "eval");
          }}
            style={{
              display:"block", margin:"12px auto 0",
              background:"none", border:"none",
              color:"#ffffff44", cursor:"pointer",
              fontSize:12
            }}>
            {L?"Skip →":"Passer →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── ÉVALUATION RANG INITIAL ───
  if (screen === "eval") {
    const EVAL_Q = L ? EVAL_QUESTIONS_EN : EVAL_QUESTIONS_FR;
    const q = EVAL_Q[evalStep];
    const progress = (evalStep / EVAL_Q.length) * 100;

    const handleEvalAnswer = (optIdx) => {
      const newAnswers = { ...evalAnswers, [q.id]: optIdx };
      setEvalAnswers(newAnswers);
      if (evalStep < EVAL_Q.length - 1) {
        setEvalStep(evalStep + 1);
      } else {
        // Calculer le rang
        const rang = calcRangInitial(newAnswers);
        setRangInitial(rang);
        localStorage.setItem("vs_solo_rang_initial", rang);
        // Afficher résultat avant de démarrer
        setScreen("eval_result");
      }
    };

    return (
      <div style={{minHeight:"100vh",background:"#060d08",padding:"52px 20px 40px",overflowY:"auto"}}>
        <button onClick={()=>evalStep===0?setScreen("intro"):setEvalStep(evalStep-1)}
          style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,display:"block",marginBottom:20}}>
          ← {L?"Back":"Retour"}
        </button>

        {/* Progress */}
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:11,color:MUT}}>{L?"Evaluation":"Évaluation"} {evalStep+1}/{EVAL_Q.length}</span>
            <span style={{fontSize:11,color:"#fbbf24",fontWeight:700}}>{Math.round(progress)}%</span>
          </div>
          <div style={{background:BDR,borderRadius:6,height:6,overflow:"hidden"}}>
            <div style={{width:`${progress}%`,height:"100%",background:"linear-gradient(90deg,#fbbf24,#f97316)",borderRadius:6,transition:"width .4s ease"}}/>
          </div>
        </div>

        <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,letterSpacing:1,marginBottom:12}}>
          ⚔️ {L?"RANK EVALUATION":"ÉVALUATION DU RANG"}
        </div>
        <div style={{fontSize:20,fontWeight:700,color:"#edf5ef",lineHeight:1.4,marginBottom:28,fontFamily:"'Outfit',sans-serif"}}>
          {q.question}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {q.options.map((opt,i)=>(
            <button key={i} onClick={()=>handleEvalAnswer(i)}
              style={{background:CARD,border:`1.5px solid ${BDR}`,borderRadius:16,padding:"15px 18px",cursor:"pointer",textAlign:"left",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#edf5ef",transition:"all .2s",display:"flex",alignItems:"center",gap:12}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#fbbf24";e.currentTarget.style.background="#fbbf2408";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BDR;e.currentTarget.style.background=CARD;}}>
              <div style={{width:26,height:26,borderRadius:"50%",border:`1.5px solid ${BDR}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:MUT,fontWeight:700,flexShrink:0}}>
                {String.fromCharCode(65+i)}
              </div>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── RÉSULTAT ÉVALUATION ───
  if (screen === "eval_result") {
    const rang = RANGS.find(r => r.id === rangInitial) || RANGS[0];
    const rangIdx = RANGS.findIndex(r => r.id === rangInitial);
    return (
      <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8,filter:`drop-shadow(0 0 30px ${rang.color})`}}>⚔️</div>
        <div style={{fontSize:11,color:rang.color,fontWeight:700,letterSpacing:1.5,marginBottom:12}}>
          {L?"YOUR INITIAL RANK":"TON RANG INITIAL"}
        </div>

        {/* Badge rang */}
        <div style={{background:`${rang.color}15`,border:`2px solid ${rang.color}66`,borderRadius:24,padding:"20px 32px",marginBottom:20,boxShadow:`0 0 40px ${rang.color}33`}}>
          <div style={{fontSize:40,marginBottom:8}}>{rang.badge}</div>
          <div style={{fontSize:36,fontWeight:900,color:rang.color,lineHeight:1}}>{rang.label}</div>
          <div style={{fontSize:13,color:MUT,marginTop:8,fontStyle:"italic"}}>"{L?rang.descEn:rang.desc}"</div>
        </div>

        {/* Info reps */}
        <div style={{background:CARD,border:`1px solid ${rang.color}33`,borderRadius:18,padding:18,width:"100%",maxWidth:320,marginBottom:24}}>
          <div style={{fontSize:11,color:rang.color,fontWeight:700,letterSpacing:.8,marginBottom:12}}>
            ⚡ {L?"YOUR STARTING WORKOUT":"TON ENTRAÎNEMENT DE DÉPART"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {EXERCICES_DEFI.map(ex=>(
              <div key={ex.id} style={{background:"#060d08",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:22}}>{ex.emoji}</div>
                <div style={{fontSize:18,fontWeight:800,color:rang.color,marginTop:4}}>{rang.reps[ex.id]}</div>
                <div style={{fontSize:10,color:MUT}}>×3 {L?ex.nomEn:ex.nom}</div>
              </div>
            ))}
          </div>
          {rangIdx > 0 && (
            <div style={{marginTop:12,padding:"10px",background:`${rang.color}08`,borderRadius:12,fontSize:12,color:rang.color}}>
              {L?`🔥 You skipped ${rangIdx} rank(s) — the AI detected your level!`:`🔥 Tu sautes ${rangIdx} rang(s) — l'IA a détecté ton niveau !`}
            </div>
          )}
        </div>

        <button onClick={()=>{
          // Reset et démarrer au rang évalué
          localStorage.removeItem("vs_solo_days");
          localStorage.removeItem("vs_solo_series");
          localStorage.setItem("vs_solo_start", new Date().toISOString());
          setCompletedDays({});
          setSeriesProgress({});
          setCurrentSerie(1);
          setScreen("home");
        }}
          style={{width:"100%",maxWidth:320,background:`linear-gradient(135deg,${rang.color},${rang.color}99)`,border:"none",borderRadius:18,padding:"16px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:800,color:"#050d06"}}>
          ⚔️ {L?"Start at my rank!":"Démarrer à mon rang !"}
        </button>
        <button onClick={()=>setScreen("home")}
          style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginTop:12}}>
          {L?"Start from Rank F instead":"Commencer depuis le Rang F"}
        </button>
      </div>
    );
  }

  // ─── REPOS entre séries ───
  if (screen === "rest") {
    const nextSerie = currentSerie; // déjà mis à jour par startRestTimer
    const prevSerie = nextSerie - 1;
    const pct = Math.round(((60 - restTimer) / 60) * 100);
    return (
      <div style={{minHeight:"100vh",background:"#060d08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>😤</div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:11,color:MUT,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>
          {L?"SÉRIE":"SÉRIE"} {prevSerie} {L?"COMPLETE ✅":"TERMINÉE ✅"}
        </div>
        <div style={{fontSize:22,fontWeight:800,color:"#edf5ef",marginBottom:6}}>
          {L?"Rest — recover":"Repos — récupère"}
        </div>
        <div style={{fontSize:14,color:MUT,marginBottom:32}}>
          {L?"Series":"Série"} {nextSerie} {L?"starts in":"commence dans"}
        </div>

        {/* Cercle countdown */}
        <div style={{position:"relative",width:140,height:140,marginBottom:28}}>
          <svg viewBox="0 0 140 140" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
            <circle cx="70" cy="70" r="58" fill="none" stroke={BDR} strokeWidth="8"/>
            <circle cx="70" cy="70" r="58" fill="none" stroke={currentRang.color}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(pct/100)*364} 364`}
              style={{transition:"stroke-dasharray .9s ease"}}/>
          </svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
            <div style={{fontSize:40,fontWeight:900,color:currentRang.color,lineHeight:1}}>{restTimer}</div>
            <div style={{fontSize:11,color:MUT}}>sec</div>
          </div>
        </div>

        {/* Série suivante preview */}
        <div style={{background:CARD,border:`1.5px solid ${currentRang.color}33`,borderRadius:18,padding:16,width:"100%",maxWidth:320,marginBottom:20}}>
          <div style={{fontSize:11,color:currentRang.color,fontWeight:700,letterSpacing:.8,marginBottom:10}}>
            ⚡ {L?"NEXT — SERIES":"PROCHAIN — SÉRIE"} {nextSerie}/3
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {EXERCICES_DEFI.map(ex=>(
              <div key={ex.id} style={{display:"flex",alignItems:"center",gap:8,background:"#060d08",borderRadius:10,padding:"8px 10px"}}>
                <span style={{fontSize:18}}>{ex.emoji}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#edf5ef"}}>{currentRang.reps[ex.id]}</div>
                  <div style={{fontSize:9,color:MUT}}>{L?ex.nomEn:ex.nom}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton passer le repos */}
        <button onClick={()=>{
          clearInterval(restIntervalRef.current);
          setCurrentSerie(nextSerie);
          setScreen("today");
        }}
          style={{background:"none",border:`1.5px solid ${BDR}`,borderRadius:14,padding:"12px 24px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT}}>
          {L?"Skip rest →":"Passer le repos →"}
        </button>
      </div>
    );
  }

  // ─── HOME ───
  if (screen === "home") {
    const progressPct = Math.round((totalDays / 7) * 100);

    return (
      <div style={{ minHeight:"100vh", background:"#060d08", overflowY:"auto", paddingBottom:40 }}>
        {/* Header cinématique */}
        <style>{SOLO_AURA_CSS}</style>
      <div style={{
          padding:"52px 20px 28px", position:"relative", overflow:"hidden",
          background:`radial-gradient(ellipse at 50% 0%,${currentRang.color}20 0%,#060d08 70%)`
        }}>
          {/* Particules aura selon rang */}
          {["B","A","S","SS","SSS"].includes(currentRang.id) && Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{
              position:"absolute",
              left:`${10+((i*37)%80)}%`, top:`${5+((i*53)%60)}%`,
              width:`${2+((i*5)%4)}px`, height:`${2+((i*5)%4)}px`,
              borderRadius:"50%",
              background: currentRang.id==="SSS" ? ["#fbbf24","#f97316","#e879f9","#00ff88","#3b82f6"][i%5] : currentRang.color,
              opacity:.7, pointerEvents:"none",
              animation:`solo-particles ${2+((i*.7)%3)}s ease-in-out ${(i*.4)%2}s infinite`,
              zIndex:0
            }}/>
          ))}

          <button onClick={onBack} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:13, display:"block", marginBottom:16, position:"relative", zIndex:1 }}>
            ← {L ? "Back" : "Retour"}
          </button>

          {/* Image Sung Jin-Woo + infos rang */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-end", marginBottom:20, position:"relative", zIndex:1 }}>
            <div style={{
              width:110, height:180, borderRadius:18, overflow:"hidden",
              border:`2px solid ${currentRang.color}88`,
              background:currentRang.bg, flexShrink:0,
              boxShadow:`0 0 40px ${currentRang.color}44, 0 0 80px ${currentRang.color}22`,
              animation: currentRang.id==="SSS" ? "solo-rainbow 2s infinite"
                : currentRang.id==="SS" ? "solo-fire 1.5s infinite"
                : ["S","A","B"].includes(currentRang.id) ? "solo-glow-pulse 2s infinite"
                : "none"
            }}>
              {!imgErrors[currentRang.id]
                ? <img src={SJW_IMAGES[currentRang.id]} alt={currentRang.label}
                    onError={() => setImgErrors(p => ({...p,[currentRang.id]:true}))}
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
                : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>⚔️</div>
              }
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:MUT, fontWeight:700, letterSpacing:1, marginBottom:6 }}>
                {L ? "SOLO LEVELING CHALLENGE" : "DÉFI SOLO LEVELING"}
              </div>
              <div style={{
                display:"inline-block", background:`${currentRang.color}20`,
                border:`1.5px solid ${currentRang.color}66`,
                borderRadius:20, padding:"4px 14px", marginBottom:10
              }}>
                <span style={{ fontSize:14, fontWeight:800, color:currentRang.color }}>
                  {currentRang.badge} {currentRang.label}
                </span>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:"#edf5ef", lineHeight:1.2, marginBottom:6 }}>
                {L ? "Day" : "Jour"} {dayNumber} <span style={{ fontSize:14, color:MUT }}>/7</span>
              </div>
              <div style={{ fontSize:13, color:MUT, fontStyle:"italic" }}>
                "{L ? currentRang.descEn : currentRang.desc}"
              </div>
            </div>
          </div>

          {/* Barre 90 jours */}
          <div style={{ marginBottom:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:11, color:MUT }}>{L ? "Overall progress" : "Progression globale"}</span>
              <span style={{ fontSize:11, color:currentRang.color, fontWeight:700 }}>{progressPct}%</span>
            </div>
            <div style={{ background:BDR, borderRadius:8, height:8, overflow:"hidden" }}>
              <div style={{
                width:`${progressPct}%`, height:"100%",
                background:`linear-gradient(90deg,${currentRang.color},${EM})`,
                borderRadius:8, transition:"width .5s ease"
              }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:10, color:MUT }}>F</span>
              <span style={{ fontSize:10, color:MUT }}>E D C B A</span>
              <span style={{ fontSize:10, color:currentRang.color, fontWeight:700 }}>SSS</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 20px" }}>
          {/* Carte aujourd'hui */}
          <div style={{
            background: todayDone ? `${EM}08` : `${currentRang.color}08`,
            border:`1.5px solid ${todayDone ? EM+"44" : currentRang.color+"33"}`,
            borderRadius:20, padding:20, marginBottom:16
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:11, color:todayDone ? EM : currentRang.color, fontWeight:700, letterSpacing:.8 }}>
                  {todayDone ? "✅ " : "⚡ "}{L ? "TODAY'S WORKOUT" : "ENTRAÎNEMENT DU JOUR"}
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:"#edf5ef", marginTop:2 }}>
                  {currentRang.badge} {currentRang.label} — {L ? "Day" : "Jour"} {dayNumber}
                </div>
              </div>
              {todayDone && <div style={{ fontSize:32 }}>🏆</div>}
            </div>

            {/* Exercices du jour */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
              {EXERCICES_DEFI.map(ex => {
                const target = currentRang.reps[ex.id];
                const done_count = Math.max(...[1,2,3].map(s => (seriesProgress[s]||{})[ex.id] || 0));
                const isDone = done_count >= target;
                return (
                  <div key={ex.id} style={{
                    background: isDone ? `${EM}10` : CARD,
                    border:`1px solid ${isDone ? EM+"44" : BDR}`,
                    borderRadius:14, padding:"12px 10px", textAlign:"center"
                  }}>
                    <div style={{ fontSize:24, marginBottom:4 }}>{ex.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:isDone ? EM : "#edf5ef" }}>
                      {done_count}/{target}
                    </div>
                    <div style={{ fontSize:10, color:MUT, marginTop:2 }}>{L ? ex.nomEn : ex.nom}</div>
                    {isDone && <div style={{ fontSize:12, marginTop:4 }}>✅</div>}
                  </div>
                );
              })}
            </div>

            {!todayDone && (
              <button onClick={() => { if (!rangInitial) { setScreen("eval"); } else { setScreen("today"); } }}
                style={{
                  width:"100%", background:`linear-gradient(135deg,${currentRang.color}22,${currentRang.color}11)`,
                  border:`1.5px solid ${currentRang.color}66`, borderRadius:16, padding:"14px",
                  cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:15,
                  fontWeight:700, color:currentRang.color
                }}>
                ⚔️ {L ? "Start today's workout" : "Commencer l'entraînement du jour"}
              </button>
            )}
          </div>

          {/* Tous les rangs */}
          <div style={{ fontSize:11, color:MUT, fontWeight:700, letterSpacing:.8, marginBottom:12 }}>
            {L ? "🏆 ALL RANKS — 90 DAYS" : "🏆 TOUS LES RANGS — 90 JOURS"}
          </div>
          {RANGS.map((rang, i) => {
            const isCurrentRang = rang.id === currentRang.id;
            const isUnlocked = dayNumber >= rang.jour;
            const weeksProgress = 1;
            const rangDays = Object.keys(completedDays).filter(d => completedDays[d]?.rang === rang.id).length;

            return (
              <button key={rang.id}
                onClick={() => { setViewRang(rang); setScreen("rang_detail"); }}
                style={{
                  width:"100%", background:isCurrentRang ? `${rang.color}12` : CARD,
                  border:`1.5px solid ${isCurrentRang ? rang.color+"66" : isUnlocked ? rang.color+"33" : BDR}`,
                  borderRadius:16, padding:"14px 16px", cursor:"pointer", textAlign:"left",
                  marginBottom:8, display:"flex", alignItems:"center", gap:12, fontFamily:"'Outfit',sans-serif",
                  opacity: isUnlocked ? 1 : 0.5
                }}>
                {/* Image miniature */}
                <div style={{
                  width:44, height:66, borderRadius:10, overflow:"hidden",
                  border:`1.5px solid ${rang.color}44`, background:rang.bg, flexShrink:0
                }}>
                  {!imgErrors[rang.id]
                    ? <img src={SJW_IMAGES[rang.id]} alt={rang.label}
                        onError={() => setImgErrors(p => ({...p,[rang.id]:true}))}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                        {isUnlocked ? rang.badge : "🔒"}
                      </div>
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:rang.color }}>{rang.badge} {rang.label}</span>
                    {isCurrentRang && <span style={{ fontSize:9, background:`${rang.color}20`, color:rang.color, borderRadius:10, padding:"2px 8px", fontWeight:700 }}>EN COURS</span>}
                    {!isUnlocked && <span style={{ fontSize:9, color:MUT }}>🔒 {rang.unlock}</span>}
                  </div>
                  <div style={{ fontSize:11, color:MUT, marginBottom:6 }}>
                    {L?"Day":"Jour"} {rang.jour} · {rang.reps.pushup}×3 push · {rang.reps.squat}×3 squat
                  </div>
                  <div style={{ background:BDR, borderRadius:4, height:3, overflow:"hidden" }}>
                    <div style={{
                      width:`${isUnlocked ? Math.min(100, rangDays >= 1 ? 100 : 0) : 0}%`,
                      height:"100%", background:rang.color, borderRadius:4
                    }} />
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:rang.color }}>{rangDays}</div>
                  <div style={{ fontSize:9, color:MUT }}>jours</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── TODAY — Entraînement du jour ───
  if (screen === "today") {
    const allDone = allSeriesDone;

    return (
      <div style={{ minHeight:"100vh", background:"#060d08", overflowY:"auto", paddingBottom:40 }}>
        <div style={{
          padding:"52px 20px 24px",
          background:`radial-gradient(ellipse at 50% 0%,${currentRang.color}15 0%,#060d08 65%)`
        }}>
          <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:13, display:"block", marginBottom:16 }}>
            ← {L ? "Back" : "Retour"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontSize:28 }}>{currentRang.badge}</span>
            <div>
              <div style={{ fontSize:11, color:currentRang.color, fontWeight:700, letterSpacing:.8 }}>{currentRang.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#edf5ef" }}>
                {L ? "Day" : "Jour"} {dayNumber} — {L ? "Today's workout" : "Entraînement du jour"}
              </div>
            </div>
          </div>
          <div style={{ fontSize:13, color:MUT, fontStyle:"italic" }}>
            "{L ? currentRang.descEn : currentRang.desc}"
          </div>
        </div>

        <div style={{ padding:"0 20px" }}>
          {EXERCICES_DEFI.map(ex => {
            const target = currentRang.reps[ex.id];
            const count  = curSerieProgress[ex.id] || 0;
            const isDone = count >= target;
            const pct    = Math.min(100, Math.round((count/target)*100));

            return (
              <div key={ex.id} style={{
                background: isDone ? `${EM}08` : CARD,
                border:`1.5px solid ${isDone ? EM+"44" : BDR}`,
                borderRadius:20, padding:18, marginBottom:12
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <span style={{ fontSize:32 }}>{ex.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:isDone ? EM : "#edf5ef" }}>
                      {L ? ex.nomEn : ex.nom}
                    </div>
                    <div style={{ fontSize:12, color:MUT }}>{L ? ex.descEn : ex.desc}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:isDone ? EM : currentRang.color }}>
                      {count}/{target}
                    </div>
                    {isDone && <div style={{ fontSize:14 }}>✅</div>}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background:BDR, borderRadius:6, height:6, overflow:"hidden", marginBottom:12 }}>
                  <div style={{
                    width:`${pct}%`, height:"100%",
                    background:`linear-gradient(90deg,${currentRang.color},${EM})`,
                    borderRadius:6, transition:"width .3s"
                  }} />
                </div>

                {!isDone && (
                  <button
                    onClick={() => { setSelectedEx(ex); setScreen("livecoach"); }}
                    style={{
                      width:"100%", background:`linear-gradient(135deg,${currentRang.color}15,${currentRang.color}08)`,
                      border:`1.5px solid ${currentRang.color}55`, borderRadius:14, padding:"12px",
                      cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:14,
                      fontWeight:700, color:currentRang.color, display:"flex", alignItems:"center", justifyContent:"center", gap:8
                    }}>
                    🎥 {L ? "Start with camera (AI)" : "Démarrer avec caméra (IA)"}
                  </button>
                )}
              </div>
            );
          })}

          {/* Valider la journée */}
          {allDone && (
            <button onClick={validateDay}
              style={{
                width:"100%", background:`linear-gradient(135deg,${EM},#00cc66)`,
                border:"none", borderRadius:18, padding:"18px",
                cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:17,
                fontWeight:800, color:"#050d06", marginTop:8
              }}>
              ⚔️ {L ? "Validate Day +50 🪙" : "Valider la journée +50 🪙"}
            </button>
          )}

          {!allDone && (
            <div style={{ textAlign:"center", padding:"12px 0", color:MUT, fontSize:12 }}>
              {EXERCICES_DEFI.filter(ex => (curSerieProgress[ex.id]||0) >= currentRang.reps[ex.id]).length}/{EXERCICES_DEFI.length} {L ? "exercises done" : "exercices complétés"}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LIVECOACH ───
  if (screen === "livecoach" && selectedEx) {
    return (
      <LiveCoach
        exercise={selectedEx}
        targetReps={currentRang.reps[selectedEx.id]}
        onComplete={(count) => handleLiveComplete(selectedEx.id, count)}
        onClose={() => setScreen("today")}
        lang={lang}
      />
    );
  }

  // ─── DÉTAIL RANG ───
  if (screen === "rang_detail" && viewRang) {
    const isUnlocked = dayNumber >= viewRang.jour;

    return (
      <div style={{ minHeight:"100vh", background:"#060d08", overflowY:"auto", paddingBottom:40 }}>
        <div style={{
          padding:"52px 20px 28px",
          background:`radial-gradient(ellipse at 50% 0%,${viewRang.color}18 0%,#060d08 65%)`
        }}>
          <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:MUT, cursor:"pointer", fontSize:13, display:"block", marginBottom:20 }}>
            ← {L ? "Back" : "Retour"}
          </button>

          <div style={{ display:"flex", gap:16, alignItems:"flex-end" }}>
            <div style={{
              width:120, height:190, borderRadius:18, overflow:"hidden",
              border:`2px solid ${viewRang.color}66`, background:viewRang.bg, flexShrink:0,
              boxShadow:`0 0 40px ${viewRang.color}33`
            }}>
              {!imgErrors[viewRang.id]
                ? <img src={SJW_IMAGES[viewRang.id]} alt={viewRang.label}
                    onError={() => setImgErrors(p=>({...p,[viewRang.id]:true}))}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>
                    {isUnlocked ? viewRang.badge : "🔒"}
                  </div>
              }
            </div>
            <div>
              <div style={{ fontSize:28, fontWeight:900, color:viewRang.color, marginBottom:4 }}>
                {viewRang.badge} {viewRang.label}
              </div>
              <div style={{ fontSize:13, color:MUT, marginBottom:8 }}>
                {L?"Day":"Jour"} {viewRang.jour}/7
              </div>
              <div style={{ fontSize:14, color:"#edf5ef", fontStyle:"italic", lineHeight:1.5 }}>
                "{L ? viewRang.descEn : viewRang.desc}"
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 20px" }}>
          <div style={{ fontSize:11, color:MUT, fontWeight:700, letterSpacing:.8, marginBottom:12 }}>
            ⚡ {L ? "DAILY REQUIREMENTS" : "OBJECTIFS QUOTIDIENS"}
          </div>
          {EXERCICES_DEFI.map(ex => (
            <div key={ex.id} style={{
              display:"flex", alignItems:"center", gap:14,
              background:CARD, border:`1px solid ${viewRang.color}22`,
              borderRadius:16, padding:"14px 16px", marginBottom:10
            }}>
              <span style={{ fontSize:28 }}>{ex.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#edf5ef" }}>{L ? ex.nomEn : ex.nom}</div>
                <div style={{ fontSize:11, color:MUT, marginTop:2 }}>{L ? ex.descEn : ex.desc}</div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:viewRang.color }}>
                {viewRang.reps[ex.id]}
              </div>
            </div>
          ))}

          {!isUnlocked && (
            <div style={{
              background:`${viewRang.color}08`, border:`1.5px solid ${viewRang.color}33`,
              borderRadius:16, padding:16, textAlign:"center", marginTop:8
            }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🔒</div>
              <div style={{ fontSize:13, color:MUT }}>
                {L ? `Unlocks at ${viewRang.unlock}` : `Se débloque à ${viewRang.unlock}`}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

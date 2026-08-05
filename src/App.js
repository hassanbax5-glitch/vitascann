// ============================================
// VITASCANN — APP.JS v4.1
// ✅ 11 zones : Ongles, Yeux, Peau, Cheveux, Langue,
//    Pieds, Ventre, Cuir chev., % Gras, Dents, Barbe
// ✅ Scan Repas (calories + macros + carences)
// ✅ Profil santé complet + mode halal
// ✅ Onboarding WOW (Sarah ongles + Sarah % gras)
// ✅ Double option photo : Caméra OU Galerie
// ✅ Chat IA nutritionniste post-scan
// ✅ Suivi progression (courbe scores)
// ✅ Plan repas personnalisé
// ✅ Rappels intelligents
// ✅ Profils famille (multi-profils)
// ✅ Défi communauté 30 jours
// ✅ Paywall 4,99$/mois honnête
// ✅ Fix bouton back Android PWA
// ✅ BILINGUE FR / EN — sélecteur de langue
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile,
  GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc,
  query, where, getDocs, orderBy, serverTimestamp
} from "firebase/firestore";
// ─── FCM — Notifications push ───
import { initFCM, updateLastActive, listenForegroundNotifs } from "./fcmService";
import SanteEmotionnelle from "./SanteEmotionnelle";
import NutritionLabelScan from "./NutritionLabelScan";
import ScoreEnergie from "./ScoreEnergie";
import MindsetGuerrier from "./MindsetGuerrier";
import RealiteBrutale from "./RealiteBrutale";
import ScanEnvironnement from "./ScanEnvironnement";
import MotivationModule from "./MotivationModule";
import ScoreImmunite from "./ScoreImmunite";
import ScannerFutur from "./ScannerFutur";
import ScoreDopamine from "./ScoreDopamine";
import SoloLevelingChallenge from "./SoloLevelingChallenge";
import ModuleRichesse from "./ModuleRichesse";
import { initCapacitor, isNative, NativeHaptics, NativePush, NativeStatusBar } from "./CapacitorService";

// ─── useRangAura — aura selon rang Solo Leveling ───
const AURA_DEFS = {
  F:   { color:"#9ca3af", glow:"#9ca3af", gradient:"radial-gradient(ellipse at 50% 0%,#9ca3af08 0%,#060d08 65%)", border:"#9ca3af33", intensity:0, particles:false, animation:null, badge:"⚪ Rang F" },
  E:   { color:"#22c55e", glow:"#22c55e", gradient:"radial-gradient(ellipse at 50% 0%,#22c55e12 0%,#060d08 65%)", border:"#22c55e44", intensity:1, particles:false, animation:null, badge:"🟢 Rang E" },
  D:   { color:"#3b82f6", glow:"#3b82f6", gradient:"radial-gradient(ellipse at 50% 0%,#3b82f618 0%,#060d08 65%)", border:"#3b82f655", intensity:2, particles:false, animation:"aura-pulse-blue", badge:"🔵 Rang D" },
  C:   { color:"#d97706", glow:"#d97706", gradient:"radial-gradient(ellipse at 50% 0%,#d9770618 0%,#060d08 65%)", border:"#d9770655", intensity:2, particles:false, animation:"aura-pulse-brown", badge:"🟤 Rang C" },
  B:   { color:"#6366f1", glow:"#818cf8", gradient:"radial-gradient(ellipse at 50% 0%,#6366f120 0%,#060d08 60%)", border:"#6366f166", intensity:3, particles:true, animation:"aura-pulse-indigo", badge:"🔷 Rang B" },
  A:   { color:"#f59e0b", glow:"#fbbf24", gradient:"radial-gradient(ellipse at 50% 0%,#f59e0b22 0%,#060d08 60%)", border:"#f59e0b77", intensity:3, particles:true, animation:"aura-pulse-gold", badge:"🟡 Rang A" },
  S:   { color:"#e879f9", glow:"#d946ef", gradient:"radial-gradient(ellipse at 40% 0%,#e879f928 0%,#060d08 55%)", border:"#e879f988", intensity:4, particles:true, animation:"aura-pulse-purple", badge:"🟣 Rang S" },
  SS:  { color:"#f97316", glow:"#fb923c", gradient:"radial-gradient(ellipse at 50% 0%,#f9731630 0%,#060d08 50%)", border:"#f97316aa", intensity:4, particles:true, animation:"aura-fire", badge:"🔶 Rang SS" },
  SSS: { color:"#fbbf24", glow:"#fde68a", gradient:"linear-gradient(135deg,#1a0a0020,#0a001a20,#001a0a20)", border:"#fbbf24cc", intensity:5, particles:true, animation:"aura-rainbow", badge:"⭐ Rang SSS" },
};

const AURA_CSS = `
  @keyframes aura-pulse-blue   { 0%,100%{box-shadow:0 0 20px #3b82f633} 50%{box-shadow:0 0 40px #3b82f666} }
  @keyframes aura-pulse-brown  { 0%,100%{box-shadow:0 0 20px #d9770633} 50%{box-shadow:0 0 40px #d9770666} }
  @keyframes aura-pulse-indigo { 0%,100%{box-shadow:0 0 25px #6366f144} 50%{box-shadow:0 0 55px #6366f188} }
  @keyframes aura-pulse-gold   { 0%,100%{box-shadow:0 0 25px #f59e0b44} 50%{box-shadow:0 0 60px #f59e0b99} }
  @keyframes aura-pulse-purple { 0%,100%{box-shadow:0 0 30px #e879f955} 50%{box-shadow:0 0 70px #e879f9bb} }
  @keyframes aura-fire         { 0%,100%{box-shadow:0 0 35px #f9731666,0 0 70px #f9731633} 50%{box-shadow:0 0 60px #f97316cc,0 0 120px #f9731666} }
  @keyframes aura-rainbow      { 0%{box-shadow:0 0 40px #ff000088} 20%{box-shadow:0 0 40px #ff880088} 40%{box-shadow:0 0 40px #00ff8888} 60%{box-shadow:0 0 40px #0088ff88} 80%{box-shadow:0 0 40px #8800ff88} 100%{box-shadow:0 0 40px #ff000088} }
  @keyframes particle-float    { 0%{transform:translateY(0) scale(1);opacity:.8} 50%{transform:translateY(-20px) scale(1.2);opacity:.4} 100%{transform:translateY(-40px) scale(0);opacity:0} }
  @keyframes badge-glow        { 0%,100%{opacity:.9} 50%{opacity:1;filter:brightness(1.3)} }
`;

function useRangAura() {
  try {
    const startRaw = localStorage.getItem("vs_solo_start");
    if (!startRaw) return { ...AURA_DEFS.F, rangId:"F" };
    const dayNumber = Math.max(1, Math.floor((new Date() - new Date(startRaw)) / (1000*60*60*24)) + 1);
    const week = Math.ceil(dayNumber / 7);
    const seuils = [
      {id:"SSS",week:16},{id:"SS",week:14},{id:"S",week:13},
      {id:"A",week:11},{id:"B",week:9},{id:"C",week:7},
      {id:"D",week:5},{id:"E",week:3},{id:"F",week:1},
    ];
    const rang = seuils.find(r => week >= r.week) || seuils[seuils.length-1];
    return { ...AURA_DEFS[rang.id], rangId: rang.id };
  } catch { return { ...AURA_DEFS.F, rangId:"F" }; }
}

function AuraParticles({ color, count=8 }) {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${15+((i*37)%70)}%`,
          top:`${20+((i*53)%50)}%`,
          width:`${3+((i*7)%4)}px`, height:`${3+((i*7)%4)}px`,
          borderRadius:"50%", background:color, opacity:0.6,
          animation:`particle-float ${2+((i*0.7)%3)}s ease-in-out ${(i*0.4)%2}s infinite`,
        }}/>
      ))}
    </div>
  );
}

function RangBadge({ aura, lang }) {
  if (!aura || aura.rangId === "F") return null;
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${aura.color}18`,border:`1.5px solid ${aura.border}`,borderRadius:20,padding:"4px 12px",animation:"badge-glow 2s ease-in-out infinite"}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:aura.color,boxShadow:`0 0 6px ${aura.glow}`}}/>
      <span style={{fontSize:11,fontWeight:800,color:aura.color,letterSpacing:.5}}>{aura.badge}</span>
    </div>
  );
}

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

// ─── TRADUCTIONS ───
const T = {
  fr: {
    // Global
    back: "← Retour",
    next: "Suivant →",
    skip: "Passer →",
    loading: "Chargement...",
    error: "Erreur. Réessayez.",
    save: "Sauvegarder →",
    // Onboarding
    ob_slide1_title: "Votre corps vous parle",
    ob_slide1_sub: "Ongles, yeux, peau, barbe, dents... Chaque zone révèle des pistes sur vos carences nutritionnelles. VitaScann les lit en 30 secondes.",
    ob_slide2_title: "Scannez aussi vos repas",
    ob_slide2_sub: "Photographiez votre assiette. VitaScann calcule calories, macros et vous dit ce qui manque à votre alimentation.",
    ob_slide3_title: "Toute la famille",
    ob_slide3_sub: "Un compte, plusieurs profils. Suivez la santé nutritionnelle de toute votre famille et progressez ensemble.",
    ob_see_results: "Voir de vrais résultats 👁",
    ob_create_account: "Créer mon compte gratuit",
    ob_try_demo: "Essayer sans compte (1 scan offert)",
    ob_already_account: "Déjà un compte ? Se connecter",
    ob_example_badge: "👁 EXEMPLES RÉELS — Sarah, 28 ans",
    ob_nails_title: "Scan Ongles — Sarah",
    ob_fat_title: "% Gras — Sarah +3 mois",
    ob_nails_cta: "Et toi, qu'est-ce que tes ongles révèlent ?",
    ob_fat_cta: "Et toi, quel est ton % de gras ?",
    ob_photo_hint: "1 photo suffit. Résultat en 30 secondes.",
    ob_register_cta: "Créer mon compte gratuit →",
    // Auth
    register_title: "Créer votre compte",
    register_subtitle: "1 scan gratuit offert dès l'inscription",
    register_name: "NOM COMPLET",
    register_name_ph: "Votre prénom",
    register_email: "EMAIL",
    register_email_ph: "vous@email.com",
    register_pass: "MOT DE PASSE",
    register_pass_ph: "8 caractères minimum",
    register_confirm: "CONFIRMER",
    register_confirm_ph: "Répétez le mot de passe",
    register_btn: "Créer mon compte →",
    register_login: "Déjà un compte ? Se connecter",
    register_success: "Compte créé !",
    register_welcome: "Bienvenue",
    err_name: "Nom requis",
    err_email: "Email invalide",
    err_pass: "8 caractères minimum",
    err_conf: "Mots de passe différents",
    err_email_used: "Email déjà utilisé.",
    err_weak_pass: "Mot de passe trop faible.",
    strength_weak: "Faible",
    strength_medium: "Moyen",
    strength_strong: "Fort",
    strength_very_strong: "Très fort",
    login_title: "Se connecter",
    login_subtitle: "Bon retour 🌿",
    login_btn: "Se connecter →",
    login_forgot: "Mot de passe oublié ?",
    login_no_account: "Pas encore de compte ? S'inscrire",
    err_fill_fields: "Remplissez tous les champs.",
    err_invalid_creds: "Email ou mot de passe incorrect.",
    forgot_title: "Réinitialiser",
    forgot_subtitle: "Entrez votre email pour recevoir un lien.",
    forgot_btn: "Envoyer le lien →",
    forgot_sent: "Email envoyé ! Vérifiez votre boîte.",
    forgot_back: "← Retour à la connexion",
    // Profile
    profile_title: "Votre profil santé",
    profile_subtitle: "Pour des analyses personnalisées",
    profile_age: "ÂGE",
    profile_age_ph: "Ex: 32",
    profile_weight: "POIDS (kg)",
    profile_weight_ph: "Ex: 75",
    profile_sex: "SEXE",
    profile_sex_m: "Homme",
    profile_sex_f: "Femme",
    profile_sex_other: "Autre",
    profile_goal: "OBJECTIF",
    profile_goal_loss: "Perte de poids",
    profile_goal_muscle: "Prise de muscle",
    profile_goal_health: "Santé générale",
    profile_goal_energy: "Énergie & vitalité",
    profile_goal_pregnancy: "Grossesse / allaitement",
    profile_goal_athlete: "Performance sportive",
    profile_activity: "ACTIVITÉ",
    profile_activity_low: "Sédentaire",
    profile_activity_moderate: "Modérée (2-3x/sem)",
    profile_activity_active: "Active (5x/sem)",
    profile_activity_very: "Très active (quotidien)",
    profile_halal: "🌙 Mode Halal",
    profile_halal_sub: "Recommandations conformes",
    profile_skip: "Passer pour l'instant",
    // Dashboard
    db_hello: "Bonjour,",
    db_premium: "👑 Compte Premium actif",
    db_free: "Gratuit ·",
    db_scans_left: "scan(s) restant(s)",
    db_logout: "Déco.",
    db_body_scan: "Scan corporel",
    db_body_sub: "11 zones analysées",
    db_meal_scan: "Scan repas",
    db_meal_sub: "Calories & carences",
    db_progress: "Progression",
    db_meal_plan: "Plan repas",
    db_family: "Famille",
    db_challenge: "Défi 30j",
    db_my_profile: "Mon profil",
    db_challenge_title: "🏆 Défi 30 jours",
    db_challenge_left: "scans restants pour terminer le défi",
    db_history_title: "📅 Derniers scans",
    db_recent: "Récent",
    db_good: "Bien",
    db_attention: "Attention",
    db_premium_banner: "Passez Premium",
    db_premium_sub: "Moins cher qu'un café/semaine",
    db_unlock: "Débloquer tout →",
    // Zones
    zones_title: "Choisir une zone",
    zones_premium_all: "👑 11 zones débloquées",
    zones_free: "3 zones gratuites",
    zones_premium_locked: "9 zones Premium 🔒",
    zones_premium_zone: "Zone Premium",
    zones_premium_price: "✨ Premium · 4,99$/mois",
    // Capture
    capture_title: "Photographier",
    capture_beard_title: "🪓 ANALYSE BARBE VIKING",
    capture_beard_sub: "VitaScann analyse la densité, les zones clairsemées et te donne des astuces naturelles de grand-mère pour booster ta croissance.",
    capture_teeth_title: "🦷 CONSEILS PHOTO",
    capture_teeth_sub: "Sourire large, lèvres bien ouvertes. Bonne lumière directe. Photo de face.",
    capture_tips_title: "💡 CONSEILS PHOTO",
    capture_tip1: "Lumière naturelle ou LED blanche",
    capture_tip2: "Bonne mise au point, pas floue",
    capture_tip3: "Distance adaptée à la zone",
    capture_camera: "📷 Prendre une photo",
    capture_gallery: "🖼️ Choisir dans la galerie",
    // Meal capture
    meal_capture_title: "Scan Repas",
    meal_capture_sub: "Photographiez votre assiette et obtenez :",
    meal_capture_macros: "calories · protéines · glucides · lipides",
    meal_capture_deficiencies: "et quelles carences ce repas comble.",
    meal_unlock: "👑 Débloquer le Scan Repas — 4,99$/mois",
    meal_feature1: "📸 Analyse visuelle de n'importe quel repas",
    meal_feature2: "🔢 Calories et macros estimés",
    meal_feature3: "💊 Carences comblées",
    meal_feature4: "🌙 Statut halal automatique",
    meal_feature5: "🔗 Croisé avec vos scans corporels",
    meal_photo_title: "📸 Photographier votre repas",
    meal_photo_sub: "Assiette entière visible, bonne lumière",
    // Analyzing
    analyzing_title: "Analyse en cours...",
    analyzing_sub: "Notre IA examine votre photo",
    analyzing_disclaimer: "Pistes indicatives uniquement — non médical",
    // Result
    result_title: "Votre rapport",
    result_urgent: "⚠️ Urgent",
    result_attention: "👁 Attention",
    result_normal: "✅ Normal",
    result_zone: "Zone analysée",
    result_body_fat_label: "Gras estimé",
    result_viking: "Potentiel Viking",
    result_deficiencies: "Carences",
    result_body_comp: "💪 Composition corporelle",
    result_body_fat: "Gras corporel",
    result_abs: "Abdos visibles",
    result_category: "Catégorie",
    result_morpho: "Morphologie",
    result_beard_title: "🪓 Analyse barbe",
    result_density: "Densité",
    result_viking_potential: "Potentiel Viking",
    result_sparse: "Zones clairsemées :",
    result_grandma_beard: "🧙‍♂️ Astuces grand-mère — Barbe",
    result_grandma_teeth: "🌿 Remèdes naturels — Dents",
    result_nutrients_body: "💊 Nutriments à optimiser",
    result_nutrients_beard: "💊 Nutriments pour la barbe",
    result_nutrients_teeth: "💊 Nutriments pour les dents",
    result_deficiencies_found: "🔍 Carences identifiées",
    result_food: "🥗 ALIMENTS",
    result_supplement: "💊 COMPLÉMENT",
    result_show: "▼ Recommandations",
    result_hide: "▲ Masquer",
    result_positives: "✅ Points positifs",
    result_advice: "💬 CONSEIL PERSONNALISÉ",
    result_disclaimer: "⚠️ Pistes indicatives — non médical",
    result_chat: "💬 Chat nutritionniste IA",
    result_share: "📤 Partager mes résultats",
    result_pdf: "📄 Télécharger PDF",
    result_new_scan: "🔬 Nouveau scan corporel",
    result_home: "🏠 Retour à l'accueil",
    // Meal result
    meal_result_title: "Analyse repas",
    meal_excellent: "✅ Excellent",
    meal_ok: "👁 Correct",
    meal_incomplete: "⚠️ Incomplet",
    meal_halal: "🌙 Halal",
    meal_halal_check: "⚠️ Vérifier halal",
    meal_calories: "Calories estimées",
    meal_macros: "📊 Macronutriments",
    meal_protein: "Protéines",
    meal_carbs: "Glucides",
    meal_fat: "Lipides",
    meal_covered: "✅ Carences comblées",
    meal_missing: "⚠️ Ce qui manque",
    meal_global_advice: "💬 CONSEIL",
    meal_disclaimer: "⚠️ Estimation indicative basée sur l'analyse visuelle.",
    meal_share: "📤 Partager mon analyse",
    meal_new: "🍽️ Scanner un autre repas",
    meal_home: "🏠 Retour à l'accueil",
    // Progress
    progress_title: "📈 Ma progression",
    progress_sub: "Évolution de vos scores",
    progress_empty: "Faites vos premiers scans pour voir votre progression !",
    progress_best: "Meilleur",
    progress_avg: "Moyen",
    progress_scans: "Scans",
    // Meal plan
    mealplan_title: "🗓️ Plan repas 7 jours",
    mealplan_sub: "Personnalisé selon votre profil et vos carences",
    mealplan_generate: "✨ Générer mon plan personnalisé",
    mealplan_regen: "Régénérer",
    mealplan_breakfast: "🌅 Petit-déj",
    mealplan_lunch: "☀️ Déjeuner",
    mealplan_dinner: "🌙 Dîner",
    mealplan_snack: "🍎 Snack",
    // Family
    family_title: "👨‍👩‍👧 Ma famille",
    family_sub: "Suivez la santé de toute votre famille",
    family_me: "Moi",
    family_active: "Actif",
    family_tap: "Appuyer pour scanner",
    family_add_title: "➕ Ajouter un membre",
    family_add_ph: "Prénom du membre",
    family_add_btn: "Ajouter →",
    // Challenge
    challenge_title: "🏆 Défi 30 jours",
    challenge_sub: "Améliorez votre santé en 30 scans",
    challenge_done: "scans complétés",
    challenge_complete: "🎉 Défi terminé !",
    challenge_left: "Plus que",
    challenge_left2: "scans !",
    challenge_start: "Commencez votre premier scan !",
    badge_first: "Premier pas",
    badge_5: "5 scans",
    badge_10: "10 scans",
    badge_20: "20 scans",
    badge_30: "Défi complet",
    badge_day: "Jour",
    badge_obtained: "✓ Obtenu !",
    // Paywall
    pw_timer_label: "⏰ OFFRE DE LANCEMENT",
    pw_timer_urgent: "🔥 OFFRE EXPIRE BIENTÔT",
    pw_regular: "Prix habituel",
    pw_title: "VitaScann Premium",
    pw_subtitle: "Moins cher qu'un café par semaine.",
    pw_unlock: "✨ CE QUE VOUS DÉBLOQUEZ",
    pw_f1_title: "11 zones corporelles",
    pw_f1_sub: "Dont Dents 🦷 et Barbe 🧔 — unique au monde",
    pw_f2_title: "Scan Repas",
    pw_f2_sub: "Calories, macros, carences comblées",
    pw_f3_title: "Chat nutritionniste IA",
    pw_f3_sub: "Posez vos questions après chaque scan",
    pw_f4_title: "Plan repas 7 jours",
    pw_f4_sub: "Personnalisé selon vos carences",
    pw_f5_title: "Suivi progression",
    pw_f5_sub: "Courbe de vos scores dans le temps",
    pw_f6_title: "Profils famille",
    pw_f6_sub: "Toute la famille sur un compte",
    pw_f7_title: "Mode halal",
    pw_f7_sub: "Compléments et aliments conformes",
    pw_f8_title: "Rapport PDF",
    pw_f8_sub: "Partageable avec votre médecin",
    pw_f9_title: "Coach Fitness IA",
    pw_f9_sub: "Programme gym & calisthenics personnalisé",
    pw_f10_title: "Coach Calisthenics",
    pw_f10_sub: "Progressions poids du corps · Muscle-up · Planche",
    pw_per_month: "par mois · Annulez quand vous voulez",
    pw_discount: "✅ -50% tarif de lancement",
    pw_btn: "💳 S'abonner maintenant →",
    pw_secure: "Paiement sécurisé Stripe",
    pw_cancel: "Sans engagement",
    pw_support: "Support rapide",
    pw_disclaimer: "⚠️ VitaScann fournit des pistes nutritionnelles indicatives, pas des diagnostics médicaux.",
    // Chat
    chat_title: "💬 Nutritionniste IA",
    chat_placeholder: "Posez votre question...",
    chat_welcome: "Bonjour ! Je suis votre nutritionniste IA VitaScann. Que voulez-vous savoir sur vos résultats ?",
    // Nav
    nav_home: "Accueil",
    nav_scan: "Scanner",
    nav_meal: "Repas",
    nav_family: "Famille",
    // Language selector
    lang_label: "Langue / Language",
    // Islamic tips
    islamic_title: "🌙 Médecine du Prophète ﷺ",
    grandma_title: "🧕 Remèdes de grand-mère",
    islamic_sub: "Tibb an-Nabawi — Sagesse millénaire",
    // Gamification
    xp_title: "⚡ Points gagnés",
    xp_pts: "pts",
    level_title: "Votre niveau",
    streak_title: "🔥 Série en cours",
    streak_days: "jours consécutifs",
    reward_title: "🎁 Récompense débloquée !",
    reward_week: "1 semaine Premium offerte 🎉",
    reward_month: "1 mois Premium offert 👑",
    reward_badge: "Badge débloqué",
    scan_count_title: "📊 Vos stats",
    total_scans: "Scans totaux",
    // Ranking
    rank_title: "🏆 Classement",
    rank_global: "Mondial",
    rank_you: "Vous",
    // VitaCoins
    coins_title: "🪙 VitaCoins",
    coins_earned: "gagnées",
    coins_balance: "Votre solde",
    coins_history: "Historique",
    coins_redeem: "Échanger",
    coins_how: "Comment gagner",
    coins_per_scan: "+10 par scan",
    coins_per_streak: "+50 streak 7 jours",
    coins_per_steps: "+5 par 1000 pas",
    coins_per_ref: "+200 par parrainage",
    coins_reward_100: "1 semaine Premium",
    coins_reward_300: "1 mois Premium",
    coins_reward_500: "Bon Amazon 5$",
    coins_reward_1000: "Cashback 10$ PayPal",
    coins_not_enough: "Pas assez de VitaCoins",
    coins_redeemed: "Récompense débloquée ! 🎉",
    coins_req: "VitaCoins requis",
    // Pedometer
    steps_title: "🏃 Activité",
    steps_today: "Pas aujourd'hui",
    steps_goal: "Objectif",
    steps_coins: "VitaCoins gagnés",
    steps_locked: "🔒 Débloqué après 15 scans",
    steps_unlock_msg: "Encore",
    steps_unlock_msg2: "scans pour débloquer",
    steps_congrats: "Objectif atteint ! 🎉",
    // Exercises
    ex_title: "💪 Exercices personnalisés",
    ex_sub: "Basés sur vos carences",
    ex_complete: "Exercice complété !",
    ex_coins: "+15 VitaCoins gagnés",
    ex_locked: "🔒 Débloqué après 15 scans",
    ex_start: "Commencer",
    ex_done: "✅ Complété",
    ex_mins: "min",
    // Referral
    ref_title: "👥 Parrainage",
    ref_sub: "Invite tes amis, gagne des VitaCoins",
    ref_your_link: "Ton lien unique",
    ref_copy: "📋 Copier le lien",
    ref_copied: "✅ Copié !",
    ref_share: "📤 Partager",
    ref_count: "Amis parrainés",
    ref_earned: "VitaCoins gagnés",
    ref_how1: "Tu invites un ami → +200 VitaCoins pour toi",
    ref_how2: "Ton ami s'inscrit → +100 VitaCoins pour lui",
    ref_bonus: "🎁 Bonus parrainage",
    // Fitness Coach
    fit_title: "🥊 Coach Fitness IA",
    fit_sub: "Analyse ton corps, crée ton programme",
    fit_zone_title: "Choisir la zone à analyser",
    fit_capture_title: "Photographier la zone",
    fit_analyzing: "Analyse fitness en cours...",
    fit_result_title: "Rapport Coach IA",
    fit_pct_gras: "% Masse grasse estimé",
    fit_muscles_prio: "💪 Muscles prioritaires",
    fit_programme: "Programme",
    fit_gym: "🏋️ Gym",
    fit_cali: "🤸 Calisthenics",
    fit_nutrition: "🥗 Nutrition fitness",
    fit_crosslink: "📊 Lié à tes scans nutri",
    fit_tibb: "🌙 Tibb an-Nabawi Fitness",
    fit_new_scan: "🔬 Nouveau scan fitness",
    fit_home: "🏠 Retour accueil",
    fit_premium_lock: "👑 Scan Fitness — Premium",
    fit_premium_sub: "Débloquer le Coach Fitness IA",
    fit_week_plan: "📅 Programme semaine",
    fit_session: "Séance",
    fit_sets: "séries",
    fit_reps: "reps",
    fit_done: "✅ Fait",
    fit_start: "Commencer",
    fit_timer_go: "⏱️ C'est parti !",
  },
  en: {
    // Global
    back: "← Back",
    next: "Next →",
    skip: "Skip →",
    loading: "Loading...",
    error: "Error. Please try again.",
    save: "Save →",
    // Onboarding
    ob_slide1_title: "Your body speaks",
    ob_slide1_sub: "Nails, eyes, skin, beard, teeth... Each zone reveals clues about your nutritional deficiencies. VitaScann reads them in 30 seconds.",
    ob_slide2_title: "Scan your meals too",
    ob_slide2_sub: "Photograph your plate. VitaScann calculates calories, macros and tells you what's missing from your diet.",
    ob_slide3_title: "The whole family",
    ob_slide3_sub: "One account, multiple profiles. Track the nutritional health of your entire family and progress together.",
    ob_see_results: "See real results 👁",
    ob_create_account: "Create my free account",
    ob_try_demo: "Try without account (1 free scan)",
    ob_already_account: "Already have an account? Sign in",
    ob_example_badge: "👁 REAL EXAMPLES — Sarah, 28 years",
    ob_nails_title: "Nail Scan — Sarah",
    ob_fat_title: "Body Fat % — Sarah +3 months",
    ob_nails_cta: "What do your nails reveal?",
    ob_fat_cta: "What's your body fat %?",
    ob_photo_hint: "1 photo is enough. Result in 30 seconds.",
    ob_register_cta: "Create my free account →",
    // Auth
    register_title: "Create your account",
    register_subtitle: "1 free scan offered upon registration",
    register_name: "FULL NAME",
    register_name_ph: "Your first name",
    register_email: "EMAIL",
    register_email_ph: "you@email.com",
    register_pass: "PASSWORD",
    register_pass_ph: "8 characters minimum",
    register_confirm: "CONFIRM",
    register_confirm_ph: "Repeat password",
    register_btn: "Create my account →",
    register_login: "Already have an account? Sign in",
    register_success: "Account created!",
    register_welcome: "Welcome",
    err_name: "Name required",
    err_email: "Invalid email",
    err_pass: "8 characters minimum",
    err_conf: "Passwords don't match",
    err_email_used: "Email already in use.",
    err_weak_pass: "Password too weak.",
    strength_weak: "Weak",
    strength_medium: "Medium",
    strength_strong: "Strong",
    strength_very_strong: "Very strong",
    login_title: "Sign in",
    login_subtitle: "Welcome back 🌿",
    login_btn: "Sign in →",
    login_forgot: "Forgot password?",
    login_no_account: "No account yet? Sign up",
    err_fill_fields: "Please fill all fields.",
    err_invalid_creds: "Incorrect email or password.",
    forgot_title: "Reset Password",
    forgot_subtitle: "Enter your email to receive a reset link.",
    forgot_btn: "Send link →",
    forgot_sent: "Email sent! Check your inbox.",
    forgot_back: "← Back to login",
    // Profile
    profile_title: "Your health profile",
    profile_subtitle: "For personalized analyses",
    profile_age: "AGE",
    profile_age_ph: "E.g. 32",
    profile_weight: "WEIGHT (kg)",
    profile_weight_ph: "E.g. 75",
    profile_sex: "SEX",
    profile_sex_m: "Male",
    profile_sex_f: "Female",
    profile_sex_other: "Other",
    profile_goal: "GOAL",
    profile_goal_loss: "Weight loss",
    profile_goal_muscle: "Muscle gain",
    profile_goal_health: "General health",
    profile_goal_energy: "Energy & vitality",
    profile_goal_pregnancy: "Pregnancy / breastfeeding",
    profile_goal_athlete: "Athletic performance",
    profile_activity: "ACTIVITY",
    profile_activity_low: "Sedentary",
    profile_activity_moderate: "Moderate (2-3x/week)",
    profile_activity_active: "Active (5x/week)",
    profile_activity_very: "Very active (daily)",
    profile_halal: "🌙 Halal Mode",
    profile_halal_sub: "Compliant recommendations",
    profile_skip: "Skip for now",
    // Dashboard
    db_hello: "Hello,",
    db_premium: "👑 Premium account active",
    db_free: "Free ·",
    db_scans_left: "scan(s) remaining",
    db_logout: "Logout",
    db_body_scan: "Body scan",
    db_body_sub: "11 zones analyzed",
    db_meal_scan: "Meal scan",
    db_meal_sub: "Calories & deficiencies",
    db_progress: "Progress",
    db_meal_plan: "Meal plan",
    db_family: "Family",
    db_challenge: "30d Challenge",
    db_my_profile: "My profile",
    db_challenge_title: "🏆 30-day Challenge",
    db_challenge_left: "scans left to complete the challenge",
    db_history_title: "📅 Recent scans",
    db_recent: "Recent",
    db_good: "Good",
    db_attention: "Watch out",
    db_premium_banner: "Go Premium",
    db_premium_sub: "Less than a coffee per week",
    db_unlock: "Unlock everything →",
    // Zones
    zones_title: "Choose a zone",
    zones_premium_all: "👑 11 zones unlocked",
    zones_free: "3 free zones",
    zones_premium_locked: "9 Premium zones 🔒",
    zones_premium_zone: "Premium Zone",
    zones_premium_price: "✨ Premium · $9.99/month",
    // Capture
    capture_title: "Take a photo",
    capture_beard_title: "🪓 VIKING BEARD ANALYSIS",
    capture_beard_sub: "VitaScann analyzes density, sparse zones and gives you natural grandmother remedies to boost your growth.",
    capture_teeth_title: "🦷 PHOTO TIPS",
    capture_teeth_sub: "Wide smile, lips fully open. Good direct light. Front photo.",
    capture_tips_title: "💡 PHOTO TIPS",
    capture_tip1: "Natural light or white LED",
    capture_tip2: "Good focus, not blurry",
    capture_tip3: "Appropriate distance for the zone",
    capture_camera: "📷 Take a photo",
    capture_gallery: "🖼️ Choose from gallery",
    // Meal capture
    meal_capture_title: "Meal Scan",
    meal_capture_sub: "Photograph your plate and get:",
    meal_capture_macros: "calories · protein · carbs · fat",
    meal_capture_deficiencies: "and which deficiencies this meal covers.",
    meal_unlock: "👑 Unlock Meal Scan — $9.99/month",
    meal_feature1: "📸 Visual analysis of any meal",
    meal_feature2: "🔢 Estimated calories and macros",
    meal_feature3: "💊 Deficiencies covered",
    meal_feature4: "🌙 Automatic halal status",
    meal_feature5: "🔗 Crossed with your body scans",
    meal_photo_title: "📸 Photograph your meal",
    meal_photo_sub: "Full plate visible, good lighting",
    // Analyzing
    analyzing_title: "Analysis in progress...",
    analyzing_sub: "Our AI is examining your photo",
    analyzing_disclaimer: "Indicative clues only — not medical",
    // Result
    result_title: "Your report",
    result_urgent: "⚠️ Urgent",
    result_attention: "👁 Attention",
    result_normal: "✅ Normal",
    result_zone: "Analyzed zone",
    result_body_fat_label: "Estimated fat",
    result_viking: "Viking Potential",
    result_deficiencies: "Deficiencies",
    result_body_comp: "💪 Body composition",
    result_body_fat: "Body fat",
    result_abs: "Abs visible",
    result_category: "Category",
    result_morpho: "Morphology",
    result_beard_title: "🪓 Beard analysis",
    result_density: "Density",
    result_viking_potential: "Viking Potential",
    result_sparse: "Sparse zones:",
    result_grandma_beard: "🧙‍♂️ Grandmother tips — Beard",
    result_grandma_teeth: "🌿 Natural remedies — Teeth",
    result_nutrients_body: "💊 Nutrients to optimize",
    result_nutrients_beard: "💊 Nutrients for beard",
    result_nutrients_teeth: "💊 Nutrients for teeth",
    result_deficiencies_found: "🔍 Identified deficiencies",
    result_food: "🥗 FOODS",
    result_supplement: "💊 SUPPLEMENT",
    result_show: "▼ Recommendations",
    result_hide: "▲ Hide",
    result_positives: "✅ Positive points",
    result_advice: "💬 PERSONALIZED ADVICE",
    result_disclaimer: "⚠️ Indicative clues — not medical",
    result_chat: "💬 AI Nutritionist Chat",
    result_share: "📤 Share my results",
    result_pdf: "📄 Download PDF",
    result_new_scan: "🔬 New body scan",
    result_home: "🏠 Back to home",
    // Meal result
    meal_result_title: "Meal analysis",
    meal_excellent: "✅ Excellent",
    meal_ok: "👁 Good",
    meal_incomplete: "⚠️ Incomplete",
    meal_halal: "🌙 Halal",
    meal_halal_check: "⚠️ Check halal",
    meal_calories: "Estimated calories",
    meal_macros: "📊 Macronutrients",
    meal_protein: "Protein",
    meal_carbs: "Carbs",
    meal_fat: "Fat",
    meal_covered: "✅ Deficiencies covered",
    meal_missing: "⚠️ What's missing",
    meal_global_advice: "💬 ADVICE",
    meal_disclaimer: "⚠️ Indicative estimate based on visual analysis.",
    meal_share: "📤 Share my analysis",
    meal_new: "🍽️ Scan another meal",
    meal_home: "🏠 Back to home",
    // Progress
    progress_title: "📈 My progress",
    progress_sub: "Evolution of your scores",
    progress_empty: "Do your first scans to see your progress!",
    progress_best: "Best",
    progress_avg: "Average",
    progress_scans: "Scans",
    // Meal plan
    mealplan_title: "🗓️ 7-day Meal Plan",
    mealplan_sub: "Personalized to your profile and deficiencies",
    mealplan_generate: "✨ Generate my personalized plan",
    mealplan_regen: "Regenerate",
    mealplan_breakfast: "🌅 Breakfast",
    mealplan_lunch: "☀️ Lunch",
    mealplan_dinner: "🌙 Dinner",
    mealplan_snack: "🍎 Snack",
    // Family
    family_title: "👨‍👩‍👧 My family",
    family_sub: "Track the health of your whole family",
    family_me: "Me",
    family_active: "Active",
    family_tap: "Tap to scan",
    family_add_title: "➕ Add a member",
    family_add_ph: "Member's first name",
    family_add_btn: "Add →",
    // Challenge
    challenge_title: "🏆 30-day Challenge",
    challenge_sub: "Improve your health in 30 scans",
    challenge_done: "scans completed",
    challenge_complete: "🎉 Challenge complete!",
    challenge_left: "Only",
    challenge_left2: "scans left!",
    challenge_start: "Start your first scan!",
    badge_first: "First step",
    badge_5: "5 scans",
    badge_10: "10 scans",
    badge_20: "20 scans",
    badge_30: "Challenge complete",
    badge_day: "Day",
    badge_obtained: "✓ Obtained!",
    // Paywall
    pw_timer_label: "⏰ LAUNCH OFFER",
    pw_timer_urgent: "🔥 OFFER EXPIRING SOON",
    pw_regular: "Regular price",
    pw_title: "VitaScann Premium",
    pw_subtitle: "Less than a coffee per week.",
    pw_unlock: "✨ WHAT YOU UNLOCK",
    pw_f1_title: "11 body zones",
    pw_f1_sub: "Including Teeth 🦷 and Beard 🧔 — unique worldwide",
    pw_f2_title: "Meal Scan",
    pw_f2_sub: "Calories, macros, deficiencies covered",
    pw_f3_title: "AI Nutritionist Chat",
    pw_f3_sub: "Ask questions after every scan",
    pw_f4_title: "7-day meal plan",
    pw_f4_sub: "Personalized to your deficiencies",
    pw_f5_title: "Progress tracking",
    pw_f5_sub: "Score curve over time",
    pw_f6_title: "Family profiles",
    pw_f6_sub: "Whole family on one account",
    pw_f7_title: "Halal mode",
    pw_f7_sub: "Compliant supplements and foods",
    pw_f8_title: "PDF Report",
    pw_f8_sub: "Shareable with your doctor",
    pw_f9_title: "AI Fitness Coach",
    pw_f9_sub: "Personalized gym & calisthenics program",
    pw_f10_title: "Calisthenics Coach",
    pw_f10_sub: "Bodyweight progressions · Muscle-up · Planche",
    pw_per_month: "per month · Cancel anytime",
    pw_discount: "✅ -50% launch price",
    pw_btn: "💳 Subscribe now →",
    pw_secure: "Secure Stripe payment",
    pw_cancel: "No commitment",
    pw_support: "Fast support",
    pw_disclaimer: "⚠️ VitaScann provides indicative nutritional clues, not medical diagnoses.",
    // Chat
    chat_title: "💬 AI Nutritionist",
    chat_placeholder: "Ask your question...",
    chat_welcome: "Hello! I'm your VitaScann AI nutritionist. What would you like to know about your results?",
    // Nav
    nav_home: "Home",
    nav_scan: "Scan",
    nav_meal: "Meals",
    nav_family: "Family",
    // Language selector
    lang_label: "Langue / Language",
    // Islamic tips
    islamic_title: "🌙 Prophet's Medicine ﷺ",
    grandma_title: "🧕 Grandmother Remedies",
    islamic_sub: "Tibb an-Nabawi — Millennial Wisdom",
    // Gamification
    xp_title: "⚡ Points earned",
    xp_pts: "pts",
    level_title: "Your level",
    streak_title: "🔥 Current streak",
    streak_days: "consecutive days",
    reward_title: "🎁 Reward unlocked!",
    reward_week: "1 free Premium week 🎉",
    reward_month: "1 free Premium month 👑",
    reward_badge: "Badge unlocked",
    scan_count_title: "📊 Your stats",
    total_scans: "Total scans",
    // Ranking
    rank_title: "🏆 Ranking",
    rank_global: "Global",
    rank_you: "You",
    // VitaCoins
    coins_title: "🪙 VitaCoins",
    coins_earned: "earned",
    coins_balance: "Your balance",
    coins_history: "History",
    coins_redeem: "Redeem",
    coins_how: "How to earn",
    coins_per_scan: "+10 per scan",
    coins_per_streak: "+50 for 7-day streak",
    coins_per_steps: "+5 per 1000 steps",
    coins_per_ref: "+200 per referral",
    coins_reward_100: "1 Premium week",
    coins_reward_300: "1 Premium month",
    coins_reward_500: "$5 Amazon gift card",
    coins_reward_1000: "$10 PayPal cashback",
    coins_not_enough: "Not enough VitaCoins",
    coins_redeemed: "Reward unlocked! 🎉",
    coins_req: "VitaCoins required",
    // Pedometer
    steps_title: "🏃 Activity",
    steps_today: "Steps today",
    steps_goal: "Goal",
    steps_coins: "VitaCoins earned",
    steps_locked: "🔒 Unlocked after 15 scans",
    steps_unlock_msg: "Only",
    steps_unlock_msg2: "scans left to unlock",
    steps_congrats: "Goal reached! 🎉",
    // Exercises
    ex_title: "💪 Personalized Exercises",
    ex_sub: "Based on your deficiencies",
    ex_complete: "Exercise completed!",
    ex_coins: "+15 VitaCoins earned",
    ex_locked: "🔒 Unlocked after 15 scans",
    ex_start: "Start",
    ex_done: "✅ Completed",
    ex_mins: "min",
    // Referral
    ref_title: "👥 Referral",
    ref_sub: "Invite friends, earn VitaCoins",
    ref_your_link: "Your unique link",
    ref_copy: "📋 Copy link",
    ref_copied: "✅ Copied!",
    ref_share: "📤 Share",
    ref_count: "Friends referred",
    ref_earned: "VitaCoins earned",
    ref_how1: "You invite a friend → +200 VitaCoins for you",
    ref_how2: "Friend signs up → +100 VitaCoins for them",
    ref_bonus: "🎁 Referral bonus",
    // Fitness Coach
    fit_title: "🥊 Fitness AI Coach",
    fit_sub: "Analyze your body, build your program",
    fit_zone_title: "Choose zone to analyze",
    fit_capture_title: "Photograph the zone",
    fit_analyzing: "Fitness analysis in progress...",
    fit_result_title: "AI Coach Report",
    fit_pct_gras: "Estimated body fat %",
    fit_muscles_prio: "💪 Priority muscles",
    fit_programme: "Program",
    fit_gym: "🏋️ Gym",
    fit_cali: "🤸 Calisthenics",
    fit_nutrition: "🥗 Fitness nutrition",
    fit_crosslink: "📊 Linked to your nutri scans",
    fit_tibb: "🌙 Tibb an-Nabawi Fitness",
    fit_new_scan: "🔬 New fitness scan",
    fit_home: "🏠 Back home",
    fit_premium_lock: "👑 Fitness Scan — Premium",
    fit_premium_sub: "Unlock AI Fitness Coach",
    fit_week_plan: "📅 Weekly program",
    fit_session: "Session",
    fit_sets: "sets",
    fit_reps: "reps",
    fit_done: "✅ Done",
    fit_start: "Start",
    fit_timer_go: "⏱️ Go!",
  }
};

// ─── SERVICES ───
const AuthService = {
  register: async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "users", cred.user.uid), { name, email, plan: "free", scansCount: 0, createdAt: serverTimestamp() });
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
  saveProfile: async (userId, profile) => { await setDoc(doc(db, "users", userId), { profile }, { merge: true }); },
  saveFamily: async (userId, family) => { await setDoc(doc(db, "users", userId), { family }, { merge: true }); },
};

// ─── VITACOINS SERVICE ───
const CoinsService = {
  getBalance: async (userId) => {
    const d = await getDoc(doc(db,"users",userId));
    return d.data()?.vitaCoins || 0;
  },
  add: async (userId, amount, reason) => {
    const ref = doc(db,"users",userId);
    const d = await getDoc(ref);
    const current = d.data()?.vitaCoins || 0;
    const history = d.data()?.coinsHistory || [];
    await setDoc(ref, {
      vitaCoins: current + amount,
      coinsHistory: [{amount,reason,date:new Date().toISOString()},...history].slice(0,50)
    }, {merge:true});
    return current + amount;
  },
  spend: async (userId, amount) => {
    const ref = doc(db,"users",userId);
    const d = await getDoc(ref);
    const current = d.data()?.vitaCoins || 0;
    if(current < amount) return false;
    await setDoc(ref, {vitaCoins: current - amount}, {merge:true});
    return true;
  },
  getReferralCount: async (userId) => {
    const q = query(collection(db,"users"), where("referredBy","==",userId));
    const snap = await getDocs(q);
    return snap.size;
  },
  processReferral: async (newUserId, referrerId) => {
    if(!referrerId || referrerId === newUserId) return;
    await setDoc(doc(db,"users",newUserId),{referredBy:referrerId},{merge:true});
    await CoinsService.add(referrerId, 200, "Parrainage ami");
    await CoinsService.add(newUserId, 100, "Bonus inscription parrainage");
  },
};

// ─── EXERCISES DATA ───
const EXERCISES_BY_ZONE = {
  nails: [
    {id:"e1",name:"Yoga des mains",emoji:"🧘",duration:10,desc:"Étirements et rotations pour améliorer la circulation vers les ongles.",coins:15},
    {id:"e2",name:"Marche rapide",emoji:"🚶",duration:20,desc:"20 min de marche active booste l'absorption du Fer.",coins:15},
  ],
  eyes: [
    {id:"e3",name:"Exercices oculaires",emoji:"👁️",duration:5,desc:"Rotations et focus pour détendre et renforcer les muscles oculaires.",coins:15},
    {id:"e4",name:"Plein air 20min",emoji:"☀️",duration:20,desc:"S'exposer à la lumière naturelle améliore la Vitamine A.",coins:15},
  ],
  skin: [
    {id:"e5",name:"Cardio léger",emoji:"🏃",duration:15,desc:"Améliore la circulation et l'oxygénation de la peau.",coins:15},
    {id:"e6",name:"Stretching",emoji:"🤸",duration:10,desc:"Réduit le cortisol, facteur de problèmes de peau.",coins:15},
  ],
  hair: [
    {id:"e7",name:"Massage cuir chevelu",emoji:"💆",duration:5,desc:"Massage circulaire 5min stimule les follicules pileux.",coins:15},
    {id:"e8",name:"Yoga inversé",emoji:"🙃",duration:10,desc:"Postures tête en bas augmentent le flux sanguin vers le cuir chevelu.",coins:15},
  ],
  belly: [
    {id:"e9",name:"Marche post-repas",emoji:"🚶",duration:15,desc:"15 min après chaque repas régule la glycémie et réduit le ventre.",coins:15},
    {id:"e10",name:"Gainage",emoji:"💪",duration:10,desc:"3 séries de 30s planche renforce les abdominaux profonds.",coins:15},
  ],
  body_fat: [
    {id:"e11",name:"HIIT 20min",emoji:"🔥",duration:20,desc:"Intervalles haute intensité : brûle-graisses optimal.",coins:20},
    {id:"e12",name:"Musculation",emoji:"🏋️",duration:30,desc:"30 min de musculation booste le métabolisme 24h.",coins:20},
  ],
  beard: [
    {id:"e13",name:"Cardio 20min",emoji:"🏃",duration:20,desc:"Le cardio booste la testostérone et favorise la croissance de la barbe.",coins:15},
    {id:"e14",name:"Musculation compound",emoji:"🏋️",duration:30,desc:"Squats, deadlifts = testostérone naturelle = barbe dense.",coins:20},
  ],
  teeth: [
    {id:"e15",name:"Brossage technique",emoji:"🦷",duration:3,desc:"Technique Bass : 45° sur la gencive, petits cercles 2 min.",coins:10},
    {id:"e16",name:"Oil pulling",emoji:"🥥",duration:10,desc:"Gargarisme huile coco 10min à jeun — antibactérien naturel.",coins:15},
  ],
  feet: [
    {id:"e17",name:"Marche pieds nus",emoji:"🦶",duration:15,desc:"15 min pieds nus sur herbe ou sable stimule la circulation.",coins:15},
    {id:"e18",name:"Étirements chevilles",emoji:"🔄",duration:10,desc:"Rotations et étirements pour activer la circulation.",coins:10},
  ],
  tongue: [
    {id:"e19",name:"Respiration profonde",emoji:"🖐️",duration:5,desc:"Respiration abdominale améliore l'oxygénation et la digestion.",coins:10},
    {id:"e20",name:"Marche digestive",emoji:"🚶",duration:15,desc:"Marche légère 30min après repas améliore l'absorption B12.",coins:15},
  ],
  scalp: [
    {id:"e21",name:"Massage cuir chevelu",emoji:"💆",duration:5,desc:"Massage avec huile de nigelle 5min chaque soir.",coins:15},
    {id:"e22",name:"Inversions yoga",emoji:"🧘",duration:10,desc:"Posture du chien tête en bas 3x2min pour la circulation.",coins:15},
  ],
};

// ─── FITNESS PROMPT ───
const FITNESS_PROMPT = `Tu es VitaScann Coach Fitness IA. Analyse cette photo corporelle. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"score":0-100,"pct_gras_estime":5-45,"categorie_gras":"essentiel|athlete|fitness|acceptable|obesite","muscles_prioritaires":[{"muscle":"Chest","priorite":"haute|moyenne|faible","raison":"manque de volume visible","emoji":"💪"}],"programme_gym":{"nom":"Programme Force","seances_semaine":3,"semaines":4,"seances":[{"jour":"Lundi","type":"Push","exercices":[{"nom":"Développé couché","series":4,"reps":"8-10","repos_sec":90,"type":"gym","emoji":"🏋️"},{"nom":"Élévations frontales","series":3,"reps":"12","repos_sec":60,"type":"gym","emoji":"🏋️"}]}]},"programme_cali":{"nom":"Programme Calisthenics","seances_semaine":3,"semaines":4,"seances":[{"jour":"Lundi","type":"Push","exercices":[{"nom":"Pompes diamant","series":4,"reps":"max","repos_sec":60,"type":"cali","emoji":"🤸"},{"nom":"Dips banc","series":3,"reps":"12","repos_sec":60,"type":"cali","emoji":"🤸"}]}]},"nutrition_fitness":{"calories_recommandees":2200,"proteines_g":150,"conseil":"Augmente les protéines le matin.","aliments_cles":["œufs","poulet","avocats"],"complements":["Whey","Créatine"]},"tibb_fitness":["Le Prophète ﷺ marchait quotidiennement — 30min/jour minimum.","Le miel avant entraînement donne de l'énergie selon la Sunna."],"conseil_global":"Conseil personnalisé en 2 phrases.","posture":"bonne|passable|a_corriger","posture_conseil":"Conseil posture."}`;

// ─── PROMPTS IA COACH GYM PAR GROUPE MUSCULAIRE ───
const GYM_AI_PROMPTS = {
  chest: `Tu es VitaScann Coach Gym IA spécialiste PECTORAUX. L'utilisateur vient de terminer son entraînement chest. Analyse ses performances et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"chest","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":2.5,"raison":"string"}],"conseil_technique":{"exercice_principal":"Développé couché","erreur_commune":"Coudes trop écartés — rentre-les à 45° pour protéger les épaules","cue":"Essaie de 'casser' la barre vers l'extérieur pour activer les pectoraux au maximum"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+2.5kg|+5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Consomme 40g de protéines dans les 30 min post-entraînement","aliment_cle":"Blanc de poulet ou shake whey","timing":"Idéal: entraînement à jeun + shake après"},"tibb":{"hadith":"Le corps est une amanah (dépôt) — l'entretenir est une ibadah","conseil":"Appliquez du miel sur les muscles endoloris — effet anti-inflammatoire naturel mentionné dans la Sunna"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  dos: `Tu es VitaScann Coach Gym IA spécialiste DOS. L'utilisateur vient de terminer son entraînement dos. Analyse ses performances et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"dos","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":2.5,"raison":"string"}],"conseil_technique":{"exercice_principal":"Lat Pulldown","erreur_commune":"Tirer avec les biceps au lieu du dos — pense à 'écraser une orange sous tes aisselles'","cue":"Initie chaque rep en dépriment les omoplates avant de tirer — active le grand dorsal à 100%"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+2.5kg|+5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Le dos est le plus grand groupe musculaire — priorise 50g de protéines post-séance","aliment_cle":"Saumon ou thon — oméga-3 pour la récupération","timing":"Fenêtre anabolique de 45min — ne la rate pas"},"tibb":{"hadith":"Le Prophète ﷺ avait une forte constitution — le dos fort est signe de santé","conseil":"Le gingembre en infusion accélère la récupération musculaire — Sunna de consommer du gingembre"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  epaules: `Tu es VitaScann Coach Gym IA spécialiste ÉPAULES. L'utilisateur vient de terminer son entraînement épaules. Analyse ses performances et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"epaules","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":1,"raison":"string"}],"conseil_technique":{"exercice_principal":"Overhead Press","erreur_commune":"Pousser en arc de cercle — pousse verticalement, barre proche du visage","cue":"Les deltoïdes progressent lentement — la constance est plus importante que la charge"},"prevention_blessure":{"zone_risque":"Coiffe des rotateurs","exercice_preventif":"Face pulls 3×15 chaque séance push","importance":"Les épaules = articulation la plus fragile du corps — 80% des blessures gym"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+1kg|+2.5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Collagène + vitamine C post-séance — renforce les tendons","aliment_cle":"Graines de chia ou curcuma — anti-inflammatoire naturel","timing":"Collagène 30min avant l'entraînement = absorption maximale"},"tibb":{"conseil":"Le curcuma mentionné dans la médecine traditionnelle islamique réduit l'inflammation des tendons"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  triceps: `Tu es VitaScann Coach Gym IA spécialiste TRICEPS. L'utilisateur vient de terminer son entraînement triceps. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"triceps","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":2.5,"raison":"string"}],"conseil_technique":{"exercice_principal":"Pushdown câble","erreur_commune":"Coudes qui se soulèvent — garde-les collés aux flancs tout au long du mouvement","cue":"Les triceps = 2/3 de la masse du bras — priorise-les pour les gros bras"},"conseil_avance":{"technique_intensification":"Drop set sur la dernière série de pushdown — réduis de 20% et continue jusqu'à l'échec","frequence":"2x/semaine max — les triceps récupèrent en 48h"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+2.5kg|+5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Shake de whey immédiatement après — fenêtre de synthèse protéique ouverte","aliment_cle":"Yaourt grec + miel — combo protéines rapides et glucides simples","tibb":"Le miel est mentionné dans le Coran comme remède (شِفَاءٌ لِلنَّاسِ) — idéal en post-entraînement"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  biceps: `Tu es VitaScann Coach Gym IA spécialiste BICEPS. L'utilisateur vient de terminer son entraînement biceps. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"biceps","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":1.25,"raison":"string"}],"conseil_technique":{"exercice_principal":"Curl barre","erreur_commune":"Utiliser le balancement du dos — isole le biceps en gardant les coudes fixes comme des pivots","cue":"Supine complète en haut du mouvement — tourne le poignet vers l'extérieur pour le pic de contraction"},"conseil_avance":{"technique_intensification":"21s : 7 reps bas, 7 reps haut, 7 reps full — brûlure maximale","secret":"Le curl Zottman pour développer le brachial — souvent négligé mais clé pour les gros bras"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+1.25kg|+2.5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Les petits muscles récupèrent vite — mange dans les 30min","aliment_cle":"Fromage cottage ou œufs — protéines lentes pour la nuit","tibb":"Les dattes sont une source d'énergie rapide pré-entraînement — Sunna du Prophète ﷺ"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  jambes: `Tu es VitaScann Coach Gym IA spécialiste JAMBES. L'utilisateur vient de terminer sa séance jambes. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"jambes","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","valeur_kg":5,"raison":"string"}],"conseil_technique":{"exercice_principal":"Squat barre","erreur_commune":"Genoux qui rentrent vers l'intérieur — pousse activement les genoux vers l'extérieur des orteils","cue":"'Casse le parallèle' — descends jusqu'à ce que les hanches soient sous les genoux pour maximiser les quadriceps"},"conseil_recuperation":{"importance":"Les jambes = 70% de la masse musculaire totale — la récup dure 72h","methode":"Marche légère le lendemain — meilleure récupération active que le repos complet","etirement":"10min de pigeon pose et deep squat hold après la séance — mobilité essentielle"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+5kg|+10kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Les jambes nécessitent 50-60g de protéines post-séance — ne lésine pas","glucides":"Riz basmati ou patate douce — glucides complexes pour reconstituer le glycogène","tibb":"Le Prophète ﷺ marchait de longues distances quotidiennement — les jambes fortes sont Sunna"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,

  abdos: `Tu es VitaScann Coach Gym IA spécialiste ABDOMINAUX. L'utilisateur vient de terminer son entraînement abdos. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"groupe":"abdos","analyse":{"points_forts":["string"],"points_ameliorer":["string"]},"ajustements":[{"exercice":"string","action":"augmenter|maintenir|reduire","raison":"string"}],"conseil_technique":{"exercice_principal":"Crunch câble","erreur_commune":"Tirer avec le cou — contracte le ventre en imaginant que tu 'écrases' ta cage thoracique vers le bassin","cue":"Les abdos se voient dans la cuisine — 80% nutrition, 20% entraînement"},"verite_abdos":{"mythe":"Les abdos se font avec des crunchs","realite":"La visibilité des abdos dépend du % de graisse corporelle — entre 10-12% pour les hommes, 18-20% pour les femmes","conseil":"Déficit calorique de 300-500 cal/jour = résultats visibles en 8-12 semaines"},"progression_semaine_prochaine":{"volume_sets":"maintenir|+1 serie","charge":"maintenir|+2.5kg","intensite":"stable|augmenter"},"conseil_nutrition":{"proteines":"Protéines hautes = préservation musculaire pendant la sèche","aliment_key":"Évite le sucre raffiné — principal responsable de la graisse abdominale","tibb":"Le jeûne intermittent (16h/8h) correspond au style alimentaire prophétique — optimise la lipolyse abdominale"},"prochaine_seance":{"focus":"string","exercice_prioritaire":"string","objectif_seance":"string"}}`,
};

// Fonction utilitaire pour appeler le prompt IA gym
async function callGymAI(muscle, seanceData) {
  const prompt = GYM_AI_PROMPTS[muscle] || GYM_AI_PROMPTS.chest;
  const contextMsg = seanceData ?
    `\n\nDonnées de la séance :\n${JSON.stringify(seanceData, null, 2)}\n\nBasé sur ces performances réelles, donne des conseils personnalisés.` : "";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key": process.env.REACT_APP_ANTHROPIC_KEY || "","anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:"claude-opus-4-5",max_tokens:2000,messages:[{role:"user",content:prompt+contextMsg}]})
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ─── FITNESS ZONES ───
const FITNESS_ZONES = [
  {id:"corps_complet", icon:"🧍", label:"Corps complet", hint:"Vue frontale complète, bonne lumière", color:"#00ff88"},
  {id:"haut_corps",    icon:"💪", label:"Haut du corps",  hint:"Torse visible, bras levés optionnel", color:"#38bdf8"},
  {id:"chest",         icon:"🖐️", label:"Chest / Pecs",   hint:"Vue frontale torse nu", color:"#f97316"},
  {id:"biceps",        icon:"💪", label:"Biceps / Bras",   hint:"Bras fléchi, bien éclairé", color:"#c084fc"},
  {id:"epaules",       icon:"🏋️", label:"Épaules",         hint:"Vue frontale ou dos, torse visible", color:"#f472b6"},
  {id:"dos",           icon:"🔙", label:"Dos / Trapèzes",  hint:"Vue dos, lumière directe", color:"#fbbf24"},
  {id:"abdos",         icon:"🔥", label:"Abdominaux",       hint:"Zone abdominale, torse nu", color:"#e2b84a"},
  {id:"jambes",        icon:"🦵", label:"Jambes / Cuisses", hint:"Jambes visibles, short recommandé", color:"#a3e635"},
  {id:"posture",       icon:"🧍", label:"Posture complète", hint:"Debout de profil, corps entier visible", color:"#fb923c"},
];

// ─── PHASE 1 : VITACOINS WALLET ───
function VitaCoinsWallet({user, vitaCoins, coinsHistory, onRedeem, t, lang, onClose}) {
  const L = lang === "en";
  const [tab, setTab] = useState("wallet"); // wallet | redeem | boutique | how
  const [redeeming, setRedeeming] = useState(null);
  const [msg, setMsg] = useState("");

  // ─── Récompenses réalistes ───
  const REWARDS = [
    {
      coins:100, icon:"⭐", type:"week",
      label:L?"7 days Premium free":"7 jours Premium offerts",
      desc:L?"Unlocks all premium modules for 7 days":"Débloque tous les modules premium pendant 7 jours",
      action:"premium_week", cta:L?"Activate":"Activer"
    },
    {
      coins:300, icon:"👑", type:"month",
      label:L?"1 month Premium free":"1 mois Premium offert",
      desc:L?"Full access for 30 days":"Accès complet pendant 30 jours",
      action:"premium_month", cta:L?"Activate":"Activer"
    },
    {
      coins:500, icon:"🌿", type:"iherb",
      label:L?"iHerb — 10% promo code":"iHerb — Code promo 10%",
      desc:L?"Supplements · Nigella · Vitamin D · Zinc":"Suppléments · Nigelle · Vit D · Zinc",
      action:"link", url:"https://www.iherb.com/?rcode=VITASCANN",
      cta:L?"Get code":"Obtenir le code"
    },
    {
      coins:500, icon:"💪", type:"myprotein",
      label:L?"MyProtein — 15% off":"MyProtein — 15% de réduction",
      desc:L?"Halal protein · Creatine · BCAA":"Protéine halal · Créatine · BCAA",
      action:"link", url:"https://www.myprotein.com/referral.list?applyCode=VITASCANN",
      cta:L?"Get code":"Obtenir le code"
    },
    {
      coins:1000, icon:"🎁", type:"premium3",
      label:L?"3 months Premium":"3 mois Premium",
      desc:L?"Our biggest reward — you earned it!":"Notre plus grande récompense — tu l'as mérité !",
      action:"premium_3months", cta:L?"Activate":"Activer"
    },
  ];

  // ─── Boutique santé (liens affiliés) ───
  const BOUTIQUE = [
    {
      emoji:"🌿", name:"iHerb",
      desc:L?"Natural supplements · Nigella · Sidr honey · Vitamin D · Zinc · Omega-3":"Suppléments naturels · Nigelle · Miel de sidr · Vit D · Zinc · Oméga-3",
      tag:L?"Tibb an-Nabawi":"Tibb an-Nabawi",
      tagColor:"#00ff88",
      url:"https://www.iherb.com/?rcode=VITASCANN",
      promo:L?"-5% with code VITASCANN":"-5% avec le code VITASCANN"
    },
    {
      emoji:"🍃", name:"Shop Santé",
      desc:L?"Québec supplements · KETO · Vegan · Natural products · 200+ products":"Suppléments québécois · KETO · Vegan · Produits naturels · 200+ produits",
      tag:L?"Made in Québec":"Fait au Québec",
      tagColor:"#22c55e",
      url:"https://shopsante.ca",
      promo:L?"Free delivery over 75$":"Livraison gratuite 75$+"
    },
    {
      emoji:"🍵", name:"Amazon.ca",
      desc:L?"Sidr honey · Black seed oil · Dates · Islamic health products":"Miel de sidr · Huile de nigelle · Dattes · Produits santé islamique",
      tag:"Amazon.ca",
      tagColor:"#f97316",
      url:"https://www.amazon.ca/s?k=tibb+nabawi+supplements&tag=vitascann-20",
      promo:L?"Free delivery Prime":"Livraison gratuite Prime"
    },
    {
      emoji:"🧪", name:"Thrive Market",
      desc:L?"Organic · Clean · Non-GMO supplements":"Suppléments bio · Clean · Non-OGM",
      tag:L?"Organic":"Bio",
      tagColor:"#22c55e",
      url:"https://thrivemarket.com/",
      promo:L?"30 days free trial":"30 jours d'essai gratuit"
    },
  ];

  const handleRedeem = async (reward) => {
    if(vitaCoins < reward.coins){ setMsg(t("coins_not_enough")); setTimeout(()=>setMsg(""),2500); return; }
    if(reward.action === "link") {
      // Ouvrir le lien affilié directement
      window.open(reward.url, "_blank");
      setMsg(L?"Link opened! Your code has been applied.":"Lien ouvert ! Ton code a été appliqué.");
      setTimeout(()=>setMsg(""),3000);
      return;
    }
    setRedeeming(reward.type);
    const ok = await CoinsService.spend(user.uid, reward.coins);
    if(ok){
      setMsg(L?"✅ Reward activated! Check your email within 48h.":"✅ Récompense activée ! Vérifie ton email dans 48h.");
      onRedeem(reward);
    }
    setRedeeming(null);
    setTimeout(()=>setMsg(""),4000);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#0c1810",borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 40px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,color:GOLD}}>🪙 VitaCoins</div>
            <div style={{color:MUT,fontSize:12,marginTop:2}}>{t("coins_balance")}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:40,fontWeight:900,color:GOLD,lineHeight:1}}>{vitaCoins}</div>
            <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12,marginTop:4}}>✕ {L?"Close":"Fermer"}</button>
          </div>
        </div>

        {msg&&<div style={{background:`${EM}14`,border:`1px solid ${EM}33`,borderRadius:12,padding:"10px 14px",color:EM,fontSize:12,marginBottom:14,textAlign:"center"}}>{msg}</div>}

        {/* Tabs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:20}}>
          {[
            ["wallet",  L?"💰 Balance":"💰 Solde"],
            ["redeem",  L?"🎁 Rewards":"🎁 Échanger"],
            ["boutique",L?"🛒 Shop":"🛒 Boutique"],
            ["how",     L?"❓ How":"❓ Comment"],
          ].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{background:tab===k?`${GOLD}18`:"transparent",border:`1.5px solid ${tab===k?GOLD:BDR}`,borderRadius:10,padding:"8px 4px",fontFamily:"'Outfit',sans-serif",fontSize:10,fontWeight:700,color:tab===k?GOLD:MUT,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>

        {/* ── TAB SOLDE ── */}
        {tab==="wallet"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,#1a1005,#0f0d06)",border:`1.5px solid ${GOLD}44`,borderRadius:20,padding:24,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:52}}>🪙</div>
              <div style={{fontSize:56,fontWeight:900,color:GOLD,lineHeight:1,marginTop:8}}>{vitaCoins}</div>
              <div style={{color:MUT,fontSize:12,marginTop:6}}>VitaCoins {L?"available":"disponibles"}</div>
              <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:"#38bdf8"}}>{Math.floor(vitaCoins/100)}</div>
                  <div style={{fontSize:10,color:MUT}}>{L?"weeks Premium":"sem. Premium"}</div>
                </div>
                <div style={{width:1,background:BDR}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{Math.floor(vitaCoins/300)}</div>
                  <div style={{fontSize:10,color:MUT}}>{L?"months Premium":"mois Premium"}</div>
                </div>
              </div>
            </div>
            {coinsHistory?.length>0&&(
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:"#edf5ef"}}>{t("coins_history")}</div>
                {coinsHistory.slice(0,8).map((h,i)=>{
                  const displayReason = h.reason?.replace(/Coach Boxe/gi,"Coach Fitness")?.replace(/Boxing Coach/gi,"Fitness Coach") || h.reason;
                  return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<Math.min(7,coinsHistory.length-1)?`1px solid ${BDR}`:"none"}}>
                      <div style={{fontSize:12,color:"#a0bcaa"}}>{displayReason}</div>
                      <div style={{color:GOLD,fontWeight:700,fontSize:13}}>+{h.amount} 🪙</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB RÉCOMPENSES ── */}
        {tab==="redeem"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:11,color:MUT,marginBottom:4,lineHeight:1.6}}>
              {L?"Premium rewards are activated within 48h by email. Shop links are affiliate links — they help support VitaScann 🙏":"Les récompenses Premium sont activées dans 48h par email. Les liens boutique sont des liens affiliés — ils aident à soutenir VitaScann 🙏"}
            </div>
            {REWARDS.map(r=>{
              const canAfford = vitaCoins >= r.coins;
              return (
                <div key={r.type} style={{background:canAfford?`${GOLD}08`:CARD,border:`1.5px solid ${canAfford?GOLD+"44":BDR}`,borderRadius:18,padding:16,opacity:canAfford?1:.55}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                    <div style={{fontSize:32,flexShrink:0}}>{r.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color:"#edf5ef"}}>{r.label}</div>
                      <div style={{fontSize:11,color:MUT,marginTop:2,lineHeight:1.4}}>{r.desc}</div>
                      <div style={{color:GOLD,fontSize:12,fontWeight:700,marginTop:6}}>{r.coins} 🪙 {t("coins_req")}</div>
                    </div>
                  </div>
                  <button onClick={()=>handleRedeem(r)} disabled={redeeming===r.type||!canAfford}
                    style={{width:"100%",background:canAfford?`linear-gradient(135deg,${GOLD},#c49a2e)`:"#1a2a1e",color:canAfford?"#060400":MUT,border:"none",borderRadius:12,padding:"10px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,cursor:canAfford?"pointer":"not-allowed"}}>
                    {redeeming===r.type?"...":`${r.cta} — ${r.coins} 🪙`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB BOUTIQUE SANTÉ ── */}
        {tab==="boutique"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,#051a0a,#082010)",border:`1px solid ${EM}22`,borderRadius:16,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,color:EM,lineHeight:1.6}}>
                🌿 {L
                  ?"Our product recommendations for your health. These are affiliate links — every purchase helps support VitaScann at no extra cost to you."
                  :"Nos recommandations produits pour ta santé. Ce sont des liens affiliés — chaque achat aide à soutenir VitaScann sans coût supplémentaire pour toi."}
              </div>
            </div>
            {BOUTIQUE.map((b,i)=>(
              <div key={i} style={{background:CARD,border:`1.5px solid ${b.tagColor}33`,borderRadius:20,padding:18,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                  <div style={{fontSize:36,flexShrink:0}}>{b.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <div style={{fontWeight:800,fontSize:15,color:"#edf5ef"}}>{b.name}</div>
                      <div style={{fontSize:9,background:`${b.tagColor}20`,color:b.tagColor,borderRadius:10,padding:"2px 8px",fontWeight:700}}>{b.tag}</div>
                    </div>
                    <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>{b.desc}</div>
                    <div style={{fontSize:11,color:b.tagColor,fontWeight:700,marginTop:6}}>🎁 {b.promo}</div>
                  </div>
                </div>
                <button onClick={()=>window.open(b.url,"_blank")}
                  style={{width:"100%",background:`${b.tagColor}15`,border:`1.5px solid ${b.tagColor}55`,borderRadius:14,padding:"12px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:b.tagColor,cursor:"pointer"}}>
                  {L?"🛒 Visit the shop":"🛒 Visiter la boutique"} →
                </button>
              </div>
            ))}
            <div style={{textAlign:"center",padding:"8px 0",color:MUT,fontSize:10,lineHeight:1.5}}>
              {L?"* Affiliate links. VitaScann earns a small commission on purchases.":"* Liens affiliés. VitaScann reçoit une petite commission sur les achats."}
            </div>
          </div>
        )}

        {/* ── TAB COMMENT GAGNER ── */}
        {tab==="how"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:.8,marginBottom:6}}>
              ⚡ {L?"HOW TO EARN VITACOINS":"COMMENT GAGNER DES VITACOINS"}
            </div>
            {[
              {ic:"🔬",text:L?"1 body or meal scan":"1 scan corporel ou repas",coins:10},
              {ic:"🔥",text:L?"7-day scan streak":"7 jours de scan consécutifs",coins:50},
              {ic:"👟",text:L?"3000+ steps in a day":"3000+ pas dans la journée",coins:5},
              {ic:"⚔️",text:L?"Solo Leveling daily workout":"Entraînement Solo Leveling",coins:75},
              {ic:"🔮",text:L?"Scanner Futur or Dopamine Score":"Scanner Futur ou Score Dopamine",coins:15},
              {ic:"👥",text:L?"Refer a friend":"Parrainer un ami",coins:200},
              {ic:"🏆",text:L?"Complete the 30-day challenge":"Terminer le défi 30 jours",coins:500},
            ].map((item,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:22,flexShrink:0}}>{item.ic}</div>
                <div style={{flex:1,fontSize:12,color:"#a0bcaa"}}>{item.text}</div>
                <div style={{color:GOLD,fontWeight:700,fontSize:13,flexShrink:0}}>+{item.coins} 🪙</div>
              </div>
            ))}
            <div style={{background:"linear-gradient(135deg,#0a1505,#0d1a08)",border:`1px solid ${EM}22`,borderRadius:16,padding:14,marginTop:6,textAlign:"center"}}>
              <div style={{fontSize:12,color:"#b8d4bc",fontStyle:"italic",lineHeight:1.7}}>
                {L
                  ?'"Whoever saves, never goes without." — Arab proverb 🌿'
                  :'"Celui qui économise ne manque jamais." — Proverbe arabe 🌿'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHASE 2 : PODOMÈTRE ───
function Pedometer({totalScans, vitaCoins, user, onCoinsEarned, t, lang, onBack}) {
  const L = lang === "en";
  const UNLOCK_THRESHOLD = 15;
  const isLocked = totalScans < UNLOCK_THRESHOLD;

  // ─── State — alimenté par GlobalPedometer ───
  const [data, setData]           = useState(() => GlobalPedometer.getState());
  const [isActive, setIsActive]   = useState(() => GlobalPedometer.getRunning());
  const [permission, setPermission] = useState("unknown");
  const [objectifPas, setObjectifPas] = useState(() => parseInt(localStorage.getItem("vs_pas_goal") || "8000"));
  const [pasHistory, setPasHistory]   = useState(() => GlobalPedometer.getHistory());

  const pas      = data.pas    || 0;
  const kmTotal  = data.km     || 0;
  const calTotal = data.cal    || 0;

  // S'abonner aux mises à jour du GlobalPedometer
  useEffect(() => {
    const unsub = GlobalPedometer.subscribe((newData) => {
      setData(newData);
    });
    // Rafraîchir l'état au montage
    setData(GlobalPedometer.getState());
    setIsActive(GlobalPedometer.getRunning());
    setPasHistory(GlobalPedometer.getHistory());
    return unsub;
  }, []);

  const startPedometer = async () => {
    if (typeof DeviceMotionEvent === "undefined") { setPermission("unsupported"); return; }
    const ok = await GlobalPedometer.start(false);
    if (!ok) { setPermission("denied"); return; }
    setPermission("granted");
    setIsActive(true);
  };

  const stopPedometer = () => {
    GlobalPedometer.stop();
    setIsActive(false);
    setPasHistory(GlobalPedometer.getHistory());
    if (pas >= 3000 && user?.uid && !user?.isDemo && onCoinsEarned) {
      onCoinsEarned(Math.floor(pas / 1000) * 2);
    }
  };

  const resetPas = () => {
    GlobalPedometer.reset();
    setData({ pas:0, km:0, cal:0 });
  };

  const objectifPct = Math.min(100, Math.round((pas / objectifPas) * 100));
  const pctPas   = objectifPct;
  const pasColor = pas >= objectifPas ? EM : pas >= objectifPas * 0.5 ? GOLD : WARN;
  const pasHistory7 = pasHistory.slice(0, 7);

  return (
    <div style={{minHeight:"100vh",paddingBottom:90,overflowY:"auto",background:"#060d08"}}>

      {/* Header */}
      <div style={{padding:"52px 20px 24px",background:`radial-gradient(ellipse at 50% 0%,${EM}10 0%,#060d08 65%)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16}}>← {L?"Back":"Retour"}</button>
        <div className="serif" style={{fontSize:26,fontWeight:700,marginBottom:4}}>👟 {L?"Step Counter":"Compteur de Pas"}</div>
        <div style={{color:MUT,fontSize:13,marginBottom:20}}>{L?"Walk with your phone in your pocket or hand":"Marche avec ton téléphone en poche ou à la main"}</div>

        {/* Cercle de progression */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{position:"relative",width:200,height:200,margin:"0 auto 16px"}}>
            <svg width="200" height="200" style={{transform:"rotate(-90deg)"}}>
              <circle cx="100" cy="100" r="88" fill="none" stroke={`${pasColor}22`} strokeWidth="12"/>
              <circle cx="100" cy="100" r="88" fill="none" stroke={pasColor} strokeWidth="12"
                strokeDasharray={`${2*Math.PI*88}`}
                strokeDashoffset={`${2*Math.PI*88*(1-pctPas/100)}`}
                strokeLinecap="round" style={{transition:"stroke-dashoffset .8s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontWeight:700,fontSize:42,color:pasColor,lineHeight:1}}>{pas.toLocaleString()}</div>
              <div style={{fontSize:12,color:MUT,marginTop:4}}>{L?"steps":"pas"}</div>
              <div style={{fontSize:11,color:pasColor,marginTop:3,fontWeight:600}}>{pctPas}% {L?"of goal":"de l'objectif"}</div>
              {isActive&&<div style={{marginTop:8,display:"flex",gap:4,alignItems:"center"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite"}}/>
                <span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>LIVE</span>
              </div>}
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {val:`${kmTotal} km`,  label:L?"Distance":"Distance",  color:"#60a5fa"},
              {val:`${calTotal}`,    label:L?"kcal":"kcal",          color:"#f97316"},
              {val:`${objectifPas.toLocaleString()}`, label:L?"Goal":"Objectif", color:pasColor},
            ].map(({val,label,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:15,color}}>{val}</div>
                <div style={{fontSize:9,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"0 18px"}}>

        {/* Messages permission */}
        {permission==="unsupported"&&(
          <div style={{background:"#1a0a00",border:"1px solid #f9731633",borderRadius:14,padding:14,marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:6}}>📵</div>
            <div style={{color:"#f97316",fontSize:13,fontWeight:700,marginBottom:4}}>{L?"Sensor not available":"Capteur non disponible"}</div>
            <div style={{color:MUT,fontSize:12}}>{L?"Use a mobile device.":"Utilise un appareil mobile."}</div>
          </div>
        )}
        {permission==="denied"&&(
          <div style={{background:"#1a0505",border:"1px solid #ef444433",borderRadius:14,padding:14,marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:6}}>🔒</div>
            <div style={{color:"#ef4444",fontSize:13,fontWeight:700,marginBottom:4}}>{L?"Permission denied":"Permission refusée"}</div>
            <div style={{color:MUT,fontSize:12}}>{L?"Allow motion sensor in browser settings.":"Autorise le capteur de mouvement dans les paramètres."}</div>
          </div>
        )}

        {/* Bouton start/stop */}
        <button onClick={isActive?stopPedometer:startPedometer}
          style={{width:"100%",background:isActive?"#1a0505":`linear-gradient(135deg,#1a3300,#264d00)`,border:`1.5px solid ${isActive?"#ef4444":EM}`,borderRadius:16,padding:"18px",fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:isActive?"#ef4444":EM,cursor:"pointer",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {isActive
            ?<>⏹ {L?"Stop counting":"Arrêter le comptage"}</>
            :<>▶ {L?"Start step counter":"Démarrer le compteur"}</>}
        </button>
        {isActive&&(
          <div style={{fontSize:11,color:EM,marginBottom:10,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:EM,animation:"pulse 1.5s ease-in-out infinite"}}/>
            {L?"Auto-started — counting your steps all day":"Démarré automatiquement — compte tes pas toute la journée"}
          </div>
        )}

        {pas>0&&!isActive&&(
          <button onClick={resetPas}
            style={{width:"100%",background:"none",border:`1px solid ${BDR}`,borderRadius:12,padding:"10px",fontFamily:"'Outfit',sans-serif",fontSize:12,color:MUT,cursor:"pointer",marginBottom:16}}>
            🔄 {L?"Reset today":"Remettre à zéro"}
          </button>
        )}

        {/* Objectif quotidien */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>{L?"DAILY GOAL":"OBJECTIF QUOTIDIEN"}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[5000,7500,8000,10000,12000,15000].map(g=>(
              <button key={g} onClick={()=>{setObjectifPas(g);localStorage.setItem("vs_pas_goal",g.toString());}}
                style={{padding:"6px 12px",borderRadius:20,background:objectifPas===g?`${EM}20`:"#0a140c",border:`1.5px solid ${objectifPas===g?EM:BDR}`,color:objectifPas===g?EM:MUT,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {g.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Conseils utilisation */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>💡 {L?"TIPS FOR ACCURACY":"TIPS POUR LA PRÉCISION"}</div>
          {[
            L?"Hold your phone naturally while walking":"Tiens ton téléphone naturellement en marchant",
            L?"Pocket or hand both work well":"En poche ou à la main, les deux fonctionnent",
            L?"Works best at normal walking pace":"Fonctionne mieux à allure normale de marche",
          ].map((tip,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<2?8:0}}>
              <span style={{color:EM,fontSize:12,flexShrink:0}}>→</span>
              <span style={{fontSize:12,color:"#a0c8a8",lineHeight:1.5}}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Historique 14 jours */}
        {pasHistory.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:12}}>{L?"14-DAY HISTORY":"HISTORIQUE 14 JOURS"}</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:64}}>
              {pasHistory.slice(0,14).reverse().map(([date,data],i)=>{
                const h=Math.min(100,Math.round((data.pas/objectifPas)*100));
                const c=h>=100?EM:h>=60?"#4ade80":h>=30?GOLD:MUT;
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:"100%",height:`${Math.max(4,h*.64)}px`,background:c,borderRadius:"3px 3px 0 0",opacity:.9}}/>
                    <div style={{fontSize:7,color:MUT}}>{date.slice(8)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tibb */}
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
          <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>
            {L
              ? "The Prophet ﷺ walked regularly. Walking after meals aids digestion and stabilizes blood sugar — confirmed by modern science."
              : "Le Prophète ﷺ marchait régulièrement. La marche après les repas facilite la digestion et stabilise la glycémie — confirmé par la science moderne."}
          </div>
        </div>

      </div>
    </div>
  );
}


// ─── PHASE 3 : EXERCICES ───
function Exercises({zone, totalScans, user, onCoinsEarned, t, lang, onBack}) {
  const [done, setDone] = useState(()=>JSON.parse(localStorage.getItem("vs_ex_done")||"[]"));
  const [msg, setMsg] = useState("");
  const locked = totalScans < 15;
  const exList = EXERCISES_BY_ZONE[zone?.id] || EXERCISES_BY_ZONE["belly"];

  const complete = async (ex) => {
    if(done.includes(ex.id)) return;
    const nd = [...done, ex.id];
    setDone(nd);
    localStorage.setItem("vs_ex_done", JSON.stringify(nd));
    if(user?.uid&&!user?.isDemo){ await CoinsService.add(user.uid, ex.coins, `Exercice: ${ex.name}`); onCoinsEarned?.(ex.coins); }
    setMsg(`${t("ex_complete")} ${t("ex_coins")}`);
    setTimeout(()=>setMsg(""),3000);
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 80px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("ex_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:20}}>{zone?.icon} {zone?.label} · {t("ex_sub")}</div>

      {msg&&<div style={{background:`${EM}14`,border:`1px solid ${EM}33`,borderRadius:10,padding:"10px 14px",color:EM,fontSize:12,marginBottom:14,textAlign:"center"}}>{msg}</div>}

      {locked?(
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:20,padding:32,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>{t("ex_locked")}</div>
          <div style={{color:MUT,fontSize:13}}>{t("steps_unlock_msg")} {Math.max(0,15-totalScans)} {t("steps_unlock_msg2")}</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {exList.map(ex=>{
            const isDone = done.includes(ex.id);
            return (
              <div key={ex.id} style={{background:isDone?`${EM}08`:CARD,border:`1px solid ${isDone?EM+"33":BDR}`,borderRadius:18,padding:18,transition:"all .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontSize:32}}>{ex.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{ex.name}</div>
                    <div style={{color:MUT,fontSize:11}}>{ex.duration} {t("ex_mins")} · <span style={{color:GOLD}}>+{ex.coins} 🪙</span></div>
                  </div>
                  {isDone&&<span style={{color:EM,fontSize:18}}>✅</span>}
                </div>
                <div style={{fontSize:12,color:"#a0bcaa",lineHeight:1.6,marginBottom:12}}>{ex.desc}</div>
                <button onClick={()=>complete(ex)} disabled={isDone}
                  style={{width:"100%",background:isDone?`${EM}10`:`linear-gradient(135deg,${EM},#00cc66)`,color:isDone?EM:"#020a04",border:isDone?`1px solid ${EM}33`:"none",borderRadius:10,padding:"12px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,cursor:isDone?"default":"pointer"}}>
                  {isDone?t("ex_done"):t("ex_start")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PHASE 4 : PARRAINAGE ───
function Referral({user, vitaCoins, t, lang, onBack}) {
  const [copied, setCopied] = useState(false);
  const [refCount, setRefCount] = useState(0);
  const refLink = `https://vitascann.vercel.app?ref=${user?.uid?.slice(0,8)||"xxx"}`;

  useEffect(()=>{
    if(user?.uid&&!user?.isDemo) CoinsService.getReferralCount(user.uid).then(setRefCount);
  },[user]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(refLink).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };

  const shareLink = async () => {
    if(navigator.share){ await navigator.share({title:"VitaScann",text:lang==="fr"?"Essaie VitaScann — l'IA qui détecte tes carences en 30s ! 🔬":"Try VitaScann — AI that detects your deficiencies in 30s! 🔬",url:refLink}).catch(()=>{}); }
    else copyLink();
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 80px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("ref_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>{t("ref_sub")}</div>

      <div style={{background:"linear-gradient(135deg,#0a1a0c,#121008)",border:`1px solid ${EM}33`,borderRadius:20,padding:24,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:8}}>👥</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{background:`${EM}10`,borderRadius:12,padding:14}}>
            <div className="serif" style={{fontSize:32,fontWeight:700,color:EM}}>{refCount}</div>
            <div style={{color:MUT,fontSize:11}}>{t("ref_count")}</div>
          </div>
          <div style={{background:`${GOLD}10`,borderRadius:12,padding:14}}>
            <div className="serif" style={{fontSize:32,fontWeight:700,color:GOLD}}>{refCount*200}</div>
            <div style={{color:MUT,fontSize:11}}>🪙 {t("ref_earned")}</div>
          </div>
        </div>
      </div>

      <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{fontSize:11,color:MUT,marginBottom:6}}>{t("ref_your_link")}</div>
        <div style={{background:"#0a0f0a",borderRadius:10,padding:"10px 12px",fontSize:12,color:EM,wordBreak:"break-all",marginBottom:12,fontFamily:"monospace"}}>{refLink}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={copyLink} style={{flex:1,background:copied?`${EM}14`:"#0a140c",border:`1px solid ${copied?EM:BDR}`,borderRadius:10,padding:"12px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,color:copied?EM:MUT,cursor:"pointer"}}>
            {copied?t("ref_copied"):t("ref_copy")}
          </button>
          <button onClick={shareLink} style={{flex:1,background:`linear-gradient(135deg,${EM},#00cc66)`,color:"#020a04",border:"none",borderRadius:10,padding:"12px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {t("ref_share")}
          </button>
        </div>
      </div>

      <div style={{background:CARD,border:`1px solid ${GOLD}28`,borderRadius:16,padding:16}}>
        <div style={{fontWeight:700,fontSize:13,color:GOLD,marginBottom:12}}>{t("ref_bonus")}</div>
        {[t("ref_how1"),t("ref_how2")].map((txt,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:i===0?10:0,fontSize:13,color:"#a0bcaa"}}>
            <span>{i===0?"👤":"🎁"}</span>{txt}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VITACOINS TOAST ───
function CoinsToast({amount, onDone}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ const t=setTimeout(onDone,2500); return()=>clearTimeout(t); },[]);
  return (
    <div style={{position:"fixed",top:70,right:16,zIndex:9998,background:"linear-gradient(135deg,#1a1005,#0f0d06)",border:`1.5px solid ${GOLD}`,borderRadius:14,padding:"10px 16px",animation:"slideIn .3s ease",boxShadow:"0 4px 20px #00000066",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:22}}>🪙</span>
      <div>
        <div style={{color:GOLD,fontWeight:700,fontSize:14}}>+{amount} VitaCoins !</div>
        <div style={{color:MUT,fontSize:11}}>Ajoutés à ton wallet</div>
      </div>
    </div>
  );
}

// ─── PUSH NOTIFICATIONS ───
const NotifService = {
  isSupported: () => "Notification" in window && "serviceWorker" in navigator,
  requestPermission: async () => {
    if(!NotifService.isSupported()) return false;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  },
  scheduleLocalReminder: (userId) => {
    localStorage.setItem("vs_last_scan", Date.now().toString());
    localStorage.setItem("vs_user_id", userId || "");
  },
  checkAndNotify: () => {
    if(!("Notification" in window)) return;
    if(Notification.permission !== "granted") return;
    const last = parseInt(localStorage.getItem("vs_last_scan") || "0");
    if(!last) return;
    const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24);
    const lang = localStorage.getItem("vs_lang") || "fr";
    const alreadyKey = "vs_notif_" + Date.now().toString().slice(0,8);
    if(daysSince >= 3 && !localStorage.getItem(alreadyKey)) {
      const msgs = {
        fr: { title: "🌿 VitaScann t'attend !", body: "Tu n'as pas scanné depuis 3 jours. Ton corps a peut-être quelque chose à te dire. 🔬" },
        en: { title: "🌿 VitaScann misses you!", body: "You haven't scanned in 3 days. Your body might have something to tell you. 🔬" },
      };
      const m = msgs[lang] || msgs.fr;
      try {
        new Notification(m.title, { body: m.body, icon: "/logo.svg", tag: "vitascann-reminder", renotify: true });
        localStorage.setItem(alreadyKey, "1");
      } catch(e) {}
    }
  },
  init: () => {
    if(!("Notification" in window)) return;
    NotifService.checkAndNotify();
    setInterval(NotifService.checkAndNotify, 1000 * 60 * 60);
  },
};

function NotifBanner({lang, onDismiss}) {
  const [show, setShow] = useState(false);
  useEffect(()=>{
    const dismissed = localStorage.getItem("vs_notif_dismissed");
    const granted = "Notification" in window && Notification.permission === "granted";
    if("Notification" in window && !dismissed && !granted) {
      setTimeout(()=>setShow(true), 4000);
    }
  },[]);
  if(!show) return null;
  const handleAccept = async () => {
    const ok = await NotifService.requestPermission();
    if(ok) NotifService.init();
    setShow(false);
    localStorage.setItem("vs_notif_dismissed","1");
    onDismiss?.();
  };
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("vs_notif_dismissed","1");
  };
  return (
    <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,zIndex:888,background:"linear-gradient(135deg,#0f1a0a,#1a1005)",border:`1.5px solid ${EM}44`,borderRadius:18,padding:"16px 18px",boxShadow:"0 8px 40px #00000088",animation:"slideIn .4s ease"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{fontSize:32,flexShrink:0}}>🔔</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>
            {lang==="en"?"Stay on track":"Ne rate aucun rappel"}
          </div>
          <div style={{color:MUT,fontSize:12,lineHeight:1.6,marginBottom:12}}>
            {lang==="en"
              ?"Get notified if you haven't scanned in 3 days. 🌿"
              :"Reçois une notif si tu n'as pas scanné depuis 3 jours. 🌿"}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleAccept} style={{flex:1,background:EM,color:"#020a04",border:"none",borderRadius:10,padding:"10px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {lang==="en"?"Activate 🔔":"Activer 🔔"}
            </button>
            <button onClick={handleDismiss} style={{background:"transparent",color:MUT,border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 14px",fontFamily:"'Outfit',sans-serif",fontSize:12,cursor:"pointer"}}>
              {lang==="en"?"Later":"Plus tard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
@keyframes progressFill{from{width:0}to{width:var(--w)}}
@keyframes punchFlash{0%{opacity:1;transform:scale(1)}30%{opacity:0.3;transform:scale(0.92)}60%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
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

const EM="#00ff88",GOLD="#e2b84a",MUT="#4a6e52",DANGER="#ff5555",WARN="#ffaa33",VIKING="#8b5cf6";
const CARD="#0c1810",BDR="#192c1d";

// ─── ISLAMIC / GRANDMA TIPS ───
const ISLAMIC_TIPS = {
  nails: {
    islamic: [
      "Le Prophète ﷺ a recommandé le henné (Lawsonia) pour renforcer les ongles et les protéger.",
      "Frotter les ongles avec de l'huile de nigelle (Habatus Sawda) nourrit et renforce naturellement.",
      "Le miel de Sidr appliqué sur les cuticules favorise la croissance selon la médecine traditionnelle.",
    ],
    grandma: [
      "Tremper les ongles 10min dans de l'huile d'olive tiède + quelques gouttes de citron chaque soir.",
      "Mélange ail écrasé + huile de coco : appliquer 15min, rincer. Renforce les ongles cassants.",
      "Frotter les ongles avec l'intérieur d'une peau de banane — les tanins nourrissent la kératine.",
    ],
  },
  eyes: {
    islamic: [
      "Le Prophète ﷺ utilisait le kohol (antimoine) pour les yeux et recommandait de l'appliquer la nuit.",
      "La nigelle (Habbatus Sawda) est citée dans les hadiths pour soigner de nombreux maux, dont les yeux fatigués.",
      "Les dattes consommées chaque matin apportent du fer et de la vitamine A bénéfiques pour la vision.",
    ],
    grandma: [
      "Compresses de camomille froide 10min sur les yeux fatigués — anti-inflammatoire naturel.",
      "Eau de rose pure (sans alcool) en collyre naturel pour soulager les yeux rouges.",
      "Massages doux avec huile d'amande douce autour des yeux pour décontracter et nourrir.",
    ],
  },
  skin: {
    islamic: [
      "Le Prophète ﷺ utilisait de l'huile d'olive sur sa peau et ses cheveux — mentionné dans plusieurs hadiths.",
      "Le miel est décrit dans le Coran (An-Nahl) comme guérison — excellent masque nourrissant pour la peau.",
      "L'eau de Zamzam bue régulièrement est associée à une peau lumineuse selon la tradition islamique.",
    ],
    grandma: [
      "Masque argile blanche + eau de rose + huile d'argan : 20min, 2x/semaine. Peau nette et lumineuse.",
      "Gommage sucre de canne + huile d'olive + quelques gouttes citron — exfoliation douce maison.",
      "Aloe vera frais appliqué directement sur la peau sèche : hydratation immédiate et durable.",
    ],
  },
  hair: {
    islamic: [
      "Le Prophète ﷺ oignait ses cheveux d'huile et les peignait régulièrement — sunnah du soin capillaire.",
      "L'huile de nigelle mélangée à l'huile d'olive, appliquée sur le cuir chevelu, est une pratique prophétique.",
      "Le henné (Lawsonia) est une sunnah pour teindre et renforcer les cheveux selon les hadiths.",
    ],
    grandma: [
      "Masque œuf entier + huile d'olive + miel : 30min sous bonnet chauffant. Brillance et force exceptionnelles.",
      "Eau de riz fermentée (rinçage final) : riche en inositol, répare la fibre capillaire abîmée.",
      "Huile de ricin chauffée + massage cuir chevelu 10min avant shampooing : stimule la pousse.",
    ],
  },
  tongue: {
    islamic: [
      "Le Prophète ﷺ recommandait le siwak (bâton d'arak) pour purifier la bouche et la langue chaque matin.",
      "La nigelle consommée avec du miel est bénéfique pour la digestion et l'hygiène buccale selon les hadiths.",
      "Rincer la bouche avec de l'eau salée est une pratique traditionnelle islamique pour l'hygiène orale.",
    ],
    grandma: [
      "Gratter doucement la langue chaque matin avec un gratte-langue en cuivre — élimine les bactéries.",
      "Gargarisme huile de coco 5-10min à jeun (oil pulling) — détoxifie et blanchit naturellement.",
      "Tisane gingembre + curcuma + miel le matin : anti-inflammatoire puissant pour toute la sphère ORL.",
    ],
  },
  feet: {
    islamic: [
      "Le Prophète ﷺ accordait une grande importance à la propreté des pieds lors des ablutions (wudhu).",
      "Masser les pieds avec de l'huile de nigelle est recommandé pour les douleurs et la fatigue.",
      "Le henné appliqué sur les pieds a des propriétés anti-fongiques reconnues dans la médecine traditionnelle.",
    ],
    grandma: [
      "Bain de pieds eau chaude + vinaigre de cidre + sel de mer : anti-fongique et adoucissant puissant.",
      "Pierre ponce + huile de coco + sucre : gommage talons fissurés, appliquer après bain chaud.",
      "Chaussettes coton imbibées d'huile d'olive la nuit : talons réparés en 1 semaine.",
    ],
  },
  belly: {
    islamic: [
      "Le Prophète ﷺ recommandait de manger en petites quantités — remplir un tiers de l'estomac seulement.",
      "Le gingembre est mentionné dans le Coran (Al-Insan) — excellent pour la digestion et réduire l'inflammation.",
      "Le jeûne (Sawm) pratiqué régulièrement est bénéfique pour le microbiome intestinal selon la science moderne.",
    ],
    grandma: [
      "Tisane menthe poivrée + fenouil + anis vert après repas : carminatif naturel contre les ballonnements.",
      "Massage ventre sens des aiguilles d'une montre avec huile de ricin tiède : stimule le transit.",
      "Eau chaude + citron + gingembre frais à jeun : détoxifie le foie et booste le métabolisme.",
    ],
  },
  scalp: {
    islamic: [
      "Le Prophète ﷺ prenait soin de son cuir chevelu avec de l'huile — pratique rapportée dans les hadiths.",
      "La nigelle appliquée sur le cuir chevelu est traditionnellement utilisée contre les pellicules et démangeaisons.",
      "Se couvrir la tête (port du taqiya/hijab) protège le cuir chevelu des agressions extérieures.",
    ],
    grandma: [
      "Mélange huile d'argan + quelques gouttes d'huile essentielle de tea tree : anti-pelliculaire naturel puissant.",
      "Jus d'oignon appliqué 30min sur le cuir chevelu : soufre organique stimule la repousse.",
      "Vinaigre de cidre dilué (1:3) en rinçage final : rééquilibre le pH et lutte contre les démangeaisons.",
    ],
  },
  body_fat: {
    islamic: [
      "Le Prophète ﷺ marchait régulièrement et encourageait l'activité physique — sunnah de l'exercice.",
      "Le jeûne d'Ashura et les jeûnes volontaires du lundi/jeudi aident à réguler le métabolisme.",
      "Manger en position assise et mastiquer lentement (sunnah) améliore la satiété et la digestion.",
    ],
    grandma: [
      "Thé vert + cannelle + gingembre le matin à jeun : booste le métabolisme naturellement.",
      "Eau chaude avec citron et poivre de Cayenne 20min avant repas : coupe-faim et brûle-graisses.",
      "Marcher 30min après le dîner : améliore la glycémie et favorise la combustion des graisses nocturnes.",
    ],
  },
  teeth: {
    islamic: [
      "Le Prophète ﷺ utilisait le siwak (miswak) jusqu'à 5 fois par jour — antibactérien naturel prouvé.",
      "Se rincer la bouche (madhmadhah) lors des ablutions est une sunnah qui maintient l'hygiène dentaire.",
      "Le miel de Sidr appliqué sur les gencives est un remède traditionnel islamique contre les inflammations.",
    ],
    grandma: [
      "Pâte bicarbonate + quelques gouttes d'huile essentielle de clou de girofle : blanchissant et analgésique.",
      "Rinçage eau salée tiède matin et soir : anti-inflammatoire et cicatrisant pour les gencives.",
      "Frotter les dents avec l'intérieur d'une écorce de citron 1x/semaine : détartre et blanchit naturellement.",
    ],
  },
  beard: {
    islamic: [
      "Le Prophète ﷺ a ordonné de laisser pousser la barbe et de lui faire honneur — symbol de virilité islamique.",
      "Oindre la barbe d'huile est une sunnah — le Prophète ﷺ utilisait de l'huile de myrte selon les hadiths.",
      "La nigelle mélangée à l'huile d'olive appliquée sur la barbe est un remède prophétique pour la croissance.",
    ],
    grandma: [
      "Huile de ricin + huile de jojoba (50/50) : massage 5min chaque soir — résultats visibles en 4-6 semaines.",
      "Cannelle en poudre + miel de Manuka : masque 20min, stimule la circulation sanguine du follicule.",
      "Eau de rose + gingembre frais mixé : lotion tonique matin après lavage — anti-chute et densifiant.",
    ],
  },
};

// ─── GAMIFICATION SYSTEM ───
const LEVELS = [
  {min:0,    max:99,   name:"Débutant",     nameEn:"Beginner",    icon:"🌱", color:"#4a6e52"},
  {min:100,  max:299,  name:"Curieux",      nameEn:"Curious",     icon:"🔍", color:"#38bdf8"},
  {min:300,  max:599,  name:"Explorateur",  nameEn:"Explorer",    icon:"🗺️", color:"#c084fc"},
  {min:600,  max:999,  name:"Expert Santé", nameEn:"Health Expert",icon:"⚡", color:"#f97316"},
  {min:1000, max:1999, name:"Maître",       nameEn:"Master",      icon:"🏆", color:"#e2b84a"},
  {min:2000, max:9999, name:"VitaScann Elite",nameEn:"VitaScann Elite",icon:"👑",color:"#00ff88"},
];

const MILESTONES = [
  {scans:1,  reward:"badge",  label:"Premier Pas 🌱",         labelEn:"First Step 🌱"},
  {scans:5,  reward:"badge",  label:"5 Scans 🔍",             labelEn:"5 Scans 🔍"},
  {scans:10, reward:"week",   label:"10 Scans — 1 semaine offerte 🎉", labelEn:"10 Scans — 1 free week 🎉"},
  {scans:20, reward:"badge",  label:"20 Scans — Expert 🏆",   labelEn:"20 Scans — Expert 🏆"},
  {scans:30, reward:"month",  label:"30 Scans — 1 mois offert 👑",labelEn:"30 Scans — 1 free month 👑"},
  {scans:50, reward:"badge",  label:"50 Scans — Légende ⚡",   labelEn:"50 Scans — Legend ⚡"},
  {scans:100,reward:"month",  label:"100 Scans — Elite 👑",    labelEn:"100 Scans — Elite 👑"},
];

function getLevel(xp) {
  return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0];
}

function getXpForScan(score) {
  if(score >= 80) return 30;
  if(score >= 60) return 20;
  return 10;
}

function calcStreak(history) {
  if(!history || history.length === 0) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  let checkDate = new Date(today);
  const sortedDates = history
    .map(h => { const d = h.createdAt?.toDate?.() || new Date(); d.setHours(0,0,0,0); return d; })
    .sort((a,b) => b-a);
  for(let i=0; i<sortedDates.length; i++){
    const diff = Math.round((checkDate - sortedDates[i]) / 86400000);
    if(diff === 0 || diff === 1){ streak++; checkDate = new Date(sortedDates[i]); }
    else break;
  }
  return streak;
}

// ─── REWARD POPUP ───
function RewardPopup({reward, onClose, t, lang}) {
  useEffect(()=>{ const tm=setTimeout(onClose,4000); return()=>clearTimeout(tm); },[onClose]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"#00000088"}}
      onClick={onClose}>
      <div style={{background:"linear-gradient(135deg,#0f1a0a,#1a1005)",border:`2px solid ${GOLD}`,borderRadius:24,padding:"32px 28px",textAlign:"center",maxWidth:300,animation:"pop .4s ease"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:64,marginBottom:12,animation:"floatY 2s ease-in-out infinite"}}>🎁</div>
        <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:8}}>{t("reward_title")}</div>
        <div style={{fontSize:16,color:"#edf5ef",lineHeight:1.6,marginBottom:20}}>
          {reward==="week"?t("reward_week"):reward==="month"?t("reward_month"):t("reward_badge")}
        </div>
        <button className="bgold" onClick={onClose} style={{fontSize:14}}>Super, merci ! 🙏</button>
      </div>
    </div>
  );
}

// ─── XP BADGE (affiché après scan) ───
function XpBadge({xp, level, streak, t}) {
  const [show,setShow] = useState(true);
  useEffect(()=>{ const tm=setTimeout(()=>setShow(false),3500); return()=>clearTimeout(tm); },[]);
  if(!show) return null;
  return (
    <div style={{position:"fixed",top:20,right:16,zIndex:999,background:"linear-gradient(135deg,#0c1810,#1a1005)",border:`1.5px solid ${GOLD}`,borderRadius:16,padding:"12px 16px",animation:"slideIn .4s ease",boxShadow:"0 8px 32px #00000066"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:28}}>{level.icon}</div>
        <div>
          <div style={{color:GOLD,fontWeight:700,fontSize:13}}>+{xp} {t("xp_pts")} ⚡</div>
          <div style={{color:MUT,fontSize:11}}>{level.name}</div>
          {streak>1&&<div style={{color:"#f97316",fontSize:10,fontWeight:700}}>🔥 {streak} jours</div>}
        </div>
      </div>
    </div>
  );
}

// ─── ISLAMIC TIPS CARD ───
function IslamicTipsCard({zone, profile, t, lang}) {
  const [tab, setTab] = useState("islamic");
  const tips = ISLAMIC_TIPS[zone?.id] || ISLAMIC_TIPS["nails"];
  const list = tab === "islamic" ? tips.islamic : tips.grandma;
  return (
    <div className="fu4 card" style={{marginBottom:14,border:`1px solid #2a1f0a`,background:"linear-gradient(135deg,#0f0d06,#16120a)"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button onClick={()=>setTab("islamic")} style={{flex:1,background:tab==="islamic"?`${GOLD}18`:"transparent",border:`1.5px solid ${tab==="islamic"?GOLD:BDR}`,borderRadius:10,padding:"8px 6px",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,color:tab==="islamic"?GOLD:MUT,cursor:"pointer"}}>
          🌙 {t("islamic_title")}
        </button>
        <button onClick={()=>setTab("grandma")} style={{flex:1,background:tab==="grandma"?`${EM}14`:"transparent",border:`1.5px solid ${tab==="grandma"?EM:BDR}`,borderRadius:10,padding:"8px 6px",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,color:tab==="grandma"?EM:MUT,cursor:"pointer"}}>
          🧕 {t("grandma_title")}
        </button>
      </div>
      <div style={{color:MUT,fontSize:10,marginBottom:10,fontStyle:"italic"}}>{tab==="islamic"?t("islamic_sub"):(lang==="en"?"Traditional remedies passed down through generations":"Remèdes transmis de génération en génération")}</div>
      {list.map((tip,i)=>(
        <div key={i} style={{display:"flex",gap:10,marginBottom:i<list.length-1?12:0,paddingBottom:i<list.length-1?12:0,borderBottom:i<list.length-1?`1px solid #1a1400`:"none"}}>
          <div style={{width:28,height:28,borderRadius:8,background:tab==="islamic"?`${GOLD}12`:`${EM}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
            {tab==="islamic"?"🌙":"🧕"}
          </div>
          <div style={{fontSize:12,color:"#c8b080",lineHeight:1.65,paddingTop:3}}>{tip}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ZONES ───
const getZones = (t, sexe) => [
  {id:"nails",    icon:"💅", label:t==="en"?"Nails":"Ongles",          hint:t==="en"?"Lay your hand flat":"Posez votre main à plat",                  vitamins:"B12 · C · Fer · Zinc",      color:"#c084fc", premium:false},
  {id:"eyes",     icon:"👁️", label:t==="en"?"Eyes":"Yeux",            hint:t==="en"?"White of eye visible":"Blanc de l'œil visible",                   vitamins:"A · Fer",                   color:"#38bdf8", premium:false},
  {id:"skin",     icon:"🖐️", label:t==="en"?"Skin":"Peau",            hint:t==="en"?"Inner side of wrist":"Face interne du poignet",                  vitamins:"D · B3 · Zinc",             color:"#fb923c", premium:false},
  {id:"hair",     icon:"💇", label:t==="en"?"Hair":"Cheveux",         hint:t==="en"?"Scalp, roots visible":"Cuir chevelu, racines visibles",           vitamins:"Biotine · Fer · B7",        color:"#f472b6", premium:true},
  {id:"tongue",   icon:"👅", label:t==="en"?"Tongue":"Langue",        hint:t==="en"?"Stuck out, good light":"Tirée, bonne lumière",                     vitamins:"B2 · B3 · B12",             color:"#f87171", premium:true},
  {id:"feet",     icon:"🦶", label:t==="en"?"Feet":"Pieds",           hint:t==="en"?"Sole, heels":"Plante du pied, talons",                   vitamins:"B3 · E · Zinc",             color:"#a3e635", premium:true},
  {id:"belly",    icon:sexe==="femme"?"🤰":"🫃", label:t==="en"?"Belly":"Ventre",         hint:t==="en"?"Abdomen, torso visible":"Zone abdominale, torse visible",           vitamins:"D · Magnésium · B12",       color:"#fbbf24", premium:true},
  {id:"scalp",    icon:"🧠", label:t==="en"?"Scalp":"Cuir chev.",     hint:t==="en"?"Loss or irritation zones":"Zones de chute ou irritation",             vitamins:"Biotine · Zinc · B5",       color:"#e879f9", premium:true},
  {id:"body_fat", icon:"💪", label:t==="en"?"Body Fat %":"% Gras corporel", hint:t==="en"?"Torso or abdomen visible, good light":"Torse ou abdomen visible, bonne lumière",  vitamins:t==="en"?"Body composition":"Composition corporelle",    color:"#f97316", premium:true},
  {id:"teeth",    icon:"🦷", label:t==="en"?"Teeth":"Dents",          hint:t==="en"?"Wide smile, good light":"Sourire large, bonne lumière",             vitamins:"Calcium · D · K2",          color:"#e2e8f0", premium:true},
  {id:"beard",    icon:"🧔", label:t==="en"?"Beard":"Barbe",          hint:t==="en"?"Full face, beard visible":"Visage entier, barbe visible",             vitamins:"Biotine · Zinc · B7 · Fer", color:"#92400e", premium:true},
];

// ─── PROMPTS IA ───
const BODY_PROMPT = `Tu es VitaScann, assistant visuel en nutrition. Analyses de photos — PISTES indicatives uniquement, pas un diagnostic médical.

Si zone = "% Gras corporel" ou "Body Fat %" → JSON :
{"score":0-100,"urgence":"normal|attention|urgent","type_analyse":"body_fat","pct_gras_estime":5-45,"categorie_gras":"essentiel|athlete|fitness|acceptable|obesite","abdos_visibles":"oui|partiellement|non","morphologie":"ectomorphe|mesomorphe|endomorphe","carences":[{"nom":"Protéines","niveau":"faible","pct":40,"emoji":"💪","signes":"masse musculaire visible","aliments":["poulet","oeufs","légumineuses"],"complement":"Whey Protéine","dose":"25g après entraînement"}],"positifs":["p1"],"conseil":"2 phrases nutrition+sport.","prochain":"zone suivante"}

Si zone = "Dents" ou "Teeth" → JSON :
{"score":0-100,"urgence":"normal|attention|urgent","type_analyse":"teeth","etat_email":"excellent|bon|abime|critique","couleur":"blanc|jaunâtre|tache","carences":[{"nom":"Calcium","niveau":"faible","pct":45,"emoji":"🦷","signes":"observation","aliments":["lait","amandes","sardines"],"complement":"Calcium + D3","dose":"500mg/j"}],"astuces_grand_mere":["Rincer bouche huile coco 10min à jeun","Pâte bicarbonate+citron 1x/sem","Curcuma + eau chaude rincement"],"positifs":["p1"],"conseil":"2 phrases.","prochain":"zone"}

Si zone = "Barbe" ou "Beard" → JSON :
{"score":0-100,"urgence":"normal|attention|urgent","type_analyse":"beard","densite":"faible|moyenne|dense","zones_clairsemees":["joues","menton","moustache"],"potentiel_viking":"faible|moyen|fort|légendaire","carences":[{"nom":"Biotine","niveau":"faible","pct":35,"emoji":"🧔","signes":"zones clairsemées","aliments":["oeufs","noix","avocats"],"complement":"Biotine 5000mcg","dose":"1 gélule/matin"}],"astuces_grand_mere":["Huile de ricin + massage 5min/soir","Cannelle + miel de Manuka application 20min","Citron frais + huile d'argan 2x/semaine","Eau de rose + gingembre frais"],"positifs":["p1"],"conseil":"2 phrases croissance barbe.","prochain":"zone"}

Sinon → JSON :
{"score":0-100,"urgence":"normal|attention|urgent","carences":[{"nom":"Vitamine X","niveau":"critique|faible|limite|normal","pct":0-100,"emoji":"🟡","signes":"observation visuelle","aliments":["a1","a2","a3"],"complement":"Nom","dose":"500mg/j"}],"positifs":["p1","p2"],"conseil":"Conseil pratique en 2 phrases.","prochain":"zone suivante"}`;

const MEAL_PROMPT = `Tu es VitaScann nutritionniste. Analyse cette photo de repas. Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{"nom_repas":"Nom","calories_estimees":0-2000,"proteines_g":0-100,"glucides_g":0-200,"lipides_g":0-100,"score_nutrition":0-100,"carences_comblees":[{"nutriment":"Vitamine X","emoji":"🟢","niveau":"bien|moyen|faible"}],"manque":[{"nutriment":"Zinc","conseil":"Ajouter graines de courge"}],"conseil_global":"2 phrases.","note_halal":"halal|inconnu|attention"}`;

const CHAT_SYSTEM = `Tu es le nutritionniste IA de VitaScann. Réponds en français ou en anglais selon la langue utilisée par l'utilisateur, de façon concise (max 3 phrases), bienveillante et pratique. Contexte du scan fourni dans le message. Pas de diagnostic médical.`;

const MEAL_PLAN_PROMPT = `Tu es nutritionniste VitaScann. Basé sur ce profil et ces carences, génère un plan repas 7 jours. Retourne UNIQUEMENT ce JSON (sans markdown) :
{"semaine":[{"jour":"Lundi","petit_dej":"...","dejeuner":"...","diner":"...","snack":"...","nutriments_cibles":["Fer","VitD"]}]}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── FREEMIUM LIMITS ───
const FREEMIUM_LIMITS = {
  scan_repas: 3,        // scans repas + étiquette par mois
  affirmations_ia: 3,   // affirmations IA par mois
};

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}`;
}

function getUsage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(`vs_usage_${key}`) || "{}");
    const month = getMonthKey();
    return data[month] || 0;
  } catch { return 0; }
}

function incrementUsage(key) {
  try {
    const storageKey = `vs_usage_${key}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const month = getMonthKey();
    data[month] = (data[month] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data[month];
  } catch { return 1; }
}

function canUseFeature(key, isPremium) {
  if (isPremium) return true;
  return getUsage(key) < FREEMIUM_LIMITS[key];
}

function getRemainingUsage(key, isPremium) {
  if (isPremium) return Infinity;
  return Math.max(0, FREEMIUM_LIMITS[key] - getUsage(key));
}



// ─── COMPOSANTS UI ───
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

// ─── LANGUAGE SELECTOR ───
function LangToggle({lang,setLang}) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      {[["fr","🇫🇷"],["en","🇬🇧"]].map(([l,flag])=>(
        <button key={l} onClick={()=>{setLang(l);localStorage.setItem("vs_lang",l);}}
          style={{background:lang===l?`${EM}20`:"transparent",border:`1.5px solid ${lang===l?EM:BDR}`,borderRadius:10,padding:"5px 10px",fontFamily:"'Outfit',sans-serif",fontSize:14,cursor:"pointer",color:lang===l?EM:MUT,transition:"all .2s"}}>
          {flag}
        </button>
      ))}
    </div>
  );
}

// ─── PHOTO PICKER ───
function PhotoPicker({onCapture,color,icon,hint,label,t}) {
  const camRef = useRef();
  const galRef = useRef();

  const handleFile = (file) => {
    if(!file)return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX=1024;
        let w=img.width,h=img.height;
        if(w>MAX){h=Math.round(h*(MAX/w));w=MAX;}
        if(h>MAX){w=Math.round(w*(MAX/h));h=MAX;}
        canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        const b64 = canvas.toDataURL("image/jpeg",0.85).split(",")[1];
        onCapture(b64, canvas.toDataURL("image/jpeg",0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{display:"flex",gap:10}}>
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      <input ref={galRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      <button onClick={()=>camRef.current.click()}
        style={{flex:1,background:`${color}15`,border:`1.5px solid ${color}44`,borderRadius:14,padding:"16px 10px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:color,cursor:"pointer",textAlign:"center"}}>
        {t("capture_camera")}
      </button>
      <button onClick={()=>galRef.current.click()}
        style={{flex:1,background:"#0c1810",border:`1.5px solid ${BDR}`,borderRadius:14,padding:"16px 10px",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:MUT,cursor:"pointer",textAlign:"center"}}>
        {t("capture_gallery")}
      </button>
    </div>
  );
}

// ─── SPLASH ───
function Splash({onDone,lang,setLang}) {
  useEffect(()=>{const timer=setTimeout(onDone,2000);return()=>clearTimeout(timer);},[onDone]);
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 50% 50%,#061a0a,#060d08)"}}>
      <div style={{fontSize:80,animation:"floatY 2s ease-in-out infinite",marginBottom:20}}>🌿</div>
      <div className="serif" style={{fontSize:36,fontWeight:700,color:EM,letterSpacing:1}}>VitaScann</div>
      <div style={{color:MUT,fontSize:14,marginTop:8}}>Intelligence Nutritionnelle</div>
      <div style={{position:"absolute",bottom:40,display:"flex",gap:8,alignItems:"center"}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───
function Onboarding({onDemo,onRegister,onLogin,lang,setLang,t}) {
  const L = lang==="en";
  const [step, setStep] = useState("scan"); // scan | result | cta
  const [selectedZone, setSelectedZone] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Données démo par zone
  const DEMO_RESULTS = {
    ongles: {
      zone:"💅 Ongles", score:64, color:WARN,
      carences:[
        {nom:"Vitamine D", emoji:"☀️", niveau:"faible", pct:32, conseil:L?"Sun exposure 15 min/day + lentils 3x/week":"Soleil 15 min/jour + lentilles 3x/semaine"},
        {nom:"Fer", emoji:"🔴", niveau:"limite", pct:52, conseil:L?"Red meat or spinach 3x/week":"Viande rouge ou épinards 3x/semaine"},
      ],
      tibb: L?"Black seed (Nigella sativa) improves iron absorption — Sunnah of the Prophet ﷺ":"La graine noire (Nigelle) améliore l'absorption du Fer — Sunna du Prophète ﷺ",
    },
    yeux: {
      zone:"👁 Yeux", score:78, color:EM,
      carences:[
        {nom:"Oméga-3", emoji:"🐟", niveau:"limite", pct:48, conseil:L?"Fatty fish 2x/week — salmon, sardines":"Poisson gras 2x/sem — saumon, sardines"},
        {nom:"Vitamine A", emoji:"🥕", niveau:"ok", pct:72, conseil:L?"Carrots, sweet potato daily":"Carotte, patate douce quotidiennement"},
      ],
      tibb: L?"Honey applied to the eyes was recommended by the Prophet ﷺ — antioxidant properties":"Le miel appliqué sur les yeux était recommandé par le Prophète ﷺ — propriétés antioxydantes",
    },
    peau: {
      zone:"🖐️ Peau", score:55, color:DANGER,
      carences:[
        {nom:"Zinc", emoji:"⚡", niveau:"faible", pct:28, conseil:L?"Pumpkin seeds, beef, chickpeas":"Graines de courge, bœuf, pois chiches"},
        {nom:"Vitamine B3", emoji:"🌾", niveau:"faible", pct:35, conseil:L?"Tuna, chicken, peanuts daily":"Thon, poulet, cacahuètes quotidiennement"},
      ],
      tibb: L?"Olive oil is mentioned in the Quran — moisturizes and protects the skin":"L'huile d'olive est mentionnée dans le Coran — hydrate et protège la peau",
    },
  };

  const ZONES_DEMO = [
    {id:"ongles", icon:"💅", label:L?"Nails":"Ongles"},
    {id:"yeux",   icon:"👁", label:L?"Eyes":"Yeux"},
    {id:"peau",   icon:"🖐️", label:L?"Skin":"Peau"},
  ];

  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId);
    setScanning(true);
    setScanProgress(0);
    // Simule un scan progressif
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setScanning(false); setStep("result"); }, 300); }
      setScanProgress(Math.min(100, Math.round(p)));
    }, 120);
  };

  const result = selectedZone ? DEMO_RESULTS[selectedZone] : null;

  // ── ÉTAPE 1 : CHOIX ZONE (scan démo) ──
  if (step === "scan") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#060d08"}}>
      <div style={{padding:"52px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <LangToggle lang={lang} setLang={setLang}/>
        <button onClick={onLogin} style={{background:"none",border:"1px solid #192c1d",borderRadius:8,padding:"6px 14px",color:"#4a6e52",fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          {L?"Sign in":"Connexion"}
        </button>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",textAlign:"center"}}>
        {!scanning ? (
          <>
            <div style={{fontSize:56,marginBottom:16,animation:"floatY 3s ease-in-out infinite"}}>🔬</div>
            <div className="serif" style={{fontSize:28,fontWeight:700,lineHeight:1.2,marginBottom:10}}>
              {L?"See what your body reveals":"Vois ce que ton corps révèle"}
            </div>
            <div style={{color:MUT,fontSize:14,lineHeight:1.6,marginBottom:32,maxWidth:300}}>
              {L?"Choose a zone — our AI detects your deficiencies in seconds. No account needed.":"Choisis une zone — notre IA détecte tes carences en quelques secondes. Sans compte."}
            </div>
            <div style={{display:"flex",gap:12,marginBottom:8}}>
              {ZONES_DEMO.map(z=>(
                <button key={z.id} onClick={()=>handleZoneSelect(z.id)}
                  style={{background:CARD,border:`2px solid ${BDR}`,borderRadius:18,padding:"20px 16px",cursor:"pointer",textAlign:"center",minWidth:90,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=EM;e.currentTarget.style.transform="translateY(-3px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=BDR;e.currentTarget.style.transform="translateY(0)";}}>
                  <div style={{fontSize:32,marginBottom:6}}>{z.icon}</div>
                  <div style={{fontWeight:700,fontSize:12,color:"#edf5ef"}}>{z.label}</div>
                </button>
              ))}
            </div>
            <div style={{color:MUT,fontSize:11,marginBottom:32}}>
              {L?"Tap to scan instantly — no photo needed":"Appuie pour scanner — aucune photo requise"}
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize:56,marginBottom:20}}>
              {ZONES_DEMO.find(z=>z.id===selectedZone)?.icon}
            </div>
            <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:20,color:EM}}>
              {L?"AI analyzing...":"Analyse IA en cours..."}
            </div>
            <div style={{width:"100%",maxWidth:280,background:"#142018",borderRadius:8,height:8,overflow:"hidden",marginBottom:10}}>
              <div style={{width:`${scanProgress}%`,height:"100%",background:`linear-gradient(90deg,${EM},${GOLD})`,borderRadius:8,transition:"width .1s ease"}}/>
            </div>
            <div style={{color:EM,fontSize:13,fontWeight:700}}>{scanProgress}%</div>
            <div style={{color:MUT,fontSize:11,marginTop:8}}>
              {scanProgress < 40 ? (L?"Detecting visible signs...":"Détection des signes visibles...") :
               scanProgress < 75 ? (L?"Cross-referencing deficiencies...":"Croisement des carences...") :
               (L?"Generating personalized advice...":"Génération des conseils personnalisés...")}
            </div>
          </>
        )}
      </div>

      <div style={{padding:"0 24px 40px",textAlign:"center"}}>
        <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>
          {L?"Already have an account? Sign in":"Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );

  // ── ÉTAPE 2 : RÉSULTAT DÉMO ──
  if (step === "result" && result) return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%, ${result.color}18 0%, #060d08 70%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{background:`${result.color}15`,borderRadius:20,padding:"4px 12px",display:"inline-flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:result.color}}/>
            <span style={{fontSize:10,fontWeight:700,color:result.color,letterSpacing:1}}>{L?"DEMO SCAN":"SCAN DÉMO"}</span>
          </div>
          <button onClick={onLogin} style={{background:"none",border:"1px solid #192c1d",borderRadius:8,padding:"6px 14px",color:"#4a6e52",fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            {L?"Sign in":"Connexion"}
          </button>
        </div>

        {/* Score principal */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
          <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
            <svg width="72" height="72" style={{transform:"rotate(-90deg)"}}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#142018" strokeWidth="6"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke={result.color} strokeWidth="6"
                strokeDasharray={`${(result.score/100)*176} 176`} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:result.color}}>{result.score}</div>
          </div>
          <div>
            <div className="serif" style={{fontSize:22,fontWeight:700,marginBottom:4}}>{result.zone}</div>
            <div style={{color:MUT,fontSize:12}}>{L?"2 deficiencies detected by visual analysis":"2 carences détectées par analyse visuelle"}</div>
            <div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:4,background:"#1a0a0a",borderRadius:10,padding:"3px 10px"}}>
              <span style={{fontSize:10,color:WARN,fontWeight:700}}>⚠️ {L?"Attention required":"Attention requise"}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 20px"}}>
        {/* Carences détectées */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>🔍 {L?"Detected deficiencies":"Carences détectées"}</div>
          {result.carences.map((c,i)=>(
            <div key={i} style={{marginBottom:i<result.carences.length-1?14:0,paddingBottom:i<result.carences.length-1?14:0,borderBottom:i<result.carences.length-1?`1px solid ${BDR}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontWeight:700,fontSize:13}}>{c.emoji} {c.nom}</span>
                <span style={{background:c.niveau==="faible"?`${DANGER}20`:c.niveau==="limite"?`${WARN}20`:`${EM}20`,color:c.niveau==="faible"?DANGER:c.niveau==="limite"?WARN:EM,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>
                  {c.niveau==="faible"?(L?"Low":"Faible"):c.niveau==="limite"?(L?"Borderline":"Limite"):(L?"OK":"OK")}
                </span>
              </div>
              <div style={{background:"#142018",borderRadius:4,height:6,overflow:"hidden",marginBottom:6}}>
                <div style={{width:`${c.pct}%`,height:"100%",background:c.niveau==="faible"?DANGER:c.niveau==="limite"?WARN:EM,borderRadius:4}}/>
              </div>
              <div style={{fontSize:11,color:MUT}}>{c.conseil}</div>
            </div>
          ))}
        </div>

        {/* Tibb an-Nabawi */}
        <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:16,padding:14,marginBottom:16}}>
          <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
          <div style={{fontSize:12,color:"#a08040",lineHeight:1.6}}>{result.tibb}</div>
        </div>

        {/* Blur / Paywall naturel */}
        <div style={{position:"relative",marginBottom:16}}>
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,filter:"blur(4px)",userSelect:"none",pointerEvents:"none"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>💊 Plan de supplémentation</div>
            <div style={{height:12,background:"#142018",borderRadius:4,marginBottom:8}}/>
            <div style={{height:12,background:"#142018",borderRadius:4,width:"70%",marginBottom:8}}/>
            <div style={{height:12,background:"#142018",borderRadius:4,width:"85%"}}/>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,13,8,0.7)",borderRadius:16}}>
            <div style={{fontSize:24,marginBottom:6}}>🔒</div>
            <div style={{fontWeight:700,fontSize:13,color:"#edf5ef",marginBottom:2}}>
              {L?"Unlock your full results":"Débloquer tes vrais résultats"}
            </div>
            <div style={{fontSize:11,color:MUT}}>
              {L?"Supplement plan · Complete analysis · Meal plan":"Plan suppléments · Analyse complète · Plan repas"}
            </div>
          </div>
        </div>

        {/* CTA inscription */}
        <button className="bem" onClick={onRegister} style={{marginBottom:10,fontSize:15,padding:"18px"}}>
          🚀 {L?"Create my free account — see everything":"Créer mon compte gratuit — tout voir"}
        </button>
        <button className="bgh" onClick={()=>setStep("scan")} style={{marginBottom:12}}>
          ← {L?"Scan another zone":"Scanner une autre zone"}
        </button>
        <div style={{textAlign:"center"}}>
          <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>
            {L?"Already have an account? Sign in":"Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}
// ─── AUTH ───
function Register({onSuccess,onLogin,t}) {
  const [f,setF] = useState({name:"",email:"",pass:"",conf:""});
  const [errs,setErrs] = useState({});
  const [load,setLoad] = useState(false);
  const [step,setStep] = useState(1);
  const [globalErr,setGlobalErr] = useState("");

  const validate = () => {
    const e={};
    if(!f.name.trim())e.name=t("err_name");
    if(!f.email.includes("@"))e.email=t("err_email");
    if(f.pass.length<8)e.pass=t("err_pass");
    if(f.pass!==f.conf)e.conf=t("err_conf");
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
      setGlobalErr(e.code==="auth/email-already-in-use"?t("err_email_used"):e.code==="auth/weak-password"?t("err_weak_pass"):t("error"));
    } finally { setLoad(false); }
  };

  const strength = f.pass.length>=12?4:f.pass.length>=8?3:f.pass.length>=5?2:f.pass.length>0?1:0;
  const strengthLabels = ["",t("strength_weak"),t("strength_medium"),t("strength_strong"),t("strength_very_strong")];

  if(step===2) return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>
      <div style={{fontSize:80,animation:"pop .5s ease",marginBottom:20}}>✅</div>
      <div className="serif" style={{fontSize:28,fontWeight:700,marginBottom:8}}>{t("register_success")}</div>
      <div style={{color:MUT,fontSize:14}}>{t("register_welcome")} {f.name} 🌿</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>{t("register_title")}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>{t("register_subtitle")}</div>
      </div>
      <ErrorBanner msg={globalErr} onClose={()=>setGlobalErr("")}/>
      <Input label={t("register_name")} value={f.name} onChange={v=>setF({...f,name:v})} placeholder={t("register_name_ph")} left="👤" error={errs.name} disabled={load}/>
      <Input label={t("register_email")} value={f.email} onChange={v=>setF({...f,email:v})} placeholder={t("register_email_ph")} left="✉️" error={errs.email} disabled={load}/>
      <Input label={t("register_pass")} type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder={t("register_pass_ph")} left="🔒" error={errs.pass} disabled={load}/>
      {f.pass.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",gap:4,marginBottom:4}}>
            {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?(strength>=4?EM:strength>=3?WARN:DANGER):BDR,transition:"background .3s"}}/>)}
          </div>
          <div style={{fontSize:10,color:strength>=4?EM:strength>=3?WARN:DANGER}}>{strengthLabels[strength]}</div>
        </div>
      )}
      <Input label={t("register_confirm")} type="password" value={f.conf} onChange={v=>setF({...f,conf:v})} placeholder={t("register_confirm_ph")} left="✅" error={errs.conf} disabled={load}/>
      <button className="bem" onClick={submit} disabled={load} style={{marginBottom:12,marginTop:4}}>{load?<Spin/>:t("register_btn")}</button>

      {/* Séparateur */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{flex:1,height:1,background:BDR}}/>
        <span style={{fontSize:12,color:MUT}}>ou</span>
        <div style={{flex:1,height:1,background:BDR}}/>
      </div>

      {/* Google Register */}
      <button onClick={async()=>{
        try {
          if (window?.Capacitor?.isNativePlatform?.()) {
            const { Browser } = await import("@capacitor/browser");
            await Browser.open({
              url: "https://vitascann.vercel.app?native_auth=1",
              presentationStyle: "popover"
            });
            return;
          }
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const u = result.user;
          const db = getFirestore();
          const ref = doc(db,"users",u.uid);
          const snap = await getDoc(ref);
          if(!snap.exists()) await setDoc(ref,{name:u.displayName||"Utilisateur",email:u.email,plan:"free",createdAt:serverTimestamp()});
          const data = snap.exists()?snap.data():{plan:"free"};
          onSuccess({uid:u.uid,name:u.displayName||"Utilisateur",email:u.email,plan:data.plan||"free"});
        } catch(e){ if(e.code!=="auth/popup-closed-by-user") alert("Erreur Google"); }
      }}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"#fff",border:"1.5px solid #e0e0e0",borderRadius:14,padding:"14px 20px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 5.1C9.8 39.8 16.4 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
        </svg>
        S'inscrire avec Google
      </button>

      <button className="bgh" onClick={onLogin}>{t("register_login")}</button>
    </div>
  );
}

function Login({onSuccess,onRegister,onForgot,t}) {
  const [f,setF] = useState({email:"",pass:""});
  const [load,setLoad] = useState(false);
  const [loadG,setLoadG] = useState(false);
  const [err,setErr] = useState("");

  const submit = async () => {
    if(!f.email||!f.pass)return setErr(t("err_fill_fields"));
    setLoad(true); setErr("");
    try {
      const u = await AuthService.login(f.email,f.pass);
      onSuccess({uid:u.uid,name:u.displayName||u.name||"Utilisateur",email:u.email,plan:u.plan||"free"});
    } catch(e) {
      setErr(t("err_invalid_creds"));
    } finally { setLoad(false); }
  };

  const loginGoogle = async () => {
    setLoadG(true); setErr("");
    try {
      // Sur Capacitor natif — ouvrir dans le vrai navigateur Chrome
      if (window?.Capacitor?.isNativePlatform?.()) {
        const { Browser } = await import("@capacitor/browser");
        // Ouvrir vitascann.vercel.app pour Google Sign-In
        await Browser.open({
          url: "https://vitascann.vercel.app?native_auth=1",
          presentationStyle: "popover"
        });
        // Écouter le retour de l'auth via onAuthStateChanged
        setErr("Connecte-toi avec Google dans le navigateur qui s'est ouvert, puis reviens ici.");
        setLoadG(false);
        // L'app va détecter la connexion via onAuthStateChanged automatiquement
        return;
      }
      // Web normal — signInWithPopup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const db = getFirestore();
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { name:u.displayName||"Utilisateur", email:u.email, plan:"free", createdAt:serverTimestamp() });
      }
      const data = snap.exists() ? snap.data() : { plan:"free" };
      onSuccess({ uid:u.uid, name:u.displayName||"Utilisateur", email:u.email, plan:data.plan||"free" });
    } catch(e) {
      console.error("Google Sign-In error:", e.code, e.message);
      if(e.code === "auth/popup-blocked") {
        setErr("Popup bloqué par le navigateur. Autorise les popups pour vitascann.vercel.app et réessaie.");
      } else if(e.code === "auth/cancelled-popup-request") {
        setErr("Requête annulée. Réessaie.");
      } else if(e.code !== "auth/popup-closed-by-user") {
        setErr("Erreur Google Sign-In: " + (e.code || e.message) + ". Réessaie ou utilise email/mot de passe.");
      }
    } finally { setLoadG(false); }
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>{t("login_title")}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>{t("login_subtitle")}</div>
      </div>
      <ErrorBanner msg={err} onClose={()=>setErr("")}/>

      {/* Google Sign-In */}
      <button onClick={loginGoogle} disabled={loadG||load}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"#fff",border:"1.5px solid #e0e0e0",borderRadius:14,padding:"14px 20px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",transition:"all .2s",opacity:loadG?0.7:1}}>
        {loadG ? <Spin/> : <>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 5.1C9.8 39.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continuer avec Google
        </>}
      </button>

      {/* Séparateur */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{flex:1,height:1,background:BDR}}/>
        <span style={{fontSize:12,color:MUT}}>ou</span>
        <div style={{flex:1,height:1,background:BDR}}/>
      </div>

      <Input label={t("register_email")} value={f.email} onChange={v=>setF({...f,email:v})} placeholder={t("register_email_ph")} left="✉️" disabled={load}/>
      <Input label={t("register_pass")} type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="••••••••" left="🔒" disabled={load}/>
      <button className="bem" onClick={submit} disabled={load} style={{marginBottom:12}}>{load?<Spin/>:t("login_btn")}</button>
      <button className="bgh" onClick={onForgot} style={{marginBottom:10}}>{t("login_forgot")}</button>
      <button className="bgh" onClick={onRegister}>{t("login_no_account")}</button>
    </div>
  );
}

function ForgotPassword({onBack,t}) {
  const [email,setEmail] = useState("");
  const [sent,setSent] = useState(false);
  const [load,setLoad] = useState(false);

  const send = async () => {
    if(!email)return;
    setLoad(true);
    try { await AuthService.resetPassword(email); setSent(true); }
    catch(e) { }
    finally { setLoad(false); }
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🔑</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>{t("forgot_title")}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>{t("forgot_subtitle")}</div>
      </div>
      {sent?(
        <div style={{textAlign:"center",padding:24,background:`${EM}10`,border:`1px solid ${EM}33`,borderRadius:16}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{color:EM,fontWeight:700}}>{t("forgot_sent")}</div>
        </div>
      ):(
        <>
          <Input label={t("register_email")} value={email} onChange={setEmail} placeholder={t("register_email_ph")} left="✉️" disabled={load}/>
          <button className="bem" onClick={send} disabled={load||!email}>{load?<Spin/>:t("forgot_btn")}</button>
        </>
      )}
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,fontSize:13,cursor:"pointer"}}>{t("forgot_back")}</button>
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ───
function ProfileSetup({user,onSave,onSkip,t}) {
  const [p,setP] = useState({age:"",poids:"",sexe:"homme",objectif:"sante",activite:"moderee",halal:false});
  const [load,setLoad] = useState(false);

  const save = async () => {
    setLoad(true);
    if(user?.uid&&!user?.isDemo) await ScanService.saveProfile(user.uid,p).catch(()=>{});
    onSave(p);
    setLoad(false);
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🧬</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>{t("profile_title")}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>{t("profile_subtitle")}</div>
      </div>
      <Input label={t("profile_age")} value={p.age} onChange={v=>setP({...p,age:v})} placeholder={t("profile_age_ph")} left="🎂" disabled={load}/>
      <Input label={t("profile_weight")} value={p.poids} onChange={v=>setP({...p,poids:v})} placeholder={t("profile_weight_ph")} left="⚖️" disabled={load}/>
      <Select label={t("profile_sex")} value={p.sexe} onChange={v=>setP({...p,sexe:v})} disabled={load}
        options={[{v:"homme",l:`👨 ${t("profile_sex_m")}`},{v:"femme",l:`👩 ${t("profile_sex_f")}`},{v:"autre",l:t("profile_sex_other")}]}/>
      <Select label={t("profile_goal")} value={p.objectif} onChange={v=>setP({...p,objectif:v})} disabled={load}
        options={[
          {v:"sante",l:`🌿 ${t("profile_goal_health")}`},
          {v:"perte",l:`⚖️ ${t("profile_goal_loss")}`},
          {v:"muscle",l:`💪 ${t("profile_goal_muscle")}`},
          {v:"energie",l:`⚡ ${t("profile_goal_energy")}`},
          {v:"grossesse",l:`🤰 ${t("profile_goal_pregnancy")}`},
          {v:"sport",l:`🏃 ${t("profile_goal_athlete")}`},
        ]}/>
      <Select label={t("profile_activity")} value={p.activite} onChange={v=>setP({...p,activite:v})} disabled={load}
        options={[
          {v:"sedentaire",l:`🛋️ ${t("profile_activity_low")}`},
          {v:"moderee",l:`🚶 ${t("profile_activity_moderate")}`},
          {v:"active",l:`🏃 ${t("profile_activity_active")}`},
          {v:"tres_active",l:`🔥 ${t("profile_activity_very")}`},
        ]}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:CARD,border:`1px solid ${BDR}`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div>
          <div style={{fontWeight:600,fontSize:14}}>{t("profile_halal")}</div>
          <div style={{color:MUT,fontSize:12,marginTop:2}}>{t("profile_halal_sub")}</div>
        </div>
        <button onClick={()=>setP({...p,halal:!p.halal})}
          style={{width:44,height:24,borderRadius:12,border:"none",background:p.halal?GOLD:BDR,cursor:"pointer",position:"relative",transition:"background .3s"}}>
          <div style={{position:"absolute",top:2,left:p.halal?22:2,width:20,height:20,borderRadius:10,background:"white",transition:"left .3s",boxShadow:"0 1px 3px #0004"}}/>
        </button>
      </div>
      <button className="bem" onClick={save} disabled={load} style={{marginBottom:12}}>{load?<Spin/>:t("save")}</button>
      <button className="bgh" onClick={onSkip}>{t("profile_skip")}</button>
    </div>
  );
}

// ─── DASHBOARD ───

// ─── SCREEN TIME GUIDE ───
function ScreenTimeGuide({ onClose, lang }) {
  const L = lang === "en";
  const [os, setOs] = useState(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "unknown";
  });

  const GOLD2 = "#e2b84a";
  const MUT2  = "#4a6e52";
  const CARD2 = "#0c1810";
  const BDR2  = "#192c1d";
  const DANGER2 = "#ef4444";

  const steps = {
    ios: [
      { emoji:"⚙️", step:L?"Open Settings":"Ouvre Réglages" },
      { emoji:"⏱️", step:L?"Tap 'Screen Time'":"Appuie sur 'Temps d'écran'" },
      { emoji:"📊", step:L?"See 'Today' — your real screen time":"Vois 'Aujourd'hui' — ton vrai temps d'écran" },
      { emoji:"📱", step:L?"Tap 'See All Activity' for app details":"Appuie 'Voir toute l'activité' pour les apps" },
    ],
    android: [
      { emoji:"⚙️", step:L?"Open Settings":"Ouvre Paramètres" },
      { emoji:"🔍", step:L?"Search 'Digital Wellbeing' or 'Screen Time'":"Recherche 'Bien-être numérique' ou 'Temps d'écran'" },
      { emoji:"📊", step:L?"See your daily screen time by app":"Vois ton temps d'écran quotidien par app" },
      { emoji:"⏰", step:L?"Set app timers if needed":"Configure des minuteries d'app si besoin" },
    ],
    unknown: [
      { emoji:"📱", step:L?"On iPhone: Settings → Screen Time":"Sur iPhone : Réglages → Temps d'écran" },
      { emoji:"🤖", step:L?"On Android: Settings → Digital Wellbeing":"Sur Android : Paramètres → Bien-être numérique" },
      { emoji:"📊", step:L?"Check your daily usage by app":"Vois ton utilisation quotidienne par app" },
    ],
  };

  const facts = [
    { emoji:"😱", fact:L?"Average person checks phone 96x per day":"La personne moyenne vérifie son téléphone 96x/jour" },
    { emoji:"⏰", fact:L?"Average screen time: 4h 37min per day":"Temps d'écran moyen : 4h 37min par jour" },
    { emoji:"📅", fact:L?"That's 70 full days per year on your phone":"Soit 70 jours complets par an sur le téléphone" },
    { emoji:"🧠", fact:L?"Social media = dopamine addiction loop":"Réseaux sociaux = boucle d'addiction à la dopamine" },
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"flex-end",padding:0}} onClick={onClose}>
      <div style={{width:"100%",background:"#0a1510",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#edf5ef"}}>📱 {L?"Your Real Screen Time":"Ton Vrai Temps d'Écran"}</div>
            <div style={{fontSize:12,color:MUT2,marginTop:2}}>{L?"Follow these steps on your phone":"Suis ces étapes sur ton téléphone"}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:MUT2,fontSize:20,cursor:"pointer",padding:4}}>✕</button>
        </div>

        {/* OS selector */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {id:"ios",   emoji:"🍎", label:"iPhone / iPad"},
            {id:"android",emoji:"🤖", label:"Android"},
          ].map(o=>(
            <button key={o.id} onClick={()=>setOs(o.id)}
              style={{background:os===o.id?`${GOLD2}15`:CARD2,border:`1.5px solid ${os===o.id?GOLD2:BDR2}`,borderRadius:14,padding:"10px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:4}}>{o.emoji}</div>
              <div style={{fontSize:12,fontWeight:os===o.id?700:400,color:os===o.id?GOLD2:MUT2}}>{o.label}</div>
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{background:CARD2,border:`1px solid ${BDR2}`,borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{fontSize:11,color:GOLD2,fontWeight:700,marginBottom:12}}>
            {os==="ios"?"📍 iOS — Temps d'écran":os==="android"?"📍 Android — Bien-être numérique":"📍 Comment trouver ton temps d'écran"}
          </div>
          {(steps[os]||steps.unknown).map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<(steps[os]||steps.unknown).length-1?12:0,paddingBottom:i<(steps[os]||steps.unknown).length-1?12:0,borderBottom:i<(steps[os]||steps.unknown).length-1?`1px solid ${BDR2}`:"none"}}>
              <div style={{width:32,height:32,borderRadius:10,background:`${GOLD2}20`,border:`1px solid ${GOLD2}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.emoji}</div>
              <div style={{flex:1,paddingTop:4}}>
                <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.5}}>{s.step}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:"50%",background:`${GOLD2}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:GOLD2,flexShrink:0,marginTop:4}}>{i+1}</div>
            </div>
          ))}
        </div>

        {/* Chiffres chocs */}
        <div style={{background:"#1a0505",border:`1px solid ${DANGER2}22`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:DANGER2,fontWeight:700,marginBottom:10}}>⚡ {L?"REALITY CHECK":"RÉALITÉ BRUTALE"}</div>
          {facts.map((f,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<facts.length-1?8:0}}>
              <span style={{fontSize:16,flexShrink:0}}>{f.emoji}</span>
              <span style={{fontSize:12,color:"#c08080",lineHeight:1.5}}>{f.fact}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{background:`${"#e2b84a"}10`,border:`1px solid ${"#e2b84a"}33`,borderRadius:14,padding:14,textAlign:"center"}}>
          <div style={{fontSize:13,color:"#a08040",lineHeight:1.7}}>
            {L?"Once you know your real screen time, come back to VitaScann and enter it in the Reality Check module for your personalized analysis 📊":"Une fois que tu connais ton vrai temps d'écran, reviens dans VitaScann et entre-le dans le module Réalité Brutale pour ton analyse personnalisée 📊"}
          </div>
        </div>

      </div>
    </div>
  );
}

function Dashboard({user,onScan,onMealScan,onPaywall,onLogout,onProfile,onFamily,onChallenge,onProgress,onMealPlan,onPedometer,onReferral,onWallet,onGymCoach,onCaliCoach,onLongevite,onScanCorps,onSanteEmo,onNutritionScan,onScoreEnergie,onMindset,onRealite,onEnviron,onImmunite,onMaternite,onMotivation,onScannerFutur,onScoreDopamine,onSoloLeveling,history,profile,vitaCoins,lang,setLang,t}) {
  const [showScreenTime, setShowScreenTime] = useState(false);
  const scansLeft = user.plan==="free"?Math.max(0,3-(history?.length||0)):null;
  const challengeDay = Math.min(30, history?.length||0);
  const totalScans = history?.length||0;
  const totalXp = totalScans * 20;
  const currentLevel = getLevel(totalXp);
  const streak = calcStreak(history||[]);
  const nextMilestone = MILESTONES.find(m => m.scans > totalScans);
  const aura = useRangAura();

  return (
    <div style={{minHeight:"100vh",paddingBottom:90,overflowY:"auto"}}>
      <style>{AURA_CSS}</style>
      <div style={{padding:"52px 22px 18px",background:aura.gradient,position:"relative",overflow:"hidden"}}>
        {aura.particles && <AuraParticles color={aura.color} count={10}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,position:"relative",zIndex:1}}>
          <div>
            <div className="serif fu" style={{fontSize:24,fontWeight:700}}>{t("db_hello")} {user.name?.split(" ")[0]} 👋</div>
            {aura.rangId!=="F" && <div style={{marginTop:4,marginBottom:4}}><RangBadge aura={aura} lang={lang}/></div>}
            <div className="fu1" style={{color:MUT,fontSize:13,marginTop:3}}>
              {user.plan==="premium"
                ?<span style={{color:GOLD}}>{t("db_premium")}</span>
                :<span>{t("db_free")} <span style={{color:EM,fontWeight:600}}>{scansLeft} {t("db_scans_left")}</span></span>
              }
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <LangToggle lang={lang} setLang={setLang}/>
            <button onClick={onWallet} style={{background:`${GOLD}14`,border:`1px solid ${GOLD}33`,borderRadius:10,padding:"6px 12px",color:GOLD,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              🪙 {vitaCoins}
            </button>
            <button onClick={onLogout} style={{background:"none",border:`1px solid ${BDR}`,borderRadius:10,padding:"6px 12px",color:MUT,fontSize:12,cursor:"pointer"}}>{t("db_logout")}</button>
          </div>
        </div>
        {profile&&(
          <div className="fu2" style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {profile.age&&<span style={{background:`${EM}10`,color:EM,borderRadius:20,padding:"3px 10px",fontSize:11}}>👤 {profile.age} {lang==="en"?"yrs":"ans"}</span>}
            {profile.objectif&&<span style={{background:`${EM}10`,color:EM,borderRadius:20,padding:"3px 10px",fontSize:11}}>🎯 {profile.objectif}</span>}
            {profile.halal&&<span style={{background:`${GOLD}10`,color:GOLD,borderRadius:20,padding:"3px 10px",fontSize:11}}>🌙 Halal</span>}
          </div>
        )}
      </div>

      <div style={{padding:"14px 18px"}}>
        {/* Row 1 : Scan corporel + Scan repas */}
        <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <button onClick={onScan} style={{background:"linear-gradient(135deg,#0c2812,#071a0a)",border:`1.5px solid ${EM}44`,borderRadius:18,padding:"18px 12px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:30,marginBottom:8}}>🔬</div>
            <div style={{fontWeight:700,fontSize:14,color:"#edf5ef"}}>{t("db_body_scan")}</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>{t("db_body_sub")}</div>
          </button>
          <button onClick={onMealScan} style={{background:"linear-gradient(135deg,#12180c,#0a1207)",border:`1.5px solid ${GOLD}44`,borderRadius:18,padding:"18px 12px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:30,marginBottom:8}}>🍽️</div>
            <div style={{fontWeight:700,fontSize:14,color:GOLD}}>{t("db_meal_scan")}</div>
            <div style={{color:MUT,fontSize:11,marginTop:2}}>{t("db_meal_sub")}</div>
            {user.plan!=="premium"&&<div style={{fontSize:9,color:GOLD,marginTop:3,fontWeight:700}}>✨ PREMIUM</div>}
          </button>
        </div>


        {/* ━━━ SECTION DIVIDER helper ━━━ */}

        {/* ━━━ 💪 ACTIVITÉ ━━━ */}
        <div style={{fontSize:10,color:MUT,fontWeight:700,letterSpacing:1.5,marginBottom:8,marginTop:4}}>💪 {lang==="en"?"ACTIVITY":"ACTIVITÉ"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {/* Solo Leveling */}
          <button onClick={onSoloLeveling}
            style={{background:aura.rangId==="F"?"linear-gradient(135deg,#0a0010,#1a0025)":`linear-gradient(135deg,${aura.color}15,${aura.color}08)`,border:`1.5px solid ${aura.rangId==="F"?"#fbbf2444":aura.border}`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden",minHeight:90}}>
            {aura.particles&&<AuraParticles color={aura.color} count={3}/>}
            <div style={{fontSize:28,position:"relative",zIndex:1}}>⚔️</div>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:aura.rangId==="F"?"#fbbf24":aura.color,lineHeight:1.2}}>Solo Leveling</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{lang==="en"?"7 days · Rank F→S":"7 jours · Rang F→S"}</div>
            </div>
            {aura.rangId!=="F"&&<div style={{position:"absolute",top:6,right:6,fontSize:9,background:`${aura.color}20`,color:aura.color,borderRadius:10,padding:"2px 6px",fontWeight:700}}>{aura.badge}</div>}
          </button>

          {/* Richesse spirituelle */}
          <button onClick={onPedometer}
            style={{background:"linear-gradient(135deg,#1a0a25,#0d0518)",border:`1.5px solid #c084fc33`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",minHeight:90}}>
            <div style={{fontSize:28}}>🌙</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#c084fc",lineHeight:1.2}}>{lang==="en"?"Wealth Keys":"Clés Richesse"}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{lang==="en"?"Istighfar · Gratitude":"Istighfar · Gratitude"}</div>
            </div>
          </button>

          {/* Coach Corps Complet */}
          <button onClick={user.plan==="premium"?onCaliCoach:onPaywall}
            style={{background:"linear-gradient(135deg,#0a1a08,#0d2a0a)",border:`1.5px solid ${EM}44`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",minHeight:90,position:"relative"}}>
            <div style={{fontSize:28}}>🏋️</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:EM,lineHeight:1.2}}>{lang==="en"?"Body Coach":"Coach Corps"}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{lang==="en"?"Calisthenics · Mobility":"Calisthenics · Mobilité"}</div>
            </div>
            {user.plan!=="premium"
              ?<div style={{position:"absolute",top:6,right:6,fontSize:9,background:`${GOLD}20`,color:GOLD,borderRadius:8,padding:"2px 5px",fontWeight:700}}>✨ PRO</div>
              :<div style={{position:"absolute",top:6,right:6,fontSize:9,background:"#00ff8820",color:"#00ff88",borderRadius:8,padding:"2px 5px",fontWeight:700}}>🆓</div>}
          </button>

          {/* Défi 30j */}
          <button onClick={onChallenge}
            style={{background:`linear-gradient(135deg,#1a1000,#2a1a00)`,border:`1.5px solid ${GOLD}33`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",minHeight:90}}>
            <div style={{fontSize:28}}>🏆</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:GOLD,lineHeight:1.2}}>{lang==="en"?"30-Day Challenge":"Défi 30 Jours"}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{lang==="en"?`Day ${challengeDay}/30`:`Jour ${challengeDay}/30`}</div>
            </div>
          </button>
        </div>

        {/* ━━━ 🔬 SANTÉ & SCORES ━━━ */}
        <div style={{fontSize:10,color:MUT,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>🔬 {lang==="en"?"HEALTH & SCORES":"SANTÉ & SCORES"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {emoji:"🔮",label:lang==="en"?"Future Scanner":"Scanner Futur",sub:lang==="en"?"6-month prediction":"Prédiction 6 mois",color:"#38bdf8",fn:onScannerFutur,free:true},
            {emoji:"🧠",label:lang==="en"?"Dopamine Score":"Score Dopamine",sub:lang==="en"?"Digital addictions":"Addictions numériques",color:"#a855f7",fn:onScoreDopamine,free:true},
            {emoji:"⚡",label:lang==="en"?"Energy Score":"Score Énergie",sub:lang==="en"?"Daily plan":"Plan quotidien",color:EM,fn:onScoreEnergie,free:true},
            {emoji:"🛡️",label:lang==="en"?"Immunity Score":"Score Immunité",sub:"Tibb an-Nabawi 🌿",color:"#06b6d4",fn:onImmunite,free:true},
            {emoji:"🌫️",label:lang==="en"?"Toxic Env.":"Environnement",sub:lang==="en"?"Toxic scan":"Scan toxique",color:"#a855f7",fn:onEnviron,free:true},
            {emoji:"🔬",label:lang==="en"?"Body Scan":"Scan Corps",sub:lang==="en"?"Morphology · %fat":"Morphologie · %gras",color:"#a855f7",fn:onScanCorps,free:false},
          ].map(({emoji,label,sub,color,fn,free})=>(
            <button key={label} onClick={fn}
              style={{background:CARD,border:`1.5px solid ${color}33`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",minHeight:90,position:"relative"}}>
              <div style={{fontSize:28}}>{emoji}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color,lineHeight:1.2}}>{label}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{sub}</div>
              </div>
              {free
                ?<div style={{position:"absolute",top:6,right:6,fontSize:9,background:"#00ff8820",color:"#00ff88",borderRadius:8,padding:"2px 5px",fontWeight:700}}>🆓</div>
                :<div style={{position:"absolute",top:6,right:6,fontSize:9,background:`${GOLD}20`,color:GOLD,borderRadius:8,padding:"2px 5px",fontWeight:700}}>✨</div>}
            </button>
          ))}
        </div>

        {/* ━━━ 🧠 MENTAL & SPIRITUEL ━━━ */}
        <div style={{fontSize:10,color:MUT,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>🧠 {lang==="en"?"MENTAL & SPIRITUAL":"MENTAL & SPIRITUEL"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {emoji:"🗡️",label:lang==="en"?"Warrior Mindset":"Mindset Guerrier",sub:lang==="en"?"Muslim · Athlete · Entrepreneur":"Musulman · Sportif · Entrepreneur",color:"#f97316",fn:onMindset},
            {emoji:"🌙",label:lang==="en"?"Dhikr & Motivation":"Dhikr & Motivation",sub:lang==="en"?"Dua · Tasbih · Affirmations":"Dua · Tasbih · Affirmations",color:"#c084fc",fn:onMotivation},
            {emoji:"❤️",label:lang==="en"?"Emotional Health":"Santé Émotionnelle",sub:lang==="en"?"TCM · Breathwork · Support":"MTC · Respiration · Soutien",color:"#c084fc",fn:onSanteEmo},
            {emoji:"⚡",label:lang==="en"?"Brutal Reality":"Réalité Brutale",sub:lang==="en"?"The truth about your life":"La vérité sur ta vie",color:"#ef4444",fn:onRealite},
          ].map(({emoji,label,sub,color,fn})=>(
            <button key={label} onClick={fn}
              style={{background:CARD,border:`1.5px solid ${color}33`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,fontFamily:"'Outfit',sans-serif",minHeight:90}}>
              <div style={{fontSize:28}}>{emoji}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color,lineHeight:1.2}}>{label}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ━━━ 🌸 MATERNITÉ — PREMIUM ━━━ */}
        <div style={{fontSize:10,color:GOLD,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>🌸 {lang==="en"?"MATERNITY — PREMIUM":"MATERNITÉ — PREMIUM"}</div>
        <button onClick={user.plan==="premium"?onMaternite:onPaywall}
          style={{width:"100%",background:"linear-gradient(135deg,#1a0510,#2a0818)",border:`1.5px solid #f9a8d455`,borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",marginBottom:16,display:"flex",alignItems:"center",gap:14,fontFamily:"'Outfit',sans-serif"}}>
          <div style={{fontSize:36,flexShrink:0}}>🤰</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:15,color:"#f9a8d4"}}>{lang==="en"?"Maternity & Cycle":"Maternité & Cycle"}</div>
            <div style={{color:MUT,fontSize:12,marginTop:2}}>{lang==="en"?"Exercises · Fertility calendar · Hormonal guide":"Exercices · Calendrier fertilité · Guide hormonal"}</div>
          </div>
          {user.plan!=="premium"
            ?<div style={{fontSize:11,background:`${GOLD}20`,color:GOLD,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0}}>✨ PREMIUM</div>
            :<div style={{fontSize:11,background:"#f9a8d420",color:"#f9a8d4",borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0}}>GO 🌸</div>}
        </button>

        {/* Bouton temps d'écran */}
        <button onClick={()=>setShowScreenTime(true)}
          style={{width:"100%",background:"#0a0a0a",border:"1px solid #ef444422",borderRadius:12,padding:"10px 16px",cursor:"pointer",textAlign:"left",marginBottom:10,display:"flex",alignItems:"center",gap:10,fontFamily:"'Outfit',sans-serif"}}>
          <span style={{fontSize:16}}>📱</span>
          <div style={{flex:1}}>
            <span style={{fontSize:12,color:"#ef4444",fontWeight:600}}>{lang==="en"?"See my real screen time →":"Voir mon vrai temps d'écran →"}</span>
            <span style={{fontSize:11,color:MUT,marginLeft:6}}>{lang==="en"?"iPhone & Android guide":"Guide iPhone & Android"}</span>
          </div>
        </button>
        {showScreenTime && <ScreenTimeGuide onClose={()=>setShowScreenTime(false)} lang={lang}/>}

        <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {ic:"📈",lb:t("db_progress"),fn:onProgress,premium:true},
            {ic:"🗓️",lb:t("db_meal_plan"),fn:onMealPlan,premium:true},
            {ic:"👨‍👩‍👧",lb:t("db_family"),fn:onFamily,premium:false},
            {ic:"🏆",lb:t("db_challenge"),fn:onChallenge,premium:false},
            {ic:"🧬",lb:t("db_my_profile"),fn:onProfile,premium:false},
            {ic:"🌙",lb:lang==="en"?"Wealth":"Richesse",fn:onPedometer,premium:false},
            {ic:"👥",lb:lang==="en"?"Referral":"Parrainage",fn:onReferral,premium:false},
            {ic:"🪙",lb:"VitaCoins",fn:onWallet,premium:false},
          ].map(({ic,lb,fn,premium})=>(
            <button key={lb} onClick={premium&&user.plan!=="premium"?onPaywall:fn}
              style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px 6px",cursor:"pointer",textAlign:"center",position:"relative"}}>
              <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
              <div style={{fontSize:10,color:MUT,fontWeight:600}}>{lb}</div>
              {premium&&user.plan!=="premium"&&<div style={{position:"absolute",top:4,right:4,fontSize:8,color:GOLD}}>👑</div>}
            </button>
          ))}
        </div>

        <div className="fu3 card" style={{marginBottom:14,border:`1px solid ${GOLD}28`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:13}}>{t("db_challenge_title")}</div>
            <span style={{color:GOLD,fontWeight:700,fontSize:13}}>{lang==="en"?"Day":"Jour"} {challengeDay}/30</span>
          </div>
          <div style={{background:"#142018",borderRadius:6,height:8,overflow:"hidden",marginBottom:8}}>
            <div style={{width:`${(challengeDay/30)*100}%`,height:"100%",background:`linear-gradient(90deg,${GOLD},${EM})`,borderRadius:6,transition:"width 1s ease"}}/>
          </div>
          <div style={{fontSize:11,color:MUT}}>{30-challengeDay} {t("db_challenge_left")}</div>
        </div>

        {/* XP / Niveau / Streak */}
        <div className="fu3 card" style={{marginBottom:14,border:`1px solid ${currentLevel.color}33`,background:"linear-gradient(135deg,#0a0e0b,#0f1205)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{fontSize:36}}>{currentLevel.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:currentLevel.color}}>{lang==="en"?currentLevel.nameEn:currentLevel.name}</div>
              <div style={{color:MUT,fontSize:11}}>{totalXp} XP · {totalScans} {t("total_scans")}</div>
            </div>
            {streak>0&&(
              <div style={{textAlign:"center",background:"#1a0f00",border:`1px solid #f9731633`,borderRadius:12,padding:"8px 12px"}}>
                <div style={{fontSize:18}}>🔥</div>
                <div style={{fontWeight:700,fontSize:14,color:"#f97316"}}>{streak}</div>
                <div style={{fontSize:9,color:MUT}}>{lang==="en"?"days":"jours"}</div>
              </div>
            )}
          </div>
          {nextMilestone&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:MUT}}>{lang==="en"?"Next reward":"Prochaine récompense"}</span>
                <span style={{fontSize:11,color:GOLD,fontWeight:700}}>{nextMilestone.scans - totalScans} {lang==="en"?"scans left":"scans restants"}</span>
              </div>
              <div style={{background:"#142018",borderRadius:6,height:6,overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,((totalScans-(MILESTONES[Math.max(0,MILESTONES.indexOf(nextMilestone)-1)]?.scans||0))/(nextMilestone.scans-(MILESTONES[Math.max(0,MILESTONES.indexOf(nextMilestone)-1)]?.scans||0)))*100)}%`,height:"100%",background:`linear-gradient(90deg,${GOLD},${EM})`,borderRadius:6,transition:"width 1s ease"}}/>
              </div>
              <div style={{fontSize:11,color:MUT,marginTop:6}}>🎯 {lang==="en"?nextMilestone.labelEn:nextMilestone.label}</div>
            </>
          )}
        </div>

        {history.length>0&&(
          <div className="fu3 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>{t("db_history_title")}</div>
            {history.slice(0,3).map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<Math.min(2,history.length-1)?12:0,paddingBottom:i<Math.min(2,history.length-1)?12:0,borderBottom:i<Math.min(2,history.length-1)?`1px solid ${BDR}`:"none"}}>
                <ScoreRing score={h.score||75} size={48}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{h.zone||h.nom_repas||"Scan"}</div>
                  <div style={{color:MUT,fontSize:11,marginTop:2}}>{h.createdAt?.toDate?.()?.toLocaleDateString(lang==="en"?"en":"fr")||t("db_recent")}</div>
                </div>
                <span style={{background:h.score>=75?`${EM}20`:WARN+"20",color:h.score>=75?EM:WARN,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{h.score>=75?t("db_good"):t("db_attention")}</span>
              </div>
            ))}
          </div>
        )}

        {user.plan==="free"&&(
          <div className="fu4" style={{background:"linear-gradient(135deg,#181005,#100b03)",border:`1.5px solid ${GOLD}38`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:28}}>👑</div>
              <div>
                <div className="serif" style={{fontSize:17,fontWeight:700,color:GOLD}}>{t("db_premium_banner")}</div>
                <div style={{color:MUT,fontSize:12}}>{t("db_premium_sub")}</div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div className="serif" style={{fontSize:20,fontWeight:700,color:GOLD}}>4,99$</div>
                <div style={{color:MUT,fontSize:10}}>/mois</div>
              </div>
            </div>
            <button className="bgold" onClick={onPaywall} style={{fontSize:13}}>{t("db_unlock")}</button>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(8,14,10,.95)",backdropFilter:"blur(20px)",borderTop:`1px solid ${BDR}`,padding:"10px 0 22px",display:"flex",justifyContent:"space-around"}}>
        {[[`🏠`,t("nav_home")],[`🔬`,t("nav_scan")],[`🍽️`,t("nav_meal")],[`👨‍👩‍👧`,t("nav_family")]].map(([ic,lb])=>(
          <button key={lb} onClick={lb===t("nav_scan")?onScan:lb===t("nav_meal")?onMealScan:lb===t("nav_family")?onFamily:undefined}
            style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:19}}>{ic}</div>
            <div style={{fontSize:10,color:lb===t("nav_home")?EM:MUT,fontWeight:lb===t("nav_home")?600:400}}>{lb}</div>
            {lb===t("nav_home")&&<div style={{width:4,height:4,borderRadius:2,background:EM}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ZONE PICKER ───
function ZonePick({onSelect,onBack,user,onPaywall,lang,t,profile}) {
  const ZONES = getZones(lang, profile?.sexe);
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("zones_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>
        {user?.plan==="premium"
          ?<span style={{color:GOLD}}>{t("zones_premium_all")}</span>
          :<span><span style={{color:EM,fontWeight:600}}>{t("zones_free")}</span> · <span style={{color:GOLD}}>{t("zones_premium_locked")}</span></span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {ZONES.map(z=>{
          const locked=z.premium&&user?.plan!=="premium";
          return (
            <button key={z.id} onClick={()=>locked?onPaywall():onSelect(z)}
              style={{display:"flex",alignItems:"center",gap:14,background:locked?"#0a0e0b":CARD,border:`1px solid ${locked?"#1a2e1e":BDR}`,borderRadius:16,padding:"15px 16px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .2s",opacity:locked?.75:1}}
              onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${locked?GOLD+"44":z.color+"55"}`;}}
              onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${locked?"#1a2e1e":BDR}`;}}>
              <div style={{width:50,height:50,borderRadius:14,background:locked?`${GOLD}10`:`${z.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                {locked?"🔒":z.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:locked?MUT:"#edf5ef"}}>{z.label}</div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{locked?t("zones_premium_zone"):z.hint}</div>
                {!locked&&<div style={{fontSize:10,color:z.color,marginTop:4,fontWeight:600}}>{z.vitamins}</div>}
                {locked&&<div style={{fontSize:10,color:GOLD,marginTop:4,fontWeight:600}}>{t("zones_premium_price")}</div>}
              </div>
              <div style={{color:locked?GOLD:MUT,fontSize:locked?13:18}}>{locked?"👑":"›"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CAPTURE ───
function Capture({zone,onCapture,onBack,t}) {
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:3}}>{t("capture_title")}</div>
      <div className="fu1" style={{color:zone.color,fontSize:17,fontWeight:600,marginBottom:20}}>{zone.icon} {zone.label}</div>

      {zone.id==="beard"&&(
        <div className="fu2" style={{background:`${VIKING}10`,border:`1px solid ${VIKING}33`,borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{color:VIKING,fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:6}}>{t("capture_beard_title")}</div>
          <div style={{fontSize:12,color:"#a0bcaa",lineHeight:1.6}}>{t("capture_beard_sub")}</div>
        </div>
      )}

      {zone.id==="teeth"&&(
        <div className="fu2" style={{background:"#0a1a14",border:"1px solid #1a3028",borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{color:"#e2e8f0",fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:6}}>{t("capture_teeth_title")}</div>
          <div style={{fontSize:12,color:"#a0bcaa",lineHeight:1.6}}>{t("capture_teeth_sub")}</div>
        </div>
      )}

      <div className="fu2" style={{flex:1,maxHeight:200,background:"#080f0a",borderRadius:24,border:`2px solid ${zone.color}38`,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
        <div style={{position:"absolute",left:16,right:16,height:2,background:`linear-gradient(90deg,transparent,${zone.color},transparent)`,animation:"scanPulse 2s ease-in-out infinite",top:"50%"}}/>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:48,marginBottom:8}}>{zone.icon}</div>
          <div style={{color:zone.color,fontWeight:600,fontSize:13}}>{zone.hint}</div>
        </div>
      </div>

      <div className="fu3 card" style={{marginBottom:16}}>
        <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{t("capture_tips_title")}</div>
        {[t("capture_tip1"),t("capture_tip2"),t("capture_tip3")].map(tip=>(
          <div key={tip} style={{display:"flex",gap:7,marginBottom:5,fontSize:12,color:MUT}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:GOLD,marginTop:4,flexShrink:0}}/>{tip}
          </div>
        ))}
      </div>

      <div className="fu4">
        <PhotoPicker onCapture={onCapture} color={zone.color} icon={zone.icon} hint={zone.hint} label={zone.label} t={t}/>
      </div>
    </div>
  );
}



// ─── COMPOSANTS SCAN CORPOREL ───
function Preview({zone,preview,onAnalyze,onRetake,isMeal,t}) {
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",display:"flex",flexDirection:"column"}}>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:3}}>{isMeal?"🍽️":zone?.icon} {isMeal?t("meal_capture_title"):zone?.label}</div>
      <div style={{color:MUT,fontSize:13,marginBottom:16}}>{isMeal?t("meal_photo_sub"):zone?.hint}</div>
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:20,border:`2px solid ${isMeal?GOLD:zone?.color||EM}44`,maxHeight:320}}>
        <img src={preview} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
      </div>
      <button className="bem" onClick={onAnalyze} style={{marginBottom:10}}>
        ✨ {isMeal?(t("lang_label")==="en"?"Analyze this meal":"Analyser ce repas"):(t("lang_label")==="en"?"Analyze this photo":"Analyser cette photo")}
      </button>
      <button className="bgh" onClick={onRetake}>{t("back")}</button>
    </div>
  );
}

// ─── ANALYZING ───
function Analyzing({zone,isMeal,t}) {
  const [dots,setDots] = useState(".");
  useEffect(()=>{const i=setInterval(()=>setDots(d=>d.length>=3?".":"d"+"."),500);return()=>clearInterval(i);},[]);
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:24,animation:"floatY 2s ease-in-out infinite"}}>{isMeal?"🍽️":zone?.icon||"🔬"}</div>
      <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:8}}>{t("analyzing_title")}</div>
      <div style={{color:MUT,fontSize:14,marginBottom:32}}>{t("analyzing_sub")}</div>
      <div style={{display:"flex",gap:8,marginBottom:32}}>
        {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:EM,animation:`pulse 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
      </div>
      <div style={{background:"#0c1810",border:`1px solid ${BDR}`,borderRadius:12,padding:"10px 16px",fontSize:12,color:MUT}}>{t("analyzing_disclaimer")}</div>
    </div>
  );
}

// ─── CHAT IA ───
function ChatIA({result,zone,profile,onClose,t}) {
  const [msgs,setMsgs] = useState([{role:"assistant",text:t("chat_welcome")}]);
  const [input,setInput] = useState("");
  const [load,setLoad] = useState(false);
  const endRef = useRef();

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send = async () => {
    if(!input.trim()||load)return;
    const userMsg = {role:"user",text:input.trim()};
    setMsgs(m=>[...m,userMsg]);
    setInput("");
    setLoad(true);
    try {
      const ctx = `Zone: ${zone?.label}. Score: ${result?.score}/100. Carences: ${result?.carences?.map(c=>c.nom).join(", ")||"aucune"}. Conseil: ${result?.conseil||""}. Profil: ${profile?JSON.stringify(profile):"non renseigné"}.`;
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:300,system:CHAT_SYSTEM,messages:[{role:"user",content:`${ctx}\n\nQuestion: ${userMsg.text}`}]})
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("")||"";
      setMsgs(m=>[...m,{role:"assistant",text:reply}]);
    } catch(e) { setMsgs(m=>[...m,{role:"assistant",text:t("error")}]); }
    finally { setLoad(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:"#060d08",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
      <div style={{padding:"52px 18px 14px",background:"#0c1810",borderBottom:`1px solid ${BDR}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontWeight:700,fontSize:15}}>{t("chat_title")}</div>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${BDR}`,borderRadius:8,padding:"6px 12px",color:MUT,fontSize:12,cursor:"pointer"}}>{t("back")}</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            <div style={{maxWidth:"80%",background:m.role==="user"?`${EM}20`:CARD,border:`1px solid ${m.role==="user"?EM:BDR}`,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.6,color:m.role==="user"?EM:"#edf5ef"}}>
              {m.text}
            </div>
          </div>
        ))}
        {load&&<div style={{display:"flex",gap:6,padding:"0 4px"}}>
          {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:EM,animation:`pulse 1s ${i*.2}s ease infinite`}}/>)}
        </div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"12px 18px",background:CARD,borderTop:`1px solid ${BDR}`,display:"flex",gap:10}}>
        <input className="inp" value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={t("chat_placeholder")} style={{flex:1,padding:"12px 16px"}}/>
        <button onClick={send} disabled={!input.trim()||load}
          style={{background:EM,border:"none",borderRadius:12,padding:"12px 16px",fontSize:18,cursor:"pointer",opacity:!input.trim()||load?.5:1}}>→</button>
      </div>
    </div>
  );
}

// ─── RÉSULTAT CORPOREL ───
async function shareResult(result,zone,t) {
  const text=`🌿 VitaScann Report\n\n${zone.icon} ${zone.label}\nScore: ${result.score}/100\n${result.type_analyse==="body_fat"?`Fat: ${result.pct_gras_estime}%`:result.type_analyse==="beard"?`Viking Potential: ${result.potentiel_viking} 🪓`:""}\n\n💬 ${result.conseil||""}\n\n🔬 vitascann.vercel.app`;
  if(navigator.share){await navigator.share({title:"VitaScann",text,url:"https://vitascann.vercel.app"}).catch(()=>{});}
  else{await navigator.clipboard.writeText(text);alert("📋 Copied!");}
}

async function generatePDF(result,zone,user) {
  const {jsPDF}=await import("jspdf");
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,MARGIN=18,COL=W-MARGIN*2;let y=0;
  const GREEN=[0,200,100],GOLDC=[220,175,60],DARK=[6,13,8],WHITE=[237,245,239],GRAY=[74,110,82],RED=[255,85,85],ORANGE=[255,170,51],PURPLE=[192,132,252];
  const rgb=c=>doc.setTextColor(...c);const fill=c=>doc.setFillColor(...c);const line=c=>doc.setDrawColor(...c);
  fill(DARK);doc.rect(0,0,W,297,"F");fill([0,30,15]);doc.rect(0,0,W,44,"F");
  doc.setFontSize(26);doc.setFont("helvetica","bold");rgb(WHITE);doc.text("VitaScann",MARGIN+4,16);
  doc.setFontSize(9);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("NUTRITIONAL INTELLIGENCE",MARGIN+4,22);
  const now=new Date();
  doc.setFontSize(8);rgb(GRAY);doc.text(`Report generated ${now.toLocaleDateString()}`,W-MARGIN,12,{align:"right"});
  doc.text(`User: ${user?.name||"User"}`,W-MARGIN,18,{align:"right"});
  const isPremium=user?.plan==="premium";fill(isPremium?GOLDC:GREEN);doc.roundedRect(W-MARGIN-28,24,28,8,2,2,"F");
  doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(DARK);doc.text(isPremium?"PREMIUM":"FREE",W-MARGIN-14,29.5,{align:"center"});
  y=50;fill([12,24,16]);doc.roundedRect(MARGIN,y,COL,28,3,3,"F");line(GREEN);doc.setLineWidth(0.3);doc.roundedRect(MARGIN,y,COL,28,3,3,"S");
  doc.setFontSize(8);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("ANALYZED ZONE",MARGIN+8,y+7);
  doc.setFontSize(14);doc.setFont("helvetica","bold");rgb(WHITE);doc.text(`${zone?.label||""}`,MARGIN+8,y+17);
  const score=result?.score||0;const sc2=score>=75?GREEN:score>=50?ORANGE:RED;
  fill(sc2);doc.circle(W-MARGIN-20,y+14,12,"F");doc.setFontSize(14);doc.setFont("helvetica","bold");rgb(DARK);doc.text(`${score}`,W-MARGIN-20,y+15.5,{align:"center"});
  doc.setFontSize(6);doc.text("/100",W-MARGIN-20,y+20,{align:"center"});
  y+=35;
  if(result?.carences?.length>0){
    doc.setFontSize(10);doc.setFont("helvetica","bold");rgb(WHITE);doc.text("Identified deficiencies",MARGIN,y);y+=6;
    result.carences.forEach(c=>{
      if(y>250){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
      const nc=c.niveau==="critique"?RED:c.niveau==="faible"?ORANGE:c.niveau==="limite"?[251,191,36]:GREEN;
      fill([12,24,16]);doc.roundedRect(MARGIN,y,COL,38,3,3,"F");line(nc);doc.setLineWidth(0.4);doc.roundedRect(MARGIN,y,COL,38,3,3,"S");
      fill(nc);doc.roundedRect(MARGIN,y,3,38,1,1,"F");
      doc.setFontSize(11);doc.setFont("helvetica","bold");rgb(WHITE);doc.text(`${c.nom}`,MARGIN+8,y+9);
      fill(nc);doc.roundedRect(W-MARGIN-30,y+3,28,7,2,2,"F");doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(DARK);doc.text((c.niveau||"").toUpperCase(),W-MARGIN-16,y+8,{align:"center"});
      doc.setFontSize(8);doc.setFont("helvetica","normal");rgb([176,200,184]);doc.text(doc.splitTextToSize(c.signes||"",COL-16),MARGIN+8,y+17);
      fill([20,32,24]);doc.roundedRect(MARGIN+8,y+21,COL-16,3,1,1,"F");fill(nc);doc.roundedRect(MARGIN+8,y+21,(COL-16)*((c.pct||50)/100),3,1,1,"F");
      doc.setFontSize(7);doc.setFont("helvetica","bold");rgb(GREEN);doc.text(`Foods: ${(c.aliments||[]).slice(0,4).join(" - ")}`,MARGIN+8,y+29);
      if(c.complement){rgb(PURPLE);doc.text(`Supplement: ${c.complement}${c.dose?" — "+c.dose:""}`,MARGIN+8,y+36);}
      y+=44;
    });
  }
  if(result?.conseil){
    if(y>240){doc.addPage();fill(DARK);doc.rect(0,0,W,297,"F");y=20;}
    const cl=doc.splitTextToSize(result.conseil,COL-12);const cH=12+cl.length*6;
    fill([24,16,6]);doc.roundedRect(MARGIN,y,COL,cH,3,3,"F");line(GOLDC);doc.setLineWidth(0.3);doc.roundedRect(MARGIN,y,COL,cH,3,3,"S");
    doc.setFontSize(8);doc.setFont("helvetica","bold");rgb(GOLDC);doc.text("PERSONALIZED ADVICE",MARGIN+6,y+6);
    doc.setFontSize(8.5);doc.setFont("helvetica","normal");rgb([160,188,170]);doc.text(cl,MARGIN+6,y+13);y+=cH+6;
  }
  const pc=doc.getNumberOfPages();
  for(let i=1;i<=pc;i++){doc.setPage(i);fill([0,20,10]);doc.rect(0,285,W,12,"F");doc.setFontSize(7);doc.setFont("helvetica","normal");rgb(GRAY);doc.text("vitascann.vercel.app",MARGIN,291);doc.text(`Page ${i} / ${pc}`,W/2,291,{align:"center"});doc.text("© 2026 VitaScann",W-MARGIN,291,{align:"right"});}
  doc.save(`VitaScann_${zone?.label||"report"}_${now.toISOString().slice(0,10)}.pdf`);
}

function Result({result,zone,user,profile,onNewScan,onHome,onExercises,history,t,lang}) {
  const [exp,setExp]=useState(null);
  const [sharing,setSharing]=useState(false);
  const [showChat,setShowChat]=useState(false);
  const [showReward,setShowReward]=useState(null);
  const uc=result?.urgence==="urgent"?DANGER:result?.urgence==="attention"?WARN:EM;
  const isBodyFat=result?.type_analyse==="body_fat";
  const isBeard=result?.type_analyse==="beard";
  const isTeeth=result?.type_analyse==="teeth";
  const xpEarned = getXpForScan(result?.score||0);
  const totalScans = history?.length||0;
  const totalXp = totalScans * 20 + xpEarned;
  const currentLevel = getLevel(totalXp);
  const streak = calcStreak(history||[]);
  const milestone = MILESTONES.find(m => m.scans === totalScans);

  useEffect(()=>{
    if(milestone && (milestone.reward==="week"||milestone.reward==="month")){
      const timer = setTimeout(()=>setShowReward(milestone.reward), 1200);
      return ()=>clearTimeout(timer);
    }
  },[milestone]);

  return (
    <>
    {showReward&&<RewardPopup reward={showReward} onClose={()=>setShowReward(null)} t={t} lang={lang}/>}
    <XpBadge xp={xpEarned} level={currentLevel} streak={streak} t={t}/>
    {showChat&&<ChatIA result={result} zone={zone} profile={profile} onClose={()=>setShowChat(false)} t={t}/>}
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 22px",background:"radial-gradient(ellipse at 50% 0%,#071c0c 0%,#060d08 70%)"}}>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="serif" style={{fontSize:22,fontWeight:700}}>{t("result_title")}</div>
          <span style={{background:`${uc}14`,color:uc,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
            {result?.urgence==="urgent"?t("result_urgent"):result?.urgence==="attention"?t("result_attention"):t("result_normal")}
          </span>
        </div>
        <div className="fu1" style={{display:"flex",alignItems:"center",gap:18}}>
          <ScoreRing score={result?.score||0} size={110}/>
          <div>
            <div style={{color:MUT,fontSize:11,marginBottom:3}}>{t("result_zone")}</div>
            <div style={{fontWeight:700,fontSize:15}}>{zone.icon} {zone.label}</div>
            {isBodyFat?(
              <>
                <div style={{color:MUT,fontSize:11,marginTop:8}}>{t("result_body_fat_label")}</div>
                <div style={{color:"#f97316",fontWeight:700,fontSize:24}}>{result.pct_gras_estime}<span style={{fontSize:13}}>%</span></div>
              </>
            ):isBeard?(
              <>
                <div style={{color:MUT,fontSize:11,marginTop:8}}>{t("result_viking")}</div>
                <div style={{color:VIKING,fontWeight:700,fontSize:16}}>🪓 {result.potentiel_viking}</div>
              </>
            ):(
              <>
                <div style={{color:MUT,fontSize:11,marginTop:8}}>{t("result_deficiencies")}</div>
                <div style={{color:result?.carences?.length>0?DANGER:EM,fontWeight:700,fontSize:24}}>{result?.carences?.length||0}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{padding:"0 18px"}}>
        {isBodyFat&&(
          <div className="fu2 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>{t("result_body_comp")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:"#0a140c",borderRadius:12,padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:700,color:"#f97316"}}>{result.pct_gras_estime}<span style={{fontSize:14}}>%</span></div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{t("result_body_fat")}</div>
              </div>
              <div style={{background:"#0a140c",borderRadius:12,padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:700,color:result.abdos_visibles==="oui"?EM:result.abdos_visibles==="partiellement"?WARN:MUT}}>
                  {result.abdos_visibles==="oui"?"✅":result.abdos_visibles==="partiellement"?"〰️":"❌"}
                </div>
                <div style={{fontSize:11,color:MUT,marginTop:2}}>{t("result_abs")}</div>
              </div>
            </div>
            {[[t("result_category"),"#f97316",result.categorie_gras],[t("result_morpho"),EM,result.morphologie]].map(([l,c,v])=>v&&(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a140c",borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                <span style={{fontSize:12,color:MUT}}>{l}</span>
                <span style={{fontWeight:700,fontSize:13,color:c,textTransform:"capitalize"}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {isBeard&&(
          <div className="fu2 card" style={{marginBottom:14,border:`1px solid ${VIKING}33`}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:14,color:VIKING}}>{t("result_beard_title")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:"#0a0514",borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:VIKING,textTransform:"capitalize"}}>{result.densite||"?"}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{t("result_density")}</div>
              </div>
              <div style={{background:"#0a0514",borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:GOLD}}>🪓 {result.potentiel_viking}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{t("result_viking_potential")}</div>
              </div>
            </div>
            {result.zones_clairsemees?.length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:MUT,marginBottom:6}}>{t("result_sparse")}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {result.zones_clairsemees.map(z=><span key={z} style={{background:`${WARN}14`,color:WARN,borderRadius:20,padding:"3px 10px",fontSize:11}}>{z}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {(isBeard||isTeeth)&&result?.astuces_grand_mere?.length>0&&(
          <div className="fu3 card" style={{marginBottom:14,border:`1px solid ${isBeard?VIKING:EM}33`}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:isBeard?VIKING:EM}}>
              {isBeard?t("result_grandma_beard"):t("result_grandma_teeth")}
            </div>
            {result.astuces_grand_mere.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:i<result.astuces_grand_mere.length-1?10:0,paddingBottom:i<result.astuces_grand_mere.length-1?10:0,borderBottom:i<result.astuces_grand_mere.length-1?`1px solid ${BDR}`:"none"}}>
                <div style={{width:28,height:28,borderRadius:8,background:isBeard?`${VIKING}15`:`${EM}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isBeard?"🪓":"🌿"}</div>
                <div style={{fontSize:12,color:"#b0c8b8",lineHeight:1.6,paddingTop:4}}>{a}</div>
              </div>
            ))}
          </div>
        )}

        {result?.carences?.length>0&&(
          <div className="fu2 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>
              {isBodyFat?t("result_nutrients_body"):isBeard?t("result_nutrients_beard"):isTeeth?t("result_nutrients_teeth"):t("result_deficiencies_found")}
            </div>
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
                  {exp===i?t("result_hide"):t("result_show")}
                </button>
                {exp===i&&(
                  <div style={{marginTop:10}}>
                    {c.aliments?.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:EM,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:6}}>{t("result_food")}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {c.aliments.map(a=><span key={a} style={{background:`${EM}12`,color:EM,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600}}>{a}</span>)}
                        </div>
                      </div>
                    )}
                    {c.complement&&(
                      <div style={{background:"#14102a",border:"1px solid #2a1f50",borderRadius:12,padding:"10px 13px"}}>
                        <div style={{color:"#c084fc",fontSize:10,fontWeight:700,marginBottom:3}}>{t("result_supplement")}</div>
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
          <div className="fu3 card" style={{marginBottom:14,border:`1px solid ${EM}22`}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:EM}}>{t("result_positives")}</div>
            {result.positifs.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<result.positifs.length-1?8:0,fontSize:13,color:"#a0bcaa"}}>
                <span style={{color:EM}}>✓</span>{p}
              </div>
            ))}
          </div>
        )}

        {result?.conseil&&(
          <div className="fu4 card" style={{border:`1px solid ${GOLD}28`,marginBottom:14}}>
            <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:7}}>{t("result_advice")}</div>
            <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>{result.conseil}</div>
          </div>
        )}

        <IslamicTipsCard zone={zone} profile={profile} t={t} lang={lang}/>

        {onExercises&&(
          <button onClick={onExercises} style={{width:"100%",background:`linear-gradient(135deg,#0a1a0c,#121008)`,border:`1.5px solid ${EM}44`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            💪 {lang==="en"?"Personalized exercises +15 🪙":"Exercices personnalisés +15 🪙"}
          </button>
        )}

        <div style={{background:"#120f06",border:"1px solid #2a2010",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#806040",lineHeight:1.6,marginBottom:16}}>
          {t("result_disclaimer")}
        </div>

        <button onClick={()=>setShowChat(true)} style={{width:"100%",background:`${EM}10`,border:`1.5px solid ${EM}44`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10}}>
          {t("result_chat")}
        </button>
        <button onClick={async()=>{setSharing(true);await shareResult(result,zone,t);setSharing(false);}}
          style={{width:"100%",background:"linear-gradient(135deg,#1a2e20,#0f1e14)",border:`1.5px solid ${EM}55`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {sharing?<Spin/>:t("result_share")}
        </button>
        {user?.plan==="premium"&&(
          <button onClick={()=>generatePDF(result,zone,user)}
            style={{width:"100%",background:"linear-gradient(135deg,#18100a,#100a06)",border:`1.5px solid ${GOLD}44`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:GOLD,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {t("result_pdf")}
          </button>
        )}
        <button className="bem" onClick={onNewScan} style={{marginBottom:10}}>{t("result_new_scan")}</button>
        <button className="bgh" onClick={onHome}>{t("result_home")}</button>
      </div>
    </div>
    </>
  );
}

// ─── MEAL RESULT ───
// ─── PROGRESSION ───
// ─── CAPTURE REPAS ───
// Base nutritionnelle pour calcul précis (pour 100g)
const FOOD_DB = {
  // ── FÉCULENTS & CÉRÉALES ──
  "riz cuit":              {cal:130, prot:2.7, gluc:28,  lip:0.3, fer:0.2, vitD:0,   potass:35,  zinc:0.6, vitC:0,  calcium:10,  magnes:12,  fibres:0.4},
  "riz basmati":           {cal:121, prot:2.5, gluc:25,  lip:0.4, fer:0.2, vitD:0,   potass:30,  zinc:0.5, vitC:0,  calcium:8,   magnes:10,  fibres:0.4},
  "riz brun":              {cal:112, prot:2.6, gluc:24,  lip:0.9, fer:0.5, vitD:0,   potass:43,  zinc:0.6, vitC:0,  calcium:10,  magnes:44,  fibres:1.8},
  "pates cuites":          {cal:158, prot:5.8, gluc:31,  lip:0.9, fer:0.5, vitD:0,   potass:45,  zinc:0.5, vitC:0,  calcium:7,   magnes:18,  fibres:1.8},
  "pates completes":       {cal:149, prot:5.5, gluc:29,  lip:1.1, fer:1.3, vitD:0,   potass:81,  zinc:1.1, vitC:0,  calcium:21,  magnes:47,  fibres:3.9},
  "pain":                  {cal:265, prot:9,   gluc:49,  lip:3.2, fer:2.5, vitD:0,   potass:115, zinc:0.8, vitC:0,  calcium:54,  magnes:23,  fibres:2.7},
  "pain complet":          {cal:247, prot:13,  gluc:41,  lip:4.2, fer:3.9, vitD:0,   potass:248, zinc:1.8, vitC:0,  calcium:73,  magnes:76,  fibres:7},
  "pomme de terre":        {cal:77,  prot:2,   gluc:17,  lip:0.1, fer:0.3, vitD:0,   potass:421, zinc:0.3, vitC:19, calcium:12,  magnes:23,  fibres:2.2},
  "patate douce":          {cal:86,  prot:1.6, gluc:20,  lip:0.1, fer:0.6, vitD:0,   potass:337, zinc:0.3, vitC:19, calcium:30,  magnes:25,  fibres:3},
  "couscous":              {cal:112, prot:3.8, gluc:23,  lip:0.2, fer:0.4, vitD:0,   potass:58,  zinc:0.3, vitC:0,  calcium:8,   magnes:8,   fibres:1.4},
  "quinoa cuit":           {cal:120, prot:4.4, gluc:21,  lip:1.9, fer:1.5, vitD:0,   potass:172, zinc:1.1, vitC:0,  calcium:17,  magnes:64,  fibres:2.8},
  "flocons davoine":       {cal:389, prot:17,  gluc:66,  lip:7,   fer:4.7, vitD:0,   potass:429, zinc:4,   vitC:0,  calcium:54,  magnes:177, fibres:10.6},
  "lentilles":             {cal:116, prot:9,   gluc:20,  lip:0.4, fer:3.3, vitD:0,   potass:369, zinc:1.3, vitC:1,  calcium:19,  magnes:36,  fibres:7.9},
  "pois chiches":          {cal:164, prot:8.9, gluc:27,  lip:2.6, fer:2.9, vitD:0,   potass:291, zinc:1.5, vitC:1,  calcium:49,  magnes:48,  fibres:7.6},
  "haricots rouges":       {cal:127, prot:8.7, gluc:22,  lip:0.5, fer:2.9, vitD:0,   potass:405, zinc:1.1, vitC:2,  calcium:28,  magnes:45,  fibres:7.4},
  "haricots noirs":        {cal:132, prot:8.9, gluc:24,  lip:0.5, fer:3.6, vitD:0,   potass:355, zinc:1.9, vitC:0,  calcium:27,  magnes:70,  fibres:8.7},
  "feves":                 {cal:88,  prot:7.6, gluc:15,  lip:0.4, fer:1.5, vitD:0,   potass:250, zinc:1,   vitC:1,  calcium:36,  magnes:43,  fibres:5.4},
  "pain pita":             {cal:275, prot:9.1, gluc:56,  lip:1.2, fer:1.4, vitD:0,   potass:120, zinc:0.9, vitC:0,  calcium:86,  magnes:26,  fibres:2.2},
  // ── VIANDES ──
  "poulet":                {cal:165, prot:31,  gluc:0,   lip:3.6, fer:1,   vitD:0.1, potass:256, zinc:1,   vitC:0,  calcium:15,  magnes:29,  fibres:0},
  "poulet roti":           {cal:190, prot:28,  gluc:0,   lip:8,   fer:1.1, vitD:0.1, potass:243, zinc:1.8, vitC:0,  calcium:15,  magnes:26,  fibres:0},
  "blanc de poulet":       {cal:110, prot:23,  gluc:0,   lip:1.2, fer:0.7, vitD:0.1, potass:220, zinc:0.9, vitC:0,  calcium:11,  magnes:25,  fibres:0},
  "boeuf hache":           {cal:254, prot:17,  gluc:0,   lip:20,  fer:2.6, vitD:0.1, potass:270, zinc:4.8, vitC:0,  calcium:18,  magnes:20,  fibres:0},
  "steak boeuf":           {cal:217, prot:26,  gluc:0,   lip:12,  fer:2.9, vitD:0.1, potass:318, zinc:5.4, vitC:0,  calcium:18,  magnes:25,  fibres:0},
  "agneau":                {cal:294, prot:25,  gluc:0,   lip:21,  fer:1.9, vitD:0.1, potass:310, zinc:4.5, vitC:0,  calcium:17,  magnes:23,  fibres:0},
  "veau":                  {cal:172, prot:24,  gluc:0,   lip:8,   fer:1,   vitD:0.1, potass:330, zinc:3.7, vitC:0,  calcium:20,  magnes:26,  fibres:0},
  "dinde":                 {cal:189, prot:29,  gluc:0,   lip:7,   fer:1.8, vitD:0.1, potass:298, zinc:2.7, vitC:0,  calcium:22,  magnes:28,  fibres:0},
  "kefta":                 {cal:240, prot:18,  gluc:2,   lip:18,  fer:2.4, vitD:0,   potass:260, zinc:4,   vitC:1,  calcium:30,  magnes:22,  fibres:0.2},
  "merguez":               {cal:320, prot:14,  gluc:1,   lip:29,  fer:2,   vitD:0,   potass:210, zinc:3.2, vitC:0,  calcium:20,  magnes:18,  fibres:0},
  // ── POISSONS ──
  "saumon":                {cal:208, prot:20,  gluc:0,   lip:13,  fer:0.8, vitD:16,  potass:363, zinc:0.6, vitC:3,  calcium:12,  magnes:29,  fibres:0},
  "thon":                  {cal:132, prot:29,  gluc:0,   lip:1,   fer:1.3, vitD:5.4, potass:441, zinc:0.9, vitC:0,  calcium:10,  magnes:35,  fibres:0},
  "thon en boite":         {cal:116, prot:26,  gluc:0,   lip:1,   fer:1.4, vitD:3.8, potass:207, zinc:0.9, vitC:0,  calcium:11,  magnes:31,  fibres:0},
  "sardines":              {cal:208, prot:25,  gluc:0,   lip:11,  fer:2.9, vitD:4.8, potass:397, zinc:1.4, vitC:0,  calcium:382, magnes:39,  fibres:0},
  "maquereau":             {cal:205, prot:19,  gluc:0,   lip:14,  fer:1.6, vitD:4.2, potass:314, zinc:0.9, vitC:0,  calcium:12,  magnes:60,  fibres:0},
  "crevettes":             {cal:99,  prot:24,  gluc:0.2, lip:0.3, fer:0.5, vitD:0,   potass:182, zinc:1.1, vitC:2,  calcium:52,  magnes:35,  fibres:0},
  "cabillaud":             {cal:82,  prot:18,  gluc:0,   lip:0.7, fer:0.4, vitD:1,   potass:413, zinc:0.5, vitC:1,  calcium:16,  magnes:32,  fibres:0},
  // ── OEUFS ──
  "oeuf":                  {cal:155, prot:13,  gluc:1.1, lip:11,  fer:1.8, vitD:2,   potass:138, zinc:1.3, vitC:0,  calcium:56,  magnes:12,  fibres:0},
  "oeufs":                 {cal:155, prot:13,  gluc:1.1, lip:11,  fer:1.8, vitD:2,   potass:138, zinc:1.3, vitC:0,  calcium:56,  magnes:12,  fibres:0},
  "oeuf entier":           {cal:155, prot:13,  gluc:1.1, lip:11,  fer:1.8, vitD:2,   potass:138, zinc:1.3, vitC:0,  calcium:56,  magnes:12,  fibres:0},
  "blanc oeuf":            {cal:52,  prot:11,  gluc:0.7, lip:0.2, fer:0.1, vitD:0,   potass:163, zinc:0.3, vitC:0,  calcium:7,   magnes:11,  fibres:0},
  "jaune oeuf":            {cal:322, prot:16,  gluc:3.6, lip:27,  fer:2.7, vitD:3.3, potass:109, zinc:2.8, vitC:0,  calcium:129, magnes:13,  fibres:0},
  "oeufs brouilles":       {cal:149, prot:10,  gluc:1.5, lip:11,  fer:1.5, vitD:1.5, potass:132, zinc:1.1, vitC:0,  calcium:75,  magnes:11,  fibres:0},
  "omelette":              {cal:154, prot:11,  gluc:0.5, lip:12,  fer:1.5, vitD:1.8, potass:140, zinc:1.2, vitC:0,  calcium:60,  magnes:12,  fibres:0},
  // ── LÉGUMES ──
  "avocat":                {cal:160, prot:2,   gluc:9,   lip:15,  fer:0.6, vitD:0,   potass:485, zinc:0.6, vitC:10, calcium:12,  magnes:29,  fibres:6.7},
  "avocats":               {cal:160, prot:2,   gluc:9,   lip:15,  fer:0.6, vitD:0,   potass:485, zinc:0.6, vitC:10, calcium:12,  magnes:29,  fibres:6.7},
  "tomate":                {cal:18,  prot:0.9, gluc:3.9, lip:0.2, fer:0.3, vitD:0,   potass:237, zinc:0.2, vitC:14, calcium:10,  magnes:11,  fibres:1.2},
  "epinards":              {cal:23,  prot:2.9, gluc:3.6, lip:0.4, fer:2.7, vitD:0,   potass:558, zinc:0.5, vitC:28, calcium:99,  magnes:79,  fibres:2.2},
  "carottes":              {cal:41,  prot:0.9, gluc:9.6, lip:0.2, fer:0.3, vitD:0,   potass:320, zinc:0.2, vitC:6,  calcium:33,  magnes:12,  fibres:2.8},
  "courgette":             {cal:17,  prot:1.2, gluc:3.1, lip:0.3, fer:0.4, vitD:0,   potass:261, zinc:0.3, vitC:17, calcium:16,  magnes:18,  fibres:1},
  "salade verte":          {cal:15,  prot:1.4, gluc:2.2, lip:0.2, fer:0.9, vitD:0,   potass:194, zinc:0.2, vitC:9,  calcium:36,  magnes:13,  fibres:1.3},
  "oignon":                {cal:40,  prot:1.1, gluc:9.3, lip:0.1, fer:0.2, vitD:0,   potass:146, zinc:0.2, vitC:7,  calcium:23,  magnes:10,  fibres:1.7},
  "poivron":               {cal:31,  prot:1,   gluc:6,   lip:0.3, fer:0.4, vitD:0,   potass:211, zinc:0.3, vitC:128,calcium:10,  magnes:12,  fibres:2.1},
  "poivron rouge":         {cal:31,  prot:1,   gluc:6,   lip:0.3, fer:0.5, vitD:0,   potass:211, zinc:0.3, vitC:190,calcium:10,  magnes:12,  fibres:2.1},
  "brocoli":               {cal:34,  prot:2.8, gluc:7,   lip:0.4, fer:0.7, vitD:0,   potass:316, zinc:0.4, vitC:89, calcium:47,  magnes:21,  fibres:2.6},
  "chou-fleur":            {cal:25,  prot:1.9, gluc:5,   lip:0.3, fer:0.4, vitD:0,   potass:299, zinc:0.3, vitC:48, calcium:22,  magnes:15,  fibres:2},
  "concombre":             {cal:16,  prot:0.7, gluc:3.6, lip:0.1, fer:0.3, vitD:0,   potass:147, zinc:0.2, vitC:3,  calcium:16,  magnes:13,  fibres:0.5},
  "celeri":                {cal:16,  prot:0.7, gluc:3,   lip:0.2, fer:0.2, vitD:0,   potass:260, zinc:0.1, vitC:3,  calcium:40,  magnes:11,  fibres:1.6},
  "aubergine":             {cal:25,  prot:1,   gluc:6,   lip:0.2, fer:0.2, vitD:0,   potass:229, zinc:0.2, vitC:2,  calcium:9,   magnes:14,  fibres:3},
  "champignons":           {cal:22,  prot:3.1, gluc:3.3, lip:0.3, fer:0.5, vitD:0.2, potass:318, zinc:0.5, vitC:2,  calcium:3,   magnes:9,   fibres:1},
  "ail":                   {cal:149, prot:6.4, gluc:33,  lip:0.5, fer:1.7, vitD:0,   potass:401, zinc:1.2, vitC:31, calcium:181, magnes:25,  fibres:2.1},
  "gingembre":             {cal:80,  prot:1.8, gluc:18,  lip:0.8, fer:0.6, vitD:0,   potass:415, zinc:0.3, vitC:5,  calcium:16,  magnes:43,  fibres:2},
  "petits pois":           {cal:81,  prot:5.4, gluc:14,  lip:0.4, fer:1.5, vitD:0,   potass:244, zinc:1.2, vitC:40, calcium:25,  magnes:33,  fibres:5.1},
  "mais":                  {cal:96,  prot:3.4, gluc:21,  lip:1.5, fer:0.5, vitD:0,   potass:270, zinc:0.5, vitC:7,  calcium:3,   magnes:37,  fibres:2.4},
  "chou":                  {cal:25,  prot:1.3, gluc:6,   lip:0.1, fer:0.5, vitD:0,   potass:170, zinc:0.2, vitC:36, calcium:40,  magnes:12,  fibres:2.5},
  "poireau":               {cal:61,  prot:1.5, gluc:14,  lip:0.3, fer:2.1, vitD:0,   potass:180, zinc:0.1, vitC:12, calcium:59,  magnes:28,  fibres:1.8},
  "betterave":             {cal:43,  prot:1.6, gluc:10,  lip:0.2, fer:0.8, vitD:0,   potass:325, zinc:0.4, vitC:5,  calcium:16,  magnes:23,  fibres:2.8},
  // ── FRUITS ──
  "banane":                {cal:89,  prot:1.1, gluc:23,  lip:0.3, fer:0.3, vitD:0,   potass:358, zinc:0.2, vitC:9,  calcium:5,   magnes:27,  fibres:2.6},
  "pomme":                 {cal:52,  prot:0.3, gluc:14,  lip:0.2, fer:0.1, vitD:0,   potass:107, zinc:0.04,vitC:5,  calcium:6,   magnes:5,   fibres:2.4},
  "orange":                {cal:47,  prot:0.9, gluc:12,  lip:0.1, fer:0.1, vitD:0,   potass:181, zinc:0.1, vitC:53, calcium:40,  magnes:10,  fibres:2.4},
  "datte":                 {cal:282, prot:2.5, gluc:75,  lip:0.4, fer:1,   vitD:0,   potass:696, zinc:0.4, vitC:0,  calcium:64,  magnes:54,  fibres:8},
  "dattes":                {cal:282, prot:2.5, gluc:75,  lip:0.4, fer:1,   vitD:0,   potass:696, zinc:0.4, vitC:0,  calcium:64,  magnes:54,  fibres:8},
  "mangue":                {cal:60,  prot:0.8, gluc:15,  lip:0.4, fer:0.2, vitD:0,   potass:168, zinc:0.1, vitC:36, calcium:11,  magnes:10,  fibres:1.6},
  "fraises":               {cal:32,  prot:0.7, gluc:7.7, lip:0.3, fer:0.4, vitD:0,   potass:153, zinc:0.1, vitC:59, calcium:16,  magnes:13,  fibres:2},
  "myrtilles":             {cal:57,  prot:0.7, gluc:14,  lip:0.3, fer:0.3, vitD:0,   potass:77,  zinc:0.2, vitC:10, calcium:6,   magnes:6,   fibres:2.4},
  "raisins":               {cal:69,  prot:0.7, gluc:18,  lip:0.2, fer:0.4, vitD:0,   potass:191, zinc:0.1, vitC:4,  calcium:10,  magnes:7,   fibres:0.9},
  "pasteque":              {cal:30,  prot:0.6, gluc:7.6, lip:0.2, fer:0.2, vitD:0,   potass:112, zinc:0.1, vitC:8,  calcium:7,   magnes:10,  fibres:0.4},
  "kiwi":                  {cal:61,  prot:1.1, gluc:15,  lip:0.5, fer:0.3, vitD:0,   potass:312, zinc:0.1, vitC:93, calcium:34,  magnes:17,  fibres:3},
  "ananas":                {cal:50,  prot:0.5, gluc:13,  lip:0.1, fer:0.3, vitD:0,   potass:109, zinc:0.1, vitC:48, calcium:13,  magnes:12,  fibres:1.4},
  "citron":                {cal:29,  prot:1.1, gluc:9,   lip:0.3, fer:0.6, vitD:0,   potass:138, zinc:0.1, vitC:53, calcium:26,  magnes:8,   fibres:2.8},
  "poire":                 {cal:57,  prot:0.4, gluc:15,  lip:0.1, fer:0.2, vitD:0,   potass:116, zinc:0.1, vitC:5,  calcium:9,   magnes:7,   fibres:3.1},
  "peche":                 {cal:39,  prot:0.9, gluc:10,  lip:0.3, fer:0.3, vitD:0,   potass:190, zinc:0.2, vitC:7,  calcium:6,   magnes:9,   fibres:1.5},
  "grenade":               {cal:83,  prot:1.7, gluc:19,  lip:1.2, fer:0.3, vitD:0,   potass:236, zinc:0.4, vitC:10, calcium:10,  magnes:12,  fibres:4},
  "figue":                 {cal:74,  prot:0.8, gluc:19,  lip:0.3, fer:0.4, vitD:0,   potass:232, zinc:0.2, vitC:2,  calcium:35,  magnes:17,  fibres:3},
  "abricot":               {cal:48,  prot:1.4, gluc:11,  lip:0.4, fer:0.4, vitD:0,   potass:259, zinc:0.2, vitC:10, calcium:13,  magnes:10,  fibres:2},
  // ── PRODUITS LAITIERS ──
  "yaourt nature":         {cal:61,  prot:3.5, gluc:4.7, lip:3.3, fer:0.1, vitD:0.1, potass:155, zinc:0.5, vitC:0,  calcium:121, magnes:12,  fibres:0},
  "yaourt grec":           {cal:97,  prot:9,   gluc:3.6, lip:5,   fer:0.1, vitD:0.1, potass:141, zinc:0.5, vitC:0,  calcium:100, magnes:11,  fibres:0},
  "fromage":               {cal:402, prot:25,  gluc:1.3, lip:33,  fer:0.7, vitD:0.4, potass:98,  zinc:3.1, vitC:0,  calcium:721, magnes:28,  fibres:0},
  "fromage blanc":         {cal:73,  prot:8,   gluc:4,   lip:3,   fer:0.1, vitD:0.1, potass:90,  zinc:0.4, vitC:0,  calcium:95,  magnes:9,   fibres:0},
  "lait":                  {cal:61,  prot:3.2, gluc:4.8, lip:3.3, fer:0.1, vitD:1,   potass:150, zinc:0.4, vitC:1,  calcium:113, magnes:11,  fibres:0},
  "lait damande":          {cal:17,  prot:0.6, gluc:0.6, lip:1.5, fer:0.3, vitD:0.5, potass:67,  zinc:0.1, vitC:0,  calcium:120, magnes:6,   fibres:0.3},
  "beurre":                {cal:717, prot:0.9, gluc:0.1, lip:81,  fer:0,   vitD:1.5, potass:24,  zinc:0.1, vitC:0,  calcium:24,  magnes:2,   fibres:0},
  "creme fraiche":         {cal:292, prot:2.1, gluc:2.7, lip:30,  fer:0.1, vitD:0.3, potass:89,  zinc:0.2, vitC:1,  calcium:65,  magnes:7,   fibres:0},
  // ── NOIX & GRAINES ──
  "amandes":               {cal:579, prot:21,  gluc:22,  lip:50,  fer:3.7, vitD:0,   potass:733, zinc:3.1, vitC:0,  calcium:264, magnes:270, fibres:12.5},
  "noix":                  {cal:654, prot:15,  gluc:14,  lip:65,  fer:2.9, vitD:0,   potass:441, zinc:3.1, vitC:1,  calcium:98,  magnes:158, fibres:6.7},
  "noix de cajou":         {cal:553, prot:18,  gluc:30,  lip:44,  fer:6.7, vitD:0,   potass:660, zinc:5.8, vitC:1,  calcium:37,  magnes:292, fibres:3.3},
  "pistaches":             {cal:560, prot:20,  gluc:28,  lip:45,  fer:4,   vitD:0,   potass:1025,zinc:2.9, vitC:5,  calcium:105, magnes:121, fibres:10.3},
  "graines de chia":       {cal:486, prot:17,  gluc:42,  lip:31,  fer:7.7, vitD:0,   potass:407, zinc:4.6, vitC:1,  calcium:631, magnes:335, fibres:34.4},
  "graines de lin":        {cal:534, prot:18,  gluc:29,  lip:42,  fer:5.7, vitD:0,   potass:813, zinc:4.3, vitC:1,  calcium:255, magnes:392, fibres:27.3},
  "graines de sesame":     {cal:573, prot:18,  gluc:23,  lip:50,  fer:14.6,vitD:0,   potass:468, zinc:7.8, vitC:0,  calcium:975, magnes:351, fibres:11.8},
  "graines de tournesol":  {cal:584, prot:21,  gluc:20,  lip:51,  fer:5.3, vitD:0,   potass:645, zinc:5,   vitC:1,  calcium:78,  magnes:325, fibres:8.6},
  "arachides":             {cal:567, prot:26,  gluc:16,  lip:49,  fer:4.6, vitD:0,   potass:705, zinc:3.3, vitC:0,  calcium:92,  magnes:168, fibres:8.5},
  "beurre de cacahuete":   {cal:588, prot:25,  gluc:20,  lip:50,  fer:3,   vitD:0,   potass:649, zinc:3,   vitC:0,  calcium:49,  magnes:168, fibres:6},
  // ── MATIÈRES GRASSES & CONDIMENTS ──
  "huile dolive":          {cal:884, prot:0,   gluc:0,   lip:100, fer:0.6, vitD:0,   potass:1,   zinc:0,   vitC:0,  calcium:1,   magnes:0,   fibres:0},
  "huile de coco":         {cal:862, prot:0,   gluc:0,   lip:100, fer:0.1, vitD:0,   potass:1,   zinc:0,   vitC:0,  calcium:1,   magnes:0,   fibres:0},
  "sel":                   {cal:0,   prot:0,   gluc:0,   lip:0,   fer:0,   vitD:0,   potass:8,   zinc:0,   vitC:0,  calcium:24,  magnes:1,   fibres:0},
  "sucre":                 {cal:387, prot:0,   gluc:100, lip:0,   fer:0.1, vitD:0,   potass:2,   zinc:0,   vitC:0,  calcium:1,   magnes:0,   fibres:0},
  "miel":                  {cal:304, prot:0.3, gluc:82,  lip:0,   fer:0.4, vitD:0,   potass:52,  zinc:0.2, vitC:0,  calcium:6,   magnes:2,   fibres:0.2},
  "ketchup":               {cal:112, prot:1.7, gluc:27,  lip:0.2, fer:0.9, vitD:0,   potass:325, zinc:0.2, vitC:16, calcium:14,  magnes:17,  fibres:0.5},
  "mayonnaise":            {cal:680, prot:1,   gluc:0.6, lip:75,  fer:0.3, vitD:1.1, potass:20,  zinc:0.2, vitC:0,  calcium:12,  magnes:2,   fibres:0},
  "harissa":               {cal:50,  prot:2,   gluc:8,   lip:1,   fer:1,   vitD:0,   potass:200, zinc:0.3, vitC:20, calcium:20,  magnes:15,  fibres:3},
  "curcuma":               {cal:354, prot:8,   gluc:65,  lip:10,  fer:41,  vitD:0,   potass:2525,zinc:4.5, vitC:26, calcium:183, magnes:193, fibres:21.1},
  "cannelle":              {cal:247, prot:4,   gluc:81,  lip:1.2, fer:8.3, vitD:0,   potass:431, zinc:1.8, vitC:4,  calcium:1002,magnes:60,  fibres:53.1},
  // ── AUTRES ──
  "cafe":                  {cal:2,   prot:0.3, gluc:0,   lip:0,   fer:0.1, vitD:0,   potass:116, zinc:0.1, vitC:0,  calcium:5,   magnes:7,   fibres:0},
  "the vert":              {cal:1,   prot:0.2, gluc:0.2, lip:0,   fer:0.3, vitD:0,   potass:89,  zinc:0,   vitC:0,  calcium:0,   magnes:3,   fibres:0},
  "jus dorange":           {cal:45,  prot:0.7, gluc:10,  lip:0.2, fer:0.2, vitD:0,   potass:200, zinc:0.1, vitC:50, calcium:11,  magnes:11,  fibres:0.2},
  "whey proteine":         {cal:120, prot:25,  gluc:3,   lip:2,   fer:0.3, vitD:0,   potass:180, zinc:0.5, vitC:0,  calcium:130, magnes:20,  fibres:0},
  "chocolat noir":         {cal:546, prot:5,   gluc:60,  lip:31,  fer:8,   vitD:0,   potass:559, zinc:1.6, vitC:0,  calcium:56,  magnes:58,  fibres:7},
  "tahini":                {cal:595, prot:17,  gluc:21,  lip:54,  fer:8.9, vitD:0,   potass:414, zinc:4.6, vitC:0,  calcium:426, magnes:95,  fibres:9.3},
  "houmous":               {cal:177, prot:7.9, gluc:20,  lip:8.6, fer:2.4, vitD:0,   potass:228, zinc:1.6, vitC:3,  calcium:38,  magnes:42,  fibres:6},
  "tofu":                  {cal:76,  prot:8,   gluc:1.9, lip:4.8, fer:1.6, vitD:0,   potass:121, zinc:0.8, vitC:0,  calcium:350, magnes:30,  fibres:0.3},
  "granola":               {cal:471, prot:10,  gluc:64,  lip:20,  fer:3.5, vitD:0,   potass:310, zinc:2.5, vitC:1,  calcium:69,  magnes:91,  fibres:6.5},
};

// ─── Fonction normalisation accents pour recherche ───
function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/['']/g, "'")
    .replace(/[-]/g, " ");
}

// Prompt IA pour détecter les aliments
const MEAL_DETECT_PROMPT = `Tu es un expert nutritionniste IA. Analyse cette photo de repas et identifie tous les aliments visibles.
Retourne UNIQUEMENT ce JSON valide (sans markdown, sans explication) :
{"aliments":[{"nom":"nom exact en français minuscules","quantite_estimee_g":100,"confiance":"haute|moyenne|faible"}],"description_repas":"Description courte du repas en 1 phrase"}
- Utilise des noms simples : "riz cuit", "poulet", "tomate", "œuf", etc.
- Estime les quantités en grammes de façon réaliste
- Maximum 8 aliments`;

const MEAL_ANALYSE_PROMPT = `Tu es un expert nutritionniste et médecin spécialisé en nutrition islamique.
Voici la composition précise d'un repas :
{ALIMENTS}
Total calculé : {TOTAUX}

Analyse ce repas et retourne UNIQUEMENT ce JSON valide (sans markdown) :
{
  "score_sante": 0-100,
  "appreciation": "Excellent|Très bon|Bon|Moyen|Insuffisant",
  "points_forts": ["point fort 1","point fort 2"],
  "points_faibles": ["point faible 1"],
  "carences_comblee": [{"nutriment":"Fer","pct_apport_journalier":45,"emoji":"🔴"}],
  "conseil_nutrition": "Conseil personnalisé en 2 phrases",
  "tibb_conseil": "Conseil Tibb an-Nabawi lié aux aliments du repas",
  "timing_ideal": "Matin|Midi|Soir|Avant sport|Après sport",
  "calories_objectif": "Adapté à 2000 kcal/jour — ce repas représente X% de l'apport"
}`;

function MealCapture({onCapture, onResult, onBack, user, onPaywall, t, lang}) {
  const L = lang === "en";
  const [mode, setMode] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [aliments, setAliments] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [step, setStep] = useState("capture");
  const [result, setResult] = useState(null);
  const [descRepas, setDescRepas] = useState("");
  const [showEtiquette, setShowEtiquette] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();

  if (user?.plan !== "premium" && !user?.isDemo) return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:32}}>{t("back")}</button>
      <div style={{textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:60,marginBottom:16}}>🍽️</div>
        <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:8}}>{L?"Meal Scanner":"Scan Repas"}</div>
        <div style={{color:MUT,fontSize:14,marginBottom:24,maxWidth:280,lineHeight:1.6}}>
          {L?"Analyze your meals, track macros & micros precisely.":"Analysez vos repas, suivez macros & micros avec précision."}
        </div>
        <button className="bgold" onClick={onPaywall}>✨ {L?"Unlock Premium — 9.99$/month":"Débloquer Premium — 9,99$/mois"}</button>
      </div>
    </div>
  );

  const calcTotaux = () => {
    const t0 = {cal:0,prot:0,gluc:0,lip:0,fer:0,vitD:0,potass:0,zinc:0,vitC:0,calcium:0,magnes:0,fibres:0};
    aliments.forEach(a => {
      const ratio = a.quantite_g / 100;
      Object.keys(t0).forEach(k => { t0[k] += (a.data?.[k] || 0) * ratio; });
    });
    return Object.fromEntries(Object.entries(t0).map(([k,v]) => [k, Math.round(v * 10) / 10]));
  };

  const handleSearch = (q) => {
    setSearchQ(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const qNorm = normalizeStr(q);
    const res = Object.keys(FOOD_DB).filter(name => normalizeStr(name).includes(qNorm)).slice(0, 8);
    setSearchResults(res);
  };

  const addAliment = (nom, qte = 100) => {
    const data = FOOD_DB[nom] || FOOD_DB[Object.keys(FOOD_DB).find(k => normalizeStr(k).includes(normalizeStr(nom)) || normalizeStr(nom).includes(normalizeStr(k)))];
    if (!data) return;
    setAliments(prev => [...prev, {id: Date.now(), nom, quantite_g: qte, data}]);
    setSearchQ(""); setSearchResults([]);
  };

  const removeAliment = (id) => setAliments(prev => prev.filter(a => a.id !== id));
  const updateQte = (id, qte) => setAliments(prev => prev.map(a => a.id === id ? {...a, quantite_g: Math.max(1, qte)} : a));

  // ── DÉTECTION IA DEPUIS PHOTO ──
  const detectFromPhoto = async (imageData) => {
    setDetecting(true);
    setErrorMsg("");
    try {
      const mediaType = imageData.startsWith("data:image/png") ? "image/png"
        : imageData.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 2000,
          messages: [{role:"user", content:[
            {type:"image", source:{type:"base64", media_type: mediaType, data: imageData.split(",")[1]}},
            {type:"text", text: MEAL_DETECT_PROMPT}
          ]}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setDescRepas(parsed.description_repas || "");
      const detected = (parsed.aliments || []).map((a, i) => {
        const normNom = normalizeStr(a.nom);
        const dbKey = Object.keys(FOOD_DB).find(k => {
          const normK = normalizeStr(k);
          return normK.includes(normNom) || normNom.includes(normK) ||
            (normNom.length > 3 && normK.startsWith(normNom.slice(0,4)));
        });
        const fallbackData = dbKey ? FOOD_DB[dbKey] : {
          cal: a.calories_pour_100g || 150, prot: a.proteines_g || 5,
          gluc: a.glucides_g || 20, lip: a.lipides_g || 3,
          fer: 1, potass: 100, zinc: 0.5, vitD: 0, vitC: 2, calcium: 20
        };
        return { id: Date.now() + i, nom: a.nom, quantite_g: a.quantite_estimee_g || 100, data: fallbackData };
      }).filter(a => a.nom);
      setAliments(detected);
      setStep("edit");
    } catch(e) {
      console.error(e);
      setErrorMsg(L ? "Detection failed. You can add ingredients manually." : "Détection échouée. Tu peux ajouter les ingrédients manuellement.");
      setAliments([]);
      setStep("edit");
    }
    setDetecting(false);
  };

  // ── ANALYSE FINALE IA ──
  const analyzeRepas = async () => {
    setStep("analyzing");
    setErrorMsg("");
    const tot = calcTotaux();
    const alimentsText = aliments.map(a => `- ${a.nom}: ${a.quantite_g}g`).join("\n");
    const totauxText = `Calories: ${tot.cal} kcal, Protéines: ${tot.prot}g, Glucides: ${tot.gluc}g, Lipides: ${tot.lip}g, Fer: ${tot.fer}mg, Vit.D: ${tot.vitD}µg, Potassium: ${tot.potass}mg, Zinc: ${tot.zinc}mg`;
    const prompt = MEAL_ANALYSE_PROMPT.replace("{ALIMENTS}", alimentsText).replace("{TOTAUX}", totauxText);
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
          model: "claude-sonnet-4-6", max_tokens: 2000,
          messages: [{role:"user", content: prompt}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const finalResult = {...parsed, totaux: tot, aliments: [...aliments]};
      setResult(finalResult);
      setStep("result");
      onResult?.(finalResult);
    } catch(e) {
      console.error(e);
      setErrorMsg(L ? "Analysis error. Please try again." : "Erreur d'analyse. Réessaye.");
      setStep("edit");
    }
  };

  // ── ÉTAPE 0 : CHOIX DU MODE ──
  if (step === "capture" && !mode) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#060d08"}}>
      <div style={{padding:"52px 22px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>{t("back")}</button>
        <div className="serif" style={{fontSize:26,fontWeight:700,color:GOLD,marginBottom:6}}>🍽️ {L?"Meal Scanner":"Scan Repas"}</div>
        <div style={{color:MUT,fontSize:13,marginBottom:28}}>{L?"Precise macros & micros tracking":"Suivi précis macros & micronutriments"}</div>
      </div>
      <div style={{padding:"0 22px",display:"flex",flexDirection:"column",gap:12}}>
        <button onClick={()=>setMode("photo")}
          style={{background:CARD,border:`2px solid ${GOLD}44`,borderRadius:18,padding:"22px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:40}}>📸</span>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:GOLD,marginBottom:4}}>{L?"Scan a photo":"Scanner une photo"}</div>
            <div style={{fontSize:12,color:MUT}}>{L?"Take or import a photo of your plate — AI detects ingredients":"Prends ou importe une photo de ton assiette — l'IA détecte les ingrédients"}</div>
          </div>
        </button>
        <button onClick={()=>{setMode("manual");setStep("edit");}}
          style={{background:CARD,border:`2px solid ${EM}44`,borderRadius:18,padding:"22px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:40}}>✏️</span>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:EM,marginBottom:4}}>{L?"Enter manually":"Saisie manuelle"}</div>
            <div style={{fontSize:12,color:MUT}}>{L?"Search ingredients, set exact quantities in grams":"Recherche les ingrédients, entre les quantités exactes en grammes"}</div>
          </div>
        </button>
        <button onClick={()=>setShowEtiquette(true)}
          style={{background:CARD,border:`2px solid #06b6d444`,borderRadius:18,padding:"22px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:40}}>🔬</span>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:"#06b6d4",marginBottom:4}}>{L?"Scan nutrition label":"Scanner l'étiquette"}</div>
            <div style={{fontSize:12,color:MUT}}>{L?"Photo of product label → AI analysis + Halal check 🌙":"Photo de l'étiquette → Analyse IA + Vérification Halal 🌙"}</div>
          </div>
        </button>
        {showEtiquette&&(
          <div style={{position:"fixed",inset:0,zIndex:9999,background:"#060d08",overflowY:"auto"}}>
            <NutritionLabelScan onBack={()=>setShowEtiquette(false)} lang={lang}/>
          </div>
        )}
      </div>
    </div>
  );

  // ── ÉTAPE PHOTO : IMPORT IMAGE ──
  if (step === "capture" && mode === "photo") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#060d08"}}>
      <div style={{padding:"52px 22px 0"}}>
        <button onClick={()=>setMode(null)} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20}}>← {L?"Back":"Retour"}</button>
        <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:20}}>📸 {L?"Photo of your plate":"Photo de ton assiette"}</div>
      </div>
      {!imgData ? (
        <div style={{padding:"0 22px",display:"flex",flexDirection:"column",gap:12}}>
          <div onClick={()=>fileRef.current?.click()}
            style={{background:CARD,border:`2px dashed ${GOLD}44`,borderRadius:18,padding:"48px 20px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:12}}>🍽️</div>
            <div style={{fontWeight:700,fontSize:15,color:GOLD,marginBottom:6}}>{L?"Tap to import a photo":"Appuie pour importer une photo"}</div>
            <div style={{fontSize:12,color:MUT}}>{L?"Gallery or camera":"Galerie ou appareil photo"}</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
            onChange={e => {
              const file = e.target.files?.[0]; if(!file) return;
              const reader = new FileReader();
              reader.onload = ev => { if(ev.target?.result) setImgData(ev.target.result); };
              reader.onerror = () => {
                // Fallback: use object URL
                const url = URL.createObjectURL(file);
                setImgData(url);
              };
              reader.readAsDataURL(file);
            }}/>
        </div>
      ) : (
        <div style={{padding:"0 22px"}}>
          <img src={imgData} alt="repas" style={{width:"100%",borderRadius:16,marginBottom:16,maxHeight:280,objectFit:"cover"}}/>
          {detecting ? (
            <div style={{textAlign:"center",padding:20}}>
              <div style={{color:GOLD,fontWeight:700,fontSize:14,marginBottom:8}}>🔍 {L?"AI detecting ingredients...":"IA détecte les ingrédients..."}</div>
              <div style={{background:"#142018",borderRadius:6,height:6,overflow:"hidden"}}>
                <div style={{width:"70%",height:"100%",background:`linear-gradient(90deg,${EM},${GOLD})`,borderRadius:6,animation:"slideIn .4s ease"}}/>
              </div>
            </div>
          ) : (
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setImgData(null)} style={{flex:1,background:"transparent",border:`1px solid ${BDR}`,borderRadius:12,padding:"14px",color:MUT,fontSize:13,cursor:"pointer"}}>
                {L?"Change photo":"Changer photo"}
              </button>
              <button onClick={()=>detectFromPhoto(imgData)} style={{flex:2,background:`linear-gradient(135deg,${GOLD},#f59e0b)`,border:"none",borderRadius:12,padding:"14px",color:"#0a0a0a",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                🔍 {L?"Detect ingredients":"Détecter les ingrédients"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── ÉTAPE EDIT : LISTE + QUANTITÉS ──
  if (step === "edit") {
    const tot = calcTotaux();
    return (
      <div style={{minHeight:"100vh",paddingBottom:120,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 20px 16px",background:`radial-gradient(ellipse at 50% 0%, ${GOLD}12 0%, #060d08 70%)`}}>
          <button onClick={()=>{setStep("capture");setMode(null);setAliments([]);setErrorMsg("");}} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:12}}>← {L?"Back":"Retour"}</button>
          <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:4}}>
            {descRepas || (L?"My meal":"Mon repas")}
          </div>
          <div style={{fontSize:12,color:MUT}}>{L?"Adjust quantities for precise calculation":"Ajuste les quantités pour un calcul précis"}</div>
        </div>

        <div style={{padding:"0 18px"}}>
          {/* Message d'erreur */}
          {errorMsg && (
            <div style={{background:"#2a0505",border:"1.5px solid #ef444444",borderRadius:14,padding:"14px 16px",marginBottom:14,fontSize:13,color:"#f87171"}}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Totaux en temps réel */}
          <div style={{background:CARD,border:`1px solid ${GOLD}33`,borderRadius:16,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:12,color:GOLD,marginBottom:10}}>📊 {L?"REAL-TIME TOTALS":"TOTAUX EN TEMPS RÉEL"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
              {[
                {k:"cal", label:"Kcal", color:WARN},
                {k:"prot", label:L?"Prot.":"Prot.", color:"#38bdf8"},
                {k:"gluc", label:L?"Carbs":"Gluc.", color:"#f97316"},
                {k:"lip", label:L?"Fat":"Lip.", color:"#c084fc"},
              ].map(({k,label,color})=>(
                <div key={k} style={{background:"#0a140c",borderRadius:10,padding:"8px 6px",textAlign:"center",border:`1px solid ${color}22`}}>
                  <div style={{fontWeight:700,fontSize:16,color}}>{tot[k]}</div>
                  <div style={{fontSize:9,color:MUT}}>{label}{k!=="cal"?"g":""}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[
                {k:"fer", label:"Fer", unit:"mg", color:"#f97316"},
                {k:"potass", label:"K+", unit:"mg", color:EM},
                {k:"zinc", label:"Zinc", unit:"mg", color:"#c084fc"},
                {k:"vitD", label:"Vit.D", unit:"µg", color:GOLD},
                {k:"vitC", label:"Vit.C", unit:"mg", color:"#f472b6"},
                {k:"calcium", label:"Ca", unit:"mg", color:"#38bdf8"},
              ].map(({k,label,unit,color})=>(
                <div key={k} style={{background:"#0a140c",borderRadius:8,padding:"5px 10px",border:`1px solid ${color}22`,display:"flex",gap:4,alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:700,color}}>{tot[k]}{unit}</span>
                  <span style={{fontSize:9,color:MUT}}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recherche aliment */}
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:12,color:MUT,marginBottom:10}}>+ {L?"ADD AN INGREDIENT":"AJOUTER UN INGRÉDIENT"}</div>
            <input
              type="text" value={searchQ} onChange={e=>handleSearch(e.target.value)}
              placeholder={L?"Search: chicken, rice, tomato...":"Recherche: poulet, riz, tomate..."}
              style={{width:"100%",background:"#0a140c",border:`1px solid ${BDR}`,borderRadius:10,padding:"10px 14px",color:"#edf5ef",fontSize:13,fontFamily:"'Outfit',sans-serif"}}/>
            {searchResults.length > 0 && (
              <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                {searchResults.map(nom=>(
                  <button key={nom} onClick={()=>addAliment(nom)}
                    style={{background:"#0a140c",border:`1px solid ${EM}33`,borderRadius:8,padding:"8px 12px",cursor:"pointer",textAlign:"left",color:"#edf5ef",fontSize:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>{nom}</span>
                    <span style={{color:EM,fontSize:11}}>{FOOD_DB[nom]?.cal} kcal/100g +</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Liste aliments */}
          {aliments.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 20px",color:MUT,fontSize:13}}>
              {L?"Add ingredients above to start":"Ajoute des ingrédients ci-dessus pour commencer"}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:12,color:MUT,letterSpacing:.8,marginBottom:4}}>
                {L?"INGREDIENTS":"INGRÉDIENTS"} ({aliments.length})
              </div>
              {aliments.map(a=>(
                <div key={a.id} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#edf5ef",marginBottom:2,textTransform:"capitalize"}}>{a.nom}</div>
                    <div style={{fontSize:10,color:MUT}}>
                      {Math.round((a.data?.cal||0)*a.quantite_g/100)} kcal · {Math.round((a.data?.prot||0)*a.quantite_g/100)}g prot
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={()=>updateQte(a.id, a.quantite_g - 10)}
                      style={{width:28,height:28,borderRadius:7,background:"#0a140c",border:`1px solid ${BDR}`,color:"#edf5ef",fontSize:16,cursor:"pointer"}}>−</button>
                    <div style={{minWidth:52,textAlign:"center"}}>
                      <input type="number" value={a.quantite_g}
                        onChange={e=>updateQte(a.id, parseInt(e.target.value)||0)}
                        style={{width:52,background:"#0a140c",border:`1px solid ${EM}44`,borderRadius:6,padding:"4px 6px",color:EM,fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"'Outfit',sans-serif"}}/>
                      <div style={{fontSize:9,color:MUT}}>g</div>
                    </div>
                    <button onClick={()=>updateQte(a.id, a.quantite_g + 10)}
                      style={{width:28,height:28,borderRadius:7,background:"#0a140c",border:`1px solid ${BDR}`,color:"#edf5ef",fontSize:16,cursor:"pointer"}}>+</button>
                  </div>
                  <button onClick={()=>removeAliment(a.id)}
                    style={{background:"transparent",border:"none",color:DANGER,fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {aliments.length > 0 && (
          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"16px 20px 32px",background:"linear-gradient(to top, #060d08 70%, transparent)"}}>
            <button onClick={analyzeRepas}
              style={{width:"100%",background:`linear-gradient(135deg,${GOLD},#f59e0b)`,color:"#0a0a0a",border:"none",borderRadius:16,padding:"18px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer"}}>
              🔍 {L?`Analyze ${aliments.length} ingredients`:`Analyser ${aliments.length} ingrédient${aliments.length>1?"s":""}`} → {tot.cal} kcal
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── ÉTAPE ANALYZING ──
  if (step === "analyzing") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#060d08",padding:"20px"}}>
      <div style={{fontSize:56,marginBottom:20,animation:"floatY 1.5s ease-in-out infinite"}}>🍽️</div>
      <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:12}}>{L?"Nutritional analysis...":"Analyse nutritionnelle..."}</div>
      <div style={{width:"100%",maxWidth:280,background:"#142018",borderRadius:8,height:8,overflow:"hidden",marginBottom:12}}>
        <div style={{width:"85%",height:"100%",background:`linear-gradient(90deg,${EM},${GOLD})`,borderRadius:8,animation:"slideIn .4s ease"}}/>
      </div>
      <div style={{color:MUT,fontSize:12}}>{L?"Calculating macros, micros, Tibb advice...":"Calcul macros, micros, conseils Tibb..."}</div>
    </div>
  );

  // ── ÉTAPE RESULT (fallback local si onResult ne switche pas) ──
  if (step === "result" && result) return (
    <div style={{minHeight:"100vh",overflowY:"auto",background:"#060d08",paddingBottom:40}}>
      <div style={{padding:"52px 22px 20px",background:`radial-gradient(ellipse at 50% 0%, ${GOLD}12 0%, #060d08 70%)`}}>
        <button onClick={()=>{setStep("capture");setMode(null);setAliments([]);setResult(null);setErrorMsg("");}} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16}}>← {L?"New scan":"Nouveau scan"}</button>
        <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD,marginBottom:4}}>{result.nom_repas || (L?"Meal analysis":"Analyse repas")}</div>
        <div style={{fontSize:12,color:MUT}}>{result.score_nutrition ? `Score: ${result.score_nutrition}/100` : ""}</div>
      </div>
      <div style={{padding:"0 20px"}}>
        {/* Calories */}
        <div style={{background:CARD,border:`1px solid ${GOLD}33`,borderRadius:16,padding:"16px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:42,fontWeight:700,color:GOLD}}>{result.totaux?.cal || result.calories_estimees || "—"}</div>
          <div style={{fontSize:12,color:MUT}}>kcal</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
            {[
              {label:L?"Proteins":"Protéines", val:result.totaux?.prot, unit:"g", color:"#38bdf8"},
              {label:L?"Carbs":"Glucides", val:result.totaux?.gluc, unit:"g", color:"#f97316"},
              {label:L?"Fat":"Lipides", val:result.totaux?.lip, unit:"g", color:"#c084fc"},
            ].map(({label,val,unit,color},i)=>(
              <div key={i} style={{background:"#0a140c",borderRadius:10,padding:"8px 6px"}}>
                <div style={{fontWeight:700,fontSize:16,color}}>{val || "—"}{unit}</div>
                <div style={{fontSize:9,color:MUT}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Conseil IA */}
        {result.conseil_ia && (
          <div style={{background:`${EM}08`,border:`1px solid ${EM}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:11,color:EM,fontWeight:700,marginBottom:6}}>💡 {L?"AI ADVICE":"CONSEIL IA"}</div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.6}}>{result.conseil_ia}</div>
          </div>
        )}
        {/* Halal */}
        {result.statut_halal && (
          <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 HALAL</div>
            <div style={{fontSize:13,color:"#a08040",lineHeight:1.6}}>{result.statut_halal}</div>
          </div>
        )}
        <button onClick={()=>{setStep("capture");setMode(null);setAliments([]);setResult(null);setErrorMsg("");}}
          style={{width:"100%",background:`linear-gradient(135deg,#0a3020,#0d5030)`,border:`1.5px solid ${EM}44`,borderRadius:18,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,color:EM,fontWeight:700,cursor:"pointer"}}>
          🍽️ {L?"Scan another meal":"Scanner un autre repas"}
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── RÉSULTAT REPAS ───
function MealResult({result, onNewScan, onHome, t, lang}) {
  const L = lang === "en";
  if (!result) return null;
  const tot = result.totaux || {};

  const scoreColor = result.score_sante >= 75 ? EM : result.score_sante >= 50 ? WARN : DANGER;

  const MICROS = [
    {k:"fer",    label:"Fer",      unit:"mg",  rdi:18,  emoji:"🔴", color:"#f97316"},
    {k:"vitD",   label:"Vit. D",   unit:"µg",  rdi:15,  emoji:"☀️", color:GOLD},
    {k:"potass", label:"Potassium",unit:"mg",  rdi:3500,emoji:"⚡", color:EM},
    {k:"zinc",   label:"Zinc",     unit:"mg",  rdi:11,  emoji:"💠", color:"#c084fc"},
    {k:"vitC",   label:"Vit. C",   unit:"mg",  rdi:80,  emoji:"🍊", color:"#f472b6"},
    {k:"calcium",label:"Calcium",  unit:"mg",  rdi:1000,emoji:"🦴", color:"#38bdf8"},
    {k:"magnes", label:"Magnésium",unit:"mg",  rdi:400, emoji:"🌿", color:"#34d399"},
    {k:"fibres", label:"Fibres",   unit:"g",   rdi:25,  emoji:"🌾", color:"#a78bfa"},
  ];

  return (
    <div style={{minHeight:"100vh",paddingBottom:90,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 20px 20px",background:`radial-gradient(ellipse at 50% 0%, ${scoreColor}15 0%, #060d08 70%)`}}>
        <button onClick={onHome} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16}}>{t("back")}</button>

        {/* Score + titre */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative",width:76,height:76,flexShrink:0}}>
            <svg width="76" height="76" style={{transform:"rotate(-90deg)"}}>
              <circle cx="38" cy="38" r="30" fill="none" stroke="#142018" strokeWidth="6"/>
              <circle cx="38" cy="38" r="30" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeDasharray={`${(result.score_sante/100)*188} 188`} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <span style={{fontSize:20,fontWeight:700,color:scoreColor}}>{result.score_sante}</span>
              <span style={{fontSize:8,color:MUT}}>/100</span>
            </div>
          </div>
          <div>
            <div className="serif" style={{fontSize:20,fontWeight:700,marginBottom:4}}>{result.appreciation}</div>
            <div style={{color:MUT,fontSize:12,marginBottom:4}}>{L?"Nutritional score":"Score nutritionnel"}</div>
            <div style={{display:"inline-flex",background:`${scoreColor}15`,borderRadius:20,padding:"2px 10px"}}>
              <span style={{fontSize:10,color:scoreColor,fontWeight:700}}>⏰ {result.timing_ideal}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 18px"}}>
        {/* Macros */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:12,color:MUT,letterSpacing:.8,marginBottom:12}}>MACRONUTRIMENTS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{background:"#0a140c",borderRadius:12,padding:"12px",textAlign:"center",border:`1px solid ${WARN}22`}}>
              <div style={{fontSize:28,fontWeight:700,color:WARN}}>{tot.cal}</div>
              <div style={{fontSize:11,color:MUT}}>Calories</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{result.calories_objectif?.split("—")[1]?.trim()}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {k:"prot", label:L?"Proteins":"Protéines", color:"#38bdf8"},
                {k:"gluc", label:L?"Carbs":"Glucides", color:"#f97316"},
                {k:"lip",  label:L?"Fats":"Lipides", color:"#c084fc"},
              ].map(({k,label,color})=>(
                <div key={k} style={{background:"#0a140c",borderRadius:8,padding:"6px 10px",display:"flex",justifyContent:"space-between",border:`1px solid ${color}22`}}>
                  <span style={{fontSize:11,color:MUT}}>{label}</span>
                  <span style={{fontSize:12,fontWeight:700,color}}>{tot[k]}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Micronutriments */}
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:12,color:MUT,letterSpacing:.8,marginBottom:12}}>MICRONUTRIMENTS</div>
          {MICROS.map(m=>{
            const val = tot[m.k] || 0;
            const pct = Math.min(100, Math.round((val / m.rdi) * 100));
            return (
              <div key={m.k} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,color:"#edf5ef"}}>{m.emoji} {m.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:pct>=50?EM:pct>=25?WARN:DANGER}}>{val}{m.unit} <span style={{color:MUT}}>({pct}% AJR)</span></span>
                </div>
                <div style={{background:"#142018",borderRadius:4,height:5,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:pct>=50?EM:pct>=25?WARN:DANGER,borderRadius:4,transition:"width .5s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Points forts / faibles */}
        {(result.points_forts?.length > 0 || result.points_faibles?.length > 0) && (
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
            {result.points_forts?.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                <span style={{color:EM,fontSize:14,marginTop:1}}>✓</span>
                <span style={{fontSize:12,color:"#a0bcaa"}}>{p}</span>
              </div>
            ))}
            {result.points_faibles?.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                <span style={{color:WARN,fontSize:14,marginTop:1}}>⚠</span>
                <span style={{fontSize:12,color:"#a0bcaa"}}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* Conseil nutrition */}
        {result.conseil_nutrition && (
          <div style={{background:`${EM}08`,border:`1px solid ${EM}22`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:11,color:EM,marginBottom:6}}>💡 {L?"NUTRITION ADVICE":"CONSEIL NUTRITION"}</div>
            <div style={{fontSize:12,color:"#a0bcaa",lineHeight:1.6}}>{result.conseil_nutrition}</div>
          </div>
        )}

        {/* Tibb an-Nabawi */}
        {result.tibb_conseil && (
          <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:16,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:11,color:GOLD,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
            <div style={{fontSize:12,color:"#a08040",lineHeight:1.6}}>{result.tibb_conseil}</div>
          </div>
        )}

        {/* Détail aliments */}
        {result.aliments?.length > 0 && (
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:12,color:MUT,letterSpacing:.8,marginBottom:10}}>{L?"INGREDIENTS ANALYZED":"INGRÉDIENTS ANALYSÉS"}</div>
            {result.aliments.map((a,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<result.aliments.length-1?`1px solid ${BDR}`:"none"}}>
                <span style={{fontSize:12,color:"#edf5ef",textTransform:"capitalize"}}>{a.nom}</span>
                <span style={{fontSize:11,color:MUT}}>{a.quantite_g}g · {Math.round((a.data?.cal||0)*a.quantite_g/100)} kcal</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={onNewScan}
          style={{width:"100%",background:`linear-gradient(135deg,${GOLD},#f59e0b)`,color:"#0a0a0a",border:"none",borderRadius:14,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10}}>
          🍽️ {L?"New scan":"Nouveau scan"}
        </button>
        <button onClick={onHome}
          style={{width:"100%",background:"transparent",border:`1px solid ${BDR}`,borderRadius:14,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:13,color:MUT,cursor:"pointer"}}>
          {t("back")}
        </button>
      </div>
    </div>
  );
}
function Progress({history,onBack,t,profile,lang}) {
  const L = lang==="en";
  const sexe = profile?.sexe||"homme";

  // Avatars selon genre (Cloudinary persos RPG)
  const AVATAR = {
    homme: {
      low:    "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_160616_myin1q",
      high:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_144911_wakucy",
    },
    femme: {
      low:    "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_151002_frehpw",
      high:   "https://res.cloudinary.com/dpkpzqdni/image/upload/Capture_d_%C3%A9cran_2026-05-12_145107_ldgtxl",
    },
  };
  const avatarSet = AVATAR[sexe] || AVATAR["homme"];

  const scans = history.filter(h=>h.score);
  const scores10 = scans.slice(0,10).reverse();
  const max = Math.max(...scores10.map(s=>s.score),100);
  const avg = scans.length>0 ? Math.round(scans.reduce((a,s)=>a+s.score,0)/scans.length) : 0;
  const best = scans.length>0 ? Math.max(...scans.map(s=>s.score)) : 0;
  const trend = scores10.length>=2 ? scores10[scores10.length-1].score - scores10[0].score : 0;

  // Avatar selon score moyen
  const avatarImg = avg>=60 ? avatarSet.high : avatarSet.low;
  const avatarColor = avg>=75?"#00ff88":avg>=50?"#fbbf24":avg>=25?"#f97316":"#ef4444";
  const avatarLabel = avg>=75?(L?"Elite":"Élite"):avg>=60?(L?"Good form":"Bonne forme"):avg>=40?(L?"Progressing":"En progrès"):(L?"Keep going":"Continue !");

  // Zones analysées
  const zonesMap = {};
  scans.forEach(s=>{
    const z = s.zone||s.nom_repas||"Autre";
    if(!zonesMap[z]) zonesMap[z]={total:0,count:0};
    zonesMap[z].total+=s.score; zonesMap[z].count++;
  });
  const zonesStats = Object.entries(zonesMap)
    .map(([z,v])=>({zone:z,avg:Math.round(v.total/v.count),count:v.count}))
    .sort((a,b)=>b.avg-a.avg);

  // Points forts et à améliorer
  const pointsForts    = zonesStats.filter(z=>z.avg>=65).slice(0,3);
  const pointsFaibles  = zonesStats.filter(z=>z.avg<55).slice(0,3);

  // Niveau RPG selon score moyen
  const getRang = (s) => s>=85?"MAÎTRE":s>=70?"DIAMANT":s>=55?"PLATINE":s>=40?"OR":s>=25?"ARGENT":"BRONZE";
  const RANG_INFO2 = {
    "BRONZE":  {color:"#cd7f32",icon:"🥉"},
    "ARGENT":  {color:"#c0c0c0",icon:"🥈"},
    "OR":      {color:"#e2b84a",icon:"🥇"},
    "PLATINE": {color:"#4dd9d9",icon:"💠"},
    "DIAMANT": {color:"#9580ff",icon:"💎"},
    "MAÎTRE":  {color:"#ffffff",icon:"👑"},
  };
  const rang = getRang(avg);
  const ri = RANG_INFO2[rang];

  const [imgErr, setImgErr] = useState(false);

  return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>

      {/* Hero */}
      <div style={{padding:"52px 22px 28px",background:`radial-gradient(ellipse at 50% 0%,${avatarColor}18 0%,#060d08 65%)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"block"}}>
          ← {L?"Back":"Retour"}
        </button>

        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:24}}>
          {/* Avatar RPG genre */}
          <div style={{width:100,height:100,flexShrink:0,position:"relative"}}>
            {!imgErr
              ?<img src={avatarImg} alt="" onError={()=>setImgErr(true)}
                  style={{width:"100%",height:"100%",objectFit:"contain",filter:`drop-shadow(0 0 16px ${avatarColor}88)`}}/>
              :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{ri.icon}</div>
            }
            {/* Badge rang */}
            <div style={{position:"absolute",bottom:-6,right:-6,background:`${ri.color}20`,border:`1.5px solid ${ri.color}`,borderRadius:20,padding:"2px 8px",fontSize:10,color:ri.color,fontWeight:700}}>
              {ri.icon} {rang}
            </div>
          </div>

          <div style={{flex:1}}>
            <div style={{fontSize:10,color:avatarColor,fontWeight:700,letterSpacing:1,marginBottom:4}}>
              {L?"YOUR VITASCANN LEVEL":"TON NIVEAU VITASCANN"}
            </div>
            <div className="serif" style={{fontSize:28,fontWeight:700,color:avatarColor,lineHeight:1}}>{avatarLabel}</div>
            <div style={{fontSize:12,color:MUT,marginTop:6}}>
              {sexe==="femme"?(L?"Female profile":"Profil féminin"):(L?"Male profile":"Profil masculin")} · {scans.length} {L?"scans":"scans"}
            </div>
            {trend!==0&&(
              <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:6,background:trend>0?`${EM}10`:"#ff444410",border:`1px solid ${trend>0?EM:"#ff4444"}33`,borderRadius:20,padding:"3px 10px"}}>
                <span style={{fontSize:12}}>{trend>0?"📈":"📉"}</span>
                <span style={{fontSize:11,fontWeight:700,color:trend>0?EM:"#ff4444"}}>
                  {trend>0?"+":""}{trend} pts {L?"vs first scan":"vs premier scan"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats 3 colonnes */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            {val:best,label:L?"Best score":"Meilleur",color:EM,suffix:""},
            {val:avg,label:L?"Average":"Moyenne",color:avatarColor,suffix:""},
            {val:scans.length,label:L?"Scans":"Scans",color:GOLD,suffix:""},
          ].map(({val,label,color,suffix},i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontWeight:700,fontSize:22,color}}>{val}{suffix}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px"}}>

        {/* Courbe des scores */}
        {scores10.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"SCORE EVOLUTION":"ÉVOLUTION DES SCORES"}</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:100}}>
              {scores10.map((s,i)=>{
                const h=(s.score/max)*100;
                const c=s.score>=75?EM:s.score>=50?WARN:DANGER;
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:8,color:c,fontWeight:700}}>{s.score}</div>
                    <div style={{width:"100%",height:`${h}%`,background:`linear-gradient(180deg,${c},${c}88)`,borderRadius:"4px 4px 0 0",minHeight:4,boxShadow:`0 0 6px ${c}44`,transition:"height 1s ease"}}/>
                    <div style={{fontSize:7,color:MUT,textAlign:"center",lineHeight:1.2,maxWidth:30,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                      {(s.zone||s.nom_repas||"Scan").slice(0,5)}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Légende */}
            <div style={{display:"flex",gap:12,marginTop:10,justifyContent:"center"}}>
              {[[EM,L?"Good (75+)":"Bon (75+)"],[WARN,L?"OK (50-74)":"Moyen (50-74)"],[DANGER,L?"Low (<50)":"Faible (<50)"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                  <span style={{fontSize:9,color:MUT}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points forts */}
        {pointsForts.length>0&&(
          <div style={{background:`${EM}06`,border:`1.5px solid ${EM}22`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:EM,fontWeight:700,letterSpacing:.8,marginBottom:14}}>✅ {L?"STRENGTHS":"POINTS FORTS"}</div>
            {pointsForts.map((z,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<pointsForts.length-1?12:0,paddingBottom:i<pointsForts.length-1?12:0,borderBottom:i<pointsForts.length-1?`1px solid ${EM}14`:"none"}}>
                <div style={{width:42,height:42,borderRadius:12,background:`${EM}12`,border:`1.5px solid ${EM}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:EM}}>{z.avg}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#edf5ef"}}>{z.zone}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>{z.count} {L?"scan(s)":"scan(s)"} · {L?"avg":"moy"} {z.avg}/100</div>
                </div>
                {/* Barre mini */}
                <div style={{width:60}}>
                  <div style={{background:"#142018",borderRadius:4,height:6,overflow:"hidden"}}>
                    <div style={{width:`${z.avg}%`,height:"100%",background:EM,borderRadius:4}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Points à améliorer */}
        {pointsFaibles.length>0&&(
          <div style={{background:"#1a0a0a",border:"1.5px solid #ef444422",borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:"#ef4444",fontWeight:700,letterSpacing:.8,marginBottom:14}}>🎯 {L?"AREAS TO IMPROVE":"POINTS À AMÉLIORER"}</div>
            {pointsFaibles.map((z,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<pointsFaibles.length-1?12:0,paddingBottom:i<pointsFaibles.length-1?12:0,borderBottom:i<pointsFaibles.length-1?"1px solid #ef444414":"none"}}>
                <div style={{width:42,height:42,borderRadius:12,background:"#ef444412",border:"1.5px solid #ef444433",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#ef4444"}}>{z.avg}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#edf5ef"}}>{z.zone}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>{z.count} {L?"scan(s)":"scan(s)"} · {L?"avg":"moy"} {z.avg}/100</div>
                </div>
                <div style={{width:60}}>
                  <div style={{background:"#142018",borderRadius:4,height:6,overflow:"hidden"}}>
                    <div style={{width:`${z.avg}%`,height:"100%",background:"#ef4444",borderRadius:4}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toutes les zones */}
        {zonesStats.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"ALL ZONES":"TOUTES LES ZONES"}</div>
            {zonesStats.map((z,i)=>{
              const c=z.avg>=75?EM:z.avg>=50?WARN:DANGER;
              return(
                <div key={i} style={{marginBottom:i<zonesStats.length-1?12:0,paddingBottom:i<zonesStats.length-1?12:0,borderBottom:i<zonesStats.length-1?`1px solid ${BDR}`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#edf5ef"}}>{z.zone}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10,color:MUT}}>{z.count}x</span>
                      <span style={{fontWeight:700,fontSize:14,color:c}}>{z.avg}/100</span>
                    </div>
                  </div>
                  <div style={{background:"#142018",borderRadius:6,height:8,overflow:"hidden"}}>
                    <div style={{width:`${z.avg}%`,height:"100%",background:`linear-gradient(90deg,${c}88,${c})`,borderRadius:6,transition:"width 1s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Historique détaillé */}
        {scans.length>0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{L?"SCAN HISTORY":"HISTORIQUE DES SCANS"}</div>
            {scans.slice(0,15).map((s,i)=>{
              const c=s.score>=75?EM:s.score>=50?WARN:DANGER;
              const emoji=s.score>=75?"✅":s.score>=50?"⚠️":"🔶";
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<Math.min(scans.length,15)-1?10:0,paddingBottom:i<Math.min(scans.length,15)-1?10:0,borderBottom:i<Math.min(scans.length,15)-1?`1px solid ${BDR}`:"none"}}>
                  <span style={{fontSize:16,flexShrink:0}}>{emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#edf5ef",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.zone||s.nom_repas||"Scan"}</div>
                    <div style={{fontSize:10,color:MUT,marginTop:2}}>{s.date||""}</div>
                  </div>
                  <div style={{fontWeight:700,fontSize:16,color:c,flexShrink:0}}>{s.score}<span style={{fontSize:10,fontWeight:400,color:MUT}}>/100</span></div>
                </div>
              );
            })}
          </div>
        )}

        {scans.length===0&&(
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,padding:40,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>📊</div>
            <div style={{fontSize:16,fontWeight:700,color:"#edf5ef",marginBottom:8}}>{L?"No scans yet":"Aucun scan encore"}</div>
            <div style={{color:MUT,fontSize:13}}>{L?"Do your first body scan to see your stats here.":"Fais ton premier scan corporel pour voir tes stats ici."}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PLAN REPAS ───
function MealPlan({profile,onBack,user,t}) {
  const [plan,setPlan] = useState(null);
  const [load,setLoad] = useState(false);

  const generate = async () => {
    setLoad(true);
    try {
      const pc = profile?`Age: ${profile.age||"?"}ans, sexe: ${profile.sexe||"?"}, objectif: ${profile.objectif||"?"}, activite: ${profile.activite||"?"}, halal: ${profile.halal?"oui":"non"}.`:"Pas de profil.";
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:MEAL_PLAN_PROMPT,messages:[{role:"user",content:`Profil: ${pc} Génère un plan repas 7 jours adapté.`}]})
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setPlan(parsed);
    } catch(e) { console.error(e); }
    finally { setLoad(false); }
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("mealplan_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>{t("mealplan_sub")}</div>
      {!plan?(
        <button className="bem" onClick={generate} disabled={load}>
          {load?<Spin/>:t("mealplan_generate")}
        </button>
      ):(
        <div>
          {plan.semaine?.map((j,i)=>(
            <div key={i} className="card" style={{marginBottom:12}}>
              <div style={{color:GOLD,fontWeight:700,fontSize:13,marginBottom:10}}>📅 {j.jour}</div>
              {[[t("mealplan_breakfast"),j.petit_dej],[t("mealplan_lunch"),j.dejeuner],[t("mealplan_dinner"),j.diner],j.snack&&[t("mealplan_snack"),j.snack]].filter(Boolean).map(([l,v])=>(
                <div key={l} style={{marginBottom:6}}>
                  <span style={{color:MUT,fontSize:11}}>{l} : </span>
                  <span style={{fontSize:12,color:"#b0c8b8"}}>{v}</span>
                </div>
              ))}
              {j.nutriments_cibles?.length>0&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                  {j.nutriments_cibles.map(n=><span key={n} style={{background:`${EM}12`,color:EM,borderRadius:20,padding:"2px 8px",fontSize:10}}>{n}</span>)}
                </div>
              )}
            </div>
          ))}
          <button className="bgh" onClick={()=>setPlan(null)} style={{marginTop:10}}>{t("mealplan_regen")}</button>
        </div>
      )}
    </div>
  );
}

// ─── FAMILLE ───
function Family({user,family,onSave,onBack,onSwitchProfile,t}) {
  const [name,setName] = useState("");
  const [members,setMembers] = useState(family||[]);

  const add = () => {
    if(!name.trim())return;
    const newMembers = [...members,{name:name.trim(),id:Date.now()}];
    setMembers(newMembers);
    setName("");
    if(user?.uid&&!user?.isDemo) ScanService.saveFamily(user.uid,newMembers).catch(()=>{});
    onSave(newMembers);
  };

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("family_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>{t("family_sub")}</div>

      <div className="fu2" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:`${EM}14`,border:`1.5px solid ${EM}44`,borderRadius:16,padding:"14px 16px"}}>
          <div style={{width:44,height:44,borderRadius:12,background:`${EM}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👤</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:EM}}>{user.name} ({t("family_me")})</div>
            <div style={{fontSize:11,color:MUT,marginTop:2}}>{user.plan==="premium"?"👑 Premium":t("db_free").replace(" ·","")}</div>
          </div>
          <div style={{color:EM,fontSize:12,fontWeight:600}}>{t("family_active")}</div>
        </div>
        {members.map((m,i)=>(
          <button key={m.id} onClick={()=>onSwitchProfile(m)}
            style={{display:"flex",alignItems:"center",gap:10,background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${EM}44`}
            onMouseLeave={e=>e.currentTarget.style.border=`1px solid ${BDR}`}>
            <div style={{width:44,height:44,borderRadius:12,background:"#142018",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
              {["👶","👧","👦","👩","👨","👴","👵"][i%7]}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{m.name}</div>
              <div style={{fontSize:11,color:MUT,marginTop:2}}>{t("family_tap")}</div>
            </div>
            <div style={{color:MUT,fontSize:18}}>›</div>
          </button>
        ))}
      </div>

      <div className="fu3 card" style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{t("family_add_title")}</div>
        <Input value={name} onChange={setName} placeholder={t("family_add_ph")} left="👤"/>
        <button className="bem" onClick={add} disabled={!name.trim()}>{t("family_add_btn")}</button>
      </div>
    </div>
  );
}

// ─── DÉFI 30 JOURS ───
function Challenge({history,onBack,t,lang}) {
  const L = lang === "en";
  const done = Math.min(30, history?.length||0);
  const pct  = Math.round((done/30)*100);

  // Tâches quotidiennes du défi (tournent sur 30 jours)
  const TASKS_FR = [
    "Fais 10 scans cette semaine 🔬", "Bois 2L d'eau aujourd'hui 💧",
    "30 min de marche 👟", "Dors avant minuit 😴",
    "Pas de sucre ajouté aujourd'hui 🍫", "5 min de respiration profonde 🌬️",
    "Lis 10 pages d\'un livre 📚", "Fais 50 push-ups (total) 💪",
    "Mange 3 légumes différents 🥗", "Fais une chose que tu repousses depuis longtemps ⚡",
    "20 min sans téléphone 📵", "Fais 100 squats (total) 🦵",
    "Appelle un proche que tu n\'as pas vu 📞", "Lis 1 page de Coran 📖",
    "Mange un repas fait maison 🍳", "Fais 10 min de stretching 🧘",
    "Note 3 choses pour lesquelles tu es reconnaissant 🌿",
    "Pas de réseaux sociaux avant midi 🌅", "Fais une promenade dehors 🌳",
    "Bois du thé vert ou tisane 🍵", "Fais 20 min de sport 🏃",
    "Couche-toi 30 min plus tôt que d'habitude 💤",
    "Cuisine quelque chose de sain que tu n\'as jamais fait 🥘",
    "Fais du bien à quelqu'un aujourd'hui ❤️",
    "10 min de méditation ou dhikr 🌙", "Pas de fast food aujourd'hui 🚫",
    "Lis sur un sujet qui t'intéresse 🧠", "Fais 3 séries de 20 sit-ups 🔥",
    "Prépare tes vêtements et repas pour demain 📋",
    "Récompense-toi — tu as terminé ! 🏆"
  ];

  const TASKS_EN = [
    "Do 10 scans this week 🔬", "Drink 2L of water today 💧",
    "30 min walk 👟", "Sleep before midnight 😴",
    "No added sugar today 🍫", "5 min deep breathing 🌬️",
    "Read 10 pages of a book 📚", "Do 50 push-ups (total) 💪",
    "Eat 3 different vegetables 🥗", "Do one thing you've been putting off ⚡",
    "20 min without phone 📵", "Do 100 squats (total) 🦵",
    "Call someone you haven't seen 📞", "Read 1 page of Quran 📖",
    "Eat a home-cooked meal 🍳", "Do 10 min of stretching 🧘",
    "Write 3 things you're grateful for 🌿",
    "No social media before noon 🌅", "Take a walk outside 🌳",
    "Drink green tea or herbal tea 🍵", "Do 20 min of exercise 🏃",
    "Go to sleep 30 min earlier than usual 💤",
    "Cook something healthy you've never made 🥘",
    "Do something good for someone today ❤️",
    "10 min meditation or dhikr 🌙", "No fast food today 🚫",
    "Read about a topic that interests you 🧠", "Do 3 sets of 20 sit-ups 🔥",
    "Prepare clothes and meals for tomorrow 📋",
    "Reward yourself — you finished! 🏆"
  ];

  const TASKS = L ? TASKS_EN : TASKS_FR;
  const todayTask = done < 30 ? TASKS[done] : TASKS[29];
  const nextTask  = done < 29 ? TASKS[done+1] : null;

  const badges = [
    {day:1,  icon:"🌱", label:t("badge_first"), color:"#22c55e"},
    {day:5,  icon:"⚡", label:t("badge_5"),     color:"#fbbf24"},
    {day:10, icon:"🔥", label:t("badge_10"),    color:"#f97316"},
    {day:15, icon:"💎", label:L?"Half way!":"Mi-chemin !", color:"#38bdf8"},
    {day:20, icon:"🏆", label:t("badge_20"),    color:"#a855f7"},
    {day:30, icon:"👑", label:t("badge_30"),    color:GOLD},
  ];

  // Grille 30 jours
  const days = Array.from({length:30},(_,i)=>i+1);

  return (
    <div style={{minHeight:"100vh",background:"#060d08",overflowY:"auto",paddingBottom:60}}>
      {/* Header */}
      <div style={{padding:"52px 20px 24px",background:`radial-gradient(ellipse at 50% 0%,${GOLD}18 0%,#060d08 65%)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
        <div style={{textAlign:"center",marginBottom:4}}>
          <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>⚡ {L?"30-DAY CHALLENGE":"DÉFI 30 JOURS"}</div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:28,fontWeight:900,color:"#edf5ef",marginBottom:6}}>
            {done>=30 ? (L?"YOU DID IT! 👑":"TU L\'AS FAIT ! 👑") : L?"Build the habit":"Construis l'habitude"}
          </div>
          <div style={{color:MUT,fontSize:13}}>{L?"1 scan per day = 1 day completed":"1 scan par jour = 1 jour complété"}</div>
        </div>
      </div>

      <div style={{padding:"0 20px"}}>
        {/* Score principal */}
        <div style={{background:CARD,border:`1.5px solid ${GOLD}44`,borderRadius:22,padding:20,marginBottom:16,textAlign:"center"}}>
          {/* Cercle */}
          <div style={{position:"relative",width:140,height:140,margin:"0 auto 16px"}}>
            <svg viewBox="0 0 140 140" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
              <circle cx="70" cy="70" r="58" fill="none" stroke={BDR} strokeWidth="8"/>
              <circle cx="70" cy="70" r="58" fill="none" stroke={done>=30?EM:GOLD}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(pct/100)*364} 364`}
                style={{transition:"stroke-dasharray 1s ease",filter:`drop-shadow(0 0 6px ${GOLD})`}}/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
              <div style={{fontSize:40,fontWeight:900,color:done>=30?EM:GOLD,lineHeight:1}}>{done}</div>
              <div style={{fontSize:12,color:MUT}}>/ 30</div>
            </div>
          </div>
          <div style={{fontSize:14,color:"#edf5ef",fontWeight:700,marginBottom:4}}>
            {done>=30 ? "🏆 "+( L?"Challenge Complete!":"Défi Terminé !") :
             done>0   ? `${30-done} ${L?"days left":"jours restants"}` :
             L?"Start your first scan!":"Commence ton premier scan !"}
          </div>
          <div style={{fontSize:11,color:MUT}}>{pct}% {L?"completed":"complété"}</div>
        </div>

        {/* Tâche du jour */}
        {done < 30 && (
          <div style={{background:"linear-gradient(135deg,#1a1000,#2a1a00)",border:`1.5px solid ${GOLD}55`,borderRadius:20,padding:18,marginBottom:16}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:.8,marginBottom:10}}>
              ⚡ {L?"TODAY'S MISSION — DAY":"MISSION DU JOUR — JOUR"} {done+1}
            </div>
            <div style={{fontSize:16,color:"#edf5ef",fontWeight:700,lineHeight:1.4,marginBottom:8}}>{todayTask}</div>
            {nextTask && (
              <div style={{fontSize:11,color:MUT,marginTop:8}}>
                {L?"Next:":"Demain :"} {nextTask}
              </div>
            )}
          </div>
        )}

        {/* Grille 30 jours */}
        <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:10}}>
          📅 {L?"YOUR 30 DAYS":"VOS 30 JOURS"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:20}}>
          {days.map(d => {
            const isDone    = d <= done;
            const isToday   = d === done + 1;
            const isFuture  = d > done + 1;
            return (
              <div key={d} style={{
                aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
                borderRadius:12,fontSize:12,fontWeight:700,
                background: isDone ? `${GOLD}20` : isToday ? `${EM}15` : CARD,
                border:`1.5px solid ${isDone?GOLD:isToday?EM:BDR}`,
                color: isDone ? GOLD : isToday ? EM : MUT,
                position:"relative"
              }}>
                {isDone ? "✓" : d}
                {isToday && <div style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:EM}}/>}
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div style={{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.8,marginBottom:12}}>
          🏅 {L?"BADGES":"BADGES"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {badges.map(b=>(
            <div key={b.day} style={{
              background:done>=b.day?`${b.color}15`:CARD,
              border:`1.5px solid ${done>=b.day?b.color:BDR}`,
              borderRadius:16,padding:"14px 8px",textAlign:"center",transition:"all .3s"
            }}>
              <div style={{fontSize:28,marginBottom:6,filter:done>=b.day?"none":"grayscale(1) opacity(0.3)"}}>{b.icon}</div>
              <div style={{fontWeight:700,fontSize:11,color:done>=b.day?b.color:"#edf5ef",lineHeight:1.2}}>{b.label}</div>
              <div style={{fontSize:9,color:MUT,marginTop:2}}>{L?"Day":"Jour"} {b.day}</div>
              {done>=b.day&&<div style={{color:b.color,fontSize:9,fontWeight:700,marginTop:4}}>✓ {L?"Unlocked":"Débloqué"}</div>}
            </div>
          ))}
        </div>

        {/* Conseil motivation */}
        <div style={{background:"linear-gradient(135deg,#0a1505,#0d1a08)",border:`1px solid ${EM}22`,borderRadius:18,padding:18,textAlign:"center"}}>
          <div style={{fontSize:20,marginBottom:8}}>🌿</div>
          <div style={{fontSize:13,color:"#b8d4bc",fontStyle:"italic",lineHeight:1.7}}>
            {L
              ? '"The deeds most beloved to Allah are those done regularly, even if they are small." — Sahih al-Bukhari'
              : '"Les actes les plus aimés d\'Allah sont ceux accomplis régulièrement, même s\'ils sont peu nombreux." — Sahih al-Bukhari'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAYWALL ───
function Paywall({user,onBack,onSuccess,t}) {
  const [secs,setSecs]=useState(12*60);
  const [tab,setTab]=useState("features"); // features | beforeafter | reviews
  useEffect(()=>{const timer=setInterval(()=>setSecs(s=>s>0?s-1:0),1000);return()=>clearInterval(timer);},[]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");
  const urgent=secs<3*60;
  const L = t("back")==="← Back";

  const handleCheckout=()=>{
    const url=`https://buy.stripe.com/9B6bJ17TC4dr9xfgdE5Rm01?prefilled_email=${encodeURIComponent(user?.email||"")}&client_reference_id=${user?.uid||""}`;
    window.location.href=url;
  };

  const BEFORE_AFTER = [
    {name:"Karim, 24 ans",before:"Pas de programme · Stagne depuis 6 mois",after:"PPL 6j/sem · +15kg bench en 8 semaines",icon:"🏋️"},
    {name:"Sarah, 31 ans",before:"Carence Fer & Vit D non détectée",after:"Scan ongles → supplémentation → +30% énergie",icon:"💊"},
    {name:"Youssef, 28 ans",before:"Poids du corps jamais progressé",after:"Cali Débutant → Muscle-up en 12 semaines",icon:"🤸"},
  ];

  const REVIEWS = [
    {name:"Mehdi R.",stars:5,text:L?"The gym program is insane. I finally know exactly what weight to use and it auto-increases every week.":"Le programme gym est incroyable. Je sais exactement quel poids mettre et ça augmente tout seul chaque semaine.",icon:"🏋️"},
    {name:"Amira K.",stars:5,text:L?"The nail scan detected my iron deficiency before my blood test did. Unbelievable.":"Le scan ongles a détecté ma carence en fer avant ma prise de sang. Incroyable.",icon:"💅"},
    {name:"Ibrahim T.",stars:5,text:L?"Calisthenics program is exactly what I needed. Clear progressions, illustrations for each exercise.":"Programme calisthenics exactement ce qu'il me fallait. Progressions claires, illustrations pour chaque exercice.",icon:"🤸"},
  ];

  return (
    <div style={{minHeight:"100vh",paddingBottom:40,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 22px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>

        {/* Timer urgence */}
        <div style={{background:urgent?"#1a0505":"#0f1505",border:`1.5px solid ${urgent?DANGER:GOLD}44`,borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,color:urgent?DANGER:GOLD,fontWeight:700,letterSpacing:1}}>{urgent?(L?"🔥 OFFER EXPIRING":"🔥 OFFRE EXPIRE"):(L?"⏰ LAUNCH OFFER":"⏰ OFFRE LANCEMENT")}</div>
            <div style={{fontSize:28,fontWeight:700,color:urgent?DANGER:GOLD,fontVariantNumeric:"tabular-nums",animation:urgent?"pulse 1s ease infinite":undefined}}>{mm}:{ss}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:MUT,textDecoration:"line-through"}}>9,99$ CAD/mois</div>
            <div style={{fontSize:22,fontWeight:700,color:GOLD}}>4,99$<span style={{fontSize:12,fontWeight:400}}> CAD/mois</span></div>
            <div style={{fontSize:10,color:EM,fontWeight:700}}>✅ -{L?"50% launch price":"50% tarif lancement"}</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:10}}>👑</div>
          <div className="serif" style={{fontSize:28,fontWeight:700,color:GOLD,marginBottom:8}}>VitaScann Premium</div>
          <div style={{color:MUT,fontSize:14,lineHeight:1.7,maxWidth:320,margin:"0 auto"}}>
            {L?"The first app that scans your health AND builds your training program.":"La première app qui scanne ta santé ET construit ton programme d'entraînement."}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[["features",L?"Features":"Features"],["beforeafter",L?"Before/After":"Avant/Après"],["reviews",L?"Reviews":"Avis"]].map(([k,lb])=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{flex:1,background:tab===k?`${GOLD}18`:"transparent",border:`1.5px solid ${tab===k?GOLD:BDR}`,borderRadius:10,padding:"8px 4px",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,color:tab===k?GOLD:MUT,cursor:"pointer"}}>
              {lb}
            </button>
          ))}
        </div>

        {/* TAB: Features */}
        {tab==="features" && (
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {[
              {ic:"🍽️",title:L?"Unlimited Meal Scan":"Scan Repas illimité",sub:L?"Photo + Manual + Label scan + Halal check":"Photo + Manuel + Étiquette + Vérif Halal",color:GOLD},
              {ic:"🔬",title:L?"Full body scan — 11 zones":"Scan corporel — 11 zones",sub:L?"Nails, eyes, skin, teeth, beard, body fat...":"Ongles, yeux, peau, dents, barbe, % gras...",color:"#38bdf8"},
              {ic:"💪",title:L?"Full Body Coach — 30 exercises":"Coach Corps Complet — 30 exercices",sub:L?"Calisthenics + Mobility + Longevity":"Calisthenics + Mobilité + Longévité",color:EM},
              {ic:"🤰",title:L?"Maternity & Movement":"Maternité & Mouvement",sub:L?"24 exercises · Week tracker · Nutrition":"24 exercices · Suivi semaine · Nutrition",color:"#f9a8d4"},
              {ic:"✨",title:L?"Motivation & Gratitude — Unlimited":"Motivation & Gratitude — Illimité",sub:L?"Daily AI affirmations + Journal":"Affirmations IA quotidiennes + Journal",color:"#c084fc"},
              {ic:"🛡️",title:L?"Immunity Score — Unlimited":"Score Immunité — Illimité",sub:L?"7 habits + 7-day plan + Tibb an-Nabawi":"7 habitudes + plan 7j + Tibb an-Nabawi",color:"#06b6d4"},
              {ic:"⚡",title:L?"Energy Score + AI schedule":"Score Énergie + Planning IA",sub:L?"Personalized hourly schedule":"Horaire personnalisé par IA",color:"#fbbf24"},
              {ic:"🔮",title:L?"Emotional Health + Mindset":"Santé Émotionnelle + Mindset",sub:L?"Frequencies + Warrior profiles":"Fréquences + Profils Guerrier",color:"#f97316"},
              {ic:"🌙",title:L?"Tibb an-Nabawi":"Tibb an-Nabawi",sub:L?"Islamic medicine integrated in every module":"Médecine islamique intégrée partout",color:GOLD},
              {ic:"💬",title:L?"AI Nutritionist chat":"Chat nutritionniste IA",sub:L?"After every scan":"Après chaque scan",color:"#38bdf8"},
            ].map(({ic,title,sub,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}28`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ic}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#edf5ef"}}>{title}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:2}}>{sub}</div>
                </div>
                <div style={{color:EM,fontSize:14}}>✓</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Avant/Après */}
        {tab==="beforeafter" && (
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
            {BEFORE_AFTER.map((ba,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:18,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${BDR}`,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${EM}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ba.icon}</div>
                  <div style={{fontWeight:700,fontSize:13}}>{ba.name}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                  <div style={{padding:"14px 16px",borderRight:`1px solid ${BDR}`}}>
                    <div style={{fontSize:10,color:DANGER,fontWeight:700,letterSpacing:.8,marginBottom:6}}>{L?"BEFORE":"AVANT"}</div>
                    <div style={{fontSize:12,color:MUT,lineHeight:1.6}}>{ba.before}</div>
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:10,color:EM,fontWeight:700,letterSpacing:.8,marginBottom:6}}>{L?"AFTER":"APRÈS"}</div>
                    <div style={{fontSize:12,color:"#a0bcaa",lineHeight:1.6}}>{ba.after}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{background:`${EM}08`,border:`1px solid ${EM}22`,borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
              <div style={{fontSize:13,color:EM,fontWeight:700}}>{L?"Results vary. Commitment required.":"Résultats variables. Engagement requis."}</div>
              <div style={{fontSize:11,color:MUT,marginTop:4}}>{L?"These are real user experiences.":"Ce sont de vraies expériences utilisateurs."}</div>
            </div>
          </div>
        )}

        {/* TAB: Avis */}
        {tab==="reviews" && (
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12,background:CARD,borderRadius:14,padding:"14px 16px",marginBottom:4}}>
              <div style={{textAlign:"center"}}>
                <div className="serif" style={{fontSize:40,fontWeight:700,color:GOLD}}>4.9</div>
                <div style={{display:"flex",gap:2,justifyContent:"center"}}>{"⭐⭐⭐⭐⭐".split("").map((s,i)=><span key={i} style={{fontSize:12}}>{s}</span>)}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{L?"128 ratings":"128 avis"}</div>
              </div>
              <div style={{flex:1,paddingLeft:12}}>
                {[5,4,3].map(star=>(
                  <div key={star} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <div style={{fontSize:10,color:MUT,width:8}}>{star}</div>
                    <div style={{flex:1,background:"#142018",borderRadius:3,height:5,overflow:"hidden"}}>
                      <div style={{width:star===5?"82%":star===4?"13%":"5%",height:"100%",background:star===5?GOLD:star===4?WARN:MUT,borderRadius:3}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {REVIEWS.map((r,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:8,background:`${GOLD}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{r.icon}</div>
                    <div style={{fontWeight:700,fontSize:13}}>{r.name}</div>
                  </div>
                  <div style={{fontSize:12}}>⭐⭐⭐⭐⭐</div>
                </div>
                <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7,fontStyle:"italic"}}>"{r.text}"</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA fixe */}
        <div style={{background:"linear-gradient(180deg,transparent,#060d08 30%)",paddingTop:8}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"center",alignItems:"baseline",gap:10,marginBottom:4}}>
              <span style={{color:MUT,fontSize:14,textDecoration:"line-through"}}>9,99$</span>
              <div className="serif" style={{fontSize:42,fontWeight:700,color:GOLD}}>4,99<span style={{fontSize:18}}> $ CAD/mois</span></div>
            </div>
            <div style={{color:MUT,fontSize:12}}>{L?"per month · Cancel anytime":"par mois · Annulez quand vous voulez"}</div>
          </div>

          <button className="bgold" onClick={handleCheckout} style={{marginBottom:10,fontSize:16,padding:"18px",width:"100%"}}>
            {L?"💳 Subscribe now →":"💳 S'abonner maintenant →"}
          </button>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[["🔒",L?"Secure payment":"Paiement sécurisé"],["❌",L?"No commitment":"Sans engagement"],["💬",L?"Fast support":"Support rapide"]].map(([ic,lb])=>(
              <div key={lb} style={{background:CARD,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontSize:16,marginBottom:3}}>{ic}</div>
                <div style={{fontSize:9,color:MUT,lineHeight:1.4}}>{lb}</div>
              </div>
            ))}
          </div>

          <div style={{background:"#0a1a0c",border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontSize:11,color:MUT,lineHeight:1.6,textAlign:"center"}}>
            {L?"⚠️ VitaScann provides indicative nutritional clues, not medical diagnoses.":"⚠️ VitaScann fournit des pistes nutritionnelles indicatives, pas des diagnostics médicaux."}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── GYM SVG ILLUSTRATIONS ───
// Style : silhouette noire musclée, flat design, Calisthenics Bonhomme style

// ─── ANIMATIONS CSS GLOBALES EXERCICES ───
const EXANIM_CSS = `
@keyframes ex-pushup{0%,100%{transform:translateY(0)}50%{transform:translateY(22px)}}
@keyframes ex-pullup{0%,100%{transform:translateY(18px)}50%{transform:translateY(0)}}
@keyframes ex-squat{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(18px) scaleY(.85)}}
@keyframes ex-curl{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-55deg)}}
@keyframes ex-ohp{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes ex-deadlift{0%,100%{transform:rotate(0deg)}45%{transform:rotate(-34deg)}55%{transform:rotate(-34deg)}}
@keyframes ex-dip{0%,100%{transform:translateY(0)}50%{transform:translateY(17px)}}
@keyframes ex-row{0%,100%{transform:translateX(0)}50%{transform:translateX(-16px)}}
@keyframes ex-lat{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-28deg)}}
@keyframes ex-muscleup{0%,100%{transform:translateY(20px)}45%,55%{transform:translateY(-6px)}}
@keyframes ex-plank{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.05)}}
@keyframes ex-lsit{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes ex-hspu{0%,100%{transform:translateY(0)}50%{transform:translateY(20px)}}
@keyframes ex-pistol{0%,100%{transform:translateY(0)}50%{transform:translateY(16px)}}
@keyframes ex-leg{0%,100%{transform:rotate(0deg)}50%{transform:rotate(18deg)}}
@keyframes ex-lateral{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-38deg)}}
`;

// Inject animation CSS once
if(typeof document!=="undefined"&&!document.getElementById("ex-anim-css")){
  const s=document.createElement("style");
  s.id="ex-anim-css";
  s.textContent=EXANIM_CSS;
  document.head.appendChild(s);
}

// ─── GYM SVG ANIMÉ — style silhouette noire fond clair ───
function GymExSVG({id, size=120}) {
  const BG="#f0f0f0", BK="#111111", ACC="#38bdf8", BAR="#666", PLATE="#e44444", CABLE="#f97316";
  const DUR = {fast:"1.3s", med:"1.7s", slow:"2.1s"};

  const svgs = {

    // ── LAT PULLDOWN ──
    lat_pulldown: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="10" y="5" width="80" height="7" rx="3" fill="#444"/>
        <rect x="43" y="12" width="14" height="38" rx="3" fill="#888"/>
        <rect x="24" y="5" width="7" height="16" rx="2" fill="#555"/>
        <rect x="69" y="5" width="7" height="16" rx="2" fill="#555"/>
        <line x1="50" y1="26" x2="28" y2="46" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="50" y1="26" x2="72" y2="46" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="18" y="44" width="64" height="6" rx="3" fill={BK}/>
        <g style={{animation:`ex-lat ${DUR.med} ease-in-out infinite`,transformOrigin:"50px 62px"}}>
          <circle cx="50" cy="62" r="9" fill={BK}/>
          <rect x="38" y="71" width="24" height="15" rx="7" fill={BK}/>
          <line x1="40" y1="69" x2="22" y2="50" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="69" x2="78" y2="50" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="44" y1="86" x2="38" y2="100" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="56" y1="86" x2="62" y2="100" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M38 72 Q28 77 30 86 Q38 81 42 74Z" fill={ACC} opacity=".45"/>
          <path d="M62 72 Q72 77 70 86 Q62 81 58 74Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── CABLE ROW ──
    cable_row: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="4" y="55" width="28" height="42" rx="4" fill="#555"/>
        <rect x="6" y="38" width="22" height="20" rx="3" fill="#888"/>
        <circle cx="17" cy="48" r="8" fill="#333" stroke={PLATE} strokeWidth="2"/>
        <line x1="30" y1="68" x2="58" y2="68" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="56" y="64" width="10" height="8" rx="3" fill={BAR}/>
        <circle cx="78" cy="38" r="9" fill={BK}/>
        <rect x="66" y="47" width="24" height="18" rx="7" fill={BK}/>
        <line x1="66" y1="58" x2="56" y2="72" stroke={BK} strokeWidth="6" strokeLinecap="round" style={{animation:`ex-row ${DUR.med} ease-in-out infinite`}}/>
        <line x1="72" y1="65" x2="60" y2="78" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <line x1="84" y1="65" x2="92" y2="95" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <path d="M66 50 Q56 53 57 62 Q65 58 68 52Z" fill={ACC} opacity=".45"/>
      </svg>
    ),

    // ── SEATED ROW ──
    seated_row: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="4" y="52" width="32" height="46" rx="4" fill="#555"/>
        <rect x="8" y="36" width="24" height="20" rx="3" fill="#888"/>
        <rect x="32" y="66" width="20" height="8" rx="4" fill="#444"/>
        <line x1="52" y1="70" x2="68" y2="70" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="66" y="66" width="10" height="8" rx="3" fill={BAR}/>
        <circle cx="80" cy="42" r="9" fill={BK}/>
        <rect x="68" y="51" width="24" height="18" rx="7" fill={BK}/>
        <g style={{animation:`ex-row ${DUR.med} ease-in-out infinite`,transformOrigin:"74px 62px"}}>
          <line x1="70" y1="62" x2="66" y2="70" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
        </g>
        <line x1="74" y1="69" x2="66" y2="95" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <line x1="84" y1="69" x2="92" y2="95" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <path d="M70 54 Q60 57 61 66 Q69 62 72 56Z" fill={ACC} opacity=".45"/>
      </svg>
    ),

    // ── DEADLIFT ──
    deadlift: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="94" x2="95" y2="94" stroke="#ccc" strokeWidth="2"/>
        <rect x="14" y="82" width="72" height="6" rx="2" fill={BAR}/>
        <rect x="8" y="76" width="11" height="18" rx="5" fill={PLATE}/>
        <rect x="81" y="76" width="11" height="18" rx="5" fill={PLATE}/>
        <g style={{animation:`ex-deadlift ${DUR.slow} ease-in-out infinite`,transformOrigin:"50px 66px"}}>
          <circle cx="50" cy="20" r="10" fill={BK}/>
          <line x1="50" y1="30" x2="50" y2="64" stroke={BK} strokeWidth="12" strokeLinecap="round"/>
          <line x1="44" y1="46" x2="22" y2="72" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="56" y1="46" x2="78" y2="72" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="45" y1="64" x2="36" y2="94" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <line x1="55" y1="64" x2="64" y2="94" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <path d="M43 34 Q33 40 34 52 Q43 47 47 38Z" fill={ACC} opacity=".4"/>
          <path d="M57 34 Q67 40 66 52 Q57 47 53 38Z" fill={ACC} opacity=".4"/>
        </g>
      </svg>
    ),

    // ── BENCH PRESS ──
    bench_press: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="14" y="72" width="72" height="10" rx="5" fill="#444"/>
        <rect x="18" y="82" width="10" height="16" rx="3" fill="#555"/>
        <rect x="72" y="82" width="10" height="16" rx="3" fill="#555"/>
        <rect x="58" y="36" width="5" height="40" rx="2" fill="#555"/>
        <rect x="37" y="36" width="5" height="40" rx="2" fill="#555"/>
        <g style={{animation:`ex-ohp ${DUR.med} ease-in-out infinite`}}>
          <rect x="14" y="42" width="72" height="7" rx="3" fill={BAR}/>
          <rect x="8" y="37" width="11" height="17" rx="5" fill={PLATE}/>
          <rect x="81" y="37" width="11" height="17" rx="5" fill={PLATE}/>
        </g>
        <ellipse cx="50" cy="66" rx="20" ry="8" fill={BK}/>
        <circle cx="50" cy="57" r="9" fill={BK}/>
        <g style={{animation:`ex-ohp ${DUR.med} ease-in-out infinite`}}>
          <line x1="30" y1="66" x2="16" y2="48" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="70" y1="66" x2="84" y2="48" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
        </g>
        <line x1="36" y1="72" x2="28" y2="90" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <line x1="64" y1="72" x2="72" y2="90" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <path d="M35 64 Q25 66 26 74 Q34 70 37 65Z" fill={ACC} opacity=".45"/>
        <path d="M65 64 Q75 66 74 74 Q66 70 63 65Z" fill={ACC} opacity=".45"/>
      </svg>
    ),

    // ── INCLINE PRESS ──
    incline_press: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="15" y1="95" x2="85" y2="68" stroke="#444" strokeWidth="7" strokeLinecap="round"/>
        <rect x="14" y="90" width="12" height="10" rx="3" fill="#555"/>
        <rect x="72" y="82" width="10" height="10" rx="3" fill="#555"/>
        <rect x="60" y="28" width="5" height="44" rx="2" fill="#555"/>
        <g style={{animation:`ex-ohp ${DUR.med} ease-in-out infinite`}}>
          <rect x="14" y="36" width="70" height="7" rx="3" fill={BAR}/>
          <rect x="8" y="31" width="11" height="17" rx="5" fill={PLATE}/>
          <rect x="81" y="31" width="11" height="17" rx="5" fill={PLATE}/>
        </g>
        <ellipse cx="50" cy="62" rx="18" ry="8" fill={BK} transform="rotate(-12 50 62)"/>
        <circle cx="52" cy="53" r="9" fill={BK}/>
        <g style={{animation:`ex-ohp ${DUR.med} ease-in-out infinite`}}>
          <line x1="33" y1="62" x2="18" y2="44" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="67" y1="58" x2="82" y2="42" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
        </g>
        <path d="M35 60 Q25 63 26 71 Q34 67 37 62Z" fill={ACC} opacity=".45"/>
      </svg>
    ),

    // ── CABLE FLY ──
    cable_fly: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="2" y="18" width="13" height="68" rx="3" fill="#555"/>
        <rect x="85" y="18" width="13" height="68" rx="3" fill="#555"/>
        <circle cx="8" cy="52" r="7" fill="#333" stroke={PLATE} strokeWidth="2"/>
        <circle cx="92" cy="52" r="7" fill="#333" stroke={PLATE} strokeWidth="2"/>
        <line x1="15" y1="52" x2="36" y2="68" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="85" y1="52" x2="64" y2="68" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <circle cx="50" cy="28" r="9" fill={BK}/>
        <rect x="38" y="37" width="24" height="24" rx="8" fill={BK}/>
        <g style={{animation:`ex-lateral ${DUR.med} ease-in-out infinite`,transformOrigin:"50px 50px"}}>
          <line x1="40" y1="48" x2="18" y2="64" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="48" x2="82" y2="64" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
        </g>
        <line x1="46" y1="61" x2="40" y2="95" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <line x1="54" y1="61" x2="60" y2="95" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <path d="M34 62 Q22 58 22 50 Q30 54 36 62Z" fill={ACC} opacity=".4"/>
        <path d="M66 62 Q78 58 78 50 Q70 54 64 62Z" fill={ACC} opacity=".4"/>
      </svg>
    ),

    // ── OVERHEAD PRESS ──
    ohp_barbell: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <circle cx="50" cy="38" r="10" fill={BK}/>
        <rect x="38" y="48" width="24" height="24" rx="8" fill={BK}/>
        <line x1="44" y1="72" x2="38" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <line x1="56" y1="72" x2="62" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <g style={{animation:`ex-ohp ${DUR.med} ease-in-out infinite`}}>
          <line x1="40" y1="54" x2="16" y2="30" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="54" x2="84" y2="30" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <rect x="8" y="23" width="84" height="7" rx="3" fill={BAR}/>
          <rect x="3" y="18" width="10" height="17" rx="5" fill={PLATE}/>
          <rect x="87" y="18" width="10" height="17" rx="5" fill={PLATE}/>
          <path d="M26 44 Q14 37 14 27 Q24 32 28 43Z" fill={ACC} opacity=".5"/>
          <path d="M74 44 Q86 37 86 27 Q76 32 72 43Z" fill={ACC} opacity=".5"/>
        </g>
      </svg>
    ),

    // ── LATERAL RAISE ──
    lateral_raise: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <circle cx="50" cy="28" r="10" fill={BK}/>
        <rect x="38" y="38" width="24" height="26" rx="8" fill={BK}/>
        <line x1="44" y1="64" x2="38" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <line x1="56" y1="64" x2="62" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <g style={{animation:`ex-lateral ${DUR.med} ease-in-out infinite`,transformOrigin:"50px 50px"}}>
          <line x1="40" y1="48" x2="10" y2="48" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="48" x2="90" y2="48" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <rect x="2" y="43" width="13" height="10" rx="5" fill={PLATE}/>
          <rect x="85" y="43" width="13" height="10" rx="5" fill={PLATE}/>
          <path d="M28 46 Q16 40 17 31 Q26 36 30 45Z" fill={ACC} opacity=".5"/>
          <path d="M72 46 Q84 40 83 31 Q74 36 70 45Z" fill={ACC} opacity=".5"/>
        </g>
      </svg>
    ),

    // ── SQUAT ──
    squat: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <rect x="5" y="22" width="6" height="74" rx="3" fill="#999"/>
        <rect x="89" y="22" width="6" height="74" rx="3" fill="#999"/>
        <rect x="11" y="36" width="20" height="6" rx="2" fill="#999"/>
        <rect x="69" y="36" width="20" height="6" rx="2" fill="#999"/>
        <rect x="16" y="34" width="68" height="7" rx="3" fill={BAR}/>
        <rect x="10" y="29" width="10" height="17" rx="5" fill={PLATE}/>
        <rect x="80" y="29" width="10" height="17" rx="5" fill={PLATE}/>
        <g style={{animation:`ex-squat ${DUR.slow} ease-in-out infinite`,transformOrigin:"50px 56px"}}>
          <circle cx="50" cy="32" r="10" fill={BK}/>
          <rect x="38" y="42" width="24" height="22" rx="8" fill={BK}/>
          <line x1="42" y1="42" x2="18" y2="38" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="58" y1="42" x2="82" y2="38" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="45" y1="64" x2="32" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <line x1="55" y1="64" x2="68" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <path d="M43 66 Q31 74 32 86 Q40 80 44 70Z" fill={ACC} opacity=".38"/>
          <path d="M57 66 Q69 74 68 86 Q60 80 56 70Z" fill={ACC} opacity=".38"/>
        </g>
      </svg>
    ),

    // ── LEG PRESS ──
    leg_press: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="4" y="48" width="38" height="50" rx="4" fill="#555"/>
        <rect x="4" y="26" width="38" height="26" rx="3" fill="#888"/>
        <rect x="44" y="36" width="26" height="26" rx="3" fill="#666"/>
        <rect x="42" y="30" width="8" height="36" rx="2" fill="#555"/>
        <rect x="72" y="36" width="12" height="20" rx="3" fill={PLATE}/>
        <circle cx="26" cy="40" r="9" fill={BK}/>
        <rect x="14" y="49" width="24" height="16" rx="7" fill={BK}/>
        <g style={{animation:`ex-leg ${DUR.med} ease-in-out infinite`,transformOrigin:"22px 64px"}}>
          <line x1="22" y1="65" x2="46" y2="55" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="28" y1="65" x2="50" y2="58" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M26 64 Q36 57 46 56 Q40 64 32 68Z" fill={ACC} opacity=".38"/>
        </g>
      </svg>
    ),

    // ── LEG CURL ──
    leg_curl: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="4" y="50" width="92" height="14" rx="6" fill="#555"/>
        <rect x="8" y="64" width="14" height="32" rx="4" fill="#666"/>
        <rect x="78" y="64" width="14" height="32" rx="4" fill="#666"/>
        <rect x="58" y="36" width="22" height="14" rx="6" fill="#444"/>
        <circle cx="26" cy="44" r="9" fill={BK}/>
        <line x1="26" y1="53" x2="72" y2="53" stroke={BK} strokeWidth="10" strokeLinecap="round"/>
        <g style={{animation:`ex-leg ${DUR.med} ease-in-out infinite`,transformOrigin:"74px 53px"}}>
          <line x1="74" y1="53" x2="74" y2="36" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="74" y1="36" x2="62" y2="42" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <path d="M66 50 Q70 38 76 36 Q78 46 72 52Z" fill={ACC} opacity=".4"/>
        </g>
      </svg>
    ),

    // ── CURL BARRE ──
    curl_barre: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <circle cx="50" cy="22" r="10" fill={BK}/>
        <rect x="38" y="32" width="24" height="28" rx="8" fill={BK}/>
        <line x1="44" y1="60" x2="38" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <line x1="56" y1="60" x2="62" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <g style={{animation:`ex-curl ${DUR.fast} ease-in-out infinite`,transformOrigin:"40px 46px"}}>
          <line x1="40" y1="46" x2="18" y2="56" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <rect x="8" y="51" width="18" height="8" rx="4" fill={BK}/>
          <rect x="3" y="47" width="8" height="16" rx="4" fill={PLATE}/>
          <rect x="22" y="47" width="8" height="16" rx="4" fill={PLATE}/>
          <path d="M28 44 Q17 40 17 31 Q26 35 30 44Z" fill={ACC} opacity=".55"/>
        </g>
        <g style={{animation:`ex-curl ${DUR.fast} ease-in-out infinite .65s`,transformOrigin:"60px 46px"}}>
          <line x1="60" y1="46" x2="82" y2="56" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <rect x="72" y="51" width="18" height="8" rx="4" fill={BK}/>
          <rect x="69" y="47" width="8" height="16" rx="4" fill={PLATE}/>
          <rect x="88" y="47" width="8" height="16" rx="4" fill={PLATE}/>
          <path d="M72 44 Q83 40 83 31 Q74 35 70 44Z" fill={ACC} opacity=".55"/>
        </g>
      </svg>
    ),

    // ── CURL HALTÈRES ──
    curl_halter: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <circle cx="50" cy="22" r="10" fill={BK}/>
        <rect x="38" y="32" width="24" height="28" rx="8" fill={BK}/>
        <line x1="44" y1="60" x2="38" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <line x1="56" y1="60" x2="62" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
        <g style={{animation:`ex-curl ${DUR.fast} ease-in-out infinite`,transformOrigin:"40px 46px"}}>
          <line x1="40" y1="46" x2="22" y2="62" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <rect x="12" y="58" width="16" height="8" rx="4" fill={PLATE}/>
          <path d="M28 44 Q17 40 17 31 Q26 35 30 44Z" fill={ACC} opacity=".55"/>
        </g>
        <line x1="60" y1="46" x2="78" y2="68" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
        <rect x="72" y="64" width="16" height="8" rx="4" fill={PLATE}/>
      </svg>
    ),

    // ── TRICEP PUSHDOWN ──
    tricep_pushdown: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="38" y="4" width="24" height="7" rx="3" fill="#444"/>
        <rect x="44" y="11" width="12" height="32" rx="3" fill="#888"/>
        <line x1="50" y1="32" x2="38" y2="52" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="28" y="49" width="22" height="6" rx="3" fill={BK}/>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <circle cx="68" cy="28" r="9" fill={BK}/>
        <rect x="56" y="37" width="24" height="22" rx="8" fill={BK}/>
        <line x1="60" y1="59" x2="54" y2="96" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <line x1="68" y1="59" x2="74" y2="96" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
        <g style={{animation:`ex-curl ${DUR.fast} ease-in-out infinite`,transformOrigin:"62px 50px"}}>
          <line x1="62" y1="50" x2="50" y2="38" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="62" y1="50" x2="50" y2="55" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <path d="M60 47 Q52 41 53 33 Q61 37 63 45Z" fill={ACC} opacity=".55"/>
        </g>
      </svg>
    ),

    // ── CRUNCH CÂBLE ──
    crunch_cable: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="36" y="4" width="28" height="7" rx="3" fill="#444"/>
        <rect x="44" y="11" width="12" height="28" rx="3" fill="#888"/>
        <line x1="50" y1="26" x2="50" y2="48" stroke={CABLE} strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <g style={{animation:`ex-squat ${DUR.med} ease-in-out infinite`,transformOrigin:"50px 68px"}}>
          <circle cx="50" cy="50" r="9" fill={BK}/>
          <rect x="38" y="59" width="24" height="18" rx="7" fill={BK}/>
          <line x1="42" y1="63" x2="26" y2="50" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="58" y1="63" x2="74" y2="50" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <line x1="44" y1="77" x2="36" y2="96" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="56" y1="77" x2="64" y2="96" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M42 62 Q34 66 34 74 Q42 70 44 64Z" fill={ACC} opacity=".45"/>
          <path d="M58 62 Q66 66 66 74 Q58 70 56 64Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),
  };

  return svgs[id] || (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
      <circle cx="50" cy="24" r="10" fill={BK}/>
      <line x1="50" y1="34" x2="50" y2="68" stroke={BK} strokeWidth="12" strokeLinecap="round"/>
      <line x1="42" y1="48" x2="16" y2="58" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
      <line x1="58" y1="48" x2="84" y2="58" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
      <line x1="44" y1="68" x2="36" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
      <line x1="56" y1="68" x2="64" y2="96" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
      <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
    </svg>
  );
}

// ─── CALI SVG ANIMÉ — même style ───
function CaliExSVG({id, size=120}) {
  const BG="#f0f0f0", BK="#111111", ACC="#c084fc";
  const DUR = {fast:"1.3s", med:"1.7s", slow:"2.1s"};

  const svgs = {

    // ── PULL-UP ──
    pullup: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="8" y="10" width="84" height="8" rx="4" fill="#333"/>
        <rect x="10" y="3" width="8" height="15" rx="3" fill="#555"/>
        <rect x="82" y="3" width="8" height="15" rx="3" fill="#555"/>
        <g style={{animation:`ex-pullup ${DUR.med} ease-in-out infinite`}}>
          <ellipse cx="34" cy="16" rx="7" ry="6" fill={BK}/>
          <ellipse cx="66" cy="16" rx="7" ry="6" fill={BK}/>
          <line x1="34" y1="18" x2="38" y2="42" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="66" y1="18" x2="62" y2="42" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <circle cx="50" cy="34" r="10" fill={BK}/>
          <rect x="38" y="44" width="24" height="20" rx="8" fill={BK}/>
          <line x1="45" y1="64" x2="38" y2="88" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="55" y1="64" x2="62" y2="88" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M38 46 Q28 51 30 61 Q38 56 42 49Z" fill={ACC} opacity=".45"/>
          <path d="M62 46 Q72 51 70 61 Q62 56 58 49Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── DIPS ──
    dips: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="4" y="34" width="36" height="7" rx="3" fill="#444"/>
        <rect x="60" y="34" width="36" height="7" rx="3" fill="#444"/>
        <rect x="6" y="41" width="8" height="56" rx="3" fill="#666"/>
        <rect x="26" y="41" width="8" height="56" rx="3" fill="#666"/>
        <rect x="62" y="41" width="8" height="56" rx="3" fill="#666"/>
        <rect x="82" y="41" width="8" height="56" rx="3" fill="#666"/>
        <g style={{animation:`ex-dip ${DUR.med} ease-in-out infinite`}}>
          <circle cx="50" cy="14" r="10" fill={BK}/>
          <rect x="38" y="24" width="24" height="20" rx="8" fill={BK}/>
          <line x1="40" y1="34" x2="14" y2="38" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="34" x2="86" y2="38" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="46" y1="44" x2="40" y2="72" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="54" y1="44" x2="60" y2="72" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M40 28 Q28 32 28 40 Q36 37 40 30Z" fill={ACC} opacity=".45"/>
          <path d="M60 28 Q72 32 72 40 Q64 37 60 30Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── PUSH-UP ──
    pushup: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="2"/>
        <g style={{animation:`ex-pushup ${DUR.fast} ease-in-out infinite`}}>
          <circle cx="20" cy="58" r="9" fill={BK}/>
          <rect x="26" y="56" width="46" height="12" rx="6" fill={BK}/>
          <line x1="28" y1="62" x2="14" y2="88" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="40" y1="68" x2="38" y2="88" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="58" y1="68" x2="62" y2="88" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="72" y1="62" x2="82" y2="88" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <path d="M34 58 Q27 52 28 44 Q36 48 38 57Z" fill={ACC} opacity=".45"/>
          <path d="M54 58 Q47 52 48 44 Q56 48 58 57Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── MUSCLE-UP ──
    muscle_up: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="8" y="10" width="84" height="8" rx="4" fill="#333"/>
        <rect x="10" y="3" width="8" height="15" rx="3" fill="#555"/>
        <rect x="82" y="3" width="8" height="15" rx="3" fill="#555"/>
        <g style={{animation:`ex-muscleup ${DUR.slow} ease-in-out infinite`}}>
          <circle cx="50" cy="6" r="9" fill={BK}/>
          <rect x="38" y="15" width="24" height="20" rx="7" fill={BK}/>
          <line x1="40" y1="22" x2="16" y2="14" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="22" x2="84" y2="14" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <ellipse cx="16" cy="12" rx="7" ry="6" fill={BK}/>
          <ellipse cx="84" cy="12" rx="7" ry="6" fill={BK}/>
          <line x1="46" y1="35" x2="38" y2="66" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="54" y1="35" x2="62" y2="66" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M36 20 Q25 16 24 8 Q33 12 38 20Z" fill={ACC} opacity=".45"/>
          <path d="M64 20 Q75 16 76 8 Q67 12 62 20Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── L-SIT ──
    l_sit: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <rect x="12" y="46" width="12" height="52" rx="4" fill="#555"/>
        <rect x="76" y="46" width="12" height="52" rx="4" fill="#555"/>
        <rect x="8" y="38" width="20" height="9" rx="4" fill="#444"/>
        <rect x="72" y="38" width="20" height="9" rx="4" fill="#444"/>
        <g style={{animation:`ex-lsit ${DUR.slow} ease-in-out infinite`}}>
          <circle cx="50" cy="22" r="10" fill={BK}/>
          <rect x="38" y="32" width="24" height="18" rx="7" fill={BK}/>
          <line x1="40" y1="44" x2="14" y2="44" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="60" y1="44" x2="86" y2="44" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="44" y1="50" x2="12" y2="50" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <line x1="56" y1="50" x2="88" y2="50" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <path d="M38 44 Q26 40 26 32 Q34 36 38 44Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── PISTOL SQUAT ──
    pistol_squat: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <g style={{animation:`ex-pistol ${DUR.slow} ease-in-out infinite`,transformOrigin:"54px 58px"}}>
          <circle cx="54" cy="18" r="10" fill={BK}/>
          <rect x="42" y="28" width="24" height="22" rx="8" fill={BK}/>
          <line x1="48" y1="50" x2="34" y2="80" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <line x1="34" y1="80" x2="30" y2="96" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="56" y1="52" x2="84" y2="44" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="44" y1="34" x2="20" y2="36" stroke={BK} strokeWidth="6" strokeLinecap="round"/>
          <path d="M42 52 Q30 60 30 72 Q40 66 46 56Z" fill={ACC} opacity=".4"/>
        </g>
      </svg>
    ),

    // ── HANDSTAND PUSHUP ──
    handstand_pushup: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <g style={{animation:`ex-hspu ${DUR.med} ease-in-out infinite`}}>
          <circle cx="50" cy="92" r="9" fill={BK}/>
          <line x1="50" y1="83" x2="50" y2="58" stroke={BK} strokeWidth="12" strokeLinecap="round"/>
          <line x1="44" y1="68" x2="18" y2="58" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="56" y1="68" x2="82" y2="58" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="18" y1="58" x2="14" y2="96" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="82" y1="58" x2="86" y2="96" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="46" y1="58" x2="40" y2="28" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <line x1="54" y1="58" x2="60" y2="28" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M28 56 Q18 50 18 40 Q27 44 30 54Z" fill={ACC} opacity=".45"/>
          <path d="M72 56 Q82 50 82 40 Q73 44 70 54Z" fill={ACC} opacity=".45"/>
        </g>
      </svg>
    ),

    // ── PLANCHE LEAN ──
    planche_lean: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{background:BG,borderRadius:10}}>
        <line x1="5" y1="96" x2="95" y2="96" stroke="#ccc" strokeWidth="2"/>
        <g style={{animation:`ex-plank ${DUR.slow} ease-in-out infinite`,transformOrigin:"50px 72px"}}>
          <line x1="24" y1="68" x2="24" y2="96" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="58" y1="64" x2="58" y2="96" stroke={BK} strokeWidth="7" strokeLinecap="round"/>
          <line x1="24" y1="68" x2="58" y2="64" stroke={BK} strokeWidth="10" strokeLinecap="round"/>
          <circle cx="74" cy="58" r="9" fill={BK}/>
          <line x1="68" y1="64" x2="28" y2="68" stroke={BK} strokeWidth="9" strokeLinecap="round"/>
          <line x1="70" y1="64" x2="78" y2="88" stroke={BK} strokeWidth="8" strokeLinecap="round"/>
          <path d="M34 66 Q22 62 22 52 Q30 56 34 65Z" fill={ACC} opacity=".5"/>
          <path d="M52 64 Q40 60 40 50 Q48 54 52 63Z" fill={ACC} opacity=".5"/>
        </g>
      </svg>
    ),
  };

  return svgs[id] || svgs['pullup'];
}

// ─── MAPPING IMAGE CLOUDINARY ↔ SVG IDs ───
const CALI_IMG_MAP = {
  // ── CALISTHENICS ──
  pullup:          "pullup",
  muscle_up:       "muscle_up",
  dips:            "dips",
  pushup:          "pushup",
  planche_lean:    "plank",
  l_sit:           "lsit",
  handstand_pushup:"hspu",
  pistol_squat:    "pistol_squat",
  deep_squat:      "deep_squat",
  bear_crawl:      "bear_crawl",
  hanging:         "hanging",
  // ── GYM ──
  bench_press:     "bench_press",
  incline_press:   "incline_press",
  cable_fly:       "cable_fly",
  lat_pulldown:    "lat_pulldown",
  cable_row:       "cable_row",
  seated_row:      "seated_row",
  deadlift:        "deadlift",
  ohp_barbell:     "ohp_barbell",
  lateral_raise:   "lateral_raise",
  squat:           "squat",
  leg_press:       "leg_press",
  leg_curl:        "leg_curl",
  curl_barre:      "curl_barre",
  curl_halter:     "curl_halter",
  tricep_pushdown: "tricep_pushdown",
  crunch_cable:    "crunch_cable",
};

function ExerciseVisual({svgId, size=80, type="gym"}) {
  const imgKey = CALI_IMG_MAP[svgId];
  const [imgError, setImgError] = useState(false);
  if(imgKey && CALI_IMG_MAP[imgKey] && !imgError) {
    return (
      <img
        src={CALI_IMG_MAP[imgKey]}
        alt={svgId}
        style={{width:size, height:size, objectFit:"contain", borderRadius:8}}
        onError={()=>setImgError(true)}
      />
    );
  }
  if(type==="cali") return <CaliExSVG id={svgId} size={size}/>;
  return <GymExSVG id={svgId} size={size}/>;
}


// ─── DONNÉES PROGRAMMES GYM ───
const GYM_PROGRAMS = {
  full_body: {
    id:"full_body", name:"Full Body", nameEn:"Full Body",
    niveau:"débutant", niveauEn:"beginner",
    jours:3, semaines:12,
    color:"#38bdf8",
    description:"3 séances/sem · Corps complet · Progression linéaire",
    seances:[
      {
        jour:"Lundi", label:"Full Body A",
        exercices:[
          {id:"squat",       nom:"Squat barre",       muscle:"Quadriceps",   series:3, reps:"8-10",  repos:120, poids_depart:40, increment:2.5, svg:"squat"},
          {id:"bench_press", nom:"Développé couché",  muscle:"Pectoraux",    series:3, reps:"8-10",  repos:90,  poids_depart:30, increment:2.5, svg:"bench_press"},
          {id:"lat_pulldown",nom:"Lat Pulldown",       muscle:"Grand dorsal", series:3, reps:"10-12", repos:90,  poids_depart:40, increment:2.5, svg:"lat_pulldown"},
          {id:"ohp_barbell", nom:"Overhead Press",    muscle:"Deltoïdes",    series:3, reps:"8-10",  repos:90,  poids_depart:20, increment:2.5, svg:"ohp_barbell"},
          {id:"curl_barre",  nom:"Curl barre",         muscle:"Biceps",       series:3, reps:"10-12", repos:60,  poids_depart:15, increment:1.25,svg:"curl_barre"},
          {id:"crunch_cable",nom:"Crunch câble",       muscle:"Abdominaux",   series:3, reps:"12-15", repos:60,  poids_depart:10, increment:2.5, svg:"crunch_cable"},
        ]
      },
      {
        jour:"Mercredi", label:"Full Body B",
        exercices:[
          {id:"deadlift",    nom:"Soulevé de terre",  muscle:"Ischio/Dos",   series:3, reps:"6-8",   repos:150, poids_depart:50, increment:5,   svg:"deadlift"},
          {id:"incline_press",nom:"Incliné haltères", muscle:"Pectoraux haut",series:3,reps:"10-12", repos:90,  poids_depart:14, increment:2,   svg:"incline_press"},
          {id:"cable_row",   nom:"Cable Row",          muscle:"Dos moyen",    series:3, reps:"10-12", repos:90,  poids_depart:40, increment:2.5, svg:"cable_row"},
          {id:"lateral_raise",nom:"Élévations latérales",muscle:"Deltoïdes", series:3, reps:"12-15", repos:60,  poids_depart:6,  increment:1,   svg:"lateral_raise"},
          {id:"tricep_pushdown",nom:"Pushdown câble", muscle:"Triceps",      series:3, reps:"12-15", repos:60,  poids_depart:20, increment:2.5, svg:"tricep_pushdown"},
          {id:"leg_curl",    nom:"Leg Curl",           muscle:"Ischio",       series:3, reps:"10-12", repos:60,  poids_depart:25, increment:2.5, svg:"leg_curl"},
        ]
      },
      {
        jour:"Vendredi", label:"Full Body C",
        exercices:[
          {id:"leg_press",   nom:"Leg Press",          muscle:"Quadriceps",   series:4, reps:"10-12", repos:90,  poids_depart:60, increment:5,   svg:"leg_press"},
          {id:"cable_fly",   nom:"Cable Fly",           muscle:"Pectoraux",    series:3, reps:"12-15", repos:60,  poids_depart:12, increment:1,   svg:"cable_fly"},
          {id:"seated_row",  nom:"Rowing assis",        muscle:"Grand dorsal", series:3, reps:"10-12", repos:90,  poids_depart:40, increment:2.5, svg:"seated_row"},
          {id:"ohp_barbell", nom:"Overhead Press",      muscle:"Deltoïdes",    series:3, reps:"10-12", repos:90,  poids_depart:20, increment:2.5, svg:"ohp_barbell"},
          {id:"curl_halter", nom:"Curl haltères alternés",muscle:"Biceps",     series:3, reps:"10-12", repos:60,  poids_depart:10, increment:1,   svg:"curl_halter"},
          {id:"crunch_cable",nom:"Crunch câble",         muscle:"Abdominaux",  series:3, reps:"15",    repos:60,  poids_depart:10, increment:2.5, svg:"crunch_cable"},
        ]
      }
    ]
  },
  upper_lower: {
    id:"upper_lower", name:"Upper / Lower", nameEn:"Upper / Lower",
    niveau:"intermédiaire", niveauEn:"intermediate",
    jours:4, semaines:16,
    color:"#f97316",
    description:"4 séances/sem · Haut/Bas alternés · Volume élevé",
    seances:[
      {
        jour:"Lundi", label:"Upper A — Force",
        exercices:[
          {id:"bench_press", nom:"Développé couché",    muscle:"Pectoraux",    series:4, reps:"6-8",   repos:150, poids_depart:60, increment:2.5, svg:"bench_press"},
          {id:"cable_row",   nom:"Cable Row",            muscle:"Grand dorsal", series:4, reps:"6-8",   repos:120, poids_depart:60, increment:2.5, svg:"cable_row"},
          {id:"ohp_barbell", nom:"Overhead Press",       muscle:"Deltoïdes",    series:3, reps:"6-8",   repos:120, poids_depart:40, increment:2.5, svg:"ohp_barbell"},
          {id:"lat_pulldown",nom:"Lat Pulldown prise large",muscle:"Grand dorsal",series:3,reps:"8-10", repos:90,  poids_depart:60, increment:2.5, svg:"lat_pulldown"},
          {id:"curl_barre",  nom:"Curl barre EZ",        muscle:"Biceps",       series:3, reps:"8-10",  repos:60,  poids_depart:25, increment:1.25,svg:"curl_barre"},
          {id:"tricep_pushdown",nom:"Pushdown câble",    muscle:"Triceps",      series:3, reps:"10-12", repos:60,  poids_depart:30, increment:2.5, svg:"tricep_pushdown"},
        ]
      },
      {
        jour:"Mardi", label:"Lower A — Force",
        exercices:[
          {id:"squat",       nom:"Squat barre",          muscle:"Quadriceps",   series:4, reps:"6-8",   repos:180, poids_depart:80, increment:2.5, svg:"squat"},
          {id:"deadlift",    nom:"Soulevé de terre",     muscle:"Ischio/Dos",   series:3, reps:"5-6",   repos:180, poids_depart:100,increment:5,   svg:"deadlift"},
          {id:"leg_press",   nom:"Leg Press",            muscle:"Quadriceps",   series:3, reps:"8-10",  repos:120, poids_depart:100,increment:5,   svg:"leg_press"},
          {id:"leg_curl",    nom:"Leg Curl couché",      muscle:"Ischio",       series:3, reps:"10-12", repos:90,  poids_depart:35, increment:2.5, svg:"leg_curl"},
          {id:"crunch_cable",nom:"Crunch câble",         muscle:"Abdominaux",   series:4, reps:"12-15", repos:60,  poids_depart:15, increment:2.5, svg:"crunch_cable"},
        ]
      },
      {
        jour:"Jeudi", label:"Upper B — Hypertrophie",
        exercices:[
          {id:"incline_press",nom:"Incliné haltères",   muscle:"Pectoraux haut",series:4,reps:"10-12", repos:90,  poids_depart:22, increment:2,   svg:"incline_press"},
          {id:"seated_row",  nom:"Rowing assis prise neutre",muscle:"Dos moyen",series:4,reps:"10-12", repos:90,  poids_depart:60, increment:2.5, svg:"seated_row"},
          {id:"cable_fly",   nom:"Cable Fly",           muscle:"Pectoraux",    series:3, reps:"12-15", repos:60,  poids_depart:15, increment:1,   svg:"cable_fly"},
          {id:"lateral_raise",nom:"Élévations latérales",muscle:"Deltoïdes",   series:4, reps:"12-15", repos:60,  poids_depart:8,  increment:1,   svg:"lateral_raise"},
          {id:"curl_halter", nom:"Curl marteau",         muscle:"Biceps/Brach", series:3, reps:"12-15", repos:60,  poids_depart:14, increment:1,   svg:"curl_halter"},
          {id:"tricep_pushdown",nom:"Pushdown corde",    muscle:"Triceps",      series:3, reps:"12-15", repos:60,  poids_depart:25, increment:2.5, svg:"tricep_pushdown"},
        ]
      },
      {
        jour:"Vendredi", label:"Lower B — Hypertrophie",
        exercices:[
          {id:"leg_press",   nom:"Leg Press pieds hauts",muscle:"Fessiers/Ischios",series:4,reps:"10-12",repos:120,poids_depart:100,increment:5, svg:"leg_press"},
          {id:"squat",       nom:"Squat goblet haltère", muscle:"Quadriceps",   series:3, reps:"12-15", repos:90,  poids_depart:24, increment:2,   svg:"squat"},
          {id:"leg_curl",    nom:"Leg Curl assis",       muscle:"Ischio",       series:4, reps:"10-12", repos:90,  poids_depart:35, increment:2.5, svg:"leg_curl"},
          {id:"deadlift",    nom:"Romanian Deadlift",    muscle:"Ischio",       series:3, reps:"10-12", repos:90,  poids_depart:60, increment:2.5, svg:"deadlift"},
          {id:"crunch_cable",nom:"Crunch câble",         muscle:"Abdominaux",   series:4, reps:"15",    repos:60,  poids_depart:15, increment:2.5, svg:"crunch_cable"},
        ]
      }
    ]
  },
  ppl: {
    id:"ppl", name:"PPL — Push Pull Legs", nameEn:"PPL — Push Pull Legs",
    niveau:"avancé", niveauEn:"advanced",
    jours:6, semaines:12,
    color:"#c084fc",
    description:"6 séances/sem · PPL × 2 · Volume maximal",
    seances:[
      {
        jour:"Lundi", label:"Push A",
        exercices:[
          {id:"bench_press", nom:"Développé couché",    muscle:"Pectoraux",    series:4, reps:"5",     repos:180, poids_depart:80, increment:2.5, svg:"bench_press"},
          {id:"incline_press",nom:"Incliné haltères",   muscle:"Pectoraux haut",series:4,reps:"8-10",  repos:90,  poids_depart:28, increment:2,   svg:"incline_press"},
          {id:"cable_fly",   nom:"Cable Fly bas",       muscle:"Pectoraux",    series:3, reps:"12-15", repos:60,  poids_depart:16, increment:1,   svg:"cable_fly"},
          {id:"ohp_barbell", nom:"Overhead Press",      muscle:"Deltoïdes",    series:4, reps:"6-8",   repos:120, poids_depart:50, increment:2.5, svg:"ohp_barbell"},
          {id:"lateral_raise",nom:"Élévations latérales",muscle:"Deltoïdes",   series:4, reps:"12-15", repos:60,  poids_depart:10, increment:1,   svg:"lateral_raise"},
          {id:"tricep_pushdown",nom:"Pushdown câble",   muscle:"Triceps",      series:4, reps:"10-12", repos:60,  poids_depart:35, increment:2.5, svg:"tricep_pushdown"},
        ]
      },
      {
        jour:"Mardi", label:"Pull A",
        exercices:[
          {id:"deadlift",    nom:"Soulevé de terre",    muscle:"Dos/Ischios",  series:4, reps:"4-5",   repos:210, poids_depart:120,increment:5,   svg:"deadlift"},
          {id:"lat_pulldown",nom:"Lat Pulldown large",  muscle:"Grand dorsal", series:4, reps:"8-10",  repos:90,  poids_depart:70, increment:2.5, svg:"lat_pulldown"},
          {id:"seated_row",  nom:"Rowing assis lourd",  muscle:"Dos moyen",    series:4, reps:"6-8",   repos:120, poids_depart:70, increment:2.5, svg:"seated_row"},
          {id:"cable_row",   nom:"Cable Row prise large",muscle:"Grand dorsal",series:3, reps:"10-12", repos:90,  poids_depart:60, increment:2.5, svg:"cable_row"},
          {id:"curl_barre",  nom:"Curl barre lourd",    muscle:"Biceps",       series:4, reps:"6-8",   repos:90,  poids_depart:35, increment:1.25,svg:"curl_barre"},
          {id:"curl_halter", nom:"Curl concentré",       muscle:"Biceps",       series:3, reps:"12-15", repos:60,  poids_depart:16, increment:1,   svg:"curl_halter"},
        ]
      },
      {
        jour:"Mercredi", label:"Legs A",
        exercices:[
          {id:"squat",       nom:"Squat barre lourd",   muscle:"Quadriceps",   series:5, reps:"5",     repos:210, poids_depart:100,increment:2.5, svg:"squat"},
          {id:"leg_press",   nom:"Leg Press",           muscle:"Quadriceps",   series:4, reps:"8-10",  repos:120, poids_depart:120,increment:5,   svg:"leg_press"},
          {id:"leg_curl",    nom:"Leg Curl",            muscle:"Ischio",       series:4, reps:"10-12", repos:90,  poids_depart:40, increment:2.5, svg:"leg_curl"},
          {id:"deadlift",    nom:"Romanian Deadlift",   muscle:"Ischio",       series:3, reps:"10-12", repos:90,  poids_depart:80, increment:2.5, svg:"deadlift"},
          {id:"crunch_cable",nom:"Crunch câble",        muscle:"Abdominaux",   series:4, reps:"12-15", repos:60,  poids_depart:20, increment:2.5, svg:"crunch_cable"},
        ]
      },
      {
        jour:"Jeudi", label:"Push B",
        exercices:[
          {id:"incline_press",nom:"Incliné barre",      muscle:"Pectoraux haut",series:4,reps:"8-10",  repos:120, poids_depart:60, increment:2.5, svg:"incline_press"},
          {id:"bench_press", nom:"Développé haltères",  muscle:"Pectoraux",    series:3, reps:"10-12", repos:90,  poids_depart:30, increment:2,   svg:"bench_press"},
          {id:"cable_fly",   nom:"Cable Fly haut",      muscle:"Pectoraux",    series:3, reps:"12-15", repos:60,  poids_depart:16, increment:1,   svg:"cable_fly"},
          {id:"ohp_barbell", nom:"OHP haltères",        muscle:"Deltoïdes",    series:3, reps:"10-12", repos:90,  poids_depart:18, increment:1,   svg:"ohp_barbell"},
          {id:"lateral_raise",nom:"Élévations penchées",muscle:"Deltoïdes",   series:4, reps:"15",    repos:60,  poids_depart:8,  increment:1,   svg:"lateral_raise"},
          {id:"tricep_pushdown",nom:"Dips lestés",      muscle:"Triceps",      series:3, reps:"8-10",  repos:90,  poids_depart:10, increment:2.5, svg:"tricep_pushdown"},
        ]
      },
      {
        jour:"Vendredi", label:"Pull B",
        exercices:[
          {id:"lat_pulldown",nom:"Lat Pulldown prise neutre",muscle:"Grand dorsal",series:4,reps:"10-12",repos:90,poids_depart:70,increment:2.5, svg:"lat_pulldown"},
          {id:"cable_row",   nom:"Cable Row prise serrée",muscle:"Dos moyen",  series:4, reps:"10-12", repos:90,  poids_depart:60, increment:2.5, svg:"cable_row"},
          {id:"seated_row",  nom:"Rowing Pendlay",       muscle:"Dos épais",   series:3, reps:"8-10",  repos:120, poids_depart:60, increment:2.5, svg:"seated_row"},
          {id:"deadlift",    nom:"Good Morning",         muscle:"Dos bas",     series:3, reps:"10-12", repos:90,  poids_depart:40, increment:2.5, svg:"deadlift"},
          {id:"curl_barre",  nom:"Curl EZ incliné",      muscle:"Biceps",      series:3, reps:"12",    repos:60,  poids_depart:15, increment:1,   svg:"curl_barre"},
          {id:"curl_halter", nom:"Curl marteau câble",   muscle:"Brachial",    series:3, reps:"12-15", repos:60,  poids_depart:15, increment:1,   svg:"curl_halter"},
        ]
      },
      {
        jour:"Samedi", label:"Legs B",
        exercices:[
          {id:"leg_press",   nom:"Leg Press pieds bas",  muscle:"Quadriceps",  series:5, reps:"10",    repos:120, poids_depart:120,increment:5,   svg:"leg_press"},
          {id:"squat",       nom:"Hack Squat",           muscle:"Quadriceps",  series:4, reps:"10-12", repos:90,  poids_depart:60, increment:2.5, svg:"squat"},
          {id:"leg_curl",    nom:"Leg Curl debout",      muscle:"Ischio",      series:4, reps:"12-15", repos:60,  poids_depart:20, increment:2.5, svg:"leg_curl"},
          {id:"deadlift",    nom:"Sumo Deadlift",        muscle:"Adducteurs",  series:3, reps:"8-10",  repos:120, poids_depart:80, increment:2.5, svg:"deadlift"},
          {id:"crunch_cable",nom:"Crunch câble oblique", muscle:"Obliques",    series:4, reps:"15",    repos:60,  poids_depart:15, increment:2.5, svg:"crunch_cable"},
        ]
      }
    ]
  }
};

// ─── DONNÉES PROGRAMMES CALISTHENICS ───
const CALI_PROGRAMS = {
  cali_debutant: {
    id:"cali_debutant", name:"Cali Débutant", nameEn:"Cali Beginner",
    niveau:"débutant", niveauEn:"beginner",
    jours:3, semaines:12,
    color:"#c084fc",
    description:"3 séances/sem · Bases solides · Progressions",
    seances:[
      {
        jour:"Lundi", label:"Full Body A",
        exercices:[
          {id:"pullup",     nom:"Traction prise large",  muscle:"Grand dorsal",  series:3, reps:"3-5",  repos:120, progression:"Bandes élastiques → lest", svg:"pullup"},
          {id:"pushup",     nom:"Pompes",                muscle:"Pectoraux",     series:3, reps:"10-15",repos:60,  progression:"Inclinées → normales → pieds surélevés", svg:"pushup"},
          {id:"dips",       nom:"Dips barres parallèles",muscle:"Triceps/Chest", series:3, reps:"5-8",  repos:90,  progression:"Assistance → complet → lest", svg:"dips"},
          {id:"pistol_squat",nom:"Squat assisté 1 jambe",muscle:"Quadriceps",   series:3, reps:"5-8",  repos:90,  progression:"Assisté → libre → pistolet", svg:"pistol_squat"},
          {id:"l_sit",      nom:"L-Sit sol (genoux)",    muscle:"Abdominaux",   series:3, reps:"15-20s",repos:60, progression:"Genoux → 1 jambe → L-Sit complet", svg:"l_sit"},
        ]
      },
      {
        jour:"Mercredi", label:"Full Body B",
        exercices:[
          {id:"pullup",     nom:"Traction prise neutre", muscle:"Grand dorsal",  series:3, reps:"3-5",  repos:120, progression:"Négatives → complètes", svg:"pullup"},
          {id:"pushup",     nom:"Pompes diamant",        muscle:"Triceps",       series:3, reps:"8-12", repos:60,  progression:"Inclinées → normales", svg:"pushup"},
          {id:"dips",       nom:"Dips lents (3s bas)",   muscle:"Chest/Triceps", series:3, reps:"5-8",  repos:90,  progression:"Tempo lent → normal → lest", svg:"dips"},
          {id:"pistol_squat",nom:"Bulgarian split squat",muscle:"Fessiers",     series:3, reps:"8-10", repos:90,  progression:"→ Pistolet", svg:"pistol_squat"},
          {id:"l_sit",      nom:"Hollow body hold",      muscle:"Gainage",      series:3, reps:"20-30s",repos:60, progression:"→ L-Sit", svg:"l_sit"},
        ]
      },
      {
        jour:"Vendredi", label:"Full Body C",
        exercices:[
          {id:"muscle_up",  nom:"Traction explosives",   muscle:"Dos/Biceps",   series:4, reps:"5-6",  repos:120, progression:"→ Muscle-up", svg:"muscle_up"},
          {id:"pushup",     nom:"Pompes claquées",       muscle:"Pectoraux",    series:3, reps:"5-8",  repos:90,  progression:"→ Planche", svg:"pushup"},
          {id:"dips",       nom:"Dips plombés",          muscle:"Triceps",      series:3, reps:"8-10", repos:90,  progression:"Lest progressif", svg:"dips"},
          {id:"pistol_squat",nom:"Pistol squat libre",   muscle:"Quadriceps",   series:3, reps:"5-8",  repos:90,  progression:"Lest → jump pistol", svg:"pistol_squat"},
          {id:"planche_lean",nom:"Planche lean",          muscle:"Épaules/Dos",  series:3, reps:"15-20s",repos:60, progression:"→ Tuck planche", svg:"planche_lean"},
        ]
      }
    ]
  },
  cali_avance: {
    id:"cali_avance", name:"Cali Avancé — Skills", nameEn:"Advanced Cali — Skills",
    niveau:"avancé", niveauEn:"advanced",
    jours:5, semaines:16,
    color:"#f472b6",
    description:"5 séances/sem · Skills avancés · Muscle-up / Planche",
    seances:[
      {
        jour:"Lundi", label:"Push — Planche work",
        exercices:[
          {id:"handstand_pushup",nom:"HSPU (mur)",       muscle:"Deltoïdes",    series:5, reps:"3-5",  repos:180, progression:"Mur → libre → strict HSPU", svg:"handstand_pushup"},
          {id:"planche_lean",   nom:"Planche lean 4-6s", muscle:"Épaules/Chest",series:5, reps:"4-6s", repos:120, progression:"→ Tuck → Advanced tuck", svg:"planche_lean"},
          {id:"pushup",         nom:"Pompes planche lean",muscle:"Chest",        series:4, reps:"5-8",  repos:120, progression:"Positional hold", svg:"pushup"},
          {id:"dips",           nom:"Dips lestés +20kg", muscle:"Triceps",      series:4, reps:"5-8",  repos:90,  progression:"Lest progressif", svg:"dips"},
        ]
      },
      {
        jour:"Mardi", label:"Pull — Front lever work",
        exercices:[
          {id:"muscle_up",  nom:"Muscle-up strict",      muscle:"Dos/Chest",    series:5, reps:"3-5",  repos:180, progression:"→ Weighted MU", svg:"muscle_up"},
          {id:"pullup",     nom:"Front lever hold (tuck)",muscle:"Grand dorsal", series:5, reps:"5-8s", repos:120, progression:"→ Avancé → complet", svg:"pullup"},
          {id:"pullup",     nom:"Tractions lestées +20kg",muscle:"Grand dorsal", series:4, reps:"4-6",  repos:120, progression:"Lest progressif", svg:"pullup"},
          {id:"l_sit",      nom:"L-Sit barres 10s",      muscle:"Abdos/Fléch.", series:4, reps:"8-10s",repos:90,  progression:"→ V-Sit", svg:"l_sit"},
        ]
      },
      {
        jour:"Mercredi", label:"Legs + Gainage",
        exercices:[
          {id:"pistol_squat",nom:"Pistol squat lesté",   muscle:"Quadriceps",   series:5, reps:"5",    repos:120, progression:"Lest +5kg/cycle", svg:"pistol_squat"},
          {id:"pistol_squat",nom:"Shake squat sauté",    muscle:"Explosivité",  series:4, reps:"5-8",  repos:90,  progression:"→ Deep jump", svg:"pistol_squat"},
          {id:"l_sit",       nom:"Hollow body 40s",      muscle:"Gainage ant.", series:4, reps:"40s",  repos:60,  progression:"→ Straddle hold", svg:"l_sit"},
          {id:"planche_lean",nom:"Planche lean 8s",      muscle:"Full body",    series:4, reps:"8s",   repos:120, progression:"→ Tuck", svg:"planche_lean"},
        ]
      },
      {
        jour:"Jeudi", label:"Push B",
        exercices:[
          {id:"handstand_pushup",nom:"HSPU libre",       muscle:"Deltoïdes",    series:4, reps:"3",    repos:180, progression:"Free HSPU", svg:"handstand_pushup"},
          {id:"pushup",         nom:"Archer push-ups",   muscle:"Chest/Triceps",series:4, reps:"6-8",  repos:90,  progression:"→ One arm PU", svg:"pushup"},
          {id:"dips",           nom:"Korean dips",        muscle:"Front delt",   series:3, reps:"5-8",  repos:90,  progression:"→ Full ROM", svg:"dips"},
          {id:"planche_lean",   nom:"Planche lean 10s",  muscle:"Épaules",      series:5, reps:"10s",  repos:150, progression:"→ Advanced tuck", svg:"planche_lean"},
        ]
      },
      {
        jour:"Vendredi", label:"Pull B + Skills",
        exercices:[
          {id:"muscle_up",  nom:"MU explosif + dip lent",muscle:"Full upper",  series:5, reps:"3",    repos:180, progression:"→ Weighted", svg:"muscle_up"},
          {id:"pullup",     nom:"Front lever 360",       muscle:"Grand dorsal", series:4, reps:"3-5s", repos:120, progression:"Full FL bientôt", svg:"pullup"},
          {id:"pullup",     nom:"Tractions à 1 bras (assist.)",muscle:"Dos",   series:4, reps:"3-5",  repos:150, progression:"→ OAC", svg:"pullup"},
          {id:"l_sit",      nom:"V-Sit progression",     muscle:"Abdos",        series:4, reps:"5-8s", repos:90,  progression:"→ Manna", svg:"l_sit"},
        ]
      }
    ]
  }
};

// ─── COACH GYM IA ───

// ═══════════════════════════════════════════════════════════
// COACH CORPS COMPLET — Fusion Calisthenics + Longévité
// 30 exercices avec illustrations avatar Higgsfield
// ═══════════════════════════════════════════════════════════
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3DdXa3BM2aJ5hef8QjX1vrtzH5L/";

const EXERCICES_CC = [
  // ── DÉBUTANT — HAUT ──
  { id:"push_std",    nom:"Push-up",           nomEn:"Push-up",          niveau:"debutant",  categorie:"haut",     muscles:"Pectoraux · Triceps",     img:CDN+"hf_20260519_163036_224277ea-9b83-47c0-b0b3-b1f525d60713.png", series:3, reps:"10-15", repos:60,  conseilFr:"Garde le corps droit, descends la poitrine jusqu'au sol.", conseilEn:"Keep body straight, lower chest to floor." },
  { id:"push_inc",    nom:"Push-up incliné",   nomEn:"Incline Push-up",  niveau:"debutant",  categorie:"haut",     muscles:"Pectoraux bas · Triceps", img:CDN+"hf_20260519_163044_0a7d3a38-6db4-408b-b45f-653e51a9ab30.png", series:3, reps:"12-15", repos:60, conseilFr:"Mains sur une surface élevée, parfait pour débuter.", conseilEn:"Hands on elevated surface, perfect for beginners." },
  { id:"dips_chaise", nom:"Dips chaise",       nomEn:"Chair Dips",       niveau:"debutant",  categorie:"haut",     muscles:"Triceps · Épaules",       img:CDN+"hf_20260519_163052_f0818fb0-f0a6-401d-bda1-af992d4ecb89.png", series:3, reps:"10-12", repos:60, conseilFr:"Coudes serrés, descends lentement.", conseilEn:"Keep elbows close, lower slowly." },
  { id:"superman",    nom:"Superman hold",     nomEn:"Superman Hold",    niveau:"debutant",  categorie:"haut",     muscles:"Dos · Lombaires",         img:CDN+"hf_20260519_163100_3787bc68-c36d-478c-a6c5-e8fb9004eeb7.png", series:3, reps:"10×3s", repos:45, conseilFr:"Soulève bras et jambes simultanément, tiens 3 secondes.", conseilEn:"Lift arms and legs simultaneously, hold 3 seconds." },
  // ── DÉBUTANT — BAS ──
  { id:"squat",       nom:"Squat",             nomEn:"Bodyweight Squat", niveau:"debutant",  categorie:"bas",      muscles:"Quadriceps · Fessiers",   img:CDN+"hf_20260519_163110_57706f47-072f-4fe4-a22d-533083f56501.png", series:3, reps:"15-20", repos:60, conseilFr:"Descends jusqu'à ce que les cuisses soient parallèles au sol.", conseilEn:"Lower until thighs are parallel to floor." },
  { id:"fente",       nom:"Fente avant",       nomEn:"Forward Lunge",    niveau:"debutant",  categorie:"bas",      muscles:"Quadriceps · Fessiers",   img:CDN+"hf_20260519_163120_216c8250-090c-4141-89b0-53a16852a129.png", series:3, reps:"10/jambe", repos:60, conseilFr:"Genou arrière proche du sol, torse droit.", conseilEn:"Back knee close to floor, torso upright." },
  { id:"glute_bridge",nom:"Glute Bridge",      nomEn:"Glute Bridge",     niveau:"debutant",  categorie:"bas",      muscles:"Fessiers · Ischio",       img:CDN+"hf_20260519_163851_540cab34-b7b0-49d2-aaa7-2c9987ca726f.png", series:3, reps:"15-20", repos:45, conseilFr:"Pousse les hanches vers le haut, serre les fessiers en haut.", conseilEn:"Push hips up, squeeze glutes at top." },
  { id:"calf_raise",  nom:"Calf Raise",        nomEn:"Calf Raise",       niveau:"debutant",  categorie:"bas",      muscles:"Mollets",                 img:CDN+"hf_20260519_163858_dad58906-9d02-4da9-bd76-07912fb6062a.png", series:3, reps:"20-25", repos:45, conseilFr:"Monte sur la pointe des pieds, descends lentement.", conseilEn:"Rise on toes, lower slowly." },
  // ── INTERMÉDIAIRE — HAUT ──
  { id:"pullup",      nom:"Pull-up",           nomEn:"Pull-up",          niveau:"inter",     categorie:"haut",     muscles:"Dorsaux · Biceps",        img:CDN+"hf_20260519_163907_91da688f-409b-403c-a73f-31940f559320.png", series:4, reps:"5-8",   repos:90, conseilFr:"Prise pronation, tire les coudes vers les hanches.", conseilEn:"Overhand grip, pull elbows to hips." },
  { id:"chinup",      nom:"Chin-up",           nomEn:"Chin-up",          niveau:"inter",     categorie:"haut",     muscles:"Biceps · Dorsaux",        img:CDN+"hf_20260519_163915_c12677be-59ff-4a32-a8d9-6f34bec9e798.png", series:4, reps:"6-10",  repos:90, conseilFr:"Prise supination (paumes vers toi), excellent pour les biceps.", conseilEn:"Underhand grip, great for biceps." },
  { id:"dips_bar",    nom:"Dips barre",        nomEn:"Parallel Dips",    niveau:"inter",     categorie:"haut",     muscles:"Pectoraux · Triceps",     img:CDN+"hf_20260519_163923_f30d9484-68bd-4d90-acfc-060020277d4b.png", series:4, reps:"8-12",  repos:90, conseilFr:"Penche légèrement le torse en avant pour cibler la poitrine.", conseilEn:"Lean torso slightly forward to target chest." },
  { id:"pike_pushup", nom:"Pike Push-up",      nomEn:"Pike Push-up",     niveau:"inter",     categorie:"haut",     muscles:"Épaules · Triceps",       img:CDN+"hf_20260519_163932_d33133cc-a611-4d1b-b205-e22e8112b045.png", series:3, reps:"8-12",  repos:75, conseilFr:"Hanches hautes, descends la tête vers le sol.", conseilEn:"Hips high, lower head toward floor." },
  { id:"diamond",     nom:"Diamond Push-up",   nomEn:"Diamond Push-up",  niveau:"inter",     categorie:"haut",     muscles:"Triceps · Pecto internes",img:CDN+"hf_20260520_192502_481f99fd-70e8-400c-b7ae-c590eca7ee8b.png", series:3, reps:"8-12",  repos:75, conseilFr:"Mains en triangle sous la poitrine, coudes serrés.", conseilEn:"Hands in triangle under chest, elbows close." },
  { id:"aus_row",     nom:"Australian Row",    nomEn:"Australian Row",   niveau:"inter",     categorie:"haut",     muscles:"Dos · Biceps",            img:CDN+"hf_20260519_164058_c09cc5b4-dfc8-401b-a264-64fda6bf9647.png", series:4, reps:"10-15", repos:75, conseilFr:"Corps rigide, tire la poitrine vers la barre.", conseilEn:"Body rigid, pull chest to bar." },
  // ── CORE ──
  { id:"plank",       nom:"Planche",           nomEn:"Plank",            niveau:"inter",     categorie:"core",     muscles:"Core · Épaules",          img:CDN+"hf_20260519_164107_97842dd9-a0d2-4da5-bf60-050e1b7605a0.png", series:3, reps:"30-60s", repos:60, conseilFr:"Corps droit, ne laisse pas les hanches tomber.", conseilEn:"Straight body, don't let hips sag." },
  { id:"side_plank",  nom:"Planche latérale",  nomEn:"Side Plank",       niveau:"inter",     categorie:"core",     muscles:"Obliques · Core",         img:CDN+"hf_20260519_164115_a9e20ec9-2636-4c7e-b135-2db61e39b900.png", series:3, reps:"20-40s", repos:45, conseilFr:"Hanches alignées, corps droit de la tête aux pieds.", conseilEn:"Hips aligned, body straight head to feet." },
  { id:"hollow",      nom:"Hollow Body",       nomEn:"Hollow Body Hold", niveau:"inter",     categorie:"core",     muscles:"Abdos · Hip flexors",     img:CDN+"hf_20260519_164123_d062863e-92da-4ffe-bc7d-371ce162dbac.png", series:3, reps:"20-30s", repos:60, conseilFr:"Dos plaqué au sol, creuse le ventre.", conseilEn:"Lower back pressed to floor, hollow belly." },
  { id:"mountain",    nom:"Mountain Climber",  nomEn:"Mountain Climber", niveau:"inter",     categorie:"core",     muscles:"Core · Cardio",           img:CDN+"hf_20260519_164131_efe95aed-019f-4c34-b903-df27c1d6603f.png", series:3, reps:"30s",   repos:45, conseilFr:"Alterne les genoux rapidement, hanche basse.", conseilEn:"Alternate knees fast, hips low." },
  // ── AVANCÉ ──
  { id:"muscle_up",   nom:"Muscle-up",         nomEn:"Muscle-up",        niveau:"avance",    categorie:"haut",     muscles:"Dorsaux · Triceps · Core",img:CDN+"hf_20260519_165349_69ba8ff9-bf3c-4e73-b894-e439ff14e98c.png", series:3, reps:"3-6",   repos:120, conseilFr:"Traction explosive, passe les poignets au-dessus de la barre.", conseilEn:"Explosive pull, transition wrists above bar." },
  { id:"pistol",      nom:"Pistol Squat",      nomEn:"Pistol Squat",     niveau:"avance",    categorie:"bas",      muscles:"Quadriceps · Équilibre",  img:CDN+"hf_20260520_191214_c1ce8f44-12da-4187-8e3a-09e3a1b06d15.png", series:3, reps:"5/jambe", repos:90, conseilFr:"Jambe tendue devant, descends lentement sur une jambe.", conseilEn:"Leg extended forward, lower slowly on one leg." },
  { id:"archer",      nom:"Archer Push-up",    nomEn:"Archer Push-up",   niveau:"avance",    categorie:"haut",     muscles:"Pecto unilatéral",        img:CDN+"hf_20260520_191223_54c9e300-4ff2-4d00-86e4-452109e54804.png", series:3, reps:"6/côté", repos:90, conseilFr:"Un bras tendu côté, descends sur l'autre.", conseilEn:"One arm extended side, lower on the other." },
  { id:"lsit",        nom:"L-Sit",             nomEn:"L-Sit",            niveau:"avance",    categorie:"core",     muscles:"Core · Hip flexors",      img:CDN+"hf_20260520_191231_5e91489e-970e-47ee-a8bd-b9af0775d553.png", series:3, reps:"10-20s", repos:90, conseilFr:"Jambes à l'horizontale, bras tendus, corps soulevé.", conseilEn:"Legs horizontal, arms straight, body lifted." },
  { id:"handstand",   nom:"Handstand Hold",    nomEn:"Handstand Hold",   niveau:"avance",    categorie:"haut",     muscles:"Épaules · Core",          img:CDN+"hf_20260520_191240_f76f84b7-24b3-40d4-a8a7-1a7149c46d1a.png", series:3, reps:"10-30s", repos:120, conseilFr:"Mur d'abord, puis équilibre libre.", conseilEn:"Wall first, then freestanding." },
  { id:"dragon",      nom:"Dragon Flag",       nomEn:"Dragon Flag",      niveau:"avance",    categorie:"core",     muscles:"Core complet",            img:CDN+"hf_20260520_191249_b9962a9d-06de-4ffd-85ce-cc1b8ff13df1.png", series:3, reps:"5-8",   repos:120, conseilFr:"Corps rigide comme une planche, descends lentement.", conseilEn:"Body rigid as a plank, lower slowly." },
  // ── MOBILITÉ & LONGÉVITÉ ──
  { id:"cat_cow",     nom:"Cat-Cow",           nomEn:"Cat-Cow",          niveau:"mobilite",  categorie:"mobilite", muscles:"Colonne · Dos",           img:CDN+"hf_20260520_192412_237115c4-4bd9-4bae-8cb0-52d297a76db8.png", series:2, reps:"10 cycles", repos:30, conseilFr:"Respire profondément, arch et courbe en rythme.", conseilEn:"Breathe deeply, arch and curve rhythmically." },
  { id:"hip_flexor",  nom:"Hip Flexor Stretch",nomEn:"Hip Flexor Stretch",niveau:"mobilite", categorie:"mobilite", muscles:"Hanches · Psoas",         img:CDN+"hf_20260520_192420_30072c57-99d8-414f-affe-0584a927a8d8.png", series:2, reps:"30s/côté", repos:20, conseilFr:"Pousse les hanches vers l'avant, torse droit.", conseilEn:"Push hips forward, torso upright." },
  { id:"downdog",     nom:"Downward Dog",      nomEn:"Downward Dog",     niveau:"mobilite",  categorie:"mobilite", muscles:"Ischio · Épaules",        img:CDN+"hf_20260520_192436_272e7abc-9a23-4c8a-a6e1-04895e75d49b.png", series:2, reps:"30-45s", repos:20, conseilFr:"Hanches hautes, talons vers le sol, tête entre les bras.", conseilEn:"Hips high, heels toward floor, head between arms." },
  { id:"pigeon",      nom:"Pigeon Pose",       nomEn:"Pigeon Pose",      niveau:"mobilite",  categorie:"mobilite", muscles:"Hanches · Fessiers",      img:CDN+"hf_20260520_192444_c2f69e9d-7dea-48a4-9037-1b0fdf694f3b.png", series:2, reps:"45s/côté", repos:15, conseilFr:"Genou avant à 90°, jambe arrière tendue, torse relâché.", conseilEn:"Front knee at 90°, back leg extended, relax torso." },
  { id:"thoracic",    nom:"Rotation thoracique",nomEn:"Thoracic Rotation",niveau:"mobilite", categorie:"mobilite", muscles:"Thorax · Colonne",        img:CDN+"hf_20260520_192452_b60cb9c4-c155-4bb2-bca8-de2ffda40eec.png", series:2, reps:"10/côté", repos:20, conseilFr:"Assis, genou plié, rotation lente du haut du dos.", conseilEn:"Seated, knee bent, slow upper back rotation." },
  { id:"dead_hang",   nom:"Dead Hang",         nomEn:"Dead Hang",        niveau:"mobilite",  categorie:"mobilite", muscles:"Épaules · Colonne",       img:CDN+"hf_20260520_192452_b60cb9c4-c155-4bb2-bca8-de2ffda40eec.png", series:2, reps:"30-60s", repos:30, conseilFr:"Corps relâché, décompresse la colonne et les épaules.", conseilEn:"Body relaxed, decompress spine and shoulders." },
];

const NIVEAUX_CC = [
  { id:"debutant",  label:"Débutant",  labelEn:"Beginner", color:"#4ade80", emoji:"🌱", desc:"0-3 mois", descEn:"0-3 months" },
  { id:"inter",     label:"Intermédiaire", labelEn:"Intermediate", color:"#fbbf24", emoji:"⚡", desc:"3-12 mois", descEn:"3-12 months" },
  { id:"avance",    label:"Avancé",    labelEn:"Advanced", color:"#ef4444", emoji:"🔥", desc:"12+ mois", descEn:"12+ months" },
  { id:"mobilite",  label:"Mobilité",  labelEn:"Mobility", color:"#06b6d4", emoji:"🌊", desc:"Tous niveaux", descEn:"All levels" },
];

function CoachCorpsComplet({ user, profile, onPaywall, onHome, onCoinsEarned, lang, t }) {
  const L = lang === "en";
  const isPremium = user?.plan === "premium";
  const EM2 = "#00ff88";
  const aura = useRangAura();

  const [screen, setScreen] = useState("home"); // home | niveau | liste | exercice | solo
  const [selectedNiveau, setSelectedNiveau] = useState(null);
  const [selectedEx, setSelectedEx] = useState(null);
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem("vs_ccc_done") || "{}"); } catch { return {}; } });
  const [imgErr, setImgErr] = useState({});

  const markDone = (id) => {
    const nd = {...done, [id]: true};
    setDone(nd);
    localStorage.setItem("vs_ccc_done", JSON.stringify(nd));
    if (onCoinsEarned && !done[id]) onCoinsEarned(5);
  };

  const exByNiveau = (nid) => EXERCICES_CC.filter(e => e.niveau === nid);
  const totalDone = Object.keys(done).length;
  const totalEx = EXERCICES_CC.length;

  // ── SOLO LEVELING ──
  if (screen === "solo") return (
    <SoloLevelingChallenge user={user} profile={profile} onBack={()=>setScreen("home")} onCoinsEarned={onCoinsEarned} lang={lang}/>
  );

  // ── HOME ──
  if (screen === "home") return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <style>{AURA_CSS}</style>
      <div style={{padding:"52px 20px 24px",background:aura.gradient,position:"relative",overflow:"hidden"}}>
        {aura.particles && <AuraParticles color={aura.color} count={6}/>}
        <button onClick={onHome} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:12,display:"block",position:"relative",zIndex:1}}>← {L?"Back":"Retour"}</button>
        {/* Onglets Coach / Solo Leveling */}
        <div style={{display:"flex",gap:8,marginBottom:14,position:"relative",zIndex:1}}>
          {[{id:"home",label:"💪 Coach"},{id:"solo",label:"⚔️ Solo Leveling"}].map(tab=>(
            <button key={tab.id} onClick={()=>setScreen(tab.id)}
              style={{background:tab.id==="home"?`${EM2}20`:aura.rangId!=="F"?`${aura.color}20`:"#1a0025",border:`1.5px solid ${tab.id==="home"?EM2:aura.rangId!=="F"?aura.color:"#fbbf2455"}`,borderRadius:20,padding:"8px 18px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:tab.id==="home"?EM2:aura.rangId!=="F"?aura.color:"#fbbf24",whiteSpace:"nowrap",flexShrink:0}}>
              {tab.label}
            </button>
          ))}
        </div>
        {!isPremium&&<div style={{background:`${GOLD}10`,border:`1px solid ${GOLD}33`,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:12,color:GOLD}}>🔒 {L?"Free plan: Beginner level only. Upgrade to unlock all 30 exercises.":"Plan gratuit : Niveau Débutant uniquement. Passe Premium pour débloquer les 30 exercices."}</div>}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:10}}>💪</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${EM2}12`,border:`1px solid ${EM2}33`,borderRadius:20,padding:"5px 14px",marginBottom:14}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:EM2,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:EM2,letterSpacing:1}}>COACH CORPS COMPLET</span>
          </div>
          <div className="serif" style={{fontSize:28,fontWeight:700,lineHeight:1.25,marginBottom:10,color:"#edf5ef"}}>
            {L?"Calisthenics · Mobility & Longevity":"Calisthenics · Mobilité & Longévité"}
          </div>
          <div style={{color:MUT,fontSize:13,lineHeight:1.7,maxWidth:300,margin:"0 auto"}}>{L?"30 exercises with avatar illustrations. No equipment needed — just your body.":"30 exercices illustrés avec ton avatar. Aucun équipement — juste ton corps."}</div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            {val:`${totalDone}/${totalEx}`,label:L?"Done":"Fait",color:EM2},
            {val:"30",label:L?"Exercises":"Exercices",color:"#60a5fa"},
            {val:"4",label:L?"Levels":"Niveaux",color:GOLD},
          ].map(({val,label,color},i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontWeight:700,fontSize:18,color}}>{val}</div>
              <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {!isPremium ? (
        <div style={{padding:"20px"}}>
          <div style={{background:`${GOLD}08`,border:`1.5px solid ${GOLD}44`,borderRadius:18,padding:20,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:10}}>✨</div>
            <div style={{fontWeight:700,fontSize:16,color:GOLD,marginBottom:6}}>Premium requis</div>
            <div style={{color:MUT,fontSize:13,marginBottom:16}}>Accède aux 30 exercices avec illustrations.</div>
            <button onClick={onPaywall} style={{background:`linear-gradient(135deg,${GOLD},#d4a010)`,border:"none",borderRadius:14,padding:"14px 28px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#020a04",cursor:"pointer"}}>Passer Premium ✨</button>
          </div>
        </div>
      ) : (
        <div style={{padding:"20px"}}>
          {/* Niveaux */}
          {NIVEAUX_CC.map((niv,i)=>{
            const exs = exByNiveau(niv.id);
            const doneCount = exs.filter(e=>done[e.id]).length;
            return(
              <button key={i} onClick={()=>{setSelectedNiveau(niv.id);setScreen("liste");}}
                style={{width:"100%",background:CARD,border:`1.5px solid ${niv.color}33`,borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",marginBottom:12,display:"flex",alignItems:"center",gap:14,fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${niv.color}88`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=`${niv.color}33`}>
                <div style={{width:50,height:50,borderRadius:14,background:`${niv.color}15`,border:`1.5px solid ${niv.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {(!isPremium&&niv.id!=="debutant")?"🔒":niv.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:niv.color}}>{L?niv.labelEn:niv.label}</div>
                  <div style={{fontSize:12,color:MUT,marginTop:2}}>{L?niv.descEn:niv.desc} · {exs.length} {L?"exercises":"exercices"}</div>
                  {/* Barre progression */}
                  <div style={{background:"#142018",borderRadius:4,height:4,marginTop:6,overflow:"hidden"}}>
                    <div style={{width:`${exs.length>0?Math.round((doneCount/exs.length)*100):0}%`,height:"100%",background:niv.color,borderRadius:4,transition:"width .5s ease"}}/>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:niv.color}}>{doneCount}/{exs.length}</div>
                  <div style={{fontSize:10,color:MUT}}>✅</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── LISTE EXERCICES ──
  if (screen === "liste") {
    const niv = NIVEAUX_CC.find(n=>n.id===selectedNiveau);
    const exs = exByNiveau(selectedNiveau);
    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 20px 20px",background:`radial-gradient(ellipse at 50% 0%,${niv?.color}15 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
            <span style={{fontSize:32}}>{niv?.emoji}</span>
            <div>
              <div className="serif" style={{fontSize:24,fontWeight:700,color:niv?.color}}>{L?niv?.labelEn:niv?.label}</div>
              <div style={{color:MUT,fontSize:12}}>{exs.length} {L?"exercises":"exercices"}</div>
            </div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {exs.map((ex,i)=>(
              <button key={i} onClick={()=>{setSelectedEx(ex);setScreen("exercice");}}
                style={{background:done[ex.id]?`${EM2}08`:CARD,border:`1.5px solid ${done[ex.id]?EM2+"44":BDR}`,borderRadius:16,padding:"12px 10px",cursor:"pointer",textAlign:"center",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>
                {done[ex.id]&&<div style={{position:"absolute",top:6,right:6,fontSize:12}}>✅</div>}
                <div style={{width:"100%",paddingBottom:"80%",position:"relative",marginBottom:8,borderRadius:10,overflow:"hidden",background:"#f3f3f3"}}>
                  <img src={imgErr[ex.id]?"":ex.img} alt={ex.nom} onError={()=>setImgErr(p=>({...p,[ex.id]:true}))}
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain"}}/>
                </div>
                <div style={{fontWeight:700,fontSize:12,color:done[ex.id]?EM2:"#edf5ef",lineHeight:1.3}}>{L?ex.nomEn:ex.nom}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{ex.muscles.split("·")[0].trim()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DÉTAIL EXERCICE ──
  if (screen === "exercice" && selectedEx) {
    const ex = selectedEx;
    const niv = NIVEAUX_CC.find(n=>n.id===ex.niveau);
    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 20px 20px",background:`radial-gradient(ellipse at 50% 0%,${niv?.color}15 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("liste")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <span style={{background:`${niv?.color}20`,border:`1px solid ${niv?.color}44`,borderRadius:20,padding:"3px 10px",fontSize:11,color:niv?.color,fontWeight:700}}>{niv?.emoji} {L?niv?.labelEn:niv?.label}</span>
          </div>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:"#edf5ef",marginBottom:4}}>{L?ex.nomEn:ex.nom}</div>
          <div style={{color:MUT,fontSize:13}}>{ex.muscles}</div>
        </div>

        <div style={{padding:"0 20px"}}>
          {/* Image */}
          <div style={{background:"#f3f3f3",borderRadius:20,overflow:"hidden",marginBottom:16,aspectRatio:"4/3",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {!imgErr[ex.id]
              ?<img src={ex.img} alt={ex.nom} onError={()=>setImgErr(p=>({...p,[ex.id]:true}))} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
              :<div style={{fontSize:60}}>💪</div>}
          </div>

          {/* Stats séance */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:L?"Sets":"Séries",val:ex.series,color:EM2},
              {label:L?"Reps":"Reps",val:ex.reps,color:"#60a5fa"},
              {label:L?"Rest":"Repos",val:`${ex.repos}s`,color:GOLD},
            ].map(({label,val,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:18,color}}>{val}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Conseil */}
          <div style={{background:CARD,border:`1px solid ${EM2}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:EM2,fontWeight:700,marginBottom:6}}>💡 {L?"TECHNIQUE TIP":"CONSEIL TECHNIQUE"}</div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.7}}>{L?ex.conseilEn:ex.conseilFr}</div>
          </div>

          {/* Bouton terminé */}
          <button onClick={()=>{ markDone(ex.id); setScreen("liste"); }}
            style={{width:"100%",background:done[ex.id]?`${EM2}15`:`linear-gradient(135deg,#1a3300,#264d00)`,border:`1.5px solid ${EM2}${done[ex.id]?"33":"66"}`,borderRadius:16,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:EM2,cursor:"pointer"}}>
            {done[ex.id]?(L?"✅ Completed":"✅ Complété !"):(L?"✅ Mark as done (+5 🪙)":"✅ Marquer comme fait (+5 🪙)")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Alias pour compatibilité avec les screens existants
const CoachCaliV2 = CoachCorpsComplet;

const CDN2 = "https://d8j0ntlcm91z4.cloudfront.net/user_3DdXa3BM2aJ5hef8QjX1vrtzH5L/";
const MATERNITE_EXERCISES = {
  t1: [
    { id:"m_marche",    nom:"Marche sur place",        nomEn:"Marching in place",      muscles:"Jambes · Cardio doux",    series:3, reps:"60s",      repos:30,  img:CDN2+"hf_20260520_211808_fe0895dc-9422-413c-8696-2422f108d838.png", conseilFr:"Lève les genoux doucement, garde le dos droit.", conseilEn:"Lift knees gently, keep back straight." },
    { id:"m_respiration",nom:"Respiration diaphragmatique",nomEn:"Deep breathing",     muscles:"Diaphragme · Détente",    series:3, reps:"10 respirations",repos:20, img:CDN2+"hf_20260520_211824_76288038-ba9e-43f5-865a-a8d02c115293.png", conseilFr:"Main sur le ventre, inspire profondément, sens le ventre se soulever.", conseilEn:"Hand on belly, breathe deeply, feel belly rise." },
    { id:"m_cou",       nom:"Étirement cou & épaules",  nomEn:"Neck & shoulder stretch",muscles:"Cou · Épaules",          series:2, reps:"30s/côté", repos:20,  img:CDN2+"hf_20260520_211837_e6755ce8-0284-4f71-a16b-25ac46d2a18a.png", conseilFr:"Incline la tête doucement, tiens 30 secondes, sans forcer.", conseilEn:"Tilt head gently, hold 30 seconds, no strain." },
    { id:"m_catcow",    nom:"Cat-Cow prénatal",          nomEn:"Prenatal Cat-Cow",       muscles:"Colonne · Dos",           series:3, reps:"10 cycles", repos:20, img:CDN2+"hf_20260520_211846_db6fe879-14ab-453e-9c70-bbe80cbb15eb.png", conseilFr:"À 4 pattes, arche et courbe le dos en respirant.", conseilEn:"On all fours, arch and round back with breath." },
    { id:"m_squat1",   nom:"Squat avec chaise",         nomEn:"Supported squat",        muscles:"Quadriceps · Fessiers",   series:3, reps:"10-12",    repos:45,  img:CDN2+"hf_20260520_211855_4fdbc16d-927f-44f0-8b46-62f20992a92d.png", conseilFr:"Tiens la chaise, descends lentement, genoux dans l'axe des pieds.", conseilEn:"Hold chair, lower slowly, knees aligned with feet." },
    { id:"m_kegel",    nom:"Kegel",                     nomEn:"Kegel exercise",         muscles:"Plancher pelvien",        series:3, reps:"10×5s",    repos:30,  img:CDN2+"hf_20260521_140509_123647a2-bbef-44ae-9a17-02ce08d7f2a1.png", conseilFr:"Contracte le plancher pelvien 5 secondes, relâche. Essentiel pendant la grossesse.", conseilEn:"Contract pelvic floor 5 seconds, release. Essential during pregnancy." },
  ],
  t2: [
    { id:"m_sidelegs",  nom:"Side leg raises",           nomEn:"Side leg raises",        muscles:"Abducteurs · Fessiers",   series:5, reps:"20",       repos:30,  img:CDN2+"hf_20260520_211919_97eb888b-26e9-465c-884e-2402a6ae8561.png", conseilFr:"Tiens la chaise, soulève la jambe latéralement, contrôlé.", conseilEn:"Hold chair, lift leg sideways, controlled." },
    { id:"m_backlegs",  nom:"Back leg raises",           nomEn:"Back leg raises",        muscles:"Fessiers · Ischio",       series:5, reps:"20",       repos:30,  img:CDN2+"hf_20260520_211931_41905fbf-28f7-4ddb-a062-5ce6485b4920.png", conseilFr:"Face à la chaise, lève la jambe vers l'arrière, dos droit.", conseilEn:"Facing chair, lift leg back, keep back straight." },
    { id:"m_altarm",    nom:"Alt arm leg raises",        nomEn:"Alt arm leg raises",     muscles:"Core · Dos",              series:3, reps:"10/côté",  repos:30,  img:CDN2+"hf_20260520_212006_e732a65c-ca6c-4ed6-8b2e-57e33ec299b8.png", conseilFr:"À 4 pattes, étends bras et jambe opposés. Renforce le dos.", conseilEn:"On all fours, extend opposite arm and leg." },
    { id:"m_bridge2",   nom:"Glute bridge",              nomEn:"Glute bridge",           muscles:"Fessiers · Ischio",       series:3, reps:"10",       repos:30,  img:CDN2+"hf_20260521_001858_ae1e686a-49ee-4e92-a178-17237ba4fa69.png", conseilFr:"Allongée sur le dos, pousse les hanches vers le haut lentement.", conseilEn:"Lying on back, push hips up slowly." },
    { id:"m_dips2",     nom:"Tricep dips",               nomEn:"Tricep dips",            muscles:"Triceps · Épaules",       series:3, reps:"10",       repos:30,  img:CDN2+"hf_20260521_140517_1a848102-956f-4255-a074-6381acd49851.png", conseilFr:"Assis sur bord de chaise, coudes serrés, descends doucement.", conseilEn:"Seated on chair edge, elbows close, lower gently." },
    { id:"m_wallpush",  nom:"Wall push-up",              nomEn:"Wall push-up",           muscles:"Pectoraux · Triceps",     series:3, reps:"12-15",    repos:30,  img:CDN2+"hf_20260521_142208_6f55c561-4299-4e08-9eb9-fb1700527050.png", conseilFr:"Mains sur le mur, incline le corps et pousse.", conseilEn:"Hands on wall, lean in and push back." },
    { id:"m_sumo",      nom:"Sumo squat",                nomEn:"Sumo squat",             muscles:"Cuisses internes · Fessiers",series:3,reps:"12-15", repos:30,  img:CDN2+"hf_20260521_001908_3db8a324-7b4d-4d4a-ad99-fd5ed8033a71.png", conseilFr:"Pieds très écartés et tournés, descends profondément.", conseilEn:"Feet very wide and turned out, squat deep." },
    { id:"m_lateral",   nom:"Lateral raise",             nomEn:"Lateral raise",          muscles:"Épaules · Deltoides",     series:3, reps:"12",       repos:30,  img:CDN2+"hf_20260521_142216_3c463918-64c0-434f-88ae-9f09d29b505f.png", conseilFr:"Bras tendus, soulève jusqu'aux épaules, redescends lentement.", conseilEn:"Arms extended, raise to shoulder height, lower slowly." },
  ],
  t3: [
    { id:"m_wallsquat", nom:"Wall squat",                nomEn:"Wall squat",             muscles:"Quadriceps · Fessiers",   series:3, reps:"30-45s",   repos:45,  img:CDN2+"hf_20260521_140525_67fae652-c5fd-4e9a-9409-73b3d0d08b11.png", conseilFr:"Dos contre le mur, glisse en squat, tiens la position.", conseilEn:"Back against wall, slide into squat, hold position." },
    { id:"m_hipstretch",nom:"Étirement hanches assis",   nomEn:"Seated hip stretch",     muscles:"Hanches · Fessiers",      series:2, reps:"45s/côté", repos:20,  img:CDN2+"hf_20260521_142223_fd7a0452-f808-49f1-8bd9-4e995d4bb700.png", conseilFr:"Cheville sur genou opposé, penche doucement en avant.", conseilEn:"Ankle on opposite knee, lean gently forward." },
    { id:"m_thoracic3", nom:"Rotation thoracique assise",nomEn:"Seated thoracic rotation",muscles:"Thorax · Colonne",       series:2, reps:"10/côté",  repos:20,  img:CDN2+"hf_20260521_140532_06645858-d3ee-49e0-a03f-25aae0f69022.png", conseilFr:"Mains derrière la tête, rotation lente du torse.", conseilEn:"Hands behind head, slow torso rotation." },
    { id:"m_march3",    nom:"Marche lente",              nomEn:"Slow walk",              muscles:"Jambes · Cardio doux",    series:1, reps:"15-20min", repos:0,   img:CDN2+"hf_20260521_140540_58f1b1e3-4a39-4520-aa52-903978080535.png", conseilFr:"Marche à ton rythme, bonne posture, 15-20 minutes.", conseilEn:"Walk at your pace, good posture, 15-20 minutes." },
    { id:"m_breath3",   nom:"Respiration accouchement",  nomEn:"Birth breathing",        muscles:"Diaphragme · Périnée",    series:5, reps:"10 respirations",repos:30, img:CDN2+"hf_20260521_140548_91d1a959-10ba-4061-8d7f-1a9c5b37044e.png", conseilFr:"Inspire 4 secondes, expire 8 secondes. Prépare à l'accouchement.", conseilEn:"Inhale 4 seconds, exhale 8 seconds. Prepares for birth." },
    { id:"m_dosstretch",nom:"Étirement dos debout",      nomEn:"Standing back stretch",  muscles:"Dos · Colonne",           series:2, reps:"30s",      repos:20,  img:CDN2+"hf_20260521_140556_6cdcaa00-83d6-4771-afe0-9ed836e990d5.png", conseilFr:"Mains sur le mur, incline le corps, étire le dos.", conseilEn:"Hands on wall, lean body forward, stretch back." },
  ],
  postnatal: [
    { id:"m_resppost",  nom:"Respiration abdominale",   nomEn:"Deep abdominal breathing",muscles:"Abdominaux · Périnée",   series:3, reps:"10 respirations",repos:20, img:CDN2+"hf_20260520_212225_4953daec-c681-47ff-a8e6-3f671e714bb6.png", conseilFr:"Allongée, main sur ventre, inspire profondément, expire en contractant.", conseilEn:"Lying down, hand on belly, inhale deep, exhale contracting." },
    { id:"m_bridgepost",nom:"Pont fessier doux",        nomEn:"Gentle glute bridge",     muscles:"Fessiers · Core",         series:3, reps:"10",       repos:30,  img:CDN2+"hf_20260521_140605_bd1a4e46-34f8-42cf-89e1-35a7743da3dd.png", conseilFr:"Monte les hanches doucement, sans forcer. Rééducation progressive.", conseilEn:"Lift hips gently, no strain. Progressive recovery." },
    { id:"m_deadbug",   nom:"Dead bug",                 nomEn:"Dead bug",               muscles:"Core · Abdominaux",       series:3, reps:"8/côté",   repos:30,  img:CDN2+"hf_20260521_001918_4afa713b-80f9-4a2c-8c49-b4f18e72ae4a.png", conseilFr:"Dos plat au sol, étend bras et jambe opposés lentement.", conseilEn:"Back flat on floor, extend opposite arm and leg slowly." },
    { id:"m_birddog",   nom:"Bird dog",                 nomEn:"Bird dog",               muscles:"Core · Dos",              series:3, reps:"10/côté",  repos:30,  img:CDN2+"hf_20260521_001931_2e64fb57-45b1-4f9a-9283-5778779836af.png", conseilFr:"À 4 pattes, étend bras et jambe opposés. Renforce le core en douceur.", conseilEn:"On all fours, extend opposite arm and leg. Gently strengthens core." },
  ],
};

// ── SUIVI SEMAINES ──
const SUIVI_SEMAINES = {
  4:  { bebe:"Taille d'un grain de riz (2mm). Le cœur commence à battre.", poids:"< 1g", organes:"Cœur, tube neural", symptomes:["Fatigue intense","Nausées matinales","Seins sensibles","Fréquence urinaire"] },
  5:  { bebe:"Taille d'une graine de sésame (4mm). Le cœur bat 100x/min.", poids:"< 1g", organes:"Cœur, cerveau, moelle épinière", symptomes:["Nausées","Fatigue","Émotions intenses","Sensibilité aux odeurs"] },
  6:  { bebe:"Taille d'une lentille (6mm). Les bras et jambes apparaissent.", poids:"< 1g", organes:"Membres, yeux, oreilles", symptomes:["Nausées matinales","Hypersalivation","Fatigue","Maux de tête"] },
  7:  { bebe:"Taille d'un myrtille (13mm). Le visage se forme.", poids:"< 1g", organes:"Visage, mains, pieds", symptomes:["Nausées","Constipation","Ballonnements","Fatigue"] },
  8:  { bebe:"Taille d'un haricot (16mm). Tous les organes vitaux sont présents.", poids:"1g", organes:"Tous organes vitaux présents", symptomes:["Nausées","Seins douloureux","Fatigue","Humeurs changeantes"] },
  9:  { bebe:"Taille d'une cerise (23mm). Les doigts se séparent.", poids:"2g", organes:"Doigts, orteils, lèvres", symptomes:["Nausées","Fatigue","Douleurs pelviennes légères"] },
  10: { bebe:"Taille d'une fraise (31mm). Le bébé peut faire des petits mouvements.", poids:"4g", organes:"Ongles, genitaux externes", symptomes:["Nausées diminuent","Fatigue légère","Rondes ligamentaires"] },
  11: { bebe:"Taille d'un citron vert (41mm). Les reflexes apparaissent.", poids:"7g", organes:"Réflexes, diaphragme", symptomes:["Moins de nausées","Étourdissements","Constipation"] },
  12: { bebe:"Taille d'une prune (53mm). Les traits du visage sont formés.", poids:"14g", organes:"Visage complet, système nerveux", symptomes:["Nausées diminuent","Énergie qui revient","Légère prise de poids"] },
  13: { bebe:"Taille d'une pêche (74mm). Les empreintes digitales se forment.", poids:"23g", organes:"Empreintes digitales, voix", symptomes:["2ème trimestre commence","Plus d'énergie","Appétit augmente"] },
  14: { bebe:"Taille d'un citron (87mm). Le bébé peut sucer son pouce.", poids:"43g", organes:"Pouce, expressions faciales", symptomes:["Énergie retrouvée","Peau qui change","Appétit normal"] },
  16: { bebe:"Taille d'une avocat (117mm). Les yeux bougent sous les paupières.", poids:"100g", organes:"Yeux, oreilles fonctionnels", symptomes:["Petits mouvements ressentis","Dos douloureux","Jambes lourdes"] },
  20: { bebe:"Taille d'une banane (25cm). La moitié du chemin !", poids:"300g", organes:"Tous systèmes fonctionnels", symptomes:["Mouvement clairement ressenti","Ventre bien visible","Douleurs ligamentaires"] },
  24: { bebe:"Taille d'un épi de maïs (30cm). Le bébé entend ta voix !", poids:"600g", organes:"Poumons en développement", symptomes:["Mouvements fréquents","Brûlures d'estomac","Contractions Braxton Hicks"] },
  28: { bebe:"Taille d'une aubergine (37cm). Les yeux s'ouvrent.", poids:"1kg", organes:"Yeux ouverts, poumons presque prêts", symptomes:["Essoufflement","Douleurs dorsales","Oedème des pieds","Fatigue"] },
  32: { bebe:"Taille d'un chou-fleur (42cm). Le bébé se prépare à la naissance.", poids:"1.7kg", organes:"Cerveau en plein développement", symptomes:["Contractions","Fréquence urinaire","Difficultés à dormir"] },
  36: { bebe:"Taille d'un romaine (47cm). Les poumons sont presque matures.", poids:"2.6kg", organes:"Poumons matures", symptomes:["Descente du bébé","Soulagement de l'essoufflement","Pression pelvienne"] },
  40: { bebe:"Taille d'un melon (51cm). Bébé est prêt à naître ! 🌟", poids:"3.4kg", organes:"Tous systèmes prêts", symptomes:["Contractions régulières","Perte du bouchon muqueux","Impatience !"] },
};

function getSemaineData(s) {
  const semaines = Object.keys(SUIVI_SEMAINES).map(Number).sort((a,b)=>a-b);
  const closest = semaines.reduce((prev,curr) => Math.abs(curr-s)<Math.abs(prev-s)?curr:prev);
  return SUIVI_SEMAINES[closest];
}

// ── NUTRITION MATERNITÉ ──
const NUTRITION_MATERNITE = {
  recommandes: [
    {emoji:"🥬", nom:"Épinards & légumes verts", raison:"Acide folique — prévient les malformations du tube neural"},
    {emoji:"🫘", nom:"Lentilles & légumineuses", raison:"Fer + protéines + fibres — combat l'anémie"},
    {emoji:"🥚", nom:"Œufs", raison:"Choline — développement du cerveau du bébé"},
    {emoji:"🐟", nom:"Saumon, sardines", raison:"Oméga-3 — développement cérébral et visuel"},
    {emoji:"🥑", nom:"Avocat", raison:"Folate + graisses saines + potassium"},
    {emoji:"🫐", nom:"Baies & fruits rouges", raison:"Antioxydants + vitamine C + fibres"},
    {emoji:"🥕", nom:"Carottes & patate douce", raison:"Bêta-carotène → vitamine A — yeux et peau du bébé"},
    {emoji:"🧀", nom:"Fromage à pâte cuite, yaourt", raison:"Calcium + vitamine D — os et dents du bébé"},
    {emoji:"🌰", nom:"Noix & amandes", raison:"Oméga-3, magnésium, vitamine E"},
    {emoji:"🫚", nom:"Huile d'olive", raison:"Graisses saines — développement neurologique"},
  ],
  eviter: [
    {emoji:"🐟", nom:"Thon, espadon, requin", raison:"Mercure élevé — dangereux pour le système nerveux"},
    {emoji:"🧀", nom:"Fromages à pâte molle non cuits", raison:"Listéria — risque de fausse couche"},
    {emoji:"🥩", nom:"Viande crue ou rosée", raison:"Toxoplasmose — parasite dangereux pour le fœtus"},
    {emoji:"🥚", nom:"Œufs crus, mayonnaise maison", raison:"Salmonelle — infection grave pendant la grossesse"},
    {emoji:"☕", nom:"Caféine > 200mg/jour", raison:"Retard de croissance du bébé — max 1-2 cafés/jour"},
    {emoji:"🍷", nom:"Alcool", raison:"AUCUNE dose sûre — syndrome d'alcoolisation fœtale"},
    {emoji:"🌿", nom:"Certaines tisanes (sauge, romarin)", raison:"Peuvent provoquer des contractions"},
    {emoji:"🍣", nom:"Sushi, sashimi, ceviche", raison:"Poisson cru — parasites et bactéries"},
  ],
  parTrimestre: {
    t1: {
      titre:"1er Trimestre — Focus acide folique",
      nutriments: [
        {nom:"Acide folique", dose:"400-800 mcg/jour", sources:"Épinards, lentilles, asperges, avocat", role:"Prévient les anomalies du tube neural"},
        {nom:"Fer", dose:"+27mg/jour", sources:"Lentilles, viande rouge maigre, épinards", role:"Prévient l'anémie, oxygène le fœtus"},
        {nom:"Vitamine B6", dose:"1.9mg/jour", sources:"Poulet, banane, pomme de terre", role:"Réduit les nausées matinales"},
      ]
    },
    t2: {
      titre:"2ème Trimestre — Focus calcium & fer",
      nutriments: [
        {nom:"Calcium", dose:"1000mg/jour", sources:"Yaourt, sardines, amandes, brocoli", role:"Os et dents du bébé"},
        {nom:"Oméga-3 (DHA)", dose:"200mg/jour", sources:"Saumon, sardines, noix", role:"Développement du cerveau"},
        {nom:"Magnésium", dose:"350mg/jour", sources:"Noix, légumes verts, céréales complètes", role:"Prévient les crampes, détente musculaire"},
      ]
    },
    t3: {
      titre:"3ème Trimestre — Focus énergie & préparation",
      nutriments: [
        {nom:"Vitamine D", dose:"600 UI/jour", sources:"Soleil, saumon, œufs, lait enrichi", role:"Os du bébé, immunité"},
        {nom:"Fibres", dose:"28g/jour", sources:"Légumes, fruits, légumineuses", role:"Prévient constipation et hémorroïdes"},
        {nom:"Protéines", dose:"+25g/jour", sources:"Poulet, œufs, lentilles, yaourt grec", role:"Croissance finale du bébé"},
      ]
    },
  }
};

const PHASES_MATERNITE = [
  { id:"t1",       label:"1er Trimestre",  labelEn:"1st Trimester",  emoji:"🌸", color:"#f9a8d4", weeks:"0–12 sem",    weeksEn:"0–12 weeks",   desc:"Exercices doux, respiration, mise en forme",      descEn:"Gentle exercises, breathing, conditioning" },
  { id:"t2",       label:"2ème Trimestre", labelEn:"2nd Trimester",  emoji:"🌿", color:"#86efac", weeks:"13–26 sem",   weeksEn:"13–26 weeks",  desc:"Renforcement doux, énergie optimale",              descEn:"Gentle strengthening, peak energy" },
  { id:"t3",       label:"3ème Trimestre", labelEn:"3rd Trimester",  emoji:"🌙", color:"#c4b5fd", weeks:"27–40 sem",   weeksEn:"27–40 weeks",  desc:"Mobilité, équilibre, préparation accouchement",   descEn:"Mobility, balance, birth preparation" },
  { id:"postnatal",label:"Postnatal",      labelEn:"Postnatal",      emoji:"👶", color:"#fcd34d", weeks:"Après l'accouchement", weeksEn:"After birth", desc:"Rééducation progressive, core doux",    descEn:"Progressive recovery, gentle core" },
];

function GrossesseModule({ user, onHome, onCoinsEarned, lang }) {
  const L = lang === "en";
  const PINK = "#f9a8d4";
  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("exercices"); // exercices | suivi | nutrition | cycle | emotions
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedEx, setSelectedEx] = useState(null);
  const [semaine, setSemaine] = useState(20);
  const [nutritionTab, setNutritionTab] = useState("recommandes");
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem("vs_maternite_done")||"{}"); } catch { return {}; } });
  const [imgErr, setImgErr] = useState({});

  // ─── Cycle menstruel ───
  const [dernieresRegles, setDernieresRegles] = useState(() => localStorage.getItem("vs_cycle_debut") || "");
  const [dureeRegles, setDureeRegles]         = useState(() => parseInt(localStorage.getItem("vs_cycle_duree_regles") || "5"));
  const [dureeCycle, setDureeCycle]           = useState(() => parseInt(localStorage.getItem("vs_cycle_duree") || "28"));
  const [cycleMonth, setCycleMonth]           = useState(() => new Date().getMonth());
  const [cycleYear, setCycleYear]             = useState(() => new Date().getFullYear());

  const saveCycle = (debut, dureeR, dureeC) => {
    localStorage.setItem("vs_cycle_debut", debut);
    localStorage.setItem("vs_cycle_duree_regles", dureeR);
    localStorage.setItem("vs_cycle_duree", dureeC);
  };

  // Calcul des jours fertiles selon le cycle
  const getCycleData = (debut, dureeR, dureeC) => {
    if (!debut) return {};
    const start = new Date(debut);
    const result = {};
    // Générer 3 cycles
    for (let c = 0; c < 3; c++) {
      const cycleStart = new Date(start);
      cycleStart.setDate(cycleStart.getDate() + c * dureeC);
      // Jours de règles
      for (let d = 0; d < dureeR; d++) {
        const day = new Date(cycleStart);
        day.setDate(day.getDate() + d);
        result[day.toISOString().slice(0,10)] = "regles";
      }
      // Ovulation = jour 14 du cycle (variable selon durée)
      const ovDay = Math.round(dureeC * 0.5);
      const ovDate = new Date(cycleStart);
      ovDate.setDate(ovDate.getDate() + ovDay - 1);
      result[ovDate.toISOString().slice(0,10)] = "ovulation";
      // Fenêtre fertile = 5 jours avant ovulation + jour ovulation
      for (let d = -5; d < 0; d++) {
        const fertDay = new Date(ovDate);
        fertDay.setDate(fertDay.getDate() + d);
        const key = fertDay.toISOString().slice(0,10);
        if (!result[key]) result[key] = "fertile";
      }
    }
    return result;
  };

  const cycleData = getCycleData(dernieresRegles, dureeRegles, dureeCycle);

  const markDone = (id) => {
    const nd = {...done, [id]: true};
    setDone(nd);
    localStorage.setItem("vs_maternite_done", JSON.stringify(nd));
    if (onCoinsEarned && !done[id]) onCoinsEarned(5);
  };

  const exsByPhase = (pid) => MATERNITE_EXERCISES[pid] || [];
  const totalDone = Object.keys(done).length;
  const totalEx = Object.values(MATERNITE_EXERCISES).flat().length;
  const semaineData = getSemaineData(semaine);

  if (screen === "home") return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
      <div style={{padding:"52px 20px 24px",background:`radial-gradient(ellipse at 50% 0%,${PINK}18 0%,#060d08 65%)`}}>
        <button onClick={onHome} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:10}}>🤰</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${PINK}12`,border:`1px solid ${PINK}33`,borderRadius:20,padding:"5px 14px",marginBottom:14}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:PINK,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:PINK,letterSpacing:1}}>{L?"MATERNITY & MOVEMENT":"MATERNITÉ & MOUVEMENT"}</span>
          </div>
          <div className="serif" style={{fontSize:26,fontWeight:700,marginBottom:10,color:"#edf5ef"}}>
            {L?"Safe exercises for every trimester":"Exercices sécurisés pour chaque trimestre"}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:6}}>
          {[
            {id:"exercices",label:L?"Exercises":"Exercices",emoji:"🏃"},
            {id:"suivi",label:L?"Weeks":"Semaines",emoji:"📅"},
            {id:"nutrition",label:"Nutrition",emoji:"🥗"},
            {id:"cycle",label:L?"Cycle":"Cycle",emoji:"🌙"},
            {id:"emotions",label:L?"Emotions":"Émotions",emoji:"💜"},
            {id:"deuil",label:L?"Support":"Soutien",emoji:"🕊️"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?`${PINK}20`:CARD,border:`1.5px solid ${tab===t.id?PINK:BDR}`,borderRadius:14,padding:"10px 4px",cursor:"pointer",textAlign:"center",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
              <div style={{fontSize:16,marginBottom:2}}>{t.emoji}</div>
              <div style={{fontSize:9,fontWeight:tab===t.id?700:400,color:tab===t.id?PINK:MUT}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px"}}>

        {/* ── TAB EXERCICES ── */}
        {tab==="exercices"&&(
          <>
            <div style={{background:"#2d0a1a",border:`1px solid ${PINK}30`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:12,color:PINK,lineHeight:1.7}}>⚠️ {L?"Always consult your doctor or midwife before starting any exercise program.":"Consulte toujours ton médecin ou sage-femme avant de commencer."}</div>
            </div>
            {PHASES_MATERNITE.map((phase,i)=>{
              const exs = exsByPhase(phase.id);
              const doneCount = exs.filter(e=>done[e.id]).length;
              return(
                <button key={i} onClick={()=>{setSelectedPhase(phase.id);setScreen("phase");}}
                  style={{width:"100%",background:CARD,border:`1.5px solid ${phase.color}33`,borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",marginBottom:12,display:"flex",alignItems:"center",gap:14,fontFamily:"'Outfit',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=`${phase.color}88`}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=`${phase.color}33`}>
                  <div style={{width:52,height:52,borderRadius:14,background:`${phase.color}15`,border:`1.5px solid ${phase.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{phase.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:phase.color}}>{L?phase.labelEn:phase.label}</div>
                    <div style={{fontSize:11,color:MUT,marginTop:2}}>{L?phase.weeksEn:phase.weeks} · {exs.length} {L?"exercises":"exercices"}</div>
                    <div style={{background:"#142018",borderRadius:4,height:4,marginTop:6,overflow:"hidden"}}>
                      <div style={{width:`${exs.length>0?Math.round((doneCount/exs.length)*100):0}%`,height:"100%",background:phase.color,borderRadius:4}}/>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:phase.color}}>{doneCount}/{exs.length}</div>
                  </div>
                </button>
              );
            })}
            <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:14,padding:14}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,marginBottom:6}}>🌙 TIBB AN-NABAWI</div>
              <div style={{fontSize:12,color:"#a08040",lineHeight:1.7}}>{L?"The Prophet ﷺ said: 'Your body has a right over you.' Moderate movement during pregnancy is sunnah.":"Le Prophète ﷺ a dit : 'Ton corps a un droit sur toi.' Le mouvement modéré pendant la grossesse est sunna."}</div>
            </div>
          </>
        )}

        {/* ── TAB SUIVI SEMAINE ── */}
        {tab==="suivi"&&(
          <div style={{paddingTop:8}}>
            <div style={{background:CARD,border:`1px solid ${PINK}33`,borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,marginBottom:12}}>📅 {L?"WHICH WEEK ARE YOU IN?":"QUELLE SEMAINE ES-TU ?"}</div>
              <div style={{textAlign:"center",marginBottom:12}}>
                <span style={{fontSize:52,fontWeight:700,color:PINK}}>{semaine}</span>
                <span style={{fontSize:16,color:MUT}}> {L?"weeks":"semaines"}</span>
              </div>
              <input type="range" min={4} max={40} step={1} value={semaine}
                onChange={e=>setSemaine(Number(e.target.value))}
                style={{width:"100%",accentColor:PINK,cursor:"pointer",marginBottom:8}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MUT}}>
                <span>4 sem</span><span>|T1|</span><span>|T2|</span><span>|T3|</span><span>40 sem</span>
              </div>
            </div>

            {semaineData&&(
              <>
                {/* Bébé */}
                <div style={{background:`${PINK}08`,border:`1.5px solid ${PINK}33`,borderRadius:18,padding:18,marginBottom:12}}>
                  <div style={{fontSize:11,color:PINK,fontWeight:700,marginBottom:10}}>👶 {L?"YOUR BABY THIS WEEK":"TON BÉBÉ CETTE SEMAINE"}</div>
                  <div style={{fontSize:14,color:"#edf5ef",lineHeight:1.7,marginBottom:10}}>{semaineData.bebe}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{background:CARD,borderRadius:12,padding:10,textAlign:"center"}}>
                      <div style={{fontSize:18,marginBottom:4}}>⚖️</div>
                      <div style={{fontWeight:700,fontSize:14,color:PINK}}>{semaineData.poids}</div>
                      <div style={{fontSize:10,color:MUT}}>{L?"Weight":"Poids"}</div>
                    </div>
                    <div style={{background:CARD,borderRadius:12,padding:10,textAlign:"center"}}>
                      <div style={{fontSize:18,marginBottom:4}}>🫀</div>
                      <div style={{fontWeight:700,fontSize:12,color:PINK,lineHeight:1.3}}>{semaineData.organes}</div>
                      <div style={{fontSize:10,color:MUT}}>{L?"Development":"Développement"}</div>
                    </div>
                  </div>
                </div>

                {/* Symptômes */}
                <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontSize:11,color:MUT,fontWeight:700,marginBottom:10}}>🌡️ {L?"COMMON SYMPTOMS":"SYMPTÔMES COURANTS"}</div>
                  {semaineData.symptomes.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<semaineData.symptomes.length-1?8:0,paddingBottom:i<semaineData.symptomes.length-1?8:0,borderBottom:i<semaineData.symptomes.length-1?`1px solid ${BDR}`:"none"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:PINK,flexShrink:0}}/>
                      <span style={{fontSize:13,color:"#a0c8a8"}}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Trimestre actuel */}
                <div style={{background:"#1a1005",border:`1px solid ${GOLD}22`,borderRadius:12,padding:12}}>
                  <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:4}}>
                    {semaine<=12?"🌸 1er Trimestre":semaine<=26?"🌿 2ème Trimestre":semaine<=40?"🌙 3ème Trimestre":"👶 Postnatal"}
                  </div>
                  <div style={{fontSize:12,color:"#a08040"}}>
                    {semaine<=12?"Focus : repos, acide folique, éviter les nausées":semaine<=26?"Période dorée ! Plus d'énergie, ventre qui pousse":semaine<=40?"Prépare-toi ! Le grand jour approche 🌟":"Félicitations ! Rééducation progressive"}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB NUTRITION ── */}
        {tab==="nutrition"&&(
          <div style={{paddingTop:8}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
              {[
                {id:"recommandes",label:L?"Eat":"Manger",emoji:"✅"},
                {id:"eviter",label:L?"Avoid":"Éviter",emoji:"🚫"},
                {id:"trimestre",label:L?"By trimester":"Par trimestre",emoji:"📊"},
              ].map(t=>(
                <button key={t.id} onClick={()=>setNutritionTab(t.id)}
                  style={{background:nutritionTab===t.id?`${EM}15`:CARD,border:`1.5px solid ${nutritionTab===t.id?EM:BDR}`,borderRadius:12,padding:"9px 6px",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  <div style={{fontSize:16,marginBottom:2}}>{t.emoji}</div>
                  <div style={{fontSize:10,fontWeight:nutritionTab===t.id?700:400,color:nutritionTab===t.id?EM:MUT}}>{t.label}</div>
                </button>
              ))}
            </div>

            {nutritionTab==="recommandes"&&(
              <>
                <div style={{fontSize:11,color:EM,fontWeight:700,marginBottom:10}}>✅ {L?"RECOMMENDED FOODS":"ALIMENTS RECOMMANDÉS"}</div>
                {NUTRITION_MATERNITE.recommandes.map((item,i)=>(
                  <div key={i} style={{background:CARD,border:`1px solid ${EM}15`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
                    <span style={{fontSize:24,flexShrink:0}}>{item.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:EM,marginBottom:3}}>{item.nom}</div>
                      <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>{item.raison}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {nutritionTab==="eviter"&&(
              <>
                <div style={{fontSize:11,color:DANGER,fontWeight:700,marginBottom:10}}>🚫 {L?"FOODS TO AVOID":"ALIMENTS À ÉVITER"}</div>
                {NUTRITION_MATERNITE.eviter.map((item,i)=>(
                  <div key={i} style={{background:"#1a0505",border:`1px solid ${DANGER}20`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
                    <span style={{fontSize:24,flexShrink:0}}>{item.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:DANGER,marginBottom:3}}>{item.nom}</div>
                      <div style={{fontSize:12,color:MUT,lineHeight:1.5}}>{item.raison}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {nutritionTab==="trimestre"&&(
              <>
                {["t1","t2","t3"].map((tid,i)=>{
                  const data = NUTRITION_MATERNITE.parTrimestre[tid];
                  const colors = ["#f9a8d4","#86efac","#c4b5fd"];
                  const c = colors[i];
                  return(
                    <div key={tid} style={{background:CARD,border:`1.5px solid ${c}33`,borderRadius:18,padding:16,marginBottom:12}}>
                      <div style={{fontWeight:700,fontSize:14,color:c,marginBottom:12}}>{data.titre}</div>
                      {data.nutriments.map((n,j)=>(
                        <div key={j} style={{marginBottom:j<data.nutriments.length-1?12:0,paddingBottom:j<data.nutriments.length-1?12:0,borderBottom:j<data.nutriments.length-1?`1px solid ${BDR}`:"none"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                            <span style={{fontWeight:700,fontSize:13,color:c}}>{n.nom}</span>
                            <span style={{fontSize:11,color:MUT,background:`${c}15`,borderRadius:8,padding:"2px 7px"}}>{n.dose}</span>
                          </div>
                          <div style={{fontSize:11,color:"#60a5fa",marginBottom:3}}>📍 {n.sources}</div>
                          <div style={{fontSize:11,color:MUT,lineHeight:1.5}}>{n.role}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}


        {/* ── TAB CYCLE MENSTRUEL ── */}
        {tab==="cycle"&&(
          <div style={{paddingTop:8}}>
            {/* Config cycle */}
            <div style={{background:CARD,border:`1.5px solid ${PINK}33`,borderRadius:18,padding:18,marginBottom:16}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,letterSpacing:.8,marginBottom:14}}>
                🌙 {L?"MENSTRUAL CYCLE SETTINGS":"PARAMÈTRES DU CYCLE"}
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:MUT,marginBottom:6}}>{L?"First day of last period":"Premier jour des dernières règles"}</div>
                <input type="date" value={dernieresRegles}
                  onChange={e=>{setDernieresRegles(e.target.value);saveCycle(e.target.value,dureeRegles,dureeCycle);}}
                  style={{width:"100%",background:"#060d08",border:`1px solid ${PINK}44`,borderRadius:10,padding:"10px 14px",color:"#edf5ef",fontSize:14,fontFamily:"'Outfit',sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:12,color:MUT,marginBottom:6}}>{L?"Period duration (days)":"Durée des règles (jours)"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>{const v=Math.max(2,dureeRegles-1);setDureeRegles(v);saveCycle(dernieresRegles,v,dureeCycle);}}
                      style={{width:32,height:32,borderRadius:"50%",background:`${PINK}15`,border:`1px solid ${PINK}44`,color:PINK,fontSize:18,cursor:"pointer"}}>-</button>
                    <span style={{fontSize:18,fontWeight:700,color:"#edf5ef",minWidth:24,textAlign:"center"}}>{dureeRegles}</span>
                    <button onClick={()=>{const v=Math.min(10,dureeRegles+1);setDureeRegles(v);saveCycle(dernieresRegles,v,dureeCycle);}}
                      style={{width:32,height:32,borderRadius:"50%",background:`${PINK}15`,border:`1px solid ${PINK}44`,color:PINK,fontSize:18,cursor:"pointer"}}>+</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:12,color:MUT,marginBottom:6}}>{L?"Cycle length (days)":"Durée du cycle (jours)"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>{const v=Math.max(21,dureeCycle-1);setDureeCycle(v);saveCycle(dernieresRegles,dureeRegles,v);}}
                      style={{width:32,height:32,borderRadius:"50%",background:`${PINK}15`,border:`1px solid ${PINK}44`,color:PINK,fontSize:18,cursor:"pointer"}}>-</button>
                    <span style={{fontSize:18,fontWeight:700,color:"#edf5ef",minWidth:24,textAlign:"center"}}>{dureeCycle}</span>
                    <button onClick={()=>{const v=Math.min(40,dureeCycle+1);setDureeCycle(v);saveCycle(dernieresRegles,dureeRegles,v);}}
                      style={{width:32,height:32,borderRadius:"50%",background:`${PINK}15`,border:`1px solid ${PINK}44`,color:PINK,fontSize:18,cursor:"pointer"}}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendrier */}
            {dernieresRegles ? (
              <div style={{background:CARD,border:`1px solid ${PINK}22`,borderRadius:18,padding:16,marginBottom:16}}>
                {/* 3 mois affichés */}
                {[0,1,2].map(offset => {
                  let m = cycleMonth + offset;
                  let y = cycleYear;
                  if (m > 11) { m -= 12; y += 1; }
                  const firstDay = new Date(y,m,1).getDay();
                  const daysInMonth = new Date(y,m+1,0).getDate();
                  const cells = [];
                  for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`}/>);
                  for(let d=1;d<=daysInMonth;d++){
                    const dateKey = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                    const type = cycleData[dateKey];
                    const isToday = dateKey === new Date().toISOString().slice(0,10);
                    const bgColor = type==="regles"?"#ef4444" : type==="ovulation"?"#e879f9" : type==="fertile"?"#22c55e" : "transparent";
                    const borderColor = isToday ? PINK : type ? bgColor : "transparent";
                    cells.push(
                      <div key={d} style={{
                        aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
                        borderRadius:"50%",fontSize:10,fontWeight:type||isToday?700:400,
                        color:type?"#fff":isToday?PINK:"#edf5ef",
                        background:type?`${bgColor}99`:"transparent",
                        border:`1.5px solid ${borderColor}`,
                      }}>{d}</div>
                    );
                  }
                  return (
                    <div key={offset} style={{marginBottom:offset<2?16:0}}>
                      {/* Titre mois */}
                      <div style={{fontSize:12,fontWeight:700,color:PINK,textAlign:"center",marginBottom:8,textTransform:"capitalize"}}>
                        {new Date(y,m).toLocaleDateString(L?"en-US":"fr-FR",{month:"long",year:"numeric"})}
                      </div>
                      {/* Jours de la semaine */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
                        {(L?["S","M","T","W","T","F","S"]:["D","L","M","M","J","V","S"]).map((d,i)=>(
                          <div key={i} style={{textAlign:"center",fontSize:9,color:MUT,fontWeight:700,padding:"2px 0"}}>{d}</div>
                        ))}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{cells}</div>
                    </div>
                  );
                })}

                {/* Navigation */}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                  <button onClick={()=>{if(cycleMonth===0){setCycleMonth(11);setCycleYear(y=>y-1);}else setCycleMonth(m=>m-1);}}
                    style={{background:`${PINK}15`,border:`1px solid ${PINK}33`,borderRadius:10,padding:"8px 16px",cursor:"pointer",color:PINK,fontSize:13,fontWeight:700}}>
                    ‹ {L?"Prev":"Préc"}
                  </button>
                  <button onClick={()=>{setCycleMonth(new Date().getMonth());setCycleYear(new Date().getFullYear());}}
                    style={{background:`${PINK}10`,border:`1px solid ${PINK}22`,borderRadius:10,padding:"8px 16px",cursor:"pointer",color:PINK,fontSize:12}}>
                    {L?"Today":"Aujourd'hui"}
                  </button>
                  <button onClick={()=>{if(cycleMonth===11){setCycleMonth(0);setCycleYear(y=>y+1);}else setCycleMonth(m=>m+1);}}
                    style={{background:`${PINK}15`,border:`1px solid ${PINK}33`,borderRadius:10,padding:"8px 16px",cursor:"pointer",color:PINK,fontSize:13,fontWeight:700}}>
                    {L?"Next":"Suiv"} ›
                  </button>
                </div>

                {/* Légende */}
                <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
                  {[
                    {color:"#ef4444",label:L?"Period":"Règles"},
                    {color:"#22c55e",label:L?"Fertile":"Fertile"},
                    {color:"#e879f9",label:L?"Ovulation":"Ovulation"},
                  ].map(({color,label})=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>
                      <span style={{fontSize:11,color:MUT}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"24px 0",color:MUT,fontSize:13}}>
                {L?"Enter your last period date to see the calendar 🌙":"Entre la date de tes dernières règles pour voir le calendrier 🌙"}
              </div>
            )}

            {/* Prochaine ovulation */}
            {dernieresRegles && (()=>{
              const today = new Date().toISOString().slice(0,10);
              const nextOv = Object.entries(cycleData).find(([d,t])=>t==="ovulation"&&d>=today);
              const nextR  = Object.entries(cycleData).find(([d,t])=>t==="regles"&&d>=today);
              const todayType = cycleData[today];
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                  <div style={{background:"#1a0520",border:"1px solid #e879f933",borderRadius:16,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:6}}>🌸</div>
                    <div style={{fontSize:11,color:"#e879f9",fontWeight:700,marginBottom:4}}>{L?"Next ovulation":"Prochaine ovulation"}</div>
                    <div style={{fontSize:13,color:"#edf5ef",fontWeight:700}}>
                      {nextOv ? new Date(nextOv[0]).toLocaleDateString(L?"en-US":"fr-FR",{day:"numeric",month:"short"}) : "—"}
                    </div>
                  </div>
                  <div style={{background:"#1a0a05",border:"1px solid #ef444433",borderRadius:16,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:6}}>📅</div>
                    <div style={{fontSize:11,color:"#ef4444",fontWeight:700,marginBottom:4}}>{L?"Next period":"Prochaines règles"}</div>
                    <div style={{fontSize:13,color:"#edf5ef",fontWeight:700}}>
                      {nextR ? new Date(nextR[0]).toLocaleDateString(L?"en-US":"fr-FR",{day:"numeric",month:"short"}) : "—"}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB ÉMOTIONS & HORMONES ── */}
        {tab==="emotions"&&(
          <div style={{paddingTop:8}}>
            <div style={{background:"#1a0a20",border:`1px solid ${PINK}33`,borderRadius:16,padding:14,marginBottom:16}}>
              <div style={{fontSize:13,color:PINK,lineHeight:1.7}}>
                💜 {L
                  ?"Every emotion you feel during pregnancy is normal. Your hormones are working hard for your baby. You are not alone."
                  :"Chaque émotion que tu ressens pendant la grossesse est normale. Tes hormones travaillent dur pour ton bébé. Tu n'es pas seule."}
              </div>
            </div>

            {[
              {
                t:L?"1st Trimester (weeks 1-12)":"1er Trimestre (semaines 1-12)",
                color:"#f9a8d4", emoji:"🌱",
                hormones:["hCG","Progestérone","Œstrogènes"],
                emotions:L?[
                  "Intense fatigue — completely normal, your body is building a placenta",
                  "Nausea + emotional sensitivity — hCG at its peak",
                  "Anxiety about the pregnancy — very common",
                  "Sudden mood swings — hormonal rollercoaster",
                  "Fear and excitement at the same time ❤️"
                ]:[
                  "Fatigue intense — complètement normale, ton corps construit un placenta",
                  "Nausées + sensibilité émotionnelle — hCG à son pic",
                  "Anxiété par rapport à la grossesse — très courante",
                  "Sautes d'humeur soudaines — montagnes russes hormonales",
                  "Peur et excitation en même temps ❤️"
                ],
                conseil:L?"Rest as much as possible. Talk about your fears with your partner or midwife. This is temporary.":"Repose-toi autant que possible. Parle de tes peurs à ton partenaire ou sage-femme. C'est temporaire.",
                dua:L?"'My Lord, I seek refuge with You from the whispers of the shaytan' — Al-Mu'minun 97-98":"« Mon Seigneur, je cherche refuge en Toi contre les murmures du shaytan » — Al-Mu'minun 97-98"
              },
              {
                t:L?"2nd Trimester (weeks 13-26)":"2ème Trimestre (semaines 13-26)",
                color:"#86efac", emoji:"☀️",
                hormones:["Progestérone stable","Œstrogènes+","Endorphines"],
                emotions:L?[
                  "Energy returns — the 'golden period' of pregnancy",
                  "Better mood, more optimistic",
                  "Baby starts moving — profound emotional bonding",
                  "Possible body image concerns — normal and temporary",
                  "Increased libido for some — hormones in balance"
                ]:[
                  "Retour de l'énergie — la 'période dorée' de la grossesse",
                  "Meilleure humeur, plus d'optimisme",
                  "Le bébé commence à bouger — attachement émotionnel profond",
                  "Possibles inquiétudes sur l'image corporelle — normal et temporaire",
                  "Libido augmentée pour certaines — hormones en équilibre"
                ],
                conseil:L?"Ideal time for yoga, gentle walks, bonding with your baby. Take advantage of this calmer period.":"Période idéale pour le yoga, les marches douces, le lien avec ton bébé. Profite de cette période plus calme.",
                dua:L?"'And We have enjoined upon man, to his parents, good treatment' — Al-Ahqaf 15":"« Et Nous avons recommandé à l'être humain la bonté envers ses parents » — Al-Ahqaf 15"
              },
              {
                t:L?"3rd Trimester (weeks 27-40)":"3ème Trimestre (semaines 27-40)",
                color:"#fbbf24", emoji:"🌟",
                hormones:["Relaxine","Ocytocine","Cortisol"],
                emotions:L?[
                  "Birth anxiety — very normal, even for 2nd+ pregnancies",
                  "Nesting instinct — urge to prepare everything",
                  "Interrupted sleep = increased irritability",
                  "Impatience to meet baby",
                  "Possible prenatal blues — speak to your doctor if persistent"
                ]:[
                  "Anxiété par rapport à l'accouchement — très normale, même pour les 2ème grossesses",
                  "Instinct de nidification — envie de tout préparer",
                  "Sommeil perturbé = irritabilité augmentée",
                  "Impatience de rencontrer bébé",
                  "Possible blues prénatal — parle à ton médecin si persistant"
                ],
                conseil:L?"Prepare your birth plan but remain flexible. Practise breathing. Allah has decreed this baby for you — trust.":"Prépare ton plan de naissance mais reste flexible. Pratique la respiration. Allah a décrété ce bébé pour toi — fais confiance.",
                dua:L?"'Allah does not burden a soul beyond that it can bear' — Al-Baqarah 286":"« Allah ne charge une âme que dans la mesure de sa capacité » — Al-Baqarah 286"
              },
            ].map((trim,i)=>(
              <div key={i} style={{background:CARD,border:`1.5px solid ${trim.color}33`,borderRadius:20,padding:18,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{fontSize:28}}>{trim.emoji}</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:trim.color}}>{trim.t}</div>
                    <div style={{fontSize:11,color:MUT,marginTop:2}}>{trim.hormones.join(" · ")}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:trim.color,fontWeight:700,letterSpacing:.8,marginBottom:10}}>
                  {L?"EMOTIONS YOU MAY FEEL":"ÉMOTIONS QUE TU PEUX RESSENTIR"}
                </div>
                {trim.emotions.map((e,j)=>(
                  <div key={j} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:trim.color,marginTop:5,flexShrink:0}}/>
                    <span style={{fontSize:13,color:"#edf5ef",lineHeight:1.5}}>{e}</span>
                  </div>
                ))}
                <div style={{background:`${trim.color}10`,border:`1px solid ${trim.color}22`,borderRadius:12,padding:"12px 14px",marginTop:12,marginBottom:10}}>
                  <div style={{fontSize:11,color:trim.color,fontWeight:700,marginBottom:6}}>💡 {L?"ADVICE":"CONSEIL"}</div>
                  <div style={{fontSize:12,color:"#edf5ef",lineHeight:1.6}}>{trim.conseil}</div>
                </div>
                <div style={{background:"#0a1505",border:"1px solid #00ff8822",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:"#00ff88",fontWeight:700,marginBottom:6}}>🌿 {L?"DUA":"DU'A"}</div>
                  <div style={{fontSize:12,color:"#b8d4bc",fontStyle:"italic",lineHeight:1.6}}>{trim.dua}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB SOUTIEN — FAUSSE COUCHE & DEUIL PÉRINATAL ── */}
        {tab==="deuil"&&(
          <div style={{paddingTop:8}}>

            {/* Message d'accueil doux */}
            <div style={{background:"linear-gradient(135deg,#1a0a1a,#0d0515)",border:`1.5px solid ${PINK}44`,borderRadius:20,padding:20,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🕊️</div>
              <div style={{fontSize:16,fontWeight:800,color:PINK,marginBottom:10,lineHeight:1.3}}>
                {L?"You are not alone.":"Tu n'es pas seule."}
              </div>
              <div style={{fontSize:13,color:"#d4b8d4",lineHeight:1.8}}>
                {L
                  ?"This space was created for you. What you feel is real, valid, and worthy of care. Take your time."
                  :"Cet espace a été créé pour toi. Ce que tu ressens est réel, valide, et mérite d'être soigné. Prends ton temps."}
              </div>
            </div>

            {/* Statistique — tu n'es pas seule */}
            <div style={{background:CARD,border:`1px solid ${PINK}22`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,letterSpacing:.8,marginBottom:10}}>
                💚 {L?"YOU ARE NOT ALONE":"TU N'ES PAS SEULE"}
              </div>
              <div style={{fontSize:14,color:"#edf5ef",lineHeight:1.7,marginBottom:10}}>
                {L
                  ?"1 in 4 pregnancies ends in miscarriage. This means millions of women around the world have walked this same path. Your pain is real. Your grief is legitimate."
                  :"1 grossesse sur 4 se termine par une fausse couche. Cela signifie que des millions de femmes dans le monde ont traversé ce même chemin. Ta douleur est réelle. Ton deuil est légitime."}
              </div>
              <div style={{background:`${PINK}10`,borderRadius:12,padding:"12px 14px",fontSize:12,color:"#d4b8d4",lineHeight:1.6}}>
                {L
                  ?"A miscarriage is not your fault. It is not caused by exercise, stress, or anything you did or didn't do."
                  :"Une fausse couche n'est pas ta faute. Elle n'est pas causée par l'exercice, le stress, ou quoi que ce soit que tu aies fait ou pas fait."}
              </div>
            </div>

            {/* Ce que tu peux ressentir */}
            <div style={{background:CARD,border:`1px solid ${PINK}22`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,letterSpacing:.8,marginBottom:14}}>
                💜 {L?"WHAT YOU MAY FEEL":"CE QUE TU PEUX RESSENTIR"}
              </div>
              {[
                {
                  emoji:"😢",
                  titre:L?"Deep sadness":"Tristesse profonde",
                  desc:L?"Crying for no apparent reason, feeling empty. This is grief, and grief takes time.":"Pleurer sans raison apparente, se sentir vide. C'est le deuil, et le deuil prend du temps."
                },
                {
                  emoji:"😤",
                  titre:L?"Anger":"Colère",
                  desc:L?"Anger at yourself, at life, at others who are pregnant. This is completely normal.":"Colère envers toi-même, envers la vie, envers les autres femmes enceintes. C'est tout à fait normal."
                },
                {
                  emoji:"😶",
                  titre:L?"Numbness":"Engourdissement",
                  desc:L?"Feeling nothing, like you're on autopilot. Your mind is protecting you.":"Ne rien ressentir, être en mode automatique. Ton esprit te protège."
                },
                {
                  emoji:"😰",
                  titre:L?"Fear of future pregnancies":"Peur des grossesses futures",
                  desc:L?"Anxiety at the idea of trying again. Give yourself time — there is no rush.":"Anxiété à l'idée de réessayer. Donne-toi du temps — il n'y a pas d'urgence."
                },
                {
                  emoji:"💭",
                  titre:L?"Guilt":"Culpabilité",
                  desc:L?"The feeling that you could have done something differently. But you couldn't have. It was not in your hands.":"Le sentiment que tu aurais pu faire quelque chose différemment. Mais non. Ce n'était pas entre tes mains."
                },
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:i<4?14:0,paddingBottom:i<4?14:0,borderBottom:i<4?`1px solid #1a0a1a`:"none"}}>
                  <span style={{fontSize:24,flexShrink:0}}>{item.emoji}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:PINK,marginBottom:4}}>{item.titre}</div>
                    <div style={{fontSize:12,color:"#d4b8d4",lineHeight:1.6}}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Réconfort islamique */}
            <div style={{background:"linear-gradient(135deg,#0a1505,#0d1a08)",border:`1.5px solid #00ff8833`,borderRadius:20,padding:20,marginBottom:14}}>
              <div style={{fontSize:11,color:"#00ff88",fontWeight:700,letterSpacing:.8,marginBottom:14}}>
                🌿 {L?"ISLAMIC COMFORT":"RÉCONFORT ISLAMIQUE"}
              </div>

              <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a2a1a"}}>
                <div style={{fontSize:13,color:"#b8d4bc",lineHeight:1.8,marginBottom:8}}>
                  {L
                    ?"The Prophet ﷺ said: 'The miscarried fetus will drag its mother to Paradise by its umbilical cord if she is patient and seeks reward from Allah.'"
                    :"Le Prophète ﷺ a dit : « L'enfant mort-né tirera sa mère vers le Paradis par son cordon ombilical si elle est patiente et cherche la récompense d'Allah. »"}
                </div>
                <div style={{fontSize:11,color:"#00ff88",fontStyle:"italic"}}>— {L?"Reported by Ibn Majah":"Rapporté par Ibn Majah"}</div>
              </div>

              <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a2a1a"}}>
                <div style={{fontSize:13,color:"#b8d4bc",lineHeight:1.8,marginBottom:8}}>
                  {L
                    ?"In Islam, a baby lost before birth is considered pure (Tahir) and will be in Paradise. He or she will be waiting for you, and will intercede for you on the Day of Judgment."
                    :"En Islam, un bébé perdu avant la naissance est considéré pur (Tahir) et sera au Paradis. Il ou elle t'attend, et intercédera pour toi au Jour du Jugement."}
                </div>
              </div>

              {/* Dua de guérison */}
              <div style={{background:"#060d0840",borderRadius:14,padding:14}}>
                <div style={{fontSize:11,color:"#00ff88",fontWeight:700,marginBottom:10}}>
                  🤲 {L?"DUA FOR HEALING":"DU'A POUR LA GUÉRISON"}
                </div>
                <div style={{fontSize:18,color:"#edf5ef",textAlign:"center",marginBottom:8,lineHeight:1.8,fontFamily:"serif"}}>
                  اللَّهُمَّ آجِرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا
                </div>
                <div style={{fontSize:12,color:"#b8d4bc",textAlign:"center",fontStyle:"italic",marginBottom:6}}>
                  {L
                    ?"Allahumma ajirni fi musibati wa akhlif li khayran minha"
                    :"Allahumma ajirni fi musibati wa akhlif li khayran minha"}
                </div>
                <div style={{fontSize:12,color:"#00ff88",textAlign:"center"}}>
                  {L
                    ?"'O Allah, reward me for my affliction and replace it with something better.'"
                    :"« Ô Allah, récompense-moi pour mon épreuve et remplace-la par quelque chose de meilleur. »"}
                </div>
              </div>
            </div>

            {/* Soins du corps */}
            <div style={{background:CARD,border:`1px solid ${PINK}22`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,letterSpacing:.8,marginBottom:14}}>
                💊 {L?"CARING FOR YOUR BODY":"PRENDRE SOIN DE TON CORPS"}
              </div>
              {[
                {emoji:"🛌",titre:L?"Rest":"Repos",desc:L?"Your body needs 2-6 weeks to heal physically. Be gentle with yourself.":"Ton corps a besoin de 2 à 6 semaines pour guérir physiquement. Sois douce avec toi-même."},
                {emoji:"💧",titre:L?"Hydration":"Hydratation",desc:L?"Drink plenty of water. Your hormones are fluctuating significantly.":"Bois beaucoup d'eau. Tes hormones fluctuent considérablement."},
                {emoji:"🍽️",titre:L?"Nourishment":"Alimentation",desc:L?"Eat iron-rich foods (lentils, red meat, spinach) to recover from blood loss.":"Mange des aliments riches en fer (lentilles, viande rouge, épinards) pour récupérer."},
                {emoji:"🚶",titre:L?"Gentle movement":"Mouvement doux",desc:L?"Light walks when you feel ready. No pressure, no timeline.":"Des marches légères quand tu te sens prête. Pas de pression, pas de délai."},
                {emoji:"🌙",titre:L?"Your cycle":"Ton cycle",desc:L?"Your menstrual cycle will return in 4-6 weeks on average. It may be irregular at first.":"Ton cycle menstruel reprendra en 4 à 6 semaines en moyenne. Il peut être irrégulier au début."},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:i<4?12:0,paddingBottom:i<4?12:0,borderBottom:i<4?`1px solid ${BDR}`:"none"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:PINK,marginBottom:3}}>{item.titre}</div>
                    <div style={{fontSize:12,color:"#d4b8d4",lineHeight:1.5}}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ressources Québec */}
            <div style={{background:CARD,border:`1px solid ${PINK}22`,borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:PINK,fontWeight:700,letterSpacing:.8,marginBottom:12}}>
                📞 {L?"SUPPORT RESOURCES (QUÉBEC)":"RESSOURCES DE SOUTIEN (QUÉBEC)"}
              </div>
              {[
                {nom:"Ligne provinciale de crise",tel:"1-866-APPELLE (277-3553)",desc:L?"Available 24/7, free":"Disponible 24h/7, gratuit"},
                {nom:"Centre de ressources périnatales",tel:"perinat.ca",desc:L?"Support for perinatal loss":"Soutien pour le deuil périnatal"},
                {nom:"Pleurs de parents",tel:"pleursdeparents.ca",desc:L?"Support group for perinatal grief":"Groupe de soutien deuil périnatal"},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?`1px solid ${BDR}`:"none"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#edf5ef"}}>{r.nom}</div>
                  <div style={{fontSize:12,color:PINK,fontWeight:600,marginTop:2}}>{r.tel}</div>
                  <div style={{fontSize:11,color:"#d4b8d4",marginTop:2}}>{r.desc}</div>
                </div>
              ))}
            </div>

            {/* Message final */}
            <div style={{background:"linear-gradient(135deg,#1a0a1a,#0d0515)",border:`1px solid ${PINK}33`,borderRadius:18,padding:18,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>🌸</div>
              <div style={{fontSize:13,color:"#d4b8d4",fontStyle:"italic",lineHeight:1.8}}>
                {L
                  ?"'And He found you lost and guided you.' — Al-Duha 7. You will find your way through this, with time, with support, and with the mercy of Allah."
                  :"« Et Il t'a trouvé égaré et Il t'a guidé. » — Ad-Duha 7. Tu trouveras ton chemin à travers cela, avec le temps, avec du soutien, et avec la miséricorde d'Allah."}
              </div>
              <div style={{marginTop:14,fontSize:11,color:"#d4b8d499"}}>
                {L
                  ?"⚠️ This content is for emotional support only. Please consult a healthcare professional for medical advice."
                  :"⚠️ Ce contenu est à titre de soutien émotionnel uniquement. Consulte un professionnel de santé pour un avis médical."}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  if (screen === "phase") {
    const phase = PHASES_MATERNITE.find(p=>p.id===selectedPhase);
    const exs = exsByPhase(selectedPhase);
    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 20px 20px",background:`radial-gradient(ellipse at 50% 0%,${phase?.color}15 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
            <span style={{fontSize:32}}>{phase?.emoji}</span>
            <div>
              <div className="serif" style={{fontSize:24,fontWeight:700,color:phase?.color}}>{L?phase?.labelEn:phase?.label}</div>
              <div style={{color:MUT,fontSize:12}}>{L?phase?.weeksEn:phase?.weeks} · {exs.length} {L?"exercises":"exercices"}</div>
            </div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {exs.map((ex,i)=>(
              <button key={i} onClick={()=>{setSelectedEx(ex);setScreen("exercice");}}
                style={{background:done[ex.id]?`${phase?.color}08`:CARD,border:`1.5px solid ${done[ex.id]?phase?.color+"44":BDR}`,borderRadius:16,padding:"12px 10px",cursor:"pointer",textAlign:"center",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>
                {done[ex.id]&&<div style={{position:"absolute",top:6,right:6,fontSize:12}}>✅</div>}
                <div style={{width:"100%",paddingBottom:"80%",position:"relative",marginBottom:8,borderRadius:10,overflow:"hidden",background:"#f3f3f3"}}>
                  <img src={imgErr[ex.id]?"":ex.img} alt={ex.nom} onError={()=>setImgErr(p=>({...p,[ex.id]:true}))}
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain"}}/>
                </div>
                <div style={{fontWeight:700,fontSize:11,color:done[ex.id]?phase?.color:"#edf5ef",lineHeight:1.3}}>{L?ex.nomEn:ex.nom}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{ex.muscles.split("·")[0].trim()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "exercice" && selectedEx) {
    const ex = selectedEx;
    const phaseColor = PHASES_MATERNITE.find(p=>MATERNITE_EXERCISES[p.id]?.find(e=>e.id===ex.id))?.color || PINK;
    return(
      <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto",background:"#060d08"}}>
        <div style={{padding:"52px 20px 20px",background:`radial-gradient(ellipse at 50% 0%,${phaseColor}15 0%,#060d08 65%)`}}>
          <button onClick={()=>setScreen("phase")} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:16,display:"block"}}>← {L?"Back":"Retour"}</button>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:"#edf5ef",marginBottom:4}}>{L?ex.nomEn:ex.nom}</div>
          <div style={{color:MUT,fontSize:13}}>{ex.muscles}</div>
        </div>
        <div style={{padding:"0 20px"}}>
          <div style={{background:"#f3f3f3",borderRadius:20,overflow:"hidden",marginBottom:16,aspectRatio:"4/3",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {!imgErr[ex.id]
              ?<img src={ex.img} alt={ex.nom} onError={()=>setImgErr(p=>({...p,[ex.id]:true}))} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
              :<div style={{fontSize:60}}>🤰</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:L?"Sets":"Séries",val:ex.series,color:phaseColor},
              {label:L?"Reps":"Reps",val:ex.reps,color:"#60a5fa"},
              {label:L?"Rest":"Repos",val:`${ex.repos}s`,color:GOLD},
            ].map(({label,val,color},i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${color}33`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:18,color}}>{val}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{background:CARD,border:`1px solid ${phaseColor}22`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:phaseColor,fontWeight:700,marginBottom:6}}>💡 {L?"TECHNIQUE TIP":"CONSEIL"}</div>
            <div style={{fontSize:13,color:"#a0c8a8",lineHeight:1.7}}>{L?ex.conseilEn:ex.conseilFr}</div>
          </div>
          <div style={{background:"#2d0a1a",border:`1px solid ${PINK}22`,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
            <div style={{fontSize:11,color:PINK,lineHeight:1.6}}>⚠️ {L?"Stop if you feel pain, dizziness or discomfort. Consult your doctor.":"Arrête si tu ressens de la douleur, des vertiges ou un malaise. Consulte ton médecin."}</div>
          </div>
          <button onClick={()=>{ markDone(ex.id); setScreen("phase"); }}
            style={{width:"100%",background:done[ex.id]?`${EM}15`:`linear-gradient(135deg,#1a3300,#264d00)`,border:`1.5px solid ${EM}${done[ex.id]?"33":"66"}`,borderRadius:16,padding:"16px",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:EM,cursor:"pointer"}}>
            {done[ex.id]?(L?"✅ Completed":"✅ Complété !"):(L?"✅ Mark as done (+5 🪙)":"✅ Marquer comme fait (+5 🪙)")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── SCAN CORPS COMPLET ───
function ScanCorpsComplet({user, profile, onBack, onPaywall, t, lang}){
  const [step, setStep] = useState("intro"); // intro | photo_face | photo_profil | analyzing | result
  const [photoFace, setPhotoFace] = useState(null);
  const [photoProfil, setPhotoProfil] = useState(null);
  const [photoDos, setPhotoDos] = useState(null);
  const [previewFace, setPreviewFace] = useState(null);
  const [previewProfil, setPreviewProfil] = useState(null);
  const [previewDos, setPreviewDos] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRefFace = useRef(null);
  const fileRefProfil = useRef(null);
  const cameraRefFace = useRef(null);
  const cameraRefProfil = useRef(null);

  const isPremium = user?.plan === "premium" && !user?.isDemo;

  const toB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleCapture = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toB64(file);
    const url = URL.createObjectURL(file);
    if (type === "face") { setPhotoFace(b64); setPreviewFace(url); setStep("photo_profil"); }
    else if (type === "profil") { setPhotoProfil(b64); setPreviewProfil(url); }
    else { setPhotoDos(b64); setPreviewDos(url); }
  };

  const analyzeBody = async () => {
    if (!photoFace || !photoProfil || !photoDos) return;
    setStep("analyzing");
    setLoading(true);
    try {
      const sexe = profile?.sexe || "homme";
      const poids = profile?.poids || "?";
      const age = profile?.age || "?";
      const prompt = `Tu es un expert en composition corporelle et morphologie. Analyse ces 3 photos (face + profil + dos) d'une personne (${sexe}, ${age} ans, ${poids}kg).

Réponds UNIQUEMENT en JSON valide avec exactement cette structure:
{
  "score_global": 72,
  "morphologie": "Mésomorphe",
  "description_morpho": "Corps athlétique avec bonne structure musculaire naturelle",
  "zones": [
    {"nom": "Ventre", "niveau": "Modéré", "pourcent": 28, "conseil": "Zone prioritaire à travailler"},
    {"nom": "Poitrine", "niveau": "Faible", "pourcent": 15, "conseil": "Bonne composition"},
    {"nom": "Bras", "niveau": "Faible", "pourcent": 12, "conseil": "Musculature visible"},
    {"nom": "Jambes", "niveau": "Modéré", "pourcent": 22, "conseil": "Travail cardio recommandé"},
    {"nom": "Dos", "niveau": "Faible", "pourcent": 14, "conseil": "Bonne posture"},
    {"nom": "Trapèzes", "niveau": "Faible", "pourcent": 10, "conseil": "Bonne musculation dorsale"}
  ],
  "masse_grasse_estimee": "18-22%",
  "masse_musculaire": "Moyenne-haute",
  "posture": "Légère antéversion du bassin détectée",
  "objectif_recommande": "Perte de gras localisée + maintien musculaire",
  "plan_action": ["Cardio HIIT 3x/semaine", "Alimentation déficit calorique modéré", "Musculation pour maintenir la masse"],
  "point_fort": "Bonne structure osseuse et musculaire de base",
  "point_ameliorer": "Réduire le gras abdominal en priorité"
}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoFace } },
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoProfil } },
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoDos } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStep("result");

      // Sauvegarder dans Firestore
      if (user?.uid && !user?.isDemo) {
        await addDoc(collection(db, "body_scans"), {
          userId: user.uid,
          result: parsed,
          createdAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch(e) {
      console.error(e);
      setStep("photo_profil");
    }
    setLoading(false);
  };

  const niveauColor = (n) => n === "Élevé" ? "#ef4444" : n === "Modéré" ? "#f59e0b" : "#22c55e";

  // ─── PAYWALL CHECK ───
  if (!isPremium) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:"4rem",marginBottom:"16px"}}>🔒</div>
      <h2 style={{color:"#fff",fontSize:"1.4rem",marginBottom:"8px"}}>Scan Corps Complet</h2>
      <p style={{color:"#aaa",marginBottom:"24px",lineHeight:1.6}}>Analyse complète de ta morphologie, % de gras par zone et plan d'action personnalisé.</p>
      <button onClick={onPaywall} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:"14px",padding:"14px 32px",fontSize:"1rem",fontWeight:700,cursor:"pointer"}}>Passer Premium</button>
      <button onClick={onBack} style={{marginTop:"12px",background:"transparent",color:"#aaa",border:"none",fontSize:"0.9rem",cursor:"pointer"}}>← Retour</button>
    </div>
  );

  // ─── INTRO ───
  if (step === "intro") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",padding:"24px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#aaa",fontSize:"0.9rem",cursor:"pointer",alignSelf:"flex-start",marginBottom:"24px"}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{fontSize:"3.5rem",marginBottom:"12px"}}>🏋️</div>
        <h1 style={{color:"#fff",fontSize:"1.6rem",fontWeight:800,marginBottom:"8px"}}>Scan Corps Complet</h1>
        <p style={{color:"#aaa",fontSize:"0.95rem",lineHeight:1.6}}>Analyse IA de ta morphologie, % gras par zone et plan personnalisé</p>
      </div>
      <div style={{background:"#111",borderRadius:"16px",padding:"20px",marginBottom:"24px"}}>
        <h3 style={{color:"#22c55e",marginBottom:"16px",fontSize:"1rem"}}>📋 Ce que l'IA va analyser :</h3>
        {[["🔬","Morphologie (ecto/méso/endomorphe)"],["📊","% gras estimé par zone"],["💪","Masse musculaire visible"],["🦴","Posture et alignement"],["🎯","Plan d'action personnalisé"]].map(([ic,tx])=>(
          <div key={tx} style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"12px"}}>
            <span style={{fontSize:"1.2rem"}}>{ic}</span>
            <span style={{color:"#ccc",fontSize:"0.9rem"}}>{tx}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#1a1a0a",border:"1px solid #f59e0b44",borderRadius:"12px",padding:"16px",marginBottom:"24px"}}>
        <p style={{color:"#f59e0b",fontSize:"0.85rem",margin:0}}>💡 <strong>Conseils photo :</strong> Tiens-toi droit, porte des vêtements ajustés, bonne lumière, fond neutre. 3 photos : face, profil gauche et dos.</p>
      </div>
      <button onClick={()=>setStep("photo_face")} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:"14px",padding:"16px",fontSize:"1rem",fontWeight:700,cursor:"pointer",marginTop:"auto"}}>
        📸 Commencer le scan
      </button>
    </div>
  );

  // ─── PHOTO FACE ───
  if (step === "photo_face") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",padding:"24px",display:"flex",flexDirection:"column"}}>
      <button onClick={()=>setStep("intro")} style={{background:"transparent",border:"none",color:"#aaa",fontSize:"0.9rem",cursor:"pointer",alignSelf:"flex-start",marginBottom:"24px"}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{width:"60px",height:"6px",background:"#22c55e",borderRadius:"3px",margin:"0 auto 20px"}}>
          <div style={{width:"50%",height:"100%",background:"#22c55e",borderRadius:"3px"}}/>
        </div>
        <h2 style={{color:"#fff",fontSize:"1.4rem",marginBottom:"8px"}}>Photo 1/2 — Face</h2>
        <p style={{color:"#aaa",fontSize:"0.9rem"}}>Tiens-toi droit face à la caméra, bras légèrement écartés</p>
      </div>
      <div style={{background:"#111",borderRadius:"16px",padding:"40px 20px",textAlign:"center",marginBottom:"24px",border:"2px dashed #333",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {previewFace ? (
          <>
            <img src={previewFace} alt="face" style={{maxHeight:"300px",maxWidth:"100%",borderRadius:"12px",objectFit:"cover"}}/>
            <button onClick={()=>{setPreviewFace(null);setPhotoFace(null);}} style={{marginTop:"12px",background:"#333",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 16px",cursor:"pointer"}}>🔄 Reprendre</button>
          </>
        ) : (
          <>
            <div style={{fontSize:"5rem",marginBottom:"16px",opacity:0.3}}>🧍</div>
            <p style={{color:"#666",fontSize:"0.9rem"}}>Photo de face requise</p>
          </>
        )}
      </div>
      <input ref={fileRefFace} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleCapture(e,"face")}/>
      <input ref={cameraRefFace} type="file" accept="image/*" capture="user" style={{display:"none"}} onChange={e=>handleCapture(e,"face")}/>
      <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
        <button onClick={()=>cameraRefFace.current?.click()} style={{flex:1,background:"#22c55e",color:"#fff",border:"none",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>📷 Caméra</button>
        <button onClick={()=>fileRefFace.current?.click()} style={{flex:1,background:"#1a3a2a",color:"#22c55e",border:"1px solid #22c55e",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>🖼️ Galerie</button>
      </div>
      {previewFace && (
        <button onClick={()=>setStep("photo_profil")} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:"14px",padding:"14px",fontSize:"1rem",fontWeight:700,cursor:"pointer"}}>
          Suivant → Photo de profil
        </button>
      )}
    </div>
  );

  // ─── PHOTO PROFIL ───
  if (step === "photo_profil") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",padding:"24px",display:"flex",flexDirection:"column"}}>
      <button onClick={()=>setStep("photo_face")} style={{background:"transparent",border:"none",color:"#aaa",fontSize:"0.9rem",cursor:"pointer",alignSelf:"flex-start",marginBottom:"24px"}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{width:"60px",height:"6px",background:"#333",borderRadius:"3px",margin:"0 auto 20px",position:"relative"}}>
          <div style={{width:"100%",height:"100%",background:"#22c55e",borderRadius:"3px"}}/>
        </div>
        <h2 style={{color:"#fff",fontSize:"1.4rem",marginBottom:"8px"}}>Photo 2/3 — Profil</h2>
        <p style={{color:"#aaa",fontSize:"0.9rem"}}>Tourne-toi de côté (profil gauche), tiens-toi droit</p>
      </div>
      <div style={{background:"#111",borderRadius:"16px",padding:"40px 20px",textAlign:"center",marginBottom:"24px",border:"2px dashed #333",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {previewProfil ? (
          <>
            <img src={previewProfil} alt="profil" style={{maxHeight:"300px",maxWidth:"100%",borderRadius:"12px",objectFit:"cover"}}/>
            <button onClick={()=>{setPreviewProfil(null);setPhotoProfil(null);}} style={{marginTop:"12px",background:"#333",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 16px",cursor:"pointer"}}>🔄 Reprendre</button>
          </>
        ) : (
          <>
            <div style={{fontSize:"5rem",marginBottom:"16px",opacity:0.3}}>🚶</div>
            <p style={{color:"#666",fontSize:"0.9rem"}}>Photo de profil requise</p>
          </>
        )}
      </div>
      <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleCapture(e,"profil")}/>
      <input ref={cameraRefProfil} type="file" accept="image/*" capture="user" style={{display:"none"}} onChange={e=>handleCapture(e,"profil")}/>
      <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
        <button onClick={()=>cameraRefProfil.current?.click()} style={{flex:1,background:"#22c55e",color:"#fff",border:"none",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>📷 Caméra</button>
        <button onClick={()=>fileRefProfil.current?.click()} style={{flex:1,background:"#1a3a2a",color:"#22c55e",border:"1px solid #22c55e",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>🖼️ Galerie</button>
      </div>
      {previewProfil && (
        <button onClick={()=>setStep("photo_dos")} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:"14px",padding:"14px",fontSize:"1rem",fontWeight:700,cursor:"pointer"}}>
          Suivant → Photo de dos
        </button>
      )}
    </div>
  );

  // ─── PHOTO DOS ───
  if (step === "photo_dos") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",padding:"24px",display:"flex",flexDirection:"column"}}>
      <button onClick={()=>setStep("photo_profil")} style={{background:"transparent",border:"none",color:"#aaa",fontSize:"0.9rem",cursor:"pointer",alignSelf:"flex-start",marginBottom:"24px"}}>← Retour</button>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{width:"60px",height:"6px",background:"#333",borderRadius:"3px",margin:"0 auto 20px",position:"relative"}}>
          <div style={{width:"100%",height:"100%",background:"#22c55e",borderRadius:"3px"}}/>
        </div>
        <h2 style={{color:"#fff",fontSize:"1.4rem",marginBottom:"8px"}}>Photo 3/3 — Dos</h2>
        <p style={{color:"#aaa",fontSize:"0.9rem"}}>Tourne-toi complètement, dos face à la caméra, bras légèrement écartés</p>
      </div>
      <div style={{background:"#111",borderRadius:"16px",padding:"40px 20px",textAlign:"center",marginBottom:"24px",border:"2px dashed #333",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {previewDos ? (
          <>
            <img src={previewDos} alt="dos" style={{maxHeight:"300px",maxWidth:"100%",borderRadius:"12px",objectFit:"cover"}}/>
            <button onClick={()=>{setPreviewDos(null);setPhotoDos(null);}} style={{marginTop:"12px",background:"#333",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 16px",cursor:"pointer"}}>🔄 Reprendre</button>
          </>
        ) : (
          <>
            <div style={{fontSize:"5rem",marginBottom:"16px",opacity:0.3}}>🚶</div>
            <p style={{color:"#666",fontSize:"0.9rem"}}>Photo de dos requise</p>
          </>
        )}
      </div>
      <input type="file" accept="image/*" style={{display:"none"}} id="dos-gallery" onChange={e=>handleCapture(e,"dos")}/>
      <input type="file" accept="image/*" capture="user" style={{display:"none"}} id="dos-camera" onChange={e=>handleCapture(e,"dos")}/>
      <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
        <button onClick={()=>document.getElementById("dos-camera").click()} style={{flex:1,background:"#22c55e",color:"#fff",border:"none",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>📷 Caméra</button>
        <button onClick={()=>document.getElementById("dos-gallery").click()} style={{flex:1,background:"#1a3a2a",color:"#22c55e",border:"1px solid #22c55e",borderRadius:"12px",padding:"14px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>🖼️ Galerie</button>
      </div>
      {previewDos && (
        <button onClick={analyzeBody} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:"14px",padding:"14px",fontSize:"1rem",fontWeight:700,cursor:"pointer"}}>
          🔬 Analyser mon corps
        </button>
      )}
    </div>
  );

  // ─── ANALYZING ───
  if (step === "analyzing") return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:"4rem",marginBottom:"24px",animation:"pulse 1.5s infinite"}}>🔬</div>
      <h2 style={{color:"#fff",fontSize:"1.4rem",marginBottom:"12px"}}>Analyse en cours...</h2>
      <p style={{color:"#aaa",fontSize:"0.9rem",lineHeight:1.6,maxWidth:"280px"}}>L'IA analyse ta morphologie, composition corporelle et zones prioritaires</p>
      <div style={{marginTop:"32px",display:"flex",gap:"8px"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#22c55e",animation:`bounce 1s ${i*0.2}s infinite`}}/>
        ))}
      </div>
    </div>
  );

  // ─── RESULT ───
  if (step === "result" && result) return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",padding:"24px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#aaa",fontSize:"0.9rem",cursor:"pointer",marginBottom:"20px"}}>← Retour</button>

      {/* Score global */}
      <div style={{background:"linear-gradient(135deg,#0d2d1a,#1a3a2a)",border:"1px solid #22c55e44",borderRadius:"20px",padding:"24px",textAlign:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"0.85rem",color:"#22c55e",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>Score corporel global</div>
        <div style={{fontSize:"4rem",fontWeight:900,color:"#22c55e",marginBottom:"4px"}}>{result.score_global}</div>
        <div style={{fontSize:"0.8rem",color:"#aaa"}}>/100</div>
        <div style={{marginTop:"12px",background:"#0a2a14",borderRadius:"10px",height:"8px",overflow:"hidden"}}>
          <div style={{width:`${result.score_global}%`,height:"100%",background:"linear-gradient(90deg,#22c55e,#86efac)",borderRadius:"10px",transition:"width 1s"}}/>
        </div>
        <div style={{marginTop:"16px",background:"#ffffff11",borderRadius:"12px",padding:"12px"}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:"1.1rem"}}>{result.morphologie}</div>
          <div style={{color:"#aaa",fontSize:"0.85rem",marginTop:"4px"}}>{result.description_morpho}</div>
        </div>
      </div>

      {/* Zones de gras */}
      <div style={{background:"#111",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
        <h3 style={{color:"#fff",marginBottom:"16px",fontSize:"1rem"}}>📊 Répartition du gras par zone</h3>
        {result.zones?.map(z=>(
          <div key={z.nom} style={{marginBottom:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
              <span style={{color:"#ccc",fontSize:"0.9rem"}}>{z.nom}</span>
              <span style={{color:niveauColor(z.niveau),fontSize:"0.85rem",fontWeight:600}}>{z.niveau} — {z.pourcent}%</span>
            </div>
            <div style={{background:"#222",borderRadius:"6px",height:"8px",overflow:"hidden"}}>
              <div style={{width:`${z.pourcent}%`,height:"100%",background:niveauColor(z.niveau),borderRadius:"6px",transition:"width 1s"}}/>
            </div>
            <div style={{color:"#666",fontSize:"0.8rem",marginTop:"4px"}}>{z.conseil}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div style={{background:"#111",borderRadius:"14px",padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"4px"}}>🎯</div>
          <div style={{color:"#aaa",fontSize:"0.75rem"}}>Masse grasse estimée</div>
          <div style={{color:"#fff",fontWeight:700,marginTop:"4px"}}>{result.masse_grasse_estimee}</div>
        </div>
        <div style={{background:"#111",borderRadius:"14px",padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:"1.5rem",marginBottom:"4px"}}>💪</div>
          <div style={{color:"#aaa",fontSize:"0.75rem"}}>Masse musculaire</div>
          <div style={{color:"#fff",fontWeight:700,marginTop:"4px"}}>{result.masse_musculaire}</div>
        </div>
      </div>

      {/* Posture */}
      <div style={{background:"#111",borderRadius:"14px",padding:"16px",marginBottom:"16px"}}>
        <div style={{color:"#f59e0b",fontSize:"0.85rem",marginBottom:"4px"}}>🦴 Posture</div>
        <div style={{color:"#ccc",fontSize:"0.9rem"}}>{result.posture}</div>
      </div>

      {/* Points fort/faible */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
        <div style={{background:"#0d2d1a",border:"1px solid #22c55e33",borderRadius:"14px",padding:"14px"}}>
          <div style={{color:"#22c55e",fontSize:"0.8rem",marginBottom:"6px"}}>✅ Point fort</div>
          <div style={{color:"#ccc",fontSize:"0.85rem"}}>{result.point_fort}</div>
        </div>
        <div style={{background:"#2d1a0d",border:"1px solid #f59e0b33",borderRadius:"14px",padding:"14px"}}>
          <div style={{color:"#f59e0b",fontSize:"0.8rem",marginBottom:"6px"}}>🎯 À améliorer</div>
          <div style={{color:"#ccc",fontSize:"0.85rem"}}>{result.point_ameliorer}</div>
        </div>
      </div>

      {/* Plan d'action */}
      <div style={{background:"#111",borderRadius:"16px",padding:"20px",marginBottom:"24px"}}>
        <h3 style={{color:"#fff",marginBottom:"14px",fontSize:"1rem"}}>🚀 Plan d'action recommandé</h3>
        <p style={{color:"#22c55e",fontSize:"0.9rem",marginBottom:"12px"}}>{result.objectif_recommande}</p>
        {result.plan_action?.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"10px"}}>
            <div style={{minWidth:"24px",height:"24px",borderRadius:"50%",background:"#22c55e",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700}}>{i+1}</div>
            <span style={{color:"#ccc",fontSize:"0.9rem",lineHeight:1.5}}>{p}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>setStep("intro")} style={{width:"100%",background:"#1a3a2a",color:"#22c55e",border:"1px solid #22c55e",borderRadius:"14px",padding:"14px",fontSize:"1rem",fontWeight:600,cursor:"pointer",marginBottom:"12px"}}>
        🔄 Nouveau scan
      </button>
      <button onClick={onBack} style={{width:"100%",background:"transparent",color:"#aaa",border:"none",borderRadius:"14px",padding:"12px",fontSize:"0.9rem",cursor:"pointer"}}>
        ← Retour au tableau de bord
      </button>
    </div>
  );

  return null;
}

// ─── GLOBAL PEDOMETER — tourne indépendamment du screen ───
// Le listener devicemotion est attaché au niveau de l'app entière
// Pas de composant React — stockage direct localStorage
const GlobalPedometer = (() => {
  const STORAGE_KEY = "vs_pedometer_v3";
  const getTodayKey = () => new Date().toISOString().slice(0,10);

  let pasRef       = 0;
  let isRunning    = false;
  let lastStepTime = 0;
  let lastMag      = 0;
  let ascending    = true;
  let localMin     = 9.8;
  let localMax     = 9.8;
  let accBuffer    = [];
  let lpFilter     = { x:0, y:0, z:0, init:false };
  let listeners    = [];  // callbacks UI

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const today = d[getTodayKey()] || { pas:0, km:0, cal:0 };
      pasRef = today.pas;
      return today;
    } catch { pasRef = 0; return { pas:0, km:0, cal:0 }; }
  };

  const save = (pas) => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const km  = Math.round(pas * 0.00075 * 100) / 100;
      const cal = Math.round(pas * 0.04 * 10) / 10;
      d[getTodayKey()] = { pas, km, cal };
      const keys = Object.keys(d).sort().reverse().slice(0, 30);
      const clean = {};
      keys.forEach(k => { clean[k] = d[k]; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      listeners.forEach(cb => cb({ pas, km, cal }));
    } catch {}
  };

  const filterAcc = (x, y, z) => {
    const alpha = 0.6;
    if (!lpFilter.init) {
      lpFilter = { x, y, z, init:true };
    } else {
      lpFilter.x = alpha * lpFilter.x + (1-alpha) * x;
      lpFilter.y = alpha * lpFilter.y + (1-alpha) * y;
      lpFilter.z = alpha * lpFilter.z + (1-alpha) * z;
    }
    return lpFilter;
  };

  const handleMotion = (e) => {
    if (!isRunning) return;
    const acc = e.acceleration?.x != null ? e.acceleration : e.accelerationIncludingGravity;
    if (!acc || (acc.x == null && acc.y == null && acc.z == null)) return;
    const filtered  = filterAcc(acc.x||0, acc.y||0, acc.z||0);
    const magnitude = Math.sqrt(filtered.x**2 + filtered.y**2 + filtered.z**2);
    const now = Date.now();

    accBuffer.push({ t:now, m:magnitude });
    if (accBuffer.length > 50) accBuffer = accBuffer.slice(-40);
    const recent = accBuffer.slice(-10);
    if (recent.length < 4) { lastMag = magnitude; return; }

    localMin = Math.min(...recent.map(v=>v.m));
    localMax = Math.max(...recent.map(v=>v.m));
    const range     = localMax - localMin;
    const threshold = localMin + range * 0.65;
    const prevMag   = lastMag;
    const wasAsc    = ascending;
    // Détecter choc brusque (poser/prendre le tel) vs vrai pas
    const isDrop = accBuffer.length >= 3 &&
      Math.abs(accBuffer[accBuffer.length-1].m - accBuffer[accBuffer.length-3].m) > 8;

    if (magnitude > prevMag) {
      ascending = true;
    } else if (magnitude < prevMag && wasAsc) {
      ascending = false;
      const timeSinceLast = now - lastStepTime;
      if (prevMag > threshold && range > 2.5 && !isDrop && (lastStepTime === 0 || timeSinceLast > 400)) {
        lastStepTime = now;
        pasRef += 1;
        save(pasRef);
        if (typeof NativeHaptics !== "undefined" && window?.Capacitor?.isNativePlatform?.()) NativeHaptics.repCount();
      }
    }
    lastMag = magnitude;
  };

  const start = async (auto=false) => {
    if (isRunning) return true;
    load();

    // ── Essayer le sensor natif Capacitor d'abord ──
    if (window?.Capacitor?.isNativePlatform?.()) {
      try {
        const { Motion } = await import("@capacitor/motion");
        accBuffer = []; lastStepTime = 0; lastMag = 0;
        ascending = true; localMin = 9.8; localMax = 9.8;
        lpFilter  = { x:0, y:0, z:0, init:false };

        // @capacitor/motion donne accès au sensor natif Android
        // Fréquence 60Hz vs ~30Hz pour devicemotion web — beaucoup plus précis
        const listener = await Motion.addListener("accel", (event) => {
          const acc = event.acceleration || event.accelerationIncludingGravity;
          if (acc) handleMotion({ acceleration: acc, accelerationIncludingGravity: acc });
        });

        // Stocker le listener pour pouvoir l'arrêter
        window._capacitorMotionListener = listener;
        isRunning = true;

        // Sauvegarder régulièrement
        window._pedoSaveInterval = setInterval(() => save(pasRef), 10000);

        // Reprendre après arrière-plan
        document.addEventListener("visibilitychange", async () => {
          if (document.visibilityState === "visible" && isRunning) {
            try {
              if (window._capacitorMotionListener) {
                await window._capacitorMotionListener.remove();
              }
              const newListener = await Motion.addListener("accel", (event) => {
                const acc = event.acceleration || event.accelerationIncludingGravity;
                if (acc) handleMotion({ acceleration: acc, accelerationIncludingGravity: acc });
              });
              window._capacitorMotionListener = newListener;
            } catch {}
          }
        });

        window.addEventListener("beforeunload", () => save(pasRef));
        window.addEventListener("pagehide", () => save(pasRef));
        return true;
      } catch (e) {
        console.log("Capacitor Motion non disponible, fallback web:", e);
      }
    }

    // ── Fallback web standard ──
    if (typeof DeviceMotionEvent === "undefined") return false;
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      if (auto) return false;
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== "granted") return false;
      } catch { return false; }
    }
    accBuffer = []; lastStepTime = 0; lastMag = 0;
    ascending = true; localMin = 9.8; localMax = 9.8;
    lpFilter  = { x:0, y:0, z:0, init:false };
    window.addEventListener("devicemotion", handleMotion, { passive:true });
    isRunning = true;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && isRunning) {
        window.removeEventListener("devicemotion", handleMotion);
        window.addEventListener("devicemotion", handleMotion, { passive:true });
      }
    });
    window.addEventListener("beforeunload", () => save(pasRef));
    window.addEventListener("pagehide",     () => save(pasRef));
    return true;
  };

  const stop = () => {
    isRunning = false;
    window.removeEventListener("devicemotion", handleMotion);
    // Arrêter le listener Capacitor si actif
    if (window._capacitorMotionListener) {
      try { window._capacitorMotionListener.remove(); } catch {}
      window._capacitorMotionListener = null;
    }
    if (window._pedoSaveInterval) {
      clearInterval(window._pedoSaveInterval);
      window._pedoSaveInterval = null;
    }
    save(pasRef);
  };

  const reset = () => {
    pasRef = 0;
    save(0);
    accBuffer = []; lastStepTime = 0; lastMag = 0;
  };

  const subscribe  = (cb) => { listeners.push(cb); return () => { listeners = listeners.filter(l => l !== cb); }; };
  const getState   = () => load();
  const getRunning = () => isRunning;
  const getHistory = () => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.entries(d).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,14);
    } catch { return []; }
  };

  // Pedometre desactive — remplace par le module Richesse Spirituelle
  // (plus besoin du capteur de mouvement en arriere-plan)

  return { start, stop, reset, subscribe, getState, getRunning, getHistory };
})();

// ─── MAIN APP ───
export default function VitaScann() {
  const [lang,setLang] = useState(()=>localStorage.getItem("vs_lang")||"fr");
  const t = (key) => T[lang]?.[key] || T["fr"]?.[key] || key;

  const [screen,setScreen]=useState("splash");
  const [user,setUser]=useState(null);
  const [zone,setZone]=useState(null);
  const [b64,setB64]=useState(null);
  const [prev,setPrev]=useState(null);
  const [result,setResult]=useState(null);
  const [mealResult,setMealResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [profile,setProfile]=useState(null);
  const [family,setFamily]=useState([]);
  const [demoUsed,setDemoUsed]=useState(false);
  const [isMeal,setIsMeal]=useState(false);
  const [vitaCoins,setVitaCoins]=useState(0);
  const [coinsHistory,setCoinsHistory]=useState([]);
  const [coinsToast,setCoinsToast]=useState(null);
  const [showWallet,setShowWallet]=useState(false);

  const addCoins = useCallback(async (amount, reason) => {
    if(!user?.uid||user?.isDemo) return;
    const newBal = await CoinsService.add(user.uid, amount, reason);
    setVitaCoins(newBal);
    setCoinsToast(amount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user?.uid, user?.isDemo]);

  // Init notifications au démarrage + check referral
  useEffect(()=>{
    NotifService.init();
    initCapacitor(); // Init Capacitor si natif
    if (isNative()) NativePush.init((notif) => console.log("Push reçue:", notif));
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if(ref) localStorage.setItem("vs_pending_ref", ref);
  },[]);

  // Fix bouton back Android PWA
  useEffect(()=>{
    const handleBack=(e)=>{
      e.preventDefault();
      if(screen==="dashboard")return;
      if(screen==="result"||screen==="meal_result")setScreen("dashboard");
      else if(screen==="zones"||screen==="meal_capture")setScreen("dashboard");
      else if(screen==="capture")setScreen("zones");
      else if(screen==="preview")setScreen("capture");
      else if(screen==="meal_preview")setScreen("meal_capture");
      else if(screen==="paywall"||screen==="progress"||screen==="mealplan"||screen==="family"||screen==="challenge"||screen==="pedometer"||screen==="exercises"||screen==="referral"||screen==="gym_coach"||screen==="cali_coach"||screen==="longevite"||screen==="solo_leveling"||screen==="scanner_futur"||screen==="score_dopamine")setScreen("dashboard");
      else if(screen==="profile")setScreen("dashboard");
      else if(screen==="analyzing")return;
      else setScreen("dashboard");
    };
    window.addEventListener("popstate",handleBack);
    window.history.pushState(null,"",window.location.href);
    return()=>window.removeEventListener("popstate",handleBack);
  },[screen]);

  // Stripe retour
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("premium")==="success"){
      const uid=params.get("uid");
      if(uid){setDoc(doc(db,"users",uid),{plan:"premium"},{merge:true});setUser(u=>u?{...u,plan:"premium"}:u);}
      window.history.replaceState({},"",window.location.pathname);
    }
  },[]);

  // Auth
  useEffect(()=>{
    const unsub=AuthService.onAuthChange(async firebaseUser=>{
      if(firebaseUser){
        const userDoc=await getDoc(doc(db,"users",firebaseUser.uid));
        const userData=userDoc.exists()?userDoc.data():{};
        const u={uid:firebaseUser.uid,name:firebaseUser.displayName||userData.name||"Utilisateur",email:firebaseUser.email,plan:userData.plan||"free"};
        setUser(u);
        if(userData.profile)setProfile(userData.profile);
        if(userData.family)setFamily(userData.family);
        setVitaCoins(userData.vitaCoins||0);
        setCoinsHistory(userData.coinsHistory||[]);
        const h=await ScanService.getHistory(firebaseUser.uid);
        setHistory(h);
        // Process pending referral
        const pendingRef = localStorage.getItem("vs_pending_ref");
        if(pendingRef && !userData.referredBy){
          await CoinsService.processReferral(firebaseUser.uid, pendingRef);
          localStorage.removeItem("vs_pending_ref");
          const updated = await getDoc(doc(db,"users",firebaseUser.uid));
          setVitaCoins(updated.data()?.vitaCoins||0);
        }
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
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:BODY_PROMPT,messages:[{role:"user",content:[
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
        NotifService.scheduleLocalReminder(user.uid);
        await addCoins(10, `Scan ${zone?.label}`);
      }
      if(user?.isDemo)setDemoUsed(true);
      // ─── FCM — Marquer user actif après scan ───
      if(user?.uid&&!user?.isDemo){updateLastActive(db,user.uid).catch(()=>{});}
      setScreen("result");
    } catch(e){console.error(e);setScreen("capture");}
  },[b64,zone,user,profile,addCoins]);

  const analyzeMeal=useCallback(async()=>{
    const isPrem = user?.plan==="premium"||user?.isDemo;
    if(!isPrem) incrementUsage("scan_repas");
    setScreen("analyzing");
    setIsMeal(true);
    try {
      const pc=profile?`Profil : ${profile.age||"?"}ans, ${profile.sexe||"?"}, objectif: ${profile.objectif||"?"}, halal: ${profile.halal?"oui":"non"}.`:"";
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:MEAL_PROMPT,messages:[{role:"user",content:[
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
    // ─── FCM — Init notifications push ───
    if(u.uid&&!u.isDemo){
      initFCM(firebaseApp,db,u.uid).catch(console.error);
      listenForegroundNotifs(firebaseApp,(payload)=>{
        console.log("Notif reçue:",payload.notification?.title);
      });
      setDoc(doc(db,"users",u.uid),{lang:"fr"},{merge:true}).catch(()=>{});
    }
    setScreen("profile");
  };

  const handleLogout=async()=>{
    await AuthService.logout();
    setUser(null);setHistory([]);setProfile(null);setFamily([]);
    setVitaCoins(0);setCoinsHistory([]);
    setScreen("login");
  };

  const handleDemo=()=>{
    if(demoUsed){setScreen("register");return;}
    setUser({uid:"demo",name:"Visiteur",email:"",plan:"free",isDemo:true});
    setHistory([]);setIsMeal(false);
    setScreen("zones");
  };

  const handleScan=()=>{
    if(user?.isDemo&&demoUsed){setScreen("register");return;}
    if(user?.plan==="free"&&!user?.isDemo&&history.length>=3){setScreen("paywall");return;}
    setIsMeal(false);setScreen("zones");
  };

  const handleMealScan=()=>{
    const isPrem = user?.plan==="premium"||user?.isDemo;
    if(!isPrem && !canUseFeature("scan_repas", false)){
      setScreen("paywall"); return;
    }
    setIsMeal(true);setScreen("meal_capture");
  };

  const commonProps = {lang, setLang, t};

  return (
    <>
      <style>{G}</style>
      <div className="app" style={{overflowY:"auto"}}>
        <NotifBanner lang={lang} onDismiss={()=>{}} />
        {coinsToast&&<CoinsToast amount={coinsToast} onDone={()=>setCoinsToast(null)}/>}
        {showWallet&&user&&<VitaCoinsWallet user={user} vitaCoins={vitaCoins} coinsHistory={coinsHistory} onRedeem={()=>{}} t={t} lang={lang} onClose={()=>setShowWallet(false)}/>}
        {screen==="splash"       && <Splash onDone={()=>{const seen=localStorage.getItem("vs_onboarding");setScreen(seen?"login":"onboarding");}} lang={lang} setLang={setLang}/>}
        {screen==="onboarding"   && <Onboarding onDemo={handleDemo} onRegister={()=>{localStorage.setItem("vs_onboarding","1");setScreen("register");}} onLogin={()=>{localStorage.setItem("vs_onboarding","1");setScreen("login");}} {...commonProps}/>}
        {screen==="register"     && <Register onSuccess={handleAuthSuccess} onLogin={()=>setScreen("login")} t={t}/>}
        {screen==="login"        && <Login onSuccess={handleAuthSuccess} onRegister={()=>setScreen("register")} onForgot={()=>setScreen("forgot")} t={t}/>}
        {screen==="forgot"       && <ForgotPassword onBack={()=>setScreen("login")} t={t}/>}
        {screen==="profile"      && <ProfileSetup user={user} onSave={p=>{setProfile(p);setScreen("dashboard");}} onSkip={()=>setScreen("dashboard")} t={t}/>}
        {screen==="dashboard"    && user && <Dashboard user={user} onScan={handleScan} onMealScan={handleMealScan} onPaywall={()=>setScreen("paywall")} onLogout={handleLogout} onProfile={()=>setScreen("profile")} onFamily={()=>setScreen("family")} onChallenge={()=>setScreen("challenge")} onProgress={()=>user.plan==="premium"?setScreen("progress"):setScreen("paywall")} onMealPlan={()=>user.plan==="premium"?setScreen("mealplan"):setScreen("paywall")} onPedometer={()=>setScreen("pedometer")} onReferral={()=>setScreen("referral")} onWallet={()=>setShowWallet(true)} onGymCoach={()=>setScreen("gym_coach")} onCaliCoach={()=>setScreen("cali_coach")} onLongevite={()=>setScreen("longevite")} onScanCorps={()=>setScreen("scan_corps")} onSanteEmo={()=>setScreen("sante_emo")} onNutritionScan={()=>setScreen("nutrition_scan")} onScoreEnergie={()=>setScreen("score_energie")} onMindset={()=>setScreen("mindset_guerrier")} onRealite={()=>setScreen("realite_brutale")} onEnviron={()=>setScreen("scan_environnement")} onImmunite={()=>setScreen("score_immunite")} onMaternite={()=>setScreen("maternite")} onMotivation={()=>setScreen("motivation")} onScannerFutur={()=>setScreen("scanner_futur")} onScoreDopamine={()=>setScreen("score_dopamine")} onSoloLeveling={()=>setScreen("solo_leveling")} history={history} profile={profile} vitaCoins={vitaCoins} {...commonProps}/> }
        {screen==="zones"        && <ZonePick onSelect={z=>{setZone(z);setScreen("capture");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")} lang={lang} t={t} profile={profile}/>}
        {screen==="capture"      && zone && <Capture zone={zone} onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("preview");}} onBack={()=>setScreen("zones")} t={t}/>}
        {screen==="meal_capture" && <MealCapture onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("meal_preview");}} onResult={(r)=>{setMealResult(r);setScreen("meal_result");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")} t={t} lang={lang}/>}
        {screen==="preview"      && zone && <Preview zone={zone} preview={prev} onAnalyze={analyze} onRetake={()=>setScreen("capture")} isMeal={false} t={t}/>}
        {screen==="meal_preview" && <Preview zone={null} preview={prev} onAnalyze={analyzeMeal} onRetake={()=>setScreen("meal_capture")} isMeal={true} t={t}/>}
        {screen==="analyzing"    && <Analyzing zone={zone} isMeal={isMeal} t={t}/>}
        {screen==="result"       && result&&zone && <Result result={result} zone={zone} user={user} profile={profile} history={history} onNewScan={()=>setScreen("zones")} onHome={()=>setScreen("dashboard")} onExercises={()=>setScreen("exercises")} onGymCoach={()=>setScreen("gym_coach")} onCaliCoach={()=>setScreen("cali_coach")} lang={lang} t={t}/>}
        {screen==="meal_result"  && mealResult && <MealResult result={mealResult} onNewScan={()=>setScreen("meal_capture")} onHome={()=>setScreen("dashboard")} t={t} lang={lang}/>}
        {screen==="paywall"      && <Paywall user={user} onBack={()=>setScreen(user&&!user.isDemo?"dashboard":"onboarding")} onSuccess={()=>{setUser(u=>({...u,plan:"premium"}));setScreen("dashboard");}} t={t}/>}
        {screen==="progress"     && <Progress history={history} onBack={()=>setScreen("dashboard")} t={t} profile={profile} lang={lang}/>}
        {screen==="mealplan"     && <MealPlan profile={profile} onBack={()=>setScreen("dashboard")} user={user} t={t}/>}
        {screen==="family"       && <Family user={user} family={family} onSave={setFamily} onBack={()=>setScreen("dashboard")} onSwitchProfile={m=>{setUser(u=>({...u,name:m.name,isFamily:true}));setScreen("zones");}} t={t}/>}
        {screen==="challenge"    && <Challenge history={history} onBack={()=>setScreen("dashboard")} t={t}/>}
        {screen==="pedometer"    && <ModuleRichesse onBack={()=>setScreen("dashboard")} lang={lang} onCoinsEarned={amt=>addCoins(amt,"Richesse spirituelle")} user={user}/>}
        {screen==="exercises"    && <Exercises zone={zone} totalScans={history.length} user={user} onCoinsEarned={amt=>addCoins(amt,"Exercice complété")} t={t} lang={lang} onBack={()=>setScreen("result")}/>}
        {screen==="referral"     && <Referral user={user} vitaCoins={vitaCoins} t={t} lang={lang} onBack={()=>setScreen("dashboard")}/>}
        {screen==="gym_coach"    && user && <CoachCorpsComplet user={user} profile={profile} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Coach Corps Complet")} lang={lang} t={t}/>}
        {screen==="cali_coach"   && user && <CoachCorpsComplet user={user} profile={profile} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Coach Corps Complet")} lang={lang} t={t}/>}
        {screen==="longevite"    && <CoachCorpsComplet user={user} profile={profile} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Coach Corps Complet")} lang={lang} t={t}/>}
        {screen==="scan_corps"   && <ScanCorpsComplet user={user} profile={profile} onBack={()=>setScreen("dashboard")} onPaywall={()=>setScreen("paywall")} t={t} lang={lang}/>}
        {screen==="sante_emo"    && <SanteEmotionnelle user={user} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Check-in émotionnel")} lang={lang} t={t} profile={profile}/>}
        {screen==="nutrition_scan" && <NutritionLabelScan onBack={()=>setScreen("dashboard")} lang={lang}/>}
        {screen==="score_energie" && <ScoreEnergie user={user} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Score Énergie")} lang={lang} profile={profile}/>}
        {screen==="mindset_guerrier" && <MindsetGuerrier user={user} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Mindset Guerrier")} lang={lang} profile={profile}/>}
        {screen==="realite_brutale" && <RealiteBrutale onBack={()=>setScreen("dashboard")} lang={lang} user={user}/>}
        {screen==="scan_environnement" && <ScanEnvironnement onBack={()=>setScreen("dashboard")} lang={lang} user={user}/>}
        {screen==="score_immunite"    && <ScoreImmunite user={user} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Score Immunité")} lang={lang}/>}
        {screen==="maternite"         && (user?.plan==="premium"||user?.isDemo?<GrossesseModule user={user} onHome={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Maternité")} lang={lang}/>:<>{setScreen("paywall")}</>)}
        {screen==="motivation"        && <MotivationModule user={user} profile={profile} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Motivation")} lang={lang}/>}
        {screen==="solo_leveling"      && <SoloLevelingChallenge user={user} profile={profile} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Solo Leveling")} lang={lang}/>}
        {screen==="scanner_futur"      && <ScannerFutur user={user} profile={profile} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Scanner Futur")} lang={lang}/>}
        {screen==="score_dopamine"     && <ScoreDopamine user={user} profile={profile} onBack={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Score Dopamine")} lang={lang}/>}
      </div>
    </>
  );
}

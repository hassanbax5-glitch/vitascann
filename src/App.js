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
// ✅ Paywall 7,99$/mois honnête
// ✅ Fix bouton back Android PWA
// ✅ BILINGUE FR / EN — sélecteur de langue
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
    zones_free: "2 zones gratuites",
    zones_premium_locked: "9 zones Premium 🔒",
    zones_premium_zone: "Zone Premium",
    zones_premium_price: "✨ Premium · 7,99$/mois",
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
    meal_unlock: "👑 Débloquer le Scan Repas — 7,99$/mois",
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
    pw_per_month: "par mois · Annulez quand vous voulez",
    pw_discount: "✅ -47% tarif de lancement",
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
    steps_title: "🚶 Podomètre",
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
    zones_free: "2 free zones",
    zones_premium_locked: "9 Premium zones 🔒",
    zones_premium_zone: "Premium Zone",
    zones_premium_price: "✨ Premium · $7.99/month",
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
    meal_unlock: "👑 Unlock Meal Scan — $7.99/month",
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
    pw_per_month: "per month · Cancel anytime",
    pw_discount: "✅ -47% launch price",
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
    steps_title: "🚶 Pedometer",
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
    {id:"e19",name:"Respiration profonde",emoji:"🫁",duration:5,desc:"Respiration abdominale améliore l'oxygénation et la digestion.",coins:10},
    {id:"e20",name:"Marche digestive",emoji:"🚶",duration:15,desc:"Marche légère 30min après repas améliore l'absorption B12.",coins:15},
  ],
  scalp: [
    {id:"e21",name:"Massage cuir chevelu",emoji:"💆",duration:5,desc:"Massage avec huile de nigelle 5min chaque soir.",coins:15},
    {id:"e22",name:"Inversions yoga",emoji:"🧘",duration:10,desc:"Posture du chien tête en bas 3x2min pour la circulation.",coins:15},
  ],
};

// ─── PHASE 1 : VITACOINS WALLET ───
function VitaCoinsWallet({user, vitaCoins, coinsHistory, onRedeem, t, lang, onClose}) {
  const [tab, setTab] = useState("wallet");
  const [redeeming, setRedeeming] = useState(null);
  const [msg, setMsg] = useState("");

  const REWARDS = [
    {coins:100, label:t("coins_reward_100"), icon:"⭐", type:"week"},
    {coins:300, label:t("coins_reward_300"), icon:"👑", type:"month"},
    {coins:500, label:t("coins_reward_500"), icon:"🛒", type:"amazon"},
    {coins:1000, label:t("coins_reward_1000"), icon:"💸", type:"paypal"},
  ];

  const handleRedeem = async (reward) => {
    if(vitaCoins < reward.coins){ setMsg(t("coins_not_enough")); setTimeout(()=>setMsg(""),2500); return; }
    setRedeeming(reward.type);
    const ok = await CoinsService.spend(user.uid, reward.coins);
    if(ok){ setMsg(t("coins_redeemed")); onRedeem(reward); }
    setRedeeming(null);
    setTimeout(()=>setMsg(""),3000);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:"#0c1810",borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div className="serif" style={{fontSize:22,fontWeight:700,color:GOLD}}>🪙 VitaCoins</div>
            <div style={{color:MUT,fontSize:12}}>{t("coins_balance")}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="serif" style={{fontSize:36,fontWeight:700,color:GOLD}}>{vitaCoins}</div>
            <button onClick={onClose} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:12}}>✕ Fermer</button>
          </div>
        </div>

        {msg&&<div style={{background:`${EM}14`,border:`1px solid ${EM}33`,borderRadius:10,padding:"10px 14px",color:EM,fontSize:12,marginBottom:14,textAlign:"center"}}>{msg}</div>}

        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[["wallet","💰 Solde"],["redeem","🎁 Échanger"],["how","❓ Comment"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?`${GOLD}18`:"transparent",border:`1.5px solid ${tab===k?GOLD:BDR}`,borderRadius:10,padding:"8px 4px",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,color:tab===k?GOLD:MUT,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>

        {tab==="wallet"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,#1a1005,#0f0d06)",border:`1px solid ${GOLD}33`,borderRadius:16,padding:20,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:48}}>🪙</div>
              <div className="serif" style={{fontSize:52,fontWeight:700,color:GOLD,lineHeight:1}}>{vitaCoins}</div>
              <div style={{color:MUT,fontSize:12,marginTop:4}}>VitaCoins disponibles</div>
            </div>
            {coinsHistory?.length>0&&(
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{t("coins_history")}</div>
                {coinsHistory.slice(0,8).map((h,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<Math.min(7,coinsHistory.length-1)?`1px solid ${BDR}`:"none"}}>
                    <div style={{fontSize:12,color:"#a0bcaa"}}>{h.reason}</div>
                    <div style={{color:GOLD,fontWeight:700,fontSize:13}}>+{h.amount} 🪙</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="redeem"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {REWARDS.map(r=>(
              <div key={r.type} style={{background:CARD,border:`1px solid ${vitaCoins>=r.coins?GOLD+"33":BDR}`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:vitaCoins>=r.coins?1:.6}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:28}}>{r.icon}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{r.label}</div>
                    <div style={{color:GOLD,fontSize:11,fontWeight:700}}>{r.coins} 🪙 {t("coins_req")}</div>
                  </div>
                </div>
                <button onClick={()=>handleRedeem(r)} disabled={redeeming===r.type||vitaCoins<r.coins}
                  style={{background:vitaCoins>=r.coins?`linear-gradient(135deg,${GOLD},#c49a2e)`:"#1a2a1e",color:vitaCoins>=r.coins?"#060400":MUT,border:"none",borderRadius:10,padding:"8px 14px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,cursor:vitaCoins>=r.coins?"pointer":"not-allowed"}}>
                  {redeeming===r.type?"...":t("coins_redeem")}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab==="how"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {ic:"🔬",text:t("coins_per_scan"),coins:10},
              {ic:"🔥",text:t("coins_per_streak"),coins:50},
              {ic:"🚶",text:t("coins_per_steps"),coins:5},
              {ic:"👥",text:t("coins_per_ref"),coins:200},
            ].map((item,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:24}}>{item.ic}</div>
                <div style={{flex:1,fontSize:13,color:"#a0bcaa"}}>{item.text}</div>
                <div style={{color:GOLD,fontWeight:700,fontSize:14}}>+{item.coins} 🪙</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHASE 2 : PODOMÈTRE ───
function Pedometer({totalScans, vitaCoins, user, onCoinsEarned, t, lang, onBack}) {
  const [steps, setSteps] = useState(()=>parseInt(localStorage.getItem("vs_steps_today")||"0"));
  const [lastReset, setLastReset] = useState(()=>localStorage.getItem("vs_steps_date")||"");
  const [coinsFromSteps, setCoinsFromSteps] = useState(()=>parseInt(localStorage.getItem("vs_steps_coins")||"0"));
  const GOAL = 10000;
  const locked = totalScans < 15;

  useEffect(()=>{
    const today = new Date().toDateString();
    if(lastReset !== today){ setSteps(0); setCoinsFromSteps(0); localStorage.setItem("vs_steps_today","0"); localStorage.setItem("vs_steps_coins","0"); localStorage.setItem("vs_steps_date",today); setLastReset(today); }
  },[]);

  useEffect(()=>{
    if(locked) return;
    let lastAcc = null;
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if(!acc) return;
      const mag = Math.sqrt(acc.x**2+acc.y**2+acc.z**2);
      if(lastAcc!==null){ const delta=Math.abs(mag-lastAcc); if(delta>3){ setSteps(s=>{ const ns=s+1; localStorage.setItem("vs_steps_today",ns.toString()); const earned=Math.floor(ns/1000)*5; if(earned>coinsFromSteps){ const diff=earned-coinsFromSteps; setCoinsFromSteps(earned); localStorage.setItem("vs_steps_coins",earned.toString()); if(user?.uid&&!user?.isDemo) CoinsService.add(user.uid,diff,"Pas marchés"); onCoinsEarned?.(diff); } return ns; }); } }
      lastAcc=mag;
    };
    if(window.DeviceMotionEvent) window.addEventListener("devicemotion",handleMotion);
    return()=>window.removeEventListener("devicemotion",handleMotion);
  },[locked,coinsFromSteps]);

  const pct = Math.min(100,(steps/GOAL)*100);

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 80px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("steps_title")}</div>

      {locked?(
        <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:20,padding:32,textAlign:"center",marginTop:20}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>{t("steps_locked")}</div>
          <div style={{color:MUT,fontSize:13}}>{t("steps_unlock_msg")} {Math.max(0,15-totalScans)} {t("steps_unlock_msg2")}</div>
          <div style={{marginTop:20,background:"#142018",borderRadius:8,height:8,overflow:"hidden"}}>
            <div style={{width:`${(totalScans/15)*100}%`,height:"100%",background:`linear-gradient(90deg,${EM},${GOLD})`,borderRadius:8}}/>
          </div>
          <div style={{color:MUT,fontSize:11,marginTop:6}}>{totalScans}/15 scans</div>
        </div>
      ):(
        <div>
          <div style={{background:"linear-gradient(135deg,#0a1a0c,#121008)",border:`1px solid ${EM}33`,borderRadius:20,padding:28,textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:64,marginBottom:4}}>🚶</div>
            <div className="serif" style={{fontSize:56,fontWeight:700,color:steps>=GOAL?EM:GOLD,lineHeight:1}}>{steps.toLocaleString()}</div>
            <div style={{color:MUT,fontSize:13,marginTop:4}}>{t("steps_today")} · {t("steps_goal")}: {GOAL.toLocaleString()}</div>
            {steps>=GOAL&&<div style={{color:EM,fontWeight:700,fontSize:14,marginTop:8}}>{t("steps_congrats")}</div>}
          </div>
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:MUT}}>{Math.round(pct)}% de l'objectif</span>
              <span style={{fontSize:12,color:GOLD,fontWeight:700}}>{coinsFromSteps} 🪙 {t("steps_coins")}</span>
            </div>
            <div style={{background:"#142018",borderRadius:6,height:12,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${EM},${GOLD})`,borderRadius:6,transition:"width .5s ease"}}/>
            </div>
          </div>
          <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:16,padding:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Paliers de la journée</div>
            {[2000,5000,7500,10000].map(goal=>(
              <div key={goal} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:24,height:24,borderRadius:6,background:steps>=goal?`${EM}20`:"#142018",border:`1px solid ${steps>=goal?EM:BDR}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                  {steps>=goal?"✓":"○"}
                </div>
                <div style={{flex:1,fontSize:12,color:steps>=goal?"#a0bcaa":MUT}}>{goal.toLocaleString()} pas</div>
                <div style={{fontSize:11,color:GOLD,fontWeight:700}}>+{Math.floor(goal/1000)*5} 🪙</div>
              </div>
            ))}
          </div>
        </div>
      )}
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
  {id:"skin",     icon:"🖐️", label:t==="en"?"Skin":"Peau",            hint:t==="en"?"Inner side of wrist":"Face interne du poignet",                  vitamins:"D · B3 · Zinc",             color:"#fb923c", premium:true},
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

// ─── ONBOARDING WOW ───
const SARAH_NAILS = {
  score:68, urgence:"attention", zone:"💅 Ongles",
  carences:[
    {nom:"Vitamine D",niveau:"faible",pct:32,emoji:"☀️",signes:"Stries verticales sur les ongles, légère fragilité"},
    {nom:"Fer",niveau:"limite",pct:52,emoji:"🔴",signes:"Lit de l'ongle légèrement pâle"},
  ],
  conseil:"Exposez-vous 15 min au soleil le matin et ajoutez des lentilles 3x/semaine.",
};

const SARAH_FAT = {
  score:78, zone:"💪 % Gras corporel",
  pct_gras_estime:24, categorie_gras:"fitness",
  abdos_visibles:"partiellement", morphologie:"mesomorphe",
  carences:[{nom:"Protéines",niveau:"limite",pct:55,emoji:"💪",signes:"Légère perte musculaire visible"}],
  conseil:"Augmenter les protéines à 1,8g/kg de poids. Ajouter 2 séances musculation par semaine.",
  evolution:"Score amélioré de +10 points en 3 mois 📈",
};

function Onboarding({onDemo,onRegister,onLogin,lang,setLang,t}) {
  const [step,setStep] = useState(0);
  const [example,setExample] = useState("nails");

  if(step===3) return (
    <div style={{minHeight:"100vh",paddingBottom:100,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 18px",background:"radial-gradient(ellipse at 50% 0%,#071c0c 0%,#060d08 70%)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{background:"#00ff8818",color:EM,borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700}}>
            {t("ob_example_badge")}
          </span>
          <LangToggle lang={lang} setLang={setLang}/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["nails",`💅 ${lang==="en"?"Nails":"Ongles"}`],["fat",`💪 ${lang==="en"?"Body Fat":"% Gras"}`]].map(([k,l])=>(
            <button key={k} onClick={()=>setExample(k)}
              style={{flex:1,background:example===k?`${EM}20`:"transparent",border:`1.5px solid ${example===k?EM:BDR}`,borderRadius:12,padding:"8px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,color:example===k?EM:MUT,cursor:"pointer",transition:"all .2s"}}>
              {l}
            </button>
          ))}
        </div>

        {example==="nails"?(
          <>
            <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div className="serif" style={{fontSize:20,fontWeight:700}}>{t("ob_nails_title")}</div>
              <span style={{background:`${WARN}14`,color:WARN,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>👁 {lang==="en"?"Attention":"Attention"}</span>
            </div>
            <div className="fu1" style={{display:"flex",alignItems:"center",gap:16,marginBottom:8}}>
              <ScoreRing score={68} size={90}/>
              <div>
                <div style={{color:MUT,fontSize:11}}>{lang==="en"?"2 deficiencies detected":"2 carences détectées"}</div>
                <div style={{color:WARN,fontWeight:700,fontSize:26}}>Vitamine D · Fer</div>
                <div style={{fontSize:11,color:MUT,marginTop:4}}>{lang==="en"?"Via visual nail analysis":"Via analyse visuelle ongles"}</div>
              </div>
            </div>
          </>
        ):(
          <>
            <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div className="serif" style={{fontSize:20,fontWeight:700}}>{t("ob_fat_title")}</div>
              <span style={{background:`${EM}14`,color:EM,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>✅ Fitness</span>
            </div>
            <div className="fu1" style={{display:"flex",alignItems:"center",gap:16,marginBottom:8}}>
              <ScoreRing score={78} size={90}/>
              <div>
                <div style={{color:MUT,fontSize:11}}>{lang==="en"?"Estimated body fat":"Gras corporel estimé"}</div>
                <div style={{color:"#f97316",fontWeight:700,fontSize:26}}>24%</div>
                <div style={{fontSize:11,color:WARN,marginTop:4}}>{lang==="en"?"Abs: partially visible":"Abdos : partiellement visibles"}</div>
                <div style={{fontSize:11,color:EM,marginTop:2}}>{SARAH_FAT.evolution}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{padding:"14px 18px"}}>
        {example==="nails"?(
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>🔍 {lang==="en"?"Detected visually":"Détecté visuellement"}</div>
            {SARAH_NAILS.carences.map((c,i)=>(
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
        ):(
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>💪 {lang==="en"?"Body composition":"Composition corporelle"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{background:"#0a140c",borderRadius:10,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:700,color:"#f97316"}}>24%</div>
                <div style={{fontSize:10,color:MUT}}>{lang==="en"?"Body fat":"Gras corporel"}</div>
              </div>
              <div style={{background:"#0a140c",borderRadius:10,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:22}}>〰️</div>
                <div style={{fontSize:10,color:MUT}}>{lang==="en"?"Partial abs":"Abdos partiel"}</div>
              </div>
            </div>
            <div style={{background:`${EM}10`,borderRadius:10,padding:"10px 12px",fontSize:12,color:"#a0bcaa"}}>
              💬 {SARAH_FAT.conseil}
            </div>
          </div>
        )}
        <div style={{background:"#0f1a0a",border:`2px solid ${EM}44`,borderRadius:18,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:28,marginBottom:8}}>🔬</div>
          <div className="serif" style={{fontSize:18,fontWeight:700,marginBottom:6}}>
            {example==="nails"?t("ob_nails_cta"):t("ob_fat_cta")}
          </div>
          <div style={{color:MUT,fontSize:13,marginBottom:16}}>{t("ob_photo_hint")}</div>
          <button className="bem" onClick={onRegister} style={{marginBottom:10}}>{t("ob_register_cta")}</button>
          <button className="bgh" onClick={onDemo}>{t("ob_try_demo")}</button>
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>{t("ob_already_account")}</button>
        </div>
      </div>
    </div>
  );

  const slides = [
    {icon:"🌿",title:t("ob_slide1_title"),sub:t("ob_slide1_sub")},
    {icon:"🍽️",title:t("ob_slide2_title"),sub:t("ob_slide2_sub")},
    {icon:"👨‍👩‍👧",title:t("ob_slide3_title"),sub:t("ob_slide3_sub")},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"radial-gradient(ellipse at 50% 30%,#061a0a 0%,#060d08 70%)"}}>
      <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <LangToggle lang={lang} setLang={setLang}/>
        <button onClick={onRegister} style={{background:"none",border:"none",color:MUT,fontSize:13,cursor:"pointer"}}>{t("skip")}</button>
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
          ? <button className="bem" onClick={()=>setStep(s=>s+1)}>{t("next")}</button>
          : <>
              <button className="bem" onClick={()=>setStep(3)} style={{marginBottom:10}}>{t("ob_see_results")}</button>
              <button className="bgh" onClick={onRegister}>{t("ob_create_account")}</button>
            </>
        }
        {step===0&&(
          <div style={{textAlign:"center",marginTop:14}}>
            <button onClick={onLogin} style={{background:"none",border:"none",color:MUT,fontSize:12,cursor:"pointer"}}>{t("ob_already_account")}</button>
          </div>
        )}
      </div>
    </div>
  );
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
      <button className="bgh" onClick={onLogin}>{t("register_login")}</button>
    </div>
  );
}

function Login({onSuccess,onRegister,onForgot,t}) {
  const [f,setF] = useState({email:"",pass:""});
  const [load,setLoad] = useState(false);
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

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="fu" style={{fontSize:36,marginBottom:10}}>🌿</div>
        <div className="serif fu1" style={{fontSize:24,fontWeight:700}}>{t("login_title")}</div>
        <div className="fu2" style={{color:MUT,fontSize:13,marginTop:5}}>{t("login_subtitle")}</div>
      </div>
      <ErrorBanner msg={err} onClose={()=>setErr("")}/>
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
function Dashboard({user,onScan,onMealScan,onPaywall,onLogout,onProfile,onFamily,onChallenge,onProgress,onMealPlan,onPedometer,onReferral,onWallet,history,profile,vitaCoins,lang,setLang,t}) {
  const scansLeft = user.plan==="free"?Math.max(0,3-(history?.length||0)):null;
  const challengeDay = Math.min(30, history?.length||0);
  const totalScans = history?.length||0;
  const totalXp = totalScans * 20;
  const currentLevel = getLevel(totalXp);
  const streak = calcStreak(history||[]);
  const nextMilestone = MILESTONES.find(m => m.scans > totalScans);

  return (
    <div style={{minHeight:"100vh",paddingBottom:90,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 18px",background:"radial-gradient(ellipse at 50% 0%,#061a0a 0%,#060d08 70%)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <div className="serif fu" style={{fontSize:24,fontWeight:700}}>{t("db_hello")} {user.name?.split(" ")[0]} 👋</div>
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
        <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
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

        <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {ic:"📈",lb:t("db_progress"),fn:onProgress,premium:true},
            {ic:"🗓️",lb:t("db_meal_plan"),fn:onMealPlan,premium:true},
            {ic:"👨‍👩‍👧",lb:t("db_family"),fn:onFamily,premium:false},
            {ic:"🏆",lb:t("db_challenge"),fn:onChallenge,premium:false},
            {ic:"🧬",lb:t("db_my_profile"),fn:onProfile,premium:false},
            {ic:"🚶",lb:lang==="en"?"Steps":"Podomètre",fn:onPedometer,premium:false},
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
                <div className="serif" style={{fontSize:20,fontWeight:700,color:GOLD}}>7,99$</div>
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

// ─── CAPTURE REPAS ───
function MealCapture({onCapture,onBack,user,onPaywall,t}) {
  if(user?.plan!=="premium"&&!user?.isDemo) return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:32,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:60,marginBottom:12}}>🍽️</div>
        <div className="serif" style={{fontSize:24,fontWeight:700,marginBottom:8,color:GOLD}}>{t("meal_capture_title")}</div>
        <div style={{color:MUT,fontSize:14,lineHeight:1.7,marginBottom:20}}>
          {t("meal_capture_sub")}<br/>
          <span style={{color:"#edf5ef"}}>{t("meal_capture_macros")}</span><br/>{t("meal_capture_deficiencies")}
        </div>
      </div>
      <div className="card" style={{marginBottom:24,border:`1px solid ${GOLD}33`}}>
        {[t("meal_feature1"),t("meal_feature2"),t("meal_feature3"),t("meal_feature4"),t("meal_feature5")].map((f,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:i<4?10:0,fontSize:13,color:"#b0c8b8"}}>
            <span style={{color:EM}}>✓</span>{f}
          </div>
        ))}
      </div>
      <button className="bgold" onClick={onPaywall} style={{marginBottom:10}}>{t("meal_unlock")}</button>
      <button className="bgh" onClick={onBack}>{t("back")}</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px",display:"flex",flexDirection:"column"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:22,fontWeight:700,marginBottom:3}}>{t("meal_capture_title")}</div>

      <div className="fu2" style={{flex:1,maxHeight:200,background:"#0a0d06",borderRadius:24,border:`2px solid ${GOLD}38`,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
        <div style={{position:"absolute",left:16,right:16,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,animation:"scanPulse 2s ease-in-out infinite",top:"50%"}}/>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:48,marginBottom:8}}>🍽️</div>
          <div style={{color:GOLD,fontWeight:600,fontSize:13}}>{t("meal_photo_sub")}</div>
        </div>
      </div>

      <div className="fu3 card" style={{marginBottom:16}}>
        <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:8}}>{t("meal_photo_title")}</div>
        {[t("capture_tip1"),t("capture_tip2"),t("capture_tip3")].map(tip=>(
          <div key={tip} style={{display:"flex",gap:7,marginBottom:5,fontSize:12,color:MUT}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:GOLD,marginTop:4,flexShrink:0}}/>{tip}
          </div>
        ))}
      </div>

      <div className="fu4">
        <PhotoPicker onCapture={onCapture} color={GOLD} icon="🍽️" hint={t("meal_photo_sub")} label="Repas" t={t}/>
      </div>
    </div>
  );
}

// ─── PREVIEW ───
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
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,system:CHAT_SYSTEM,messages:[{role:"user",content:`${ctx}\n\nQuestion: ${userMsg.text}`}]})
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
function MealResult({result,onNewScan,onHome,t}) {
  const sc=result?.score_nutrition||0;
  const scoreColor=sc>=75?EM:sc>=50?WARN:DANGER;
  const handleShare=async()=>{
    const text=`🍽️ VitaScann Meal Analysis\n\n${result.nom_repas||"My meal"} — ${result.calories_estimees} kcal\nScore: ${sc}/100\n\n🌿 vitascann.vercel.app`;
    if(navigator.share){await navigator.share({title:"VitaScann",text}).catch(()=>{});}
    else{await navigator.clipboard.writeText(text);alert("📋 Copied!");}
  };
  return (
    <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto"}}>
      <div style={{padding:"52px 22px 22px",background:"radial-gradient(ellipse at 50% 0%,#1a1200 0%,#060d08 70%)"}}>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div className="serif" style={{fontSize:22,fontWeight:700}}>{t("meal_result_title")}</div>
          <span style={{background:`${scoreColor}14`,color:scoreColor,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
            {sc>=75?t("meal_excellent"):sc>=50?t("meal_ok"):t("meal_incomplete")}
          </span>
        </div>
        <div className="fu1" style={{display:"flex",alignItems:"center",gap:18}}>
          <ScoreRing score={sc} size={100}/>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:GOLD}}>{result.nom_repas||"Your meal"}</div>
            {result.note_halal==="halal"&&<span style={{background:`${GOLD}14`,color:GOLD,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>{t("meal_halal")}</span>}
            {result.note_halal==="attention"&&<span style={{background:`${WARN}14`,color:WARN,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>{t("meal_halal_check")}</span>}
            <div style={{color:MUT,fontSize:11,marginTop:8}}>{t("meal_calories")}</div>
            <div style={{color:GOLD,fontWeight:700,fontSize:24}}>{result.calories_estimees}<span style={{fontSize:12,fontWeight:400}}> kcal</span></div>
          </div>
        </div>
      </div>
      <div style={{padding:"14px 18px"}}>
        <div className="fu2 card" style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{t("meal_macros")}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[[t("meal_protein"),result.proteines_g,"g","#38bdf8"],[t("meal_carbs"),result.glucides_g,"g","#fbbf24"],[t("meal_fat"),result.lipides_g,"g","#fb923c"]].map(([l,v,u,c])=>(
              <div key={l} style={{background:"#0a140c",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:700,color:c}}>{v||"?"}</div>
                <div style={{fontSize:10,color:MUT,marginTop:2}}>{l} ({u})</div>
              </div>
            ))}
          </div>
        </div>
        {result.carences_comblees?.length>0&&(
          <div className="fu3 card" style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{t("meal_covered")}</div>
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
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:WARN}}>{t("meal_missing")}</div>
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
            <div style={{color:GOLD,fontSize:10,fontWeight:700,letterSpacing:.8,marginBottom:7}}>{t("meal_global_advice")}</div>
            <div style={{fontSize:13,color:"#a0bcaa",lineHeight:1.7}}>{result.conseil_global}</div>
          </div>
        )}
        <div style={{background:"#120f06",border:"1px solid #2a2010",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#806040",lineHeight:1.6,marginBottom:16}}>
          {t("meal_disclaimer")}
        </div>
        <button onClick={handleShare} style={{width:"100%",background:"linear-gradient(135deg,#1a2e20,#0f1e14)",border:`1.5px solid ${EM}55`,borderRadius:12,padding:"14px",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:EM,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {t("meal_share")}
        </button>
        <button className="bem" onClick={onNewScan} style={{marginBottom:10}}>{t("meal_new")}</button>
        <button className="bgh" onClick={onHome}>{t("meal_home")}</button>
      </div>
    </div>
  );
}

// ─── PROGRESSION ───
function Progress({history,onBack,t}) {
  const scores = history.filter(h=>h.score).slice(0,10).reverse();
  const max = Math.max(...scores.map(s=>s.score),100);
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("progress_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>{t("progress_sub")}</div>
      {scores.length>0?(
        <div className="fu2 card" style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,padding:"10px 0"}}>
            {scores.map((s,i)=>{
              const h=(s.score/max)*100;
              const c=s.score>=75?EM:s.score>=50?WARN:DANGER;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:9,color:c,fontWeight:700}}>{s.score}</div>
                  <div style={{width:"100%",height:`${h}%`,background:c,borderRadius:"4px 4px 0 0",minHeight:4,boxShadow:`0 0 6px ${c}55`,transition:"height 1s ease"}}/>
                  <div style={{fontSize:8,color:MUT,textAlign:"center",lineHeight:1.2}}>{(s.zone||s.nom_repas||"S").slice(0,5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ):(
        <div className="card" style={{textAlign:"center",padding:32}}>
          <div style={{fontSize:40,marginBottom:12}}>📊</div>
          <div style={{color:MUT}}>{t("progress_empty")}</div>
        </div>
      )}
      {scores.length>0&&(
        <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            [t("progress_best"),Math.max(...scores.map(s=>s.score)),EM],
            [t("progress_avg"),Math.round(scores.reduce((a,s)=>a+s.score,0)/scores.length),WARN],
            [t("progress_scans"),history.length,GOLD],
          ].map(([l,v,c])=>(
            <div key={l} className="card" style={{textAlign:"center",border:`1px solid ${c}22`}}>
              <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:10,color:MUT,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      )}
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
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:MEAL_PLAN_PROMPT,messages:[{role:"user",content:`Profil: ${pc} Génère un plan repas 7 jours adapté.`}]})
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
function Challenge({history,onBack,t}) {
  const done = Math.min(30,history?.length||0);
  const badges = [
    {day:1,icon:"🌱",label:t("badge_first"),done:done>=1},
    {day:5,icon:"⚡",label:t("badge_5"),done:done>=5},
    {day:10,icon:"🔥",label:t("badge_10"),done:done>=10},
    {day:20,icon:"💎",label:t("badge_20"),done:done>=20},
    {day:30,icon:"👑",label:t("badge_30"),done:done>=30},
  ];
  return (
    <div style={{minHeight:"100vh",padding:"52px 20px 40px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div className="serif fu" style={{fontSize:26,fontWeight:700,marginBottom:4}}>{t("challenge_title")}</div>
      <div className="fu1" style={{color:MUT,fontSize:13,marginBottom:24}}>{t("challenge_sub")}</div>

      <div className="fu2 card" style={{marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:48,fontWeight:700,color:GOLD,marginBottom:4}}>{done}<span style={{fontSize:20,color:MUT}}>/30</span></div>
        <div style={{color:MUT,fontSize:13,marginBottom:14}}>{t("challenge_done")}</div>
        <div style={{background:"#142018",borderRadius:8,height:10,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${(done/30)*100}%`,height:"100%",background:`linear-gradient(90deg,${GOLD},${EM})`,borderRadius:8,transition:"width 1.2s ease"}}/>
        </div>
        <div style={{fontSize:12,color:EM,fontWeight:600}}>{done>=30?t("challenge_complete"):done>0?`${t("challenge_left")} ${30-done} ${t("challenge_left2")}`:t("challenge_start")}</div>
      </div>

      <div className="fu3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {badges.map(b=>(
          <div key={b.day} style={{background:b.done?`${GOLD}12`:CARD,border:`1px solid ${b.done?GOLD:BDR}`,borderRadius:16,padding:"16px",textAlign:"center",transition:"all .3s"}}>
            <div style={{fontSize:32,marginBottom:6,filter:b.done?"none":"grayscale(1) opacity(0.4)"}}>{b.icon}</div>
            <div style={{fontWeight:700,fontSize:12,color:b.done?GOLD:"#edf5ef"}}>{b.label}</div>
            <div style={{fontSize:10,color:MUT,marginTop:2}}>{t("badge_day")} {b.day}</div>
            {b.done&&<div style={{color:GOLD,fontSize:11,fontWeight:700,marginTop:4}}>{t("badge_obtained")}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAYWALL ───
function Paywall({user,onBack,onSuccess,t}) {
  const [secs,setSecs]=useState(12*60);
  useEffect(()=>{const timer=setInterval(()=>setSecs(s=>s>0?s-1:0),1000);return()=>clearInterval(timer);},[]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");
  const urgent=secs<3*60;

  const handleCheckout=()=>{
    const url=`https://buy.stripe.com/test_7sY8wObvB8GV8hBcIaeQM00?prefilled_email=${encodeURIComponent(user?.email||"")}&client_reference_id=${user?.uid||""}`;
    window.location.href=url;
  };

  const features = [
    ["🔬",t("pw_f1_title"),t("pw_f1_sub")],
    ["🍽️",t("pw_f2_title"),t("pw_f2_sub")],
    ["💬",t("pw_f3_title"),t("pw_f3_sub")],
    ["🗓️",t("pw_f4_title"),t("pw_f4_sub")],
    ["📈",t("pw_f5_title"),t("pw_f5_sub")],
    ["👨‍👩‍👧",t("pw_f6_title"),t("pw_f6_sub")],
    ["🌙",t("pw_f7_title"),t("pw_f7_sub")],
    ["📄",t("pw_f8_title"),t("pw_f8_sub")],
  ];

  return (
    <div style={{minHeight:"100vh",padding:"52px 24px 40px",overflowY:"auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:13,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>{t("back")}</button>
      <div style={{background:urgent?"#1a0505":"#0f1505",border:`1.5px solid ${urgent?DANGER:GOLD}44`,borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,color:urgent?DANGER:GOLD,fontWeight:700,letterSpacing:.8}}>{urgent?t("pw_timer_urgent"):t("pw_timer_label")}</div>
          <div style={{fontSize:24,fontWeight:700,color:urgent?DANGER:GOLD,fontVariantNumeric:"tabular-nums",animation:urgent?"pulse 1s ease infinite":undefined}}>{mm}:{ss}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:MUT}}>{t("pw_regular")}</div>
          <div style={{fontSize:14,color:MUT,textDecoration:"line-through"}}>14,99$/mois</div>
          <div style={{fontSize:18,fontWeight:700,color:GOLD}}>7,99$/mois</div>
        </div>
      </div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:50,marginBottom:12}}>👑</div>
        <div className="serif" style={{fontSize:26,fontWeight:700,color:GOLD,marginBottom:8}}>{t("pw_title")}</div>
        <div style={{color:MUT,fontSize:14,lineHeight:1.7}}>{t("pw_subtitle")}</div>
      </div>
      <div className="card" style={{marginBottom:20,border:`1px solid ${GOLD}33`}}>
        <div style={{color:GOLD,fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:14}}>{t("pw_unlock")}</div>
        {features.map(([ic,title,sub],i)=>(
          <div key={i} style={{display:"flex",gap:12,marginBottom:i<7?14:0,paddingBottom:i<7?14:0,borderBottom:i<7?`1px solid ${BDR}`:"none"}}>
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
        <div style={{color:MUT,fontSize:13}}>{t("pw_per_month")}</div>
        <div style={{color:EM,fontSize:12,fontWeight:600,marginTop:4}}>{t("pw_discount")}</div>
      </div>
      <button className="bgold" onClick={handleCheckout} style={{marginBottom:12,fontSize:16,padding:"18px"}}>
        {t("pw_btn")}
      </button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["🔒",t("pw_secure")],["❌",t("pw_cancel")],["💬",t("pw_support")]].map(([ic,lb])=>(
          <div key={lb} style={{background:CARD,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:3}}>{ic}</div>
            <div style={{fontSize:9,color:MUT,lineHeight:1.4}}>{lb}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#0a1a0c",border:`1px solid ${BDR}`,borderRadius:12,padding:14,fontSize:12,color:MUT,lineHeight:1.6,textAlign:"center"}}>
        {t("pw_disclaimer")}
      </div>
    </div>
  );
}

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

  const addCoins = async (amount, reason) => {
    if(!user?.uid||user?.isDemo) return;
    const newBal = await CoinsService.add(user.uid, amount, reason);
    setVitaCoins(newBal);
    setCoinsToast(amount);
  };

  // Init notifications au démarrage + check referral
  useEffect(()=>{
    NotifService.init();
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if(ref) localStorage.setItem("vs_pending_ref", ref);
  },[]);

  const ZONES = getZones(lang);

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
      else if(screen==="paywall"||screen==="progress"||screen==="mealplan"||screen==="family"||screen==="challenge"||screen==="pedometer"||screen==="exercises"||screen==="referral")setScreen("dashboard");
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
        NotifService.scheduleLocalReminder(user.uid);
        await addCoins(10, `Scan ${zone?.label}`);
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
    if(user?.plan!=="premium"&&!user?.isDemo&&history.length>=2){setScreen("paywall");return;}
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
        {screen==="dashboard"    && user && <Dashboard user={user} onScan={handleScan} onMealScan={handleMealScan} onPaywall={()=>setScreen("paywall")} onLogout={handleLogout} onProfile={()=>setScreen("profile")} onFamily={()=>setScreen("family")} onChallenge={()=>setScreen("challenge")} onProgress={()=>user.plan==="premium"?setScreen("progress"):setScreen("paywall")} onMealPlan={()=>user.plan==="premium"?setScreen("mealplan"):setScreen("paywall")} onPedometer={()=>setScreen("pedometer")} onReferral={()=>setScreen("referral")} onWallet={()=>setShowWallet(true)} history={history} profile={profile} vitaCoins={vitaCoins} {...commonProps}/>}
        {screen==="zones"        && <ZonePick onSelect={z=>{setZone(z);setScreen("capture");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")} lang={lang} t={t} profile={profile}/>}
        {screen==="capture"      && zone && <Capture zone={zone} onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("preview");}} onBack={()=>setScreen("zones")} t={t}/>}
        {screen==="meal_capture" && <MealCapture onCapture={(b,p)=>{setB64(b);setPrev(p);setScreen("meal_preview");}} onBack={()=>setScreen("dashboard")} user={user} onPaywall={()=>setScreen("paywall")} t={t}/>}
        {screen==="preview"      && zone && <Preview zone={zone} preview={prev} onAnalyze={analyze} onRetake={()=>setScreen("capture")} isMeal={false} t={t}/>}
        {screen==="meal_preview" && <Preview zone={null} preview={prev} onAnalyze={analyzeMeal} onRetake={()=>setScreen("meal_capture")} isMeal={true} t={t}/>}
        {screen==="analyzing"    && <Analyzing zone={zone} isMeal={isMeal} t={t}/>}
        {screen==="result"       && result&&zone && <Result result={result} zone={zone} user={user} profile={profile} history={history} onNewScan={()=>setScreen("zones")} onHome={()=>setScreen("dashboard")} onExercises={()=>setScreen("exercises")} lang={lang} t={t}/>}
        {screen==="meal_result"  && mealResult && <MealResult result={mealResult} onNewScan={()=>setScreen("meal_capture")} onHome={()=>setScreen("dashboard")} t={t}/>}
        {screen==="paywall"      && <Paywall user={user} onBack={()=>setScreen(user&&!user.isDemo?"dashboard":"onboarding")} onSuccess={()=>{setUser(u=>({...u,plan:"premium"}));setScreen("dashboard");}} t={t}/>}
        {screen==="progress"     && <Progress history={history} onBack={()=>setScreen("dashboard")} t={t}/>}
        {screen==="mealplan"     && <MealPlan profile={profile} onBack={()=>setScreen("dashboard")} user={user} t={t}/>}
        {screen==="family"       && <Family user={user} family={family} onSave={setFamily} onBack={()=>setScreen("dashboard")} onSwitchProfile={m=>{setUser(u=>({...u,name:m.name,isFamily:true}));setScreen("zones");}} t={t}/>}
        {screen==="challenge"    && <Challenge history={history} onBack={()=>setScreen("dashboard")} t={t}/>}
        {screen==="pedometer"    && <Pedometer totalScans={history.length} vitaCoins={vitaCoins} user={user} onCoinsEarned={amt=>addCoins(amt,"Pas marchés")} t={t} lang={lang} onBack={()=>setScreen("dashboard")}/>}
        {screen==="exercises"    && <Exercises zone={zone} totalScans={history.length} user={user} onCoinsEarned={amt=>addCoins(amt,"Exercice complété")} t={t} lang={lang} onBack={()=>setScreen("result")}/>}
        {screen==="referral"     && <Referral user={user} vitaCoins={vitaCoins} t={t} lang={lang} onBack={()=>setScreen("dashboard")}/>}
      </div>
    </>
  );
}

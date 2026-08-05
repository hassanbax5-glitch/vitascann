// ============================================
// VITASCANN — NOUVEAUX MODULES v1.0
// ✅ LongeviteArticulaire — 18 exercices (bas + haut du corps)
// ✅ CoachCali — Programme Débutant + Intermédiaire complet
// ✅ CoachGym — Module Grossesse pré/post accouchement
// 
// INSTRUCTIONS D'INTÉGRATION:
// 1. Copie ce fichier dans ton projet
// 2. Importe les composants dans App.js
// 3. Ajoute les screens dans le switch principal
// 4. Uploade les images sur Firebase Storage
// 5. Remplace les URLs placeholder par les vraies URLs
// ============================================

// ─── CONSTANTES (déjà dans App.js — ne pas dupliquer) ───
// const EM="#00ff88", GOLD="#e2b84a", MUT="#4a6e52", DANGER="#ff5555"
// const CARD="#0c1810", BDR="#192c1d"

const BASE = "https://res.cloudinary.com/dpkpzqdni/image/upload/";

const IMG = {
  // ── LONGÉVITÉ ARTICULAIRE — BAS DU CORPS ──
  deep_squat:     BASE + "Whisk_8eb708a93af52bd808e4849114ed5adbdr_zc5pjr.png",
  slavic_squat:   BASE + "Whisk_ae0dd524fbe88bda2464840bab13d0e2eg_kuzawj.png",
  seiza:          BASE + "Whisk_7e418291eba1863b9a349b79cbe4fe96dr_zzjmea.png",
  bear_crawl:     BASE + "Whisk_a9f37032bc0dc3ea3a24c9617f2c2fe6dr_wvdlok.png",
  hanging:        BASE + "Whisk_7517c1b5093eb9889f74f5e9ee608f35dr_w0ge91.png",
  balance:        BASE + "Whisk_d0056c1ce80dcb280ea409a43bac75ecdr_lgxltj.png",
  cars_shoulder:  BASE + "Whisk_e310b1a7a510bf0a0b745763291bea22dr_vqwmtq.png",
  hip_90_90:      BASE + "Whisk_4aaf9e58d3c5c8ca6fb415807a3a1db0dr_bge1kt.png",
  sumo_squat:     BASE + "Whisk_04a74b669c67e0b9b0e4f22588500ec0dr_fmqwps.png",
  hip_flexor:     BASE + "Whisk_0d664bec5381b1fa51449350e8a5a442dr_vcpjra.png",
  cossack:        BASE + "Whisk_087cdd147c3f6ae8bff476dece0ee3eddr_lu8xny.png",
  samurai_lunge:  BASE + "Whisk_d74374252fc7033bcca4c1ed4def8efddr_olorie.png",
  // ── LONGÉVITÉ ARTICULAIRE — HAUT DU CORPS ──
  wrist_circles:  BASE + "Capture_d_%C3%A9cran_2026-04-11_231115_cnlxpq.png",
  wrist_stretch:  BASE + "Capture_d_%C3%A9cran_2026-04-11_231201_osvumd.png",
  elbow_cars:     BASE + "Capture_d_%C3%A9cran_2026-04-11_231329_v9dl5k.png",
  shoulder_dislo: BASE + "Capture_d_%C3%A9cran_2026-04-11_231424_jvedes.png",
  neck_cars:      BASE + "Capture_d_%C3%A9cran_2026-04-11_231526_em3jkb.png",
  thoracic_rot:   BASE + "Capture_d_%C3%A9cran_2026-04-11_231640_obl2ux.png",
  // ── CALISTHENICS ──
  pullup:         BASE + "Capture_d_%C3%A9cran_2026-04-11_225046_fcxmkz.png",
  pushup:         BASE + "Capture_d_%C3%A9cran_2026-04-11_224450_czfrer.png",
  dips:           BASE + "Capture_d_%C3%A9cran_2026-04-11_224435_fztttd.png",
  lsit:           BASE + "Capture_d_%C3%A9cran_2026-04-11_224410_nnchzq.png",
  muscle_up:      BASE + "Capture_d_%C3%A9cran_2026-04-11_224349_roypy5.png",
  pistol_squat:   BASE + "Capture_d_%C3%A9cran_2026-04-11_222649_xq5oja.png",
  hspu:           BASE + "Capture_d_%C3%A9cran_2026-04-11_230447_wrkrdd.png",
  front_lever:    BASE + "Capture_d_%C3%A9cran_2026-04-11_224322_g9u5ic.png",
  plank:          BASE + "Capture_d_%C3%A9cran_2026-04-11_225203_so10eo.png",
  hollow_body:    BASE + "Capture_d_%C3%A9cran_2026-04-11_225308_s6szu0.png",
  glute_bridge:   BASE + "Capture_d_%C3%A9cran_2026-04-11_225340_rp2lct.png",
  pike_pushup:    BASE + "Capture_d_%C3%A9cran_2026-04-11_225430_aubiwc.png",
  australian_row: BASE + "Capture_d_%C3%A9cran_2026-04-11_225548_jrvxkm.png",
  archer_pushup:  BASE + "Capture_d_%C3%A9cran_2026-04-11_225652_i0uaer.png",
  jump_squat:     BASE + "Capture_d_%C3%A9cran_2026-04-11_225746_ko766z.png",
};

// ─── DONNÉES LONGÉVITÉ ARTICULAIRE ───
const LONGEVITE_BAS = [
  {
    id:"deep_squat", img: IMG.deep_squat, gratuit: true,
    nom:"Deep Squat Hold",
    cible:"Genoux · Hanches · Chevilles",
    desc:"Restaure la mobilité perdue par la position assise. La position que la majorité des gens évitent.",
    duree:"2–3 min", freq:"Quotidien",
    conseil:"Garde les talons au sol. Si difficile, tiens un cadre de porte. Respire et relâche avec chaque expiration.",
    pourquoi:"Tes articulations n'ont pas d'apport direct en sang — elles dépendent du mouvement en amplitude complète.",
  },
  {
    id:"slavic_squat", img: IMG.slavic_squat, gratuit: true,
    nom:"Slavic Squat (Ass-to-Grass)",
    cible:"Genoux · Hanches · Chevilles",
    desc:"Position profonde traditionnelle slave. Pieds plats, derrière qui touche presque les talons.",
    duree:"1–2 min", freq:"Quotidien",
    conseil:"Commence en te tenant à une barre. Pieds proches, genoux vers l'avant. Tiens la position sans rebondir.",
    pourquoi:"Maintient la flexion maximale du genou et prévient l'arthrose en lubrifiant le cartilage.",
  },
  {
    id:"seiza", img: IMG.seiza, gratuit: true,
    nom:"Position Seiza",
    cible:"Genoux · Chevilles",
    desc:"Position japonaise assis sur les talons. Renforce la stabilité des genoux et la souplesse des chevilles.",
    duree:"1–2 min", freq:"Quotidien",
    conseil:"Place un coussin sous les genoux si douleur. Commence par 30 secondes et progresse graduellement.",
    pourquoi:"Les samouraïs restaient en Seiza pendant des heures — leurs genoux ne lâchaient jamais.",
  },
  {
    id:"sumo_squat", img: IMG.sumo_squat, gratuit: false,
    nom:"Sumo Squat Hold",
    cible:"Adducteurs · Hanches",
    desc:"Pieds très écartés, orteils pointés vers l'extérieur. Descend profond et tiens la position.",
    duree:"1–2 min", freq:"3x/semaine",
    conseil:"Pousse les genoux vers l'extérieur avec les coudes. Garde le dos droit et la poitrine haute.",
    pourquoi:"Ouvre les hanches et renforce les adducteurs, souvent négligés dans les entraînements modernes.",
  },
  {
    id:"hip_flexor", img: IMG.hip_flexor, gratuit: false,
    nom:"Kneeling Hip Flexor",
    cible:"Hanches · Psoas",
    desc:"Fente profonde agenouillée, hanches poussées vers l'avant. Étire le psoas raccourci par la position assise.",
    duree:"60 sec/côté", freq:"Quotidien",
    conseil:"Contracte le fessier de la jambe arrière pour intensifier l'étirement. Tiens sans rebondir.",
    pourquoi:"Le psoas tendu est la cause #1 des douleurs lombaires chez les personnes sédentaires.",
  },
  {
    id:"hip_90_90", img: IMG.hip_90_90, gratuit: false,
    nom:"90/90 Hip Stretch",
    cible:"Rotateurs de hanche",
    desc:"Assis au sol, les deux jambes fléchies à 90° dans des directions opposées. Rotation complète de hanche.",
    duree:"60 sec/côté", freq:"Quotidien",
    conseil:"Assois-toi droit, pas de compensation avec le dos. Tourne lentement et tiens la position finale.",
    pourquoi:"Développe la rotation interne et externe de hanche — clé pour prévenir douleurs au genou et lombaires.",
  },
  {
    id:"cossack", img: IMG.cossack, gratuit: false,
    nom:"Cossack Squat",
    cible:"Adducteurs · Genoux · Chevilles",
    desc:"Squat latéral profond — une jambe en squat complet, l'autre étendue sur le côté.",
    duree:"8 reps/côté", freq:"3x/semaine",
    conseil:"Commence lent. Ton pied étendu peut rester au sol à plat ou sur le talon selon ta souplesse.",
    pourquoi:"Mouvement fondamental des guerriers cosaques — développe une mobilité de hanche exceptionnelle.",
  },
  {
    id:"samurai_lunge", img: IMG.samurai_lunge, gratuit: false,
    nom:"Samurai Lunge",
    cible:"Quadriceps · Hanches",
    desc:"Stance guerrière du samouraï. Jambes très écartées, basse, genoux fléchis, garde haute.",
    duree:"45 sec/côté", freq:"3x/semaine",
    conseil:"Descends le plus bas possible. Les samouraïs tenaient cette position pendant des minutes entières.",
    pourquoi:"Développe la puissance et la mobilité des hanches simultanément — force fonctionnelle maximale.",
  },
  {
    id:"bear_crawl", img: IMG.bear_crawl, gratuit: false,
    nom:"Bear Crawl",
    cible:"Corps entier · Stabilité",
    desc:"Rampe comme un ours — mains et pieds au sol, genoux légèrement levés. Mouvement primitif.",
    duree:"5 min", freq:"3x/semaine",
    conseil:"Dos plat comme une table. Bouge la main droite avec le pied gauche. Reste lent et contrôlé.",
    pourquoi:"Reconstruit les patterns neurologiques de base. Un des mouvements les plus complets qui existent.",
  },
  {
    id:"balance", img: IMG.balance, gratuit: false,
    nom:"Équilibre Unilatéral",
    cible:"Core · Chevilles · Hanches",
    desc:"Tenir debout sur une jambe, l'autre levée à 90°. Simple mais transformateur après 40 ans.",
    duree:"60 sec/jambe", freq:"Quotidien",
    conseil:"Regard fixe sur un point. Yeux fermés pour amplifier la difficulté. Progresser vers surface instable.",
    pourquoi:"L'équilibre unilatéral prédit la longévité — les chercheurs l'utilisent comme marqueur de santé.",
  },
  {
    id:"cars_shoulder", img: IMG.cars_shoulder, gratuit: false,
    nom:"CARs — Rotations Articulaires",
    cible:"Toutes les articulations",
    desc:"Rotations lentes et contrôlées de chaque articulation en amplitude maximale.",
    duree:"5–8 min", freq:"Quotidien",
    conseil:"Isole chaque articulation. La qualité prime sur la vitesse. Respire pendant tout le mouvement.",
    pourquoi:"Cartographie neurale de tes amplitudes. Méthode Kinstretch — la plus efficace pour la longévité.",
  },
  {
    id:"hanging", img: IMG.hanging, gratuit: false,
    nom:"Hanging / Suspension",
    cible:"Épaules · Dos · Colonne",
    desc:"Se suspendre à une barre libère la compression vertébrale et restaure la mobilité des épaules.",
    duree:"30–60 sec", freq:"Quotidien",
    conseil:"60 secondes/jour suffisent. Relâche complètement les épaules. Respire profondément.",
    pourquoi:"Décompresse les vertèbres et prévient les hernies. Le Dr John Kirsch recommande 3 min/jour.",
  },
];

const LONGEVITE_HAUT = [
  {
    id:"wrist_circles", img: IMG.wrist_circles, gratuit: true,
    nom:"Wrist Circles — Rotations Poignets",
    cible:"Poignets · Avant-bras",
    desc:"Rotations lentes et complètes des poignets dans les deux directions. Essentiel pour les sportifs.",
    duree:"1 min/direction", freq:"Quotidien",
    conseil:"Fais des grands cercles lents. Ressens chaque craquement — c'est du liquide synovial qui circule.",
    pourquoi:"Prévient le syndrome du canal carpien et les blessures de poignet au sport.",
  },
  {
    id:"wrist_stretch", img: IMG.wrist_stretch, gratuit: true,
    nom:"Wrist Push-up Stretch",
    cible:"Poignets · Extenseurs",
    desc:"À genoux, doigts pointés vers les genoux, presse doucement les poignets au sol.",
    duree:"45 sec", freq:"Quotidien",
    conseil:"Ne force pas. Laisse le poids du corps créer l'étirement. Augmente progressivement la pression.",
    pourquoi:"Contre-pose aux push-ups et au clavier. Préserve la santé des poignets à long terme.",
  },
  {
    id:"elbow_cars", img: IMG.elbow_cars, gratuit: false,
    nom:"Elbow CARs — Rotations Coudes",
    cible:"Coudes · Biceps · Triceps",
    desc:"Rotation contrôlée du coude de l'extension complète à la flexion complète en mouvement circulaire.",
    duree:"5 reps/côté", freq:"Quotidien",
    conseil:"Garde le haut du bras immobile. Seul l'avant-bras bouge. Lent et conscient.",
    pourquoi:"Maintient la santé du cartilage du coude et prévient l'épicondylite (tennis elbow).",
  },
  {
    id:"shoulder_dislo", img: IMG.shoulder_dislo, gratuit: false,
    nom:"Shoulder Dislocate",
    cible:"Épaules · Coiffe des rotateurs",
    desc:"Avec un bâton ou une bande, passer les bras de devant vers derrière en arc complet.",
    duree:"10 reps", freq:"Quotidien",
    conseil:"Grip très large au début. Réduis progressivement. Ne force jamais — douleur = stop.",
    pourquoi:"Restaure l'amplitude complète des épaules. Utilisé par les gymnastes et les haltérophiles.",
  },
  {
    id:"neck_cars", img: IMG.neck_cars, gratuit: false,
    nom:"Neck CARs — Rotations du Cou",
    cible:"Cou · Trapèzes",
    desc:"Rotations lentes et complètes du cou. La majorité des gens ont une mobilité cervicale très réduite.",
    duree:"3 reps/direction", freq:"Quotidien",
    conseil:"Extrêmement lent. Jamais de force. Si douleur aiguë, consulte un médecin avant de continuer.",
    pourquoi:"Prévient les douleurs cervicales chroniques causées par le travail sur écran.",
  },
  {
    id:"thoracic_rot", img: IMG.thoracic_rot, gratuit: false,
    nom:"Thoracic Rotation",
    cible:"Colonne dorsale · Obliques",
    desc:"Assis en 90/90, rotation du haut du corps avec le bras qui atteint derrière. Mobilité thoracique.",
    duree:"8 reps/côté", freq:"Quotidien",
    conseil:"Garde les hanches stables — seul le haut du dos tourne. Expire pendant la rotation.",
    pourquoi:"La rigidité thoracique cause 80% des douleurs lombaires et d'épaules. Essentiel à corriger.",
  },
];

// ─── DONNÉES PROGRAMME CALISTHENICS DÉBUTANT ───
const CALI_DEBUTANT = {
  id: "cali_debutant_v2",
  nom: "Programme Débutant",
  niveau: "🌱 Débutant",
  duree: "8 semaines",
  jours: "3 jours/semaine",
  description: "Construis ta base — force, coordination, patterns fondamentaux",
  couleur: "#34d399",
  semaines: [
    {
      label: "Semaines 1-2 — Fondations",
      seances: [
        {
          jour: "Jour A",
          label: "Push + Core",
          exercices: [
            { img: IMG.pushup, nom: "Push-up", muscle: "Pectoraux · Triceps", series: 3, reps: "5-8", repos: 90, conseil: "Corps droit comme une planche. Coudes à 45° du corps. Amplitude complète." },
            { img: IMG.plank, nom: "Plank", muscle: "Core · Épaules", series: 3, reps: "20 sec", repos: 60, conseil: "Contracte les fessiers et le ventre. Regarde le sol. Ne bloque pas la respiration." },
            { img: IMG.glute_bridge, nom: "Glute Bridge", muscle: "Fessiers · Ischio", series: 3, reps: "12", repos: 60, conseil: "Presse le sol avec les pieds. Squeeze les fessiers en haut. Tiens 1 sec en haut." },
          ]
        },
        {
          jour: "Jour B",
          label: "Pull + Jambes",
          exercices: [
            { img: IMG.australian_row, nom: "Australian Pull-up", muscle: "Dos · Biceps", series: 3, reps: "6-10", repos: 90, conseil: "Corps droit de la tête aux talons. Tire le sternum vers la barre. Contrôle la descente." },
            { img: IMG.deep_squat, nom: "Deep Squat", muscle: "Jambes complètes", series: 3, reps: "10", repos: 60, conseil: "Descends le plus bas possible. Talons au sol. Utilise un support si nécessaire." },
            { img: IMG.hollow_body, nom: "Hollow Body Hold", muscle: "Core profond", series: 3, reps: "15 sec", repos: 60, conseil: "Dos plat au sol. Jambes et bras étendus. Rentres le ventre fort. Respire." },
          ]
        },
        {
          jour: "Jour C",
          label: "Full Body",
          exercices: [
            { img: IMG.pike_pushup, nom: "Pike Push-up", muscle: "Épaules · Triceps", series: 3, reps: "6-8", repos: 90, conseil: "Hanches très hautes. Tête entre les bras. Descends le front vers le sol." },
            { img: IMG.jump_squat, nom: "Jump Squat", muscle: "Jambes · Explosivité", series: 3, reps: "8", repos: 90, conseil: "Descends à 90° puis explose vers le haut. Atterris doucement en pliant les genoux." },
            { img: IMG.plank, nom: "Side Plank", muscle: "Obliques", series: 2, reps: "20 sec/côté", repos: 60, conseil: "Corps aligné. Hanches levées. Regarder devant soi." },
          ]
        }
      ]
    },
    {
      label: "Semaines 3-4 — Progression",
      seances: [
        {
          jour: "Jour A",
          label: "Push + Core",
          exercices: [
            { img: IMG.pushup, nom: "Push-up", muscle: "Pectoraux · Triceps", series: 4, reps: "8-12", repos: 90, conseil: "Augmente le volume. Essaie les push-ups diamant pour plus d'intensité." },
            { img: IMG.pike_pushup, nom: "Pike Push-up", muscle: "Épaules", series: 3, reps: "8-10", repos: 90, conseil: "Progresse vers un angle plus vertical des hanches." },
            { img: IMG.hollow_body, nom: "Hollow Body Hold", muscle: "Core", series: 3, reps: "25 sec", repos: 60, conseil: "Augmente la durée de 5 secondes chaque semaine." },
          ]
        },
        {
          jour: "Jour B",
          label: "Pull + Jambes",
          exercices: [
            { img: IMG.pullup, nom: "Pull-up assisté", muscle: "Dos · Biceps", series: 3, reps: "3-5", repos: 120, conseil: "Utilise une bande élastique ou saute. Contrôle la descente pendant 3-4 secondes." },
            { img: IMG.australian_row, nom: "Australian Row", muscle: "Dos moyen", series: 3, reps: "10-12", repos: 90, conseil: "Incline le corps plus horizontal pour augmenter la difficulté." },
            { img: IMG.pistol_squat, nom: "Pistol Squat partiel", muscle: "Jambes · Équilibre", series: 3, reps: "5/jambe", repos: 90, conseil: "Descends à 45° seulement. Tiens un support. Progresse vers l'amplitude complète." },
          ]
        },
        {
          jour: "Jour C",
          label: "Full Body",
          exercices: [
            { img: IMG.dips, nom: "Dips sur chaise", muscle: "Triceps · Épaules", series: 3, reps: "8-12", repos: 90, conseil: "Mains sur une chaise stable, jambes tendues. Descends jusqu'à 90°." },
            { img: IMG.jump_squat, nom: "Jump Squat", muscle: "Jambes · Cardio", series: 4, reps: "10", repos: 90, conseil: "Augmente la hauteur de saut. Atterrissage silencieux = absorption maximale." },
            { img: IMG.glute_bridge, nom: "Single Leg Bridge", muscle: "Fessiers", series: 3, reps: "10/jambe", repos: 60, conseil: "Une jambe tendue. Hanches très hautes. Contracte fort le fessier actif." },
          ]
        }
      ]
    },
    {
      label: "Semaines 5-6 — Intensification",
      seances: [
        {
          jour: "Jour A",
          label: "Push Upper",
          exercices: [
            { img: IMG.archer_pushup, nom: "Archer Push-up", muscle: "Pectoraux (unilatéral)", series: 3, reps: "5/côté", repos: 120, conseil: "Un bras fait le push-up, l'autre s'étend. Progression vers le one-arm push-up." },
            { img: IMG.pike_pushup, nom: "Pike Push-up profond", muscle: "Épaules", series: 4, reps: "10-12", repos: 90, conseil: "Hanches à 90°. Tête presque au sol." },
            { img: IMG.dips, nom: "Dips parallèles", muscle: "Triceps · Pecs bas", series: 3, reps: "8-10", repos: 90, conseil: "Légère inclinaison avant pour les pectoraux. Droit pour les triceps." },
          ]
        },
        {
          jour: "Jour B",
          label: "Pull Upper",
          exercices: [
            { img: IMG.pullup, nom: "Pull-up", muscle: "Dos · Biceps", series: 4, reps: "4-6", repos: 120, conseil: "Amplitude complète — bras tendus en bas, menton au-dessus de la barre en haut." },
            { img: IMG.australian_row, nom: "Australian Row — pieds levés", muscle: "Dos haut", series: 3, reps: "10", repos: 90, conseil: "Pieds sur une chaise pour plus de difficulté. Tire la barre vers le sternum." },
            { img: IMG.lsit, nom: "L-Sit (progressif)", muscle: "Core · Hip flexors", series: 3, reps: "10 sec", repos: 90, conseil: "Commence avec une jambe tendue seulement. Les deux jambes vient avec le temps." },
          ]
        },
        {
          jour: "Jour C",
          label: "Legs + Core",
          exercices: [
            { img: IMG.pistol_squat, nom: "Pistol Squat", muscle: "Jambes complètes", series: 3, reps: "5/jambe", repos: 120, conseil: "Amplitude complète maintenant. Bras tendus pour le contre-poids." },
            { img: IMG.jump_squat, nom: "Jump Squat explosif", muscle: "Explosivité", series: 4, reps: "8", repos: 90, conseil: "Maximum d'explosivité. Tu transformes ta force en puissance." },
            { img: IMG.hollow_body, nom: "Hollow Body Rock", muscle: "Core complet", series: 3, reps: "10 rocks", repos: 60, conseil: "Balance d'avant en arrière en maintenant la forme creuse. Bras et jambes fixes." },
          ]
        }
      ]
    },
    {
      label: "Semaines 7-8 — Skill Introduction",
      seances: [
        {
          jour: "Jour A",
          label: "Push + Skill",
          exercices: [
            { img: IMG.hspu, nom: "HSPU contre mur", muscle: "Épaules · Triceps", series: 3, reps: "3-5", repos: 120, conseil: "Dos au mur en premier pour apprendre l'équilibre. Descends lentement." },
            { img: IMG.archer_pushup, nom: "Archer Push-up", muscle: "Force unilatérale", series: 4, reps: "6/côté", repos: 90, conseil: "Tu construis la base du one-arm push-up futur." },
            { img: IMG.dips, nom: "Dips lestés (option)", muscle: "Triceps", series: 3, reps: "8", repos: 90, conseil: "Ajoute un sac à dos si les dips deviennent trop faciles." },
          ]
        },
        {
          jour: "Jour B",
          label: "Pull + Skill",
          exercices: [
            { img: IMG.pullup, nom: "Pull-up", muscle: "Dos · Biceps", series: 5, reps: "5", repos: 120, conseil: "Tu approches du niveau intermédiaire. 10 pull-ups consécutifs = passage de niveau." },
            { img: IMG.muscle_up, nom: "Muscle-up (phase 1)", muscle: "Full upper body", series: 3, reps: "Transition seule", repos: 120, conseil: "Commence par les dips sur barre après chaque traction. Apprends la transition." },
            { img: IMG.front_lever, nom: "Front Lever Tuck", muscle: "Dos · Core", series: 3, reps: "8 sec", repos: 90, conseil: "Jambes repliées sur la poitrine. Corps horizontal. C'est la base du Front Lever." },
          ]
        },
        {
          jour: "Jour C",
          label: "Test & Récup",
          exercices: [
            { img: IMG.pistol_squat, nom: "Pistol Squat max", muscle: "Force jambes", series: 1, reps: "Max/jambe", repos: 120, conseil: "Compte ton max — note le progrès sur 8 semaines!" },
            { img: IMG.pullup, nom: "Pull-up max", muscle: "Force dos", series: 1, reps: "Max", repos: 120, conseil: "Ton vrai max sans assistance. 10+ = programme intermédiaire débloqué!" },
            { img: IMG.hollow_body, nom: "Hollow Body max", muscle: "Core", series: 1, reps: "Max secondes", repos: 60, conseil: "60 sec = core de niveau intermédiaire." },
          ]
        }
      ]
    }
  ]
};

// ─── DONNÉES PROGRAMME CALISTHENICS INTERMÉDIAIRE ───
const CALI_INTERMEDIAIRE = {
  id: "cali_intermediaire_v2",
  nom: "Programme Intermédiaire",
  niveau: "⚡ Intermédiaire",
  duree: "10 semaines",
  jours: "4 jours/semaine",
  description: "Skills avancés — Muscle-up, Front Lever, Pistol Squat, HSPU",
  couleur: "#c084fc",
  semaines: [
    {
      label: "Phase 1 — Force de base (Sem. 1-3)",
      seances: [
        {
          jour: "Lundi",
          label: "Push Day",
          exercices: [
            { img: IMG.hspu, nom: "HSPU contre mur", muscle: "Épaules · Triceps", series: 4, reps: "5-7", repos: 120, conseil: "Négatives lentes si pas encore capable. Descente en 4 sec." },
            { img: IMG.archer_pushup, nom: "Archer Push-up", muscle: "Pecs · Force unilat.", series: 4, reps: "6/côté", repos: 90, conseil: "Travaille vers le one-arm push-up. Chaque côté de façon indépendante." },
            { img: IMG.dips, nom: "Dips parallèles", muscle: "Triceps · Pecs bas", series: 4, reps: "10-12", repos: 90, conseil: "Ajoute du lest si trop facile. Amplitude maximale." },
            { img: IMG.pike_pushup, nom: "Pike Push-up élevé", muscle: "Épaules", series: 3, reps: "12", repos: 60, conseil: "Finisher — corps presque vertical." },
          ]
        },
        {
          jour: "Mardi",
          label: "Pull Day",
          exercices: [
            { img: IMG.pullup, nom: "Pull-up lestés", muscle: "Dos · Biceps", series: 5, reps: "5", repos: 150, conseil: "5 reps × 5 séries = classique force pure. Ajoute 2.5kg à chaque semaine si possible." },
            { img: IMG.muscle_up, nom: "Muscle-up", muscle: "Full upper body", series: 4, reps: "3-5", repos: 150, conseil: "Faux grip + explosion. La transition est technique — regarde des tutoriels." },
            { img: IMG.front_lever, nom: "Front Lever Tuck avancé", muscle: "Dos · Core", series: 4, reps: "10-12 sec", repos: 120, conseil: "Une jambe tendue si Tuck trop facile. Corps parfaitement horizontal." },
            { img: IMG.lsit, nom: "L-Sit complet", muscle: "Core · Hip flexors", series: 3, reps: "15 sec", repos: 90, conseil: "Deux jambes tendues. Corps en L parfait. Épaules basses." },
          ]
        },
        {
          jour: "Jeudi",
          label: "Legs + Core",
          exercices: [
            { img: IMG.pistol_squat, nom: "Pistol Squat", muscle: "Jambes unilatéral", series: 5, reps: "6/jambe", repos: 120, conseil: "Ajoute du lest si 6 reps deviennent faciles — sac à dos, gilet lesté." },
            { img: IMG.jump_squat, nom: "Box Jump (ou Jump Squat)", muscle: "Explosivité", series: 4, reps: "8", repos: 90, conseil: "Maximum d'explosivité. La puissance plyométrique complète la force." },
            { img: IMG.hollow_body, nom: "Hollow Body Rock", muscle: "Core profond", series: 4, reps: "15 rocks", repos: 60, conseil: "20 rocks sans perdre la forme = core solide." },
            { img: IMG.glute_bridge, nom: "Nordic Curl (ou Glute Ham)", muscle: "Ischio-jambiers", series: 3, reps: "5", repos: 120, conseil: "Un des exercices les plus difficiles au poids du corps. Excentrique lent." },
          ]
        },
        {
          jour: "Vendredi",
          label: "Skills & Mobilité",
          exercices: [
            { img: IMG.hspu, nom: "HSPU libre (objectif)", muscle: "Épaules", series: 3, reps: "Max", repos: 150, conseil: "Essaie sans le mur. L'équilibre vient avec la pratique quotidienne." },
            { img: IMG.front_lever, nom: "Front Lever — jambe étendue", muscle: "Dos · Core", series: 4, reps: "6-8 sec", repos: 120, conseil: "Une jambe tendue, l'autre repliée. Tu approches du Full Front Lever." },
            { img: IMG.lsit, nom: "Manna Progression", muscle: "Core · Compression", series: 3, reps: "8 sec", repos: 90, conseil: "Penche légèrement en avant depuis le L-Sit. Pousse le sol fort." },
            { img: IMG.cars_shoulder, nom: "CARs récupération", muscle: "Mobilité", series: 1, reps: "5 min", repos: 0, conseil: "Finir par la mobilité articulaire. Ton corps te remerciera." },
          ]
        }
      ]
    },
    {
      label: "Phase 2 — Skills (Sem. 4-7)",
      seances: [
        {
          jour: "Lundi",
          label: "Push + HSPU",
          exercices: [
            { img: IMG.hspu, nom: "HSPU libre progression", muscle: "Épaules · Triceps", series: 5, reps: "3-5", repos: 180, conseil: "La patience est la clé. 1 HSPU libre = niveau avancé débloqué." },
            { img: IMG.archer_pushup, nom: "One-Arm Push-up (négatif)", muscle: "Pecs · Force max", series: 3, reps: "3/côté", repos: 150, conseil: "Descends sur un bras, remonte sur deux. Renforce unilatéralement." },
            { img: IMG.dips, nom: "Dips explosifs", muscle: "Triceps · Puissance", series: 4, reps: "8", repos: 90, conseil: "Explose vers le haut. La plyométrie sur les dips = puissance pour le muscle-up." },
          ]
        },
        {
          jour: "Mardi",
          label: "Pull + Muscle-up",
          exercices: [
            { img: IMG.muscle_up, nom: "Muscle-up strict", muscle: "Full upper body", series: 5, reps: "3", repos: 180, conseil: "Strict = pas d'élan. C'est le vrai test. Prends ton temps entre les reps." },
            { img: IMG.pullup, nom: "Pull-up supination", muscle: "Biceps · Dos", series: 4, reps: "8", repos: 120, conseil: "Prise inversée (paumes vers toi). Isole davantage les biceps." },
            { img: IMG.front_lever, nom: "Full Front Lever (objectif)", muscle: "Dos complet", series: 4, reps: "3-5 sec", repos: 150, conseil: "Corps parfaitement horizontal, bras tendus. Le Saint Graal du calisthenics." },
          ]
        },
        {
          jour: "Jeudi",
          label: "Legs · Puissance",
          exercices: [
            { img: IMG.pistol_squat, nom: "Pistol Squat lestés", muscle: "Force jambes", series: 5, reps: "5/jambe", repos: 120, conseil: "+5kg en sac à dos. La force jambes soutient tous les autres skills." },
            { img: IMG.jump_squat, nom: "Depth Jump", muscle: "Explosivité max", series: 5, reps: "5", repos: 120, conseil: "Tombe d'une box et resaute immédiatement. Réaction au sol ultra rapide." },
            { img: IMG.hollow_body, nom: "Dragon Flag partiel", muscle: "Core extrême", series: 3, reps: "5", repos: 120, conseil: "Le Bruce Lee. Descends les jambes lentement depuis la position inversée." },
          ]
        },
        {
          jour: "Vendredi",
          label: "Skills libres",
          exercices: [
            { img: IMG.hspu, nom: "HSPU — volume", muscle: "Épaules", series: 3, reps: "Max", repos: 120, conseil: "Compte tes reps. Note la progression semaine par semaine." },
            { img: IMG.front_lever, nom: "Front Lever — max tenu", muscle: "Dos", series: 3, reps: "Max sec", repos: 150, conseil: "Tiens le plus longtemps possible. Note le temps." },
            { img: IMG.lsit, nom: "L-Sit — max tenu", muscle: "Core", series: 3, reps: "Max sec", repos: 90, conseil: "Objectif: 30 secondes continues." },
          ]
        }
      ]
    }
  ]
};

// ─── DONNÉES PROGRAMME GROSSESSE ───
const GROSSESSE_PROGRAMMES = {
  prenatal: {
    id: "prenatal",
    nom: "Prénatal — Trimestres 1, 2, 3",
    couleur: "#f9a8d4",
    icone: "🤰",
    avertissement: "⚠️ Consulte ton médecin ou sage-femme avant de commencer tout programme d'exercices pendant la grossesse.",
    description: "Exercices doux et sécurisés pour maintenir ta forme, soulager les douleurs et préparer ton corps à l'accouchement.",
    trimestres: [
      {
        label: "1er Trimestre (0-13 sem.)",
        focus: "Énergie & nausées",
        conseils: ["Écoute ton corps — arrête si fatigue excessive", "Hydratation maximale", "Évite la chaleur excessive", "Pas d'exercices à plat ventre"],
        exercices: [
          { nom: "Marche douce", duree: "20-30 min", desc: "Meilleur exercice du 1er trimestre. Maintient la cardio sans impact.", emoji: "🚶‍♀️" },
          { nom: "Squats profonds", duree: "3 × 10", desc: "Prépare le bassin pour l'accouchement. Ouvre les hanches progressivement.", emoji: "🏋️‍♀️" },
          { nom: "Exercices de Kegel", duree: "3 × 15 contractions", desc: "Renforce le plancher pelvien. Essentiel pour la prévention des fuites urinaires.", emoji: "💪" },
          { nom: "Cat-Cow (Yoga)", duree: "10 rep", desc: "Soulage les douleurs lombaires dès le début. Mobilise la colonne doucement.", emoji: "🧘‍♀️" },
          { nom: "Étirement hip flexor", duree: "60 sec/côté", desc: "Le bassin change dès la semaine 6. Cet étirement prévient les douleurs.", emoji: "🤸‍♀️" },
        ]
      },
      {
        label: "2ème Trimestre (14-26 sem.)",
        focus: "Force & stabilité",
        conseils: ["Évite de rester allongée sur le dos > 90 sec", "Ceinture de soutien si douleurs lombaires", "Intensité modérée seulement — tu dois pouvoir parler"],
        exercices: [
          { nom: "Squat avec support", duree: "4 × 12", desc: "Le ventre grossit — utilise un mur ou une chaise. Renforcé les jambes.", emoji: "🏋️‍♀️" },
          { nom: "Bird-Dog", duree: "3 × 10/côté", desc: "À quatre pattes, bras et jambe opposés. Stabilise le core sans pression abdominale.", emoji: "🐕" },
          { nom: "Side-lying clam", duree: "3 × 15/côté", desc: "Allongée sur le côté, ouvre les genoux. Renforce les abducteurs et fessiers.", emoji: "🦀" },
          { nom: "Wall Push-up", duree: "3 × 12", desc: "Push-up debout contre le mur. Maintient la force du haut du corps.", emoji: "👊" },
          { nom: "Natation / Aquagym", duree: "30 min", desc: "Idéal au 2e trimestre. Portance de l'eau soulage le poids du ventre.", emoji: "🏊‍♀️" },
          { nom: "Kegel renforcés", duree: "5 × 10 contractions", desc: "Contractions + relâchements lents. Prépare l'accouchement.", emoji: "💪" },
        ]
      },
      {
        label: "3ème Trimestre (27-40 sem.)",
        focus: "Préparation accouchement",
        conseils: ["Réduction de l'intensité obligatoire", "Stop si contractions, essoufflement, douleurs", "Priorité au repos et au sommeil"],
        exercices: [
          { nom: "Marche quotidienne", duree: "15-20 min", desc: "Continue jusqu'à la fin si possible. Favorise la descente du bébé.", emoji: "🚶‍♀️" },
          { nom: "Deep squat hold", duree: "30-60 sec × 5", desc: "Ouvre le périnée et le bassin pour l'accouchement. Très recommandé les dernières semaines.", emoji: "🧎‍♀️" },
          { nom: "Bouncing sur ballon", duree: "10-15 min", desc: "Soulage la pression pelvienne. Aide à positionner bébé.", emoji: "⚽" },
          { nom: "Yoga prénatal", duree: "20-30 min", desc: "Postures adaptées. Focus sur la respiration et la relaxation. Prépare mentalement.", emoji: "🧘‍♀️" },
          { nom: "Kegel + visualisation", duree: "10 min", desc: "Contracte et RELÂCHE profondément. Apprendre à relâcher est clé pour l'accouchement.", emoji: "🌸" },
        ]
      }
    ]
  },
  postnatal: {
    id: "postnatal",
    nom: "Post-partum — Récupération",
    couleur: "#86efac",
    icone: "👶",
    avertissement: "⚠️ Attends le feu vert de ton médecin (6 semaines minimum, plus pour césarienne). Ne force jamais.",
    description: "Récupération douce et progressive. Respecte ton corps qui vient d'accomplir quelque chose d'extraordinaire.",
    phases: [
      {
        label: "Phase 1 — Semaines 1-6",
        soustitre: "Récupération & Fondations",
        focus: "Cicatrisation · Plancher pelvien · Énergie",
        exercices: [
          { nom: "Respiration diaphragmatique", duree: "5 min × 3/jour", desc: "Reconnecte le core profond. Inspire par le nez, ventre qui gonfle, expire lentement.", emoji: "🌬️" },
          { nom: "Kegel très doux", duree: "10 contractions × 4/jour", desc: "Commence dès le lendemain si accouchement vaginal. Doux et progressif.", emoji: "💜" },
          { nom: "Marche très courte", duree: "5-10 min", desc: "Commence dès J3-5. Augmente de 5 min chaque semaine.", emoji: "🚶‍♀️" },
          { nom: "Étirements doux", duree: "10-15 min", desc: "Cou, épaules, dos. La position d'allaitement crée des tensions importantes.", emoji: "🧘‍♀️" },
        ]
      },
      {
        label: "Phase 2 — Semaines 6-12",
        soustitre: "Reconstruction",
        focus: "Force · Retour progressif",
        exercices: [
          { nom: "Glute Bridge", duree: "3 × 12", desc: "Premier exercice de renforcement post-partum. Réactive les fessiers et stabilise le bassin.", emoji: "🌉" },
          { nom: "Bird-Dog", duree: "3 × 10/côté", desc: "Reconstruit la stabilité lombaire sans pression sur la cicatrice.", emoji: "🐕" },
          { nom: "Side-lying exercises", duree: "3 × 15/côté", desc: "Abducteurs et fessiers allongée sur le côté. Doux et efficace.", emoji: "🦀" },
          { nom: "Marche active", duree: "20-30 min", desc: "Marchons maintenant avec intention — cardio de base qui revient.", emoji: "🚶‍♀️" },
          { nom: "Wall sit doux", duree: "3 × 20 sec", desc: "Isométrique — pas de mouvement. Réactive les quadriceps progressivement.", emoji: "🏔️" },
        ]
      },
      {
        label: "Phase 3 — Mois 3-6",
        soustitre: "Retour au sport",
        focus: "Force · Cardio · Forme",
        exercices: [
          { nom: "Squat complet", duree: "4 × 12", desc: "Retour aux squats progressifs. Vérifie l'absence de diastase abdominale d'abord.", emoji: "🏋️‍♀️" },
          { nom: "Push-up progressif", duree: "3 × 8-12", desc: "Genoux d'abord, puis pieds. Le haut du corps était très sollicité par l'allaitement.", emoji: "💪" },
          { nom: "Running (si OK médecin)", duree: "Marche/course alternée", desc: "Commence par 1 min course / 2 min marche. Augmente sur 4-6 semaines.", emoji: "🏃‍♀️" },
          { nom: "Yoga / Pilates postnatal", duree: "30-45 min", desc: "Idéal pour reconnecter corps et esprit. Spécifique post-partum.", emoji: "🧘‍♀️" },
          { nom: "Diastase — exercices spécifiques", duree: "10 min/jour", desc: "Si diastase (séparation abdominale) — des exercices spécifiques sont nécessaires.", emoji: "⚠️" },
        ]
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — LONGÉVITÉ ARTICULAIRE
// ─────────────────────────────────────────────────────────
// INTÉGRATION dans App.js:
// 1. Ajoute dans le Dashboard: onLongevite={()=>setScreen("longevite")}
// 2. Ajoute dans le back handler: ||screen==="longevite"
// 3. Ajoute dans le return: {screen==="longevite" && <LongeviteArticulaire user={user} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} t={t}/>}

import { useState } from "react";

const EM2="#00ff88", GOLD2="#e2b84a", MUT2="#4a6e52";
const CARD2="#0c1810", BDR2="#192c1d";
const TEAL="#14b8a6";
const PINK="#f472b6";
const PURPLE2="#a855f7";

export function LongeviteArticulaire({ user, onPaywall, onHome, t }) {
  const [tab, setTab] = useState("bas"); // "bas" | "haut"
  const [selected, setSelected] = useState(null);
  const isPremium = user?.plan === "premium";

  const exercices = tab === "bas" ? LONGEVITE_BAS : LONGEVITE_HAUT;

  if (selected) {
    const ex = selected;
    const locked = !ex.gratuit && !isPremium;
    return (
      <div style={{ minHeight: "100vh", paddingBottom: 90, overflowY: "auto", background: "#060d08" }}>
        <div style={{ padding: "52px 20px 16px", background: `radial-gradient(ellipse at 50% 0%, ${TEAL}15 0%, #060d08 70%)` }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Retour</button>
          <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 16, background: CARD2, border: `1px solid ${BDR2}` }}>
            <img src={ex.img} alt={ex.nom} style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center top" }} onError={e => { e.target.style.display = "none"; }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ background: `${TEAL}20`, color: TEAL, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{ex.cible}</span>
            <span style={{ background: `${GOLD2}20`, color: GOLD2, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>⏱ {ex.duree}</span>
            <span style={{ background: `${EM2}15`, color: EM2, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{ex.freq}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>{ex.nom}</div>
          <div style={{ color: MUT2, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{ex.desc}</div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {locked ? (
            <div style={{ background: `${GOLD2}10`, border: `1px solid ${GOLD2}30`, borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: GOLD2, marginBottom: 4 }}>Exercice Premium</div>
              <div style={{ color: MUT2, fontSize: 13, marginBottom: 16 }}>Débloque les 15 exercices restants avec Premium</div>
              <button onClick={onPaywall} style={{ width: "100%", background: `linear-gradient(135deg, ${GOLD2}, #f59e0b)`, color: "#0a0a0a", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✨ Débloquer — 7,99$/mois</button>
            </div>
          ) : (
            <>
              <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: TEAL, fontWeight: 700, marginBottom: 8 }}>💡 CONSEIL TECHNIQUE</div>
                <div style={{ color: "#d1fae5", fontSize: 13, lineHeight: 1.7 }}>{ex.conseil}</div>
              </div>
              <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: GOLD2, fontWeight: 700, marginBottom: 8 }}>🔬 POURQUOI ÇA MARCHE</div>
                <div style={{ color: "#fef3c7", fontSize: 13, lineHeight: 1.7 }}>{ex.pourquoi}</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 90, overflowY: "auto", background: "#060d08" }}>
      <div style={{ padding: "52px 20px 16px", background: `radial-gradient(ellipse at 50% 0%, ${TEAL}20 0%, #060d08 70%)` }}>
        <button onClick={onHome} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Retour</button>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🦴</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>Longévité Articulaire</div>
        <div style={{ color: MUT2, fontSize: 13, marginBottom: 16 }}>Pas du fitness — de la longévité physique 🥷</div>
        <div style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: TEAL, lineHeight: 1.6 }}>Tes articulations n'ont pas d'apport direct en sang. Elles dépendent du mouvement en amplitude complète pour rester en santé. Ces exercices ciblent précisément les positions que la majorité évite.</div>
        </div>
        {!isPremium && (
          <div style={{ background: `${GOLD2}10`, border: `1px solid ${GOLD2}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: GOLD2, fontWeight: 700 }}>3 gratuits · 15 Premium 🔒</div>
              <div style={{ fontSize: 11, color: MUT2 }}>Débloque les 18 exercices complets</div>
            </div>
            <button onClick={onPaywall} style={{ background: `${GOLD2}20`, color: GOLD2, border: `1px solid ${GOLD2}40`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Débloquer →</button>
          </div>
        )}
        <div style={{ display: "flex", background: CARD2, borderRadius: 12, padding: 4, gap: 4 }}>
          {[["bas", "🦵 Bas du corps"], ["haut", "💪 Haut du corps"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: tab === key ? TEAL : "none", color: tab === key ? "#0a0a0a" : MUT2, border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        {tab === "bas" && (
          <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 4 }}>ROUTINE RECOMMANDÉE</div>
            <div style={{ fontSize: 12, color: MUT2, lineHeight: 1.8 }}>
              📅 <strong style={{ color: "#edf5ef" }}>Quotidien</strong> — Deep Squat + Seiza + Hanging<br />
              🗓 <strong style={{ color: "#edf5ef" }}>3x/sem</strong> — Bear Crawl + Cossack + Sumo<br />
              ⚡ <strong style={{ color: "#edf5ef" }}>Toujours</strong> — CARs matin ou soir
            </div>
          </div>
        )}
        {tab === "haut" && (
          <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 4 }}>ROUTINE HAUT DU CORPS</div>
            <div style={{ fontSize: 12, color: MUT2, lineHeight: 1.8 }}>
              📅 <strong style={{ color: "#edf5ef" }}>Quotidien</strong> — Wrist + Elbow + Neck CARs<br />
              🗓 <strong style={{ color: "#edf5ef" }}>3x/sem</strong> — Shoulder Dislocate + Thoracic<br />
              ⚡ <strong style={{ color: "#edf5ef" }}>Avant sport</strong> — 5 min suffit
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exercices.map((ex, i) => {
            const locked = !ex.gratuit && !isPremium;
            return (
              <button key={ex.id} onClick={() => setSelected(ex)} style={{ background: CARD2, border: `1px solid ${locked ? BDR2 : TEAL + "40"}`, borderRadius: 16, padding: 0, cursor: "pointer", textAlign: "left", overflow: "hidden", opacity: locked ? 0.8 : 1 }}>
                <div style={{ display: "flex", gap: 0 }}>
                  <div style={{ width: 90, height: 90, flexShrink: 0, background: "#0a0a0a", position: "relative" }}>
                    <img src={ex.img} alt={ex.nom} style={{ width: 90, height: 90, objectFit: "cover", objectPosition: "center top" }} onError={e => { e.target.style.display = "none"; }} />
                    {locked && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔒</div>}
                    {!locked && i < 3 && <div style={{ position: "absolute", top: 4, left: 4, background: `${EM2}20`, color: EM2, borderRadius: 6, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>FREE</div>}
                  </div>
                  <div style={{ flex: 1, padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: locked ? MUT2 : "#edf5ef", marginBottom: 2 }}>{ex.nom}</div>
                    <div style={{ fontSize: 11, color: TEAL, marginBottom: 4 }}>{ex.cible}</div>
                    <div style={{ fontSize: 11, color: MUT2, lineHeight: 1.5 }} >{ex.desc.substring(0, 60)}...</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span style={{ background: `${GOLD2}15`, color: GOLD2, borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>{ex.duree}</span>
                      <span style={{ background: `${EM2}10`, color: EM2, borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>{ex.freq}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COMPOSANT — CALISTHENICS COACH UPGRADÉ
// ─────────────────────────────────────────────────────────
// Remplace ton CoachCali existant par celui-ci dans App.js
// INTÉGRATION: même props que l'ancien

export function CoachCaliV2({ user, profile, onPaywall, onHome, onCoinsEarned, lang, t }) {
  const [step, setStep] = useState("onboarding");
  const [niveau, setNiveau] = useState("debutant");
  const [selectedProg, setSelectedProg] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [activeSeance, setActiveSeance] = useState(0);
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem("vs_cali_done_v2") || "{}"); } catch { return {}; } });
  const [timerKey, setTimerKey] = useState(null);
  const [timerSec, setTimerSec] = useState(null);

  const isPremium = user?.plan === "premium";
  const PURPLE = "#c084fc";

  const toggleDone = (key) => {
    const nd = { ...done, [key]: !done[key] };
    setDone(nd);
    localStorage.setItem("vs_cali_done_v2", JSON.stringify(nd));
  };

  const startTimer = (sec, key) => {
    setTimerSec(sec);
    setTimerKey(key);
    const iv = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) { clearInterval(iv); setTimerKey(null); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  if (!isPremium && !user?.isDemo) return (
    <div style={{ minHeight: "100vh", padding: "52px 20px 80px" }}>
      <button onClick={onHome} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13, marginBottom: 22 }}>← Retour</button>
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🤸</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: "#edf5ef" }}>Coach Calisthenics</div>
        <div style={{ color: MUT2, fontSize: 14, marginBottom: 8 }}>Programmes Débutant & Intermédiaire</div>
        <div style={{ color: MUT2, fontSize: 13, marginBottom: 24 }}>Push-up → Muscle-up → Front Lever → HSPU</div>
        <button onClick={onPaywall} style={{ width: "100%", background: `linear-gradient(135deg,#7c3aed,#a855f7)`, color: "white", border: "none", borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✨ Débloquer Premium — 7,99$/mois</button>
      </div>
    </div>
  );

  if (step === "onboarding") return (
    <div style={{ minHeight: "100vh", padding: "52px 20px 80px", overflowY: "auto" }}>
      <button onClick={onHome} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13, marginBottom: 22 }}>← Retour</button>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>🤸 Coach Calisthenics</div>
      <div style={{ color: MUT2, fontSize: 13, marginBottom: 24 }}>Poids du corps · Progressions vers les skills</div>
      <div style={{ fontSize: 11, color: MUT2, fontWeight: 700, letterSpacing: .8, marginBottom: 8 }}>TON NIVEAU ACTUEL</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["debutant", "🌱", "Débutant", "< 5 tractions", TEAL], ["intermediaire", "⚡", "Intermédiaire", "10+ tractions", PURPLE2]].map(([k, ic, lb, sub, col]) => (
          <button key={k} onClick={() => setNiveau(k)} style={{ flex: 1, background: niveau === k ? `${col}15` : CARD2, border: `2px solid ${niveau === k ? col : BDR2}`, borderRadius: 16, padding: "18px 8px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{ic}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: niveau === k ? col : "#edf5ef" }}>{lb}</div>
            <div style={{ fontSize: 11, color: MUT2, marginTop: 4 }}>{sub}</div>
          </button>
        ))}
      </div>
      <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: PURPLE2, fontWeight: 700, marginBottom: 8 }}>🎯 {niveau === "debutant" ? "PROGRAMME DÉBUTANT — 8 SEMAINES" : "PROGRAMME INTERMÉDIAIRE — 10 SEMAINES"}</div>
        <div style={{ color: MUT2, fontSize: 13, lineHeight: 1.7 }}>
          {niveau === "debutant" ? "Construis ta base avec Push-up, Pull-up, Plank, Pistol Squat. Termine capable de 10 pull-ups et d'introduire les skills." : "Maîtrise le Muscle-up, Front Lever, HSPU et Pistol Squat lesté. Programme 4 jours/semaine."}
        </div>
      </div>
      <button onClick={() => { setSelectedProg(niveau === "debutant" ? CALI_DEBUTANT : CALI_INTERMEDIAIRE); setStep("programme"); }}
        style={{ width: "100%", background: `linear-gradient(135deg,#7c3aed,#a855f7)`, color: "white", border: "none", borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        🤸 Générer mon programme →
      </button>
    </div>
  );

  if (step === "programme" && selectedProg) {
    const prog = selectedProg;
    const phase = prog.semaines[activePhase];
    const seance = phase?.seances[activeSeance];

    return (
      <div style={{ minHeight: "100vh", paddingBottom: 100, overflowY: "auto", background: "#060d08" }}>
        <div style={{ padding: "52px 20px 16px", background: `radial-gradient(ellipse at 50% 0%, ${PURPLE2}15 0%, #060d08 70%)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <button onClick={onHome} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13 }}>← Retour</button>
            <button onClick={() => setStep("onboarding")} style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: 8, padding: "5px 10px", color: MUT2, fontSize: 11, cursor: "pointer" }}>Changer niveau</button>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#edf5ef", marginTop: 12 }}>{prog.nom}</div>
          <div style={{ color: MUT2, fontSize: 12, marginBottom: 12 }}>{prog.description}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: `${PURPLE2}20`, color: PURPLE2, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>{prog.niveau}</span>
            <span style={{ background: `${PURPLE2}20`, color: PURPLE2, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>{prog.jours}</span>
            <span style={{ background: `${PURPLE2}20`, color: PURPLE2, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>{prog.duree}</span>
          </div>

          <div style={{ marginTop: 14, overflowX: "auto", display: "flex", gap: 6, paddingBottom: 4 }}>
            {prog.semaines.map((ph, pi) => (
              <button key={pi} onClick={() => { setActivePhase(pi); setActiveSeance(0); }}
                style={{ flexShrink: 0, background: activePhase === pi ? `${PURPLE2}20` : CARD2, border: `1.5px solid ${activePhase === pi ? PURPLE2 : BDR2}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer" }}>
                <div style={{ fontSize: 10, color: activePhase === pi ? PURPLE2 : MUT2, fontWeight: 700, whiteSpace: "nowrap" }}>{ph.label}</div>
              </button>
            ))}
          </div>

          {phase && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
              {phase.seances.map((s, si) => (
                <button key={si} onClick={() => setActiveSeance(si)}
                  style={{ flexShrink: 0, background: activeSeance === si ? `${prog.couleur}20` : CARD2, border: `1.5px solid ${activeSeance === si ? prog.couleur : BDR2}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}>
                  <div style={{ fontWeight: 700, fontSize: 10, color: activeSeance === si ? prog.couleur : MUT2 }}>{s.jour}</div>
                  <div style={{ fontSize: 9, color: MUT2, marginTop: 1 }}>{s.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {seance && (
          <div style={{ padding: "12px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#edf5ef", marginBottom: 12 }}>💪 {seance.label}</div>
            {seance.exercices.map((ex, ei) => {
              const doneKey = `${prog.id}_${activePhase}_${activeSeance}_${ei}`;
              const isAllDone = Array.from({ length: ex.series }, (_, si) => done[`${doneKey}_${si}`]).every(Boolean);
              return (
                <div key={ei} style={{ background: isAllDone ? `${EM2}08` : CARD2, border: `1px solid ${isAllDone ? EM2 + "30" : BDR2}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 12, background: "#0a0a0a", flexShrink: 0, overflow: "hidden" }}>
                      <img src={ex.img} alt={ex.nom} style={{ width: 80, height: 80, objectFit: "cover", objectPosition: "center top" }} onError={e => { e.target.style.display = "none"; }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: isAllDone ? MUT2 : "#edf5ef", marginBottom: 4 }}>{ex.nom}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ background: `${PURPLE2}15`, color: PURPLE2, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{ex.muscle}</span>
                        <span style={{ background: `${EM2}12`, color: EM2, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{ex.series}×{ex.reps}</span>
                      </div>
                      <div style={{ fontSize: 11, color: MUT2, marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>💡 {ex.conseil}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Array.from({ length: ex.series }, (_, si) => {
                      const sk = `${doneKey}_${si}`;
                      const sd = !!done[sk];
                      const tkey = `t_${sk}`;
                      const isTimer = timerKey === tkey && timerSec > 0;
                      return (
                        <div key={si} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <button onClick={() => { toggleDone(sk); if (!sd && ex.repos) startTimer(ex.repos, tkey); }}
                            style={{ width: 44, height: 44, borderRadius: 10, background: sd ? `${EM2}20` : "#0a140c", border: `2px solid ${sd ? EM2 : isTimer ? GOLD2 : BDR2}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: sd ? EM2 : MUT2 }}>S{si + 1}</div>
                            <div style={{ fontSize: 16 }}>{sd ? "✅" : "○"}</div>
                          </button>
                          <div style={{ fontSize: 9, color: isTimer ? GOLD2 : MUT2, fontWeight: isTimer ? 700 : 400 }}>
                            {isTimer ? `${timerSec}s` : ex.repos ? `${ex.repos}s` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────
// COMPOSANT — MODULE GROSSESSE (à intégrer dans CoachGym)
// ─────────────────────────────────────────────────────────
// INTÉGRATION dans CoachGym existant:
// Ajoute un objectif "grossesse" dans la liste des objectifs du CoachGym
// puis rends <GrossesseModule> quand cet objectif est sélectionné

export function GrossesseModule({ onHome }) {
  const [tab, setTab] = useState("prenatal"); // "prenatal" | "postnatal"
  const [expanded, setExpanded] = useState(null);

  const prog = GROSSESSE_PROGRAMMES[tab];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 90, overflowY: "auto", background: "#060d08" }}>
      <div style={{ padding: "52px 20px 16px", background: `radial-gradient(ellipse at 50% 0%, ${PINK}18 0%, #060d08 70%)` }}>
        <button onClick={onHome} style={{ background: "none", border: "none", color: MUT2, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Retour</button>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🤰</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>Maternité & Mouvement</div>
        <div style={{ color: MUT2, fontSize: 13, marginBottom: 16 }}>Exercices sécurisés pour la grossesse et la récupération post-partum</div>
        <div style={{ background: "#2d0a1a", border: `1px solid ${PINK}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: PINK, lineHeight: 1.6 }}>⚠️ Consulte toujours ton médecin ou sage-femme avant de commencer tout programme d'exercices pendant ou après la grossesse.</div>
        </div>
        <div style={{ display: "flex", background: CARD2, borderRadius: 12, padding: 4, gap: 4 }}>
          {[["prenatal", "🤰 Prénatal"], ["postnatal", "👶 Post-partum"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setExpanded(null); }}
              style={{ flex: 1, background: tab === key ? PINK : "none", color: tab === key ? "#fff" : MUT2, border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#edf5ef", marginBottom: 4 }}>{prog.nom}</div>
        <div style={{ color: MUT2, fontSize: 13, marginBottom: 16 }}>{prog.description}</div>

        {tab === "prenatal" && prog.trimestres.map((trim, ti) => (
          <div key={ti} style={{ marginBottom: 12 }}>
            <button onClick={() => setExpanded(expanded === ti ? null : ti)}
              style={{ width: "100%", background: expanded === ti ? `${PINK}15` : CARD2, border: `1.5px solid ${expanded === ti ? PINK : BDR2}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: expanded === ti ? PINK : "#edf5ef" }}>{trim.label}</div>
                <div style={{ fontSize: 12, color: MUT2, marginTop: 2 }}>Focus: {trim.focus}</div>
              </div>
              <div style={{ fontSize: 18, color: PINK }}>{expanded === ti ? "▲" : "▼"}</div>
            </button>
            {expanded === ti && (
              <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: "0 0 16px 16px", padding: 16, marginTop: -2 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: PINK, fontWeight: 700, marginBottom: 6 }}>⚠️ PRÉCAUTIONS</div>
                  {trim.conseils.map((c, ci) => (
                    <div key={ci} style={{ fontSize: 12, color: MUT2, marginBottom: 4 }}>• {c}</div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: PINK, fontWeight: 700, marginBottom: 8 }}>💪 EXERCICES</div>
                {trim.exercices.map((ex, exi) => (
                  <div key={exi} style={{ background: "#0a0a0a", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{ex.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#edf5ef" }}>{ex.nom}</div>
                          <span style={{ background: `${PINK}15`, color: PINK, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{ex.duree}</span>
                        </div>
                        <div style={{ fontSize: 12, color: MUT2, marginTop: 4, lineHeight: 1.5 }}>{ex.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {tab === "postnatal" && prog.phases.map((phase, pi) => (
          <div key={pi} style={{ marginBottom: 12 }}>
            <button onClick={() => setExpanded(expanded === pi ? null : pi)}
              style={{ width: "100%", background: expanded === pi ? `${EM2}10` : CARD2, border: `1.5px solid ${expanded === pi ? EM2 : BDR2}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: expanded === pi ? EM2 : "#edf5ef" }}>{phase.label}</div>
                <div style={{ fontSize: 12, color: MUT2, marginTop: 2 }}>{phase.soustitre} · {phase.focus}</div>
              </div>
              <div style={{ fontSize: 18, color: EM2 }}>{expanded === pi ? "▲" : "▼"}</div>
            </button>
            {expanded === pi && (
              <div style={{ background: CARD2, border: `1px solid ${BDR2}`, borderRadius: "0 0 16px 16px", padding: 16, marginTop: -2 }}>
                <div style={{ fontSize: 11, color: EM2, fontWeight: 700, marginBottom: 8 }}>💪 EXERCICES</div>
                {phase.exercices.map((ex, exi) => (
                  <div key={exi} style={{ background: "#0a0a0a", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{ex.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#edf5ef" }}>{ex.nom}</div>
                          <span style={{ background: `${EM2}15`, color: EM2, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{ex.duree}</span>
                        </div>
                        <div style={{ fontSize: 12, color: MUT2, marginTop: 4, lineHeight: 1.5 }}>{ex.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// INSTRUCTIONS D'INTÉGRATION COMPLÈTES DANS APP.JS
// ─────────────────────────────────────────────────────────
//
// ÉTAPE 1 — Imports en haut de App.js:
// import { LongeviteArticulaire, CoachCaliV2, GrossesseModule } from './vitascann_modules.js';
//
// ÉTAPE 2 — Ajouter "longevite" au back handler (ligne ~4950):
// else if(screen==="longevite") setScreen("dashboard");
//
// ÉTAPE 3 — Ajouter dans le Dashboard onLongevite prop (ligne ~5102):
// onLongevite={()=>setScreen("longevite")}
//
// ÉTAPE 4 — Ajouter les screens dans le return (après ligne ~5120):
// {screen==="longevite" && <LongeviteArticulaire user={user} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} t={t}/>}
//
// ÉTAPE 5 — Remplacer CoachCali par CoachCaliV2:
// {screen==="cali_coach" && user && <CoachCaliV2 user={user} profile={profile} onPaywall={()=>setScreen("paywall")} onHome={()=>setScreen("dashboard")} onCoinsEarned={amt=>addCoins(amt,"Coach Cali")} lang={lang} t={t}/>}
//
// ÉTAPE 6 — Dashboard: ajouter bouton Longévité Articulaire
// Dans le composant Dashboard, ajoute une card:
// <button onClick={onLongevite} style={{...}}>🦴 Longévité Articulaire</button>
//
// ÉTAPE 7 — Grossesse dans CoachGym:
// Ajoute ["grossesse","🤰","Maternité","Pré & post-partum"] dans la liste des objectifs
// Si objectif === "grossesse": return <GrossesseModule onHome={onHome}/>
//
// ÉTAPE 8 — Uploader les images sur Firebase Storage:
// Firebase Console > Storage > Nouveau dossier "exercises/"
// Upload toutes tes images Whisk avec les noms exacts du tableau IMG en haut de ce fichier
// Les URLs se génèrent automatiquement

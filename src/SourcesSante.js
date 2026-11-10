// SourcesSante.js — Sources affichées sous chaque résultat santé (règle Apple 1.4.1)
import React, { useState } from "react";

const MP = "https://medlineplus.gov/";

const GENERALES = [
  { nom: "NIH — Fiches vitamines et minéraux", url: "https://ods.od.nih.gov/factsheets/list-all/" },
  { nom: "Santé Canada — Guide alimentaire", url: "https://guide-alimentaire.canada.ca/fr/" },
  { nom: "MedlinePlus — Nutrition", url: MP + "nutrition.html" },
];

const PAR_ZONE = {
  nails:   [{ nom: "MedlinePlus — Ongles", url: MP + "nails.html" }],
  eyes:    [{ nom: "MedlinePlus — Santé des yeux", url: MP + "eyediseases.html" }],
  skin:    [{ nom: "MedlinePlus — Peau", url: MP + "skinconditions.html" }],
  hair:    [{ nom: "MedlinePlus — Chute de cheveux", url: MP + "hairloss.html" }],
  scalp:   [{ nom: "MedlinePlus — Chute de cheveux", url: MP + "hairloss.html" }],
  beard:   [{ nom: "MedlinePlus — Chute de cheveux", url: MP + "hairloss.html" }],
  tongue:  [{ nom: "MedlinePlus — Langue", url: MP + "tonguedisorders.html" }],
  teeth:   [{ nom: "MedlinePlus — Bouche et dents", url: MP + "mouthandteeth.html" }],
  feet:    [{ nom: "MedlinePlus — Santé des pieds", url: MP + "foothealth.html" }],
  belly:   [{ nom: "MedlinePlus — Système digestif", url: MP + "digestivediseases.html" }],
  body_fat:[{ nom: "MedlinePlus — Poids corporel", url: MP + "bodyweight.html" }],
  posture: [{ nom: "MedlinePlus — Mal de dos", url: MP + "backpain.html" }],
  sport:   [{ nom: "MedlinePlus — Exercice et forme", url: MP + "exerciseandphysicalfitness.html" }],
};

const ZONES_SPORT = ["corps_complet", "haut_corps", "chest", "biceps", "epaules", "dos", "abdos", "jambes"];

export default function SourcesSante({ zoneId, lang }) {
  const [ouvert, setOuvert] = useState(true);
  const en = lang === "en";
  const cle = ZONES_SPORT.includes(zoneId) ? "sport" : zoneId;
  const liste = [...(PAR_ZONE[cle] || []), ...GENERALES];

  return (
    <div style={{
      margin: "14px 0", padding: 14, borderRadius: 12,
      border: "1px solid #192c1d", background: "#0c1810",
    }}>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#8fa896" }}>
        {en
          ? "General information, not medical advice. Talk to a health professional before changing your diet, taking supplements, or if a symptom worries you."
          : "Information générale, pas un avis médical. Parle à un professionnel de la santé avant de changer ton alimentation, de prendre des suppléments, ou si un symptôme t'inquiète."}
      </p>
      <button
        onClick={() => setOuvert(!ouvert)}
        style={{
          marginTop: 10, background: "none", border: "none", padding: 0,
          color: "#00ff88", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        {ouvert ? (en ? "Hide sources" : "Cacher les sources") : (en ? "See sources" : "Voir les sources")}
      </button>
      {ouvert && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {liste.map((s) => (
            <li key={s.url + s.nom} style={{ marginBottom: 6, fontSize: 13 }}>
              <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#b0c8b8" }}>
                {s.nom}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

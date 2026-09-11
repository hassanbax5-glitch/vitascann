// ============================================================
// VITASCANN — openFoodFacts.js
// Recherche de produit par code-barres via Open Food Facts
// (base de données gratuite, sans clé API, couverture large
// en France/Québec, plus variable pour les produits artisanaux
// ou maghrébins de niche).
// ============================================================

const GRADE_TO_SCORE = { a: 90, b: 70, c: 50, d: 30, e: 10 };

/**
 * Cherche un produit par son code-barres sur Open Food Facts.
 * Retourne null si le produit n'est pas trouvé dans la base
 * (l'appelant doit alors basculer sur la méthode photo).
 */
export async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await res.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};

    return {
      trouve: true,
      produit: p.product_name_fr || p.product_name || "Produit inconnu",
      score: GRADE_TO_SCORE[p.nutriscore_grade] ?? 50,
      nutriscore_grade: p.nutriscore_grade || null,
      pour_100g: {
        calories: Math.round(n["energy-kcal_100g"] ?? 0),
        proteines: round1(n.proteins_100g),
        glucides: round1(n.carbohydrates_100g),
        sucres: round1(n.sugars_100g),
        lipides: round1(n.fat_100g),
        graisses_saturees: round1(n["saturated-fat_100g"]),
        fibres: round1(n.fiber_100g),
        sel: round2(n.salt_100g),
      },
      additifs_bruts: (p.additives_tags || []).map(a => a.replace("en:", "").toUpperCase()),
      ingredients_text: p.ingredients_text_fr || p.ingredients_text || "",
      image_url: p.image_front_small_url || null,
    };
  } catch (e) {
    console.error("Erreur Open Food Facts:", e);
    return null;
  }
}

function round1(val) {
  return val == null ? 0 : Math.round(val * 10) / 10;
}
function round2(val) {
  return val == null ? 0 : Math.round(val * 100) / 100;
}

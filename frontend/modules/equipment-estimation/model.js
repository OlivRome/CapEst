/* =========================================================================
 *  CAPEX Estimator — MODÈLE MATHÉMATIQUE (couche métier)
 * -------------------------------------------------------------------------
 *  Ce module regroupe TOUT ce qui concerne le calcul : les données de
 *  référence (catalogue, matériaux, pays…) et les formules paramétriques.
 *
 *  >>> OBJECTIF ARCHITECTURE : PRÉPARER LA MIGRATION VERS UN BACK-END <<<
 *
 *  La logique de l'interface (app.js) n'appelle JAMAIS les formules
 *  directement. Elle passe UNIQUEMENT par la fonction « estimate() », qui :
 *    - reçoit un objet « request » sérialisable en JSON,
 *    - renvoie une Promise d'un objet « result » sérialisable en JSON,
 *    - est ASYNCHRONE (comme le sera un appel réseau).
 *
 *  Le jour où un vrai back-end existera, il suffira de remplacer le CORPS de
 *  « estimate() » par un simple fetch('/api/estimate', ...). L'interface
 *  (app.js) n'aura AUCUNE ligne à changer, et les formules ci-dessous
 *  seront déplacées côté serveur (donc invisibles pour l'utilisateur).
 *
 *  CONTRAT D'ÉCHANGE (identique au futur contrat HTTP) :
 *    request  = { equipmentId: string, params: { ... } }
 *    result   = {
 *                 ok: boolean,
 *                 errors?: string[],          // si ok = false
 *                 model?: 'tank' | 'pump',
 *                 cost?:   { nominal, min, max },
 *                 weight?: { nominal, min, max },
 *                 details?: { ... }           // valeurs intermédiaires
 *               }
 *
 *  Toutes les fonctions de calcul sont « pures » : pas d'accès au DOM, pas
 *  d'effet de bord. Elles peuvent donc être copiées telles quelles dans un
 *  serveur Node.js, ou traduites en Python/autre.
 * ========================================================================= */

/* =========================================================================
 *  1. DONNÉES DE RÉFÉRENCE (pseudo-base de données en mémoire)
 * ========================================================================= */
export const Store = {
  /* -----------------------------------------------------------------------
   *  Taxonomie des équipements, groupée par secteur.
   *  supported = true  => un modèle de calcul existe (voir MODEL_BY_EQUIPMENT).
   *  supported = false => équipement listé mais non calculable (bannière v-future).
   * --------------------------------------------------------------------- */
  equipmentCatalog: [
    {
      sector: 'Sciences de la Vie (Life Sciences)',
      items: [
        { id: 'ls_prep_tank', label: 'Cuve de préparation / Stockage', supported: true },
        { id: 'ls_bioreactor', label: 'Bioréacteur / Fermenteur', supported: false },
        { id: 'ls_tff', label: 'Système de filtration tangentielle (TFF)', supported: false },
        { id: 'ls_autoclave', label: 'Autoclave / Stérilisateur', supported: false },
        { id: 'ls_lyo', label: 'Lyophilisateur industriel', supported: false },
        { id: 'ls_homogenizer', label: 'Homogénéisateur haute pression', supported: false }
      ]
    },
    {
      sector: 'Oil & Gas / Procédés Lourds',
      items: [
        { id: 'og_separator', label: 'Séparateur de phases (2 ou 3 phases)', supported: false },
        { id: 'og_distillation', label: 'Colonne de distillation / Stripping', supported: false },
        { id: 'og_compressor', label: 'Compresseur (Centrifuge / Alternatif)', supported: false },
        { id: 'og_heatexch', label: 'Échangeur de chaleur (Tubulaire / Plaques)', supported: false },
        { id: 'og_boiler', label: 'Chaudière / Four industriel', supported: false },
        { id: 'og_flare', label: "Torche d'assainissement (Flare)", supported: false }
      ]
    },
    {
      sector: 'Utilities & Équipements Généraux',
      items: [
        { id: 'ut_pressure_vessel', label: 'Cuve sous pression (Pressure Vessel)', supported: true },
        { id: 'ut_pump', label: 'Pompe industrielle (Centrifuge / Volumétrique)', supported: true },
        { id: 'ut_mixer', label: 'Mélangeur / Agitateur', supported: false },
        { id: 'ut_centrifuge', label: 'Centrifugeuse industrielle', supported: false },
        { id: 'ut_turbine', label: 'Turbine à vapeur / gaz', supported: false }
      ]
    }
  ],

  /* Coefficients par matériau : facteur de coût et facteur de poids. */
  materials: [
    { id: 'carbon', label: 'Acier Carbone', costFactor: 1.0, weightFactor: 1.0 },
    { id: 'ss304l', label: 'Inox 304L', costFactor: 1.4, weightFactor: 1.02 },
    { id: 'ss316l', label: 'Inox 316L', costFactor: 1.8, weightFactor: 1.03 },
    { id: 'hastc22', label: 'Hastelloy C22', costFactor: 3.5, weightFactor: 1.12 },
    { id: 'ti_gr2', label: 'Titane Grade 2', costFactor: 4.2, weightFactor: 0.6 }
  ],

  /* Facteurs de localisation par pays d'installation. */
  countries: [
    { id: 'fr', label: 'France', factor: 1.0 },
    { id: 'de', label: 'Allemagne', factor: 1.05 },
    { id: 'ch', label: 'Suisse', factor: 1.25 },
    { id: 'us', label: 'États-Unis', factor: 1.15 },
    { id: 'cn', label: 'Chine', factor: 0.75 },
    { id: 'sg', label: 'Singapour', factor: 1.1 }
  ],

  /* Coefficients par type de pompe (multiplicateurs coût / poids). */
  pumpTypes: [
    { id: 'centrifugal', label: 'Centrifuge', costFactor: 1.0, weightFactor: 1.0 },
    { id: 'multistage', label: 'Centrifuge multi-étages', costFactor: 1.45, weightFactor: 1.3 },
    { id: 'pd_rotary', label: 'Volumétrique rotative', costFactor: 1.6, weightFactor: 1.25 },
    { id: 'pd_recip', label: 'Volumétrique alternative', costFactor: 2.1, weightFactor: 1.6 }
  ]
};

/* -----------------------------------------------------------------------
 *  Paramètres des modèles paramétriques (coefficients « prix de base »).
 *  Regroupés ici pour être ajustables facilement sans toucher aux formules.
 * --------------------------------------------------------------------- */
export const MODEL_PARAMS = {
  /* Cuve : loi puissance sur le volume (m³). */
  tank: {
    costBase: 12000, // € — coefficient de coût de base
    costExp: 0.62, // exposant volume (coût)
    weightBase: 450, // kg — coefficient de poids de base
    weightExp: 0.75, // exposant volume (poids)
    pressureCostK: 0.03, // sensibilité coût à la pression
    pressureWeightK: 0.02 // sensibilité poids à la pression
  },
  /* Pompe : loi puissance sur la puissance hydraulique (kW). */
  pump: {
    costBase: 5200, // € — coefficient de coût de base (par kW^exp)
    costExp: 0.55,
    weightBase: 22, // kg — coefficient de poids de base
    weightExp: 0.62,
    rho: 1000, // masse volumique du fluide (kg/m³) — eau
    g: 9.81 // accélération de la pesanteur (m/s²)
  }
};

/* -----------------------------------------------------------------------
 *  Table de correspondance équipement -> modèle de calcul.
 *  Pour activer un nouvel équipement : ajouter une entrée ici + créer la
 *  fonction compute<Modèle>() correspondante.
 * --------------------------------------------------------------------- */
export const MODEL_BY_EQUIPMENT = {
  ls_prep_tank: 'tank',
  ut_pressure_vessel: 'tank',
  ut_pump: 'pump'
};

/* Renvoie la clé de modèle d'un équipement, ou null s'il n'est pas supporté. */
export const modelOf = (equipmentId) => MODEL_BY_EQUIPMENT[equipmentId] || null;

/* =========================================================================
 *  2. HELPERS DE RECHERCHE (équivalent de requêtes « SELECT ... WHERE id »)
 * ========================================================================= */
export function findEquipment(id) {
  for (const group of Store.equipmentCatalog) {
    const found = group.items.find((it) => it.id === id);
    if (found) return { ...found, sector: group.sector };
  }
  return null;
}
export const findMaterial = (id) => Store.materials.find((m) => m.id === id) || null;
export const findCountry = (id) => Store.countries.find((c) => c.id === id) || null;
export const findPumpType = (id) => Store.pumpTypes.find((p) => p.id === id) || null;

/* =========================================================================
 *  3. VALIDATION DES ENTRÉES
 *  Placée dans le modèle car c'est une responsabilité MÉTIER : le futur
 *  back-end devra valider les mêmes règles avant de calculer.
 *  Renvoie un tableau de messages d'erreur (vide si tout est valide).
 * ========================================================================= */
function validateTankParams(p) {
  const errors = [];
  if (!Number.isFinite(p.volume) || p.volume <= 0) {
    errors.push('Le volume doit être un nombre strictement positif.');
  }
  if (!Number.isFinite(p.pressure) || p.pressure < 1 || p.pressure > 50) {
    errors.push('La pression doit être comprise entre 1 et 50 bar.');
  }
  if (!findMaterial(p.materialId)) errors.push('Matériau invalide.');
  if (!findCountry(p.countryId)) errors.push('Pays invalide.');
  return errors;
}

function validatePumpParams(p) {
  const errors = [];
  if (!Number.isFinite(p.flow) || p.flow < 1 || p.flow > 5000) {
    errors.push('Le débit doit être compris entre 1 et 5 000 m³/h.');
  }
  if (!Number.isFinite(p.head) || p.head < 1 || p.head > 500) {
    errors.push('La hauteur manométrique doit être comprise entre 1 et 500 m.');
  }
  if (!findMaterial(p.materialId)) errors.push('Matériau invalide.');
  if (!findCountry(p.countryId)) errors.push('Pays invalide.');
  if (!findPumpType(p.pumpTypeId)) errors.push('Type de pompe invalide.');
  return errors;
}

/* =========================================================================
 *  4. FORMULES PARAMÉTRIQUES (fonctions PURES — aucun accès au DOM)
 *  Ce sont ces fonctions qui migreront côté serveur pour rester invisibles.
 * ========================================================================= */

/* -----------------------------------------------------------------------
 *  Modèle CUVE / CAPACITÉ SOUS PRESSION
 *  params attendus : { volume (m³), pressure (bar), materialId, countryId }
 * --------------------------------------------------------------------- */
function computeTank(params) {
  const k = MODEL_PARAMS.tank;
  const V = params.volume; // volume en m³
  const P = params.pressure; // pression en bar
  const mat = findMaterial(params.materialId);
  const ctry = findCountry(params.countryId);

  /* --- Coût --- */
  const costBase = k.costBase * Math.pow(V, k.costExp); // coût de base (volume)
  const costMat = costBase * mat.costFactor; // ajustement matériau
  const pressureFactor = 1 + k.pressureCostK * (P - 1); // ajustement pression
  const costFinal = costMat * pressureFactor * ctry.factor; // ajustement pays

  /* --- Poids --- */
  const weightBase = k.weightBase * Math.pow(V, k.weightExp);
  const weightFinal = weightBase * mat.weightFactor * (1 + k.pressureWeightK * (P - 1));

  return {
    model: 'tank',
    cost: { nominal: costFinal, min: costFinal * 0.7, max: costFinal * 1.3 },
    weight: { nominal: weightFinal, min: weightFinal * 0.8, max: weightFinal * 1.2 },
    details: {
      volumeM3: V,
      pressure: P,
      material: { id: mat.id, label: mat.label, costFactor: mat.costFactor, weightFactor: mat.weightFactor },
      country: { id: ctry.id, label: ctry.label, factor: ctry.factor },
      pressureFactor
    }
  };
}

/* -----------------------------------------------------------------------
 *  Modèle POMPE
 *  Variable de dimensionnement : puissance hydraulique
 *      P_hyd (kW) = Q[m³/h] / 3600 * rho * g * H / 1000
 *  Le coût et le poids évoluent de façon sous-linéaire avec cette puissance.
 *  params attendus : { flow (m³/h), head (m), pumpTypeId, materialId, countryId }
 * --------------------------------------------------------------------- */
function computePump(params) {
  const k = MODEL_PARAMS.pump;
  const Q = params.flow; // débit en m³/h
  const H = params.head; // hauteur manométrique en m
  const mat = findMaterial(params.materialId);
  const ctry = findCountry(params.countryId);
  const pt = findPumpType(params.pumpTypeId);

  /* Puissance hydraulique (kW) — proxy de dimensionnement. */
  const powerKw = (Q / 3600) * k.rho * k.g * H / 1000;

  /* --- Coût --- */
  const costBase = k.costBase * Math.pow(powerKw, k.costExp);
  const costMat = costBase * mat.costFactor; // ajustement matériau
  const costType = costMat * pt.costFactor; // ajustement type de pompe
  const costFinal = costType * ctry.factor; // ajustement pays

  /* --- Poids --- */
  const weightBase = k.weightBase * Math.pow(powerKw, k.weightExp);
  const weightFinal = weightBase * mat.weightFactor * pt.weightFactor;

  return {
    model: 'pump',
    cost: { nominal: costFinal, min: costFinal * 0.7, max: costFinal * 1.3 },
    weight: { nominal: weightFinal, min: weightFinal * 0.8, max: weightFinal * 1.2 },
    details: {
      flow: Q,
      head: H,
      powerKw,
      material: { id: mat.id, label: mat.label, costFactor: mat.costFactor, weightFactor: mat.weightFactor },
      country: { id: ctry.id, label: ctry.label, factor: ctry.factor },
      pumpType: { id: pt.id, label: pt.label, costFactor: pt.costFactor, weightFactor: pt.weightFactor }
    }
  };
}

/* =========================================================================
 *  5. POINT D'ENTRÉE PUBLIC : estimate()
 * -------------------------------------------------------------------------
 *  >>> C'EST LA SEULE FONCTION QUE L'INTERFACE (app.js) DOIT APPELER <<<
 *
 *  Signature identique au futur endpoint HTTP :
 *      const result = await estimate({ equipmentId, params });
 *
 *  ASYNCHRONE volontairement (renvoie une Promise) : aujourd'hui le calcul
 *  est local et instantané, mais l'interface est déjà écrite comme si le
 *  résultat venait du réseau. Ainsi, la bascule vers un back-end ne
 *  modifiera QUE le corps de cette fonction.
 * ========================================================================= */
export async function estimate(request) {
  /* --- Étape 1 : déterminer le modèle de calcul --- */
  const model = modelOf(request?.equipmentId);
  if (!model) {
    return {
      ok: false,
      errors: ["Aucun modèle mathématique n'est disponible pour cet équipement."]
    };
  }

  /* --- Étape 2 : valider les paramètres selon le modèle --- */
  const params = request.params || {};
  const errors = model === 'tank' ? validateTankParams(params) : validatePumpParams(params);
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  /* --- Étape 3 : calculer --- */
  const computed = model === 'tank' ? computeTank(params) : computePump(params);

  /* --- Étape 4 : renvoyer un résultat au format « contrat » --- */
  return { ok: true, ...computed };

  /*
   * ┌─────────────────────────────────────────────────────────────────┐
   * │  MIGRATION FUTURE VERS UN BACK-END                                │
   * │  Remplacer TOUT le corps ci-dessus par :                          │
   * │                                                                   │
   * │    const res = await fetch('/api/estimate', {                     │
   * │      method: 'POST',                                              │
   * │      headers: { 'Content-Type': 'application/json' },             │
   * │      body: JSON.stringify(request)                               │
   * │    });                                                            │
   * │    if (!res.ok) throw new Error('Erreur serveur');               │
   * │    return res.json();                                            │
   * │                                                                   │
   * │  Les formules (computeTank / computePump), MODEL_PARAMS et la     │
   * │  validation seront alors déplacées côté serveur — invisibles      │
   * │  pour l'utilisateur.                                              │
   * └─────────────────────────────────────────────────────────────────┘
   */
}

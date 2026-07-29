/* =========================================================================
 *  Project Estimation — CONFIGURATION DE LA GRILLE D'ESTIMATION
 * -------------------------------------------------------------------------
 *  Décrit la grille CAPEX (reproduisant le modèle Excel fourni) :
 *  deux sections « Main Equipment » et « Bulk Material ».
 *
 *  Chaque section possède SES PROPRES colonnes, chacune typée :
 *    type: 'input' -> zone de saisie utilisateur      (fond BLANC)
 *    type: 'calc'  -> valeur calculée automatiquement  (fond JAUNE)
 *
 *  Les FORMULES des colonnes calculées sont des fonctions PURES
 *  (computeMain / computeBulk) : aucun accès au DOM. Elles pourront donc
 *  être déplacées telles quelles côté back-end le moment venu.
 * ========================================================================= */

/* -------------------------------------------------------------------------
 *  Lignes des deux sections (code / libellé / unité de la grandeur).
 * ----------------------------------------------------------------------- */

/* Section « Main Equipment ». */
export const MAIN_EQUIPMENT = [
  { code: '01', label: 'Fired Equipment', unit: 'mW' },
  { code: '02', label: 'Water Treatment', unit: 'm³/h' },
  { code: '03', label: 'Cooling Towers', unit: 'm³/h' },
  { code: '04', label: 'Reactors & Internals', unit: 'm³' },
  { code: '05', label: 'Columns & Internals', unit: 'm³' },
  { code: '06', label: 'Shell & Tube Heat Exchanger', unit: 'm²' },
  { code: '07', label: 'Air-coolers', unit: 'm²' },
  { code: '08', label: 'Drums', unit: 'm³' },
  { code: '09', label: 'Pumps', unit: 'kW' },
  { code: '10', label: 'Compressors', unit: 'kW' },
  { code: '11', label: 'Drivers', unit: 'kW' },
  { code: '40', label: 'Handling', unit: '' },
  { code: '42', label: 'Agitators, Mixing & Grinding Equipment', unit: '' },
  { code: '41', label: 'Packages', unit: '' },
  { code: '25', label: 'Storage Tank', unit: 'm³' },
  { code: '26', label: 'AC', unit: 'm³' }
];

/* Section « Bulk Material ». */
export const BULK_MATERIAL = [
  { code: '20', label: 'Buildings', unit: 'm²' },
  { code: '13', label: 'A/G Piping, Dia < 48"', unit: 'tons' },
  { code: '13b', label: 'U/G Pressurized Piping + Trenches', unit: 'tons' },
  { code: '14', label: 'U/G Gravitary Piping + Trenches', unit: 'tons' },
  { code: '-sp', label: 'Site Preparation', unit: 'm²' },
  { code: '-rb', label: 'Road + Bridge', unit: 'm²' },
  { code: '15', label: 'Instrumentation', unit: 'C.V.' },
  { code: '-as', label: 'Analyzers & Shelters', unit: 'An' },
  { code: '-cr', label: 'CR = DCS + ESD + FG +', unit: 'I/O' },
  { code: '16', label: 'Electricity', unit: 'kW' },
  { code: '17', label: 'Reinf. Concrete', unit: 'm³' },
  { code: '-pv', label: 'Paving', unit: 'm² pav.' },
  { code: '-pi', label: 'Pile', unit: 'lm Piles' },
  { code: '-fp', label: 'Fire Proofing', unit: 'm²' },
  { code: '18', label: 'Steel Structures', unit: 'tons' },
  { code: '19', label: 'Fire Equipment', unit: 'tons' },
  { code: '21', label: 'Maintenance & Laboratories', unit: 'm²' },
  { code: '22', label: 'Insulation', unit: 'm²' },
  { code: '23', label: 'Painting', unit: 'm²' }
];

/* -------------------------------------------------------------------------
 *  Définition des colonnes de chaque section.
 *  Attributs :
 *    key    : clé de stockage dans la cellule
 *    label  : en-tête affiché
 *    type   : 'input' (blanc, saisissable) | 'calc' (jaune, calculé)
 *    money  : true -> formaté en euros
 *    weight : true -> colonne « poids » (teinte ardoise, comme le module
 *             Equipment Estimation)
 * ----------------------------------------------------------------------- */

/* Colonnes de la section « Main Equipment » (ordre = celui du modèle Excel). */
export const MAIN_COLUMNS = [
  { key: 'itemsNb', label: 'Items nb', type: 'input' },
  { key: 'equiptNb', label: 'Equipt nb', type: 'input' },
  { key: 'quantity', label: 'Charac. Qty', type: 'input' },
  { key: 'supply', label: 'Supply (€)', type: 'input', money: true },
  { key: 'installation', label: 'Installation (€)', type: 'calc', money: true },
  { key: 'installVendors', label: 'Installation by Vendors (€)', type: 'input', money: true },
  { key: 'weightTons', label: 'Weight (t)', type: 'input', weight: true },
  { key: 'fieldMhrs', label: 'Field Mhrs (Standard)', type: 'calc' },
  { key: 'costPerKg', label: 'EUR / kg', type: 'calc' },
  { key: 'eurPerEquipt', label: 'EUR / Equipt', type: 'calc', money: true }
];

/* Colonnes de la section « Bulk Material » (pas de poids ni de nombre). */
export const BULK_COLUMNS = [
  { key: 'quantity', label: 'Quantities', type: 'input' },
  { key: 'supply', label: 'Supply (€)', type: 'input', money: true },
  { key: 'installation', label: 'Installation (€)', type: 'calc', money: true },
  { key: 'subcontract', label: 'Sub Contract (€)', type: 'calc', money: true },
  { key: 'fieldMhrs', label: 'Field Mhrs (Standard)', type: 'calc' }
];

/* -------------------------------------------------------------------------
 *  Facteurs de calcul (hypothèses paramétriques, ajustables au même titre
 *  que MODEL_PARAMS du module Equipment). Regroupés ici pour être modifiés
 *  sans toucher aux formules.
 * ----------------------------------------------------------------------- */
export const CALC_FACTORS = {
  installFactor: 0.2, // Installation = Supply × 20 %
  manhoursPerTon: 30, // Field Mhrs (Main) = Poids (t) × 30 h/t
  hourlyRate: 60, // €/h — conversion coût d'installation -> heures (Bulk)
  subcontractFactor: 0.1 // Sub Contract = Supply × 10 %
};

/* Convertit une valeur de cellule en nombre (chaîne vide -> 0). */
function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/* -------------------------------------------------------------------------
 *  FORMULES DES COLONNES CALCULÉES (fonctions pures).
 *  Renvoient toutes les valeurs jaunes + le coût de ligne.
 * ----------------------------------------------------------------------- */

/* Section « Main Equipment ». */
export function computeMain(cell) {
  const supply = num(cell.supply);
  const weightT = num(cell.weightTons);
  const equiptNb = num(cell.equiptNb);
  const installVendors = num(cell.installVendors);

  const installation = supply * CALC_FACTORS.installFactor;
  const fieldMhrs = weightT * CALC_FACTORS.manhoursPerTon;
  const costPerKg = weightT > 0 ? supply / (weightT * 1000) : 0; // €/kg
  const eurPerEquipt = equiptNb > 0 ? supply / equiptNb : 0;

  const rowCost = supply + installation + installVendors;

  return { installation, fieldMhrs, costPerKg, eurPerEquipt, rowCost };
}

/* Section « Bulk Material ». */
export function computeBulk(cell) {
  const supply = num(cell.supply);

  const installation = supply * CALC_FACTORS.installFactor;
  const subcontract = supply * CALC_FACTORS.subcontractFactor;
  const fieldMhrs = CALC_FACTORS.hourlyRate > 0 ? installation / CALC_FACTORS.hourlyRate : 0;

  const rowCost = supply + installation + subcontract;

  return { installation, subcontract, fieldMhrs, rowCost };
}

/* Renvoie l'objet de valeurs calculées pour une cellule d'une section. */
export function computeCell(sectionId, cell) {
  return sectionId === 'bulk' ? computeBulk(cell) : computeMain(cell);
}

/* -------------------------------------------------------------------------
 *  Correspondance equipmentId (module Equipment) -> code de catégorie.
 * ----------------------------------------------------------------------- */
export const EQUIPMENT_TO_CATEGORY = {
  ls_prep_tank: '25', // Storage Tank
  ut_pressure_vessel: '08', // Drums (capacité sous pression)
  ut_pump: '09' // Pumps
};

/* Renvoie le code de catégorie de grille pour un équipement donné. */
export const categoryOf = (equipmentId) => EQUIPMENT_TO_CATEGORY[equipmentId] || null;

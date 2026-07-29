/* =========================================================================
 *  Project Estimation — CONFIGURATION DE LA GRILLE D'ESTIMATION
 * -------------------------------------------------------------------------
 *  Décrit les lignes de la grille CAPEX (inspirée du modèle Excel fourni) :
 *  « Main Equipment » et « Bulk Material », chacune avec son code, son
 *  libellé et l'unité de la grandeur caractéristique.
 *
 *  La correspondance equipmentId -> code de catégorie permet de router
 *  automatiquement un équipement estimé (module Equipment Estimation) vers
 *  la bonne ligne de la grille.
 * ========================================================================= */

/* Lignes de la section « Main Equipment ». */
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

/* Lignes de la section « Bulk Material ». */
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

/* Colonnes saisissables (zones blanches du modèle) par ligne de la grille. */
export const EDITABLE_COLUMNS = [
  { key: 'itemsNb', label: 'Items nb' },
  { key: 'equiptNb', label: 'Equipt nb' },
  { key: 'quantity', label: 'Charac. Qty' },
  { key: 'supply', label: 'Supply (€)' },
  { key: 'installation', label: 'Installation (€)' },
  { key: 'weightTons', label: 'Weight (t)' }
];

/* Correspondance equipmentId (module Equipment) -> code de catégorie de la grille. */
export const EQUIPMENT_TO_CATEGORY = {
  ls_prep_tank: '25', // Storage Tank
  ut_pressure_vessel: '08', // Drums (capacité sous pression)
  ut_pump: '09' // Pumps
};

/* Renvoie le code de catégorie de grille pour un équipement donné. */
export const categoryOf = (equipmentId) => EQUIPMENT_TO_CATEGORY[equipmentId] || null;

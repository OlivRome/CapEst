/* =========================================================================
 *  CAPEX Estimator — SCHÉMAS D'ÉQUIPEMENTS (dessins SVG)
 * -------------------------------------------------------------------------
 *  Bibliothèque de représentations simplifiées, en niveaux de gris, affichées
 *  à droite du sélecteur d'équipement pour aider l'utilisateur à identifier
 *  visuellement l'équipement choisi.
 *
 *  Chaque entrée est une fonction renvoyant le contenu interne d'un <svg>
 *  (viewBox 0 0 120 120). Style commun : trait ardoise, remplissages clairs.
 * ========================================================================= */

/* Attributs communs de la balise <svg> englobante. */
export const SVG_ATTRS =
  'viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-28 h-28"';

/* Palette de gris partagée (s = trait, l/ll = remplissages, d = détail foncé). */
const SK = { s: '#64748b', l: '#cbd5e1', ll: '#e2e8f0', d: '#475569' };

/* Dictionnaire id d'équipement -> générateur de SVG interne. */
export const SCHEMATICS = {
  /* --- Cuves / capacités --- */
  ls_prep_tank: () => `
    <rect x="34" y="30" width="52" height="66" rx="6" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <ellipse cx="60" cy="30" rx="26" ry="8" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M34 96 q26 12 52 0" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="60" y1="14" x2="60" y2="30" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="60" cy="12" r="3" fill="${SK.d}"/>
    <line x1="42" y1="108" x2="42" y2="118" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="78" y1="108" x2="78" y2="118" stroke="${SK.s}" stroke-width="2.5"/>`,
  ut_pressure_vessel: () => `
    <rect x="40" y="34" width="40" height="52" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M40 34 a20 16 0 0 1 40 0" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M40 86 a20 16 0 0 0 40 0" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="60" y1="12" x2="60" y2="20" stroke="${SK.s}" stroke-width="2.5"/>
    <rect x="54" y="10" width="12" height="6" fill="${SK.d}"/>
    <line x1="48" y1="100" x2="48" y2="112" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="72" y1="100" x2="72" y2="112" stroke="${SK.s}" stroke-width="2.5"/>`,
  ls_bioreactor: () => `
    <rect x="38" y="34" width="44" height="60" rx="6" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <ellipse cx="60" cy="34" rx="22" ry="7" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="60" y1="18" x2="60" y2="70" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M50 60 h20 M50 70 h20" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="60" cy="16" r="4" fill="${SK.d}"/>`,
  /* --- Pompe --- */
  ut_pump: () => `
    <circle cx="54" cy="66" r="26" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M54 66 L54 44 A22 22 0 0 1 73 56 Z" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <path d="M54 66 L74 74 A22 22 0 0 1 55 88 Z" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <path d="M54 66 L38 52 A22 22 0 0 0 33 74 Z" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <circle cx="54" cy="66" r="5" fill="${SK.d}"/>
    <path d="M54 40 v-16 h22" stroke="${SK.s}" stroke-width="3" fill="none"/>
    <rect x="74" y="18" width="14" height="12" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <rect x="40" y="96" width="28" height="8" fill="${SK.d}"/>`,
  /* --- Oil & Gas --- */
  og_separator: () => `
    <rect x="24" y="48" width="72" height="30" rx="15" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="60" y1="48" x2="60" y2="78" stroke="${SK.l}" stroke-width="2"/>
    <path d="M24 66 q36 8 72 0" stroke="${SK.s}" stroke-width="2" fill="none"/>
    <line x1="12" y1="60" x2="24" y2="60" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="96" y1="56" x2="108" y2="56" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="34" y1="78" x2="34" y2="92" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="86" y1="78" x2="86" y2="92" stroke="${SK.s}" stroke-width="2.5"/>`,
  og_distillation: () => `
    <rect x="48" y="16" width="24" height="88" rx="10" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="48" y1="34" x2="72" y2="34" stroke="${SK.s}" stroke-width="1.8"/>
    <line x1="48" y1="50" x2="72" y2="50" stroke="${SK.s}" stroke-width="1.8"/>
    <line x1="48" y1="66" x2="72" y2="66" stroke="${SK.s}" stroke-width="1.8"/>
    <line x1="48" y1="82" x2="72" y2="82" stroke="${SK.s}" stroke-width="1.8"/>
    <path d="M60 16 v-6 h20" stroke="${SK.s}" stroke-width="2.5" fill="none"/>`,
  og_compressor: () => `
    <rect x="30" y="46" width="40" height="36" rx="4" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="50" cy="64" r="10" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <circle cx="50" cy="64" r="3" fill="${SK.d}"/>
    <rect x="70" y="54" width="20" height="20" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="18" y1="64" x2="30" y2="64" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="90" y1="64" x2="102" y2="64" stroke="${SK.s}" stroke-width="2.5"/>`,
  og_heatexch: () => `
    <rect x="22" y="46" width="76" height="28" rx="14" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="34" y1="46" x2="34" y2="74" stroke="${SK.s}" stroke-width="2"/>
    <line x1="86" y1="46" x2="86" y2="74" stroke="${SK.s}" stroke-width="2"/>
    <path d="M38 54 h44 M38 60 h44 M38 66 h44" stroke="${SK.s}" stroke-width="1.6"/>
    <line x1="34" y1="36" x2="34" y2="46" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="86" y1="74" x2="86" y2="84" stroke="${SK.s}" stroke-width="2.5"/>`,
  og_boiler: () => `
    <rect x="36" y="30" width="48" height="60" rx="6" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M52 78 q8 -14 0 -28 M60 78 q8 -14 0 -28 M68 78 q8 -14 0 -28" stroke="${SK.d}" stroke-width="2" fill="none"/>
    <rect x="30" y="16" width="12" height="16" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="44" y1="90" x2="44" y2="102" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="76" y1="90" x2="76" y2="102" stroke="${SK.s}" stroke-width="2.5"/>`,
  og_flare: () => `
    <rect x="52" y="34" width="10" height="70" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M57 34 q-10 -14 0 -24 q6 10 0 24" fill="${SK.d}" stroke="${SK.d}" stroke-width="1"/>
    <line x1="40" y1="104" x2="74" y2="104" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="46" y1="60" x2="52" y2="60" stroke="${SK.s}" stroke-width="2"/>
    <line x1="46" y1="78" x2="52" y2="78" stroke="${SK.s}" stroke-width="2"/>`,
  /* --- Life Sciences (compléments) --- */
  ls_tff: () => `
    <rect x="30" y="40" width="60" height="18" rx="9" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <rect x="30" y="64" width="60" height="18" rx="9" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="18" y1="49" x2="30" y2="49" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="90" y1="49" x2="102" y2="49" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="90" y1="73" x2="102" y2="73" stroke="${SK.s}" stroke-width="2.5"/>`,
  ls_autoclave: () => `
    <rect x="34" y="36" width="52" height="54" rx="8" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="60" cy="63" r="16" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <circle cx="60" cy="63" r="4" fill="${SK.d}"/>
    <line x1="34" y1="52" x2="86" y2="52" stroke="${SK.s}" stroke-width="1.8"/>`,
  ls_lyo: () => `
    <rect x="30" y="40" width="60" height="46" rx="6" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="42" y1="52" x2="78" y2="52" stroke="${SK.s}" stroke-width="1.8"/>
    <line x1="42" y1="62" x2="78" y2="62" stroke="${SK.s}" stroke-width="1.8"/>
    <line x1="42" y1="72" x2="78" y2="72" stroke="${SK.s}" stroke-width="1.8"/>`,
  ls_homogenizer: () => `
    <rect x="34" y="44" width="40" height="34" rx="4" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <rect x="74" y="52" width="16" height="18" fill="${SK.l}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="22" y1="61" x2="34" y2="61" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="54" cy="61" r="8" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>`,
  /* --- Utilities (compléments) --- */
  ut_mixer: () => `
    <path d="M36 44 h48 l-8 46 h-32 Z" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="60" y1="18" x2="60" y2="70" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M50 66 h20 M52 74 h16" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="60" cy="16" r="4" fill="${SK.d}"/>`,
  ut_centrifuge: () => `
    <circle cx="60" cy="62" r="30" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <circle cx="60" cy="62" r="16" fill="${SK.l}" stroke="${SK.s}" stroke-width="2"/>
    <circle cx="60" cy="62" r="4" fill="${SK.d}"/>
    <line x1="60" y1="32" x2="60" y2="46" stroke="${SK.s}" stroke-width="2.5"/>`,
  ut_turbine: () => `
    <ellipse cx="60" cy="62" rx="30" ry="20" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5"/>
    <path d="M40 62 l20 -10 v20 Z M80 62 l-20 -10 v20 Z" fill="${SK.l}" stroke="${SK.s}" stroke-width="1.6"/>
    <line x1="30" y1="62" x2="18" y2="62" stroke="${SK.s}" stroke-width="2.5"/>
    <line x1="90" y1="62" x2="102" y2="62" stroke="${SK.s}" stroke-width="2.5"/>`
};

/* Schéma générique (point d'interrogation) si aucun dessin n'existe pour l'id. */
function defaultSchematic() {
  return `<rect x="34" y="40" width="52" height="48" rx="6" fill="${SK.ll}" stroke="${SK.s}" stroke-width="2.5" stroke-dasharray="5 4"/>
    <text x="60" y="68" text-anchor="middle" font-size="26" fill="${SK.s}">?</text>`;
}

/* -----------------------------------------------------------------------
 *  buildSchematic(id, label)
 *  Renvoie le markup HTML complet (SVG + légende) prêt à être injecté.
 * --------------------------------------------------------------------- */
export function buildSchematic(id, label) {
  const builder = SCHEMATICS[id] || defaultSchematic;
  return `<svg ${SVG_ATTRS}>${builder()}</svg>
    <span class="text-[11px] font-medium text-slate-500 text-center leading-tight">${label}</span>`;
}

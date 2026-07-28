/* =========================================================================
 *  CAPEX Estimator — COUCHE INTERFACE (UI)
 * -------------------------------------------------------------------------
 *  Ce module gère TOUT ce qui touche à l'affichage :
 *    - remplissage des menus déroulants,
 *    - affichage/masquage dynamique des champs selon l'équipement,
 *    - schéma de l'équipement,
 *    - collecte des saisies,
 *    - APPEL du modèle via estimate() (en await),
 *    - rendu des résultats et gestion des erreurs.
 *
 *  >>> IMPORTANT (préparation back-end) <<<
 *  Ce fichier n'implémente AUCUNE formule. Il ne connaît que le CONTRAT :
 *  il envoie { equipmentId, params } à estimate() et reçoit un « result ».
 *  Le jour où estimate() appellera un vrai serveur, ce fichier restera
 *  INCHANGÉ. C'est tout l'intérêt de la frontière asynchrone.
 * ========================================================================= */

import { Store, findEquipment, modelOf, estimate } from './model.js';
import { buildSchematic } from './schematics.js';

/* =========================================================================
 *  1. RÉFÉRENCES DOM
 * ========================================================================= */
const el = {
  equipment: document.getElementById('equipment'),
  banner: document.getElementById('banner'),
  bannerText: document.getElementById('banner-text'),
  params: document.getElementById('params'),
  volume: document.getElementById('volume'),
  volumeUnit: document.getElementById('volumeUnit'),
  material: document.getElementById('material'),
  pressure: document.getElementById('pressure'),
  country: document.getElementById('country'),
  flow: document.getElementById('flow'),
  head: document.getElementById('head'),
  pumptype: document.getElementById('pumptype'),
  schematic: document.getElementById('schematic'),
  schematicInner: document.getElementById('schematic-inner'),
  fields: Array.from(document.querySelectorAll('[data-models]')),
  validation: document.getElementById('validation'),
  estimate: document.getElementById('estimate'),
  estimateLabel: document.getElementById('estimate-label'),
  results: document.getElementById('results'),
  priceMin: document.getElementById('priceMin'),
  priceNom: document.getElementById('priceNom'),
  priceMax: document.getElementById('priceMax'),
  weightMin: document.getElementById('weightMin'),
  weightNom: document.getElementById('weightNom'),
  weightMax: document.getElementById('weightMax'),
  summary: document.getElementById('summary'),
  year: document.getElementById('year')
};

/* =========================================================================
 *  2. FORMATEURS D'AFFICHAGE (locale fr-FR)
 * ========================================================================= */
const fmtEUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});
const fmtKg = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const fmtNum = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/* =========================================================================
 *  3. REMPLISSAGE DES MENUS DÉROULANTS (données lues depuis le Store)
 * ========================================================================= */
function populateEquipment() {
  const frag = document.createDocumentFragment();

  /* Option placeholder non sélectionnable. */
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Sélectionnez un équipement —';
  placeholder.disabled = true;
  placeholder.selected = true;
  frag.appendChild(placeholder);

  /* Un <optgroup> par secteur. */
  Store.equipmentCatalog.forEach((group) => {
    const og = document.createElement('optgroup');
    og.label = group.sector;
    group.items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      /* Coche « ✓ » pour les équipements dotés d'un modèle de calcul. */
      opt.textContent = item.supported ? item.label + '  ✓' : item.label;
      og.appendChild(opt);
    });
    frag.appendChild(og);
  });
  el.equipment.appendChild(frag);
}

function populateMaterials() {
  const frag = document.createDocumentFragment();
  Store.materials.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.label}  (coût ×${fmtNum.format(m.costFactor)} · poids ×${fmtNum.format(m.weightFactor)})`;
    if (i === 0) opt.selected = true;
    frag.appendChild(opt);
  });
  el.material.appendChild(frag);
}

function populateCountries() {
  const frag = document.createDocumentFragment();
  Store.countries.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.label}  (×${fmtNum.format(c.factor)})`;
    if (c.id === 'fr') opt.selected = true;
    frag.appendChild(opt);
  });
  el.country.appendChild(frag);
}

function populatePumpTypes() {
  const frag = document.createDocumentFragment();
  Store.pumpTypes.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.label}  (coût ×${fmtNum.format(p.costFactor)} · poids ×${fmtNum.format(p.weightFactor)})`;
    if (i === 0) opt.selected = true;
    frag.appendChild(opt);
  });
  el.pumptype.appendChild(frag);
}

/* =========================================================================
 *  4. RÉACTION AU CHANGEMENT D'ÉQUIPEMENT
 * ========================================================================= */

/* Affiche uniquement les champs pertinents pour le modèle actif (data-models). */
function toggleFieldsForModel(model) {
  el.fields.forEach((f) => {
    const models = (f.dataset.models || '').split(/\s+/);
    f.classList.toggle('hidden', !models.includes(model));
  });
}

function onEquipmentChange() {
  const id = el.equipment.value;
  const eq = findEquipment(id);

  /* Réinitialise les résultats et messages à chaque changement. */
  el.results.classList.add('hidden');
  el.validation.classList.add('hidden');

  if (!eq) {
    el.banner.classList.add('hidden');
    el.params.classList.add('hidden');
    el.schematic.classList.add('hidden');
    return;
  }

  /* Affiche toujours un schéma représentatif de l'équipement choisi. */
  el.schematicInner.innerHTML = buildSchematic(id, eq.label);
  el.schematic.classList.remove('hidden');

  /* Si un modèle existe : afficher les champs ; sinon : bannière d'info. */
  const model = modelOf(id);
  if (model) {
    el.banner.classList.add('hidden');
    toggleFieldsForModel(model);
    el.params.classList.remove('hidden');
  } else {
    el.bannerText.textContent =
      "Modèle mathématique en cours de développement. Veuillez sélectionner 'Cuve' ou 'Pompe' pour tester l'estimateur.";
    el.banner.classList.remove('hidden');
    el.params.classList.add('hidden');
  }
}

/* =========================================================================
 *  5. COLLECTE DES SAISIES -> objet « params » (contrat du modèle)
 *  On construit ici un objet sérialisable JSON, identique à ce qui sera
 *  envoyé au futur back-end. La conversion d'unités (L -> m³) est faite ici,
 *  côté interface, car elle relève de la présentation.
 * ========================================================================= */
function collectParams(model) {
  /* Champs communs à tous les modèles. */
  const base = {
    materialId: el.material.value,
    countryId: el.country.value
  };

  if (model === 'tank') {
    const rawVolume = parseFloat(el.volume.value);
    const unit = el.volumeUnit.value; // 'L' ou 'm3'
    return {
      ...base,
      volume: unit === 'm3' ? rawVolume : rawVolume / 1000, // toujours en m³
      pressure: parseFloat(el.pressure.value),
      /* Métadonnées d'affichage (non utilisées par le calcul). */
      _display: { rawVolume, unit }
    };
  }

  if (model === 'pump') {
    return {
      ...base,
      flow: parseFloat(el.flow.value),
      head: parseFloat(el.head.value),
      pumpTypeId: el.pumptype.value
    };
  }

  return base;
}

/* =========================================================================
 *  6. ÉTAT DE CHARGEMENT DU BOUTON
 *  Prépare le back-end : pendant l'appel (potentiellement réseau), le bouton
 *  affiche un indicateur et se désactive.
 * ========================================================================= */
function setLoading(isLoading) {
  el.estimate.dataset.loading = String(isLoading);
  if (isLoading) {
    el.estimateLabel.innerHTML = '<span class="spinner"></span> Calcul en cours…';
  } else {
    el.estimateLabel.textContent = "Estimer l'équipement";
  }
}

/* =========================================================================
 *  7. RENDU DES RÉSULTATS
 * ========================================================================= */
function renderResults(result, displayMeta) {
  /* --- Cartes KPI --- */
  el.priceMin.textContent = fmtEUR.format(result.cost.min);
  el.priceNom.textContent = fmtEUR.format(result.cost.nominal);
  el.priceMax.textContent = fmtEUR.format(result.cost.max);

  el.weightMin.textContent = fmtKg.format(result.weight.min) + ' kg';
  el.weightNom.textContent = fmtKg.format(result.weight.nominal) + ' kg';
  el.weightMax.textContent = fmtKg.format(result.weight.max) + ' kg';

  /* --- Tableau récapitulatif (lignes dépendant du modèle) --- */
  const eq = findEquipment(el.equipment.value);
  const d = result.details;
  let rows = [['Équipement', `${eq.label} <span class="text-slate-400">(${eq.sector})</span>`]];

  if (result.model === 'tank') {
    const meta = displayMeta || {};
    rows.push(
      ['Volume saisi', `${fmtNum.format(meta.rawVolume)} ${meta.unit === 'm3' ? 'm³' : 'L'} <span class="text-slate-400">(= ${fmtNum.format(d.volumeM3)} m³)</span>`],
      ['Matériau', d.material.label],
      ['Facteur coût matériau', `× ${fmtNum.format(d.material.costFactor)}`],
      ['Facteur poids matériau', `× ${fmtNum.format(d.material.weightFactor)}`],
      ['Pression de service', `${fmtNum.format(d.pressure)} bar`],
      ['Facteur pression (coût)', `× ${fmtNum.format(d.pressureFactor)}`]
    );
  } else if (result.model === 'pump') {
    rows.push(
      ['Débit nominal', `${fmtNum.format(d.flow)} m³/h`],
      ['Hauteur manométrique', `${fmtNum.format(d.head)} m`],
      ['Puissance hydraulique', `${fmtNum.format(d.powerKw)} kW`],
      ['Type de pompe', d.pumpType.label],
      ['Facteur coût type', `× ${fmtNum.format(d.pumpType.costFactor)}`],
      ['Facteur poids type', `× ${fmtNum.format(d.pumpType.weightFactor)}`],
      ['Matériau', d.material.label],
      ['Facteur coût matériau', `× ${fmtNum.format(d.material.costFactor)}`],
      ['Facteur poids matériau', `× ${fmtNum.format(d.material.weightFactor)}`]
    );
  }

  rows.push(
    ["Pays d'installation", d.country.label],
    ['Facteur pays', `× ${fmtNum.format(d.country.factor)}`],
    ['Coût nominal (€ HT)', `<span class="font-bold text-brand-800">${fmtEUR.format(result.cost.nominal)}</span>`],
    ['Poids nominal', `<span class="font-bold text-slate-800">${fmtKg.format(result.weight.nominal)} kg</span>`]
  );

  el.summary.innerHTML = rows
    .map(
      ([k, v], idx) => `
      <tr class="${idx % 2 ? 'bg-white' : 'bg-slate-50/60'}">
        <th scope="row" class="text-left font-semibold text-slate-600 px-6 py-2.5 whitespace-nowrap align-top w-1/2">${k}</th>
        <td class="px-6 py-2.5 text-slate-800">${v}</td>
      </tr>`
    )
    .join('');

  el.results.classList.remove('hidden');
}

/* Affiche un ou plusieurs messages d'erreur dans le bloc de validation. */
function showErrors(messages) {
  el.validation.innerHTML = messages.map((m) => '• ' + m).join('<br>');
  el.validation.classList.remove('hidden');
  el.results.classList.add('hidden');
}

/* =========================================================================
 *  8. HANDLER PRINCIPAL : ESTIMER
 *  ASYNCHRONE — appelle estimate() en await, gère erreurs et chargement.
 *  Ce handler NE CHANGERA PAS lors de la migration vers un back-end.
 * ========================================================================= */
async function onEstimate() {
  const id = el.equipment.value;
  const model = modelOf(id);
  if (!model) return; // sécurité (le bouton n'est visible que si un modèle existe)

  const params = collectParams(model);
  /* On isole les métadonnées d'affichage (ne font pas partie du contrat). */
  const displayMeta = params._display;
  delete params._display;

  setLoading(true);
  try {
    /* Appel du modèle — aujourd'hui local, demain via le réseau. */
    const result = await estimate({ equipmentId: id, params });

    if (!result.ok) {
      /* Erreurs de validation renvoyées par le modèle/serveur. */
      showErrors(result.errors || ['Erreur inconnue.']);
      return;
    }

    el.validation.classList.add('hidden');
    renderResults(result, displayMeta);
    el.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    /* Erreur réseau/inattendue (surtout pertinent avec un back-end). */
    showErrors([
      "Une erreur est survenue lors du calcul. Veuillez réessayer.",
      err && err.message ? `Détail : ${err.message}` : ''
    ].filter(Boolean));
  } finally {
    setLoading(false);
  }
}

/* =========================================================================
 *  9. INITIALISATION
 * ========================================================================= */
function init() {
  populateEquipment();
  populateMaterials();
  populateCountries();
  populatePumpTypes();
  el.year.textContent = new Date().getFullYear();

  el.equipment.addEventListener('change', onEquipmentChange);
  el.estimate.addEventListener('click', onEstimate);

  /* Touche Entrée dans les champs numériques => lance l'estimation. */
  [el.volume, el.pressure, el.flow, el.head].forEach((inp) => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEstimate();
      }
    });
  });
}

/* Le script étant chargé en module (défer implicite), le DOM est prêt,
   mais on garde la sécurité DOMContentLoaded. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

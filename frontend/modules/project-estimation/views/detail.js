/* =========================================================================
 *  Project Estimation — VUE DÉTAIL D'UN PROJET (grille d'estimation)
 * -------------------------------------------------------------------------
 *  Affiche :
 *    1. L'en-tête du projet (nom, client, pays, date) + retour à la liste.
 *    2. Les équipements ajoutés depuis le module Equipment Estimation
 *       (suppression possible ligne par ligne).
 *    3. La grille d'estimation CAPEX (« Main Equipment » + « Bulk Material »)
 *       inspirée du modèle Excel : les colonnes blanches sont saisissables et
 *       persistées automatiquement dans le projet.
 *
 *  Toute la persistance passe par ProjectRepository (async) : la grille est
 *  stockée dans le champ `grid` du projet, indexée par code de catégorie.
 * ========================================================================= */

import { fmtEUR, fmtKg, fmtNum } from '../../../shared/js/format.js';
import { ProjectRepository } from '../../../shared/js/projects-repo.js';
import { MAIN_EQUIPMENT, BULK_MATERIAL, EDITABLE_COLUMNS } from '../grid-config.js';

/* Échappe le texte pour éviter toute injection dans le HTML. */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* Convertit une valeur de champ en nombre (chaîne vide -> 0). */
function toNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/* Coût total nominal apporté par les équipements ajoutés (module Equipment). */
function itemsTotal(project) {
  return (project.items || []).reduce(
    (sum, it) => sum + (it.unitCost || 0) * (it.quantity || 1),
    0
  );
}

/* Poids total (kg) apporté par les équipements ajoutés. */
function itemsWeight(project) {
  return (project.items || []).reduce(
    (sum, it) => sum + (it.unitWeightKg || 0) * (it.quantity || 1),
    0
  );
}

/* Coût d'une ligne de grille = fourniture + installation. */
function rowCost(cell) {
  return toNum(cell.supply) + toNum(cell.installation);
}

/* Total coût d'une section de grille (Main Equipment ou Bulk Material). */
function sectionCost(grid, defs) {
  return defs.reduce((sum, def) => sum + rowCost(grid[def.code] || {}), 0);
}

/* Total poids (tonnes) d'une section de grille. */
function sectionWeight(grid, defs) {
  return defs.reduce((sum, def) => sum + toNum((grid[def.code] || {}).weightTons), 0);
}

/* Construit les cellules saisissables d'une ligne de grille. */
function rowInputs(code, cell) {
  return EDITABLE_COLUMNS.map((col) => {
    const val = cell[col.key];
    return `
      <td class="px-2 py-1.5 border-l border-slate-100">
        <input type="number" step="any" min="0"
          data-code="${code}" data-key="${col.key}"
          value="${val === undefined || val === null ? '' : esc(val)}"
          class="grid-input w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm text-right
                 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 focus:bg-white" />
      </td>`;
  }).join('');
}

/* Construit les lignes HTML d'une section de grille. */
function sectionRows(grid, defs) {
  return defs
    .map((def) => {
      const cell = grid[def.code] || {};
      return `
      <tr class="hover:bg-slate-50/60">
        <td class="px-3 py-1.5 text-xs font-mono text-slate-400 whitespace-nowrap">${esc(def.code)}</td>
        <td class="px-3 py-1.5 text-sm text-slate-700 font-medium whitespace-nowrap">${esc(def.label)}</td>
        <td class="px-3 py-1.5 text-xs text-slate-400 whitespace-nowrap">${esc(def.unit) || '—'}</td>
        ${rowInputs(def.code, cell)}
        <td class="px-3 py-1.5 text-sm text-right font-semibold text-brand-800 whitespace-nowrap bg-slate-50"
            data-rowcost="${esc(def.code)}">${fmtEUR.format(rowCost(cell))}</td>
      </tr>`;
    })
    .join('');
}

/* En-têtes de colonnes de la grille. */
function gridHead() {
  const editable = EDITABLE_COLUMNS.map(
    (c) => `<th class="px-2 py-2 font-semibold text-right border-l border-slate-200">${esc(c.label)}</th>`
  ).join('');
  return `
    <tr class="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50">
      <th class="px-3 py-2 font-semibold">Code</th>
      <th class="px-3 py-2 font-semibold">Catégorie</th>
      <th class="px-3 py-2 font-semibold">Unité</th>
      ${editable}
      <th class="px-3 py-2 font-semibold text-right">Coût ligne</th>
    </tr>`;
}

/* Bloc « section » complet (titre + tableau). */
function gridSection(title, grid, defs, sectionId) {
  return `
    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div class="px-6 py-3 border-b border-slate-200 bg-brand-50">
        <h3 class="text-sm font-bold text-brand-900 uppercase tracking-wide">${esc(title)}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>${gridHead()}</thead>
          <tbody class="divide-y divide-slate-100">${sectionRows(grid, defs)}</tbody>
          <tfoot>
            <tr class="border-t-2 border-slate-200 bg-slate-50 font-bold text-brand-900">
              <td class="px-3 py-2" colspan="${3 + EDITABLE_COLUMNS.length}">Sous-total ${esc(title)}</td>
              <td class="px-3 py-2 text-right" data-sectiontotal="${sectionId}">${fmtEUR.format(
                sectionCost(grid, defs)
              )}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;
}

/* -----------------------------------------------------------------------
 *  Rendu principal de la vue détail.
 * --------------------------------------------------------------------- */
export async function renderProjectDetail(host, id) {
  const project = await ProjectRepository.get(id);

  /* Projet introuvable : message + retour liste. */
  if (!project) {
    host.innerHTML = `
      <div class="space-y-4">
        <a href="#/" class="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Retour aux projets
        </a>
        <div class="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          Projet introuvable.
        </div>
      </div>`;
    return;
  }

  /* La grille est stockée dans project.grid (indexée par code de catégorie). */
  const grid = project.grid || {};

  /* Lignes du tableau des équipements ajoutés depuis le module Equipment. */
  const itemRows = (project.items || []).length
    ? project.items
        .map(
          (it) => `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-2.5 text-sm font-semibold text-brand-800">${esc(it.equipmentLabel)}</td>
          <td class="px-4 py-2.5 text-xs font-mono text-slate-400">${esc(it.category) || '—'}</td>
          <td class="px-4 py-2.5 text-sm text-slate-600">${esc(it.characteristic) || '—'}</td>
          <td class="px-4 py-2.5 text-sm text-center text-slate-600">${it.quantity || 1}</td>
          <td class="px-4 py-2.5 text-sm text-right text-slate-600">${fmtEUR.format(it.unitCost || 0)}</td>
          <td class="px-4 py-2.5 text-sm text-right font-semibold text-brand-800">${fmtEUR.format(
            (it.unitCost || 0) * (it.quantity || 1)
          )}</td>
          <td class="px-4 py-2.5 text-right">
            <button data-remove-item="${esc(it.id)}" title="Retirer du projet"
              class="text-slate-400 hover:text-red-600 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="7" class="px-4 py-6 text-center text-slate-400 text-sm">
         Aucun équipement ajouté. Utilisez « Ajouter au Projet » depuis le module Equipment Estimation.
       </td></tr>`;

  const mainTotal = sectionCost(grid, MAIN_EQUIPMENT);
  const bulkTotal = sectionCost(grid, BULK_MATERIAL);
  const equipTotal = itemsTotal(project);
  const equipWeight = itemsWeight(project);
  const gridWeightT = sectionWeight(grid, MAIN_EQUIPMENT) + sectionWeight(grid, BULK_MATERIAL);
  const grandTotal = mainTotal + bulkTotal + equipTotal;

  host.innerHTML = `
    <div class="space-y-6">
      <!-- Retour + en-tête projet -->
      <div>
        <a href="#/" class="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900 font-semibold mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Retour aux projets
        </a>
        <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl font-extrabold text-brand-900 tracking-tight">${esc(project.name)}</h2>
              <dl class="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-sm text-slate-600">
                <div><dt class="inline font-semibold text-slate-500">Client :</dt> <dd class="inline">${esc(
                  project.client
                ) || '—'}</dd></div>
                <div><dt class="inline font-semibold text-slate-500">Pays :</dt> <dd class="inline">${esc(
                  project.country
                ) || '—'}</dd></div>
                <div><dt class="inline font-semibold text-slate-500">Date d'estimation :</dt> <dd class="inline">${esc(
                  project.estimationDate
                ) || '—'}</dd></div>
              </dl>
            </div>
            <div class="text-right">
              <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Total estimé</p>
              <p class="text-3xl font-extrabold text-accent-600" data-grandtotal>${fmtEUR.format(grandTotal)}</p>
              <p class="text-xs text-slate-400 mt-0.5">Estimation Classe 5 (indicative)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cartes de synthèse -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl ring-1 ring-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Équipements ajoutés</p>
          <p class="text-xl font-bold text-brand-800 mt-1" data-summary-equip>${fmtEUR.format(equipTotal)}</p>
          <p class="text-xs text-slate-400">${fmtKg.format(equipWeight)} kg</p>
        </div>
        <div class="bg-white rounded-xl ring-1 ring-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Main Equipment</p>
          <p class="text-xl font-bold text-brand-800 mt-1" data-summary-main>${fmtEUR.format(mainTotal)}</p>
        </div>
        <div class="bg-white rounded-xl ring-1 ring-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Bulk Material</p>
          <p class="text-xl font-bold text-brand-800 mt-1" data-summary-bulk>${fmtEUR.format(bulkTotal)}</p>
        </div>
        <div class="bg-white rounded-xl ring-1 ring-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Poids grille</p>
          <p class="text-xl font-bold text-brand-800 mt-1" data-summary-weight>${fmtNum.format(gridWeightT)} t</p>
        </div>
      </div>

      <!-- Équipements ajoutés depuis le module Equipment -->
      <section class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-base font-bold text-brand-900">Équipements ajoutés</h3>
          <p class="text-xs text-slate-500 mt-0.5">Éléments estimés puis importés depuis le module Equipment Estimation.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th class="px-4 py-3 font-semibold">Équipement</th>
                <th class="px-4 py-3 font-semibold">Cat.</th>
                <th class="px-4 py-3 font-semibold">Caractéristique</th>
                <th class="px-4 py-3 font-semibold text-center">Qté</th>
                <th class="px-4 py-3 font-semibold text-right">Coût unit.</th>
                <th class="px-4 py-3 font-semibold text-right">Total</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${itemRows}</tbody>
          </table>
        </div>
      </section>

      <!-- Grille d'estimation -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-extrabold text-brand-900 tracking-tight">Grille d'estimation CAPEX</h3>
          <span class="text-xs text-slate-400">Saisie automatiquement enregistrée</span>
        </div>
        ${gridSection('Main Equipment', grid, MAIN_EQUIPMENT, 'main')}
        ${gridSection('Bulk Material', grid, BULK_MATERIAL, 'bulk')}
      </section>
    </div>`;

  /* -----------------------------------------------------------------------
   *  Événements
   * --------------------------------------------------------------------- */

  /* Recalcule et rafraîchit les totaux affichés (sans re-render complet). */
  function refreshTotals(currentGrid) {
    const main = sectionCost(currentGrid, MAIN_EQUIPMENT);
    const bulk = sectionCost(currentGrid, BULK_MATERIAL);
    const equip = itemsTotal(project);
    const weightT = sectionWeight(currentGrid, MAIN_EQUIPMENT) + sectionWeight(currentGrid, BULK_MATERIAL);

    host.querySelector('[data-summary-main]').textContent = fmtEUR.format(main);
    host.querySelector('[data-summary-bulk]').textContent = fmtEUR.format(bulk);
    host.querySelector('[data-summary-weight]').textContent = `${fmtNum.format(weightT)} t`;
    host.querySelector('[data-sectiontotal="main"]').textContent = fmtEUR.format(main);
    host.querySelector('[data-sectiontotal="bulk"]').textContent = fmtEUR.format(bulk);
    host.querySelector('[data-grandtotal]').textContent = fmtEUR.format(main + bulk + equip);
  }

  /* Saisie dans la grille : mise à jour immédiate de la ligne + persistance. */
  host.querySelectorAll('.grid-input').forEach((input) => {
    input.addEventListener('input', async () => {
      const code = input.dataset.code;
      const key = input.dataset.key;

      /* Met à jour la copie locale de la grille. */
      grid[code] = grid[code] || {};
      grid[code][key] = input.value === '' ? '' : toNum(input.value);

      /* Rafraîchit le coût de la ligne concernée. */
      const rowCell = host.querySelector(`[data-rowcost="${code}"]`);
      if (rowCell) rowCell.textContent = fmtEUR.format(rowCost(grid[code]));

      /* Rafraîchit les totaux. */
      refreshTotals(grid);

      /* Persiste (async, point de migration BDD). */
      try {
        await ProjectRepository.update(id, { grid });
      } catch (err) {
        console.error('Enregistrement de la grille impossible :', err);
      }
    });
  });

  /* Retrait d'un équipement ajouté. */
  host.querySelectorAll('[data-remove-item]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (confirm('Retirer cet équipement du projet ?')) {
        await ProjectRepository.removeItem(id, btn.dataset.removeItem);
        renderProjectDetail(host, id); // re-render pour refléter le changement
      }
    });
  });
}

/* =========================================================================
 *  Project Estimation — VUE DÉTAIL D'UN PROJET (grille d'estimation)
 * -------------------------------------------------------------------------
 *  Reproduit le modèle Excel fourni :
 *    - Colonnes BLANCHES  = zones de saisie utilisateur (type 'input').
 *    - Colonnes JAUNES    = valeurs calculées (type 'calc'), recalculées à
 *                           chaque frappe.
 *    - Colonne « Weight » = teinte ardoise (comme le résultat « poids » du
 *                           module Equipment Estimation).
 *
 *  Chaque section (Main Equipment / Bulk Material) a ses propres colonnes,
 *  décrites dans grid-config.js. Les formules calculées y sont également
 *  définies (fonctions pures), prêtes à migrer côté back-end.
 *
 *  Persistance : la grille est stockée dans project.grid, indexée par code
 *  de catégorie, via ProjectRepository (async).
 * ========================================================================= */

import { fmtEUR, fmtKg, fmtNum } from '../../../shared/js/format.js?v=3.3';
import { ProjectRepository } from '../../../shared/js/projects-repo.js?v=3.3';
import {
  MAIN_EQUIPMENT,
  BULK_MATERIAL,
  MAIN_COLUMNS,
  BULK_COLUMNS,
  computeCell
} from '../grid-config.js?v=3.3';

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

/* Formate une valeur calculée selon le type de colonne. */
function fmtCalc(col, value) {
  if (col.money) return fmtEUR.format(value);
  if (col.key === 'costPerKg') return fmtNum.format(value); // €/kg (2 déc.)
  if (col.key === 'fieldMhrs') return fmtNum.format(value); // heures
  return fmtNum.format(value);
}

/* Total (somme) d'une colonne sur une section. */
function columnTotal(defs, grid, col, sectionId) {
  return defs.reduce((sum, def) => {
    const cell = grid[def.code] || {};
    if (col.type === 'calc') {
      return sum + (computeCell(sectionId, cell)[col.key] || 0);
    }
    return sum + toNum(cell[col.key]);
  }, 0);
}

/* Coût total (somme des coûts de ligne) d'une section. */
function sectionCost(defs, grid, sectionId) {
  return defs.reduce((sum, def) => sum + computeCell(sectionId, grid[def.code] || {}).rowCost, 0);
}

/* -----------------------------------------------------------------------
 *  Construction d'une cellule de colonne (input blanc ou calc jaune).
 * --------------------------------------------------------------------- */
function renderColumnCell(sectionId, code, col, cell) {
  if (col.type === 'input') {
    /* Zone de saisie utilisateur (fond blanc ; ardoise pour le poids). */
    const inputBg = col.weight ? 'bg-slate-50 focus:bg-white' : 'bg-white';
    const ring = col.weight ? 'focus:ring-slate-300 focus:border-slate-500' : 'focus:ring-brand-200 focus:border-brand-500';
    const val = cell[col.key];
    return `
      <td class="px-1.5 py-1 border-l border-slate-100 ${col.weight ? 'bg-slate-50/50' : ''}">
        <input type="number" step="any" min="0"
          data-code="${esc(code)}" data-key="${esc(col.key)}"
          value="${val === undefined || val === null ? '' : esc(val)}"
          class="grid-input w-full rounded border border-slate-200 ${inputBg} px-2 py-1 text-sm text-right ${ring} focus:ring-1" />
      </td>`;
  }

  /* Colonne calculée (fond jaune, lecture seule). */
  const computed = computeCell(sectionId, cell);
  return `
    <td class="px-2 py-1 border-l border-amber-100 bg-amber-50 text-right text-sm text-amber-900 tabular-nums"
        data-calc="${esc(code)}:${esc(col.key)}">${fmtCalc(col, computed[col.key] || 0)}</td>`;
}

/* Construit une ligne complète d'une section. */
function renderRow(sectionId, def, columns, grid) {
  const cell = grid[def.code] || {};
  const cells = columns.map((col) => renderColumnCell(sectionId, def.code, col, cell)).join('');
  const rowCost = computeCell(sectionId, cell).rowCost;
  return `
    <tr class="hover:bg-slate-50/60">
      <td class="px-3 py-1 text-xs font-mono text-slate-400 whitespace-nowrap">${esc(def.code)}</td>
      <td class="px-3 py-1 text-sm text-slate-700 font-medium whitespace-nowrap">${esc(def.label)}</td>
      <td class="px-3 py-1 text-xs text-slate-400 whitespace-nowrap">${esc(def.unit) || '—'}</td>
      ${cells}
      <td class="px-3 py-1 text-sm text-right font-semibold text-amber-900 whitespace-nowrap bg-amber-50 border-l border-amber-100"
          data-rowcost="${esc(def.code)}">${fmtEUR.format(rowCost)}</td>
    </tr>`;
}

/* En-tête de colonnes d'une section (marque visuellement input vs calc). */
function renderHead(columns) {
  const cols = columns
    .map((col) => {
      const tint = col.type === 'calc'
        ? 'bg-amber-100 text-amber-800'
        : col.weight
          ? 'bg-slate-100 text-slate-600'
          : 'bg-white text-slate-500';
      return `<th class="px-2 py-2 font-semibold text-right border-l border-slate-200 ${tint}">${esc(col.label)}</th>`;
    })
    .join('');
  return `
    <tr class="text-left text-[11px] uppercase tracking-wide border-b border-slate-200">
      <th class="px-3 py-2 font-semibold bg-slate-50 text-slate-500">Code</th>
      <th class="px-3 py-2 font-semibold bg-slate-50 text-slate-500">Catégorie</th>
      <th class="px-3 py-2 font-semibold bg-slate-50 text-slate-500">Unité</th>
      ${cols}
      <th class="px-3 py-2 font-semibold text-right bg-amber-100 text-amber-800 border-l border-amber-200">Coût ligne</th>
    </tr>`;
}

/* Pied de section : total par colonne + coût total de la section. */
function renderFoot(sectionId, columns, defs, grid) {
  const cols = columns
    .map((col) => {
      /* On ne totalise que les colonnes monétaires et le poids/heures. */
      const totalable = col.money || col.weight || col.key === 'fieldMhrs';
      if (!totalable) {
        return `<td class="px-2 py-2 border-l border-slate-200"></td>`;
      }
      const total = columnTotal(defs, grid, col, sectionId);
      const tint = col.type === 'calc' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-700';
      return `<td class="px-2 py-2 text-right border-l border-slate-200 ${tint}" data-coltotal="${sectionId}:${esc(col.key)}">${fmtCalc(
        col,
        total
      )}</td>`;
    })
    .join('');
  return `
    <tr class="border-t-2 border-slate-200 font-bold text-brand-900">
      <td class="px-3 py-2 bg-slate-50" colspan="3">Sous-total</td>
      ${cols}
      <td class="px-3 py-2 text-right bg-amber-100 text-amber-900 border-l border-amber-200" data-sectiontotal="${sectionId}">${fmtEUR.format(
        sectionCost(defs, grid, sectionId)
      )}</td>
    </tr>`;
}

/* Bloc « section » complet (titre + tableau). */
function renderSection(title, sectionId, defs, columns, grid) {
  return `
    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div class="px-6 py-3 border-b border-slate-200 bg-brand-50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-brand-900 uppercase tracking-wide">${esc(title)}</h3>
        <div class="flex items-center gap-3 text-[11px] text-slate-500">
          <span class="inline-flex items-center gap-1"><span class="inline-block h-3 w-3 rounded-sm bg-white ring-1 ring-slate-300"></span>Saisie</span>
          <span class="inline-flex items-center gap-1"><span class="inline-block h-3 w-3 rounded-sm bg-amber-100 ring-1 ring-amber-300"></span>Calculé</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>${renderHead(columns)}</thead>
          <tbody class="divide-y divide-slate-100">
            ${defs.map((def) => renderRow(sectionId, def, columns, grid)).join('')}
          </tbody>
          <tfoot>${renderFoot(sectionId, columns, defs, grid)}</tfoot>
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
         Aucun équipement ajouté. Utilisez « Ajouter au projet » depuis le module Equipment Estimation.
       </td></tr>`;

  const mainTotal = sectionCost(MAIN_EQUIPMENT, grid, 'main');
  const bulkTotal = sectionCost(BULK_MATERIAL, grid, 'bulk');
  const equipTotal = itemsTotal(project);
  const equipWeight = itemsWeight(project);
  const gridWeightT = columnTotal(MAIN_EQUIPMENT, grid, { key: 'weightTons', type: 'input' }, 'main');
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
          <p class="text-xl font-bold text-slate-700 mt-1" data-summary-weight>${fmtNum.format(gridWeightT)} t</p>
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
        ${renderSection('Main Equipment', 'main', MAIN_EQUIPMENT, MAIN_COLUMNS, grid)}
        ${renderSection('Bulk Material', 'bulk', BULK_MATERIAL, BULK_COLUMNS, grid)}
      </section>
    </div>`;

  /* -----------------------------------------------------------------------
   *  Événements
   * --------------------------------------------------------------------- */

  /* Recalcule et rafraîchit tous les totaux + cartes de synthèse. */
  function refreshTotals() {
    const main = sectionCost(MAIN_EQUIPMENT, grid, 'main');
    const bulk = sectionCost(BULK_MATERIAL, grid, 'bulk');
    const equip = itemsTotal(project);
    const weightT = columnTotal(MAIN_EQUIPMENT, grid, { key: 'weightTons', type: 'input' }, 'main');

    host.querySelector('[data-summary-main]').textContent = fmtEUR.format(main);
    host.querySelector('[data-summary-bulk]').textContent = fmtEUR.format(bulk);
    host.querySelector('[data-summary-weight]').textContent = `${fmtNum.format(weightT)} t`;
    host.querySelector('[data-sectiontotal="main"]').textContent = fmtEUR.format(main);
    host.querySelector('[data-sectiontotal="bulk"]').textContent = fmtEUR.format(bulk);
    host.querySelector('[data-grandtotal]').textContent = fmtEUR.format(main + bulk + equip);

    /* Totaux par colonne (pieds de section). */
    [['main', MAIN_EQUIPMENT, MAIN_COLUMNS], ['bulk', BULK_MATERIAL, BULK_COLUMNS]].forEach(
      ([sectionId, defs, columns]) => {
        columns.forEach((col) => {
          const el = host.querySelector(`[data-coltotal="${sectionId}:${col.key}"]`);
          if (el) el.textContent = fmtCalc(col, columnTotal(defs, grid, col, sectionId));
        });
      }
    );
  }

  /* Rafraîchit les cellules calculées (jaunes) d'une ligne donnée. */
  function refreshRow(sectionId, code, columns) {
    const cell = grid[code] || {};
    const computed = computeCell(sectionId, cell);
    columns.forEach((col) => {
      if (col.type === 'calc') {
        const el = host.querySelector(`[data-calc="${code}:${col.key}"]`);
        if (el) el.textContent = fmtCalc(col, computed[col.key] || 0);
      }
    });
    const rowEl = host.querySelector(`[data-rowcost="${code}"]`);
    if (rowEl) rowEl.textContent = fmtEUR.format(computed.rowCost);
  }

  /* Saisie dans la grille : recalcul immédiat de la ligne + totaux + persistance. */
  host.querySelectorAll('.grid-input').forEach((input) => {
    input.addEventListener('input', async () => {
      const code = input.dataset.code;
      const key = input.dataset.key;

      /* Met à jour la copie locale de la grille. */
      grid[code] = grid[code] || {};
      grid[code][key] = input.value === '' ? '' : toNum(input.value);

      /* Détermine la section de la ligne (Main ou Bulk). */
      const isMain = MAIN_EQUIPMENT.some((d) => d.code === code);
      const sectionId = isMain ? 'main' : 'bulk';
      const columns = isMain ? MAIN_COLUMNS : BULK_COLUMNS;

      refreshRow(sectionId, code, columns);
      refreshTotals();

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

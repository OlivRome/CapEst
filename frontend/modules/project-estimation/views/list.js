/* =========================================================================
 *  Project Estimation — VUE LISTE + CRÉATION DE PROJET
 * ========================================================================= */

import { fmtEUR } from '../../../shared/js/format.js?v=3.3';
import { ProjectRepository } from '../../../shared/js/projects-repo.js?v=3.3';

/* Liste de pays réutilisée pour le formulaire (alignée sur le module Equipment). */
const COUNTRIES = [
  'France', 'Allemagne', 'Suisse', 'États-Unis', 'Chine', 'Singapour',
  'Royaume-Uni', 'Italie', 'Espagne', 'Pays-Bas', 'Belgique', 'Autre'
];

/* Calcule le coût total nominal d'un projet (somme des lignes). */
function projectTotal(project) {
  return (project.items || []).reduce(
    (sum, it) => sum + (it.unitCost || 0) * (it.quantity || 1),
    0
  );
}

/* Échappe le texte pour éviter toute injection dans le HTML. */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* -----------------------------------------------------------------------
 *  Rendu principal de la vue liste.
 * --------------------------------------------------------------------- */
export async function renderProjectList(host) {
  const projects = await ProjectRepository.list();

  const countryOptions = COUNTRIES.map((c) => `<option value="${c}">${c}</option>`).join('');
  const today = new Date().toISOString().slice(0, 10);

  /* Lignes du tableau des projets. */
  const rows = projects.length
    ? projects
        .map(
          (p) => `
        <tr class="hover:bg-slate-50 cursor-pointer" data-open="${p.id}">
          <td class="px-4 py-3 font-semibold text-brand-800">${esc(p.name)}</td>
          <td class="px-4 py-3 text-slate-600">${esc(p.client) || '—'}</td>
          <td class="px-4 py-3 text-slate-600">${esc(p.country) || '—'}</td>
          <td class="px-4 py-3 text-slate-600">${esc(p.estimationDate) || '—'}</td>
          <td class="px-4 py-3 text-center text-slate-600">${(p.items || []).length}</td>
          <td class="px-4 py-3 text-right font-semibold text-brand-800">${fmtEUR.format(projectTotal(p))}</td>
          <td class="px-4 py-3 text-right">
            <button data-delete="${p.id}" title="Supprimer"
              class="text-slate-400 hover:text-red-600 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">
         Aucun projet pour l'instant. Créez votre premier projet ci-dessus.
       </td></tr>`;

  host.innerHTML = `
    <div class="space-y-8">
      <!-- Titre -->
      <section>
        <h2 class="text-2xl font-extrabold text-brand-900 tracking-tight">Project Estimation</h2>
        <p class="text-slate-600 text-sm sm:text-base mt-1">
          Créez un projet CAPEX puis estimez son coût total en agrégeant les équipements et lots.
        </p>
      </section>

      <!-- Formulaire de création -->
      <section class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-base font-bold text-brand-900">Créer un projet</h3>
        </div>
        <form id="create-form" class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label for="f-name" class="block text-sm font-semibold text-slate-700 mb-1.5">Nom du projet *</label>
            <input id="f-name" type="text" required placeholder="Ex. Nouvelle unité de production"
              class="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 py-2.5 px-3 text-sm border" />
          </div>
          <div>
            <label for="f-client" class="block text-sm font-semibold text-slate-700 mb-1.5">Client</label>
            <input id="f-client" type="text" placeholder="Ex. ACME Pharma"
              class="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 py-2.5 px-3 text-sm border" />
          </div>
          <div>
            <label for="f-country" class="block text-sm font-semibold text-slate-700 mb-1.5">Pays</label>
            <select id="f-country"
              class="w-full rounded-lg border-slate-300 bg-white shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 py-2.5 px-3 text-sm border">
              ${countryOptions}
            </select>
          </div>
          <div>
            <label for="f-date" class="block text-sm font-semibold text-slate-700 mb-1.5">Date d'estimation</label>
            <input id="f-date" type="date" value="${today}"
              class="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 py-2.5 px-3 text-sm border" />
          </div>
          <div class="sm:col-span-2 lg:col-span-4">
            <button type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:ring-accent-400/40 text-white font-semibold px-5 py-2.5 text-sm shadow transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Créer le projet
            </button>
          </div>
        </form>
      </section>

      <!-- Liste des projets -->
      <section class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-base font-bold text-brand-900">Projets en cours</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th class="px-4 py-3 font-semibold">Nom</th>
                <th class="px-4 py-3 font-semibold">Client</th>
                <th class="px-4 py-3 font-semibold">Pays</th>
                <th class="px-4 py-3 font-semibold">Date</th>
                <th class="px-4 py-3 font-semibold text-center">Équip.</th>
                <th class="px-4 py-3 font-semibold text-right">Total estimé</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${rows}</tbody>
          </table>
        </div>
      </section>
    </div>`;

  /* --- Événements --- */

  /* Création de projet. */
  const form = host.querySelector('#create-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = host.querySelector('#f-name').value.trim();
    if (!name) {
      host.querySelector('#f-name').focus();
      return;
    }
    const project = await ProjectRepository.create({
      name,
      client: host.querySelector('#f-client').value,
      country: host.querySelector('#f-country').value,
      estimationDate: host.querySelector('#f-date').value
    });
    /* Redirige vers le détail du projet nouvellement créé. */
    window.location.hash = `#/p/${project.id}`;
  });

  /* Ouverture d'un projet (clic sur une ligne). */
  host.querySelectorAll('[data-open]').forEach((tr) => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete]')) return; // ignore si clic sur supprimer
      window.location.hash = `#/p/${tr.dataset.open}`;
    });
  });

  /* Suppression d'un projet. */
  host.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Supprimer ce projet et toutes ses estimations ?')) {
        await ProjectRepository.remove(btn.dataset.delete);
        renderProjectList(host);
      }
    });
  });
}

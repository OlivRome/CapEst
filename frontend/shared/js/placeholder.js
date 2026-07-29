/* =========================================================================
 *  CAPEX Suite — Page « module à venir » (placeholder réutilisable)
 * -------------------------------------------------------------------------
 *  Rend une page cohérente pour les modules non encore développés.
 *  Chaque module planifié fournit son id via l'attribut data-module de
 *  l'élément #placeholder ; le contenu (titre, description, points prévus)
 *  est tiré du registre modules.js + d'un descriptif local optionnel.
 * ========================================================================= */

import { findModule } from './modules.js';
import { renderHeader, renderFooter } from './layout.js';

/* Points fonctionnels prévus par module (feuille de route indicative). */
const ROADMAP = {
  'project-breakdown': [
    'PBS — Product/Project Breakdown Structure',
    'WBS — Work Breakdown Structure',
    'CBS — Cost Breakdown Structure',
    'OBS — Organization Breakdown Structure',
    'Définition et rattachement des Cost Objects'
  ],
  'project-estimation': [
    'Agrégation des estimations d\'équipements',
    'Ajout de lots, coûts indirects et contingences',
    'Estimation du coût total du projet CAPEX',
    'Comparaison de scénarios'
  ],
  'cost-control': [
    'Cost Book — référentiel de suivi des coûts',
    'Suivi engagé / réalisé / reste à faire',
    'Écarts budgétaires et indicateurs',
    'Génération de rapports de Cost Control'
  ]
};

export function renderPlaceholder() {
  renderHeader();
  renderFooter();

  const host = document.getElementById('placeholder');
  if (!host) return;

  const id = host.dataset.module;
  const mod = findModule(id);
  const title = mod ? mod.title : 'Module';
  const tagline = mod ? mod.tagline : '';
  const points = ROADMAP[id] || [];

  const list = points
    .map(
      (p) => `
        <li class="flex items-start gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-brand-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span class="text-sm text-slate-700">${p}</span>
        </li>`
    )
    .join('');

  host.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            Bientôt disponible
          </span>
          <h2 class="text-lg font-bold text-brand-900">${title}</h2>
        </div>
        <div class="p-6 space-y-5">
          <p class="text-slate-600">${tagline}</p>

          <div>
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Fonctionnalités prévues</h3>
            <ul class="space-y-2">${list}</ul>
          </div>

          <div class="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            Ce module est en cours de conception. Il sera intégré à la CAPEX Suite
            dans une prochaine version.
          </div>

          <div class="pt-2">
            <a href="../../index.html"
               class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Retour au portail
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPlaceholder);
} else {
  renderPlaceholder();
}

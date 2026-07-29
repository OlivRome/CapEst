/* =========================================================================
 *  CAPEX Suite — Page d'accueil (portail)
 * -------------------------------------------------------------------------
 *  Génère les cartes des modules à partir du registre partagé (modules.js)
 *  et met en place l'en-tête / le pied de page communs.
 * ========================================================================= */

import { MODULES } from './shared/js/modules.js?v=3.3';
import { renderHeader, renderFooter } from './shared/js/layout.js?v=3.3';

/* Construit la carte HTML d'un module. */
function moduleCard(m) {
  const available = m.status === 'available';

  /* Badge d'état (disponible / bientôt). */
  const badge = available
    ? '<span class="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 bg-accent-500/10 px-2 py-0.5 rounded-full">Disponible</span>'
    : '<span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Bientôt disponible</span>';

  /* Bouton d'action : actif pour les modules disponibles, désactivé sinon. */
  const action = available
    ? `<span class="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 group-hover:gap-2.5 transition-all">
         Ouvrir le module
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
         </svg>
       </span>`
    : '<span class="text-sm font-medium text-slate-400">Module en développement</span>';

  /* La carte entière est cliquable uniquement si le module est disponible. */
  const wrapperTag = available ? 'a' : 'div';
  const wrapperAttrs = available
    ? `href="${m.path}" class="group block bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 hover:ring-accent-400 hover:shadow-md transition-all p-6"`
    : 'class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 opacity-80"';

  const iconColor = available ? 'text-accent-500 bg-accent-500/10' : 'text-brand-500 bg-brand-500/10';

  return `
    <${wrapperTag} ${wrapperAttrs}>
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 h-12 w-12 rounded-xl ${iconColor} flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            ${m.icon}
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-base font-bold text-brand-900">${m.title}</h3>
            ${badge}
          </div>
          <p class="mt-1.5 text-sm text-slate-600 leading-relaxed">${m.tagline}</p>
          <div class="mt-4">${action}</div>
        </div>
      </div>
    </${wrapperTag}>`;
}

/* Initialisation de la page. */
function init() {
  renderHeader();
  renderFooter();
  const grid = document.getElementById('module-grid');
  if (grid) grid.innerHTML = MODULES.map(moduleCard).join('');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

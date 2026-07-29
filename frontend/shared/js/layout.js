/* =========================================================================
 *  CAPEX Suite — LAYOUT PARTAGÉ (en-tête + navigation)
 * -------------------------------------------------------------------------
 *  Génère un en-tête corporate et une barre de navigation communs à toutes
 *  les pages, à partir du registre des modules (modules.js).
 *
 *  Utilisation dans une page :
 *    <header id="app-header" data-base="../../" data-active="equipment-estimation"></header>
 *    <script type="module">
 *      import { renderHeader } from '<chemin>/shared/js/layout.js';
 *      renderHeader();
 *    </script>
 *
 *  Attributs lus sur l'élément #app-header :
 *    data-base   : chemin relatif vers le dossier « frontend/ » (racine du site)
 *                  ex. depuis un module : "../../" ; depuis l'accueil : "./"
 *    data-active : id du module courant (onglet mis en évidence) — optionnel
 * ========================================================================= */

import { MODULES } from './modules.js';

/* Icône « usine » de la marque (réutilisée dans l'en-tête). */
const BRAND_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M4 21V10l5 3V10l5 3V7l6 4v10M9 21v-4m4 4v-4" />
  </svg>`;

/* -----------------------------------------------------------------------
 *  renderHeader()
 *  Remplit l'élément #app-header avec le logo, le titre et la navigation.
 * --------------------------------------------------------------------- */
export function renderHeader() {
  const host = document.getElementById('app-header');
  if (!host) return;

  const base = host.dataset.base || './'; // chemin vers frontend/
  const active = host.dataset.active || ''; // id du module actif

  /* Liens de navigation : accueil + un lien par module. */
  const navItems = [
    { label: 'Accueil', href: `${base}index.html`, id: '__home__' },
    ...MODULES.map((m) => ({ label: m.title, href: `${base}${m.path}`, id: m.id, status: m.status }))
  ];

  const navHtml = navItems
    .map((item) => {
      const isActive = item.id === active;
      /* Styles : onglet actif souligné, modules « planned » légèrement grisés. */
      const activeCls = isActive
        ? 'text-white border-accent-400'
        : 'text-brand-100 border-transparent hover:text-white hover:border-brand-300';
      const plannedBadge =
        item.status === 'planned'
          ? ' <span class="ml-1 text-[10px] uppercase tracking-wide text-brand-200/80">bientôt</span>'
          : '';
      return `<a href="${item.href}"
                 class="whitespace-nowrap px-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeCls}">
                ${item.label}${plannedBadge}
              </a>`;
    })
    .join('');

  host.className = 'bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white shadow-lg';
  host.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Bandeau titre -->
      <div class="py-5 flex items-center gap-4">
        <a href="${base}index.html" class="flex items-center gap-4 group">
          <div class="flex-shrink-0 h-11 w-11 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
            ${BRAND_ICON}
          </div>
          <div>
            <h1 class="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight leading-tight">
              CAPEX Suite
            </h1>
            <p class="text-brand-100 text-xs sm:text-sm font-medium">
              Outils d'ingénierie CAPEX &nbsp;•&nbsp; Life Sciences &amp; Oil &amp; Gas
            </p>
          </div>
        </a>
      </div>
      <!-- Navigation -->
      <nav class="flex items-center gap-5 overflow-x-auto border-t border-white/10">
        ${navHtml}
      </nav>
    </div>`;
}

/* -----------------------------------------------------------------------
 *  renderFooter()
 *  Remplit l'élément #app-footer (optionnel) avec un pied de page commun.
 * --------------------------------------------------------------------- */
export function renderFooter() {
  const host = document.getElementById('app-footer');
  if (!host) return;
  host.className = 'bg-brand-950 text-brand-200 text-xs';
  host.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>© ${new Date().getFullYear()} CAPEX Suite — Outils d'estimation et de contrôle des coûts.</p>
      <p class="text-brand-300">Life Sciences &amp; Oil &amp; Gas</p>
    </div>`;
}

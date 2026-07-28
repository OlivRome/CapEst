/* =========================================================================
 *  Configuration Tailwind CSS (mode CDN)
 * -------------------------------------------------------------------------
 *  Tailwind est chargé via CDN. Sa configuration doit obligatoirement être
 *  fournie en JavaScript AVANT le rendu, d'où ce fichier séparé.
 *  Il définit uniquement l'extension du thème (palette corporate + police).
 *
 *  IMPORTANT : ce fichier doit être inclus APRÈS le script du CDN Tailwind
 *  mais AVANT le contenu de la page (voir index.html).
 * ========================================================================= */

tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Bleu « ingénierie » — couleur principale de l'identité visuelle */
        brand: {
          50: '#eef4fb',
          100: '#d5e3f4',
          200: '#aec8e8',
          300: '#7ea6d8',
          400: '#4e80c4',
          500: '#2f63ac',
          600: '#234e8c',
          700: '#1c3f72',
          800: '#183460',
          900: '#132a4d',
          950: '#0d1b33'
        },
        /* Vert « validation » — utilisé pour le bouton d'action et les accents */
        accent: {
          400: '#22c69a',
          500: '#12a37c',
          600: '#0d8265'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  }
};

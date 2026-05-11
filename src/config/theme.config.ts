/**
 * THEME CONFIG — à modifier pour chaque nouveau client
 * Envoie un site de référence, des captures ou une fiche design
 * et on remplace ces valeurs en 30 minutes
 */
export const THEME_CONFIG = {
  colors: {
    primary:    '#E91E63',   // couleur principale (boutons, liens, accents)
    accent:     '#F48FB1',   // couleur secondaire claire
    light:      '#FCE4EC',   // fond léger (hover, badges)
    offWhite:   '#FDF8FA',   // fond global
    border:     '#FADADD',   // bordures subtiles
    textDark:   '#2D3748',   // texte principal
    textMuted:  '#718096',   // texte secondaire
  },
  borderRadius: '0.75rem',   // arrondi général des cartes/boutons
} as const;

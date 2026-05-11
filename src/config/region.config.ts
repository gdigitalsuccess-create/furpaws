/**
 * REGION CONFIG — à modifier pour chaque nouveau client
 * Devise, langue, zones de livraison et tarifs
 */
export const REGION_CONFIG = {
  currency:            'AED',
  currencyLocale:      'en-AE',       // ex: 'en-US', 'fr-FR', 'en-GB'
  currencyLocaleAr:    'ar-AE',       // version arabe du format

  shipping: {
    flatRate:          20,            // tarif par défaut si zone non trouvée
    freeThreshold:     250,           // commande gratuite au-dessus de ce montant
    zones: {
      'Sharjah':          15,
      'Ajman':            15,
      'Dubai':            20,
      'Umm Al Quwain':    20,
      'Abu Dhabi':        25,
      'Ras Al Khaimah':   25,
      'Fujairah':         30,
    } as Record<string, number>,
  },

  locales:    ['en', 'ar'] as const,  // langues actives du site
  defaultLocale: 'en' as const,
} as const;

/**
 * SITE CONFIG — à modifier pour chaque nouveau client
 * Toutes les infos identitaires du shop
 */
export const SITE_CONFIG = {
  name:           process.env.NEXT_PUBLIC_SITE_NAME     ?? 'FURPAWS',
  tagline:        process.env.NEXT_PUBLIC_SITE_TAGLINE  ?? 'Pet Accessories UAE',
  description:    process.env.NEXT_PUBLIC_SITE_DESC     ?? 'Premium pet accessories distributor in Sharjah, UAE.',
  domain:         process.env.NEXT_PUBLIC_APP_URL       ?? 'https://furpaws-uae.com',
  contactEmail:   process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@furpaws-uae.com',
  supportEmail:   process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@furpaws-uae.com',
  adminEmail:     process.env.ADMIN_EMAIL                ?? 'admin@furpaws-uae.com',
  twitter:        process.env.NEXT_PUBLIC_TWITTER        ?? '@furpaws_ae',
  ogLocale:       process.env.NEXT_PUBLIC_OG_LOCALE      ?? 'en_AE',
  logoPath:       '/logo.png',
  heroBgPath:     '/hero.jpg',
} as const;

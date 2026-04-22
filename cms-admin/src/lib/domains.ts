export const DEFAULT_PUBLIC_SITE_URL = 'https://hdmuscle.in';
export const DEFAULT_CMS_SITE_URL = 'https://cms.hdmuscle.in';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function ensureHttps(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export function normalizeUrl(value: string | null | undefined, fallback: string) {
  const raw = (value || '').trim();
  if (!raw) return trimTrailingSlash(fallback);

  try {
    return trimTrailingSlash(new URL(ensureHttps(raw)).toString());
  } catch {
    return trimTrailingSlash(fallback);
  }
}

export function getDefaultPublicSiteUrl() {
  return normalizeUrl(
    process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.STOREFRONT_URL,
    DEFAULT_PUBLIC_SITE_URL,
  );
}

export function getDefaultPrimaryDomain() {
  try {
    return new URL(getDefaultPublicSiteUrl()).hostname;
  } catch {
    return 'hdmuscle.in';
  }
}

export function normalizeDomain(value: string | null | undefined) {
  const raw = (value || '').trim();
  if (!raw) return '';

  const withoutProtocol = raw.replace(/^https?:\/\//i, '');
  return withoutProtocol.replace(/\/+$/, '');
}

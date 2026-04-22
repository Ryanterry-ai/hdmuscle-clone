const DEFAULT_PUBLIC_SITE_URL = 'https://hdmuscle.in';
const DEFAULT_CMS_SITE_URL = 'https://cms.hdmuscle.in';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getPublicSiteUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_PUBLIC_SITE_URL,
  );
}

export function getCmsApiBaseUrl() {
  return trimTrailingSlash(
    process.env.CMS_API || process.env.NEXT_PUBLIC_CMS_API_URL || `${DEFAULT_CMS_SITE_URL}/api`,
  );
}

export function getCmsPublishedEndpoint() {
  return trimTrailingSlash(
    process.env.CMS_STOREFRONT_PUBLISHED_URL || `${getCmsApiBaseUrl()}/storefront/published`,
  );
}

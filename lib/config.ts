// Site Configuration
// Update BASE_URL to your domain after deployment

export const siteConfig = {
  // Your base URL - change this after deploying
  baseUrl: "https://hdmuscle.com", // Change this to your domain after deployment
  
  // Original site (for reference)
  originalSite: "https://hdmuscle.com",
  
  // Currency settings
  currency: {
    symbol: "₹",
    code: "INR",
    rate: 92.5, // 1 USD = 92.5 INR
  },
  
  // Contact email
  contactEmail: "info@hdmuscle.com",
  
  // Social links
  social: {
    instagram: "https://www.instagram.com/hd.muscle/",
    facebook: "https://www.facebook.com/hd.muscle.supps/",
    youtube: "https://www.youtube.com/c/HDMuscle",
    tiktok: "https://www.tiktok.com/@hd.muscle",
  },
};

export function getProductUrl(handle: string): string {
  return `${siteConfig.baseUrl}/products/${handle}`;
}

export function getCollectionUrl(slug: string): string {
  return `${siteConfig.baseUrl}/collections/${slug}`;
}

export function getPageUrl(slug: string): string {
  return `${siteConfig.baseUrl}/pages/${slug}`;
}
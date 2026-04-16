const TECHNOLOGY_PATTERNS = [
  ["Shopify", [/shopify/i, /cdn\.shopify\.com/i, /shopify-section/i]],
  ["WordPress", [/wp-content/i, /wp-includes/i, /wordpress/i]],
  ["WooCommerce", [/woocommerce/i, /wc-ajax/i]],
  ["BigCommerce", [/bigcommerce/i, /stencil-utils/i]],
  ["Squarespace", [/squarespace/i, /static1\.squarespace/i]],
  ["Webflow", [/webflow/i, /w-webflow/i]],
  ["React", [/react/i, /data-reactroot/i, /__reactFiber/i]],
  ["Next.js", [/\bnext\b/i, /_next\//i, /__next/i]],
  ["Vue", [/\bvue\b/i, /data-v-/i]],
  ["Nuxt", [/\bnuxt\b/i, /__nuxt/i]],
  ["Gatsby", [/gatsby/i, /___gatsby/i]],
  ["Tailwind", [/tailwind/i, /--tw-/i]],
  ["Bootstrap", [/bootstrap/i, /navbar-expand/i]],
  ["Alpine.js", [/alpinejs/i, /x-data=/i]]
];

export function detectTechnologies(html = "") {
  const detected = [];

  for (const [label, patterns] of TECHNOLOGY_PATTERNS) {
    if (patterns.some(pattern => pattern.test(html))) {
      detected.push(label);
    }
  }

  if (!detected.length) {
    detected.push("Static HTML");
  }

  return detected;
}

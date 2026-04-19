const COMPONENT_PATTERNS = [
  ["Header", [/<header/i, /role=["']banner["']/i, /site-header/i]],
  ["Footer", [/<footer/i, /contentinfo/i, /site-footer/i]],
  ["Hero", [/class=["'][^"']*(hero|banner)[^"']*["']/i, /data-hero/i]],
  ["Mega Menu", [/mega-menu/i, /site-nav__dropdown/i, /data-mega-menu/i]],
  ["Product Grid", [/product-grid/i, /product-card/i, /card-product/i]],
  ["Collection Grid", [/collection-card/i, /featured-collection/i]],
  ["Carousel", [/carousel/i, /swiper/i, /flickity/i, /slick-/i]],
  ["Modal", [/modal/i, /dialog/i]],
  ["Accordion", [/accordion/i, /details>/i]],
  ["Announcement Bar", [/announcement/i, /promo-bar/i]],
  ["Sticky Header", [/sticky/i, /position:\s*sticky/i]]
];

export function detectComponents(html = "") {
  const detected = [];

  for (const [label, patterns] of COMPONENT_PATTERNS) {
    if (patterns.some(pattern => pattern.test(html))) {
      detected.push(label);
    }
  }

  return detected;
}

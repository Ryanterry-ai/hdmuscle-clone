import { detectTechnologies } from "./tech-detector.js";
import { detectComponents } from "./component-detector.js";
import { detectAnimations } from "./animation-detector.js";

export function profileSite(pages = []) {
  const technologies = new Set();
  const components = new Set();
  const animations = new Set();
  const pageTypeCounts = {};

  for (const page of pages) {
    const html = page.html || "";
    detectTechnologies(html).forEach(item => technologies.add(item));
    detectComponents(html).forEach(item => components.add(item));
    detectAnimations(html).forEach(item => animations.add(item));

    const type = page.typeHint || "generic";
    pageTypeCounts[type] = (pageTypeCounts[type] || 0) + 1;
  }

  const technologiesList = [...technologies];

  return {
    technologies: technologiesList,
    components: [...components],
    animations: [...animations],
    pageTypeCounts,
    strategy: {
      sourcePlatform:
        technologiesList.find(item =>
          ["Shopify", "WordPress", "WooCommerce", "BigCommerce"].includes(item)
        ) || technologiesList[0] || "Unknown",
      likelyClientRendered: technologiesList.some(item =>
        ["React", "Next.js", "Vue", "Nuxt", "Gatsby"].includes(item)
      ),
      requiresAnimationFallback: animations.size > 0
    }
  };
}

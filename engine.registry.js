export const ENGINES = {
  claude: {
    role: "Reasoning + UI + Shopify Theme Architecture",
    strengths: [
      "Liquid generation",
      "UI decomposition",
      "design system reasoning"
    ]
  },

  opencode: {
    role: "Automation Engine",
    strengths: [
      "Playwright crawling",
      "file generation",
      "asset downloading",
      "pipeline execution"
    ]
  },

  auto: {
    role: "Fallback Hybrid Engine",
    strengths: [
      "delegation",
      "task splitting"
    ]
  }
};

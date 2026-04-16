export function classifyTask(input) {
  if (input.includes("crawl")) return "crawl";
  if (input.includes("download")) return "asset-download";
  if (input.includes("product")) return "data-processing";
  if (input.includes("shopify") || input.includes("theme")) return "shopify-theme";

  return "automation";
}

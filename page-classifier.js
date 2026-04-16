export function classifyPage(page) {
  const html = page.html.toLowerCase();

  if (html.includes("add to cart") || html.includes("price")) {
    return "product";
  }

  if (html.includes("collection") || html.includes("category")) {
    return "collection";
  }

  if (html.includes("blog") || html.includes("article")) {
    return "blog";
  }

  return "generic";
}

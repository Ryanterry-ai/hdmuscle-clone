# HDMuscle Clone - Shopify Conversion Guide

This document provides step-by-step instructions to convert the Next.js clone to a deployable Shopify theme.

---

## Phase 1: Set Up Shopify Theme Development

### Step 1: Install Shopify CLI

```bash
# Install Shopify CLI (if not installed)
npm install -g @shopify/cli@latest

# Or via Homebrew (Mac)
brew tap shopify/shopify
brew install shopify
```

### Step 2: Create New Theme

```bash
# Create new theme from Shopify's baseline theme
shopify theme init hdmuscle-clone

# Or use Dawn theme as starting point
shopify theme init hdmuscle-clone --starting-point dawn
```

### Step 3: Directory Structure

Your Shopify theme should have this structure:

```
hdmuscle-clone/
├── assets/
│   ├── theme.css          (copy from Next.js globals.css)
│   ├── theme.js           (copy JS interactions)
│   └── images/
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
├── layout/
│   ├── theme.liquid       (main template)
│   └── password.liquid
├── locales/
│   └── en.default.json
├── sections/
│   ├── header.liquid
│   ├── hero.liquid
│   ├── best-sellers.liquid
│   ├── category-grid.liquid
│   ├── about-section.liquid
│   ├── testimonials.liquid
│   ├── faq.liquid
│   ├── trust-features.liquid
│   ├── newsletter.liquid
│   └── footer.liquid
├── snippets/
│   ├── product-card.liquid
│   └── ...
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    └── ...
```

---

## Phase 2: Convert Components

### Convert Header (header.liquid)

**From Next.js (Header.tsx):**
```tsx
<Link href="/" className="font-oswald text-sm font-medium text-[#1d1d1d] uppercase">
  HD MUSCLE
</Link>
<nav>{navLinks.map(...)}</nav>
```

**To Shopify Liquid:**
```liquid
<a href="{{ routes.root_url }}" class="font-oswald text-sm font-medium text-[#1d1d1d] uppercase">
  {{ shop.name }}
</a>
<nav class="site-nav">
  {% for link in linklists.main-menu.links %}
    <a href="{{ link.url }}">{{ link.title }}</a>
  {% endfor %}
</nav>
```

### Convert Product Card (snippets/product-card.liquid)

**From Next.js:**
```tsx
<Link href={`/products/${product.id}`}>
  <Image src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <span>${product.price}</span>
</Link>
```

**To Shopify Liquid:**
```liquid
<div class="product-card">
  <a href="{{ product.url }}">
    {{ product.featured_image | image_url: width: 400 | image_tag }}
    <h3>{{ product.title }}</h3>
    <span class="price">{{ product.price | money }}</span>
  </a>
</div>
```

### Convert Product Carousel (sections/best-sellers.liquid)

**From Next.js:**
```tsx
<div className="flex gap-3 overflow-x-auto">
  {products.map(product => <ProductCard product={product} />)}
</div>
```

**To Shopify Liquid:**
```liquid
<div class="product-grid swiper">
  <div class="swiper-wrapper">
    {% for product in collections['best-selling-collection'].products limit: 8 %}
      <div class="swiper-slide">
        {% render 'product-card', product: product %}
      </div>
    {% endfor %}
  </div>
</div>
```

---

## Phase 3: Convert CSS to Shopify CSS

### Step 1: Extract Tailwind to Plain CSS

The Tailwind utility classes need to be converted to standard CSS. Here's an example:

**Next.js:**
```tsx
className="font-oswald text-sm font-medium text-[#1d1d1d] uppercase hover:text-[#ffcc00] transition-colors"
```

**Shopify CSS (assets/theme.css):**
```css
.site-nav a {
  font-family: 'Oswald', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1d;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.site-nav a:hover {
  color: #ffcc00;
}
```

### Step 2: Key CSS Conversions

| Tailwind | Shopify CSS |
|----------|-------------|
| `flex` | `display: flex;` |
| `grid` | `display: grid;` |
| `hidden md:block` | `@media (min-width: 768px) { display: block; }` |
| `py-4` | `padding-top: 16px; padding-bottom: 16px;` |
| `px-4` | `padding-left: 16px; padding-right: 16px;` |
| `text-[#1d1d1d]` | `color: #1d1d1d;` |
| `bg-white` | `background-color: #ffffff;` |
| `uppercase` | `text-transform: uppercase;` |
| `tracking-wider` | `letter-spacing: 1px;` |
| `transition-colors` | `transition: color 0.3s ease;` |

---

## Phase 4: Use Shopify Liquid Objects

Replace Next.js data with Shopify Liquid:

| Next.js | Shopify Liquid |
|---------|----------------|
| `products` variable | `collection.products`, `search.results` |
| Static product data | `{{ product.title }}`, `{{ product.price }}` |
| Navigation array | `{% linklists.main-menu.links %}` |
| `/products/prohd-isolate` | `{{ product.url }}` |
| `/collections/pre-workouts` | `{{ collections['pre-workouts'].url }}` |

---

## Phase 5: Shopify-Specific Features

### Dynamic Sections (Theme Editor)
Add schema to make sections customizable:

```liquid
{% schema %}
{
  "name": "Best Sellers",
  "settings": [
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "BEST SELLERS"
    }
  ],
  "presets": [
    {
      "name": "Best Sellers"
    }
  ]
}
{% endschema %}
```

### Cart Functionality
Use Shopify's built-in cart:

```liquid
<a href="{{ routes.cart_url }}">Cart ({{ cart.item_count }})</a>

<!-- Add to cart form -->
<form action="{{ routes.cart_add_url }}" method="post">
  <input type="hidden" name="id" value="{{ product.variants.first.id }}">
  <button type="submit">Add to Cart</button>
</form>
```

---

## Phase 6: Upload & Deploy

### Step 1: Connect to Shopify Store

```bash
# Login to Shopify
shopify auth login

# Create development store (if needed)
shopify store create

# Connect to existing store
shopify theme connect
```

### Step 2: Push Theme

```bash
# Push to development
shopify theme push --development

# Or push to specific environment
shopify theme push -e production
```

### Step 3: Preview

```bash
# Open theme editor
shopify theme open --development
```

---

## Phase 7: Customization

### Config Files

**config/settings_schema.json** - Theme settings:
```json
[
  {
    "name": "Colors",
    "settings": [
      {
        "type": "color",
        "id": "color_primary",
        "label": "Primary Color",
        "default": "#1d1d1d"
      },
      {
        "type": "color",
        "id": "color_accent",
        "label": "Accent Color",
        "default": "#ffcc00"
      }
    ]
  }
]
```

### Use in Liquid
```liquid
<div style="background-color: {{ settings.color_primary }}">
  ...
</div>
```

---

## Key Differences: Next.js vs Shopify

| Aspect | Next.js | Shopify |
|--------|---------|---------|
| **Rendering** | Server-side JS | Liquid templates |
| **Data** | Static/dynamic JSON | Shopify API/Objects |
| **Routing** | React Router | Shopify routes |
| **State** | React hooks | Form submissions |
| **Images** | next/image | Liquid image_tag |
| **Styling** | Tailwind CSS | Plain CSS |
| **Components** | React components | Liquid snippets/sections |

---

## Quick Conversion Checklist

- [ ] Create Shopify theme directory
- [ ] Copy assets (CSS, JS, images)
- [ ] Convert all .tsx components to .liquid sections
- [ ] Replace static data with Shopify objects
- [ ] Add schema blocks for customization
- [ ] Test cart functionality
- [ ] Configure settings_schema.json
- [ ] Push and preview in Shopify
- [ ] Publish theme

---

## File Mapping Reference

| Next.js | Shopify |
|---------|---------|
| `src/app/page.tsx` | `templates/index.json` |
| `src/components/Header.tsx` | `sections/header.liquid` |
| `src/components/Footer.tsx` | `sections/footer.liquid` |
| `src/components/ProductCard.tsx` | `snippets/product-card.liquid` |
| `src/app/globals.css` | `assets/theme.css` |
| `src/lib/data.ts` | Shopify products/collections |

---

## Notes

- Use Shopify's [Liquid reference](https://shopify.dev/docs/api/liquid) for object documentation
- Test all interactive features (add to cart, navigation, mobile menu)
- Shopify has built-in mobile-responsive features
- Use Shopify's CDN for images (`{{ product.image | image_url: width: 400 }}`)
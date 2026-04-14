/**
 * Generate Shopify Theme
 * Usage: node scripts/generate-shopify-theme.js <url>
 */

const fs = require('fs-extra');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://www.morphogennutrition.com';
const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';

const OUTPUT_DIR = path.join(__dirname, '..', 'output', THEME_NAME);

async function generateTheme() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎨 GENERATE: Creating Shopify theme');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📦 Theme: ${THEME_NAME}`);
  
  // Create directories
  const dirs = ['layout', 'templates', 'sections', 'snippets', 'assets', 'config', 'locales'];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(OUTPUT_DIR, dir));
  }
  
  // Generate layout/theme.liquid
  const themeLiquid = `{% comment %} ${THEME_NAME} - Generated Theme {% endcomment %}
<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}" dir="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="">
  <link rel="canonical" href="{{ canonical_url }}">
  {%- if settings.favicon != blank -%}
    <link rel="icon" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
  {%- endif -%}
  
  {%- section 'header' -%}
  
  {{ content_for_header }}
  
  {%- style -%}
    :root {
      --font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      --color-background: #ffffff;
      --color-text: #1a1a1a;
      --color-primary: #1a1a1a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-family); color: var(--color-text); background: var(--color-background); }
    .page-width { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
  {%- endstyle -%}
  
  <script>{{ content_for_header }}</script>
</head>
<body class="gradient">
  <a class="skip-to-content-link button visually-hidden" href="#MainContent">Skip to content</a>
  
  <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
    {{ content_for_layout }}
  </main>
  
  {%- section 'footer' -%}
</body>
</html>`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'layout', 'theme.liquid'), themeLiquid);
  
  // Generate header section
  const headerSection = `{% comment %} Header Section {% endcomment %}
<style>
  .header { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 0 40px; }
  .header__inner { display: flex; align-items: center; justify-content: space-between; height: 80px; max-width: 1400px; margin: 0 auto; }
  .header__left { display: flex; align-items: center; gap: 30px; flex: 1; }
  .header__logo { font-size: 24px; font-weight: 700; text-decoration: none; color: #1a1a1a; }
  .header__nav { display: flex; gap: 20px; }
  .header__link { font-size: 13px; font-weight: 600; text-transform: uppercase; text-decoration: none; color: #1a1a1a; letter-spacing: 1px; }
  .header__right { display: flex; align-items: center; gap: 20px; }
  @media (max-width: 768px) { .header__nav { display: none; } }
</style>

{% schema %}
{
  "name": "Header",
  "settings": [],
  "blocks": []
}
{% endschema %}

<div class="header-wrapper">
  <header class="header">
    <div class="header__inner">
      <div class="header__left">
        <a href="/" class="header__logo">{{ shop.name }}</a>
        <nav class="header__nav">
          {% for link in linklists.main-menu.links %}
            <a href="{{ link.url }}" class="header__link">{{ link.title }}</a>
          {% endfor %}
        </nav>
      </div>
      <div class="header__right">
        <a href="/search">Search</a>
        <a href="/cart">Cart</a>
      </div>
    </div>
  </header>
</div>`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'sections', 'header.liquid'), headerSection);
  
  // Generate footer section
  const footerSection = `{% comment %} Footer Section {% endcomment %}
<style>
  .footer { background: #1a1a1a; color: #fff; padding: 60px 40px; }
  .footer__inner { max-width: 1400px; margin: 0 auto; }
  .footer__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
  .footer__title { font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
  .footer__link { color: #aaa; text-decoration: none; display: block; margin-bottom: 10px; font-size: 14px; }
  .footer__link:hover { color: #fff; }
  @media (max-width: 768px) { .footer__grid { grid-template-columns: 1fr; } }
</style>

{% schema %}
{
  "name": "Footer",
  "settings": []
}
{% endschema %}

<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid">
      <div>
        <h4 class="footer__title">{{ shop.name }}</h4>
        <p style="color: #aaa; font-size: 14px;">{{ shop.description }}</p>
      </div>
      <div>
        <h4 class="footer__title">Shop</h4>
        {% for link in linklists.footer.links %}
          <a href="{{ link.url }}" class="footer__link">{{ link.title }}</a>
        {% endfor %}
      </div>
      <div>
        <h4 class="footer__title">Support</h4>
        <a href="/pages/contact" class="footer__link">Contact</a>
        <a href="/pages/shipping" class="footer__link">Shipping</a>
        <a href="/pages/returns" class="footer__link">Returns</a>
      </div>
      <div>
        <h4 class="footer__title">Follow Us</h4>
        <p style="color: #aaa; font-size: 14px;">Stay updated with us</p>
      </div>
    </div>
    <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
      &copy; {{ 'now' | date: '%Y' }} {{ shop.name }}. All rights reserved.
    </div>
  </div>
</footer>`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'sections', 'footer.liquid'), footerSection);
  
  // Generate index.json template
  const indexTemplate = {
    sections: {
      main: { type: 'main-page' },
      header: { type: 'header', settings: {} },
      featured: { type: 'featured-collection', settings: { title: 'Featured Products' } },
      footer: { type: 'footer', settings: {} }
    },
    order: ['header', 'main', 'featured', 'footer']
  };
  
  await fs.writeJson(path.join(OUTPUT_DIR, 'templates', 'index.json'), indexTemplate);
  
  // Generate settings
  const settingsData = {
    current: 'default',
    presets: [{
      name: 'Default',
      colors: { accent: '#000000', button_background: '#000000', button_label: '#ffffff' }
    }]
  };
  
  await fs.writeJson(path.join(OUTPUT_DIR, 'config', 'settings_data.json'), settingsData);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ GENERATE Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📁 Theme files created in: ${OUTPUT_DIR}`);
  
  return OUTPUT_DIR;
}

generateTheme().catch(console.error);

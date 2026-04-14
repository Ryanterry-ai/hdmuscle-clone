# AI Website → Shopify Theme Generator Skill

## Skill Name

AI Website to Shopify Theme Generator

## Skill Type

Multi-Agent | Model-Agnostic | Automation-First

---

# Supported Execution Engines

This skill supports:

- Claude
- OpenCode
- GPT
- Gemini
- Cursor
- Windsurf
- Cline
- Local Models

Execution engine must be selected dynamically.

---

# Primary Objective

Convert any website URL into:

- Pixel-Perfect Website Clone
- Fully Working Shopify Theme
- Valid Shopify Upload ZIP
- Product Import Files

---

# High Level Workflow

1. Execution Engine Detection
2. Website Discovery
3. Browser Automation Crawl
4. Asset Extraction
5. UI Component Extraction
6. Interaction Extraction
7. Shopify Theme Conversion
8. Product Extraction
9. Theme Validation
10. Shopify Upload ZIP Generation

---

# Multi-Agent Architecture

## 1. Execution Agent

Responsibilities:

- Detect execution engine
- Route commands
- Manage workflow

---

## 2. Discovery Agent

Responsibilities:

- Extract all URLs
- Extract sitemap
- Find product pages
- Find collection pages

Tools:

- sitemap.xml
- crawling scripts
- browser automation

---

## 3. Browser Agent

Responsibilities:

- Load dynamic content
- Load lazy images
- Extract interactions

Tools:

- Playwright
- Chrome MCP
- Puppeteer

---

## 4. Asset Agent

Responsibilities:

Download:

- Images
- CSS
- JS
- Fonts
- Videos

---

## 5. UI Extraction Agent

Extract:

- Header
- Footer
- Hero
- Sections
- Components

---

## 6. Interaction Agent

Extract:

- Hover effects
- Scroll effects
- Animations
- Sticky behavior
- Tabs

---

## 7. Shopify Conversion Agent

Convert:

HTML → Shopify Liquid

Generate:

layout/theme.liquid  
sections/*.liquid  
templates/*.liquid  
snippets/*.liquid  

---

## 8. Product Extraction Agent

Extract:

- Title
- Price
- Variants
- Images
- Description

Generate:

products.csv

---

## 9. Validation Agent

Check:

- Missing theme.liquid
- Broken assets
- Invalid Liquid syntax
- Shopify folder structure

---

## 10. Packaging Agent

Generate:

theme.zip

Valid Shopify Upload

---

# Folder Structure Generated

theme/

layout/  
templates/  
sections/  
snippets/  
assets/  
config/  
locales/  

---

# Automation Requirements

The skill must:

- Automatically crawl website
- Automatically download assets
- Automatically generate Shopify theme
- Automatically validate theme
- Automatically generate zip

---

# Automation Scripts

Scripts Required:

- crawl-site.js
- extract-assets.js
- download-images.js
- extract-products.js
- generate-shopify-theme.js
- validate-theme.js
- build-theme-zip.js

---

# Execution Rules

Always:

- Use browser automation
- Extract full site
- Extract all pages
- Extract responsive UI

Never:

- Manually guess UI
- Skip interactions
- Skip assets

---

# Required Tools

Must Support:

Playwright  
Chrome MCP  
NodeJS  
Shopify CLI  

---

# Install Commands

Node

npm install playwright  
npm install axios  
npm install cheerio  
npm install fs-extra  
npm install archiver  

Install Playwright

npx playwright install

Install Shopify CLI

npm install -g @shopify/cli

---

# Output

Final Output:

Pixel Perfect Shopify Theme

Ready For Upload

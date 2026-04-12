# NEED Supplements - Design Documentation

## Overview
This document contains all design tokens, patterns, and specifications for the NEED Supplements Next.js clone.

---

## Color Palette

| Token | Hex Code | Usage |
|-------|----------|-------|
| `--header-bg-col` | `#1d1d1d` | Header, Footer, Hero backgrounds |
| `--main-nav-link-hover-col` | `#ffd100` | Navigation hover, links |
| `--btn-bg-color` | `#ffcc00` | Primary button background, badges |
| `--body-bg-color` | `255 255 255` | Page background |
| `--text-primary` | `#1d1d1d` | Headings, primary text |
| `--text-secondary` | `#737373` | Secondary text, prices |
| `--text-muted` | `#a0a0a0` | Muted text, footer links |
| `--bg-light` | `#fafafa` | Card backgrounds, sections |
| `--border-color` | `#e5e5e5` | Borders, dividers |

---

## Typography

### Font Families

| Font | Weights | Usage |
|------|---------|-------|
| **Oswald** | 300, 400, 500, 600, 700 | Headings, navigation, product titles, buttons |
| **Roboto** | 300, 400, 500, 700 | Body text, paragraphs, form inputs |

### Font Sizes

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 32-42px | Bold (700) | 1.2 |
| H2 (Section) | 22-30px | Bold (700) | 1.3 |
| H3 (Card) | 14-18px | Medium (500) | 1.4 |
| Body | 13-15px | Regular (400) | 1.5 |
| Small | 11-13px | Regular (400) | 1.5 |
| Nav Links | 13px | Medium (500) | 1 |

### Letter Spacing
- Headings: `tracking-[1px]`
- Navigation: `tracking-[0.5px]`

---

## Spacing System

| Token | Value |
|-------|-------|
| `--page-container-width` | 1100px |
| `--reading-container-width` | 720px |
| `--gutter-large` | 30px |
| `--gutter-desktop` | 20px |
| `--gutter-mobile` | 16px |
| `--section-padding` | 50px |

### Common Spacing Classes
- Section padding: `py-10 md:py-12`
- Container padding: `px-4`
- Card padding: `p-3 md:p-4`
- Gap between items: `gap-4`, `gap-6`

---

## Layout

### Container
- Max width: 1100px
- Centered with `mx-auto`
- Padding: 16px (mobile), 20px (desktop)

### Grid Systems

| Grid | Columns | Breakpoints |
|------|---------|-------------|
| Product Grid | 2 → 3 → 4 | sm:2, md:3, lg:4 |
| Category Grid | 2 → 3 → 6 | sm:2, md:3, lg:6 |
| Footer Grid | 2 → 4 | md:4 |
| Blog Grid | 1 → 2 → 3 | md:2, lg:3 |

---

## Components

### Announcement Bar
- Background: `#ffcc00`
- Height: ~32px
- Contains: Social icons (left), marquee text (center), country/lang selector (right)
- Font size: 11-13px

### Header
- Background: `#1d1d1d`
- Padding: 12px 20px (py-3 md:py-4)
- Contains: Logo, navigation links, search icon, account icon, cart icon
- Logo width: 140px (mobile), 180px (desktop)
- Sticky on scroll

### Navigation Links
- Color: `#fafafa`
- Hover: `#ffd100`
- Font: Oswald, 13px, tracking 0.5px

### Mobile Navigation
- Background: `#1d1d1d`
- Horizontal scroll with `overflow-x-auto`
- Text: white, 11px, Oswald

### Hero Section
- Full-width container
- Max height: 550px
- Image: object-cover

### Product Card
- Background: `#fafafa`
- Aspect ratio: 3/4
- Border radius: rounded-md
- Hover: scale-105 transform
- Contains: Image, sale badge, sold-out overlay, title, rating, price

### Sale Badge
- Background: `#ffcc00`
- Text: black
- Font: bold, 11px
- Position: top-left

### Sold Out Overlay
- Background: black/50
- Contains: "Sold out" white badge

### Carousel
- Navigation: Arrow buttons (left/right)
- Arrow style: white bg, shadow, rounded-full
- Transition: 300ms ease-in-out

### Footer
- Background: `#1d1d1d`
- Text: white (headings), `#a0a0a0` (links)
- 4-column grid (2 on mobile)
- Newsletter form at bottom

### Buttons

| Type | Style |
|------|-------|
| Primary | `bg-[#ffcc00] text-black font-bold px-4 py-2 rounded hover:bg-[#ffd100]` |
| Secondary | `bg-[#1d1d1d] text-white px-4 py-2 rounded` |
| Nav | `text-white hover:text-[#ffd100]` |

### Form Inputs
- Border: 1px solid `#e5e5e5`
- Padding: px-3 py-2
- Focus: `border-[#1d1d1d]` outline

### Filter Sidebar
- Width: 220px (desktop)
- Sections: Availability, Price Range
- Checkbox: accent `#1d1d1d`

### Sort Dropdown
- Border: 1px solid `#e5e5e5`
- Background: white
- Padding: px-2 py-1

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| sm | 640px | 2-col grids |
| md | 768px | 3-col grids, sidebar visible |
| lg | 1024px | Full layouts, 4-6 col grids |
| xl | 1280px | Max container 1100px |

---

## Animations

| Animation | CSS | Usage |
|-----------|-----|-------|
| Hover scale | `group-hover:scale-105` | Product cards |
| Marquee | `@keyframes` | Announcement bar |
| Fade in | `animate-fade-in` | Sections |
| Transition | `transition-colors duration-300` | Links, buttons |

---

## Page-Specific Styles

### Homepage
- Announcement bar: yellow (#ffcc00)
- Hero: dark bg with full-width image
- Best Sellers: carousel with 4 products visible
- Categories: 6-column grid with image overlays
- Muscle Products: 7-column carousel

### Collection Page
- Breadcrumb: gray bg (#fafafa)
- Hero: dark bg (#1d1d1d), centered uppercase title
- Utility bar: flex with filter toggle and sort

### Product Detail
- Two-column layout (images left, info right)
- Gallery: main image + thumbnail strip
- Variant selector: radio buttons or dropdown
- Quantity: +/- buttons with input

### Cart
- Item table with image, name, quantity, price
- Summary card on right (desktop)

### Checkout
- Step indicator at top
- Multi-step form (Info → Payment → Confirmation)
- Order summary sidebar

---

## SVG Icons Used
- Facebook, YouTube, Instagram (social)
- Search, User, Cart (header icons)
- Arrow left/right (carousel)
- Check (confirmation)
- Star (reviews)
- Plus/minus (quantity)

---

## Backgrounds
- Primary sections: `bg-white`
- Secondary sections: `bg-[#fafafa]`
- Header/Footer: `bg-[#1d1d1d]`
- Accent/CTA: `bg-[#ffcc00]`

---

*Last updated: April 2026*
*For use with Next.js + Tailwind CSS clone*
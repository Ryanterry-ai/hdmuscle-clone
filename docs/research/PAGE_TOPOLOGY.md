# HDMuscle Website Clone - Specification

## Target URL
https://hdmuscle.com/

## Phase 1: Global Design Tokens

### Colors (Extracted from live site)
- Primary: #1d1d1d (black text)
- Secondary: #ffffff (white)
- Accent: #ffcc00 (yellow/gold - used for badges, hover states)
- Muted: #737373 (gray for secondary text)
- Background: #ffffff (white)
- Border: #e5e5e5 (light gray)

### Typography
- Primary Font: System fonts (likely Shopify font stack)
- Headings: Oswald / bold weight for navigation
- Body: System default sans-serif

### Layout
- Max container width: 1100px
- Padding: 16px (mobile), 32px (desktop)

## Page Topology

1. **Header** - Sticky, contains logo, navigation, search, cart
2. **Hero Section** - Large banner image with CTA
3. **Trust Badges** - Row of 5-6 icons (Heavy Metals, Formulas, No Dyes, 3rd Party, Properly Dosed, Registered)
4. **Category Grid** - 4 columns (Health + Wellness, Pre-workout, Intra-workout, Post-workout)
5. **Best Sellers** - Product carousel with 8+ products
6. **New + Noteworthy** - 4 products horizontal
7. **About Section** - Image + text block
8. **Reviews** - 3 testimonial cards with stars
9. **Apparel Section** - New arrivals with 4 products
10. **FAQ** - Accordion style questions
11. **Trust Features** - 4 columns (Easy Returns, Fast Shipping, Guarantee, Secure Checkout)
12. **Newsletter** - Email signup form
13. **Footer** - Links, social icons, payment methods

## Components to Build
- Header.tsx (with mega menu, mobile nav)
- Hero.tsx
- TrustBadges.tsx
- CategoryGrid.tsx
- BestSellers.tsx (with ProductCarousel)
- NewProducts.tsx
- AboutSection.tsx
- Testimonials.tsx
- ApparelSection.tsx
- FAQ.tsx
- TrustFeatures.tsx
- Newsletter.tsx (exists)
- Footer.tsx (exists)

## Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
---
name: Universal CMS UI/UX Design System
description: Defines UI, UX, layout, and interaction rules to ensure CMS-driven websites remain visually stable, responsive, and consistent across all updates.
version: 1.0.0
authors:
  - OpenAI
tags:
  - design-system
  - ui
  - ux
  - frontend
  - cms
  - layout
  - responsive
  - animation
---

# 🎨 Universal CMS UI/UX Design System

## Purpose

This document defines the **design rules and constraints** that must be followed when building or modifying any website using the CMS system.

Its goal is to ensure:

✔ UI consistency  
✔ Layout stability  
✔ Responsive behavior  
✔ Safe CMS updates  
✔ Pixel-perfect rendering  

---

# ⚠️ CRITICAL DESIGN PRINCIPLE

## NEVER BREAK THE FRONTEND

The system must ensure:

- No layout shift due to CMS changes
- No broken spacing
- No invalid component rendering
- No UI distortion across devices

---

# 🧱 LAYOUT SYSTEM

## Grid System

Use:

- 12-column responsive grid
- Max width: `1280px` or `1440px`
- Container padding:
  - Desktop: `px-6`
  - Tablet: `px-4`
  - Mobile: `px-3`

---

## Section Spacing

Standard spacing:

- Section top/bottom: `60px – 100px`
- Inner spacing: `20px – 40px`

Never allow CMS to override spacing arbitrarily.

---

# 🧩 COMPONENT RULES

## 1. HERO SECTION

### Required fields:
- title
- subtitle
- CTA button
- background image

### Constraints:
- title max length: 80 chars
- subtitle max length: 160 chars
- max 2 buttons
- image must be high resolution

---

## 2. BUTTONS

### Rules:
- max text length: 20 chars
- always include hover state
- consistent padding
- consistent radius

---

## 3. IMAGES

### Rules:
- enforce aspect ratio:
  - hero: 16:9
  - product: 1:1
- lazy loading enabled
- always include alt text

---

## 4. TEXT CONTENT

### Rules:
- max paragraph width: 600–700px
- enforce readable line height
- no long unbroken strings

---

# 📱 RESPONSIVE DESIGN RULES

## Breakpoints

- Mobile: < 640px
- Tablet: 640–1024px
- Desktop: 1024px+

---

## Responsive Behavior

- stack columns on mobile
- maintain spacing consistency
- avoid overflow issues
- ensure clickable areas are large enough

---

# 🎞️ ANIMATION RULES

## Allowed animations:
- fade-in
- slide-up
- scale-in
- hover transitions

## Do NOT:
- overuse animations
- block rendering
- use heavy JS animations unnecessarily

---

# 🧱 CMS BLOCK SYSTEM RULES

## Block Structure

Each block must include:

```json
{
  "type": "hero",
  "visible": true,
  "order": 1,
  "data": {}
}

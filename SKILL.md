# SKILL.md
# Universal CMS + Admin + API System Builder

## Skill Name
Universal CMS & Commerce System Builder

---

# 🎯 PURPOSE

This skill is used to design and implement a **production-grade CMS + Admin + API system** for ANY website.

Supported use cases:

- Cloned Shopify websites
- Static website exports
- Existing eCommerce platforms
- Custom-built websites
- Business landing pages
- SaaS websites

---

# 🌍 UNIVERSAL OBJECTIVE

Transform ANY website into a **fully manageable system** where admins can:

- update content safely
- manage products (if applicable)
- control UI sections
- manage users and orders
- run marketing campaigns
- integrate payments
- handle forms and leads
- scale business operations

WITHOUT breaking:
- UI design
- layout structure
- responsiveness
- existing interactions

---

# ⚠️ CRITICAL RULES

## 1. FRONTEND SAFETY FIRST
Never allow CMS to break UI.

Admins should NOT:
- break layout
- inject unsafe HTML
- distort design
- remove required structure

---

## 2. SCHEMA-DRIVEN CONTENT ONLY
All editable content must follow defined schemas.

NO uncontrolled HTML editing.

---

## 3. DESIGN PRESERVATION
The CMS must:
- update content
- NOT redesign frontend

---

## 4. UNIVERSAL COMPATIBILITY
The system must work for:

- eCommerce websites
- service websites
- content websites
- landing pages

---

## 5. API-FIRST APPROACH
System must be:
- headless
- modular
- scalable

---

# 🧠 RECOMMENDED STACK

Frontend:
- Next.js

Backend:
- Node.js (NestJS preferred)

Database:
- PostgreSQL

ORM:
- Prisma

Cache:
- Redis

Queue:
- BullMQ

Search:
- Meilisearch (preferred)

Storage:
- Cloudinary / S3 / R2

Auth:
- JWT + RBAC

Payments (optional if commerce):
- Razorpay
- PhonePe
- Stripe-ready abstraction

---

# 🧱 CORE CAPABILITIES

## 1. SYSTEM ARCHITECTURE
- modular apps
- reusable packages
- scalable services

---

## 2. DATABASE DESIGN
- relational schema
- CMS + commerce modeling
- indexing + performance

---

## 3. API ENGINE
- REST APIs
- auth APIs
- admin APIs
- public APIs

---

## 4. CMS ENGINE
- structured content models
- reusable blocks
- safe editing

---

## 5. PAGE BUILDER SYSTEM
- block-based layout control
- drag-drop ordering
- validation

---

## 6. MEDIA SYSTEM
- upload
- optimize
- CDN delivery

---

## 7. USER MANAGEMENT
- admin roles
- permissions
- RBAC

---

## 8. FORM SYSTEM
- custom forms
- submissions
- validation
- integrations

---

## 9. POPUP SYSTEM
- exit intent
- timed
- scroll-based

---

## 10. MARKETING SYSTEM
- campaigns
- newsletters
- lead tracking

---

## 11. SEO SYSTEM
- meta fields
- sitemap
- canonical control

---

## 12. LOCALIZATION
- languages
- currencies
- translations

---

## 13. ANALYTICS HOOKS
- event tracking
- integrations

---

## 14. COMMERCE (OPTIONAL MODULE)

If website is eCommerce:

### Includes:
- products
- categories
- collections
- inventory
- orders
- customers
- payments
- discounts
- affiliates

---

# 🧩 CMS MODULES

## Content Modules
- Pages
- Blogs
- Policies
- Hero sections
- Homepage sections
- Navigation menus
- Footer/header
- Announcement bars

## Business Modules
- Products (optional)
- Orders (optional)
- Customers (optional)

## Marketing Modules
- Popups
- Forms
- Newsletter
- Campaigns

## System Modules
- Media library
- SEO manager
- Localization
- Settings
- Audit logs
- Admin users

---

# 🧱 PAGE BUILDER RULES

Use block-based system:

## Block Types:
- hero
- banner
- text + image
- grid
- testimonials
- FAQ
- CTA
- newsletter
- custom blocks

## Each block must define:
- schema
- validation rules
- max limits
- safe fields

---

# 🔐 SAFETY RULES

Always enforce:

- field validation
- content limits
- image constraints
- safe linking
- fallback values

---

# 🔄 CONTENT VERSIONING

Support:
- draft
- publish
- archive
- rollback

---

# 👥 ROLE SYSTEM

Minimum roles:

- Super Admin
- Content Manager
- Marketing Manager
- Viewer

---

# 💳 PAYMENT SYSTEM (OPTIONAL)

Support:
- Razorpay
- PhonePe
- Stripe abstraction
- COD

---

# 🧾 DISCOUNT SYSTEM (OPTIONAL)

- coupon codes
- cart rules
- product discounts

---

# 🧑‍🤝‍🧑 AFFILIATE SYSTEM (OPTIONAL)

- referral codes
- commission tracking

---

# 📦 DATABASE ENTITIES

Core:

- AdminUser
- Role
- Permission
- Page
- BlogPost
- MediaAsset
- NavigationMenu
- SectionBlock
- Form
- FormSubmission
- Subscriber
- Campaign
- Setting
- AuditLog

Commerce (if needed):

- Product
- ProductVariant
- Category
- Collection
- Inventory
- Order
- OrderItem
- Customer
- Payment
- Discount
- Affiliate

---

# 🏗️ PROJECT STRUCTURE

```txt
/apps
  /frontend
  /admin
  /api

/packages
  /db
  /auth
  /cms
  /commerce
  /shared

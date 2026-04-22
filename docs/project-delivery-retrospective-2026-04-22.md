# HD Muscle India Storefront + CMS Delivery Retrospective

Date: April 22, 2026  
Projects: `hdmuscle.in` (storefront), `cms.hdmuscle.in` (admin)

## 1. What We Delivered

1. Storefront visual parity work against `hdmuscle.com` with India localization rules.
2. INR-first behavior preserved across pricing and announcement flows.
3. Header and mega navigation alignment to HD Muscle reference style.
4. Hero section + CTA placement refinements with local assets.
5. Homepage section rhythm and merchandising structure parity improvements.
6. Product and collection page parity passes, including PDP controls and layout.
7. CMS expansion for day-to-day non-technical content management.
8. Media upload UX improvements across product, collection, page, homepage, and logo settings.
9. Domain-ready production setup for `hdmuscle.in` and `cms.hdmuscle.in`.
10. Final payment UI cleanup to show only Razorpay + Snapmint messaging.

## 2. Major Problems Encountered and Fixes Applied

1. Problem: Top nav/mega menu structure did not match reference.
Solution: Reworked header spacing, logo area sizing, center nav alignment, hover panel structure, column spacing, and featured product block in mega panel.

2. Problem: Hero and CTA looked oversized/misaligned compared to reference.
Solution: Tuned hero height, object-fit/object-position, and CTA coordinates and sizing for desktop/mobile parity.

3. Problem: Announcement text and currency sometimes drifted to USD-like copy.
Solution: Added INR default normalization and fallback sanitization (`$`, `USD`, malformed values fallback to INR shipping text).

4. Problem: Navigation labels and submenu mappings were incomplete/inconsistent.
Solution: Added strict nav fallback strategy to preserve HD reference taxonomy and richer submenu column mapping.

5. Problem: Product cards/sliders had missing controls and mismatch in section behavior.
Solution: Added/normalized row controls and parity pass on section label rows and carousel actions.

6. Problem: Some product links/handles and image mappings were broken or mismatched.
Solution: Hardened product handle mapping and media fallback logic for featured/gallery/source object variants.

7. Problem: PDP parity gaps in flavor/size controls and meta blocks.
Solution: Refined option selectors, claim block flow, price/compare layout, and buy-box rhythm to match expected structure.

8. Problem: CMS media updates were tedious and error-prone across forms.
Solution: Built reusable `MediaPickerField` and integrated it into products, collections, pages, homepage, cart promo, and logo/favicon settings.

9. Problem: Risk of accidental destructive import actions in production.
Solution: Hardened import workflow with explicit destructive warning + required confirmation phrase before action.

10. Problem: Payment labels and blocks still showed legacy `Afterpay`, `Buy with shop`, `More payment options`, and pickup UI.
Solution: Replaced with Snapmint wording, removed legacy blocks, removed pickup block, and updated CMS payment settings to Razorpay + Snapmint + INR only.

11. Problem: Encoding corruption risk during quick file rewrites (`Set-Content` BOM/UTF-8 issues).
Solution: Re-encoded affected files in UTF-8 cleanly and reran full builds before deploy.

12. Problem: Local CMS builds surfaced Prisma `DATABASE_URL` warnings during static export checks.
Solution: Confirmed compile success and deployment success in Vercel runtime where environment variables are configured.

## 3. Key Technical Changes (High Value)

1. Storefront:
`app/header.tsx`, `app/globals.css`, `app/page.tsx`, `app/products/[handle]/page.tsx`, collection and shared display logic.

2. CMS:
`cms-admin/src/app/dashboard/*` editors, `cms-admin/src/app/api/settings/payments/route.ts`, and reusable media component wiring.

3. Reusable media system:
`cms-admin/src/components/MediaPickerField.tsx`.

4. Payment settings model expansion:
Added `snapmint_enabled`, `snapmint_checkout_url`, `snapmint_merchant_id`, plus stronger `razorpay_enabled` and currency symbol persistence.

## 4. Deployment and Release Notes

1. Storefront production alias: `https://hdmuscle.in`
2. CMS production alias: `https://cms.hdmuscle.in`
3. Build checks were run for both projects before deployment.
4. Post-deploy smoke checks confirmed removal of legacy payment labels and INR announcement behavior.

## 5. Client-Facing Outcome

1. Client can now manage core store content via CMS without editing JSON/code manually for normal operations.
2. Media operations are significantly easier with local upload + URL import + preview + attach flow.
3. Payment messaging in storefront is aligned to business requirement: Razorpay and Snapmint only.
4. Storefront remains design-consistent while CMS drives editable content.

## 6. Recommendations to Add to the Claude Skill (Process Upgrade)

1. Add a mandatory pre-deploy checklist step:
`build storefront`, `build cms`, `string scan for banned labels`, `live smoke test URLs`, `capture deployment IDs`.

2. Add automatic banned-text scanner rules:
`Afterpay`, `Buy with shop`, `More payment options`, `Store pickup`, `USD shipping copy`.

3. Add domain/currency guard rules:
Always enforce `INR` defaults and sanitize incoming CMS values that include `$`/`USD`.

4. Add “reference parity mode” checklist:
header, announcement, nav, mega menu, hero crop, section rhythm, card density, PDP buy box, footer.

5. Add “media mapping verifier” script:
check each product handle has valid featured image, gallery fallback, and resolvable URL.

6. Add “CMS non-technical UX” checklist:
clear labels, inline status, upload success/error messaging, destructive action confirmations.

7. Add release gate for import tooling:
import actions disabled unless explicit acknowledgment phrase is typed.

8. Add deployment script template:
single command to deploy storefront and CMS sequentially, then run automated smoke checks.

9. Add “encoding safety” guidance:
avoid BOM/invalid UTF-8 writes and validate encoding on edited TS/TSX files before commit.

10. Add Git delivery workflow:
commit summary template, push target verification (`master`/release branch), and deployment notes file update.

## 7. Suggested Standard Operating Procedure (Next Client)

1. Lock business rules first: domain, currency, payment providers, non-negotiables.
2. Run strict audit against reference and rank by revenue impact.
3. Implement high-impact visual parity first: header/nav/hero/PDP/cart.
4. Build CMS controls only for fields that client must change weekly.
5. Harden destructive actions and admin permissions early.
6. Add automated text/asset/domain smoke checks.
7. Build and deploy in short rounds with immediate live verification.
8. Deliver with a written runbook and rollback notes on day of handoff.

## 8. Final Note

This project now has a strong baseline for fast repeatable delivery.  
The biggest time savers for future deadlines will be: automated parity checks, banned-text scans, media mapping verification, and a strict release checklist baked directly into the skill workflow.


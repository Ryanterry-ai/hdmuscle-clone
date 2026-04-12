================================================================================
                    HD MUSCLE CLONE - README DOCUMENTATION
================================================================================

PROJECT OVERVIEW
================================================================================
Project Name:    HD Muscle Website Clone
Original Site:  https://hdmuscle.com
Target Site:    https://hdmuscle.in
Tech Stack:    Next.js 16 + Tailwind CSS v4 + TypeScript
UI Framework:  shadcn/ui components

This is a pixel-perfect clone of hdmuscle.com built with Next.js. All products,
categories, and content are linked to the hdmuscle.in website. The site displays 
prices in INR (Indian Rupees).

================================================================================
FILE STRUCTURE
================================================================================

hdmuscle-clone/
├── public/
│   └── images/              # Locally stored images
│
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── page.tsx       # Homepage
│   │   ├── layout.tsx     # Root layout
│   │   ├── collections/
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Collection pages (dynamic)
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Product detail pages
│   │   └── pages/         # Static pages (about, faq, contact)
│   │
│   ├── components/         # React components
│   │   ├── Header.tsx     # Main header with navigation
│   │   ├── Footer.tsx    # Footer with newsletter
│   │   ├── Hero.tsx      # Hero banner section
│   │   ├── TrustBadges.tsx    # Trust badges row
│   │   ├── CategoryGrid.tsx   # Category cards
│   │   ├── BestSellers.tsx    # Best sellers carousel
│   │   ├── NewAndNoteworthy.tsx  # New products section
│   │   ├── NewArrivals.tsx   # Apparel section
│   │   ├── AboutSection.tsx  # About brand section
│   │   ├── Testimonials.tsx # Reviews section
│   │   ├── FAQ.tsx       # FAQ section
│   │   ├── TrustFeatures.tsx  # Trust features
│   │   ├── ProductCard.tsx     # Product card
│   │   ├── ProductCarousel.tsx # Product carousel
│   │   └── Newsletter.tsx      # Newsletter signup
│   │
│   ├── lib/
│   │   ├── data.ts       # Product data
│   │   └── utils.ts    # Utility functions (INR conversion)
│   │
│   └── styles/
│       └── globals.css  # Global styles
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.txt (this file)

================================================================================
DEPENDENCIES (package.json)
================================================================================

Core Dependencies:
- next: ^16.2.1
- react: ^19.0.0
- react-dom: ^19.0.0
- typescript: ^5.7.0

UI/Styling:
- tailwindcss: ^4.0.0
- @tailwindcss/postcss: ^4.0.0
- tailwind-merge: ^2.6.0
- clsx: ^2.1.1
- class-variance-authority: ^0.7.1
- lucide-react: ^0.469.0
- @radix-ui/react-slot: ^1.1.1

Image Optimization:
- sharp: ^0.33.5 (optional, for production)

Dev Dependencies:
- @types/node: ^22.0.0
- @types/react: ^19.0.0
- @types/react-dom: ^19.0.0
- eslint: ^9.0.0
- eslint-config-next: ^16.2.1

================================================================================
INSTALLATION & SETUP
================================================================================

1. EXTRACT FILES
   Extract hdmuscle-clone.zip to your desired location

2. INSTALL DEPENDENCIES
   Run inside the project folder:
   
   npm install

3. RUN DEVELOPMENT SERVER
   
   npm run dev
   
   Site will be available at: http://localhost:3000

4. BUILD FOR PRODUCTION
   
   npm run build

5. START PRODUCTION SERVER
   
   npm start

================================================================================
CONFIGURATION
================================================================================

PRICE CONVERSION (INR)
---------------------------------------
Current rate: 1 USD = ₹92.50 INR

To update the rate, edit: src/lib/utils.ts
Change: const USD_TO_INR = 92.5;

PRODUCT DATA
---------------------------------------
Product listing: src/lib/data.ts
Each product has:
- id, name, handle, description
- price (USD), compareAtPrice
- image, images (array for hover swap)
- category, status, flavors

CURRENCY SYMBOL
---------------------------------------
Currently set to Indian Rupee (₹)
Change formatPrice() in src/lib/utils.ts for other currencies

LINKS CONFIGURATION - IMPORTANT!
=========================================
Current Setup: All links point to https://hdmuscle.in

Current Status:
- All product links: https://hdmuscle.in/products/xxx
- All collection links: https://hdmuscle.in/collections/xxx 
- All page links: https://hdmuscle.in/pages/xxx
- All images: https://hdmuscle.in/cdn/xxx

To change to your own domain after deployment:
Simply find & replace: hdmuscle.in → your-new-domain.com

Example: Replace all "hdmuscle.in" with "mynewdomain.com"

Files that contain links:
- src/lib/data.ts
- src/lib/config.ts
- src/components/ProductCard.tsx
- src/components/CategoryGrid.tsx
- src/components/Hero.tsx
- src/components/Footer.tsx
- src/components/NewAndNoteworthy.tsx
- src/components/NewArrivals.tsx
- src/app/collections/[slug]/page.tsx

================================================================================
DEPLOYMENT
================================================================================

VERCEL (Recommended)
---------------------------------------
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

Build Command: npm run build
Output Directory: .next/static (or use standalone preset)

NETLIFY
---------------------------------------
1. netlify init
2. npm run build
3. Deploy the .next folder

AWS/OTHER VPS
---------------------------------------
1. Run: npm run build
2. Configure standalone mode in next.config.ts
3. Copy .next/standalone/* to server
4. Set PORT environment variable
5. Start: node server.js

DOCKER
---------------------------------------
Create Dockerfile:
----
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
----

Build and run:
docker build -t hdmuscle .
docker run -p 3000:3000 hdmuscle

================================================================================
KEY FEATURES IMPLEMENTED
================================================================================

- Pixel-perfect cloning of hdmuscle.com
- Product image hover to nutrition facts
- Product carousel with 3 products visible
- Left/Right arrows navigation
- Category grid with titles below images
- INR price display (converted from USD)
- All sections matching original:
  * Announcement bar
  * Header with mega menu
  * Hero with FIND YOUR FORMULA
  * Trust badges
  * Shop our best sellers
  * New and noteworthy
  * About section
  * Real reviews
  * New arrivals (apparel)
  * FAQ
  * Trust features (You're covered)
  * Footer with newsletter

================================================================================
CUSTOMIZATION
================================================================================

CHANGING LOGO
---------------------------------------
Replace: public/images/logo.png
Recommended size: 120x35 pixels

CHANGING COLORS
---------------------------------------
Edit: tailwind.config.ts
Primary color in use: #1d1d1d (dark)
Accent: #ffcc00 (gold/yellow)

CHANGING PRODUCTS
---------------------------------------
Edit: src/lib/data.ts
Add/modify products array

CHANGING IMAGES
---------------------------------------
Add new images to: public/images/
Reference in data.ts using full URLs

================================================================================
TROUBLESHOOTING
================================================================================

Q: Images not loading?
A: Check URL in data.ts or ensure public/images/ exists

Q: Build errors?
A: Run npm install, then npm run build

Q: INR price wrong?
A: Update USD_TO_INR in src/lib/utils.ts

Q: Links not working?
A: Links currently point to hdmuscle.com
   Change to your domain in component files

================================================================================
CREDITS
================================================================================

Original Website: https://hdmuscle.com
Clone Built: Next.js 16 + Tailwind CSS v4
Date: April 2026

For any issues or questions, refer to:
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs

================================================================================
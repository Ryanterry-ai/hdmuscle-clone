import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [publishedRes, productsRes] = await Promise.all([
      fetch(`${CMS_API}/storefront/published`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      }),
      fetch(`${CMS_API}/products`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
    ]);

    const data = await publishedRes.json();
    const productsData = await productsRes.json();

    const transformed = {
      settings: {
        store_name: data.site?.name || "HD MUSCLE",
        brand_name: data.site?.name || "HD Muscle",
        currency: data.site?.currency || "INR",
        locale: data.site?.locale || "en-IN",
        symbol: data.site?.currency === "INR" ? "₹" : "$",
        logo_text: data.site?.name || "HD MUSCLE",
        announcement_bar: {
          enabled: true,
          text: data.site?.announcementText || "FREE SHIPPING OVER ₹1499",
          link: data.site?.announcementLink || "/collections/best-selling-collection",
          link_text: "SHOP NOW"
        },
        social_links: {
          instagram: data.site?.instagramUrl || "https://instagram.com/hd.muscle",
          facebook: data.site?.facebookUrl || "https://facebook.com/hdmuscle",
          youtube: data.site?.youtubeUrl || "https://youtube.com/hdmuscle",
          tiktok: data.site?.tiktokUrl || "https://tiktok.com/@hdmuscle"
        },
        footer: {
          copyright_text: data.site?.copyrightText || "© 2024 HD MUSCLE. All rights reserved.",
          country_options: ["India"],
          default_country: "India"
        },
        contact: {
          email: data.site?.supportEmail || "support@hdmuscle.com",
          phone: data.site?.supportPhone || "+91-XXX-XXX-XXXX"
        }
      },
      navigation: {
        header_main: [
          { id: 1, title: "Shop by Goal", type: "megamenu", link: "#", children: [
            { title: "Build Muscle", items: [
              { title: "Protein", link: "/collections/proteins" },
              { title: "Mass Gainers", link: "/collections/mass-gainers" },
              { title: "Creatine", link: "/collections/creatine" },
              { title: "BCAAs", link: "/collections/bcaas" }
            ]},
            { title: "Lose Fat", items: [
              { title: "Fat Burners", link: "/collections/fat-burners" },
              { title: "Thermogenics", link: "/collections/thermogenics" },
              { title: "L-Carnitine", link: "/collections/l-carnitine" }
            ]},
            { title: "Performance", items: [
              { title: "Pre-Workout", link: "/collections/pre-workouts" },
              { title: "Intra-Workout", link: "/collections/intra-workouts" },
              { title: "Electrolytes", link: "/collections/electrolytes" }
            ]}
          ]},
          { id: 2, title: "Supplements", type: "link", link: "/collections/supplements" },
          { id: 3, title: "Bundles", type: "link", link: "/collections/bundles" },
          { id: 4, title: "Apparel", type: "link", link: "/collections/apparel" },
          { id: 5, title: "New", type: "link", link: "/collections/new" }
        ],
        footer_main: [
          { title: "Shop", links: [
            { title: "All Products", link: "/collections/all" },
            { title: "Pre-Workout", link: "/collections/pre-workouts" },
            { title: "Protein", link: "/collections/proteins" },
            { title: "Bundles", link: "/collections/bundles" },
            { title: "Apparel", link: "/collections/apparel" }
          ]},
          { title: "Support", links: [
            { title: "FAQ", link: "/pages/faq" },
            { title: "Shipping Policy", link: "/pages/shipping-policy" },
            { title: "Refund Policy", link: "/pages/refund-policy" },
            { title: "Privacy Policy", link: "/pages/privacy-policy" },
            { title: "Contact Us", link: "/pages/contact" }
          ]},
          { title: "Company", links: [
            { title: "Our Story", link: "/pages/our-story" },
            { title: "Wholesale", link: "/pages/wholesale" },
            { title: "Careers", link: "/pages/careers" },
            { title: "Press", link: "/pages/press" }
          ]}
        ]
      },
      homepage: {
        hero: {
          enabled: true,
          heading: data.sections?.hero?.heading || "FIND YOUR FORMULA",
          subheading: data.sections?.hero?.subheading || "Premium supplements designed for athletes who demand more.",
          cta_primary: { text: "Shop Now", link: "#products" },
          cta_secondary: { text: "Learn More", link: "#about" },
          background_image: data.sections?.hero?.imageUrl || null,
          overlay_opacity: 60
        },
        quality_badges: {
          enabled: true,
          badges: [
            { icon: "🧪", text: "Heavy Metals Tested" },
            { icon: "🎨", text: "No Artificial Dyes" },
            { icon: "✅", text: "3rd Party Tested" },
            { icon: "💊", text: "Properly Dosed" },
            { icon: "🏭", text: "FDA Registered Facility" }
          ]
        },
        category_tiles: {
          enabled: true,
          categories: [
            { title: "Health + Wellness", image: "/greenshd-citrus-us-b1d785092f3e.jpg", link: "/collections/health-wellness" },
            { title: "Pre-Workout", image: "/pumphd-rainbow-strips-ead9f7c7e482.png", link: "/collections/pre-workouts" },
            { title: "Intra-Workout", image: "/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png", link: "/collections/intra-workouts" },
            { title: "Post-Workout", image: "/creahd-53c587c6f495.jpg", link: "/collections/post-workout" }
          ]
        },
        best_sellers: {
          enabled: true,
          title: "Shop Our Best Sellers",
          link: "/collections/best-selling-collection",
          product_handles: productsData.products?.slice(0, 10).map((p: any) => p.handle) || []
        },
        new_products: {
          enabled: true,
          title: "New + Noteworthy",
          link: "/collections/new-featured",
          product_handles: productsData.products?.slice(10, 20).map((p: any) => p.handle) || []
        },
        brand_story: {
          enabled: true,
          label: "Our Mission",
          heading: "Built By Athletes, For Athletes",
          content: "At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential. Integrity is everything.",
          quote: "— The HD Muscle Team",
          image: "/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp"
        },
        testimonials: {
          enabled: true,
          title: "Real People, Real Reviews",
          subtitle: "See what our customers are saying",
          reviews: [
            { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock.", author: "Whitney L.", stars: 5 },
            { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D.", stars: 5 },
            { text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you!", author: "Christina D.", stars: 5 }
          ]
        },
        apparel: {
          enabled: true,
          title: "New Arrivals — Apparel + Accessories",
          link: "/collections/apparel",
          product_handles: ["hd-heritage-hoodie", "hd-archive-hat", "hd-jersey", "hd-gothic-tee", "hd-performa-shaker"]
        },
        faq: {
          enabled: true,
          title: "Frequently Asked Questions",
          questions: [
            { question: "How long does shipping take?", answer: "Free shipping on orders over ₹9999. Standard shipping takes 5-7 business days." },
            { question: "What's your return policy?", answer: "We offer a 30-day money-back guarantee on all products." },
            { question: "Are your products GMP certified?", answer: "Yes, all our products are manufactured in FDA-registered GMP certified facilities." },
            { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide." }
          ]
        },
        guarantee: {
          enabled: true,
          heading: "You're Covered",
          text: "30-Day Money Back Guarantee on all orders",
          link: "/pages/shipping-policy"
        },
        newsletter: {
          enabled: true,
          heading: "Stay Updated",
          text: "Subscribe for exclusive offers and new product launches",
          placeholder: "Enter your email",
          button: "Subscribe"
        }
      },
      products: productsData.products?.map((p: any) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        price: p.price,
        compare_at_price: p.compare_at_price,
        description: p.description || "",
        short_description: p.description?.substring(0, 50) || "",
        images: p.images?.length > 0 ? p.images : [],
        badge: p.is_featured ? "New" : null,
        is_active: p.is_active,
        inventory: p.inventory,
        category: p.collections?.[0]?.collection?.handle || "supplements",
        tags: []
      })) || [],
      collections: productsData.products?.flatMap((p: any) => 
        p.collections?.map((c: any) => c.collection)?.filter(Boolean) || []
      ).filter((c: any, i: number, arr: any[]) => 
        arr.findIndex((x: any) => x.id === c.id) === i
      ).map((c: any) => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description
      })) || [],
      pages: []
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch from CMS',
      settings: {
        store_name: "HD MUSCLE",
        currency: "INR",
        symbol: "₹",
        announcement_bar: { text: "FREE SHIPPING OVER ₹1499" },
        footer: { default_country: "India" }
      }
    }, { status: 500 });
  }
}

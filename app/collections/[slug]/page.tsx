import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustFeatures from "@/components/TrustFeatures";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  
  const showAllProducts = slug === "all-collections" || slug === "all";
  
  const slugToCategories: Record<string, string[]> = {
    "post-workout": ["Intra-workouts", "Recovery"],
    "post-workout-recovery": ["Intra-workouts", "Recovery"],
    "recovery": ["Intra-workouts", "Recovery"],
    "health-wellness": ["Health + Wellness"],
    "health": ["Health + Wellness"],
    "bundles": ["Pre-workouts", "Intra-workouts", "Proteins", "Health + Wellness"],
  };
  
  const allowedCategories = slugToCategories[slug] || [slug.replace(/-/g, " ")];
  
  const collectionProducts = showAllProducts 
    ? products 
    : products.filter(p => {
        const normalizedCategory = p.category.toLowerCase().replace(/[-\s]/g, "-");
        const normalizedSlug = slug.toLowerCase();
        return normalizedCategory === normalizedSlug || 
               allowedCategories.includes(p.category);
      });

  const collectionInfo: Record<string, { title: string; description: string; content?: string }> = {
    "pre-workouts": {
      title: "PRE-WORKOUTS",
      description: "Find the pre-workout that matches your intensity.",
      content: "PRE-WORKOUT, PERFECTED. Whether you want a balanced pre-workout for daily use (Essential), elevated focus and endurance (Ultra), or a harder-hitting, high-stim formula (Black), the PreHD family delivers research-backed performance with transparent dosing and no proprietary blends."
    },
    "pre-workout": {
      title: "PRE-WORKOUTS",
      description: "Find the pre-workout that matches your intensity.",
      content: "PRE-WORKOUT, PERFECTED. Whether you want a balanced pre-workout for daily use (Essential), elevated focus and endurance (Ultra), or a harder-hitting, high-stim formula (Black), the PreHD family delivers research-backed performance with transparent dosing and no proprietary blends."
    },
    "shop-all-supplements": {
      title: "ALL SUPPLEMENTS",
      description: "Browse our complete collection of premium supplements.",
      content: ""
    },
    "all-collections": {
      title: "ALL PRODUCTS",
      description: "Browse our complete collection of premium supplements.",
      content: ""
    },
    "all": {
      title: "ALL PRODUCTS",
      description: "Browse our complete collection of premium supplements.",
      content: ""
    },
    "supplements": {
      title: "SUPPLEMENTS",
      description: "Premium supplements for every fitness goal.",
      content: ""
    },
    "intra-workouts": {
      title: "INTRA-WORKOUT",
      description: "Fuel your workout from start to finish.",
      content: ""
    },
    "post-workout": {
      title: "POST-WORKOUT RECOVERY",
      description: "Maximize your recovery with premium supplements.",
      content: ""
    },
    "post-workout-recovery": {
      title: "POST-WORKOUT RECOVERY",
      description: "Maximize your recovery with premium supplements.",
      content: ""
    },
    "health-wellness": {
      title: "HEALTH + WELLNESS",
      description: "Support your body with essential health supplements.",
      content: ""
    },
    "proteins": {
      title: "PROTEINS",
      description: "Premium protein for muscle building and recovery.",
      content: ""
    },
    "protein": {
      title: "PROTEINS",
      description: "Premium protein for muscle building and recovery.",
      content: ""
    },
    "bundles": {
      title: "BUNDLES",
      description: "Save big with our curated supplement bundles.",
      content: ""
    },
    "apparel": {
      title: "APPAREL + ACCESSORIES",
      description: "HD Muscle apparel and accessories.",
      content: ""
    },
    "apparel-accessories-2": {
      title: "APPAREL + ACCESSORIES",
      description: "HD Muscle apparel and accessories.",
      content: ""
    },
  };

  const info = collectionInfo[slug] || { 
    title: slug.replace(/-/g, " ").toUpperCase(), 
    description: "",
    content: ""
  };

  const isPreWorkouts = slug === "pre-workouts" || slug === "pre-workout";

  return (
    <main>
      <Header />
      <div className="pt-[88px]">
        {/* Collection Header */}
        <div className="relative h-[300px] md:h-[400px] mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://hdmuscle.com/cdn/shop/files/DSC06090_copy.jpg?v=1763690188&width=2750')" }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex flex-col justify-center px-4 md:px-8">
            <div className="text-left max-w-2xl">
              <Link 
                href="https://hdmuscle.com/collections/pre-workouts"
                className="inline-block font-oswald text-sm font-medium text-white uppercase tracking-wider mb-3 no-underline"
              >
                Find Your Formula
              </Link>
              <h1 className="font-oswald text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
                {info.title}
              </h1>
              {info.description && (
                <p className="text-white/90 text-sm md:text-base max-w-2xl">
                  {info.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Collection Content */}
        <div className="max-w-[1100px] mx-auto px-4 pb-16">
          {info.content && (
            <div className="mb-8">
              <p className="text-[#737373] text-sm leading-relaxed">
                {info.content}
              </p>
            </div>
          )}

          {/* Products Section Heading */}
          <h2 className="font-oswald text-lg font-bold text-[#1d1d1d] uppercase mb-4">
            {info.title}
          </h2>
          
          {/* Products Grid */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            {collectionProducts.length > 0 ? (
              collectionProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-[#737373] text-lg">No products found in this collection.</p>
                <p className="text-[#737373] text-sm mt-2">Check back soon for new products!</p>
              </div>
            )}
          </div>

          {/* Pre-workouts special sections */}
          {isPreWorkouts && collectionProducts.length > 0 && (
            <>
              <div className="mb-12">
                <div 
                  className="relative h-[300px] md:h-[400px] bg-cover bg-center"
                  style={{ backgroundImage: "url('https://hdmuscle.com/cdn/shop/files/DSC05970.jpg?v=1763691555&width=2750')" }}
                />
              </div>
              
              <div className="mb-6">
                <h2 className="font-oswald text-lg font-bold text-[#1d1d1d] uppercase mb-4">
                  STIM-FREE PRE-WORKOUTS
                </h2>
                <p className="text-[#737373] text-sm leading-relaxed mb-4">
                  Maximum pump, performance, and focus — with zero caffeine.
                  Perfect for late-night training, caffeine-sensitive athletes, or anyone looking to stack pumps with another pre-workout.
                </p>
                <Link 
                  href="/products/pumphd"
                  className="font-oswald text-sm font-bold text-[#1d1d1d] uppercase underline"
                >
                  PURE PUMPS & ENDURANCE
                </Link>
              </div>
              
              <div className="mb-12">
                <h2 className="font-oswald text-lg font-bold text-[#1d1d1d] uppercase mb-4">
                  STIM-HD — THE CAFFEINE ADD-ON
                </h2>
                <p className="text-[#737373] text-sm leading-relaxed mb-4">
                  Control your caffeine. Add StimHD to any stim-free pre-workout for clean, smooth energy without altering your formula.
                  StimHD lets you tailor your energy level to your training demands.
                </p>
                <Link 
                  href="/products/stimhd"
                  className="font-oswald text-sm font-bold text-[#1d1d1d] uppercase underline"
                >
                  CUSTOMIZE YOUR ENERGY
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Trust Features */}
        <TrustFeatures />
      </div>
      <Footer />
    </main>
  );
}
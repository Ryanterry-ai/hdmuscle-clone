import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-[120px] pb-16">
      {/* Hero */}
      <div className="relative h-[300px] md:h-[400px] mb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://hdmuscle.com/cdn/shop/files/000031460020.jpg?v=1764729480&width=2750')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex items-center justify-center">
          <h1 className="font-oswald text-4xl md:text-5xl font-bold text-white uppercase tracking-wider">
            About Us
          </h1>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold text-[#1d1d1d] mb-6">
            FAMILY BUILT. PERFORMANCE DRIVEN.
          </h2>
          
          <div className="space-y-6 text-[#737373] leading-relaxed">
            <p>
              HD Muscle is a family-built, performance-driven supplement brand founded in Canada by 
              Dorian Hamilton and his family. We formulate with purpose: clinically backed ingredients, 
              transparent labels, and products trusted by IFBB Pros and everyday athletes.
            </p>
            
            <p>
              Our mission is simple: provide supplements that actually work. No shortcuts, no proprietary 
              blends hiding ineffective doses, no fillers. Just formulas designed to help you reach your 
              fitness goals.
            </p>
            
            <p>
              Every product we make is produced in GMP-certified facilities and tested for purity, potency, 
              and heavy metals. We believe in transparency because when you know exactly what you're putting 
              in your body, you can train with confidence.
            </p>
            
            <p>
              Whether you're a competitive bodybuilder or just starting your fitness journey, HD Muscle has 
              the supplements to support your goals. From pre-workouts that deliver real energy and focus, 
              to proteins that help you recover and grow, we're here to help you be your best.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="font-oswald text-3xl font-bold text-[#1d1d1d] mb-2">10+</div>
              <div className="text-[#737373] text-sm">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="font-oswald text-3xl font-bold text-[#1d1d1d] mb-2">50K+</div>
              <div className="text-[#737373] text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="font-oswald text-3xl font-bold text-[#1d1d1d] mb-2">100+</div>
              <div className="text-[#737373] text-sm">Products</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
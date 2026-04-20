'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../header';
import { useCart } from '../../cart-context';

const fallbackProducts: Record<string, any> = {
  'prohd-whey': { id: '1', handle: 'prohd-whey', title: 'ProHD Whey Protein Isolate', price: '79.99', images: [{ url: '/prohd_chocolate_front-1cca5974cf27.png' }], description: 'Premium whey protein isolate for muscle building. 25g protein per serving.', inventory: 100, badge: 'Best Seller' },
  'prehd-essential': { id: '2', handle: 'prehd-essential', title: 'PreHD Essential', price: '39.99', images: [{ url: '/prehd-essential-blue-rasberry-eb39ae9ce7f5.png' }], description: 'Essential pre-workout for energy and focus.', inventory: 100 },
  'pumphd': { id: '3', handle: 'pumphd', title: 'PumpHD', price: '49.99', images: [{ url: '/pumphd-rainbow-strips-ead9f7c7e482.png' }], description: 'Maximum pump and vascularity.', inventory: 100, badge: 'New' },
  'hydrahd': { id: '4', handle: 'hydrahd', title: 'HydraHD', price: '44.99', images: [{ url: '/hydrahd-tangerine-us-16303cf76229.png' }], description: 'Advanced hydration formula.', inventory: 100 },
  'stimhd': { id: '5', handle: 'stimhd', title: 'StimHD', price: '54.99', images: [{ url: '/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png' }], description: 'Maximum stimulant pre-workout.', inventory: 0 },
  'intrahd': { id: '6', handle: 'intrahd', title: 'IntraHD', price: '39.99', images: [{ url: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png' }], description: 'Intra-workout energy and endurance.', inventory: 100 },
  'sleephd': { id: '7', handle: 'sleephd', title: 'SleepHD', price: '49.99', images: [{ url: '/sleephd_web1-d6d6eabbf104.png' }], description: 'Deep sleep recovery formula.', inventory: 100 },
  'greenshd': { id: '8', handle: 'greenshd', title: 'GreensHD', price: '59.99', images: [{ url: '/greenshd-citrus-us-b1d785092f3e.jpg' }], description: 'Daily greens and superfoods.', inventory: 100 },
  'burnhd': { id: '9', handle: 'burnhd', title: 'BurnHD', price: '49.99', images: [{ url: '/burnhd_front-b81b8d88cde6.png' }], description: 'Thermogenic fat burner.', inventory: 100 },
  'creahd': { id: '10', handle: 'creahd', title: 'CreaHD', price: '34.99', images: [{ url: '/creahd-53c587c6f495.jpg' }], description: 'Creatine monohydrate for strength.', inventory: 100 },
  'multihd': { id: '11', handle: 'multihd', title: 'MultiHD', price: '54.99', images: [{ url: '/multi-hd-us-web-11980b086482.jpg' }], description: 'Daily multivitamin.', inventory: 100 },
  'glutahd': { id: '12', handle: 'glutahd', title: 'GlutaHD', price: '44.99', images: [{ url: '/glutahd-front-black-lid-0e6436cfe231.jpg' }], description: 'Glutamine for recovery.', inventory: 100 },
  'prehd-elite': { id: '13', handle: 'prehd-elite', title: 'PreHD Elite', price: '64.99', images: [{ url: '/prehd-elite_tangerine-can-v2-15e1790f303a.jpg' }], description: 'Elite pre-workout formula.', inventory: 100, badge: 'New' },
  'eaahd': { id: '14', handle: 'eaahd', title: 'EAAHD', price: '44.99', images: [{ url: '/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png' }], description: 'Essential amino acids.', inventory: 100 },
  'collagenhd': { id: '15', handle: 'collagenhd', title: 'CollagenHD', price: '49.99', images: [{ url: '/collagenhd_front_unflavored-us-6c934157a97a.jpg' }], description: 'Collagen peptides for joints.', inventory: 100 },
  'hd-heritage-hoodie': { id: '16', handle: 'hd-heritage-hoodie', title: 'HD Heritage Hoodie', price: '69.99', images: [{ url: '/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg' }], description: 'Heavyweight oversized hoodie.', inventory: 100, badge: 'New', is_apparel: true },
  'hd-archive-hat': { id: '17', handle: 'hd-archive-hat', title: 'HD Archive Hat', price: '34.99', images: [{ url: '/hd-archive-hat-2026-black-199357851230.png' }], description: 'Classic dad cap.', inventory: 100, is_apparel: true },
  'hd-jersey': { id: '18', handle: 'hd-jersey', title: 'HD Jersey', price: '54.99', images: [{ url: '/hd-jersey-black-front-15e6447e1daf.jpg' }], description: 'Performance jersey.', inventory: 100, is_apparel: true },
  'hd-gothic-tee': { id: '19', handle: 'hd-gothic-tee', title: 'HD Gothic Tee', price: '39.99', images: [{ url: '/hd-gothic-black-front-2b467fb27e06.png' }], description: 'Premium cotton tee.', inventory: 100, is_apparel: true },
  'hd-performa-shaker': { id: '20', handle: 'hd-performa-shaker', title: 'HD Performa Shaker', price: '14.99', images: [{ url: '/1800x1800-hd-performa-shaker-black-354aba4223e2.png' }], description: 'BPA-free shaker bottle.', inventory: 100, is_apparel: true },
};

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  
  const product = fallbackProducts[handle] || Object.values(fallbackProducts).find((p: any) => p.handle === handle);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.url
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-black text-white py-2.5">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center whitespace-nowrap">
              FREE SHIPPING ON ORDERS OVER $99 • 30-DAY MONEY BACK GUARANTEE •{' '}
              <Link href="/collections/best-selling-collection" className="underline hover:text-gray-300">SHOP NOW</Link>
            </p>
          </div>
        </div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-wider">Product Not Found</h1>
            <Link href="/" className="text-black hover:underline">← Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center whitespace-nowrap">
            FREE SHIPPING ON ORDERS OVER $99 • 30-DAY MONEY BACK GUARANTEE •{' '}
            <Link href="/collections/best-selling-collection" className="underline hover:text-gray-300">SHOP NOW</Link>
          </p>
        </div>
      </div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div className="aspect-square bg-gray-100 border border-black">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">💪</div>
            )}
          </div>
          <div>
            {product.badge && (
              <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] mb-4">{product.title}</h1>
            <p className="text-2xl font-bold mb-6">${Number(product.price).toFixed(2)}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
            {product.inventory > 0 ? (
              <p className="text-sm text-green-600 mb-8">✓ In Stock</p>
            ) : (
              <p className="text-sm text-red-600 mb-8">Out of Stock</p>
            )}
            <button 
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className={`w-full py-4 text-white text-sm font-bold uppercase tracking-[2px] transition ${
                added 
                  ? 'bg-green-600' 
                  : product.inventory <= 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800'
              }`}
            >
              {added ? '✓ Added to Cart!' : product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
      <footer className="bg-black text-white py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-500 text-sm">© 2024 HD MUSCLE. All rights reserved. Integrity is everything.</p>
        </div>
      </footer>
    </div>
  );
}
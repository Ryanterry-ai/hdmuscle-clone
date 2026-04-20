'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../header';
import { useCart } from '../../cart-context';

const allProducts = [
  { id: '1', handle: 'prohd-whey', title: 'ProHD Whey Protein Isolate', price: '79.99', images: [{ url: '/prohd_chocolate_front-1cca5974cf27.png' }], badge: 'Best Seller', category: 'proteins' },
  { id: '2', handle: 'prehd-essential', title: 'PreHD Essential', price: '39.99', images: [{ url: '/prehd-essential-blue-rasberry-eb39ae9ce7f5.png' }], category: 'pre-workouts' },
  { id: '3', handle: 'pumphd', title: 'PumpHD', price: '49.99', images: [{ url: '/pumphd-rainbow-strips-ead9f7c7e482.png' }], badge: 'New', category: 'pre-workouts' },
  { id: '4', handle: 'hydrahd', title: 'HydraHD', price: '44.99', images: [{ url: '/hydrahd-tangerine-us-16303cf76229.png' }], category: 'electrolytes' },
  { id: '5', handle: 'stimhd', title: 'StimHD', price: '54.99', images: [{ url: '/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png' }], category: 'pre-workouts' },
  { id: '6', handle: 'intrahd', title: 'IntraHD', price: '39.99', images: [{ url: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png' }], category: 'intra-workouts' },
  { id: '7', handle: 'sleephd', title: 'SleepHD', price: '49.99', images: [{ url: '/sleephd_web1-d6d6eabbf104.png' }], category: 'health-wellness' },
  { id: '8', handle: 'greenshd', title: 'GreensHD', price: '59.99', images: [{ url: '/greenshd-citrus-us-b1d785092f3e.jpg' }], category: 'health-wellness' },
  { id: '9', handle: 'burnhd', title: 'BurnHD', price: '49.99', images: [{ url: '/burnhd_front-b81b8d88cde6.png' }], category: 'fat-burners' },
  { id: '10', handle: 'creahd', title: 'CreaHD', price: '34.99', images: [{ url: '/creahd-53c587c6f495.jpg' }], category: 'creatine' },
  { id: '11', handle: 'multihd', title: 'MultiHD', price: '54.99', images: [{ url: '/multi-hd-us-web-11980b086482.jpg' }], category: 'health-wellness' },
  { id: '12', handle: 'glutahd', title: 'GlutaHD', price: '44.99', images: [{ url: '/glutahd-front-black-lid-0e6436cfe231.jpg' }], category: 'recovery' },
  { id: '13', handle: 'prehd-elite', title: 'PreHD Elite', price: '64.99', images: [{ url: '/prehd-elite_tangerine-can-v2-15e1790f303a.jpg' }], badge: 'New', category: 'pre-workouts' },
  { id: '14', handle: 'eaahd', title: 'EAAHD', price: '44.99', images: [{ url: '/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png' }], category: 'bcaas' },
  { id: '15', handle: 'collagenhd', title: 'CollagenHD', price: '49.99', images: [{ url: '/collagenhd_front_unflavored-us-6c934157a97a.jpg' }], category: 'health-wellness' },
  { id: '16', handle: 'hd-heritage-hoodie', title: 'HD Heritage Hoodie', price: '69.99', images: [{ url: '/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg' }], badge: 'New', category: 'apparel', is_apparel: true },
  { id: '17', handle: 'hd-archive-hat', title: 'HD Archive Hat', price: '34.99', images: [{ url: '/hd-archive-hat-2026-black-199357851230.png' }], category: 'apparel', is_apparel: true },
  { id: '18', handle: 'hd-jersey', title: 'HD Jersey', price: '54.99', images: [{ url: '/hd-jersey-black-front-15e6447e1daf.jpg' }], category: 'apparel', is_apparel: true },
  { id: '19', handle: 'hd-gothic-tee', title: 'HD Gothic Tee', price: '39.99', images: [{ url: '/hd-gothic-black-front-2b467fb27e06.png' }], category: 'apparel', is_apparel: true },
  { id: '20', handle: 'hd-performa-shaker', title: 'HD Performa Shaker', price: '14.99', images: [{ url: '/1800x1800-hd-performa-shaker-black-354aba4223e2.png' }], category: 'accessories', is_apparel: true },
];

const collectionTitles: Record<string, { title: string; products: typeof allProducts }> = {
  'all': { title: 'All Products', products: allProducts },
  'best-selling-collection': { title: 'Best Sellers', products: allProducts.filter(p => p.badge === 'Best Seller') },
  'pre-workouts': { title: 'Pre-Workout', products: allProducts.filter(p => p.category === 'pre-workouts') },
  'proteins': { title: 'Protein', products: allProducts.filter(p => p.category === 'proteins') },
  'apparel': { title: 'Apparel + Accessories', products: allProducts.filter(p => p.is_apparel || p.category === 'apparel') },
  'bundles': { title: 'Bundles', products: [] },
  'health-wellness': { title: 'Health + Wellness', products: allProducts.filter(p => p.category === 'health-wellness') },
  'intra-workouts': { title: 'Intra-Workout', products: allProducts.filter(p => p.category === 'intra-workouts') },
  'fat-burners': { title: 'Fat Burners', products: allProducts.filter(p => p.category === 'fat-burners') },
  'creatine': { title: 'Creatine', products: allProducts.filter(p => p.category === 'creatine') },
  'bcaas': { title: 'BCAAs', products: allProducts.filter(p => p.category === 'bcaas') },
  'new': { title: 'New Products', products: allProducts.filter(p => p.badge === 'New') },
  'supplements': { title: 'Supplements', products: allProducts.filter(p => !p.is_apparel) },
  'accessories': { title: 'Accessories', products: allProducts.filter(p => p.category === 'accessories') },
};

export default function CollectionPage() {
  const params = useParams();
  const handle = params.handle as string;
  const { addItem } = useCart();
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const collection = collectionTitles[handle] || { title: handle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), products: allProducts.filter(p => p.category === handle || p.handle.includes(handle)) };
  const products = collection.products.length > 0 ? collection.products : allProducts.slice(0, 8);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.url
    });
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center whitespace-nowrap">
            FREE SHIPPING ON ORDERS OVER $99 • 30-DAY MONEY BACK GUARANTEE •{' '}
            <Link href="/collections/best-selling-collection" className="underline hover:text-gray-300">SHOP NOW</Link>
          </p>
        </div>
      </div>
      <Header />
      
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[3px] mb-8">{collection.title}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <Link href={`/products/${product.handle}`}>
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 uppercase">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-xl font-bold text-purple-600">${Number(product.price).toFixed(2)}</p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-3 text-xs font-bold uppercase tracking-[1.5px] transition ${
                    addedProducts.has(product.id) 
                      ? 'bg-green-600 text-white' 
                      : 'bg-black text-white hover:bg-purple-600'
                  }`}
                >
                  {addedProducts.has(product.id) ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-black text-white py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-4 md:mb-5">HD MUSCLE</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 md:mb-6">Premium sports nutrition supplements designed for athletes who demand more.</p>
          </div>
          <div><h4 className="text-xs font-bold uppercase tracking-[2px] mb-4 md:mb-5">Shop</h4><ul className="space-y-2 md:space-y-3"><li><Link href="/collections/all" className="text-gray-400 text-sm hover:text-white transition">All Products</Link></li><li><Link href="/collections/pre-workouts" className="text-gray-400 text-sm hover:text-white transition">Pre-Workout</Link></li><li><Link href="/collections/proteins" className="text-gray-400 text-sm hover:text-white transition">Protein</Link></li><li><Link href="/collections/bundles" className="text-gray-400 text-sm hover:text-white transition">Bundles</Link></li></ul></div>
          <div><h4 className="text-xs font-bold uppercase tracking-[2px] mb-4 md:mb-5">Support</h4><ul className="space-y-2 md:space-y-3"><li><Link href="/pages/faq" className="text-gray-400 text-sm hover:text-white transition">FAQ</Link></li><li><Link href="/pages/shipping-policy" className="text-gray-400 text-sm hover:text-white transition">Shipping Policy</Link></li><li><Link href="/pages/privacy-policy" className="text-gray-400 text-sm hover:text-white transition">Privacy Policy</Link></li></ul></div>
          <div><h4 className="text-xs font-bold uppercase tracking-[2px] mb-4 md:mb-5">Country</h4><select className="bg-gray-800 text-gray-400 text-sm px-3 py-2 border border-gray-700 w-full"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option></select></div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-10 md:mt-12 pt-8 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-sm">© 2024 HD MUSCLE. All rights reserved. Integrity is everything.</p>
        </div>
      </footer>
    </div>
  );
}
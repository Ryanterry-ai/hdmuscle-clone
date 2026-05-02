import Link from 'next/link'
import { Mail, Phone, MessageCircle, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react'
import { CatalogData } from '@/lib/data/json-repository'

export default async function Footer() {
  const catalog = CatalogData.getInstance()
  catalog.loadAll()

  const categories = catalog.categories
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    .slice(0, 8)

  const brands = catalog.brands.slice(0, 6)

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0a0f] text-white">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold">Stay Updated</h3>
              <p className="text-gray-400 text-sm mt-1">Get exclusive deals and fitness tips in your inbox</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-[#00ff88] placeholder-gray-500"
              />
              <button className="px-6 py-3 bg-[#00ff88] text-gray-900 font-semibold rounded-lg hover:bg-green-400 transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00ff88] mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              {categories.map(c => (
                <li key={c.name}>
                  <Link href={`/categories/${c.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">{c.name}</Link>
                </li>
              ))}
              <li><Link href="/deals" className="text-sm text-gray-400 hover:text-white transition-colors">Deals & Offers</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00ff88] mb-4">Brands</h3>
            <ul className="space-y-3">
              <li><Link href="/brands" className="text-sm text-gray-400 hover:text-white transition-colors">All Brands</Link></li>
              {brands.map(b => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">{b.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00ff88] mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+919876543210" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Phone size={14} /> +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:support@upgraded.co.in" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Mail size={14} /> support@upgraded.co.in
                </a>
              </li>
              <li>
                <a href="https://wa.me/919876543210" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle size={14} /> WhatsApp Support
                </a>
              </li>
              <li><Link href="/shipping" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><Truck size={14} /> Shipping Info</Link></li>
              <li><Link href="/returns" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><RotateCcw size={14} /> Returns</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00ff88] mb-4">About</h3>
            <ul className="space-y-3">
              <li><Link href="/authenticity" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><Shield size={14} /> Authenticity</Link></li>
              <li><Link href="/wholesale" className="text-sm text-gray-400 hover:text-white transition-colors">Wholesale</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">UPGRADED</span>
              <span className="text-sm text-gray-500">.co.in</span>
            </div>
            <p className="text-sm text-gray-500">&copy; {currentYear} Upgraded.co.in. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Facebook</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Twitter</a>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Shield size={12} /> 100% Authentic</span>
            <span className="flex items-center gap-1"><CreditCard size={12} /> Secure Payments</span>
            <span className="flex items-center gap-1"><Truck size={12} /> Pan-India Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

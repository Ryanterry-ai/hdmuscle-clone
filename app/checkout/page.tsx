'use client';

import { useCart } from '@/cart-context';
import { ShoppingCart, Truck, CreditCard, MessageCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const shipping = subtotal >= 499 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Order Items ({items.length})
              </h2>
              {items.length === 0 ? (
                <div className="bg-light-bg rounded-xl p-6 text-center">
                  <p className="text-text-muted">Your cart is empty. <a href="/shop" className="text-primary hover:underline">Continue shopping</a></p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border border-border-light rounded-xl p-4">
                      {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Name', 'Email', 'Phone', 'City', 'State', 'Pincode'].map((field) => (
                  <div key={field} className={field === 'Address' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-900 mb-1">{field}</label>
                    <input
                      type="text"
                      disabled
                      placeholder={`Enter ${field.toLowerCase()}`}
                      className="w-full px-4 py-3 border border-border-light rounded-lg bg-gray-50 text-text-muted"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                  <textarea disabled rows={3} placeholder="Enter address" className="w-full px-4 py-3 border border-border-light rounded-lg bg-gray-50 text-text-muted" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Method
              </h2>
              <div className="space-y-3">
                {['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
                  <div key={method} className="flex items-center justify-between border border-border-light rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-900">{method}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">Payments powered by Razorpay - Coming Soon</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-border-light rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="font-medium">₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="border-t border-border-light pt-4 flex justify-between"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-gray-900">₹{total}</span></div>
              </div>
              <button disabled className="btn-filled w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed" title="Checkout coming soon">Place Order</button>
              <a href="https://wa.me/919876543210" target="_blank" className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary mt-4">
                <MessageCircle className="w-4 h-4" /> Need help? Chat with us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



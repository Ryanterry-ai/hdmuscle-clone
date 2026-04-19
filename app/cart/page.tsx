'use client';

import { useCart } from '../cart-context';
import Header from '../header';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-6">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started!</p>
          <Link href="/" className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({itemCount})</h1>
        
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {items.map((item) => (
            <div key={item.id} className="py-6 flex gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="font-bold text-red-600">₹{item.price.toLocaleString()}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center text-xl font-bold">
          <span>Subtotal:</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>

        <button className="w-full mt-6 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
          Checkout
        </button>

        <Link href="/" className="block text-center mt-4 text-gray-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
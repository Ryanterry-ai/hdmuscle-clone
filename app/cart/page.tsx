'use client'

import Header from '../header'
import Footer from '../components/Footer'
import { useCart } from '../cart-context'
import { formatINR } from '../lib/catalog'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  return (
    <>
      <Header />

      <main id="mainContent" className="inner-page">
        <section className="inner-hero">
          <h1>YOUR CART</h1>
        </section>

        <section className="cart-layout">
          {items.length === 0 ? (
            <p className="cart-empty">Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-list">
                {items.map((item) => (
                  <article key={item.id} className="cart-item">
                    <img src={item.image} alt={item.title} />

                    <div className="cart-item__meta">
                      <h2>{item.title}</h2>
                      <p>{formatINR(item.price)}</p>

                      <div className="cart-item__qty">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>

                    <button type="button" className="cart-item__remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h3>ORDER SUMMARY</h3>
                <p>
                  <span>Subtotal</span>
                  <strong>{formatINR(total)}</strong>
                </p>
                <p>
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </p>

                <button type="button">CHECKOUT</button>
                <button type="button" className="cart-summary__clear" onClick={clearCart}>
                  Clear cart
                </button>
              </aside>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}

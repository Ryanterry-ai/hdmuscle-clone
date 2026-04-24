'use client'

import { useState } from 'react'
import Header from '../header'
import Footer from '../components/Footer'
import { useCart } from '../cart-context'
import { formatINR } from '../lib/catalog'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

type CheckoutResponse = {
  keyId?: string
  orderId?: string
  amount?: number
  currency?: string
  name?: string
  description?: string
  redirectUrl?: string
  error?: string
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector('script[data-razorpay="checkout"]') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpay = 'checkout'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  async function handleCheckout() {
    if (items.length === 0 || isCheckingOut) return
    setCheckoutMessage('')
    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      const payload = (await response.json()) as CheckoutResponse
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to start checkout.')
      }

      if (payload.redirectUrl) {
        window.location.href = payload.redirectUrl
        return
      }

      if (!payload.keyId || !payload.orderId || !payload.amount || !payload.currency) {
        throw new Error('Payment gateway is not configured. Please contact support.')
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load payment gateway. Please try again.')
      }

      const checkout = new window.Razorpay({
        key: payload.keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.name || 'HD MUSCLE',
        description: payload.description || 'Order payment',
        order_id: payload.orderId,
        handler: () => {
          clearCart()
          setCheckoutMessage('Payment successful. Thank you for your order.')
          setIsCheckingOut(false)
        },
        modal: {
          ondismiss: () => setIsCheckingOut(false),
        },
        theme: {
          color: '#111111',
        },
      })

      checkout.open()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start checkout.'
      setCheckoutMessage(message)
      setIsCheckingOut(false)
    }
  }

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

                <button type="button" onClick={handleCheckout} disabled={isCheckingOut}>
                  {isCheckingOut ? 'OPENING CHECKOUT...' : 'CHECKOUT'}
                </button>
                {checkoutMessage ? <p className="cart-summary__notice">{checkoutMessage}</p> : null}
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

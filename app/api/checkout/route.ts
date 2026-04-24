import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type CheckoutBody = {
  amount?: number
  currency?: string
  items?: Array<{ id?: string; title?: string; quantity?: number; price?: number }>
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody
    const amountInRupees = Math.max(1, Math.round(toNumber(body?.amount, 0)))
    const amountInPaise = amountInRupees * 100
    const currency = String(body?.currency || 'INR').toUpperCase()

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const fallbackCheckoutUrl = process.env.CHECKOUT_URL || process.env.NEXT_PUBLIC_CHECKOUT_URL || ''

    if (!keyId || !keySecret) {
      if (fallbackCheckoutUrl) {
        return NextResponse.json({ redirectUrl: fallbackCheckoutUrl })
      }
      return NextResponse.json(
        { error: 'Checkout is not configured yet. Please set Razorpay keys.' },
        { status: 503 },
      )
    }

    const receipt = `hdm_${Date.now()}`
    const notes = {
      items: Array.isArray(body?.items)
        ? body.items
            .slice(0, 12)
            .map((item) => `${item?.title || 'Item'} x${Math.max(1, toNumber(item?.quantity, 1))}`)
            .join(' | ')
        : '',
      source: 'hdmuscle.in',
    }

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt.slice(0, 40),
        notes,
      }),
      cache: 'no-store',
    })

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text()
      return NextResponse.json(
        {
          error: 'Unable to create Razorpay order.',
          details: errorText.slice(0, 300),
        },
        { status: 502 },
      )
    }

    const order = await razorpayResponse.json()

    return NextResponse.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: process.env.NEXT_PUBLIC_STORE_NAME || 'HD MUSCLE',
      description: 'Complete your order securely with Razorpay',
    })
  } catch {
    return NextResponse.json({ error: 'Unable to initiate checkout.' }, { status: 500 })
  }
}

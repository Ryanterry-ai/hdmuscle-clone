'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../header'
import Footer from '../../components/Footer'
import { useStore } from '../../store-context'

function normalizeHandle(value: string) {
  return value.toLowerCase().replace(/^\/+|\/+$/g, '')
}

export default function PolicyPage() {
  const params = useParams()
  const handle = normalizeHandle(String(params?.handle || ''))
  const { storefront } = useStore()

  const page = useMemo(() => {
    const pages = Array.isArray(storefront?.pages) ? storefront.pages : []
    const aliases = new Set([
      handle,
      `${handle}-policy`,
      handle.replace('-policy', ''),
      handle === 'return-policy' ? 'refund-policy' : handle,
      handle === 'terms-of-service' ? 'terms-conditions' : handle,
      handle === 'privacy-policy' ? 'privacy-policy' : handle,
      handle === 'shipping-policy' ? 'shipping-policy' : handle,
    ])

    return pages.find((item: any) => aliases.has(normalizeHandle(String(item?.handle || '')))) || null
  }, [storefront, handle])

  return (
    <>
      <Header />
      <main id="mainContent" className="inner-page">
        <section className="inner-hero">
          <h1>{page?.title || handle.replace(/-/g, ' ').toUpperCase()}</h1>
          <p>{page?.excerpt || 'Policy content managed from CMS.'}</p>
        </section>

        <section style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px 64px' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {page?.content || 'This policy has not been populated yet in CMS.'}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

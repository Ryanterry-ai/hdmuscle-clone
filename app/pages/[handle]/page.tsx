'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../header'
import Footer from '../../components/Footer'
import { useStore } from '../../store-context'

function normalizeHandle(value: string) {
  return value.toLowerCase().replace(/^\/+|\/+$/g, '')
}

export default function StaticPage() {
  const params = useParams()
  const handle = normalizeHandle(String(params?.handle || ''))
  const { storefront } = useStore()

  const page = useMemo(() => {
    const pages = Array.isArray(storefront?.pages) ? storefront.pages : []
    const aliases = new Set([
      handle,
      handle.replace(/^policies\//, ''),
      handle === 'about-us' ? 'our-story' : handle,
      handle === 'contact-us' ? 'contact' : handle,
      handle === 'ambassador-program' ? 'affiliate-ambassador' : handle,
      handle.replace('-policy', ''),
      handle.replace('terms-of-service', 'terms-conditions'),
      handle.replace('return-policy', 'refund-policy'),
    ])

    return (
      pages.find((item: any) => aliases.has(normalizeHandle(String(item?.handle || '')))) || null
    )
  }, [storefront, handle])

  return (
    <>
      <Header />
      <main id="mainContent" className="inner-page">
        <section className="inner-hero">
          <h1>{page?.title || handle.replace(/-/g, ' ').toUpperCase()}</h1>
          <p>{page?.excerpt || 'Content managed from CMS will appear here.'}</p>
        </section>

        <section style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px 64px' }}>
          {page?.featured_image ? (
            <img src={page.featured_image} alt={page.title || 'Page image'} style={{ width: '100%', marginBottom: 24 }} />
          ) : null}

          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {page?.content || 'This page has not been populated yet in CMS.'}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

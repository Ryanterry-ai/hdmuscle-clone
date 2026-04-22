'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import Header from '../../header'
import Footer from '../../components/Footer'
import { formatINR, getCollection, getProduct } from '../../lib/catalog'
import { useCart } from '../../cart-context'
import { useStore } from '../../store-context'

function parseOptions(value: unknown) {
  if (!value) return [] as string[]
  if (Array.isArray(value)) return value.map((option) => String(option).trim()).filter(Boolean)
  return String(value)
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
}

export default function ProductPage() {
  const params = useParams()
  const handle = String(params?.handle || '')
  const { addItem } = useCart()
  const { storefront } = useStore()

  const cmsProduct = useMemo(() => {
    const products = Array.isArray(storefront?.products) ? storefront.products : []
    return products.find((product: any) => String(product?.handle || '') === handle) || null
  }, [storefront, handle])

  const fallbackProduct = getProduct(handle)
  const fallbackCollection = fallbackProduct ? getCollection(fallbackProduct.collection) : null

  const product = cmsProduct
    ? {
        id: String(cmsProduct.id || cmsProduct.handle),
        handle: String(cmsProduct.handle),
        title: String(cmsProduct.title),
        price: Number(cmsProduct.price || 0),
        compare_at_price:
          cmsProduct.compare_at_price !== null && cmsProduct.compare_at_price !== undefined
            ? Number(cmsProduct.compare_at_price)
            : null,
        description: cmsProduct.description || cmsProduct.short_description || '',
        short_description: cmsProduct.short_description || '',
        image:
          cmsProduct.featured_image ||
          (Array.isArray(cmsProduct.images) && cmsProduct.images.length ? cmsProduct.images[0] : '') ||
          '/assets/hero-bg.jpg',
        secondary_image:
          Array.isArray(cmsProduct.images) && cmsProduct.images.length > 1 ? cmsProduct.images[1] : null,
        collection_handle:
          Array.isArray(cmsProduct.collection_handles) && cmsProduct.collection_handles.length > 0
            ? cmsProduct.collection_handles[0]
            : null,
        collection_title:
          Array.isArray(storefront?.collections)
            ? storefront.collections.find((item: any) => item?.handle === cmsProduct.collection_handles?.[0])?.title || 'Collection'
            : 'Collection',
        flavor_options: parseOptions(cmsProduct.flavor_options),
        size_options: parseOptions(cmsProduct.size_options),
        review_count: Number(cmsProduct.review_count || cmsProduct.reviewCount || 38),
      }
    : fallbackProduct
      ? {
          id: fallbackProduct.id,
          handle: fallbackProduct.handle,
          title: fallbackProduct.title,
          price: fallbackProduct.price,
          compare_at_price: fallbackProduct.compareAtPrice || null,
          description:
            'Built for serious performance with research-backed ingredients, transparent labels, and clinically dosed formulas.',
          short_description: '',
          image: fallbackProduct.image,
          secondary_image: fallbackProduct.secondaryImage || null,
          collection_handle: fallbackProduct.collection,
          collection_title: fallbackCollection?.title || 'Collection',
        flavor_options: fallbackProduct.variantOptions || [fallbackProduct.variantLabel || 'Default'],
        size_options: fallbackProduct.sizeOptions || [],
        review_count: Number(fallbackProduct.reviewCount || 38),
      }
      : null

  if (!product) {
    return (
      <>
        <Header />
        <main id="mainContent" className="inner-page">
          <section className="inner-hero">
            <h1>Product not found</h1>
            <p>Please go back and choose another product.</p>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const [selectedFlavor, setSelectedFlavor] = useState(product.flavor_options[0] || 'Default')
  const [selectedSize, setSelectedSize] = useState(product.size_options[0] || '')
  const installmentAmount = Math.max(1, Math.round(product.price / 4))
  const freeItemImage = '/greenshd-citrus-us_92d08dad-4bb8-407d-924a-25b91d9b49d0-2aee1aa60f8c.jpg'

  return (
    <>
      <Header />

      <main id="mainContent" className="inner-page">
        <div className="product-breadcrumbs">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <Link href={`/collections/${product.collection_handle || 'all'}`}>{product.collection_title || 'Collection'}</Link>
          <span>&gt;</span>
          <span>{product.title}</span>
        </div>

        <section className="product-page">
          <div className="product-page__gallery">
            <img src={product.image} alt={product.title} className="product-page__main-image" />
          </div>

          <div className="product-page__content">
            <p className="product-page__brand">HD MUSCLE</p>
            <h1 className="product-page__title">{product.title}</h1>

            <div className="product-page__price-row">
              <span>{formatINR(product.price)}</span>
              {product.compare_at_price ? <s>{formatINR(product.compare_at_price)}</s> : null}
            </div>

            <p className="product-page__shipping">Shipping calculated at checkout.</p>
            <p className="product-page__installment">
              or 4 interest-free payments of <strong>{formatINR(installmentAmount)}</strong> with{' '}
              <span className="product-page__afterpay">afterpay</span> <span aria-hidden>ⓘ</span>
            </p>

            <div className="product-page__reviews" aria-label="Product reviews">
              <span className="stars">★★★★★</span>
              <span>{product.review_count} Reviews</span>
            </div>

            {product.flavor_options.length > 0 ? (
              <div className="product-page__option-group">
                <label htmlFor="flavorSelect">Flavor</label>
                <div className="product-page__select-wrap">
                  <select id="flavorSelect" value={selectedFlavor} onChange={(event) => setSelectedFlavor(event.target.value)}>
                    {product.flavor_options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span aria-hidden>v</span>
                </div>
              </div>
            ) : null}

            {product.size_options.length > 0 ? (
              <div className="product-page__option-group">
                <label htmlFor="sizeSelect">Size</label>
                <div className="product-page__select-wrap">
                  <select id="sizeSelect" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>
                    {product.size_options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span aria-hidden>v</span>
                </div>
              </div>
            ) : null}

            <section className="product-page__claim-panel" aria-label="Free gift promotion">
              <p className="product-page__claim-header">Spend ₹9,999 Get ONE FREE GreensHD!</p>
              <div className="product-page__claim-item">
                <div className="product-page__claim-copy">
                  <img src={freeItemImage} alt="GreensHD Citrus" />
                  <div>
                    <p>GreensHD - Citrus</p>
                    <small>Free gift ready to claim</small>
                  </div>
                </div>
                <button type="button">Claim</button>
              </div>
              <div className="product-page__claim-item">
                <div className="product-page__claim-copy">
                  <img src={freeItemImage} alt="GreensHD Pineapple Mango" />
                  <div>
                    <p>GreensHD - Pineapple Mango</p>
                    <small>Free gift ready to claim</small>
                  </div>
                </div>
                <button type="button">Claim</button>
              </div>
            </section>

            <button type="button" className="product-page__claim-toggle">
              <span>Claim your FREE GreensHD!</span>
              <span aria-hidden>⌄</span>
            </button>

            <button
              type="button"
              className="product-page__cta"
              onClick={() =>
                addItem({
                  id: product.id,
                  title: `${product.title}${selectedFlavor ? ` - ${selectedFlavor}` : ''}${selectedSize ? ` / ${selectedSize}` : ''}`,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              ADD TO CART
            </button>

            <button type="button" className="product-page__shop-btn">
              Buy with shop
            </button>
            <button type="button" className="product-page__more-payments">
              More payment options
            </button>

            <div className="product-page__section-title">Description</div>
            <div className="product-page__section-body">
              <p>{product.description || product.short_description || 'No product description available yet.'}</p>
            </div>

            <div className="product-page__pickup">
              <p className="product-page__pickup-title">
                <span aria-hidden>●</span> Pick up available
              </p>
              <p className="product-page__pickup-time">Usually ready in 24 hours</p>
              <button type="button">View store info</button>
            </div>

            <div className="product-page__links">
              <Link href={`/collections/${product.collection_handle || 'all'}`}>View collection</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

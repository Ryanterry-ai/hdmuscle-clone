'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Header from '../../header'
import Footer from '../../components/Footer'
import { formatINR, getCollection, getProduct } from '../../lib/catalog'
import { useCart } from '../../cart-context'
import { useStore } from '../../store-context'

type RenderProduct = {
  id: string
  handle: string
  title: string
  price: number
  compare_at_price: number | null
  description: string
  short_description: string
  image: string
  secondary_image: string | null
  collection_handle: string | null
  collection_title: string
  flavor_options: string[]
  size_options: string[]
  review_count: number
}

function parseOptions(value: unknown) {
  if (!value) return [] as string[]
  if (Array.isArray(value)) return value.map((option) => String(option).trim()).filter(Boolean)
  return String(value)
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
}

function parseImageValue(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const candidate = source.url || source.src || source.path || source.value
    return typeof candidate === 'string' ? candidate.trim() : ''
  }
  return ''
}

function parseImageArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return value.map((item) => parseImageValue(item)).filter(Boolean)
}

export default function ProductPage() {
  const params = useParams()
  const handle = String(params?.handle || '')
  const { addItem } = useCart()
  const { storefront, loading } = useStore()

  const cmsProduct = useMemo(() => {
    const products = Array.isArray(storefront?.products) ? storefront.products : []
    return products.find((product: any) => String(product?.handle || '') === handle) || null
  }, [storefront, handle])

  const fallbackProduct = getProduct(handle)
  const fallbackCollection = fallbackProduct ? getCollection(fallbackProduct.collection) : null

  const product = useMemo<RenderProduct | null>(() => {
    if (!cmsProduct && !fallbackProduct) return null

    const cmsImages = [...parseImageArray(cmsProduct?.images), ...parseImageArray(cmsProduct?.gallery_images)]
    const cmsFeatured = parseImageValue(cmsProduct?.featured_image) || parseImageValue(cmsProduct?.image)
    const image = cmsFeatured || cmsImages[0] || fallbackProduct?.image || '/assets/hero-bg.jpg'

    const flavorOptions = parseOptions(cmsProduct?.flavor_options || cmsProduct?.flavorOptions)
    const sizeOptions = parseOptions(cmsProduct?.size_options || cmsProduct?.sizeOptions)

    const collectionHandle =
      (Array.isArray(cmsProduct?.collection_handles) && cmsProduct.collection_handles.length > 0
        ? String(cmsProduct.collection_handles[0])
        : '') || fallbackProduct?.collection || null

    const cmsCollectionTitle =
      collectionHandle && Array.isArray(storefront?.collections)
        ? storefront.collections.find((item: any) => String(item?.handle || '') === collectionHandle)?.title
        : null

    return {
      id: String(cmsProduct?.id || fallbackProduct?.id || handle),
      handle: String(cmsProduct?.handle || fallbackProduct?.handle || handle),
      title: String(cmsProduct?.title || fallbackProduct?.title || 'Product'),
      price: Number(cmsProduct?.price ?? fallbackProduct?.price ?? 0),
      compare_at_price:
        cmsProduct?.compare_at_price !== null && cmsProduct?.compare_at_price !== undefined
          ? Number(cmsProduct.compare_at_price)
          : fallbackProduct?.compareAtPrice || null,
      description:
        String(cmsProduct?.description || cmsProduct?.short_description || '').trim() ||
        'Built for serious performance with research-backed ingredients, transparent labels, and clinically dosed formulas.',
      short_description: String(cmsProduct?.short_description || '').trim(),
      image,
      secondary_image: cmsImages.find((item) => item !== image) || fallbackProduct?.secondaryImage || null,
      collection_handle: collectionHandle,
      collection_title: String(cmsCollectionTitle || fallbackCollection?.title || 'Collection'),
      flavor_options:
        flavorOptions.length > 0
          ? flavorOptions
          : fallbackProduct?.variantOptions || (fallbackProduct?.variantLabel ? [fallbackProduct.variantLabel] : []),
      size_options: sizeOptions.length > 0 ? sizeOptions : fallbackProduct?.sizeOptions || [],
      review_count: Number(cmsProduct?.review_count || cmsProduct?.reviewCount || fallbackProduct?.reviewCount || 38),
    }
  }, [cmsProduct, fallbackProduct, fallbackCollection, storefront, handle])

  const [selectedFlavor, setSelectedFlavor] = useState('Default')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    if (!product) return
    setSelectedFlavor(product.flavor_options[0] || 'Default')
    setSelectedSize(product.size_options[0] || '')
  }, [product?.id, product?.flavor_options?.join('|'), product?.size_options?.join('|')])

  if (!product) {
    if (loading) {
      return (
        <>
          <Header />
          <main id="mainContent" className="inner-page">
            <section className="inner-hero">
              <h1>Loading product</h1>
              <p>Fetching the latest product details.</p>
            </section>
          </main>
          <Footer />
        </>
      )
    }

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

  const flavorOptions = product.flavor_options.length > 0 ? product.flavor_options : ['Default']
  const sizeOptions = product.size_options
  const flavorValue = flavorOptions.includes(selectedFlavor) ? selectedFlavor : flavorOptions[0]
  const sizeValue = sizeOptions.includes(selectedSize) ? selectedSize : sizeOptions[0] || ''
  const installmentAmount = Math.max(1, Math.round(product.price / 4))
  const freeItemImage = '/greenshd-citrus-us_92d08dad-4bb8-407d-924a-25b91d9b49d0-2aee1aa60f8c.jpg'
  const rupeeSymbol = String.fromCharCode(8377)

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
              <span className="product-page__afterpay">afterpay</span> <span aria-hidden>(i)</span>
            </p>

            <div className="product-page__reviews" aria-label="Product reviews">
              <span className="stars">*****</span>
              <span>{product.review_count} Reviews</span>
            </div>

            {flavorOptions.length > 0 ? (
              <div className="product-page__option-group">
                <label htmlFor="flavorSelect">Flavor</label>
                <div className="product-page__select-wrap">
                  <select id="flavorSelect" value={flavorValue} onChange={(event) => setSelectedFlavor(event.target.value)}>
                    {flavorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span aria-hidden>v</span>
                </div>
              </div>
            ) : null}

            {sizeOptions.length > 0 ? (
              <div className="product-page__option-group">
                <label htmlFor="sizeSelect">Size</label>
                <div className="product-page__select-wrap">
                  <select id="sizeSelect" value={sizeValue} onChange={(event) => setSelectedSize(event.target.value)}>
                    {sizeOptions.map((option) => (
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
              <p className="product-page__claim-header">{`Spend ${rupeeSymbol}9,999 Get ONE FREE GreensHD!`}</p>
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
              <span aria-hidden>v</span>
            </button>

            <button
              type="button"
              className="product-page__cta"
              onClick={() =>
                addItem({
                  id: product.id,
                  title: `${product.title}${flavorValue ? ` - ${flavorValue}` : ''}${sizeValue ? ` / ${sizeValue}` : ''}`,
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
                <span aria-hidden>*</span> Pick up available
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

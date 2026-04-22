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
  flavor_images: Record<string, string>
  size_options: string[]
  review_count: number
}

function normalizeHandleKey(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function normalizeFlavorKey(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function isAllowedMediaUrl(url: string) {
  if (!url) return false
  if (url.startsWith('/')) return true
  if (/^https?:\/\//i.test(url)) {
    return /https?:\/\/([^/]*\.)?(hdmuscle\.in|cms\.hdmuscle\.in|vercel\.app)\b/i.test(url)
  }
  return false
}

function normalizeImagePath(raw: string) {
  const value = String(raw || '').trim()
  if (!value) return ''
  if (value.startsWith('//')) return ''
  if (value.startsWith('/')) return value
  if (/^https?:\/\//i.test(value)) return value
  if (/^[a-z0-9]/i.test(value)) return `/${value}`
  return ''
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
  if (typeof value === 'string') {
    const normalized = normalizeImagePath(value)
    return isAllowedMediaUrl(normalized) ? normalized : ''
  }
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const candidate = source.url || source.src || source.path || source.value
    if (typeof candidate === 'string') {
      const normalized = normalizeImagePath(candidate)
      return isAllowedMediaUrl(normalized) ? normalized : ''
    }
  }
  return ''
}

function parseImageArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return value.map((item) => parseImageValue(item)).filter(Boolean)
}

function parseFlavorImageMap(value: unknown) {
  const map: Record<string, string> = {}

  if (!value) return map

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== 'object') continue
      const source = item as Record<string, unknown>
      const flavor = String(source.flavor || source.name || source.option || '').trim()
      const image = parseImageValue(source.image || source.url || source.src)
      if (flavor && image) {
        map[flavor] = image
      }
    }
    return map
  }

  if (typeof value === 'object') {
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      const image = parseImageValue(raw)
      if (key.trim() && image) {
        map[key.trim()] = image
      }
    }
  }

  return map
}

export default function ProductPage() {
  const params = useParams()
  const handle = String(params?.handle || '')
  const { addItem } = useCart()
  const { storefront, loading } = useStore()

  const cmsProduct = useMemo(() => {
    const products = Array.isArray(storefront?.products) ? storefront.products : []
    const normalizedHandle = normalizeHandleKey(handle)
    return (
      products.find((product: any) => normalizeHandleKey(String(product?.handle || '')) === normalizedHandle) || null
    )
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
    const fallbackFlavorImages = fallbackProduct?.flavorImages || {}

    const cmsFlavorImageMap = {
      ...parseFlavorImageMap(cmsProduct?.flavor_image_map),
      ...parseFlavorImageMap(cmsProduct?.flavor_images),
    }

    const indexedFlavorImageMap: Record<string, string> = {}
    if (flavorOptions.length > 0 && cmsImages.length >= flavorOptions.length) {
      for (let index = 0; index < flavorOptions.length; index += 1) {
        const option = flavorOptions[index]
        const mapped = cmsImages[index]
        if (option && mapped) indexedFlavorImageMap[option] = mapped
      }
    }

    const flavorImages = {
      ...fallbackFlavorImages,
      ...indexedFlavorImageMap,
      ...cmsFlavorImageMap,
    }

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
      flavor_images: flavorImages,
      size_options: sizeOptions.length > 0 ? sizeOptions : fallbackProduct?.sizeOptions || [],
      review_count: Number(cmsProduct?.review_count || cmsProduct?.reviewCount || fallbackProduct?.reviewCount || 38),
    }
  }, [cmsProduct, fallbackProduct, fallbackCollection, storefront, handle])

  const [selectedFlavor, setSelectedFlavor] = useState('Default')
  const [selectedSize, setSelectedSize] = useState('')
  const [mainImageOverride, setMainImageOverride] = useState('')
  const fallbackMainImage = fallbackProduct?.image || '/assets/hero-bg.jpg'

  useEffect(() => {
    if (!product) return
    setSelectedFlavor(product.flavor_options[0] || 'Default')
    setSelectedSize(product.size_options[0] || '')
    setMainImageOverride('')
  }, [product?.id, product?.flavor_options?.join('|'), product?.size_options?.join('|')])

  useEffect(() => {
    setMainImageOverride('')
  }, [selectedFlavor, product?.id])

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
  const normalizedFlavorValue = normalizeFlavorKey(flavorValue)
  const flavorImageEntry =
    Object.entries(product.flavor_images || {}).find(([flavor]) => normalizeFlavorKey(flavor) === normalizedFlavorValue) ||
    null
  const flavorImage = flavorImageEntry?.[1] || product.image || fallbackMainImage
  const currentImage = mainImageOverride || flavorImage || '/assets/hero-bg.jpg'
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
            <img
              src={currentImage}
              alt={product.title}
              className="product-page__main-image"
              onError={() => {
                if (currentImage !== fallbackMainImage) {
                  setMainImageOverride(fallbackMainImage)
                } else if (currentImage !== '/assets/hero-bg.jpg') {
                  setMainImageOverride('/assets/hero-bg.jpg')
                }
              }}
            />
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
              <span className="product-page__snapmint-pill">snapmint</span> <span aria-hidden>(i)</span>
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
                  image: currentImage,
                })
              }
            >
              ADD TO CART
            </button>

            <button type="button" className="product-page__snapmint-btn">
              Buy with Snapmint
            </button>
            <p className="product-page__payment-note">Secure checkout via Razorpay or choose Snapmint EMI.</p>

            <div className="product-page__section-title">Description</div>
            <div className="product-page__section-body">
              <p>{product.description || product.short_description || 'No product description available yet.'}</p>
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

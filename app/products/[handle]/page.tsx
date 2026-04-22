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
            {product.secondary_image ? (
              <img src={product.secondary_image} alt={product.title} className="product-page__secondary-image" />
            ) : null}
          </div>

          <div className="product-page__content">
            <p className="product-page__brand">HD MUSCLE</p>
            <h1>{product.title}</h1>

            <div className="product-page__price-row">
              <span>{formatINR(product.price)}</span>
              {product.compare_at_price ? <s>{formatINR(product.compare_at_price)}</s> : null}
            </div>

            <p className="product-page__shipping">Shipping calculated at checkout.</p>

            <div className="product-page__reviews" aria-label="Product reviews">
              <span className="stars">*****</span>
              <span>12 Reviews</span>
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

            <details className="product-page__accordion" open>
              <summary>Description</summary>
              <p>{product.description || product.short_description || 'No product description available yet.'}</p>
            </details>

            <details className="product-page__accordion">
              <summary>Behind The Formula</summary>
              <p>
                Each formula is developed for practical training outcomes with clean profiles and performance-focused ingredient choices.
              </p>
            </details>

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

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '../../header'
import Footer from '../../components/Footer'
import { formatINR, getCollection, getProductsByCollection } from '../../lib/catalog'
import { useCart } from '../../cart-context'
import { useStore } from '../../store-context'

type CollectionItem = {
  id: string
  handle: string
  title: string
  image: string
  secondaryImage?: string | null
  price: number
  variantOptions?: string[]
  variantLabel?: string
}

function parseOptions(value: unknown) {
  if (!value) return [] as string[]
  if (Array.isArray(value)) return value.map((option) => String(option).trim()).filter(Boolean)
  return String(value)
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
}

function CollectionProductCard({
  item,
  onAdd,
}: {
  item: CollectionItem
  onAdd: () => void
}) {
  return (
    <article className="catalog-card" key={item.id}>
      <Link href={`/products/${item.handle}`} className="catalog-card__image-link">
        <div className="catalog-card__media">
          <img src={item.image} alt={item.title} className="catalog-card__primary" />
          {item.secondaryImage ? (
            <img src={item.secondaryImage} alt={item.title} className="catalog-card__secondary" />
          ) : null}
        </div>

        <div className="catalog-card__meta">
          <h3>{item.title}</h3>
          <p>From {formatINR(item.price)}</p>
        </div>
      </Link>

      <div className="catalog-card__actions">
        <select
          defaultValue={(item.variantOptions && item.variantOptions[0]) || item.variantLabel || 'Default'}
          aria-label={`${item.title} option`}
        >
          {(item.variantOptions && item.variantOptions.length > 0
            ? item.variantOptions
            : [item.variantLabel || 'Default']
          ).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <button type="button" onClick={onAdd}>
          <span>{formatINR(item.price)}</span>
          <span>ADD TO CART</span>
        </button>
      </div>
    </article>
  )
}

function CollectionGrid({
  items,
  onAdd,
}: {
  items: CollectionItem[]
  onAdd: (item: CollectionItem) => void
}) {
  return (
    <section className="catalog-grid-wrap">
      <div className="catalog-grid">
        {items.map((item) => (
          <CollectionProductCard key={item.id} item={item} onAdd={() => onAdd(item)} />
        ))}
      </div>
    </section>
  )
}

export default function CollectionPage() {
  const params = useParams()
  const handle = String(params?.handle || '')
  const { addItem } = useCart()
  const { storefront } = useStore()

  const cmsCollections = Array.isArray(storefront?.collections) ? storefront.collections : []
  const cmsProducts = Array.isArray(storefront?.products) ? storefront.products : []

  const cmsCollection = cmsCollections.find((collection: any) => String(collection?.handle || '') === handle) || null
  const fallbackCollection = getCollection(handle)

  const collection = cmsCollection
    ? {
        handle: String(cmsCollection.handle),
        title: String(cmsCollection.title || handle),
        description: String(cmsCollection.description || ''),
        image: String(cmsCollection.image || '/assets/hero-bg.jpg'),
        product_ids: Array.isArray(cmsCollection.product_ids) ? cmsCollection.product_ids.map((id: any) => String(id)) : [],
      }
    : fallbackCollection
      ? {
          ...fallbackCollection,
          product_ids: [],
        }
      : null

  const cmsItems: CollectionItem[] = collection
    ? cmsProducts
        .filter((product: any) => {
          const productCollectionHandles = Array.isArray(product?.collection_handles) ? product.collection_handles : []
          if (collection.product_ids.length > 0) {
            return collection.product_ids.includes(String(product?.id || ''))
          }
          return productCollectionHandles.includes(collection.handle)
        })
        .map((product: any) => {
          const images = Array.isArray(product?.images) ? product.images : []
          return {
            id: String(product?.id || product?.handle),
            handle: String(product?.handle || ''),
            title: String(product?.title || ''),
            image: String(product?.featured_image || images[0] || '/assets/hero-bg.jpg'),
            secondaryImage: images[1] || null,
            price: Number(product?.price || 0),
            variantOptions: parseOptions(product?.flavor_options),
            variantLabel: parseOptions(product?.flavor_options)[0] || 'Default',
          }
        })
    : []

  const fallbackItems = handle ? getProductsByCollection(handle) : []
  const items = cmsItems.length ? cmsItems : fallbackItems

  function onAdd(item: CollectionItem) {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
    })
  }

  if (!collection) {
    return (
      <>
        <Header />
        <main id="mainContent" className="inner-page">
          <section className="inner-hero">
            <h1>Collection not found</h1>
            <p>Please check the URL and try again.</p>
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
        <section className="collection-hero">
          <img src={collection.image || '/assets/hero-bg.jpg'} alt={collection.title} />
          <div className="collection-hero__copy">
            <h1>{collection.title}</h1>
            <p>{collection.description || 'Explore this collection.'}</p>
          </div>
          <Link href={`/collections/${collection.handle}`} className="collection-hero__cta">
            SHOP {collection.title.toUpperCase()}
          </Link>
        </section>

        <div className="section-label-row section-label-row--simple">
          <h2>{collection.title.toUpperCase()}</h2>
        </div>

        <CollectionGrid items={items} onAdd={onAdd} />
      </main>

      <Footer />
    </>
  )
}

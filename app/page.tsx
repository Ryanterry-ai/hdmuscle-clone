'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './header'
import Footer from './components/Footer'
import { useCart } from './cart-context'
import {
  apparelHandles,
  bestSellerHandles,
  formatINR,
  getProduct,
  getProductsByHandles,
  heroCategoryTiles,
  newNoteworthyHandles,
  trustIcons,
} from './lib/catalog'
import { useStore } from './store-context'

type DisplayProduct = {
  id: string
  handle: string
  title: string
  image: string
  secondaryImage?: string
  price: number
  compareAtPrice?: number | null
  variantOptions?: string[]
  variantLabel?: string
  sizeOptions?: string[]
  reviewCount?: number
  isFeatured?: boolean
  category?: string | null
}

const fallbackBestSellers = getProductsByHandles(bestSellerHandles)
const fallbackNewNoteworthy = getProductsByHandles(newNoteworthyHandles)
const fallbackApparel = getProductsByHandles(apparelHandles)
const fallbackProducts: DisplayProduct[] = [...fallbackBestSellers, ...fallbackNewNoteworthy, ...fallbackApparel].map((product) => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  image: product.image,
  secondaryImage: product.secondaryImage,
  price: product.price,
  compareAtPrice: product.compareAtPrice || null,
  variantOptions: product.variantOptions,
  variantLabel: product.variantLabel,
  sizeOptions: product.sizeOptions,
  reviewCount: product.reviewCount,
  isFeatured: false,
  category: product.collection,
}))

const fallbackReviews = [
  {
    image: '/sleephd_web1-d6d6eabbf104.png',
    quote:
      '"THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock. So many struggle with proper sleep, I will be recommending Sleep HD to all my clients. Thank you!" - Whitney L.',
  },
  {
    image: '/screen_shot_2023-09-12_at_11.28.44_pm-8b15ef4de17c.jpg',
    quote:
      '"PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!" - Greg D.',
  },
  {
    image: '/elite_web2-66e6fb800668.png',
    quote:
      '"All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you! Customer service has been 10/10" - Christina D.',
  },
]

const fallbackFaqItems = [
  'What makes HD Muscle supplements different?',
  'Are your products safe and third-party tested?',
  'Are your products vegan or gluten-free?',
  'Do you ship to the USA?',
  'How long does shipping take?',
  'How do I become part of the HD Collective?',
]

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
    const raw = value.trim()
    if (!raw) return ''
    if (raw.startsWith('/')) return raw
    if (/^https?:\/\/([^/]*\.)?(hdmuscle\.in|cms\.hdmuscle\.in|vercel\.app)\b/i.test(raw)) return raw
    if (/^[a-z0-9]/i.test(raw)) return `/${raw}`
    return ''
  }
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const candidate = source.url || source.src || source.path || source.value
    if (typeof candidate === 'string') return parseImageValue(candidate)
  }
  return ''
}

function parseImageArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return value.map((item) => parseImageValue(item)).filter(Boolean)
}

function normalizeHandle(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function getProductsByOrderedHandles(source: DisplayProduct[], handles: string[], fallbackSource: DisplayProduct[] = []) {
  const map = new Map(source.map((product) => [normalizeHandle(product.handle), product]))
  const fallbackMap = new Map(fallbackSource.map((product) => [normalizeHandle(product.handle), product]))
  return handles
    .map((handle) => map.get(normalizeHandle(handle)) || fallbackMap.get(normalizeHandle(handle)))
    .filter(Boolean) as DisplayProduct[]
}

function normalizeProducts(raw: any[]): DisplayProduct[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((product: any) => {
      const handle = String(product?.handle || '')
      const fallback = getProduct(handle)
      const images = [...parseImageArray(product?.images), ...parseImageArray(product?.gallery_images)]
      const featuredImage =
        parseImageValue(product?.featured_image) ||
        parseImageValue(product?.featuredImage) ||
        images[0] ||
        parseImageValue(product?.image) ||
        parseImageValue(product?.featuredImageUrl) ||
        fallback?.image ||
        '/assets/hero-bg.jpg'

      if (!product?.handle || !(product?.title || fallback?.title)) {
        return null
      }

      const flavorOptions = parseOptions(product?.flavor_options || product?.flavorOptions)
      const sizeOptions = parseOptions(product?.size_options || product?.sizeOptions)
      const fallbackVariants = fallback?.variantOptions || (fallback?.variantLabel ? [fallback.variantLabel] : [])

      return {
        id: String(product.id || product.handle),
        handle,
        title: String(product.title || fallback?.title || ''),
        image: String(featuredImage),
        secondaryImage:
          images.find((image) => image !== featuredImage) ||
          parseImageValue(product?.secondary_image) ||
          parseImageValue(product?.secondaryImage) ||
          fallback?.secondaryImage ||
          undefined,
        price: Number(product.price || fallback?.price || 0),
        compareAtPrice:
          product.compare_at_price !== null && product.compare_at_price !== undefined
            ? Number(product.compare_at_price)
            : fallback?.compareAtPrice || null,
        variantOptions: flavorOptions.length > 0 ? flavorOptions : fallbackVariants,
        variantLabel: (flavorOptions[0] || fallback?.variantLabel || undefined) as string | undefined,
        sizeOptions: sizeOptions.length > 0 ? sizeOptions : fallback?.sizeOptions || [],
        reviewCount: Number(product.review_count || fallback?.reviewCount || 0) || undefined,
        isFeatured: Boolean(product.is_featured),
        category: product.category || fallback?.collection || null,
      } as DisplayProduct
    })
    .filter(Boolean) as DisplayProduct[]
}

function getSectionContent(sections: any[], key: string, type?: string) {
  return (
    sections.find((section: any) => section?.key === key)?.content ||
    sections.find((section: any) => section?.section_key === key)?.content ||
    (type ? sections.find((section: any) => section?.type === type || section?.section_type === type)?.content : null) ||
    null
  )
}

function ProductCard({
  item,
  onAdd,
}: {
  item: DisplayProduct
  onAdd: () => void
}) {
  const [primarySrc, setPrimarySrc] = useState(item.image || '/assets/hero-bg.jpg')
  const [secondarySrc, setSecondarySrc] = useState(item.secondaryImage || '')

  useEffect(() => {
    setPrimarySrc(item.image || '/assets/hero-bg.jpg')
    setSecondarySrc(item.secondaryImage || '')
  }, [item.image, item.secondaryImage])

  return (
    <article className="catalog-card">
      <Link href={`/products/${item.handle}`} className="catalog-card__image-link">
        <div className="catalog-card__media">
          <img
            src={primarySrc}
            alt={item.title}
            className="catalog-card__primary"
            onError={() => setPrimarySrc('/assets/hero-bg.jpg')}
          />
          {secondarySrc ? (
            <img
              src={secondarySrc}
              alt={item.title}
              className="catalog-card__secondary"
              onError={() => setSecondarySrc('')}
            />
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
          aria-label={`${item.title} variant`}
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

function ProductSection({
  title,
  items,
  link,
  displayArrow,
}: {
  title: string
  items: DisplayProduct[]
  link: string
  displayArrow?: boolean
}) {
  const { addItem } = useCart()
  const railRef = useRef<HTMLDivElement>(null)
  const isScrollable = items.length > 4
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(isScrollable)

  function updateScrollState() {
    if (!isScrollable) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }

    const rail = railRef.current
    if (!rail) return

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth
    setCanScrollPrev(rail.scrollLeft > 2)
    setCanScrollNext(rail.scrollLeft < maxScrollLeft - 2)
  }

  function scrollProducts(direction: 'left' | 'right') {
    const rail = railRef.current
    if (!rail) return

    const firstCard = rail.querySelector('.catalog-card') as HTMLElement | null
    const step = firstCard ? firstCard.getBoundingClientRect().width : rail.clientWidth / 4
    rail.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    updateScrollState()
    const rail = railRef.current
    if (!rail || !isScrollable) return

    const onScroll = () => updateScrollState()
    const onResize = () => updateScrollState()
    rail.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [isScrollable, items.length])

  return (
    <section className="section-block">
      <div className="section-label-row">
        <h2>
          {title}
          {displayArrow ? <span>{' \u2193'}</span> : null}
        </h2>

        <div className="section-label-row__actions">
          <button type="button" onClick={() => scrollProducts('left')} disabled={!canScrollPrev} aria-label={`Previous ${title.toLowerCase()}`}>
            &larr;
          </button>
          <button type="button" onClick={() => scrollProducts('right')} disabled={!canScrollNext} aria-label={`Next ${title.toLowerCase()}`}>
            &rarr;
          </button>
        </div>
      </div>

      <div ref={railRef} className={`catalog-grid${isScrollable ? ' catalog-grid--carousel' : ''}`}>
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAdd={() =>
              addItem({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
              })
            }
          />
        ))}
      </div>

      <div className="view-products-row">
        <Link href={link}>View all products</Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [promoVisible, setPromoVisible] = useState(true)
  const { storefront } = useStore()

  const products = useMemo<DisplayProduct[]>(() => {
    const normalized = normalizeProducts(storefront?.products || [])
    return normalized.length >= 8 ? normalized : fallbackProducts
  }, [storefront])

  const sections = Array.isArray(storefront?.sections) ? storefront.sections : []

  const heroSection = getSectionContent(sections, 'hero', 'hero') || {}
  const aboutSection = getSectionContent(sections, 'about', 'brand_story') || {}
  const reviewsSection = getSectionContent(sections, 'reviews', 'testimonials') || {}
  const faqSection = getSectionContent(sections, 'faq', 'faq') || {}
  const coveredSection = getSectionContent(sections, 'you_re_covered', 'guarantee') || {}

  const bestSellers = useMemo(() => {
    const mapped = getProductsByOrderedHandles(products, bestSellerHandles, fallbackProducts)
    return mapped.length > 0 ? mapped : products.slice(0, 8)
  }, [products])

  const newNoteworthy = useMemo(() => {
    return products.slice(0, 8)
  }, [products])

  const apparel = useMemo(() => {
    const apparelProducts = products.filter((product) =>
      String(product.category || '').toLowerCase().includes('apparel')
    )
    return (apparelProducts.length ? apparelProducts : products).slice(0, 8)
  }, [products])

  const categoryTiles = useMemo(() => heroCategoryTiles, [])

  const reviews: Array<{ image: string; quote: string }> = Array.isArray(reviewsSection?.items) && reviewsSection.items.length > 0
    ? reviewsSection.items.map((item: any) => ({
        image: item?.image || '/assets/hero-bg.jpg',
        quote: item?.text || item?.quote || '',
      }))
    : fallbackReviews

  const faqItems: string[] = Array.isArray(faqSection?.questions) && faqSection.questions.length > 0
    ? faqSection.questions.map((item: any) => item?.question || '').filter(Boolean)
    : fallbackFaqItems

  const heroImage = heroSection?.hero_image || heroSection?.image || '/assets/hero-bg.jpg'
  const heroCtaText = heroSection?.cta_text || heroSection?.ctaText || 'FIND YOUR FORMULA'
  const heroCtaLink = heroSection?.cta_link || heroSection?.ctaLink || '/collections/pre-workouts'

  return (
    <>
      <Header />

      <main id="mainContent">
        <section className="hero-section" aria-label="Hero">
          <img src={heroImage} alt="HD Muscle hero" className="hero-section__image" />
          <Link href={heroCtaLink} className="hero-section__cta">
            {heroCtaText}
          </Link>
        </section>

        <section className="quality-strip" aria-label="Quality badges">
          {trustIcons.map((icon) => (
            <div className="quality-strip__item" key={icon.label}>
              <img src={icon.image} alt={icon.label} />
            </div>
          ))}
        </section>

        <section className="category-section" aria-label="Shop by category">
          <div className="section-label-row section-label-row--simple">
            <h2>SHOP BY GOAL</h2>
          </div>

          <div className="category-grid">
            {categoryTiles.map((tile) => (
              <Link href={tile.href} key={tile.title} className="category-card">
                <div className="category-card__media">
                  <img src={tile.image} alt={tile.title} />
                </div>
                <div className="category-card__label">{tile.title}</div>
              </Link>
            ))}
          </div>
        </section>

        <ProductSection title="SHOP OUR BEST SELLERS" items={bestSellers} link="/collections/pre-workouts" />
        <ProductSection title="NEW AND NOTEWORTHY" items={newNoteworthy} link="/collections/pre-workouts" displayArrow />

        <section className="story-section" aria-label="Brand story">
          <div className="story-section__copy">
            <p>
              {aboutSection?.content ||
                aboutSection?.body ||
                'HD Muscle is a family-built, performance-driven supplement brand founded in Canada by Dorian Hamilton and his family.'}
            </p>
            <p>
              We formulate with purpose: clinically backed ingredients, transparent labels, and products trusted by IFBB Pros and everyday athletes. No shortcuts - just supplements that work.
            </p>
          </div>

          <div className="story-section__media">
            <img src={aboutSection?.image || '/000031460020-adf7151a56fc.jpg'} alt="HD Muscle story" />
          </div>
        </section>

        <section className="reviews-section" aria-label="Reviews">
          <div className="section-label-row section-label-row--simple">
            <h2>{reviewsSection?.heading || 'REAL PEOPLE, REAL REVIEWS'}</h2>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <article key={review.quote} className="review-card">
                <img src={review.image} alt="Customer review" />
                <p className="review-stars">*****</p>
                <p>{review.quote}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="video-banner" aria-label="Brand video">
          <img src="/assets/video-banner-poster.jpg" alt="HD Muscle gym scene" />
          <button type="button" aria-label="Play video" className="video-banner__play">&gt;</button>
        </section>

        <ProductSection title="NEW ARRIVALS - APPAREL + ACCESSORIES" items={apparel} link="/collections/apparel-accessories-2" />

        <section className="faq-section" aria-label="FAQ">
          <div className="section-label-row section-label-row--simple">
            <h2>{faqSection?.heading || 'FREQUENTLY ASKED QUESTIONS'}</h2>
          </div>

          <div className="faq-grid">
            {faqItems.map((faq) => (
              <details key={faq} className="faq-row">
                <summary>{faq}</summary>
                <div>
                  HD Muscle formulas are developed with clinically backed ingredients and transparent labels. Contact support for product-specific details.
                </div>
              </details>
            ))}
          </div>

          <div className="view-products-row">
            <Link href="/pages/faq">View all FAQ</Link>
          </div>
        </section>

        <section className="cover-section" aria-label="You are covered">
          <div className="section-label-row section-label-row--simple">
            <h2>{coveredSection?.heading || "YOU'RE COVERED"}</h2>
          </div>

          <div className="cover-grid">
            <article>
              <h3>EASY RETURNS</h3>
              <p>{coveredSection?.easy_returns || "If something isn't right, we'll make it right. Unopened products can be returned within 30 days of delivery. For support, reach us anytime at info@hdmuscle.com"}</p>
            </article>
            <article>
              <h3>FAST SHIPPING</h3>
              <p>{coveredSection?.fast_shipping || 'We ship from warehouses in both Canada and the USA to ensure faster delivery and lower duties for our customers. Orders are processed quickly - most ship within 1-2 business days.'}</p>
            </article>
            <article>
              <h3>OUR GUARANTEE</h3>
              <p>{coveredSection?.guarantee || "We stand behind every formula we make. If you don't love your HD Muscle experience, contact us - our team is here to help."}</p>
            </article>
            <article>
              <h3>SECURE CHECKOUT</h3>
              <p>{coveredSection?.secure_checkout || 'Encrypted, secure payment processing - your information stays protected.'}</p>
            </article>
          </div>
        </section>
      </main>

      <Footer />

      {promoVisible ? (
        <button
          type="button"
          className="promo-float"
          onClick={() => setPromoVisible(false)}
          aria-label="Dismiss 10% off banner"
        >
          <span>Get 10% off</span>
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </>
  )
}

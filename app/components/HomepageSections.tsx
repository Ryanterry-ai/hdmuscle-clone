'use client';

import Link from 'next/link';
import { formatMoney } from '../lib/cms';

type Props = {
  sections: any[];
  products: any[];
  collections: any[];
  settings: any;
  addedProducts: Set<string>;
  onAddToCart: (product: any) => void;
};

function normalizeLink(url?: string) {
  if (!url || typeof url !== 'string') return '/';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

function getProductImage(product: any) {
  return (
    product?.featuredImageUrl ||
    product?.image ||
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'
  );
}

function getCollectionImage(collection: any) {
  return (
    collection?.image ||
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'
  );
}

function renderHero(section: any) {
  return (
    <section className="hero-section" key={section.id || 'hero'}>
      <div className="hero-section__bg">
        <img src={section?.backgroundImage} alt={section?.heading || 'Hero'} />
      </div>
      <div className="hero-section__overlay" />
      <div className="hero-section__content">
        <div className="container-wide">
          <div className="hero-section__inner">
            <div className="hero-section__eyebrow">
              {section?.eyebrow || 'Premium Quality Supplements'}
            </div>
            <h1 className="hero-section__title">{section?.heading || 'HD Muscle'}</h1>
            <p className="hero-section__subtitle">
              {section?.subheading || 'Premium supplements built for serious performance.'}
            </p>
            <div className="hero-section__actions">
              <Link href={normalizeLink(section?.ctaUrl)} className="hero-section__cta">
                {section?.ctaLabel || 'Shop Now'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderQualityBadges(section: any) {
  const badges = Array.isArray(section?.badges) ? section.badges : [];

  return (
    <section className="feature-strip" key={section.id || 'quality-badges'}>
      <div className="container-wide">
        <div className="feature-strip__grid">
          {badges.map((badge: any, index: number) => (
            <div key={`${badge?.text || 'badge'}-${index}`} className="feature-strip__item">
              <span className="feature-strip__icon">{badge?.icon || '✓'}</span>
              <span>{badge?.text || 'Premium Quality'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderCategoryTiles(section: any) {
  const items = Array.isArray(section?.items) ? section.items : [];

  return (
    <section className="home-section" key={section.id || 'category-tiles'}>
      <div className="container-wide">
        <div className="section-heading">
          <h2 className="section-heading__title">{section?.title || 'Shop Categories'}</h2>
        </div>

        <div className="collection-grid">
          {items.map((item: any, index: number) => (
            <Link
              key={`${item?.title || 'category'}-${index}`}
              href={normalizeLink(item?.url)}
              className="collection-card"
            >
              <div className="collection-card__media">
                <img src={item?.image} alt={item?.title || 'Collection'} />
              </div>
              <div className="collection-card__overlay" />
              <div className="collection-card__content">
                <div className="collection-card__title">{item?.title || 'Category'}</div>
                <span className="collection-card__link">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderFeaturedProducts(
  section: any,
  products: any[],
  settings: any,
  addedProducts: Set<string>,
  onAddToCart: (product: any) => void
) {
  const productHandles = Array.isArray(section?.productHandles)
    ? section.productHandles
    : [];

  const sectionProducts =
    productHandles.length > 0
      ? productHandles
          .map((handle: string) => products.find((item) => item?.handle === handle))
          .filter(Boolean)
      : products.slice(0, 8);

  if (!sectionProducts.length) return null;

  return (
    <section className="home-section" key={section.id || 'featured-products'}>
      <div className="container-wide">
        <div className="section-heading">
          <h2 className="section-heading__title">{section?.title || 'Best Sellers'}</h2>
          <Link href="/collections/all" className="section-heading__link">
            View all
          </Link>
        </div>

        <div className="product-grid">
          {sectionProducts.map((product: any) => {
            const isAdded = addedProducts.has(product.id);

            return (
              <article key={product.id} className="product-card">
                <Link href={`/products/${product.handle}`} className="product-card__media-link">
                  <div className="product-card__image">
                    {product?.badge ? (
                      <span className="product-card__badge">{product.badge}</span>
                    ) : null}
                    <img src={getProductImage(product)} alt={product?.title || 'Product'} />
                  </div>
                </Link>

                <div className="product-card__content">
                  <div className="product-card__meta">
                    {product?.category ? (
                      <div className="product-card__category">{product.category}</div>
                    ) : null}

                    <Link href={`/products/${product.handle}`} className="product-card__title">
                      {product?.title || 'Product'}
                    </Link>

                    {product?.shortDescription || product?.subtitle ? (
                      <p className="product-card__subtitle">
                        {product.shortDescription || product.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="product-card__pricing">
                    <span className="product-card__price">
                      {formatMoney(product?.price, settings?.currency, settings?.locale)}
                    </span>

                    {product?.compareAtPrice ? (
                      <span className="product-card__compare">
                        {formatMoney(
                          product.compareAtPrice,
                          settings?.currency,
                          settings?.locale
                        )}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className={`product-card__button ${isAdded ? 'is-added' : ''}`}
                    onClick={() => onAddToCart(product)}
                  >
                    {isAdded ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderBrandStory(section: any) {
  return (
    <section className="story-section" key={section.id || 'brand-story'}>
      <div className="container-wide">
        <div className="story-section__grid">
          <div className="story-section__copy">
            <div className="section-kicker">Why HD Muscle</div>
            <h2 className="story-section__title">{section?.heading || 'Built for performance'}</h2>
            <p className="story-section__body">
              {section?.body || 'Trusted sports nutrition for muscle gain, strength, endurance, and recovery.'}
            </p>
            {section?.quote ? (
              <blockquote className="story-section__quote">“{section.quote}”</blockquote>
            ) : null}
          </div>

          <div className="story-section__media">
            <img
              src={
                section?.image ||
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80'
              }
              alt={section?.heading || 'Brand story'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function renderTestimonials(section: any) {
  const items = Array.isArray(section?.items) ? section.items : [];

  return (
    <section className="home-section home-section--light" key={section.id || 'testimonials'}>
      <div className="container-wide">
        <div className="section-heading section-heading--center">
          <h2 className="section-heading__title">{section?.title || 'Customer Reviews'}</h2>
          {section?.subtitle ? (
            <p className="section-heading__subtitle">{section.subtitle}</p>
          ) : null}
        </div>

        <div className="testimonial-grid">
          {items.map((item: any, index: number) => (
            <article key={`${item?.author || 'author'}-${index}`} className="testimonial-card">
              <div className="testimonial-card__stars">{'★'.repeat(item?.stars || 5)}</div>
              <p className="testimonial-card__text">{item?.text || 'Great product.'}</p>
              <div className="testimonial-card__author">{item?.author || 'Customer'}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderFaq(section: any) {
  const questions = Array.isArray(section?.questions) ? section.questions : [];

  return (
    <section className="home-section" key={section.id || 'faq'}>
      <div className="container-wide faq-shell">
        <div className="section-heading">
          <h2 className="section-heading__title">{section?.title || 'Frequently Asked Questions'}</h2>
        </div>

        <div className="faq-list">
          {questions.map((item: any, index: number) => (
            <details key={`${item?.question || 'question'}-${index}`} className="faq-item">
              <summary className="faq-item__question">{item?.question || 'Question'}</summary>
              <div className="faq-item__answer">{item?.answer || 'Answer'}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderGuarantee(section: any) {
  return (
    <section className="guarantee-section" key={section.id || 'guarantee'}>
      <div className="container-wide guarantee-section__inner">
        <div>
          <div className="section-kicker section-kicker--light">Performance Promise</div>
          <h2 className="guarantee-section__title">{section?.heading || 'Results you can trust'}</h2>
          <p className="guarantee-section__text">
            {section?.text || 'Premium ingredients, trusted quality, and supplements designed for serious athletes.'}
          </p>
        </div>

        <Link href={normalizeLink(section?.link)} className="guarantee-section__button">
          Learn More
        </Link>
      </div>
    </section>
  );
}

function renderNewsletter(section: any) {
  return (
    <section className="newsletter-section" key={section.id || 'newsletter'}>
      <div className="container-wide newsletter-section__inner">
        <div>
          <div className="section-kicker">Stay Updated</div>
          <h2 className="newsletter-section__title">{section?.heading || 'Join our newsletter'}</h2>
          <p className="newsletter-section__text">
            {section?.text || 'Get product drops, offers, and performance tips.'}
          </p>
        </div>

        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className="newsletter-form__input"
            placeholder={section?.placeholder || 'Enter your email'}
          />
          <button type="submit" className="newsletter-form__button">
            {section?.button || 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}

function renderFallbackCollections(collections: any[]) {
  if (!collections?.length) return null;

  return (
    <section className="home-section" key="fallback-collections">
      <div className="container-wide">
        <div className="section-heading">
          <h2 className="section-heading__title">Shop Collections</h2>
        </div>

        <div className="collection-grid">
          {collections.slice(0, 4).map((collection: any) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="collection-card"
            >
              <div className="collection-card__media">
                <img
                  src={getCollectionImage(collection)}
                  alt={collection?.title || 'Collection'}
                />
              </div>
              <div className="collection-card__overlay" />
              <div className="collection-card__content">
                <div className="collection-card__title">{collection?.title || 'Collection'}</div>
                <span className="collection-card__link">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderFallbackHero(products: any[]) {
  const image =
    products?.[0]?.featuredImageUrl ||
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="hero-section" key="fallback-hero">
      <div className="hero-section__bg">
        <img src={image} alt="HD Muscle hero" />
      </div>
      <div className="hero-section__overlay" />
      <div className="hero-section__content">
        <div className="container-wide">
          <div className="hero-section__inner">
            <div className="hero-section__eyebrow">HD Muscle</div>
            <h1 className="hero-section__title">
              Premium supplements built for serious performance
            </h1>
            <p className="hero-section__subtitle">
              Trusted sports nutrition for muscle gain, strength, endurance, and recovery.
            </p>
            <div className="hero-section__actions">
              <Link href="/collections/all" className="hero-section__cta">
                Shop All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomepageSections({
  sections,
  products,
  collections,
  settings,
  addedProducts,
  onAddToCart,
}: Props) {
  const safeSections = Array.isArray(sections) ? sections : [];

  if (!safeSections.length) {
    return (
      <>
        {renderFallbackHero(products)}
        {renderFallbackCollections(collections)}
        {renderFeaturedProducts(
          { id: 'fallback-products', title: 'Best Sellers', productHandles: [] },
          products,
          settings,
          addedProducts,
          onAddToCart
        )}
      </>
    );
  }

  return (
    <>
      {safeSections.map((section: any) => {
        switch (section?.type) {
          case 'hero':
            return renderHero(section);
          case 'quality_badges':
            return renderQualityBadges(section);
          case 'category_tiles':
            return renderCategoryTiles(section);
          case 'featured_products':
            return renderFeaturedProducts(
              section,
              products,
              settings,
              addedProducts,
              onAddToCart
            );
          case 'brand_story':
            return renderBrandStory(section);
          case 'testimonials':
            return renderTestimonials(section);
          case 'faq':
            return renderFaq(section);
          case 'guarantee':
            return renderGuarantee(section);
          case 'newsletter':
            return renderNewsletter(section);
          default:
            return null;
        }
      })}
    </>
  );
}

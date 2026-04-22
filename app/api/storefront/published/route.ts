import { NextResponse } from 'next/server';
import { collections, products } from '../../../lib/catalog';
import { getCmsPublishedEndpoint } from '../../../lib/site-config';

export const dynamic = 'force-dynamic';

const CMS_PUBLISHED_ENDPOINT = getCmsPublishedEndpoint();

function buildFallbackPayload() {
  const rupee = String.fromCharCode(8377);

  return {
    generatedAt: new Date().toISOString(),
    settings: {
      store_name: 'HD MUSCLE',
      currency: 'INR',
      locale: 'en-IN',
      symbol: rupee,
      announcement_text: `FREE SHIPPING OVER ${rupee}9,999`,
      announcement_link: '',
      logo: '/assets/HD logo.png',
      favicon: '',
      store_email: '',
      store_phone: '',
      store_address: '',
      instagram_url: '',
      facebook_url: '',
      youtube_url: '',
      tiktok_url: '',
      copyright_text: '(c) 2026 HD MUSCLE INDIA. All rights reserved.',
    },
    navigation: {
      header_main: [],
      footer_main: [],
      mobile: [],
    },
    sections: [],
    pages: [],
    products: products.map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      short_description: null,
      description: null,
      badge: product.badge || null,
      category: product.collection,
      tags: null,
      flavor_options: product.variantOptions?.join(',') || null,
      size_options: product.sizeOptions?.join(',') || null,
      price: product.price,
      compare_at_price: product.compareAtPrice || null,
      sku: null,
      inventory: 0,
      is_active: true,
      is_featured: false,
      seo_title: null,
      seo_description: null,
      images: [product.image, product.secondaryImage].filter(Boolean),
      featured_image: product.image,
      gallery_images: [product.secondaryImage].filter(Boolean),
      collection_ids: [],
      collection_handles: [product.collection],
    })),
    collections: collections.map((collection) => ({
      id: collection.handle,
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      image: collection.image,
      seo_title: null,
      seo_description: null,
      sort_order: 0,
      is_active: true,
      product_ids: products.filter((product) => product.collection === collection.handle).map((product) => product.id),
      products_count: products.filter((product) => product.collection === collection.handle).length,
    })),
  };
}

export async function GET() {
  try {
    const response = await fetch(CMS_PUBLISHED_ENDPOINT, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(buildFallbackPayload());
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(buildFallbackPayload());
  }
}

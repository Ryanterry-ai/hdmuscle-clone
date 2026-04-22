import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      globalSettings,
      announcement,
      headerNav,
      footerNav,
      homepageSections,
      cartDrawer,
      searchSettings,
      footerSettings,
      seo,
      products,
      collections,
    ] = await Promise.all([
      prisma.globalSettings.findFirst(),
      prisma.announcementBar.findFirst({ where: { is_active: true } }),
      prisma.navigation.findUnique({ where: { location: 'header' } }),
      prisma.navigation.findUnique({ where: { location: 'footer' } }),
      prisma.homepageSection.findMany({ 
        where: { is_active: true }, 
        orderBy: { position: 'asc' } 
      }),
      prisma.cartDrawerSettings.findFirst(),
      prisma.searchSettings.findFirst(),
      prisma.footerSettings.findFirst(),
      (prisma as any).sEO.findUnique({ where: { page: 'home' } }),
      prisma.product.findMany({ 
        where: { is_active: true, is_featured: true },
        take: 10,
        include: { images: { take: 1 } }
      }),
      prisma.collection.findMany({ 
        where: { is_active: true },
        take: 10
      }),
    ]);

    return NextResponse.json({
      // Slot: announcement-bar
      announcement: announcement ? {
        message: announcement.message,
        link: announcement.link,
      } : null,
      
      // Slot: header-nav
      header_navigation: headerNav ? JSON.parse(headerNav.links || '[]') : [],
      
      // Slot: homepage sections
      homepage: homepageSections.map(s => ({
        key: s.section_key,
        type: s.section_type,
        title: s.title,
        content: s.content ? JSON.parse(s.content) : null,
        settings: s.settings ? JSON.parse(s.settings) : {},
      })),
      
      // Slot: featured products
      featured_products: products.map(p => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        price: p.price,
        compare_at_price: p.compare_at_price,
        image: p.images[0]?.url || null,
      })),
      
      // Slot: collections
      collections: collections.map(c => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        image: c.image,
      })),
      
      // Slot: footer
      footer: {
        description: footerSettings?.description || null,
        columns: footerSettings?.columns ? JSON.parse(footerSettings.columns) : [],
        copyright: footerSettings?.copyright || null,
        newsletter_enabled: footerSettings?.show_newsletter || false,
      },
      
      // Slot: cart-drawer-promo
      cart_drawer: {
        headline: cartDrawer?.promo_headline || null,
        message: cartDrawer?.promo_message || null,
        image: cartDrawer?.promo_image || null,
        show: cartDrawer?.show_promo || false,
      },
      
      // Slot: search
      search: {
        placeholder: searchSettings?.placeholder || 'Search products...',
        show_trending: searchSettings?.show_trending || true,
        trending_terms: searchSettings?.trending_terms ? JSON.parse(searchSettings.trending_terms) : [],
      },
      
      // Global settings
      store: {
        name: globalSettings?.store_name || 'My Store',
        email: globalSettings?.store_email || null,
        phone: globalSettings?.store_phone || null,
        address: globalSettings?.store_address || null,
        currency: globalSettings?.currency || 'INR',
        logo: globalSettings?.logo || null,
        primary_color: globalSettings?.primary_color || '#f59e0b',
        accent_color: globalSettings?.accent_color || '#ea580c',
      },
      
      // SEO
      seo: seo ? {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords?.split(',').filter(Boolean),
        og_image: seo.og_image,
      } : null,
    });
  } catch (error) {
    console.error('Payload API error:', error);
    return NextResponse.json({ error: 'Failed to fetch payload' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    
    try {
      body = await request.json();
    } catch (e) {
      // Empty body is OK - will publish all
    }

    const target = body?.target || null;
    const section_keys = body?.section_keys || [];
    const product_ids = body?.product_ids || [];
    const scope = body?.scope || 'all';

    // Handle settings/global scope
    if (scope === 'global_settings' || target === 'settings') {
      // Just revalidate caches - settings auto-published to global settings
      revalidatePath('/api/settings/global');
      revalidatePath('/');
      return NextResponse.json({ 
        success: true, 
        message: 'Settings published (cache cleared)',
        revalidated: ['/', '/api/settings/global']
      });
    }

    // If targeting specific products
    if (target === 'products' && product_ids?.length > 0) {
      revalidatePath('/');
      revalidatePath('/api/products');
      revalidatePath('/products');
      revalidatePath('/collections');
      
      return NextResponse.json({ 
        success: true, 
        message: `Products published (cache cleared)`,
        revalidated: ['/', '/api/products', '/products', '/collections']
      });
    }

    // Publish specific sections
    if (section_keys?.length > 0) {
      for (const key of section_keys) {
        await prisma.section.updateMany({
          where: { section_key: key },
          data: { status: 'PUBLISHED', published_at: new Date() },
        });
      }
      revalidatePath('/');
      return NextResponse.json({ success: true, message: `Published ${section_keys.length} sections` });
    }

    // Publish all sections
    const result = await prisma.section.updateMany({
      where: { status: { not: 'PUBLISHED' } },
      data: { status: 'PUBLISHED', published_at: new Date() },
    });

    // Publish pages
    await prisma.page.updateMany({
      where: { is_active: true },
      data: {},
    });

    // Publish navigation
    await prisma.navigation.updateMany({
      where: { is_active: true },
      data: {},
    });

    // Revalidate ALL caches for storefront
    revalidatePath('/');
    revalidatePath('/api/products');
    revalidatePath('/products');
    revalidatePath('/collections');
    revalidatePath('/products/[handle]');
    revalidatePath('/collections/[handle]');

    return NextResponse.json({ 
      success: true, 
      message: 'All content published and cache cleared',
      sectionsUpdated: result.count 
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ 
      error: typeof error === 'string' ? error : 'Publish failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [draftSections, publishedSections, allProducts] = await Promise.all([
      prisma.section.count({ where: { status: 'DRAFT' } }),
      prisma.section.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      draft: draftSections,
      published: publishedSections,
      hasChanges: draftSections > 0,
      productsPublished: allProducts,
    });
  } catch (error: any) {
    console.error('Publish GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
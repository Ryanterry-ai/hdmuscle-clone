import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { 
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  return res.text();
}

function extractHandles(html: string, pattern: string): string[] {
  const regex = new RegExp(pattern, 'g');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

function extractTitle(handle: string): string {
  return handle
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function extractPrice(html: string): number {
  const priceMatch = html.match(/\$\s*([\d,.]+)/);
  return priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 29.99;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sourceUrl = body.sourceUrl || 'https://hdmuscle.in';

    const results = {
      products: { imported: 0, skipped: 0 },
      collections: { imported: 0, skipped: 0 },
    };

    // Fetch homepage
    const html = await fetchHtml(sourceUrl);

    // Extract product handles
    const productHandles = extractHandles(html, 'href="/products/([a-z0-9-]+)"');
    
    // Import products
    for (const handle of productHandles.slice(0, 100)) {
      try {
        const existing = await prisma.product.findUnique({ where: { handle } });
        if (existing) {
          results.products.skipped++;
        } else {
          await prisma.product.create({
            data: {
              handle,
              title: extractTitle(handle),
              description: '',
              price: 29.99,
              is_active: true,
              inventory: 100,
            },
          });
          results.products.imported++;
        }
      } catch {
        results.products.skipped++;
      }
    }

    // Extract collection handles
    const collectionHandles = extractHandles(html, 'href="/collections/([a-z0-9-]+)"');
    
    // Import collections
    for (const handle of collectionHandles.slice(0, 50)) {
      try {
        const existing = await prisma.collection.findUnique({ where: { handle } });
        if (existing) {
          results.collections.skipped++;
        } else {
          await prisma.collection.create({
            data: {
              handle,
              title: extractTitle(handle),
              is_active: true,
            },
          });
          results.collections.imported++;
        }
      } catch {
        results.collections.skipped++;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [productsCount, collectionsCount] = await Promise.all([
      prisma.product.count(),
      prisma.collection.count(),
    ]);

    return NextResponse.json({
      stats: { products: productsCount, collections: collectionsCount },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
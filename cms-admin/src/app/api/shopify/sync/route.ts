import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShopifyService, ShopifyProduct, ShopifyCollection, ShopifyOrder, ShopifyCustomer } from '@/lib/shopify';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { shop, accessToken, siteId } = body;

    if (!shop || !accessToken) {
      return NextResponse.json({ error: 'Shop and access token required' }, { status: 400 });
    }

    const shopify = new ShopifyService({ shop, accessToken });
    
    const results = {
      products: { imported: 0, updated: 0, errors: 0 },
      collections: { imported: 0, updated: 0, errors: 0 },
      orders: { imported: 0, updated: 0, errors: 0 },
      customers: { imported: 0, updated: 0, errors: 0 },
    };

    // Import Products
    try {
      const products = await shopify.getProducts();
      for (const p of products) {
        try {
          const action = await syncProduct(p, siteId);
          if (action === 'created') {
            results.products.imported++;
          } else {
            results.products.updated++;
          }
        } catch (e: any) {
          results.products.errors++;
          console.error('Product sync error:', e.message);
        }
      }
    } catch (e) {
      console.error('Products fetch error:', e);
    }

    // Import Collections
    try {
      const collections = await shopify.getCollections();
      for (const c of collections) {
        try {
          const action = await syncCollection(c, siteId);
          if (action === 'created') {
            results.collections.imported++;
          } else {
            results.collections.updated++;
          }
        } catch (e: any) {
          results.collections.errors++;
        }
      }
    } catch (e) {
      console.error('Collections fetch error:', e);
    }

    // Import Customers
    try {
      const customers = await shopify.getCustomers();
      for (const c of customers) {
        try {
          const action = await syncCustomer(c, siteId);
          if (action === 'created') {
            results.customers.imported++;
          } else {
            results.customers.updated++;
          }
        } catch (e: any) {
          results.customers.errors++;
        }
      }
    } catch (e) {
      console.error('Customers fetch error:', e);
    }

    // Import Orders
    try {
      const orders = await shopify.getOrders('any');
      for (const o of orders) {
        try {
          const action = await syncOrder(o, siteId);
          if (action === 'created') {
            results.orders.imported++;
          } else {
            results.orders.updated++;
          }
        } catch (e: any) {
          results.orders.errors++;
        }
      }
    } catch (e) {
      console.error('Orders fetch error:', e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sync completed',
      results 
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function syncProduct(p: ShopifyProduct, siteId?: string) {
  const existingProduct = await prisma.product.findUnique({
    where: { handle: p.handle },
    select: { id: true },
  });

  const product = await prisma.product.upsert({
    where: { handle: p.handle },
    create: {
      handle: p.handle,
      title: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, '') || '',
      description_html: p.body_html || '',
      price: p.variants[0]?.price || '0',
      compare_at_price: p.variants[0]?.compare_at_price || null,
      sku: p.variants[0]?.sku || null,
      barcode: p.variants[0]?.barcode || null,
      inventory: p.variants[0]?.inventory_quantity || 0,
      weight: p.variants[0]?.weight || null,
      weight_unit: p.variants[0]?.weight_unit || null,
      is_active: p.status === 'active',
      is_featured: false,
      is_taxable: true,
      track_inventory: true,
    },
    update: {
      title: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, '') || '',
      description_html: p.body_html || '',
      price: p.variants[0]?.price || '0',
      compare_at_price: p.variants[0]?.compare_at_price || null,
      sku: p.variants[0]?.sku || null,
      barcode: p.variants[0]?.barcode || null,
      inventory: p.variants[0]?.inventory_quantity || 0,
      is_active: p.status === 'active',
    },
  });

  // Sync product images
  for (const img of p.images) {
    await prisma.productImage.upsert({
      where: { id: String(img.id) },
      create: {
        id: String(img.id),
        product_id: product.id,
        url: img.src,
        alt_text: img.alt,
        sort_order: img.position,
      },
      update: {
        url: img.src,
        alt_text: img.alt,
        sort_order: img.position,
      },
    });
  }

  // Sync variants (simplified - main variant only)
  if (p.variants.length > 1) {
    // For multiple variants, you might want a separate ProductVariant model
  }

  return existingProduct ? 'updated' : 'created';
}

async function syncCollection(c: ShopifyCollection, siteId?: string) {
  const existingCollection = await prisma.collection.findUnique({
    where: { handle: c.handle },
    select: { id: true },
  });

  await prisma.collection.upsert({
    where: { handle: c.handle },
    create: {
      handle: c.handle,
      title: c.title,
      description: c.description,
      image: c.image?.src || null,
      is_active: c.published,
      sort_order: getSortOrder(c.sort_order),
    },
    update: {
      title: c.title,
      description: c.description,
      image: c.image?.src || null,
      is_active: c.published,
      sort_order: getSortOrder(c.sort_order),
    },
  });

  return existingCollection ? 'updated' : 'created';
}

async function syncCustomer(c: ShopifyCustomer, siteId?: string) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { email: c.email },
    select: { id: true },
  });

  const customer = await prisma.customer.upsert({
    where: { email: c.email },
    create: {
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
      accept_marketing: c.accepts_marketing,
    },
    update: {
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
      accept_marketing: c.accepts_marketing,
    },
  });

  await prisma.address.deleteMany({
    where: { customer_id: customer.id },
  });

  for (const addr of c.addresses) {
    await prisma.address.create({
      data: {
        customer_id: customer.id,
        first_name: addr.first_name,
        last_name: addr.last_name,
        address1: addr.address1,
        address2: addr.address2,
        city: addr.city,
        state: addr.province,
        country: addr.country,
        zip: addr.zip,
        phone: addr.phone,
        is_default: c.addresses.indexOf(addr) === 0,
      },
    });
  }

  return existingCustomer ? 'updated' : 'created';
}

async function syncOrder(o: ShopifyOrder, siteId?: string) {
  const existingOrder = await prisma.order.findUnique({
    where: { order_number: String(o.order_number) },
    select: { id: true },
  });

  let customerId: string | null = null;
  
  if (o.customer?.email) {
    const customer = await prisma.customer.findUnique({
      where: { email: o.customer.email },
    });
    customerId = customer?.id || null;
  }

  const order = await prisma.order.upsert({
    where: { order_number: String(o.order_number) },
    create: {
      order_number: String(o.order_number),
      customer_id: customerId,
      email: o.email,
      first_name: o.customer?.first_name || null,
      last_name: o.customer?.last_name || null,
      phone: o.customer?.phone || null,
      subtotal: o.subtotal_price,
      shipping: o.total_shipping,
      tax: o.total_tax,
      discount: '0',
      total: o.total_price,
      status: mapOrderStatus(o.status),
      fulfillment_status: o.fulfillment_status || 'NONE',
      payment_status: mapPaymentStatus(o.financial_status),
      shipping_address: JSON.stringify(o.shipping_address),
      billing_address: JSON.stringify(o.billing_address),
    },
    update: {
      status: mapOrderStatus(o.status),
      fulfillment_status: o.fulfillment_status || 'NONE',
      payment_status: mapPaymentStatus(o.financial_status),
    },
  });

  await prisma.orderItem.deleteMany({
    where: { order_id: order.id },
  });

  for (const item of o.line_items) {
    await prisma.orderItem.create({
      data: {
        order_id: order.id,
        product_id: String(item.product_id),
        variant_id: String(item.variant_id),
        title: item.title,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        total: String(parseFloat(item.price) * item.quantity),
      },
    });
  }

  return existingOrder ? 'updated' : 'created';
}

function getSortOrder(sortOrder: string): number {
  const orderMap: Record<string, number> = {
    'best-selling': 1,
    'created': 2,
    'manual': 3,
    'price-ascending': 4,
    'price-descending': 5,
    'title-ascending': 6,
    'title-descending': 7,
  };
  return orderMap[sortOrder] || 99;
}

function mapOrderStatus(status: string): string {
  const map: Record<string, string> = {
    'open': 'PROCESSING',
    'closed': 'CANCELLED',
    'cancelled': 'CANCELLED',
    'refunded': 'CANCELLED',
    'pending': 'PENDING',
  };
  return map[status] || status.toUpperCase();
}

function mapPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    'pending': 'PENDING',
    'authorized': 'AUTHORIZED',
    'paid': 'PAID',
    'partially_paid': 'PARTIALLY_PAID',
    'refunded': 'REFUNDED',
    'partially_refunded': 'PARTIALLY_REFUNDED',
    'voided': 'VOIDED',
  };
  return map[status] || status.toUpperCase();
}

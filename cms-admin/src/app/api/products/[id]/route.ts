import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, collections: { include: { collection: true } } },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const productId = params.id || body.id;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const { id, images, collections, image, ...productData } = body;
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: productData,
    });
    
    // Revalidate the products cache so the storefront updates immediately
    revalidatePath('/api/products');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/collections');
    
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return PATCH(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    
    // Revalidate cache
    revalidatePath('/api/products');
    revalidatePath('/');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
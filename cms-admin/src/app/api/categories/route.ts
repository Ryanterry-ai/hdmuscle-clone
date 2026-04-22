import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const CATEGORIES_SETTING_KEY = 'product_categories';

function normalizeName(value: unknown) {
  return String(value || '').trim();
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

async function readStoredCategories() {
  const setting = await prisma.setting.findUnique({
    where: { key: CATEGORIES_SETTING_KEY },
  });

  if (!setting) return [] as string[];

  try {
    const parsed = JSON.parse(setting.value);
    if (!Array.isArray(parsed)) return [] as string[];
    return uniqueSorted(parsed.map((item) => String(item)));
  } catch {
    return [] as string[];
  }
}

async function writeStoredCategories(values: string[]) {
  const normalized = uniqueSorted(values);
  await prisma.setting.upsert({
    where: { key: CATEGORIES_SETTING_KEY },
    create: {
      key: CATEGORIES_SETTING_KEY,
      value: JSON.stringify(normalized),
      description: 'Managed product categories for admin dropdowns.',
    },
    update: {
      value: JSON.stringify(normalized),
    },
  });
  return normalized;
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorizedResponse();

  const [products, storedCategories] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      where: { category: { not: null } },
    }),
    readStoredCategories(),
  ]);

  const productCategories = products
    .map((item) => normalizeName(item.category))
    .filter(Boolean);

  const merged = uniqueSorted([...productCategories, ...storedCategories]);

  const counts = merged.map((name) => ({
    name,
    product_count: products.filter((item) => normalizeName(item.category) === name).length,
  }));

  return NextResponse.json({
    categories: counts,
    total: counts.length,
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as Record<string, unknown>;
  const name = normalizeName(body.name);

  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const current = await readStoredCategories();
  const updated = await writeStoredCategories([...current, name]);

  return NextResponse.json({
    success: true,
    categories: updated,
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as Record<string, unknown>;
  const oldName = normalizeName(body.old_name);
  const newName = normalizeName(body.new_name);

  if (!oldName || !newName) {
    return NextResponse.json(
      { error: 'Both old_name and new_name are required' },
      { status: 400 },
    );
  }

  await prisma.product.updateMany({
    where: { category: oldName },
    data: { category: newName },
  });

  const current = await readStoredCategories();
  const replaced = current.map((item) => (item === oldName ? newName : item));
  const updated = await writeStoredCategories(replaced);

  return NextResponse.json({
    success: true,
    categories: updated,
  });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as Record<string, unknown>;
  const name = normalizeName(body.name);
  const clearProducts = Boolean(body.clear_products);

  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  if (clearProducts) {
    await prisma.product.updateMany({
      where: { category: name },
      data: { category: null },
    });
  }

  const current = await readStoredCategories();
  const updated = await writeStoredCategories(current.filter((item) => item !== name));

  return NextResponse.json({
    success: true,
    categories: updated,
  });
}


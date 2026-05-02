import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const goalMap: Record<string, string> = {};
  catalog.products.forEach(p => {
    const category = catalog.categories.find(c => c.name === p.category);
    goalMap[p.handle] = category?.goal || 'uncategorized';
  });

  const goalGroups: Record<string, any[]> = {};
  catalog.products.forEach(p => {
    const goal = goalMap[p.handle];
    if (!goalGroups[goal]) goalGroups[goal] = [];
    if (!goalGroups[goal].find(x => x.handle === p.handle)) {
      goalGroups[goal].push(p);
    }
  });

  const goals = Object.entries(goalGroups).map(([goal, products]) => ({
    goal,
    productCount: products.length,
  }));

  return NextResponse.json(goals, {
    headers: { 'Content-Type': 'application/json' },
  });
}

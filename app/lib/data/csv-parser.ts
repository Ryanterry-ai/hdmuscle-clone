import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'csv-parse/sync';

export function parseCSV<T>(filename: string): T[] {
  const content = readFileSync(resolve(process.cwd(), 'exports', filename), 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true }) as T[];
}

export function parseProductsJSON(): any[] {
  const content = readFileSync(resolve(process.cwd(), 'data', 'rewritten', 'products.json'), 'utf-8');
  return JSON.parse(content);
}

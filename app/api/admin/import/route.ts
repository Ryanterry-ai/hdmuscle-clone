import { NextRequest, NextResponse } from 'next/server'
import { catalogService } from '@/lib/data/json-repository'

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'parse'

  try {
    if (action === 'parse') {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['xlsx', 'csv', 'json'].includes(ext || '')) {
        return NextResponse.json({ error: 'Invalid file type. Use .xlsx, .csv, or .json' }, { status: 400 })
      }

      let products: any[] = []
      const bytes = await file.arrayBuffer()

      if (ext === 'json') {
        const text = new TextDecoder().decode(bytes)
        products = JSON.parse(text)
        if (!Array.isArray(products)) products = [products]
      } else if (ext === 'csv') {
        const text = new TextDecoder().decode(bytes)
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
            const obj: Record<string, any> = {}
            headers.forEach((h, idx) => { obj[h] = vals[idx] || '' })
            products.push(obj)
          }
        }
      } else if (ext === 'xlsx') {
        const { default: ExcelJS } = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(bytes)
        const ws = workbook.worksheets[0]
        if (!ws) return NextResponse.json({ error: 'No worksheet found' }, { status: 400 })
        const headers: string[] = []
        ws.eachRow((row, num) => {
          if (num === 1) row.eachCell((cell, colNum) => { headers[colNum - 1] = String(cell.value || '') })
          else {
            const obj: Record<string, any> = {}
            row.eachCell((cell, colNum) => { obj[headers[colNum - 1]] = cell.value ?? '' })
            products.push(obj)
          }
        })
      }

      return NextResponse.json({ products, count: products.length })
    }

    if (action === 'validate') {
      const { products } = await request.json()
      if (!Array.isArray(products)) return NextResponse.json({ error: 'Products must be an array' }, { status: 400 })
      const result = await catalogService.validateImport(products)
      return NextResponse.json(result)
    }

    if (action === 'apply') {
      const { products } = await request.json()
      if (!Array.isArray(products)) return NextResponse.json({ error: 'Products must be an array' }, { status: 400 })
      const result = await catalogService.applyImport(products)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action. Use parse, validate, or apply' }, { status: 400 })
  } catch (error: any) {
    console.error('Import API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

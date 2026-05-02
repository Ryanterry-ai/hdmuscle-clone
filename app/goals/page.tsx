export const dynamic = 'force-dynamic';

import Link from 'next/link'
import { CatalogData } from '@/lib/data/json-repository'
import { Target, Flame, Shield, Zap, Heart, Activity, Dumbbell, Pill } from 'lucide-react'
import { notFound } from 'next/navigation'

const goalIcons: Record<string, any> = {
  'muscle building': Dumbbell,
  'weight loss': Flame,
  'immunity': Shield,
  'recovery': Zap,
  'general health': Heart,
  'performance': Activity,
  'health': Pill,
  'wellness': Heart,
}

export default async function GoalsPage() {
  const catalog = CatalogData.getInstance()
  catalog.loadAll()
  const goals = catalog.getGoalsWithProducts()

  if (!goals || goals.length === 0) {
    notFound()
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target size={48} className="mx-auto mb-4 text-[#00ff88]" />
          <h1 className="text-4xl font-bold mb-3">Shop by Goal</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Find supplements tailored to your fitness goals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {goals.map((goal) => {
            const Icon = goalIcons[goal.goal.toLowerCase()] || Target
            return (
              <Link key={goal.goal} href={`/goals/${goal.goal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="group block bg-white rounded-2xl border p-6 hover:border-[#00ff88] hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-50 transition-colors">
                  <Icon size={28} className="text-gray-600 group-hover:text-[#00ff88]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.goal}</h3>
                <p className="text-sm text-gray-500">{goal.productCount} product{goal.productCount !== 1 ? 's' : ''}</p>
                {goal.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {goal.categories.slice(0, 2).map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}


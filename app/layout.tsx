import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HD MUSCLE - Premium Fitness Supplements',
  description: 'India\'s most trusted fitness supplement brand. Whey Protein, Pre-Workout, Mass Gainer & more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

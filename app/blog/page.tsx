export const dynamic = 'force-dynamic';

import { BookOpen } from 'lucide-react';

const mockPosts = [
  { id: 1, title: '10 Essential Supplements for Muscle Growth', excerpt: 'Discover the top supplements that can help you build muscle faster and more efficiently.', date: '2026-04-15', category: 'Supplements', featured: true },
  { id: 2, title: 'How to Structure Your Workout Routine', excerpt: 'Learn how to create a workout plan that targets all major muscle groups.', date: '2026-04-10', category: 'Training', featured: false },
  { id: 3, title: 'The Importance of Post-Workout Nutrition', excerpt: 'What you eat after your workout is just as important as the workout itself.', date: '2026-04-05', category: 'Nutrition', featured: false },
  { id: 4, title: 'Recovery Techniques for Athletes', excerpt: 'Speed up recovery and reduce muscle soreness with these proven techniques.', date: '2026-03-28', category: 'Recovery', featured: false },
  { id: 5, title: 'Healthy Lifestyle Habits for Busy People', excerpt: 'Stay fit and healthy even with a busy schedule using these simple habits.', date: '2026-03-20', category: 'Lifestyle', featured: false },
];

const categories = ['All', 'Training', 'Nutrition', 'Recovery', 'Supplements', 'Lifestyle'];

export const metadata = {
  title: 'Fitness Knowledge Hub | Upgraded.co.in',
  description: 'Read the latest articles on training, nutrition, recovery, and supplements.',
};

export default function BlogPage() {
  const featuredPost = mockPosts.find(p => p.featured);
  const regularPosts = mockPosts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-primary/10 to-blue-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Fitness Knowledge Hub</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Expert advice on training, nutrition, recovery, and supplements to help you reach your fitness goals.
          </p>
        </div>
      </section>

      <section className="bg-yellow-50 border-b border-yellow-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
          <p className="text-sm text-yellow-800 font-medium">🚀 Our blog is launching soon! Subscribe to get notified when we publish new articles.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button key={category} className={`px-4 py-2 rounded-full text-sm font-medium ${
              category === 'All' ? 'bg-primary text-dark-bg' : 'bg-light-bg text-text-muted hover:bg-primary/10 hover:text-primary'
            }`}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPost && (
            <div className="md:col-span-2 lg:col-span-3 bg-light-bg rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto bg-gray-200 flex items-center justify-center text-text-muted">Featured Image</div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-sm text-primary font-medium mb-2">{featuredPost.category}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                  <p className="text-text-muted mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">{new Date(featuredPost.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <button className="btn-ghost text-sm">Read More</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {regularPosts.map((post) => (
            <div key={post.id} className="border border-border-light rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="relative aspect-video bg-gray-200 flex items-center justify-center text-text-muted">Post Image</div>
              <div className="p-6">
                <span className="text-sm text-primary font-medium mb-2 block">{post.category}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-text-muted text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <button className="btn-ghost text-sm">Read More</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-light-bg py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-text-muted mb-6">Get the latest fitness tips and exclusive offers delivered to your inbox.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:border-primary" />
            <button className="btn-filled px-6">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}


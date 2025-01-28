import { Article } from '@/types';
import NewsCard from '@/components/features/News/NewsCard';

// This would typically come from an API or database
const articles: Article[] = [
  {
    id: 1,
    title: 'Team Secures Victory in Season Opener',
    slug: 'team-secures-victory-season-opener',
    excerpt: 'An impressive performance leads to a convincing win in the first match of the season.',
    content: 'Full article content here...',
    image: 'https://picsum.photos/seed/news1/800/600',
    category: 'Match Report',
    author: 'John Smith',
    publishedAt: '2024-01-28T10:00:00Z',
  },
  {
    id: 2,
    title: 'New Player Signing Announcement',
    slug: 'new-player-signing-announcement',
    excerpt: 'Exciting new talent joins the squad ahead of the upcoming season.',
    content: 'Full article content here...',
    image: 'https://picsum.photos/seed/news2/800/600',
    category: 'Team News',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-27T14:30:00Z',
  },
  // Add more articles as needed
];

export default function NewsPage() {
  return (
    <div className="container-width py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-navy mb-4">Latest News</h1>
        <p className="text-gray-dark">Stay up to date with the latest rugby news and team updates.</p>
      </div>

      {/* Featured Article */}
      <div className="mb-12">
        <NewsCard article={articles[0]} priority />
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.slice(1).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
} 

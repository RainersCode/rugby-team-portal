import { Article } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

// This would typically come from an API or database
const articles: Article[] = [
  {
    id: 1,
    title: 'Team Secures Victory in Season Opener',
    slug: 'team-secures-victory-season-opener',
    excerpt: 'An impressive performance leads to a convincing win in the first match of the season.',
    content: `
      In a thrilling season opener, our team demonstrated their prowess on the field with a convincing victory. The match, played in front of a capacity crowd, showcased the results of months of intensive preparation and training.

      The first half saw our team dominate possession, with the forward pack providing a solid platform for the backs to execute their attacking plays. The breakthrough came in the 23rd minute when our fly-half orchestrated a brilliant move that resulted in the first try of the match.

      The second half continued in much the same vein, with our defense proving impenetrable and our attack clinical. The final score reflected the team's superiority and sets a positive tone for the season ahead.

      Key highlights:
      - 3 tries scored
      - 85% tackle success rate
      - 65% possession
      - 0 injuries

      The coaching staff expressed satisfaction with the performance while acknowledging there's still room for improvement. The team will now focus on preparing for next week's away fixture.
    `,
    image: 'https://picsum.photos/seed/news1/1920/1080',
    category: 'Match Report',
    author: 'John Smith',
    publishedAt: '2024-01-28T10:00:00Z',
  },
  // Add more articles as needed
];

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="container-width py-8">
      <div className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-gray-medium mb-4">
            <span className="text-primary-blue font-semibold">{article.category}</span>
            <span>•</span>
            <time>
              {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
            </time>
            <span>•</span>
            <span>By {article.author}</span>
          </div>
          <h1 className="text-4xl font-bold text-secondary-navy mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-gray-dark mb-8">{article.excerpt}</p>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-secondary-navy prose-p:text-gray-dark">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
} 

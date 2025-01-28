import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // Mock data for news articles
  const newsArticles = [
    {
      id: 1,
      title: 'Team Secures Victory in Season Opener',
      excerpt: 'An impressive performance leads to a convincing win in the first match of the season.',
      image: 'https://picsum.photos/seed/news1/800/600',
      category: 'Match Report',
    },
    {
      id: 2,
      title: 'New Player Signing Announcement',
      excerpt: 'Exciting new talent joins the squad ahead of the upcoming season.',
      image: 'https://picsum.photos/seed/news2/800/600',
      category: 'Team News',
    },
    {
      id: 3,
      title: 'Youth Academy Success Story',
      excerpt: 'Local talent progresses through the ranks to make first team debut.',
      image: 'https://picsum.photos/seed/news3/800/600',
      category: 'Academy',
    },
    {
      id: 4,
      title: 'Community Outreach Program Launch',
      excerpt: 'Team announces new initiative to support local rugby development.',
      image: 'https://picsum.photos/seed/news4/800/600',
      category: 'Community',
    },
    {
      id: 5,
      title: 'Stadium Upgrades Revealed',
      excerpt: 'Major improvements to enhance fan experience at home matches.',
      image: 'https://picsum.photos/seed/news5/800/600',
      category: 'Club News',
    },
    {
      id: 6,
      title: 'Season Ticket Sales Record',
      excerpt: 'Unprecedented support as season ticket sales reach new heights.',
      image: 'https://picsum.photos/seed/news6/800/600',
      category: 'Club News',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full">
        <Image
          src="https://picsum.photos/seed/hero/1920/1080"
          alt="Rugby team in action"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="container-width text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Rugby Team</h1>
            <p className="text-xl mb-8 max-w-2xl">
              Experience the passion, power and precision of professional rugby at its finest.
              Join us on our journey to glory.
            </p>
            <Link
              href="/tickets"
              className="bg-primary-blue hover:bg-accent-blue text-white px-8 py-3 rounded-full transition-colors inline-block"
            >
              Get Tickets
            </Link>
          </div>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="container-width">
        <h2 className="text-3xl font-bold mb-8">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-sm text-primary-blue font-semibold">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <Link
                  href={`/news/${article.id}`}
                  className="text-accent-blue hover:text-primary-blue transition-colors font-semibold"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

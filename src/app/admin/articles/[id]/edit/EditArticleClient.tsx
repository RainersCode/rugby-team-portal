'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import ArticleEditor from '@/components/features/News/ArticleEditor';
import { Article } from '@/types';

interface EditArticleClientProps {
  id: string;
}

export default function EditArticleClient({ id }: EditArticleClientProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          router.push('/');
          return;
        }

        const { data: article, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (articleError) throw articleError;
        if (!article) throw new Error('Article not found');

        // Parse blocks if they're stored as a string
        if (typeof article.blocks === 'string') {
          article.blocks = JSON.parse(article.blocks);
        }

        setArticle(article);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, router, supabase]);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    image: string;
    blocks: any[];
    author_id?: string;
  }) => {
    setSaving(true);
    setError(null);

    try {
      // Convert blocks to JSON string before saving
      const processedBlocks = JSON.stringify(formData.blocks);

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: formData.title,
          content: formData.content,
          image: formData.image,
          blocks: processedBlocks,
          author_id: formData.author_id || article?.author_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/admin/articles');
        router.refresh(); // Force Next.js to revalidate the cache
      }, 500);
    } catch (error) {
      console.error('Error updating article:', error);
      setError(error instanceof Error ? error.message : 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!article) return <div>Article not found</div>;

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <ArticleEditor
        onSubmit={handleSubmit}
        initialData={article}
        isSubmitting={saving}
      />
    </Card>
  );
} 
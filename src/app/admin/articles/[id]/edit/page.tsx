'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { slugify } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAdminAndLoadArticle = async () => {
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
          .eq('id', params.id)
          .single();

        if (articleError) throw articleError;
        if (!article) throw new Error('Article not found');

        setArticle(article);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadArticle();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const image = formData.get('image') as string;

      if (!title || !content || !image) {
        throw new Error('Please fill in all fields');
      }

      const slug = slugify(title);

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title,
          slug,
          content,
          image,
        })
        .eq('id', params.id);

      if (updateError) throw updateError;

      router.push('/admin/articles');
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
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={article.title}
            placeholder="Enter article title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            defaultValue={article.image}
            placeholder="Enter image URL"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={article.content}
            placeholder="Write your article content here..."
            className="min-h-[200px]"
            required
          />
        </div>

        {error && (
          <div className="text-red-500">{error}</div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/articles')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
} 
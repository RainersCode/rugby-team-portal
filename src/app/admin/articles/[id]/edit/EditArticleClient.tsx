'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { supabase, withRetry } from '@/utils/supabase';
import { Database } from '@/lib/database.types';
import ArticleEditor from '@/components/features/News/ArticleEditor';
import { Article } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EditArticleClientProps {
  id: string;
}

export default function EditArticleClient({ id }: EditArticleClientProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data: { session } } = await supabase().auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Use withRetry to handle temporary errors
        const { data: article, error: articleError } = await withRetry(() => 
          supabase()
            .from('articles')
            .select('*')
            .eq('id', id)
            .single()
        );

        if (articleError) throw articleError;
        if (!article) throw new Error('Article not found');

        // Parse blocks if they're stored as a string
        if (typeof article.blocks === 'string') {
          article.blocks = JSON.parse(article.blocks);
        }

        setArticle(article);
      } catch (error: any) {
        console.error('Error loading article:', error);
        setError(error.message || 'Failed to load article');
        toast({
          title: 'Error loading article',
          description: error.message || 'Failed to load article',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, router]);

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
      // Process blocks before saving to reduce data size
      const processedBlocks = optimizeArticleBlocks(formData.blocks);
      
      // Use withRetry for database operation
      const { error: updateError } = await withRetry(() => 
        supabase()
          .from('articles')
          .update({
            title: formData.title,
            content: formData.content,
            image: formData.image,
            blocks: JSON.stringify(processedBlocks),
            author_id: formData.author_id || article?.author_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      );

      if (updateError) throw updateError;

      toast({
        title: 'Article updated',
        description: 'Your article has been updated successfully',
      });

      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/admin/articles');
        router.refresh(); // Force Next.js to revalidate the cache
      }, 500);
    } catch (error: any) {
      console.error('Error updating article:', error);
      setError(error.message || 'Failed to update article');
      toast({
        title: 'Error updating article',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to optimize article blocks to reduce size
  const optimizeArticleBlocks = (blocks: any[]) => {
    // Create a deep copy of blocks to avoid mutating the original
    const processedBlocks = JSON.parse(JSON.stringify(blocks));
    
    // Process each block to reduce size
    return processedBlocks.map((block: any) => {
      // Remove any unnecessary large data or redundant fields
      if (block.type === 'image' && block.originalFile) {
        // Don't need to store the full file object
        delete block.originalFile;
      }
      return block;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading article...</span>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-300 rounded-md">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-500">{error}</p>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/admin/articles')}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-300 rounded-md">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Not Found</h2>
        <p className="text-red-500">Article not found</p>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/admin/articles')}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <ArticleEditor
        onSubmit={handleSubmit}
        initialData={article}
        isSubmitting={saving}
      />
    </Card>
  );
} 
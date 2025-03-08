'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase, withRetry } from '@/utils/supabase';
import { Database } from '@/lib/database.types';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  image: string;
  blocks?: any[];
}

export default function ArticlesPage() {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use withRetry for better resilience
      const { data, error } = await withRetry(() => 
        supabase()
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      
      setArticles(data || []);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message || 'Failed to load articles');
      toast({
        title: 'Error fetching articles',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    setDeleting(id);
    try {
      // First get the article to access the image path
      const { data: article, error: getError } = await withRetry(() => 
        supabase()
          .from('articles')
          .select('image')
          .eq('id', id)
          .single()
      );

      if (getError) throw getError;

      // Delete the article from the database
      const { error: deleteError } = await withRetry(() => 
        supabase()
          .from('articles')
          .delete()
          .eq('id', id)
      );

      if (deleteError) throw deleteError;

      // Try to delete the associated image, but don't fail if it doesn't work
      if (article?.image) {
        try {
          const imagePath = getImagePathFromUrl(article.image);
          if (imagePath) {
            await supabase()
              .storage
              .from('articles')
              .remove([imagePath]);
          }
        } catch (imageError) {
          console.error('Error deleting image (non-critical):', imageError);
        }
      }

      // Update the UI
      setArticles(articles.filter(article => article.id !== id));
      toast({
        title: 'Article deleted',
        description: 'The article has been successfully deleted',
      });
    } catch (err: any) {
      console.error('Error deleting article:', err);
      toast({
        title: 'Error deleting article',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getImagePathFromUrl = (url: string): string | null => {
    try {
      const match = url.match(/\/article-images\/([^?]+)/);
      if (match) {
        return `article-images/${match[1]}`;
      }
      return null;
    } catch (error) {
      console.error('Error extracting image path:', error);
      return null;
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-6 w-48" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchArticles} variant="outline">
                Try Again
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (articles.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No articles found. Create your first article.
          </TableCell>
        </TableRow>
      );
    }

    return articles.map((article) => (
      <TableRow key={article.id}>
        <TableCell>{article.title}</TableCell>
        <TableCell>{article.slug}</TableCell>
        <TableCell>{formatDate(article.created_at)}</TableCell>
        <TableCell>{formatDate(article.updated_at)}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
              disabled={deleting === article.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(article.id)}
              disabled={deleting === article.id}
            >
              {deleting === article.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button onClick={() => router.push('/admin/articles/new')}>
          New Article
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>
    </Card>
  );
} 


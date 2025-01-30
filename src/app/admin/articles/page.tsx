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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { formatDate } from '@/lib/utils';

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAdmin = async () => {
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

      loadArticles();
    };

    checkAdmin();
  }, [router, supabase]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const getImagePathFromUrl = (url: string): string | null => {
    try {
      console.log('Processing URL:', url);
      // Extract path after article-images/
      const match = url.match(/\/article-images\/([^?]+)/);
      if (match) {
        const result = match[1];
        console.log('Extracted image path:', result);
        return `article-images/${result}`;
      }
      console.log('No valid image path found in URL');
      return null;
    } catch (error) {
      console.error('Error extracting image path:', error);
      return null;
    }
  };

  const deleteImagesFromStorage = async (article: Article) => {
    try {
      console.log('Starting image deletion for article:', article.id);
      const imagesToDelete: string[] = [];

      // Add main article image
      if (article.image) {
        console.log('Processing main article image:', article.image);
        const mainImagePath = getImagePathFromUrl(article.image);
        if (mainImagePath) {
          console.log('Adding main image to deletion list:', mainImagePath);
          imagesToDelete.push(mainImagePath);
        }
      }

      // Add images from blocks
      if (article.blocks) {
        console.log('Processing article blocks');
        let blocks = article.blocks;
        if (typeof blocks === 'string') {
          console.log('Parsing blocks from string');
          blocks = JSON.parse(blocks);
        }
        
        for (const block of blocks) {
          if (block.type === 'image' && block.imageUrl) {
            console.log('Processing block image:', block.imageUrl);
            const blockImagePath = getImagePathFromUrl(block.imageUrl);
            if (blockImagePath) {
              console.log('Adding block image to deletion list:', blockImagePath);
              imagesToDelete.push(blockImagePath);
            }
          }
        }
      }

      // Delete all images in one batch if there are any
      if (imagesToDelete.length > 0) {
        console.log('Attempting to delete images:', imagesToDelete);
        
        // Delete from articles bucket
        const { data, error: storageError } = await supabase.storage
          .from('articles')
          .remove(imagesToDelete);

        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
          throw storageError;
        }
        console.log('Storage deletion response:', data);
      } else {
        console.log('No images to delete');
      }
    } catch (error) {
      console.error('Error in deleteImagesFromStorage:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      console.log('Starting deletion process for article:', id);
      
      // Get the article first to get image URLs
      const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching article:', fetchError);
        throw fetchError;
      }
      if (!article) {
        console.error('Article not found:', id);
        throw new Error('Article not found');
      }

      console.log('Retrieved article:', article);

      // Delete images from storage
      try {
        await deleteImagesFromStorage(article);
        console.log('Successfully deleted images from storage');
      } catch (storageError) {
        console.error('Failed to delete images:', storageError);
        // Continue with article deletion even if image deletion fails
      }

      // Delete the article from the database
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting article from database:', deleteError);
        throw deleteError;
      }
      
      console.log('Successfully deleted article from database');
      setArticles(articles.filter(article => article.id !== id));
    } catch (error) {
      console.error('Error in handleDelete:', error);
      setError('Failed to delete article');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
          {articles.map((article) => (
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
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 


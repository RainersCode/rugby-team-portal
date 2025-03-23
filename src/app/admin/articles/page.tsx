'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAdminData } from '@/hooks/useAdminData';
import { createClient } from '@/utils/supabase/client';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  image_path?: string;
  published: boolean;
}

export default function ArticlesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { 
    data: articles, 
    loading, 
    error, 
    deleteItem,
    fetchData
  } = useAdminData<Article>({
    table: 'articles',
    fetchOnMount: true,
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load articles',
        description: error.message,
      });
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData({ orderBy: 'created_at', orderDirection: 'desc' });
    setIsRefreshing(false);
  };

  const handleDelete = async (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    
    try {
      // If there's an image, delete it from storage
      if (articleToDelete.image_path) {
        const supabase = createClient();
        await supabase.storage.from('articles').remove([articleToDelete.image_path.split('/').pop() || '']);
      }
      
      // Delete the article from the database
      await deleteItem(articleToDelete.id);
      
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'There was an error deleting the article.',
      });
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-4">Loading articles..</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-4 text-red-500">
            Error loading articles: {error.message}
          </td>
        </tr>
      );
    }

    if (articles.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-4">No articles found.</td>
        </tr>
      );
    }

    return articles.map((article) => (
      <tr key={article.id} className="border-b hover:bg-muted/50">
        <td className="py-3 px-4">
          <div className="flex items-center space-x-3">
            {article.image_path && (
              <div className="relative h-10 w-16 rounded overflow-hidden">
                <Image
                  src={article.image_path}
                  alt={article.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-medium">{article.title}</div>
              <div className="text-xs text-muted-foreground">{article.slug}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded text-xs ${article.published ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {article.published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td className="py-3 px-4 text-sm">{format(new Date(article.created_at), 'PPP')}</td>
        <td className="py-3 px-4 text-sm">{format(new Date(article.updated_at), 'PPP')}</td>
        <td className="py-3 px-4">
          <div className="flex justify-end space-x-2">
            <Button size="icon" variant="ghost" asChild>
              <Link href={`/admin/articles/${article.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(article)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Articles</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/articles/new">
              <Plus className="h-4 w-4 mr-1" />
              New Article
            </Link>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollArea>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 


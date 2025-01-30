'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { slugify } from '@/lib/utils';

export default function NewArticlePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;

      if (!title || !content || !imageUrl) {
        throw new Error('Please fill in all fields and upload an image');
      }

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

      const slug = slugify(title);

      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          title,
          slug,
          content,
          image: imageUrl,
          author_id: session.user.id
        });

      if (insertError) throw insertError;

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      setError(error instanceof Error ? error.message : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter article title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Article Image</Label>
          <ImageUpload
            onUploadComplete={(url) => setImageUrl(url)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
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
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Article'}
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

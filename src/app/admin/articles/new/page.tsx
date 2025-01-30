'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { slugify } from '@/lib/utils';
import ArticleEditor from '@/components/features/News/ArticleEditor';

async function generateUniqueSlug(supabase: any, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}

export default function NewArticlePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    image: string;
    blocks: any[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title) throw new Error('Title is required');
      if (!formData.image) throw new Error('Main image is required');
      if (!formData.content && (!formData.blocks || formData.blocks.length === 0)) {
        throw new Error('Content is required');
      }

      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        router.push('/login');
        return;
      }

      // Check admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // Generate unique slug
      const baseSlug = slugify(formData.title);
      const uniqueSlug = await generateUniqueSlug(supabase, baseSlug);

      // Create the article
      const { data: article, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: formData.title,
          slug: uniqueSlug,
          content: formData.content,
          image: formData.image,
          author_id: session.user.id,
          blocks: formData.blocks || []
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert Error Details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw new Error(insertError.message || 'Failed to create article');
      }

      if (!article) {
        throw new Error('Failed to create article - no data returned');
      }

      router.push('/admin/articles');
    } catch (error) {
      console.error('Detailed error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while creating the article'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Article</h1>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <ArticleEditor
        onSubmit={handleSubmit}
        isSubmitting={loading}
      />
    </Card>
  );
} 

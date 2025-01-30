'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  id?: string;
}

export function ImageUpload({ onUploadComplete, defaultImage, id = 'default' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const inputId = `imageInput-${id}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('articles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(filePath);

      // Set preview and notify parent
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
      // Clear the input value to allow uploading the same file again
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Image'
          )}
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {previewUrl && (
        <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-lg border">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArticleBlock } from '@/types';
import { 
  PlusCircle, 
  Heading, 
  Image as ImageIcon, 
  Type, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Italic,
  Bold,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArticleEditorProps {
  onSubmit: (formData: {
    title: string;
    content: string;
    image: string;
    blocks: ArticleBlock[];
    author_id?: string;
  }) => void;
  initialData?: {
    title: string;
    content: string;
    image: string;
    blocks?: ArticleBlock[];
    author_id?: string;
  };
  isSubmitting: boolean;
  authors?: { id: string; email: string }[];
}

export default function ArticleEditor({ onSubmit, initialData, isSubmitting, authors }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [mainImage, setMainImage] = useState(initialData?.image || '');
  const [authorId, setAuthorId] = useState(initialData?.author_id || '');
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    initialData?.blocks || [
      { type: 'paragraph', content: initialData?.content || '', styles: {
        italic: false,
        bold: false,
        underline: false,
        align: 'left'
      } }
    ]
  );
  
  const getImagePathFromUrl = useCallback((url: string): string | null => {
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
  }, []);

  const deleteImageFromStorage = useCallback(async (imageUrl: string) => {
    try {
      const imagePath = getImagePathFromUrl(imageUrl);
      if (!imagePath) {
        console.error('Could not extract image path from URL:', imageUrl);
        return;
      }

      const { error: storageError } = await supabase.storage
        .from('articles')
        .remove([imagePath]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
        throw storageError;
      }

      console.log('Successfully deleted image from storage:', imagePath);
    } catch (error) {
      console.error('Error in deleteImageFromStorage:', error);
    }
  }, [getImagePathFromUrl]);

  const onImageUpload = useCallback(async (file: File) => {
    try {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;
      
      let fileToUpload = file;
      if (file.size > 1024 * 1024 * 2) {
        fileToUpload = await resizeImage(file, 1920);
      }
      
      const { data, error } = await supabase.storage
        .from('articles')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }, []);

  const resizeImage = async (file: File, maxWidth: number): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width <= maxWidth) {
            resolve(file);
            return;
          }
          
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          }, file.type, 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (!mainImage) {
      alert('Main image is required');
      return;
    }
    
    const content = blocks
      .filter(block => block.type === 'paragraph')
      .map(block => block.content)
      .join(' ')
      .substring(0, 300) + '...';
    
    await onSubmit({
      title,
      content,
      image: mainImage,
      blocks,
      author_id: authorId
    });
  };

  const handleMainImageDelete = async () => {
    if (!mainImage) return;
    
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImageFromStorage(mainImage);
        setMainImage('');
      } catch (error) {
        console.error('Failed to delete main image:', error);
        alert('Failed to delete image. Please try again.');
      }
    }
  };

  const handleBlockImageDelete = async (index: number) => {
    const block = blocks[index];
    if (block.type !== 'image' || !block.imageUrl) return;

    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImageFromStorage(block.imageUrl);
        removeBlock(index);
      } catch (error) {
        console.error('Failed to delete block image:', error);
        alert('Failed to delete image. Please try again.');
      }
    }
  };

  const addBlock = (type: ArticleBlock['type']) => {
    setBlocks([...blocks, {
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      imageAlt: type === 'image' ? '' : undefined,
      styles: {},
    }]);
  };

  const updateBlock = (index: number, updates: Partial<ArticleBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const toggleStyle = (index: number, style: 'italic' | 'bold' | 'underline' | 'align') => {
    const block = blocks[index];
    if (block.type === 'paragraph') {
      updateBlock(index, {
        styles: {
          ...block.styles,
          [style]: style === 'align' ? 
            (block.styles?.align === 'left' ? 'center' : 
             block.styles?.align === 'center' ? 'right' : 'left') :
            !block.styles?.[style]
        }
      });
    }
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title"
          required
          disabled={isSubmitting}
        />
      </div>

      {authors && (
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id} className="hover:bg-accent">
                  {author.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Main Article Image</Label>
        <div className="relative">
          <ImageUpload
            value={mainImage}
            onChange={setMainImage}
            onUpload={onImageUpload}
            onUploadComplete={(url) => setMainImage(url)}
            disabled={isSubmitting}
          />
          {mainImage && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleMainImageDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Content Blocks</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock('paragraph')}
              className="bg-background hover:bg-accent border-input"
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock('heading')}
              className="bg-background hover:bg-accent border-input"
            >
              <Heading className="w-4 h-4 mr-2" />
              Add Heading
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock('image')}
              className="bg-background hover:bg-accent border-input"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={index} className="relative p-4 border rounded-lg bg-background">
              <div className="absolute right-2 top-2 flex gap-2 p-1 rounded-md bg-muted">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="hover:bg-accent text-foreground disabled:text-muted-foreground"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="hover:bg-accent text-foreground disabled:text-muted-foreground"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(index)}
                  className="hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {block.type === 'paragraph' && (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2 p-2 rounded-md bg-muted">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStyle(index, 'bold')}
                      className={`hover:bg-accent text-foreground ${block.styles?.bold ? 'bg-accent/50' : ''}`}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStyle(index, 'italic')}
                      className={`hover:bg-accent text-foreground ${block.styles?.italic ? 'bg-accent/50' : ''}`}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStyle(index, 'underline')}
                      className={`hover:bg-accent text-foreground ${block.styles?.underline ? 'bg-accent/50' : ''}`}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStyle(index, 'align')}
                      className="hover:bg-accent text-foreground"
                    >
                      {block.styles?.align === 'left' && <AlignLeft className="h-4 w-4" />}
                      {block.styles?.align === 'center' && <AlignCenter className="h-4 w-4" />}
                      {block.styles?.align === 'right' && <AlignRight className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Enter text content"
                    className={`min-h-[100px] bg-background border-input text-foreground ${
                      block.styles?.italic ? 'italic' : ''
                    } ${
                      block.styles?.bold ? 'font-bold' : ''
                    } ${
                      block.styles?.underline ? 'underline' : ''
                    } text-${block.styles?.align || 'left'}`}
                  />
                </div>
              )}

              {block.type === 'heading' && (
                <div className="space-y-2">
                  <Select
                    value={block.level?.toString()}
                    onValueChange={(value) => updateBlock(index, { level: parseInt(value) })}
                  >
                    <SelectTrigger className="w-32 bg-background border-input">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">H1</SelectItem>
                      <SelectItem value="2">H2</SelectItem>
                      <SelectItem value="3">H3</SelectItem>
                      <SelectItem value="4">H4</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Enter heading text"
                    className="bg-background border-input"
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-2 mt-8">
                  <ImageUpload
                    onUploadComplete={(url) => updateBlock(index, { imageUrl: url })}
                    defaultImage={block.imageUrl}
                    id={`block-image-${index}`}
                  />
                  <Input
                    value={block.imageAlt || ''}
                    onChange={(e) => updateBlock(index, { imageAlt: e.target.value })}
                    placeholder="Enter image alt text"
                    className="mt-2 bg-background border-input"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Article'
          )}
        </Button>
      </div>
    </form>
  );
} 

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArticleBlock } from '@/types';
import { PlusCircle, Heading, Image as ImageIcon, Type, Trash2, ArrowUp, ArrowDown, Italic } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
      { type: 'paragraph', content: initialData?.content || '', styles: {} }
    ]
  );
  const supabase = createClientComponentClient();

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

  const deleteImageFromStorage = async (imageUrl: string) => {
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
      throw error;
    }
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

  const toggleStyle = (index: number, style: 'italic') => {
    const block = blocks[index];
    if (block.type === 'paragraph') {
      updateBlock(index, {
        styles: {
          ...block.styles,
          [style]: !block.styles?.[style]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = blocks
      .filter(block => block.type === 'paragraph')
      .map(block => block.content)
      .join('\n');

    onSubmit({
      title,
      content,
      image: mainImage,
      blocks,
      author_id: authorId,
    });
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
        />
      </div>

      {authors && (
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger className="bg-background data-[state=open]:bg-background focus:bg-background hover:bg-background">
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
            onUploadComplete={setMainImage}
            defaultImage={mainImage}
            id="main-image"
          />
          {mainImage && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleMainImageDelete}
            >
              <Trash2 className="h-4 w-4" />
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
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock('heading')}
            >
              <Heading className="w-4 h-4 mr-2" />
              Add Heading
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock('image')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={index} className="flex gap-4 items-start bg-muted/30 p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1">
                {block.type === 'heading' && (
                  <div className="space-y-2">
                    <Select
                      value={String(block.level || 2)}
                      onValueChange={(value) => updateBlock(index, { level: Number(value) as 1 | 2 | 3 })}
                    >
                      <SelectTrigger className="bg-background data-[state=open]:bg-background focus:bg-background hover:bg-background">
                        <SelectValue placeholder="Select heading level" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover bg-bg-light dark:bg-bg-dark border-l border-gray-200 dark:border-gray-800">
                        <SelectItem value="1" className="hover:bg-accent">Heading 1</SelectItem>
                        <SelectItem value="2" className="hover:bg-accent">Heading 2</SelectItem>
                        <SelectItem value="3" className="hover:bg-accent">Heading 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="Heading text"
                    />
                  </div>
                )}

                {block.type === 'paragraph' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={block.styles?.italic ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => toggleStyle(index, 'italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="Enter your content here..."
                      className={`min-h-[100px] ${block.styles?.italic ? 'italic' : ''}`}
                    />
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <ImageUpload
                        onUploadComplete={(url) => updateBlock(index, { imageUrl: url })}
                        defaultImage={block.imageUrl}
                        id={`block-image-${index}`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={async () => {
                          if (block.imageUrl) {
                            // If there's an image, delete it from storage first
                            if (confirm('Are you sure you want to delete this image?')) {
                              try {
                                await deleteImageFromStorage(block.imageUrl);
                              } catch (error) {
                                console.error('Failed to delete image:', error);
                                alert('Failed to delete image from storage. The block will still be removed.');
                              }
                            } else {
                              return; // If user cancels deletion, do nothing
                            }
                          }
                          // Always remove the block
                          removeBlock(index);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={block.imageAlt || ''}
                      onChange={(e) => updateBlock(index, { imageAlt: e.target.value })}
                      placeholder="Image description"
                    />
                  </div>
                )}
              </div>

              {/* Only show block delete button for non-image blocks */}
              {block.type !== 'image' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlock(index)}
                >
                  <Trash2 className="w-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
    </form>
  );
} 

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArticleBlock } from '@/types';
import { PlusCircle, Heading, Image as ImageIcon, Type, Trash2 } from 'lucide-react';
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
  }) => void;
  initialData?: {
    title: string;
    content: string;
    image: string;
    blocks?: ArticleBlock[];
  };
  isSubmitting: boolean;
}

export default function ArticleEditor({ onSubmit, initialData, isSubmitting }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [mainImage, setMainImage] = useState(initialData?.image || '');
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    initialData?.blocks || [
      { type: 'paragraph', content: initialData?.content || '' }
    ]
  );

  const addBlock = (type: ArticleBlock['type']) => {
    setBlocks([...blocks, {
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
    }]);
  };

  const updateBlock = (index: number, updates: Partial<ArticleBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
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

      <div className="space-y-2">
        <Label>Main Article Image</Label>
        <ImageUpload
          onUploadComplete={setMainImage}
          defaultImage={mainImage}
        />
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
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                {block.type === 'heading' && (
                  <div className="space-y-2">
                    <Select
                      value={String(block.level || 2)}
                      onValueChange={(value) => updateBlock(index, { level: Number(value) as 1 | 2 | 3 })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select heading level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Heading 1</SelectItem>
                        <SelectItem value="2">Heading 2</SelectItem>
                        <SelectItem value="3">Heading 3</SelectItem>
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
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Enter your content here..."
                    className="min-h-[100px]"
                  />
                )}

                {block.type === 'image' && (
                  <div className="space-y-2">
                    <ImageUpload
                      onUploadComplete={(url) => updateBlock(index, { imageUrl: url })}
                      defaultImage={block.imageUrl}
                    />
                    <Input
                      value={block.imageAlt || ''}
                      onChange={(e) => updateBlock(index, { imageAlt: e.target.value })}
                      placeholder="Image description"
                    />
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBlock(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
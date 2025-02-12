'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageUpload?: (url: string) => void
  currentImage?: string | null
}

export default function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const supabase = createClientComponentClient()
  const [uploading, setUploading] = useState(false)
  const [imagePath, setImagePath] = useState<string | null>(null)

  useEffect(() => {
    async function getImageUrl() {
      try {
        // If we have a currentImage that's a full URL, use it directly
        if (currentImage?.startsWith('http')) {
          setImagePath(currentImage)
          return
        }

        // If we have a currentImage that's a storage path, get its URL
        if (currentImage) {
          const { data } = supabase.storage
            .from('public')
            .getPublicUrl(currentImage)
          
          if (data?.publicUrl) {
            setImagePath(data.publicUrl)
            return
          }
        }

        // Fallback to default image
        const { data } = supabase.storage
          .from('public')
          .getPublicUrl('images/about-hero.jpg')
        
        if (data?.publicUrl) {
          const response = await fetch(data.publicUrl, { method: 'HEAD' })
          if (response.ok) {
            setImagePath(data.publicUrl)
            onImageUpload?.(data.publicUrl)
          } else {
            setImagePath('/images/about-hero.jpg') // Local fallback
          }
        }
      } catch (error) {
        console.error('Error checking image:', error)
        setImagePath('/images/about-hero.jpg') // Local fallback
      }
    }

    getImageUrl()
  }, [currentImage, onImageUpload, supabase])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `images/about-hero.${fileExt}`

      // Upload file to public bucket
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '0'
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        const newUrl = data.publicUrl + '?v=' + new Date().getTime()
        setImagePath(newUrl)
        onImageUpload?.(filePath) // Store the path instead of the full URL
        toast.success('Hero image updated successfully')
      }
    } catch (error) {
      toast.error('Error uploading image')
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Hero Image</h2>
      
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary/10">
        {imagePath ? (
          <Image
            src={imagePath}
            alt="Hero image"
            fill
            className="object-cover"
            priority
            unoptimized // Add this to bypass Next.js image optimization for external URLs
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No image uploaded
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Update Hero Image</Label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button
          onClick={() => document.getElementById('image')?.click()}
          disabled={uploading}
          variant="outline"
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload New Image'}
        </Button>
      </div>
    </Card>
  )
} 
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import ImageUpload from './ImageUpload'

interface TeamHighlight {
  title: string
  description: string
}

interface AboutPageData {
  id: string
  history: string
  mission: string
  values: string
  team_highlights: TeamHighlight[]
}

export default function EditAboutPageClient({ aboutData }: { aboutData: AboutPageData }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AboutPageData>(aboutData)

  const handleHighlightChange = (index: number, field: keyof TeamHighlight, value: string) => {
    const newHighlights = [...formData.team_highlights]
    newHighlights[index] = { ...newHighlights[index], [field]: value }
    setFormData({ ...formData, team_highlights: newHighlights })
  }

  const addHighlight = () => {
    setFormData({
      ...formData,
      team_highlights: [...formData.team_highlights, { title: '', description: '' }]
    })
  }

  const removeHighlight = (index: number) => {
    const newHighlights = formData.team_highlights.filter((_, i) => i !== index)
    setFormData({ ...formData, team_highlights: newHighlights })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('about_page')
        .update({
          history: formData.history,
          mission: formData.mission,
          values: formData.values,
          team_highlights: formData.team_highlights
        })
        .eq('id', formData.id)

      if (error) throw error

      toast.success('About page updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating about page:', error)
      toast.error('Failed to update about page')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Edit About Page</h1>

      {/* Hero Image Upload */}
      <ImageUpload />
      
      {/* Content Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* History Section */}
          <div className="space-y-2">
            <Label htmlFor="history">History</Label>
            <Textarea
              id="history"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Mission Section */}
          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Values Section */}
          <div className="space-y-2">
            <Label htmlFor="values">Values (comma-separated)</Label>
            <Input
              id="values"
              value={formData.values}
              onChange={(e) => setFormData({ ...formData, values: e.target.value })}
              required
            />
          </div>

          {/* Team Highlights Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Team Highlights</Label>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addHighlight}
              >
                Add Highlight
              </Button>
            </div>
            
            {formData.team_highlights.map((highlight, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Highlight {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`highlight-title-${index}`}>Title</Label>
                  <Input
                    id={`highlight-title-${index}`}
                    value={highlight.title}
                    onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`highlight-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`highlight-desc-${index}`}
                    value={highlight.description}
                    onChange={(e) => handleHighlightChange(index, 'description', e.target.value)}
                    required
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Exercise, ExerciseCategory, DifficultyLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface ExerciseFormProps {
  initialData?: Exercise;
}

export default function ExerciseForm({ initialData }: ExerciseFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'weightlifting',
    difficulty: initialData?.difficulty || 'beginner',
    equipment: initialData?.equipment || [],
    muscles_targeted: initialData?.muscles_targeted || [],
    video_url: initialData?.video_url || '',
    image_url: initialData?.image_url || '',
  });

  const [newEquipment, setNewEquipment] = useState('');
  const [newMuscle, setNewMuscle] = useState('');

  const categories: ExerciseCategory[] = [
    'weightlifting',
    'sprint',
    'cardio',
    'strength',
    'agility',
    'flexibility',
    'recovery'
  ];

  const difficulties: DifficultyLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'elite'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialData) {
        // Update existing exercise
        const { error } = await supabase
          .from('exercises')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // Create new exercise
        const { error } = await supabase
          .from('exercises')
          .insert([formData]);

        if (error) throw error;
      }

      router.push('/admin/training');
      router.refresh();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Error saving exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEquipment = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== item)
    }));
  };

  const addMuscle = () => {
    if (newMuscle && !formData.muscles_targeted.includes(newMuscle)) {
      setFormData(prev => ({
        ...prev,
        muscles_targeted: [...prev.muscles_targeted, newMuscle]
      }));
      setNewMuscle('');
    }
  };

  const removeMuscle = (muscle: string) => {
    setFormData(prev => ({
      ...prev,
      muscles_targeted: prev.muscles_targeted.filter(m => m !== muscle)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Exercise Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="h-32"
          />
        </div>
      </div>

      {/* Category and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: ExerciseCategory) => 
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value: DifficultyLevel) => 
              setFormData({ ...formData, difficulty: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equipment */}
      <div className="space-y-4">
        <Label>Required Equipment</Label>
        <div className="flex gap-2">
          <Input
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            placeholder="Add equipment..."
            className="flex-1"
          />
          <Button type="button" onClick={addEquipment}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.equipment.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => removeEquipment(item)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Muscles Targeted */}
      <div className="space-y-4">
        <Label>Muscles Targeted</Label>
        <div className="flex gap-2">
          <Input
            value={newMuscle}
            onChange={(e) => setNewMuscle(e.target.value)}
            placeholder="Add muscle group..."
            className="flex-1"
          />
          <Button type="button" onClick={addMuscle}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.muscles_targeted.map((muscle) => (
            <Badge key={muscle} variant="secondary" className="flex items-center gap-1">
              {muscle}
              <button
                type="button"
                onClick={() => removeMuscle(muscle)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="video_url">Video Tutorial URL (optional)</Label>
          <Input
            id="video_url"
            type="url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Exercise Image (optional)</Label>
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
            defaultImage={formData.image_url}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Exercise' : 'Create Exercise'}
        </Button>
      </div>
    </form>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Exercise, TrainingProgram, DifficultyLevel } from '@/types';
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
import { Plus, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProgramFormProps {
  initialData?: TrainingProgram;
  exercises: Exercise[];
}

interface WorkoutExerciseForm {
  exercise_id: string;
  sets: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
  order_index: number;
}

interface WorkoutForm {
  title: string;
  description?: string;
  week_number: number;
  day_number: number;
  duration_minutes: number;
  exercises: WorkoutExerciseForm[];
}

export default function ProgramForm({ initialData, exercises }: ProgramFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    difficulty: initialData?.difficulty || 'beginner',
    duration_weeks: initialData?.duration_weeks || 4,
    target_audience: initialData?.target_audience || '',
    image_url: initialData?.image_url || '',
  });

  const [workouts, setWorkouts] = useState<WorkoutForm[]>(
    initialData?.workouts || []
  );

  const difficulties: DifficultyLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'elite'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Authentication error: ' + sessionError.message);
      if (!session) throw new Error('No active session');

      // First, create or update the training program
      let programId: string;
      
      if (initialData) {
        // Update existing program
        const { data: program, error: updateError } = await supabase
          .from('training_programs')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)
          .select()
          .single();

        if (updateError) throw new Error('Error updating program: ' + updateError.message);
        programId = initialData.id;
      } else {
        // Create new program
        const { data: program, error: insertError } = await supabase
          .from('training_programs')
          .insert([{
            ...formData,
            author_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (insertError) throw new Error('Error creating program: ' + insertError.message);
        if (!program) throw new Error('No program data returned');
        programId = program.id;
      }

      // Then, handle workouts
      for (const workout of workouts) {
        // Create workout
        const { data: workoutData, error: workoutError } = await supabase
          .from('program_workouts')
          .insert([{
            program_id: programId,
            title: workout.title,
            description: workout.description,
            week_number: workout.week_number,
            day_number: workout.day_number,
            duration_minutes: workout.duration_minutes,
          }])
          .select()
          .single();

        if (workoutError) throw new Error('Error creating workout: ' + workoutError.message);
        if (!workoutData) throw new Error('No workout data returned');

        // Create workout exercises
        if (workout.exercises.length > 0) {
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(
              workout.exercises.map(exercise => ({
                workout_id: workoutData.id,
                ...exercise,
                created_at: new Date().toISOString(),
              }))
            );

          if (exercisesError) throw new Error('Error creating workout exercises: ' + exercisesError.message);
        }
      }

      router.push('/admin/training');
      router.refresh();
    } catch (error) {
      console.error('Error saving program:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWorkout = () => {
    setWorkouts(prev => [...prev, {
      title: '',
      description: '',
      week_number: prev.length > 0 ? prev[prev.length - 1].week_number : 1,
      day_number: prev.length > 0 ? prev[prev.length - 1].day_number + 1 : 1,
      duration_minutes: 60,
      exercises: []
    }]);
  };

  const updateWorkout = (index: number, field: keyof WorkoutForm, value: any) => {
    const newWorkouts = [...workouts];
    newWorkouts[index] = {
      ...newWorkouts[index],
      [field]: value
    };
    setWorkouts(newWorkouts);
  };

  const removeWorkout = (index: number) => {
    setWorkouts(prev => prev.filter((_, i) => i !== index));
  };

  const addExerciseToWorkout = (workoutIndex: number) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].exercises.push({
      exercise_id: '',
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      order_index: newWorkouts[workoutIndex].exercises.length
    });
    setWorkouts(newWorkouts);
  };

  const updateWorkoutExercise = (
    workoutIndex: number,
    exerciseIndex: number,
    field: keyof WorkoutExerciseForm,
    value: any
  ) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].exercises[exerciseIndex] = {
      ...newWorkouts[workoutIndex].exercises[exerciseIndex],
      [field]: value
    };
    setWorkouts(newWorkouts);
  };

  const removeExerciseFromWorkout = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].exercises = newWorkouts[workoutIndex].exercises
      .filter((_, i) => i !== exerciseIndex)
      .map((exercise, i) => ({ ...exercise, order_index: i }));
    setWorkouts(newWorkouts);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Program Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

      {/* Program Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <Label htmlFor="duration_weeks">Duration (weeks)</Label>
          <Input
            id="duration_weeks"
            type="number"
            min="1"
            value={formData.duration_weeks}
            onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="target_audience">Target Audience</Label>
          <Input
            id="target_audience"
            value={formData.target_audience}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Program Image (optional)</Label>
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
            defaultImage={formData.image_url}
          />
        </div>
      </div>

      {/* Workouts */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label>Workouts</Label>
          <Button type="button" onClick={addWorkout}>
            <Plus className="w-4 h-4 mr-2" />
            Add Workout
          </Button>
        </div>

        <div className="space-y-6">
          {workouts.map((workout, workoutIndex) => (
            <Card key={workoutIndex} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <Label>Workout Title</Label>
                    <Input
                      value={workout.title}
                      onChange={(e) => updateWorkout(workoutIndex, 'title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Week</Label>
                      <Input
                        type="number"
                        min="1"
                        value={workout.week_number}
                        onChange={(e) => updateWorkout(workoutIndex, 'week_number', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Day</Label>
                      <Input
                        type="number"
                        min="1"
                        value={workout.day_number}
                        onChange={(e) => updateWorkout(workoutIndex, 'day_number', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={workout.duration_minutes}
                        onChange={(e) => updateWorkout(workoutIndex, 'duration_minutes', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={workout.description}
                      onChange={(e) => updateWorkout(workoutIndex, 'description', e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => removeWorkout(workoutIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Exercises</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addExerciseToWorkout(workoutIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exerciseIndex}
                      className="grid grid-cols-12 gap-4 items-start"
                    >
                      <div className="col-span-3">
                        <Label>Exercise</Label>
                        <Select
                          value={exercise.exercise_id}
                          onValueChange={(value) => 
                            updateWorkoutExercise(workoutIndex, exerciseIndex, 'exercise_id', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((ex) => (
                              <SelectItem key={ex.id} value={ex.id}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => 
                            updateWorkoutExercise(workoutIndex, exerciseIndex, 'sets', parseInt(e.target.value))
                          }
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Reps</Label>
                        <Input
                          type="number"
                          min="0"
                          value={exercise.reps || ''}
                          onChange={(e) => 
                            updateWorkoutExercise(workoutIndex, exerciseIndex, 'reps', parseInt(e.target.value))
                          }
                          placeholder="Optional"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Duration (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={exercise.duration_seconds || ''}
                          onChange={(e) => 
                            updateWorkoutExercise(workoutIndex, exerciseIndex, 'duration_seconds', parseInt(e.target.value))
                          }
                          placeholder="Optional"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Rest (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={exercise.rest_seconds}
                          onChange={(e) => 
                            updateWorkoutExercise(workoutIndex, exerciseIndex, 'rest_seconds', parseInt(e.target.value))
                          }
                          required
                        />
                      </div>

                      <div className="col-span-1 pt-8">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExerciseFromWorkout(workoutIndex, exerciseIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Program' : 'Create Program'}
        </Button>
      </div>
    </form>
  );
} 
'use client';

import { TrainingProgram } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, Users, Dumbbell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

interface ProgramListProps {
  programs: TrainingProgram[];
}

export default function ProgramList({ programs }: ProgramListProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleDelete = async (id: string) => {
    try {
      // First delete all related workout exercises and workouts
      const { data: workouts } = await supabase
        .from('program_workouts')
        .select('id')
        .eq('program_id', id);

      if (workouts) {
        for (const workout of workouts) {
          // Delete workout exercises
          await supabase
            .from('workout_exercises')
            .delete()
            .eq('workout_id', workout.id);
        }

        // Delete workouts
        await supabase
          .from('program_workouts')
          .delete()
          .eq('program_id', id);
      }

      // Finally delete the program
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Error deleting program. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => (
        <Card key={program.id} className="overflow-hidden">
          {/* Program Image */}
          <div className="relative h-48 w-full">
            <Image
              src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
              alt={program.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge 
              className="absolute top-4 right-4 capitalize"
              variant={
                program.difficulty === 'beginner' ? 'default' :
                program.difficulty === 'intermediate' ? 'secondary' :
                program.difficulty === 'advanced' ? 'destructive' :
                'outline'
              }
            >
              {program.difficulty}
            </Badge>
          </div>

          {/* Program Info */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {program.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {program.description}
            </p>

            {/* Program Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{program.duration_weeks} weeks</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{program.target_audience}</span>
              </div>
            </div>

            {/* Author Info */}
            {program.author?.email && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Created by: {program.author.email}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Link href={`/admin/training/programs/${program.id}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Training Program</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{program.title}"? This will also delete all associated workouts and exercises. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(program.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
      {programs.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No training programs found. Create your first program to get started.
        </div>
      )}
    </div>
  );
} 
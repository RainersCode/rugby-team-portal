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
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Target Audience</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium">{program.title}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    program.difficulty === "beginner"
                      ? "default"
                      : program.difficulty === "intermediate"
                      ? "secondary"
                      : program.difficulty === "advanced"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {program.difficulty}
                </Badge>
              </TableCell>
              <TableCell>{program.duration_weeks} weeks</TableCell>
              <TableCell>{program.target_audience}</TableCell>
              <TableCell>{program.author?.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/training/programs/${program.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Training Program</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this training program? This will also delete all associated workouts and exercises. This action cannot be undone.
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
              </TableCell>
            </TableRow>
          ))}
          {programs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No training programs found. Create your first program to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 
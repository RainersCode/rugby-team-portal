"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface SevensTeam {
  id: number;
  team_name: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  total_points: number;
}

export default function AdminSevensClient() {
  const [teams, setTeams] = useState<SevensTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<SevensTeam | null>(null);
  const [formData, setFormData] = useState({
    team_name: "",
    position: "",
    played: "",
    won: "",
    drawn: "",
    lost: "",
    total_points: "",
  });

  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchTeams();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error checking admin status:", profileError);
        throw profileError;
      }

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }
    } catch (error) {
      console.error("Error in checkAdmin:", error);
      toast({
        title: "Error",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      router.push("/");
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("current_sevens_standings")
        .select("*")
        .order("position");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched teams:", data);
      setTeams(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching teams:", {
        message: err.message,
        error: err,
      });
      toast({
        title: "Error",
        description: `Failed to load sevens standings: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const teamData = {
        team_name: formData.team_name.trim(),
        position: Number(formData.position),
        played: Number(formData.played),
        won: Number(formData.won),
        drawn: Number(formData.drawn),
        lost: Number(formData.lost),
        total_points: Number(formData.total_points),
      };

      console.log("Attempting to save team data:", teamData);

      // Check if session exists before proceeding
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      if (editingTeam) {
        const { data, error } = await supabase
          .from("current_sevens_standings")
          .update(teamData)
          .eq("id", editingTeam.id)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        console.log("Updated team data:", data);
      } else {
        const { data, error } = await supabase
          .from("current_sevens_standings")
          .insert([teamData])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        console.log("Inserted team data:", data);
      }

      toast({
        title: "Success",
        description: `Team ${editingTeam ? "updated" : "added"} successfully`,
      });

      // Reset form and refresh data
      resetForm();
      await fetchTeams();
    } catch (error) {
      const err = error as Error;
      console.error("Error saving team:", {
        message: err.message,
        error: err,
      });
      toast({
        title: "Error",
        description: `Failed to ${editingTeam ? "update" : "add"} team: ${
          err.message
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (team: SevensTeam) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name,
      position: team.position.toString(),
      played: team.played.toString(),
      won: team.won.toString(),
      drawn: team.drawn.toString(),
      lost: team.lost.toString(),
      total_points: team.total_points.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("current_sevens_standings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      fetchTeams();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      team_name: "",
      position: "",
      played: "",
      won: "",
      drawn: "",
      lost: "",
      total_points: "",
    });
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-rugby-teal hover:bg-rugby-teal/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-rugby-teal/5 hover:bg-rugby-teal/5">
            <TableHead className="text-rugby-teal font-semibold">
              Position
            </TableHead>
            <TableHead className="text-rugby-teal font-semibold">
              Team
            </TableHead>
            <TableHead className="text-center text-rugby-teal font-semibold">
              P
            </TableHead>
            <TableHead className="text-center text-rugby-teal font-semibold">
              W
            </TableHead>
            <TableHead className="text-center text-rugby-teal font-semibold">
              D
            </TableHead>
            <TableHead className="text-center text-rugby-teal font-semibold">
              L
            </TableHead>
            <TableHead className="text-center text-rugby-teal font-semibold">
              PTS
            </TableHead>
            <TableHead className="text-right text-rugby-teal font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow
              key={team.id}
              className={`
                ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-rugby-teal/5 dark:bg-gray-800/50"
                } 
                hover:bg-rugby-teal/10 dark:hover:bg-rugby-teal/10 transition-colors
                border-b border-rugby-teal/10
              `}
            >
              <TableCell className="font-medium">{team.position}</TableCell>
              <TableCell className="font-medium">{team.team_name}</TableCell>
              <TableCell className="text-center">{team.played}</TableCell>
              <TableCell className="text-center">{team.won}</TableCell>
              <TableCell className="text-center">{team.drawn}</TableCell>
              <TableCell className="text-center">{team.lost}</TableCell>
              <TableCell className="text-center font-semibold text-rugby-teal">
                {team.total_points}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(team)}
                  className="mr-2 hover:bg-rugby-teal/10 hover:text-rugby-teal"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(team.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-xl border-rugby-teal/20">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? "Edit Team" : "Add New Team"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="team_name">Team Name</Label>
              <Input
                id="team_name"
                name="team_name"
                value={formData.team_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                type="number"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="played">Played</Label>
                <Input
                  id="played"
                  name="played"
                  type="number"
                  value={formData.played}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="won">Won</Label>
                <Input
                  id="won"
                  name="won"
                  type="number"
                  value={formData.won}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="drawn">Drawn</Label>
                <Input
                  id="drawn"
                  name="drawn"
                  type="number"
                  value={formData.drawn}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lost">Lost</Label>
                <Input
                  id="lost"
                  name="lost"
                  type="number"
                  value={formData.lost}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="total_points">Total Points</Label>
              <Input
                id="total_points"
                name="total_points"
                type="number"
                value={formData.total_points}
                onChange={handleInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rugby-teal hover:bg-rugby-teal/90"
                disabled={loading}
              >
                {loading ? "Saving..." : editingTeam ? "Update" : "Add"} Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

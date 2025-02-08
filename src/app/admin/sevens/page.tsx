"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

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

export default function AdminSevensPage() {
  const [teams, setTeams] = useState<SevensTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<SevensTeam | null>(null);
  const [formData, setFormData] = useState({
    team_name: "",
    position: "",
    played: "",
    won: "",
    drawn: "",
    lost: "",
    total_points: "",
  });

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdmin();
    fetchTeams();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/");
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("current_sevens_standings")
        .select("*")
        .order("position");

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
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

      if (isEditing && selectedTeam) {
        const { error } = await supabase
          .from("current_sevens_standings")
          .update(teamData)
          .eq("id", selectedTeam.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("current_sevens_standings")
          .insert([teamData]);

        if (error) throw error;
      }

      // Reset form and refresh data
      resetForm();
      fetchTeams();
    } catch (error) {
      console.error("Error saving team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: SevensTeam) => {
    setSelectedTeam(team);
    setFormData({
      team_name: team.team_name,
      position: team.position.toString(),
      played: team.played.toString(),
      won: team.won.toString(),
      drawn: team.drawn.toString(),
      lost: team.lost.toString(),
      total_points: team.total_points.toString(),
    });
    setIsEditing(true);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("current_sevens_standings")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchTeams();
      } catch (error) {
        console.error("Error deleting team:", error);
      } finally {
        setLoading(false);
      }
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
    setSelectedTeam(null);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rugby-teal" />
      </div>
    );
  }

  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Manage Sevens Standings
        </h1>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false);
                resetForm();
              }}
              className="bg-rugby-teal hover:bg-rugby-teal/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Team" : "Add New Team"}
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
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddingNew(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-rugby-teal hover:bg-rugby-teal/90"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? "Update" : "Add"} Team
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  P
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  W
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  D
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  L
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PTS
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card-bg-dark divide-y divide-gray-200 dark:divide-gray-700">
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {team.position}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {team.team_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {team.played}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {team.won}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {team.drawn}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {team.lost}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                    {team.total_points}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(team)}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(team.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

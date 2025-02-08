import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CupMatch {
  id: number;
  team1: string;
  team2: string;
  score1: number | null;
  score2: number | null;
  match_date: string;
  round: "final" | "semi" | "quarter";
}

export default function AdminCupClient() {
  const [matches, setMatches] = useState<CupMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<CupMatch | null>(null);
  const [formData, setFormData] = useState<Partial<CupMatch>>({
    team1: "",
    team2: "",
    score1: null,
    score2: null,
    match_date: "",
    round: "quarter",
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("cup_matches")
        .select("*")
        .order("round", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMatch) {
        const { error } = await supabase
          .from("cup_matches")
          .update({
            team1: formData.team1,
            team2: formData.team2,
            score1: formData.score1,
            score2: formData.score2,
            match_date: formData.match_date,
            round: formData.round,
          })
          .eq("id", editingMatch.id);

        if (error) throw error;
        toast.success("Match updated successfully");
      } else {
        const { error } = await supabase.from("cup_matches").insert([formData]);
        if (error) throw error;
        toast.success("Match added successfully");
      }

      setIsDialogOpen(false);
      fetchMatches();
    } catch (error) {
      console.error("Error saving match:", error);
      toast.error("Failed to save match");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      const { error } = await supabase
        .from("cup_matches")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Match deleted successfully");
      fetchMatches();
    } catch (error) {
      console.error("Error deleting match:", error);
      toast.error("Failed to delete match");
    }
  };

  const openEditDialog = (match: CupMatch) => {
    setEditingMatch(match);
    setFormData({
      team1: match.team1,
      team2: match.team2,
      score1: match.score1,
      score2: match.score2,
      match_date: match.match_date?.split("T")[0] || "",
      round: match.round,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMatch(null);
    setFormData({
      team1: "",
      team2: "",
      score1: null,
      score2: null,
      match_date: "",
      round: "quarter",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cup Matches</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingMatch(null);
              setFormData({
                team1: "",
                team2: "",
                score1: null,
                score2: null,
                match_date: "",
                round: "quarter",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-rugby-teal hover:bg-rugby-teal/90">
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-xl border-rugby-teal/20">
            <DialogHeader>
              <DialogTitle>
                {editingMatch ? "Edit Match" : "Add New Match"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team1">Team 1</Label>
                  <Input
                    id="team1"
                    value={formData.team1 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, team1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team2">Team 2</Label>
                  <Input
                    id="team2"
                    value={formData.team2 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, team2: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score1">Score 1</Label>
                  <Input
                    id="score1"
                    type="number"
                    value={formData.score1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        score1: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score2">Score 2</Label>
                  <Input
                    id="score2"
                    type="number"
                    value={formData.score2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        score2: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="match_date">Match Date</Label>
                <Input
                  id="match_date"
                  type="date"
                  value={formData.match_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, match_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Select
                  value={formData.round}
                  onValueChange={(value: "final" | "semi" | "quarter") =>
                    setFormData({ ...formData, round: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter Final</SelectItem>
                    <SelectItem value="semi">Semi Final</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingMatch ? "Update" : "Add"} Match
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Round</th>
                <th className="text-left py-2">Team 1</th>
                <th className="text-left py-2">Team 2</th>
                <th className="text-left py-2">Score</th>
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b">
                  <td className="py-2">
                    {match.round === "final"
                      ? "Final"
                      : match.round === "semi"
                      ? "Semi Final"
                      : "Quarter Final"}
                  </td>
                  <td className="py-2">{match.team1}</td>
                  <td className="py-2">{match.team2}</td>
                  <td className="py-2">
                    {match.score1 !== null && match.score2 !== null
                      ? `${match.score1} - ${match.score2}`
                      : "TBD"}
                  </td>
                  <td className="py-2">
                    {match.match_date
                      ? new Date(match.match_date).toLocaleDateString()
                      : "TBD"}
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(match)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(match.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
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

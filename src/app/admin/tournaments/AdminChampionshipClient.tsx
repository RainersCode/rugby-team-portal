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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TeamType = {
  id: number;
  name: string;
  status: "active" | "inactive";
};

type StandingType = {
  id: number;
  team_id: number;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points_for: number;
  try_bonus_points: number;
  losing_bonus_points: number;
  total_points: number;
  team_name?: string;
};

type SeasonType = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export default function AdminChampionshipClient({
  activeTab = "standings",
}: {
  activeTab?: "standings" | "teams" | "seasons";
}) {
  const [standings, setStandings] = useState<StandingType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [seasons, setSeasons] = useState<SeasonType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [currentSeason, setCurrentSeason] = useState<SeasonType | null>(null);

  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Load current season first
  useEffect(() => {
    async function getCurrentSeason() {
      try {
        const { data: seasonData, error: seasonError } = await supabase
          .from("championship_seasons")
          .select("*")
          .eq("is_current", true)
          .single();

        if (seasonError) throw seasonError;
        setCurrentSeason(seasonData);
        return seasonData;
      } catch (error: any) {
        console.error("Error loading current season:", error);
        toast({
          title: "Error",
          description: "Failed to load current season",
          variant: "destructive",
        });
        return null;
      }
    }
    getCurrentSeason();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    async function loadTabData() {
      setIsLoading(true);
      try {
        if (activeTab === "standings" && currentSeason) {
          // Load teams first
          const { data: teamsData, error: teamsError } = await supabase
            .from("championship_teams")
            .select("*")
            .eq("season_id", currentSeason.id)
            .eq("status", "active");

          if (teamsError) throw teamsError;
          setTeams(teamsData || []);

          // Then load standings with team names
          const { data: standingsData, error: standingsError } = await supabase
            .from("championship_standings")
            .select(
              `
              *,
              team:championship_teams(name)
            `
            )
            .eq("season_id", currentSeason.id)
            .order("position");

          if (standingsError) throw standingsError;

          const transformedStandings =
            standingsData?.map((standing) => ({
              ...standing,
              team_name: standing.team?.name,
            })) || [];

          setStandings(transformedStandings);
        } else if (activeTab === "teams") {
          const { data, error } = await supabase
            .from("championship_teams")
            .select("*")
            .order("name");
          if (error) throw error;
          setTeams(data || []);
        } else if (activeTab === "seasons") {
          const { data, error } = await supabase
            .from("championship_seasons")
            .select("*")
            .order("start_date", { ascending: false });
          if (error) throw error;
          setSeasons(data || []);
        }
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadTabData();
  }, [activeTab, currentSeason]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      let table = "";
      if (activeTab === "standings") {
        table = "championship_standings";
        // Make sure standings are associated with current season
        if (!editingItem && currentSeason) {
          formData.season_id = currentSeason.id;
        }
        console.log("Submitting standing with data:", formData);
      } else if (activeTab === "teams") {
        table = "championship_teams";
        // Make sure teams are associated with current season
        if (!editingItem && currentSeason) {
          formData.season_id = currentSeason.id;
          formData.status = formData.status || "active";
        }
        console.log("Submitting team with data:", formData);
      } else if (activeTab === "seasons") table = "championship_seasons";

      if (editingItem) {
        const { data, error } = await supabase
          .from(table)
          .update(formData)
          .eq("id", editingItem.id);
        if (error) throw error;
        console.log("Updated data:", data);
      } else {
        const { data, error } = await supabase.from(table).insert(formData);
        if (error) throw error;
        console.log("Inserted data:", data);
      }

      toast({
        title: "Success",
        description: `${activeTab} ${
          editingItem ? "updated" : "created"
        } successfully`,
      });
      setIsDialogOpen(false);

      // Reload data based on active tab
      if (activeTab === "standings" && currentSeason) {
        const { data: standingsData } = await supabase
          .from("championship_standings")
          .select(`*, team:championship_teams(name)`)
          .eq("season_id", currentSeason.id)
          .order("position");

        const transformedStandings =
          standingsData?.map((standing) => ({
            ...standing,
            team_name: standing.team?.name,
          })) || [];

        setStandings(transformedStandings);
      } else if (activeTab === "teams") {
        const { data: teamsData } = await supabase
          .from("championship_teams")
          .select("*")
          .order("name");
        setTeams(teamsData || []);
      } else if (activeTab === "seasons") {
        const { data: seasonsData } = await supabase
          .from("championship_seasons")
          .select("*")
          .order("start_date", { ascending: false });
        setSeasons(seasonsData || []);

        // If we're updating seasons, check if we need to update current season
        if (formData.is_current) {
          const { data: currentSeasonData } = await supabase
            .from("championship_seasons")
            .select("*")
            .eq("is_current", true)
            .single();
          setCurrentSeason(currentSeasonData);
        }
      }
    } catch (error: any) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setIsLoading(true);
    try {
      let table = "";
      if (activeTab === "standings") table = "championship_standings";
      else if (activeTab === "teams") table = "championship_teams";
      else if (activeTab === "seasons") table = "championship_seasons";

      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${activeTab} deleted successfully`,
      });

      // Reload data
      if (activeTab === "standings" && currentSeason) {
        const { data } = await supabase
          .from("championship_standings")
          .select(`*, team:championship_teams(name)`)
          .eq("season_id", currentSeason.id)
          .order("position");

        const transformedStandings =
          data?.map((standing) => ({
            ...standing,
            team_name: standing.team?.name,
          })) || [];

        setStandings(transformedStandings);
      } else if (activeTab === "teams") {
        const { data } = await supabase
          .from("championship_teams")
          .select("*")
          .order("name");
        setTeams(data || []);
      } else if (activeTab === "seasons") {
        const { data } = await supabase
          .from("championship_seasons")
          .select("*")
          .order("start_date", { ascending: false });
        setSeasons(data || []);
      }
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function renderStandingsTable() {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({});
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Standing
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>P</TableHead>
              <TableHead>W</TableHead>
              <TableHead>D</TableHead>
              <TableHead>L</TableHead>
              <TableHead>PF</TableHead>
              <TableHead>TBP</TableHead>
              <TableHead>LBP</TableHead>
              <TableHead>PTS</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing) => (
              <TableRow key={standing.id}>
                <TableCell>{standing.position}</TableCell>
                <TableCell>{standing.team_name}</TableCell>
                <TableCell>{standing.played}</TableCell>
                <TableCell>{standing.won}</TableCell>
                <TableCell>{standing.drawn}</TableCell>
                <TableCell>{standing.lost}</TableCell>
                <TableCell>{standing.points_for}</TableCell>
                <TableCell>{standing.try_bonus_points}</TableCell>
                <TableCell>{standing.losing_bonus_points}</TableCell>
                <TableCell>{standing.total_points}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(standing);
                      setFormData(standing);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(standing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderTeamsTable() {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({});
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Team
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.status}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(team);
                      setFormData(team);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderSeasonsTable() {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setEditingItem(null);
              setFormData({});
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Season
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.map((season) => (
              <TableRow key={season.id}>
                <TableCell>{season.name}</TableCell>
                <TableCell>
                  {new Date(season.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(season.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{season.is_current ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(season);
                      setFormData(season);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(season.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderForm() {
    if (activeTab === "standings") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team_id">Team</Label>
            <Select
              value={formData.team_id?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, team_id: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              type="number"
              value={formData.position || ""}
              onChange={(e) =>
                setFormData({ ...formData, position: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="played">Played</Label>
              <Input
                type="number"
                value={formData.played || ""}
                onChange={(e) =>
                  setFormData({ ...formData, played: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="won">Won</Label>
              <Input
                type="number"
                value={formData.won || ""}
                onChange={(e) =>
                  setFormData({ ...formData, won: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="drawn">Drawn</Label>
              <Input
                type="number"
                value={formData.drawn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, drawn: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="lost">Lost</Label>
              <Input
                type="number"
                value={formData.lost || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lost: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="points_for">Points For</Label>
              <Input
                type="number"
                value={formData.points_for || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_for: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="try_bonus_points">Try Bonus Points</Label>
              <Input
                type="number"
                value={formData.try_bonus_points || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    try_bonus_points: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="losing_bonus_points">Losing Bonus Points</Label>
              <Input
                type="number"
                value={formData.losing_bonus_points || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    losing_bonus_points: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="total_points">Total Points</Label>
            <Input
              type="number"
              value={formData.total_points || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_points: parseInt(e.target.value),
                })
              }
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    }

    if (activeTab === "teams") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    }

    if (activeTab === "seasons") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Season Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              type="date"
              value={formData.start_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              type="date"
              value={formData.end_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="is_current">Current Season</Label>
            <Select
              value={formData.is_current?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, is_current: value === "true" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    }
  }

  return (
    <div>
      {activeTab === "standings" && renderStandingsTable()}
      {activeTab === "teams" && renderTeamsTable()}
      {activeTab === "seasons" && renderSeasonsTable()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-xl border-rugby-teal/20">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${activeTab}` : `Add ${activeTab}`}
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTournamentData, TeamType, StandingType, SeasonType } from "@/hooks/useTournamentData";
import { format } from "date-fns";

export default function AdminSevensClient({
  activeTab = "standings",
}: {
  activeTab?: "standings" | "teams" | "seasons";
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const tournament = useTournamentData('sevens', activeTab);
  
  const { 
    currentSeason,
    teams,
    standings,
    seasons,
    isLoading,
    error,
    refreshData,
    createItem,
    updateItem,
    deleteItem,
    setAsCurrentSeason
  } = tournament;

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        const itemType = activeTab === 'standings' 
          ? 'standing' 
          : activeTab === 'teams' 
            ? 'team' 
            : 'season';
        
        await updateItem(itemType, formData);
      } else {
        // Create new item
        const itemType = activeTab === 'standings' 
          ? 'standing' 
          : activeTab === 'teams' 
            ? 'team' 
            : 'season';
        
        await createItem(itemType, formData);
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(id);
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    
    try {
      const itemType = activeTab === 'standings' 
        ? 'standing' 
        : activeTab === 'teams' 
          ? 'team' 
          : 'season';
      
      await deleteItem(itemType, confirmDelete);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  function handleEdit(item: any) {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  }

  function handleNew() {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  }

  function handleSetCurrentSeason(id: string) {
    setAsCurrentSeason(id);
  }

  function renderStandingsTable() {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold mr-2">
              {currentSeason?.name || "Current Season"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Button
            onClick={handleNew}
            className="bg-rugby-teal hover:bg-rugby-teal/90"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Standing
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading standings...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-red-500">
                  Error loading standings. Please refresh.
                </TableCell>
              </TableRow>
            ) : standings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No standings found. Add your first standing.
                </TableCell>
              </TableRow>
            ) : (
              standings.map((standing) => (
                <TableRow key={standing.id}>
                  <TableCell>{standing.position}</TableCell>
                  <TableCell>
                    {teams.find((t) => t.id === standing.team_id)?.name || "Unknown Team"}
                  </TableCell>
                  <TableCell className="text-center">{standing.played}</TableCell>
                  <TableCell className="text-center">{standing.won}</TableCell>
                  <TableCell className="text-center">{standing.drawn}</TableCell>
                  <TableCell className="text-center">{standing.lost}</TableCell>
                  <TableCell className="text-center">{standing.total_points}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(standing)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(standing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderTeamsTable() {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold mr-2">
              {currentSeason?.name || "Current Season"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Button
            onClick={handleNew}
            className="bg-rugby-teal hover:bg-rugby-teal/90"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Team
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-rugby-teal/5 hover:bg-rugby-teal/5">
              <TableHead className="text-rugby-teal font-semibold">
                Team Name
              </TableHead>
              <TableHead className="text-rugby-teal font-semibold">
                Status
              </TableHead>
              <TableHead className="text-right text-rugby-teal font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading teams...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-red-500">
                  Error loading teams. Please refresh.
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No teams found. Add your first team.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        team.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {team.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderSeasonsTable() {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleNew}
            className="bg-rugby-teal hover:bg-rugby-teal/90"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Season
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-rugby-teal/5 hover:bg-rugby-teal/5">
              <TableHead className="text-rugby-teal font-semibold">
                Season Name
              </TableHead>
              <TableHead className="text-rugby-teal font-semibold">
                Start Date
              </TableHead>
              <TableHead className="text-rugby-teal font-semibold">
                End Date
              </TableHead>
              <TableHead className="text-rugby-teal font-semibold">
                Status
              </TableHead>
              <TableHead className="text-right text-rugby-teal font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading seasons...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-red-500">
                  Error loading seasons. Please refresh.
                </TableCell>
              </TableRow>
            ) : seasons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No seasons found. Add your first season.
                </TableCell>
              </TableRow>
            ) : (
              seasons.map((season) => (
                <TableRow key={season.id}>
                  <TableCell>{season.name}</TableCell>
                  <TableCell>
                    {format(new Date(season.start_date), "PP")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(season.end_date), "PP")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        season.is_current
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {season.is_current ? "Current" : "Past"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetCurrentSeason(season.id)}
                        disabled={season.is_current}
                      >
                        Set Current
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(season)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(season.id)}
                        disabled={season.is_current}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
                setFormData({ ...formData, team_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-3 gap-4">
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
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    } else if (activeTab === "teams") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "active"}
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
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    } else if (activeTab === "seasons") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Season Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date ? formData.start_date.substring(0, 10) : ""}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={formData.end_date ? formData.end_date.substring(0, 10) : ""}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current || false}
              onChange={(e) =>
                setFormData({ ...formData, is_current: e.target.checked })
              }
            />
            <Label htmlFor="is_current">Set as current season</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      );
    }
    return null;
  }

  return (
    <>
      {activeTab === "standings" && renderStandingsTable()}
      {activeTab === "teams" && renderTeamsTable()}
      {activeTab === "seasons" && renderSeasonsTable()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Edit ${activeTab === "standings" ? "Standing" : activeTab === "teams" ? "Team" : "Season"}`
                : `Add ${activeTab === "standings" ? "Standing" : activeTab === "teams" ? "Team" : "Season"}`}
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this {activeTab === "standings" ? "standing" : activeTab === "teams" ? "team" : "season"}?
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

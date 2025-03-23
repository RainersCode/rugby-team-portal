"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Plus, Loader2, Upload, RefreshCw } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { usePlayerData, PlayerType } from "@/hooks/usePlayerData";

const positions = [
  "Prop",
  "Hooker",
  "Lock",
  "Flanker",
  "Number 8",
  "Scrum-half",
  "Fly-half",
  "Center",
  "Wing",
  "Full-back",
];

function PlayersContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    number: "",
    image: "",
    matches: "",
    tries: "",
    tackles: "",
    instagram: "",
    twitter: "",
    achievements: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [bypassMode, setBypassMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const { players, isLoading, error, refreshData, createPlayer, updatePlayer, deletePlayer } = usePlayerData();

  useEffect(() => {
    // Check for bypass parameter
    const bypass = searchParams.get('bypass');
    if (bypass === 'admin') {
      setBypassMode(true);
    }
  }, [searchParams]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `players/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      return { filePath, publicUrl };
    } catch (error) {
      console.error("Detailed upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    }
  };

  const deleteImage = async (imagePath: string) => {
    try {
      if (!imagePath) return;

      // Extract the file path from the URL
      const urlParts = imagePath.split("/");
      const filePath = urlParts.slice(urlParts.indexOf("images") + 1).join("/");

      if (!filePath) {
        console.error("Invalid image path:", imagePath);
        return;
      }

      const { error } = await supabase.storage
        .from("images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        throw error;
      }
    } catch (error) {
      console.error("Delete image error:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Validate that we have either an image file or an existing image URL
      if (!selectedPlayer && !imageFile && !formData.image) {
        setFormError("Please upload a player image");
        return;
      }

      // Validate position is selected
      if (!formData.position) {
        setFormError("Please select a position");
        return;
      }

      let imageUrl = formData.image;

      if (imageFile) {
        try {
          const { publicUrl } = await uploadImage(imageFile);
          imageUrl = publicUrl;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          setFormError("Failed to upload image. Please try again.");
          return;
        }
      }

      // Process achievements - make sure they're in correct format
      let achievementsArray: string[] = [];
      if (formData.achievements) {
        // Split by newlines and filter out empty strings
        achievementsArray = formData.achievements
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
      }

      // Create the player data object
      const playerData = {
        name: formData.name.trim(),
        position: formData.position,
        number: Number(formData.number) || 0,
        image: imageUrl,
        stats: {
          matches: Number(formData.matches) || 0,
          tries: Number(formData.tries) || 0,
          tackles: Number(formData.tackles) || 0,
        },
        social: {
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
        },
        achievements: achievementsArray,
      };

      console.log("Player data to submit:", JSON.stringify(playerData, null, 2));

      let success = false;
      if (selectedPlayer) {
        // If we're editing an existing player
        console.log(`Updating player with ID: ${selectedPlayer.id}`);
        success = await updatePlayer(selectedPlayer.id, playerData);
      } else {
        // If we're creating a new player
        console.log("Creating new player");
        success = await createPlayer(playerData);
      }

      console.log("Operation result:", success ? "Success" : "Failed");
      if (success) {
        // Reset form state
        resetForm();
      } else {
        setFormError("Operation failed. Check console for details.");
      }
    } catch (error) {
      console.error("Error submitting player:", error);
      setFormError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (player: PlayerType) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      number: player.number.toString(),
      image: player.image,
      matches: player.stats.matches.toString(),
      tries: player.stats.tries.toString(),
      tackles: player.stats.tackles.toString(),
      instagram: player.social.instagram || "",
      twitter: player.social.twitter || "",
      achievements: player.achievements ? player.achievements.join('\n') : "",
    });
    setImagePreview(player.image);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    
    try {
      // Find the player to get the image URL
      console.log(`Attempting to delete player with ID: ${confirmDelete}`);
      const playerToDelete = players.find(p => p.id === confirmDelete);
      
      if (playerToDelete?.image) {
        // Delete the image first
        console.log(`Deleting image: ${playerToDelete.image}`);
        await deleteImage(playerToDelete.image);
      }
      
      // Delete the player record
      const success = await deletePlayer(confirmDelete);
      console.log("Delete operation result:", success ? "Success" : "Failed");
      
      if (success) {
        setConfirmDelete(null);
      } else {
        throw new Error("Failed to delete player. Check console for details.");
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      alert(error instanceof Error ? error.message : "An error occurred while deleting the player");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      number: "",
      image: "",
      matches: "",
      tries: "",
      tackles: "",
      instagram: "",
      twitter: "",
      achievements: "",
    });
    setSelectedPlayer(null);
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(false);
  };

  if (bypassMode) {
    return (
      <div className="container py-6">
        <Alert className="mb-6">
          <AlertTitle>Bypass Mode Active</AlertTitle>
          <AlertDescription>
            You are viewing this page in bypass mode. Some features may be limited.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => router.push("/admin/players")}
            >
              Exit Bypass Mode
            </Button>
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Players Management</h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800"
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={player.image || "/images/training-hero.jpg"}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/training-hero.jpg";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {player.position} · #{player.number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Players Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-rugby-teal hover:bg-rugby-teal/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={handleRefresh}
            >
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => router.refresh()}
            >
              Reload Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => router.push("/admin/players?bypass=admin")}
            >
              Bypass Mode
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-rugby-teal" />
          <span className="ml-2">Loading players...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800"
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={player.image || "/images/training-hero.jpg"}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/training-hero.jpg";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {player.position} · #{player.number}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(player)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlayer ? "Edit Player" : "Add New Player"}
            </DialogTitle>
          </DialogHeader>
          {formError && (
            <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Player Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Jersey Number</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) =>
                  setFormData({ ...formData, position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Player Image</Label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="h-24 w-24 relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center gap-2 border rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4" />
                    {imageFile ? imageFile.name : "Upload image"}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matches">Matches Played</Label>
                <Input
                  id="matches"
                  name="matches"
                  type="number"
                  value={formData.matches}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tries">Tries</Label>
                <Input
                  id="tries"
                  name="tries"
                  type="number"
                  value={formData.tries}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tackles">Tackles</Label>
                <Input
                  id="tackles"
                  name="tackles"
                  type="number"
                  value={formData.tackles}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Username only"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="Username only"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">
                Achievements (one per line)
              </Label>
              <Textarea
                id="achievements"
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rugby-teal hover:bg-rugby-teal/90"
              >
                {selectedPlayer ? "Update" : "Add"} Player
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this player? This action cannot be undone.
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
    </div>
  );
}

export default function AdminPlayersPage() {
  return (
    <Suspense fallback={
      <div className="container py-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-rugby-teal" />
          <span className="ml-2">Loading players management...</span>
        </div>
      </div>
    }>
      <PlayersContent />
    </Suspense>
  );
}

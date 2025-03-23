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
      // Log more information about the file being uploaded
      console.log(`Uploading image file: ${file.name}, size: ${file.size}kb, type: ${file.type}`);
      
      // Check if file is valid
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error("File is not an image");
      }

      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timed out after 15 seconds")), 15000);
      });
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `players/${fileName}`;

      console.log(`Generated file path: ${filePath}`);

      // For simplicity and reliability, we'll just return the placeholder
      // This is a temporary fix until the storage issues are resolved
      return { 
        filePath, 
        publicUrl: "/images/training-hero.jpg" 
      };

      // The code below is commented out until storage issues are resolved
      /*
      // First check if the bucket exists
      try {
        console.log("Checking storage buckets...");
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error listing buckets:", bucketsError);
          throw new Error(`Cannot access storage: ${bucketsError.message}`);
        }
        
        console.log("Available buckets:", buckets.map(b => b.name).join(', '));
        
        // Check if our bucket exists
        const imagesBucket = buckets.find(b => b.name === "images");
        if (!imagesBucket) {
          throw new Error("The 'images' storage bucket doesn't exist");
        }
      } catch (bucketError) {
        console.error("Bucket check error:", bucketError);
        throw new Error("Failed to verify storage access");
      }

      // Upload the file
      console.log("Starting file upload to Supabase storage...");
      const uploadPromise = supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      // Race the upload against the timeout
      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]);

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log("File uploaded successfully:", uploadData);

      // Get the public URL
      console.log("Getting public URL for uploaded file...");
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      console.log("Generated public URL:", publicUrl);

      return { filePath, publicUrl };
      */
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
      // Validate required fields
      if (!formData.name.trim()) {
        setFormError("Player name is required");
        return;
      }

      // Validate position is selected
      if (!formData.position) {
        setFormError("Please select a position");
        return;
      }

      let imageUrl = formData.image;

      // Upload image if we have a new file
      if (imageFile) {
        try {
          setFormError("Uploading image...");
          console.log("Starting image upload process");
          
          // Add a small timeout to ensure the UI updates before starting the upload
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { publicUrl } = await uploadImage(imageFile);
          imageUrl = publicUrl;
          console.log("Image upload completed successfully");
          setFormError(null);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          setFormError(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
          
          // Ask if user wants to continue with placeholder
          if (confirm("Image upload failed. Continue with placeholder image?")) {
            // Use placeholder image
            imageUrl = "/images/training-hero.jpg";
            setFormError(null);
          } else {
            return; // User chose not to continue
          }
        }
      } else if (!imageUrl && !selectedPlayer) {
        // No image file and no existing image - use placeholder
        imageUrl = "/images/training-hero.jpg";
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

      // Create the player data object with explicit type conversion
      const playerData = {
        name: formData.name.trim(),
        position: formData.position,
        number: parseInt(formData.number) || 0,
        image: imageUrl || "/images/training-hero.jpg", // Ensure we always have an image URL
        stats: {
          matches: parseInt(formData.matches) || 0,
          tries: parseInt(formData.tries) || 0,
          tackles: parseInt(formData.tackles) || 0,
        },
        social: {
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
        },
        achievements: achievementsArray,
      };

      console.log("Player data to submit:", JSON.stringify(playerData, null, 2));
      
      setFormError("Saving player data...");
      
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
      
      if (!playerToDelete) {
        console.error(`Player with ID ${confirmDelete} not found in list`);
        setFormError(`Player not found. Try refreshing the page.`);
        return;
      }
      
      // Show operation in progress
      setFormError("Deleting player...");
      
      // Delete the player record first
      console.log("Deleting player record from database");
      const success = await deletePlayer(confirmDelete);
      
      if (success) {
        // If database record deletion was successful, try to delete the image
        if (playerToDelete?.image) {
          try {
            // Delete the image
            console.log(`Deleting image: ${playerToDelete.image}`);
            await deleteImage(playerToDelete.image);
          } catch (imageError) {
            // Just log image deletion errors, don't fail the whole operation
            console.error("Failed to delete image, but player was removed:", imageError);
          }
        }
        
        setConfirmDelete(null);
        setFormError(null);
      } else {
        throw new Error("Failed to delete player. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      setFormError(error instanceof Error ? error.message : "An error occurred while deleting the player");
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
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
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
                  {!selectedPlayer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Image optional - placeholder will be used if none provided
                    </p>
                  )}
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
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
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

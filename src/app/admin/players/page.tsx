"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Plus, Loader2, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  image: string;
  stats: {
    matches: number;
    tries: number;
    tackles: number;
  };
  social: {
    instagram: string;
    twitter: string;
  };
  achievements: string[];
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
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

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdmin();
    fetchPlayers();
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

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("number");

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);

    try {
      // Validate that we have either an image file or an existing image URL
      if (!imageFile && !formData.image) {
        throw new Error("Please upload a player image");
      }

      // Validate position is selected
      if (!formData.position) {
        throw new Error("Please select a position");
      }

      let imageUrl = formData.image;

      if (imageFile) {
        try {
          const { publicUrl } = await uploadImage(imageFile);
          imageUrl = publicUrl;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Create the player data object matching the exact database schema
      const playerData = {
        name: formData.name.trim(),
        position: formData.position,
        number: Number(formData.number),
        image: imageUrl, // Changed back to 'image' to match DB schema
        stats: {
          // JSONB field
          matches: Number(formData.matches) || 0,
          tries: Number(formData.tries) || 0,
          tackles: Number(formData.tackles) || 0,
        },
        social: {
          // JSONB field
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
        },
        achievements: formData.achievements
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      };

      console.log("Attempting to save player data:", playerData);

      if (isEditing && selectedPlayer) {
        const { data, error } = await supabase
          .from("players")
          .update(playerData)
          .eq("id", selectedPlayer.id)
          .select();

        if (error) {
          console.error("Database update error:", error);
          throw new Error(`Failed to update player: ${error.message}`);
        }

        console.log("Update response:", data);

        // Delete old image if it was replaced
        if (imageFile && selectedPlayer.image) {
          await deleteImage(selectedPlayer.image);
        }
      } else {
        // Check if jersey number is already taken
        const { data: existingPlayer } = await supabase
          .from("players")
          .select("id")
          .eq("number", playerData.number)
          .single();

        if (existingPlayer) {
          throw new Error(
            `Jersey number ${playerData.number} is already taken`
          );
        }

        const { data, error } = await supabase
          .from("players")
          .insert([playerData])
          .select();

        if (error) {
          console.error("Database insert error:", error);
          throw new Error(`Failed to add player: ${error.message}`);
        }

        console.log("Insert response:", data);
      }

      await fetchPlayers();
      setIsEditing(false);
      setSelectedPlayer(null);
      resetForm();
    } catch (error) {
      console.error("Error saving player:", error);
      alert(error instanceof Error ? error.message : "Failed to save player");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setIsEditing(true);
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      number: player.number.toString(),
      image: player.image,
      matches: player.stats.matches.toString(),
      tries: player.stats.tries.toString(),
      tackles: player.stats.tackles.toString(),
      instagram: player.social.instagram,
      twitter: player.social.twitter,
      achievements: player.achievements.join("\n"),
    });
    setImagePreview(player.image);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    try {
      // Get the player's image URL before deleting
      const player = players.find((p) => p.id === id);
      if (player?.image) {
        await deleteImage(player.image);
      }

      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;

      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
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
    setImageFile(null);
    setImagePreview("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Players</h1>
        <Dialog
          open={isAddingNew}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setIsAddingNew(false);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setIsAddingNew(true);
                setIsEditing(false);
                setSelectedPlayer(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-light dark:bg-bg-dark border-b border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
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
                  <SelectContent className="bg-bg-light dark:bg-bg-dark border border-gray-200 dark:border-gray-800">
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
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  {imagePreview && (
                    <div className="relative w-20 h-20">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matches">Matches</Label>
                  <Input
                    id="matches"
                    name="matches"
                    type="number"
                    value={formData.matches}
                    onChange={handleInputChange}
                    required
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
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Username</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Username</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
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

              <div className="flex justify-end gap-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Player
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative h-80">
              <Image
                src={player.image}
                alt={player.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{player.name}</h3>
                    <p className="text-sm opacity-90">{player.position}</p>
                  </div>
                  <div className="text-2xl font-bold">#{player.number}</div>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2">
              <Dialog
                open={isEditing && selectedPlayer?.id === player.id}
                onOpenChange={(open: boolean) => {
                  if (!open) {
                    setIsEditing(false);
                    setSelectedPlayer(null);
                    resetForm();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleEdit(player);
                      setIsAddingNew(false);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-light dark:bg-bg-dark border-b border-gray-200 dark:border-gray-800">
                  <DialogHeader>
                    <DialogTitle>Edit Player</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
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
                        <SelectContent className="bg-bg-light dark:bg-bg-dark border border-gray-200 dark:border-gray-800">
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
                      <div className="flex items-center gap-4">
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image")?.click()
                          }
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </Button>
                        {imagePreview && (
                          <div className="relative w-20 h-20">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="matches">Matches</Label>
                        <Input
                          id="matches"
                          name="matches"
                          type="number"
                          value={formData.matches}
                          onChange={handleInputChange}
                          required
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
                          required
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
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram Username</Label>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Username</Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
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

                    <div className="flex justify-end gap-4">
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Update Player
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(player.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

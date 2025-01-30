'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';

interface MatchFormProps {
  initialData?: {
    home_team: string;
    away_team: string;
    home_team_image: string;
    away_team_image: string;
    match_date: string;
    venue: string;
    competition: string;
    status: 'upcoming' | 'live' | 'completed';
    home_score?: number;
    away_score?: number;
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function MatchForm({ initialData, onSubmit, isSubmitting }: MatchFormProps) {
  const [formData, setFormData] = useState({
    home_team: initialData?.home_team || '',
    away_team: initialData?.away_team || '',
    home_team_image: initialData?.home_team_image || '',
    away_team_image: initialData?.away_team_image || '',
    match_date: initialData?.match_date ? new Date(initialData.match_date).toISOString().slice(0, 16) : '',
    venue: initialData?.venue || '',
    competition: initialData?.competition || '',
    status: initialData?.status || 'upcoming',
    home_score: initialData?.home_score || 0,
    away_score: initialData?.away_score || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      match_date: new Date(formData.match_date).toISOString(),
      home_score: parseInt(formData.home_score.toString()),
      away_score: parseInt(formData.away_score.toString()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Home Team */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="home_team">Home Team</Label>
          <Input
            id="home_team"
            value={formData.home_team}
            onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Home Team Logo</Label>
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, home_team_image: url })}
            defaultImage={formData.home_team_image}
            id="home-team"
          />
        </div>
      </div>

      {/* Away Team */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="away_team">Away Team</Label>
          <Input
            id="away_team"
            value={formData.away_team}
            onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Away Team Logo</Label>
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, away_team_image: url })}
            defaultImage={formData.away_team_image}
            id="away-team"
          />
        </div>
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="match_date">Date & Time</Label>
          <Input
            id="match_date"
            type="datetime-local"
            value={formData.match_date}
            onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="competition">Competition</Label>
        <Input
          id="competition"
          value={formData.competition}
          onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as any })}
        >
          <SelectTrigger className="w-full bg-background border border-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <SelectItem value="upcoming" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              Upcoming
            </SelectItem>
            <SelectItem value="live" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              Live
            </SelectItem>
            <SelectItem value="completed" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score (only for live or completed matches) */}
      {formData.status !== 'upcoming' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="home_score">Home Score</Label>
            <Input
              id="home_score"
              type="number"
              min="0"
              value={formData.home_score}
              onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="away_score">Away Score</Label>
            <Input
              id="away_score"
              type="number"
              min="0"
              value={formData.away_score}
              onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Match'}
      </Button>
    </form>
  );
} 
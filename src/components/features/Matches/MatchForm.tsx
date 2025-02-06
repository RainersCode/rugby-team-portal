'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { MatchEvent, PlayerCard } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

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
    description?: string;
    match_events?: MatchEvent[];
    player_cards?: PlayerCard[];
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
    description: initialData?.description || '',
    match_events: initialData?.match_events || [],
    player_cards: initialData?.player_cards || [],
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

  const addMatchEvent = () => {
    setFormData(prev => ({
      ...prev,
      match_events: [...prev.match_events, {
        type: 'try',
        team: 'home',
        player: '',
        minute: 0,
        points: 5
      }]
    }));
  };

  const updateMatchEvent = (index: number, field: keyof MatchEvent, value: any) => {
    const newEvents = [...formData.match_events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    
    // Update points based on event type
    if (field === 'type') {
      switch (value) {
        case 'try':
          newEvents[index].points = 5;
          break;
        case 'conversion':
          newEvents[index].points = 2;
          break;
        case 'penalty':
          newEvents[index].points = 3;
          break;
        case 'drop_goal':
          newEvents[index].points = 3;
          break;
      }
    }
    
    setFormData(prev => ({ ...prev, match_events: newEvents }));
  };

  const removeMatchEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      match_events: prev.match_events.filter((_, i) => i !== index)
    }));
  };

  const addPlayerCard = () => {
    setFormData(prev => ({
      ...prev,
      player_cards: [...prev.player_cards, {
        type: 'yellow',
        team: 'home',
        player: '',
        minute: 0,
        reason: ''
      }]
    }));
  };

  const updatePlayerCard = (index: number, field: keyof PlayerCard, value: any) => {
    const newCards = [...formData.player_cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFormData(prev => ({ ...prev, player_cards: newCards }));
  };

  const removePlayerCard = (index: number) => {
    setFormData(prev => ({
      ...prev,
      player_cards: prev.player_cards.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Match Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Match Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter match description and summary..."
          className="h-32"
        />
      </div>

      {/* Match Events */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Match Events</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMatchEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
        <div className="space-y-4">
          {formData.match_events.map((event, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Select
                value={event.type}
                onValueChange={(value) => updateMatchEvent(index, 'type', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="try">Try</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="penalty">Penalty</SelectItem>
                  <SelectItem value="drop_goal">Drop Goal</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={event.team}
                onValueChange={(value) => updateMatchEvent(index, 'team', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Player Name"
                value={event.player}
                onChange={(e) => updateMatchEvent(index, 'player', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Minute"
                value={event.minute}
                onChange={(e) => updateMatchEvent(index, 'minute', parseInt(e.target.value))}
                className="w-[100px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMatchEvent(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Player Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Player Cards</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPlayerCard}>
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
        <div className="space-y-4">
          {formData.player_cards.map((card, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Select
                value={card.type}
                onValueChange={(value) => updatePlayerCard(index, 'type', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={card.team}
                onValueChange={(value) => updatePlayerCard(index, 'team', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Player Name"
                value={card.player}
                onChange={(e) => updatePlayerCard(index, 'player', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Minute"
                value={card.minute}
                onChange={(e) => updatePlayerCard(index, 'minute', parseInt(e.target.value))}
                className="w-[100px]"
              />
              <Input
                placeholder="Reason"
                value={card.reason}
                onChange={(e) => updatePlayerCard(index, 'reason', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePlayerCard(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Match'}
      </Button>
    </form>
  );
} 
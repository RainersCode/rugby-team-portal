export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      about_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      about_page: {
        Row: {
          created_at: string
          hero_image: string | null
          history: string
          id: string
          mission: string
          team_highlights: Json | null
          updated_at: string
          values: string
        }
        Insert: {
          created_at?: string
          hero_image?: string | null
          history: string
          id?: string
          mission: string
          team_highlights?: Json | null
          updated_at?: string
          values: string
        }
        Update: {
          created_at?: string
          hero_image?: string | null
          history?: string
          id?: string
          mission?: string
          team_highlights?: Json | null
          updated_at?: string
          values?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_participants: {
        Row: {
          activity_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          author_id: string | null
          blocks: Json | null
          content: string
          created_at: string
          id: string
          image: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          blocks?: Json | null
          content: string
          created_at?: string
          id?: string
          image: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          author_id?: string | null
          blocks?: Json | null
          content?: string
          created_at?: string
          id?: string
          image?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      championship_seasons: {
        Row: {
          created_at: string
          end_date: string
          id: number
          is_current: boolean | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: number
          is_current?: boolean | null
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: number
          is_current?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      championship_standings: {
        Row: {
          created_at: string
          drawn: number | null
          id: number
          losing_bonus_points: number | null
          lost: number | null
          played: number | null
          points_for: number | null
          position: number
          season_id: number | null
          team_id: number | null
          total_points: number | null
          try_bonus_points: number | null
          updated_at: string
          won: number | null
        }
        Insert: {
          created_at?: string
          drawn?: number | null
          id?: number
          losing_bonus_points?: number | null
          lost?: number | null
          played?: number | null
          points_for?: number | null
          position: number
          season_id?: number | null
          team_id?: number | null
          total_points?: number | null
          try_bonus_points?: number | null
          updated_at?: string
          won?: number | null
        }
        Update: {
          created_at?: string
          drawn?: number | null
          id?: number
          losing_bonus_points?: number | null
          lost?: number | null
          played?: number | null
          points_for?: number | null
          position?: number
          season_id?: number | null
          team_id?: number | null
          total_points?: number | null
          try_bonus_points?: number | null
          updated_at?: string
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "championship_standings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "championship_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "championship_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "championship_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_teams: {
        Row: {
          created_at: string
          id: number
          name: string
          season_id: number | null
          status: Database["public"]["Enums"]["team_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          season_id?: number | null
          status?: Database["public"]["Enums"]["team_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          season_id?: number | null
          status?: Database["public"]["Enums"]["team_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "championship_teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "championship_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      cup_matches: {
        Row: {
          created_at: string
          id: number
          match_date: string | null
          round: string
          score1: number | null
          score2: number | null
          team1: string | null
          team2: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          match_date?: string | null
          round: string
          score1?: number | null
          score2?: number | null
          team1?: string | null
          team2?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          match_date?: string | null
          round?: string
          score1?: number | null
          score2?: number | null
          team1?: string | null
          team2?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      current_sevens_standings: {
        Row: {
          created_at: string
          drawn: number
          id: number
          lost: number
          played: number
          position: number
          team_name: string
          total_points: number
          updated_at: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          id?: number
          lost?: number
          played?: number
          position: number
          team_name: string
          total_points?: number
          updated_at?: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          id?: number
          lost?: number
          played?: number
          position?: number
          team_name?: string
          total_points?: number
          updated_at?: string
          won?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          equipment: string[] | null
          id: string
          image_url: string | null
          muscles_targeted: string[] | null
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          muscles_targeted?: string[] | null
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          muscles_targeted?: string[] | null
          name?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      galleries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          created_at: string
          description: string | null
          gallery_id: string | null
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gallery_id?: string | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gallery_id?: string | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          stream_date: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewers_count: number | null
          youtube_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status: string
          stream_date: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewers_count?: number | null
          youtube_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          stream_date?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewers_count?: number | null
          youtube_id?: string
        }
        Relationships: []
      }
      match_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          match_id: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          match_id?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          match_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_photos_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_image: string
          competition: string
          created_at: string
          description: string | null
          home_score: number | null
          home_team: string
          home_team_image: string
          id: string
          match_date: string
          match_events: Json | null
          player_cards: Json | null
          status: string
          updated_at: string
          venue: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_image: string
          competition: string
          created_at?: string
          description?: string | null
          home_score?: number | null
          home_team: string
          home_team_image: string
          id?: string
          match_date: string
          match_events?: Json | null
          player_cards?: Json | null
          status: string
          updated_at?: string
          venue: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_image?: string
          competition?: string
          created_at?: string
          description?: string | null
          home_score?: number | null
          home_team?: string
          home_team_image?: string
          id?: string
          match_date?: string
          match_events?: Json | null
          player_cards?: Json | null
          status?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          user_image: string | null
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          user_image?: string | null
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          user_image?: string | null
          user_name?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          achievements: string[]
          created_at: string
          id: number
          image: string
          name: string
          number: number
          position: string
          social: Json
          stats: Json
          updated_at: string
        }
        Insert: {
          achievements?: string[]
          created_at?: string
          id?: never
          image: string
          name: string
          number: number
          position: string
          social?: Json
          stats?: Json
          updated_at?: string
        }
        Update: {
          achievements?: string[]
          created_at?: string
          id?: never
          image?: string
          name?: string
          number?: number
          position?: string
          social?: Json
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          birth_date: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_backup: {
        Row: {
          address: string | null
          bio: string | null
          birth_date: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_workouts: {
        Row: {
          created_at: string
          day_number: number
          description: string | null
          duration_minutes: number
          id: string
          program_id: string
          title: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          day_number: number
          description?: string | null
          duration_minutes: number
          id?: string
          program_id: string
          title: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          program_id?: string
          title?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs_with_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          author_id: string
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number
          id: string
          image_url: string | null
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number
          id?: string
          image_url?: string | null
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number
          id?: string
          image_url?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: number | null
          rest_seconds: number
          sets: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_seconds: number
          sets: number
          workout_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_seconds?: number
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "program_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_championship_standings: {
        Row: {
          drawn: number | null
          losing_bonus_points: number | null
          lost: number | null
          played: number | null
          points_for: number | null
          position: number | null
          team_name: string | null
          total_points: number | null
          try_bonus_points: number | null
          won: number | null
        }
        Relationships: []
      }
      training_programs_with_authors: {
        Row: {
          author_email: string | null
          author_id: string | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          duration_weeks: number | null
          id: string | null
          image_url: string | null
          target_audience: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          role: string
          first_name: string
          last_name: string
          updated_at: string
          last_sign_in_at: string
        }[]
      }
      get_user_emails: {
        Args: {
          user_ids: string[]
        }
        Returns: {
          id: string
          email: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_first_user_as_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced" | "elite"
      exercise_category:
        | "weightlifting"
        | "sprint"
        | "cardio"
        | "strength"
        | "agility"
        | "flexibility"
        | "recovery"
      team_status: "active" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

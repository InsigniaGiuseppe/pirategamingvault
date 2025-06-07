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
      credentials: {
        Row: {
          active: boolean | null
          auth_code: string
          created_at: string | null
          id: string
          password: string
          username: string
        }
        Insert: {
          active?: boolean | null
          auth_code: string
          created_at?: string | null
          id?: string
          password: string
          username: string
        }
        Update: {
          active?: boolean | null
          auth_code?: string
          created_at?: string | null
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      custom_users: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          category: string | null
          coin_cost: number
          created_at: string | null
          id: string
          img_src: string | null
          is_pirate_pun: boolean | null
          title: string
        }
        Insert: {
          category?: string | null
          coin_cost: number
          created_at?: string | null
          id: string
          img_src?: string | null
          is_pirate_pun?: boolean | null
          title: string
        }
        Update: {
          category?: string | null
          coin_cost?: number
          created_at?: string | null
          id?: string
          img_src?: string | null
          is_pirate_pun?: boolean | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      unlocked_games: {
        Row: {
          game_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balance: {
        Row: {
          balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "custom_users"
            referencedColumns: ["id"]
          },
        ]
      }
      video_analytics: {
        Row: {
          action: string
          id: string
          session_id: string | null
          timestamp: string | null
          user_id: string | null
          video_id: string | null
          watch_duration: number | null
        }
        Insert: {
          action: string
          id?: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
          video_id?: string | null
          watch_duration?: number | null
        }
        Update: {
          action?: string
          id?: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
          video_id?: string | null
          watch_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_analytics_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          completion_count: number | null
          created_at: string | null
          description: string | null
          duration: number
          duration_display: string
          embed_url: string
          id: string
          is_active: boolean
          original_url: string
          platform_type: string
          reward_amount: number
          tags: string[] | null
          thumbnail_url: string
          title: string
          updated_at: string | null
          video_id: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          duration: number
          duration_display: string
          embed_url: string
          id?: string
          is_active?: boolean
          original_url: string
          platform_type: string
          reward_amount?: number
          tags?: string[] | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
          video_id: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number
          duration_display?: string
          embed_url?: string
          id?: string
          is_active?: boolean
          original_url?: string
          platform_type?: string
          reward_amount?: number
          tags?: string[] | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
          video_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

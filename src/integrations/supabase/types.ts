export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
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
      meme_coins: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          initial_price: number
          name: string
          ticker: string
          volatility_level: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          initial_price: number
          name: string
          ticker: string
          volatility_level: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          initial_price?: number
          name?: string
          ticker?: string
          volatility_level?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          coin_id: string
          created_at: string | null
          filled_quantity: number
          id: string
          order_status: Database["public"]["Enums"]["order_status"]
          order_type: Database["public"]["Enums"]["order_type"]
          price: number
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coin_id: string
          created_at?: string | null
          filled_quantity?: number
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type: Database["public"]["Enums"]["order_type"]
          price: number
          quantity: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coin_id?: string
          created_at?: string | null
          filled_quantity?: number
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          order_type?: Database["public"]["Enums"]["order_type"]
          price?: number
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "meme_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          close_price: number
          coin_id: string
          high_price: number
          id: string
          low_price: number
          open_price: number
          timestamp: string
          volume: number
        }
        Insert: {
          close_price: number
          coin_id: string
          high_price: number
          id?: string
          low_price: number
          open_price: number
          timestamp: string
          volume: number
        }
        Update: {
          close_price?: number
          coin_id?: string
          high_price?: number
          id?: string
          low_price?: number
          open_price?: number
          timestamp?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "meme_coins"
            referencedColumns: ["id"]
          },
        ]
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
          coin_id: string | null
          created_at: string | null
          description: string | null
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          coin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          coin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "meme_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_games: {
        Row: {
          game_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_coin_holdings: {
        Row: {
          average_buy_price: number
          coin_id: string
          id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          coin_id: string
          id?: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_buy_price?: number
          coin_id?: string
          id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coin_holdings_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "meme_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      video_analytics: {
        Row: {
          action: string
          created_at: string
          id: string
          session_id: string | null
          user_id: string | null
          video_id: string
          watch_duration: number | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          video_id: string
          watch_duration?: number | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
          video_id?: string
          watch_duration?: number | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          coin_reward: number
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean
          is_featured: boolean
          platform_type: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_id: string
          view_count: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          platform_type?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_id: string
          view_count?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          platform_type?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_id?: string
          view_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coins: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description?: string
          p_coin_id?: string
        }
        Returns: undefined
      }
      buy_meme_coin: {
        Args: {
          p_user_id: string
          p_coin_id: string
          p_quantity: number
          p_price_per_coin: number
        }
        Returns: undefined
      }
      remove_coins: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description?: string
          p_coin_id?: string
        }
        Returns: undefined
      }
      sell_meme_coin: {
        Args: {
          p_user_id: string
          p_coin_id: string
          p_quantity: number
          p_price_per_coin: number
        }
        Returns: undefined
      }
      subtract_coins: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description?: string
          p_coin_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      order_status: "pending" | "filled" | "cancelled"
      order_type: "buy" | "sell"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "buy"
        | "sell"
        | "fee"
        | "initial_bonus"
        | "earn"
        | "spend"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "filled", "cancelled"],
      order_type: ["buy", "sell"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "buy",
        "sell",
        "fee",
        "initial_bonus",
        "earn",
        "spend",
        "admin",
      ],
    },
  },
} as const

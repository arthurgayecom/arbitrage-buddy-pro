export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          opportunity_id: string | null
          sent_via: string[] | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          opportunity_id?: string | null
          sent_via?: string[] | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          opportunity_id?: string | null
          sent_via?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "arbitrage_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      arbitrage_opportunities: {
        Row: {
          discovered_at: string
          expected_value: number | null
          expires_at: string | null
          id: string
          kalshi_price: number | null
          kalshi_url: string | null
          market_name: string
          metadata: Json | null
          polymarket_price: number | null
          polymarket_url: string | null
          profit_percentage: number
          status: string | null
          win_probability: number | null
        }
        Insert: {
          discovered_at?: string
          expected_value?: number | null
          expires_at?: string | null
          id?: string
          kalshi_price?: number | null
          kalshi_url?: string | null
          market_name: string
          metadata?: Json | null
          polymarket_price?: number | null
          polymarket_url?: string | null
          profit_percentage: number
          status?: string | null
          win_probability?: number | null
        }
        Update: {
          discovered_at?: string
          expected_value?: number | null
          expires_at?: string | null
          id?: string
          kalshi_price?: number | null
          kalshi_url?: string | null
          market_name?: string
          metadata?: Json | null
          polymarket_price?: number | null
          polymarket_url?: string | null
          profit_percentage?: number
          status?: string | null
          win_probability?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_execute: boolean | null
          created_at: string
          discord_webhook_url: string | null
          display_name: string | null
          email: string | null
          email_alerts: boolean | null
          id: string
          phantom_wallet_address: string | null
          profit_threshold: number | null
          simulation_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_execute?: boolean | null
          created_at?: string
          discord_webhook_url?: string | null
          display_name?: string | null
          email?: string | null
          email_alerts?: boolean | null
          id?: string
          phantom_wallet_address?: string | null
          profit_threshold?: number | null
          simulation_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_execute?: boolean | null
          created_at?: string
          discord_webhook_url?: string | null
          display_name?: string | null
          email?: string | null
          email_alerts?: boolean | null
          id?: string
          phantom_wallet_address?: string | null
          profit_threshold?: number | null
          simulation_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number
          confirmed_at: string | null
          executed_at: string
          id: string
          is_simulation: boolean | null
          market_name: string
          metadata: Json | null
          opportunity_id: string | null
          platform: string
          price: number
          profit_loss: number | null
          side: string
          status: string | null
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          executed_at?: string
          id?: string
          is_simulation?: boolean | null
          market_name: string
          metadata?: Json | null
          opportunity_id?: string | null
          platform: string
          price: number
          profit_loss?: number | null
          side: string
          status?: string | null
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          executed_at?: string
          id?: string
          is_simulation?: boolean | null
          market_name?: string
          metadata?: Json | null
          opportunity_id?: string | null
          platform?: string
          price?: number
          profit_loss?: number | null
          side?: string
          status?: string | null
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "arbitrage_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_credentials: {
        Row: {
          created_at: string
          credential_type: string
          encrypted_value: string
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_type: string
          encrypted_value: string
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          encrypted_value?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string
          user_id?: string
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
    Enums: {},
  },
} as const

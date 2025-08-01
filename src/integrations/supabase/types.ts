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
      affiliate_conversions: {
        Row: {
          amount_cents: number
          commission_cents: number
          conversion_id: string
          created_at: string
          event_type: string
          id: string
          network: string
          order_id: string | null
          partner_name: string
          processed_at: string
          raw_data: Json | null
          status: string
          updated_at: string
          validated_at: string | null
          validation_notes: string | null
        }
        Insert: {
          amount_cents?: number
          commission_cents?: number
          conversion_id: string
          created_at?: string
          event_type?: string
          id?: string
          network?: string
          order_id?: string | null
          partner_name: string
          processed_at?: string
          raw_data?: Json | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validation_notes?: string | null
        }
        Update: {
          amount_cents?: number
          commission_cents?: number
          conversion_id?: string
          created_at?: string
          event_type?: string
          id?: string
          network?: string
          order_id?: string | null
          partner_name?: string
          processed_at?: string
          raw_data?: Json | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validation_notes?: string | null
        }
        Relationships: []
      }
      bank_account_audit_log: {
        Row: {
          action: string
          bank_account_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          bank_account_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          bank_account_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_account_audit_log_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "user_bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bitcoin_transactions: {
        Row: {
          address: string
          amount_btc: number
          amount_satoshis: number
          block_height: number | null
          confirmations: number | null
          created_at: string | null
          fee_satoshis: number | null
          id: string
          order_id: string | null
          status: string | null
          transaction_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          amount_btc: number
          amount_satoshis: number
          block_height?: number | null
          confirmations?: number | null
          created_at?: string | null
          fee_satoshis?: number | null
          id?: string
          order_id?: string | null
          status?: string | null
          transaction_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          amount_btc?: number
          amount_satoshis?: number
          block_height?: number | null
          confirmations?: number | null
          created_at?: string | null
          fee_satoshis?: number | null
          id?: string
          order_id?: string | null
          status?: string | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      commisions: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount_earned_cents: number
          created_at: string
          description: string | null
          id: string
          paid_at: string | null
          paid_out: boolean
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_earned_cents: number
          created_at?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          paid_out?: boolean
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_earned_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          paid_out?: boolean
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_earnings: {
        Row: {
          created_at: string
          date: string
          id: string
          total_earnings_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          method: string
          status: string
          stripe_account_id: string
          stripe_payout_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          method?: string
          status: string
          stripe_account_id: string
          stripe_payout_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          method?: string
          status?: string
          stripe_account_id?: string
          stripe_payout_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          phone_number: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expiry_date: string
          id: string
          plan: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          expiry_date: string
          id?: string
          plan?: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expiry_date?: string
          id?: string
          plan?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number_last4: string
          bank_account_id: string
          bank_name: string
          created_at: string
          id: string
          is_primary: boolean
          metadata: Json | null
          previous_account_number_last4: string | null
          previous_routing_number_last4: string | null
          routing_number_last4: string
          stripe_account_id: string
          update_reason: string | null
          updated_at: string
          updated_by_user_at: string | null
          user_id: string
          verification_method: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number_last4: string
          bank_account_id: string
          bank_name: string
          created_at?: string
          id?: string
          is_primary?: boolean
          metadata?: Json | null
          previous_account_number_last4?: string | null
          previous_routing_number_last4?: string | null
          routing_number_last4: string
          stripe_account_id: string
          update_reason?: string | null
          updated_at?: string
          updated_by_user_at?: string | null
          user_id: string
          verification_method?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number_last4?: string
          bank_account_id?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          metadata?: Json | null
          previous_account_number_last4?: string | null
          previous_routing_number_last4?: string | null
          routing_number_last4?: string
          stripe_account_id?: string
          update_reason?: string | null
          updated_at?: string
          updated_by_user_at?: string | null
          user_id?: string
          verification_method?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json
          processed_at: string | null
          status: string | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          status?: string | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string | null
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_users_todays_earnings: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          total_earnings_cents: number
        }[]
      }
      get_todays_earnings: {
        Args: { user_uuid?: string }
        Returns: number
      }
      update_daily_earnings: {
        Args: { target_user_id: string; target_date: string }
        Returns: undefined
      }
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

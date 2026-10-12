export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          match_score: number
          status: string
          updated_at: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          match_score: number
          status?: string
          updated_at?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          match_score?: number
          status?: string
          updated_at?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_tags: {
        Row: {
          dream_id: string
          tag_id: string
        }
        Insert: {
          dream_id: string
          tag_id: string
        }
        Update: {
          dream_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_tags_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          content_report: Json | null
          journal: Json | null
          event_confirmed: boolean
          transcript_revision: number
          aggregate_opt_in: boolean
          ai_processing_consent_at: string | null
          analysis_source: string
          astrological_interpretation: string | null
          astrology_context: Json | null
          audio_path: string | null
          capture_timezone: string
          content_locale: string
          created_at: string
          deletion_requested_at: string | null
          dream_date: string
          error_code: string | null
          id: string
          image_path: string | null
          image_prompt: string | null
          input_mode: string
          jungian_interpretation: string | null
          matching_opt_in: boolean
          neuroscience_interpretation: string | null
          processed_at: string | null
          status: string
          title: string | null
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_report?: Json | null
          journal?: Json | null
          event_confirmed?: boolean
          transcript_revision?: number
          aggregate_opt_in?: boolean
          ai_processing_consent_at?: string | null
          analysis_source?: string
          astrological_interpretation?: string | null
          astrology_context?: Json | null
          audio_path?: string | null
          capture_timezone?: string
          content_locale?: string
          created_at?: string
          deletion_requested_at?: string | null
          dream_date: string
          error_code?: string | null
          id?: string
          image_path?: string | null
          image_prompt?: string | null
          input_mode: string
          jungian_interpretation?: string | null
          matching_opt_in?: boolean
          neuroscience_interpretation?: string | null
          processed_at?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_report?: Json | null
          journal?: Json | null
          event_confirmed?: boolean
          transcript_revision?: number
          aggregate_opt_in?: boolean
          ai_processing_consent_at?: string | null
          analysis_source?: string
          astrological_interpretation?: string | null
          astrology_context?: Json | null
          audio_path?: string | null
          capture_timezone?: string
          content_locale?: string
          created_at?: string
          deletion_requested_at?: string | null
          dream_date?: string
          error_code?: string | null
          id?: string
          image_path?: string | null
          image_prompt?: string | null
          input_mode?: string
          jungian_interpretation?: string | null
          matching_opt_in?: boolean
          neuroscience_interpretation?: string | null
          processed_at?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dreams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          aggregate_consent_at: string | null
          analytics_consent_at: string | null
          created_at: string
          deletion_requested_at: string | null
          id: string
          locale: string
          matching_consent_at: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          aggregate_consent_at?: string | null
          analytics_consent_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          id: string
          locale?: string
          matching_consent_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          aggregate_consent_at?: string | null
          analytics_consent_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          id?: string
          locale?: string
          matching_consent_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_active: { Args: never; Returns: boolean }
      ai_attempt: {
        Args: { p_job: string; p_stage: string; p_user: string }
        Returns: number
      }
      ai_finish_job: {
        Args: { p_error?: string; p_job: string; p_user: string }
        Returns: undefined
      }
      ai_get_dream_job: {
        Args: { p_dream: string; p_user: string }
        Returns: Json
      }
      ai_get_job: { Args: { p_job: string; p_user: string }; Returns: Json }
      ai_patch_job: {
        Args: { p_job: string; p_patch: Json; p_user: string }
        Returns: Json
      }
      ai_prune_jobs: { Args: never; Returns: undefined }
      ai_reserve_job: {
        Args: {
          p_budget_micros: number
          p_digest: string
          p_dream: string
          p_input: Json
          p_job: string
          p_user: string
          p_user_limit: number
        }
        Returns: Json
      }
      claim_mutation: {
        Args: { p_token: string; p_user: string }
        Returns: boolean
      }
      get_synastry: { Args: never; Returns: Json }
      release_mutation: {
        Args: { p_token: string; p_user: string }
        Returns: undefined
      }
      save_ai_dream: {
        Args: {
          p_analysis: Json
          p_audio: string
          p_id: string
          p_image: string
          p_input: Json
          p_job: string
          p_user: string
        }
        Returns: string
      }
      save_dream_analysis: {
        Args: {
          p_analysis: Json
          p_audio: string
          p_id: string
          p_image: string
          p_input: Json
          p_user: string
        }
        Returns: string
      }
      save_mock_dream: {
        Args: {
          p_analysis: Json
          p_audio: string
          p_id: string
          p_image: string
          p_input: Json
          p_user: string
        }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

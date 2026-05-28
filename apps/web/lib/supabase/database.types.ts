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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          archetype: string
          audience_tags: string[] | null
          author_id: string | null
          body_md: string
          category: string
          composite_score: number | null
          content_type: string
          created_at: string | null
          disease_site_tags: string[] | null
          embargo_until: string | null
          embargoed: boolean | null
          id: string
          modality_tags: string[] | null
          primary_source_id: string | null
          primary_source_type: string | null
          primary_source_url: string
          publish_at: string | null
          published_at: string | null
          region: string[] | null
          revoke_reason: string | null
          revoked_at: string | null
          romas_insight: string | null
          romas_insight_labeled: boolean | null
          signal_scores: Json | null
          slug: string
          source_language: string
          standfirst: string
          status: string
          subcategory: string | null
          tier: string
          title: string
          translation_provider: string | null
          translation_verified: boolean | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          archetype: string
          audience_tags?: string[] | null
          author_id?: string | null
          body_md: string
          category: string
          composite_score?: number | null
          content_type: string
          created_at?: string | null
          disease_site_tags?: string[] | null
          embargo_until?: string | null
          embargoed?: boolean | null
          id?: string
          modality_tags?: string[] | null
          primary_source_id?: string | null
          primary_source_type?: string | null
          primary_source_url: string
          publish_at?: string | null
          published_at?: string | null
          region?: string[] | null
          revoke_reason?: string | null
          revoked_at?: string | null
          romas_insight?: string | null
          romas_insight_labeled?: boolean | null
          signal_scores?: Json | null
          slug: string
          source_language?: string
          standfirst: string
          status?: string
          subcategory?: string | null
          tier?: string
          title: string
          translation_provider?: string | null
          translation_verified?: boolean | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          archetype?: string
          audience_tags?: string[] | null
          author_id?: string | null
          body_md?: string
          category?: string
          composite_score?: number | null
          content_type?: string
          created_at?: string | null
          disease_site_tags?: string[] | null
          embargo_until?: string | null
          embargoed?: boolean | null
          id?: string
          modality_tags?: string[] | null
          primary_source_id?: string | null
          primary_source_type?: string | null
          primary_source_url?: string
          publish_at?: string | null
          published_at?: string | null
          region?: string[] | null
          revoke_reason?: string | null
          revoked_at?: string | null
          romas_insight?: string | null
          romas_insight_labeled?: boolean | null
          signal_scores?: Json | null
          slug?: string
          source_language?: string
          standfirst?: string
          status?: string
          subcategory?: string | null
          tier?: string
          title?: string
          translation_provider?: string | null
          translation_verified?: boolean | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_jobs: {
        Row: {
          article_id: string
          audio_status: string
          audio_tier: string
          audio_url_archive: string | null
          audio_url_cdn: string | null
          clinical_claims_checked: boolean | null
          cover_url: string | null
          created_at: string | null
          duration_sec: number | null
          error: string | null
          id: string
          loudness_lufs: number | null
          notes: string | null
          qa_notes: string | null
          qa_reviewed_at: string | null
          qa_reviewer: string | null
          revoke_reason: string | null
          script_md: string | null
          skip_reason: string | null
          target_length_sec: number
          transcript_url: string | null
          true_peak_dbtp: number | null
          updated_at: string | null
          voice_engine_used: string | null
        }
        Insert: {
          article_id: string
          audio_status?: string
          audio_tier: string
          audio_url_archive?: string | null
          audio_url_cdn?: string | null
          clinical_claims_checked?: boolean | null
          cover_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          error?: string | null
          id?: string
          loudness_lufs?: number | null
          notes?: string | null
          qa_notes?: string | null
          qa_reviewed_at?: string | null
          qa_reviewer?: string | null
          revoke_reason?: string | null
          script_md?: string | null
          skip_reason?: string | null
          target_length_sec: number
          transcript_url?: string | null
          true_peak_dbtp?: number | null
          updated_at?: string | null
          voice_engine_used?: string | null
        }
        Update: {
          article_id?: string
          audio_status?: string
          audio_tier?: string
          audio_url_archive?: string | null
          audio_url_cdn?: string | null
          clinical_claims_checked?: boolean | null
          cover_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          error?: string | null
          id?: string
          loudness_lufs?: number | null
          notes?: string | null
          qa_notes?: string | null
          qa_reviewed_at?: string | null
          qa_reviewer?: string | null
          revoke_reason?: string | null
          script_md?: string | null
          skip_reason?: string | null
          target_length_sec?: number
          transcript_url?: string | null
          true_peak_dbtp?: number | null
          updated_at?: string | null
          voice_engine_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_jobs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_jobs_qa_reviewer_fkey"
            columns: ["qa_reviewer"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          article_id: string
          claim_text: string
          confidence: number | null
          created_at: string | null
          id: string
          source_id: string | null
          source_type: string | null
          source_url: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          article_id: string
          claim_text: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          source_url: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          article_id?: string
          claim_text?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          source_url?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      embargo_holds: {
        Row: {
          candidate_title: string
          created_at: string | null
          embargo_until: string
          id: string
          notes: string | null
          region: string[] | null
          released_at: string | null
          released_to_article_id: string | null
          source_id: string | null
          source_url: string
        }
        Insert: {
          candidate_title: string
          created_at?: string | null
          embargo_until: string
          id?: string
          notes?: string | null
          region?: string[] | null
          released_at?: string | null
          released_to_article_id?: string | null
          source_id?: string | null
          source_url: string
        }
        Update: {
          candidate_title?: string
          created_at?: string | null
          embargo_until?: string
          id?: string
          notes?: string | null
          region?: string[] | null
          released_at?: string | null
          released_to_article_id?: string | null
          source_id?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "embargo_holds_released_to_article_id_fkey"
            columns: ["released_to_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      lexicon: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          ipa: string | null
          notes: string | null
          spoken: string | null
          ssml: string | null
          term: string
          type: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          ipa?: string | null
          notes?: string | null
          spoken?: string | null
          ssml?: string | null
          term: string
          type: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          ipa?: string | null
          notes?: string | null
          spoken?: string | null
          ssml?: string | null
          term?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lexicon_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      lexicon_proposals: {
        Row: {
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          id: string
          proposed_by: string | null
          proposed_ipa: string | null
          proposed_spoken: string | null
          status: string
          term: string
        }
        Insert: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          proposed_by?: string | null
          proposed_ipa?: string | null
          proposed_spoken?: string | null
          status?: string
          term: string
        }
        Update: {
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          proposed_by?: string | null
          proposed_ipa?: string | null
          proposed_spoken?: string | null
          status?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "lexicon_proposals_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_reviewers: {
        Row: {
          active: boolean | null
          email: string
          id: string
          name: string
          onboarded_at: string | null
          role: string
        }
        Insert: {
          active?: boolean | null
          email: string
          id?: string
          name: string
          onboarded_at?: string | null
          role: string
        }
        Update: {
          active?: boolean | null
          email?: string
          id?: string
          name?: string
          onboarded_at?: string | null
          role?: string
        }
        Relationships: []
      }
      revocations: {
        Row: {
          article_id: string | null
          audio_job_id: string | null
          cdn_purge_at: string | null
          created_at: string | null
          id: string
          reason: string
          rss_regenerated_at: string | null
          triggered_by: string | null
        }
        Insert: {
          article_id?: string | null
          audio_job_id?: string | null
          cdn_purge_at?: string | null
          created_at?: string | null
          id?: string
          reason: string
          rss_regenerated_at?: string | null
          triggered_by?: string | null
        }
        Update: {
          article_id?: string | null
          audio_job_id?: string | null
          cdn_purge_at?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          rss_regenerated_at?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revocations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revocations_audio_job_id_fkey"
            columns: ["audio_job_id"]
            isOneToOne: false
            referencedRelation: "audio_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revocations_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "qa_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      source_health: {
        Row: {
          error: string | null
          fetched_at: string | null
          id: string
          items_returned: number | null
          latency_ms: number | null
          source_id: string | null
          status_code: number | null
        }
        Insert: {
          error?: string | null
          fetched_at?: string | null
          id?: string
          items_returned?: number | null
          latency_ms?: number | null
          source_id?: string | null
          status_code?: number | null
        }
        Update: {
          error?: string | null
          fetched_at?: string | null
          id?: string
          items_returned?: number | null
          latency_ms?: number | null
          source_id?: string | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "source_health_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          active: boolean | null
          api_endpoint: string | null
          category: string
          feed_url: string | null
          id: string
          last_fetched_at: string | null
          last_status: number | null
          name: string
          notes: string | null
          region: string
          slug: string
        }
        Insert: {
          active?: boolean | null
          api_endpoint?: string | null
          category: string
          feed_url?: string | null
          id?: string
          last_fetched_at?: string | null
          last_status?: number | null
          name: string
          notes?: string | null
          region: string
          slug: string
        }
        Update: {
          active?: boolean | null
          api_endpoint?: string | null
          category?: string
          feed_url?: string | null
          id?: string
          last_fetched_at?: string | null
          last_status?: number | null
          name?: string
          notes?: string | null
          region?: string
          slug?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          beehiiv_subscription_id: string | null
          bounced_at: string | null
          complained_at: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          region: string
          signup_source: string | null
          status: string
          tier_prefs: string[] | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          beehiiv_subscription_id?: string | null
          bounced_at?: string | null
          complained_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          region?: string
          signup_source?: string | null
          status?: string
          tier_prefs?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          beehiiv_subscription_id?: string | null
          bounced_at?: string | null
          complained_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          region?: string
          signup_source?: string | null
          status?: string
          tier_prefs?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      subscriber_count: {
        Row: {
          total: number | null
        }
        Relationships: []
      }
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


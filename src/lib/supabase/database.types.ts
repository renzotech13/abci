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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          admin_name: string
          details: string | null
          id: string
          target: string | null
          timestamp: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_name: string
          details?: string | null
          id?: string
          target?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_name?: string
          details?: string | null
          id?: string
          target?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affixes: {
        Row: {
          affix_code: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
          owner_name: string
          specialty: string | null
          status: string
        }
        Insert: {
          affix_code: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          owner_name: string
          specialty?: string | null
          status?: string
        }
        Update: {
          affix_code?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          owner_name?: string
          specialty?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affixes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          body: string
          cover: string | null
          created_at: string
          date: string
          excerpt: string | null
          id: string
          read_time: number
          slug: string
          tags: string[]
          title: string
        }
        Insert: {
          author: string
          body: string
          cover?: string | null
          created_at?: string
          date: string
          excerpt?: string | null
          id?: string
          read_time?: number
          slug: string
          tags?: string[]
          title: string
        }
        Update: {
          author?: string
          body?: string
          cover?: string | null
          created_at?: string
          date?: string
          excerpt?: string | null
          id?: string
          read_time?: number
          slug?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      dog_legacy_contacts: {
        Row: {
          created_at: string
          dni: string | null
          dog_id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          dni?: string | null
          dog_id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          dni?: string | null
          dog_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dog_legacy_contacts_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: true
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          breed: string
          breeder_name: string | null
          call_name: string | null
          certificate_id: string
          color: string | null
          created_at: string
          dam_cert: string | null
          dam_color: string | null
          dam_id: string | null
          dam_name: string | null
          dob: string | null
          gender: string
          grandparents: Json | null
          has_photo: boolean | null
          height: number | null
          id: string
          kennel_name: string | null
          location: string | null
          microchip: string | null
          name: string
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          photo_url: string | null
          registration_date: string
          sire_cert: string | null
          sire_color: string | null
          sire_id: string | null
          sire_name: string | null
          source: string
          status: string
          titles: string[] | null
          updated_at: string
          variant: string | null
          weight: number | null
        }
        Insert: {
          breed?: string
          breeder_name?: string | null
          call_name?: string | null
          certificate_id: string
          color?: string | null
          created_at?: string
          dam_cert?: string | null
          dam_color?: string | null
          dam_id?: string | null
          dam_name?: string | null
          dob?: string | null
          gender: string
          grandparents?: Json | null
          has_photo?: boolean | null
          height?: number | null
          id?: string
          kennel_name?: string | null
          location?: string | null
          microchip?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photo_url?: string | null
          registration_date?: string
          sire_cert?: string | null
          sire_color?: string | null
          sire_id?: string | null
          sire_name?: string | null
          source?: string
          status?: string
          titles?: string[] | null
          updated_at?: string
          variant?: string | null
          weight?: number | null
        }
        Update: {
          breed?: string
          breeder_name?: string | null
          call_name?: string | null
          certificate_id?: string
          color?: string | null
          created_at?: string
          dam_cert?: string | null
          dam_color?: string | null
          dam_id?: string | null
          dam_name?: string | null
          dob?: string | null
          gender?: string
          grandparents?: Json | null
          has_photo?: boolean | null
          height?: number | null
          id?: string
          kennel_name?: string | null
          location?: string | null
          microchip?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photo_url?: string | null
          registration_date?: string
          sire_cert?: string | null
          sire_color?: string | null
          sire_id?: string | null
          sire_name?: string | null
          source?: string
          status?: string
          titles?: string[] | null
          updated_at?: string
          variant?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dogs_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          location: string | null
          title: string
          type: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          title: string
          type: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          attachment_url: string | null
          created_at: string
          date: string
          dog_id: string
          id: string
          notes: string | null
          title: string
          type: string
          vet: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          date: string
          dog_id: string
          id?: string
          notes?: string | null
          title: string
          type: string
          vet?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
          notes?: string | null
          title?: string
          type?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      litters: {
        Row: {
          birth_date: string
          created_at: string
          dam_id: string | null
          id: string
          notes: string | null
          owner_id: string
          puppy_ids: string[]
          sire_id: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string
          dam_id?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          puppy_ids?: string[]
          sire_id?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string
          dam_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          puppy_ids?: string[]
          sire_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "litters_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "litters_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "litters_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          currency: string
          description: string | null
          id: string
          image: string | null
          location: string | null
          pedigree_id: string | null
          posted: string
          price: number
          seller_id: string
          seller_name: string
          title: string
          type: string
        }
        Insert: {
          currency?: string
          description?: string | null
          id?: string
          image?: string | null
          location?: string | null
          pedigree_id?: string | null
          posted?: string
          price: number
          seller_id: string
          seller_name: string
          title: string
          type: string
        }
        Update: {
          currency?: string
          description?: string | null
          id?: string
          image?: string | null
          location?: string | null
          pedigree_id?: string | null
          posted?: string
          price?: number
          seller_id?: string
          seller_name?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_pedigree_id_fkey"
            columns: ["pedigree_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          affix: string | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          kennel_name: string | null
          membership: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          affix?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email: string
          id: string
          kennel_name?: string | null
          membership?: string
          name: string
          phone?: string | null
          role?: string
        }
        Update: {
          affix?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          kennel_name?: string | null
          membership?: string
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          completed_at: string | null
          dog_id: string
          from_user_id: string
          id: string
          notes: string | null
          requested_at: string
          status: string
          to_email: string
        }
        Insert: {
          completed_at?: string | null
          dog_id: string
          from_user_id: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          to_email: string
        }
        Update: {
          completed_at?: string | null
          dog_id?: string
          from_user_id?: string
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      kennels: {
        Row: {
          breeder_name: string | null
          dog_count: number | null
          kennel_name: string | null
          location: string | null
          owner_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_certificate_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          conversation_id: string
          first_request: boolean | null
          last_updated: string
          messages: Json[] | null
          patient_id: string
          patient_last_read: string
          provider_id: string
          provider_last_read: string | null
        }
        Insert: {
          conversation_id?: string
          first_request?: boolean | null
          last_updated?: string
          messages?: Json[] | null
          patient_id: string
          patient_last_read?: string
          provider_id: string
          provider_last_read?: string | null
        }
        Update: {
          conversation_id?: string
          first_request?: boolean | null
          last_updated?: string
          messages?: Json[] | null
          patient_id?: string
          patient_last_read?: string
          provider_id?: string
          provider_last_read?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: number
          message: string
          order: number
          sender_id: string
          time: string
        }
        Insert: {
          conversation_id?: number
          message: string
          order?: number
          sender_id: string
          time: string
        }
        Update: {
          conversation_id?: number
          message?: string
          order?: number
          sender_id?: string
          time?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          date_of_birth: string | null
          first_name: string
          health_data: Json | null
          id: string
          insurance: string | null
          last_name: string | null
          location: string | null
        }
        Insert: {
          date_of_birth?: string | null
          first_name: string
          health_data?: Json | null
          id: string
          insurance?: string | null
          last_name?: string | null
          location?: string | null
        }
        Update: {
          date_of_birth?: string | null
          first_name?: string
          health_data?: Json | null
          id?: string
          insurance?: string | null
          last_name?: string | null
          location?: string | null
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          bio: string | null
          education: string | null
          first_name: string
          id: string
          last_name: string | null
          profile_picture: string | null
          specialties: string[] | null
          states: string[] | null
        }
        Insert: {
          bio?: string | null
          education?: string | null
          first_name: string
          id: string
          last_name?: string | null
          profile_picture?: string | null
          specialties?: string[] | null
          states?: string[] | null
        }
        Update: {
          bio?: string | null
          education?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          profile_picture?: string | null
          specialties?: string[] | null
          states?: string[] | null
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never


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
      bloques_guardia_civil: {
        Row: {
          bloque_nombre: string
          bloque_numero: number
          created_at: string
          id: string
          tema_codigo: string
          tema_nombre: string
          tema_numero: number
        }
        Insert: {
          bloque_nombre: string
          bloque_numero: number
          created_at?: string
          id?: string
          tema_codigo: string
          tema_nombre: string
          tema_numero: number
        }
        Update: {
          bloque_nombre?: string
          bloque_numero?: number
          created_at?: string
          id?: string
          tema_codigo?: string
          tema_nombre?: string
          tema_numero?: number
        }
        Relationships: []
      }
      mentoria: {
        Row: {
          created_at: string
          fallos: number
          id: string
          justificacion: string
          pregunta_id: string
          pregunta_texto: string
          updated_at: string
          user_id: string | null
          ya_enviado: boolean
        }
        Insert: {
          created_at?: string
          fallos?: number
          id?: string
          justificacion: string
          pregunta_id: string
          pregunta_texto: string
          updated_at?: string
          user_id?: string | null
          ya_enviado?: boolean
        }
        Update: {
          created_at?: string
          fallos?: number
          id?: string
          justificacion?: string
          pregunta_id?: string
          pregunta_texto?: string
          updated_at?: string
          user_id?: string | null
          ya_enviado?: boolean
        }
        Relationships: []
      }
      preguntas: {
        Row: {
          area: string
          bloque: string | null
          created_at: string
          id: string
          justificacion: string
          nivel: string | null
          opciones: Json
          pregunta: string
          respuesta_correcta: string
          tema: string
          titulo: string
          updated_at: string
        }
        Insert: {
          area: string
          bloque?: string | null
          created_at?: string
          id?: string
          justificacion: string
          nivel?: string | null
          opciones: Json
          pregunta: string
          respuesta_correcta: string
          tema: string
          titulo: string
          updated_at?: string
        }
        Update: {
          area?: string
          bloque?: string | null
          created_at?: string
          id?: string
          justificacion?: string
          nivel?: string | null
          opciones?: Json
          pregunta?: string
          respuesta_correcta?: string
          tema?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      respuestas_usuario: {
        Row: {
          acertada: boolean
          area: string
          created_at: string
          fecha_respuesta: string
          id: string
          origen: string
          pregunta_id: string
          subtema: string | null
          tema: string
          tiempo_respuesta: number | null
          user_id: string | null
        }
        Insert: {
          acertada: boolean
          area: string
          created_at?: string
          fecha_respuesta?: string
          id?: string
          origen?: string
          pregunta_id: string
          subtema?: string | null
          tema: string
          tiempo_respuesta?: number | null
          user_id?: string | null
        }
        Update: {
          acertada?: boolean
          area?: string
          created_at?: string
          fecha_respuesta?: string
          id?: string
          origen?: string
          pregunta_id?: string
          subtema?: string | null
          tema?: string
          tiempo_respuesta?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      resultados_tests: {
        Row: {
          acierto: boolean | null
          area: string
          bloque: string | null
          created_at: string
          fecha_test: string
          id: string
          porcentaje_acierto: number
          respuestas_correctas: number
          respuestas_incorrectas: number
          tema: string
          total_preguntas: number
          user_id: string | null
        }
        Insert: {
          acierto?: boolean | null
          area: string
          bloque?: string | null
          created_at?: string
          fecha_test?: string
          id?: string
          porcentaje_acierto: number
          respuestas_correctas: number
          respuestas_incorrectas: number
          tema: string
          total_preguntas: number
          user_id?: string | null
        }
        Update: {
          acierto?: boolean | null
          area?: string
          bloque?: string | null
          created_at?: string
          fecha_test?: string
          id?: string
          porcentaje_acierto?: number
          respuestas_correctas?: number
          respuestas_incorrectas?: number
          tema?: string
          total_preguntas?: number
          user_id?: string | null
        }
        Relationships: []
      }
      transcriptions: {
        Row: {
          created_at: string
          duration: string | null
          id: string
          source: string | null
          title: string
          transcript: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: string
          source?: string | null
          title: string
          transcript: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: string
          source?: string | null
          title?: string
          transcript?: string
          video_id?: string | null
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

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
      users: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          role: 'user' | 'admin'
          kyc_status: 'none' | 'pending' | 'approved' | 'failed'
          plan_tier: 'free' | 'pro' | 'pro_plus'
          plan_status: 'inactive' | 'active' | 'past_due' | 'canceled'
          plan_renews_at: string | null
          daily_quota_used: number
          weekly_quota_used: number
          quota_reset_daily_at: string | null
          quota_reset_weekly_at: string | null
          ia_upgrade: boolean
          ia_upgrade_at: string | null
          approval_rate: number | null
          avg_eval_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          role?: 'user' | 'admin'
          kyc_status?: 'none' | 'pending' | 'approved' | 'failed'
          plan_tier?: 'free' | 'pro' | 'pro_plus'
          plan_status?: 'inactive' | 'active' | 'past_due' | 'canceled'
          plan_renews_at?: string | null
          daily_quota_used?: number
          weekly_quota_used?: number
          quota_reset_daily_at?: string | null
          quota_reset_weekly_at?: string | null
          ia_upgrade?: boolean
          ia_upgrade_at?: string | null
          approval_rate?: number | null
          avg_eval_time_seconds?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      points_ledger: {
        Row: {
          id: string
          user_id: string
          type: 'evaluation_reward' | 'mission_bonus' | 'adjustment' | 'reversal'
          ref_id: string | null
          points: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'evaluation_reward' | 'mission_bonus' | 'adjustment' | 'reversal'
          ref_id?: string | null
          points: number
          note?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['points_ledger']['Insert']>
      }
      missions: {
        Row: {
          id: string
          code: string
          title: string
          description: string
          target: number
          bonus_points: number
          active: boolean
        }
        Insert: {
          id?: string
          code: string
          title: string
          description: string
          target: number
          bonus_points: number
          active?: boolean
        }
        Update: Partial<Database['public']['Tables']['missions']['Insert']>
      }
      user_missions: {
        Row: {
          id: string
          user_id: string
          mission_id: string
          progress_current: number
          progress_target: number
          status: 'open' | 'completed'
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: string
          progress_current?: number
          progress_target: number
          status?: 'open' | 'completed'
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_missions']['Insert']>
      }
    }
    Functions: {
      can_start_evaluation: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
  }
}

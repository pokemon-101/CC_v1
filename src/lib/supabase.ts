import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || ''

// Create a mock client if credentials are missing
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials - using mock client for development')
  // Create a mock client that won't crash the app
  supabase = {
    from: () => ({
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Database types for TypeScript
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface SpotifyAccount {
  id: string
  user_id: string
  spotify_user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  display_name: string
  email: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  spotify_id?: string
  apple_music_id?: string
  name: string
  description?: string
  image_url?: string
  track_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Friend {
  id: string
  user_id: string
  friend_user_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

// Database service functions
export class DatabaseService {
  // Check if Supabase is properly configured
  static isConfigured(): boolean {
    return !!(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  }

  // User operations
  static async createUser(userData: Partial<User>) {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured - skipping database operation')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserById(id: string) {
    if (!this.isConfigured()) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserByEmail(email: string) {
    if (!this.isConfigured()) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Spotify account operations
  static async saveSpotifyAccount(accountData: Partial<SpotifyAccount>) {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured - skipping Spotify account save')
      return null
    }

    const { data, error } = await supabase
      .from('spotify_accounts')
      .upsert(accountData, { onConflict: 'user_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getSpotifyAccount(userId: string) {
    if (!this.isConfigured()) return null

    const { data, error } = await supabase
      .from('spotify_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async deleteSpotifyAccount(userId: string) {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured - skipping Spotify account deletion')
      return
    }

    const { error } = await supabase
      .from('spotify_accounts')
      .delete()
      .eq('user_id', userId)
    
    if (error) throw error
  }

  // Playlist operations
  static async getUserPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async savePlaylist(playlistData: Partial<Playlist>) {
    const { data, error } = await supabase
      .from('playlists')
      .upsert(playlistData, { onConflict: 'spotify_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Friend operations
  static async getUserFriends(userId: string) {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:users!friends_friend_user_id_fkey(id, name, email)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
    
    if (error) throw error
    return data
  }

  static async sendFriendRequest(userId: string, friendUserId: string) {
    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: userId,
        friend_user_id: friendUserId,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async acceptFriendRequest(userId: string, friendUserId: string) {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', friendUserId)
      .eq('friend_user_id', userId)
    
    if (error) throw error

    // Create reciprocal friendship
    const { data, error: reciprocalError } = await supabase
      .from('friends')
      .insert({
        user_id: userId,
        friend_user_id: friendUserId,
        status: 'accepted'
      })
      .select()
      .single()
    
    if (reciprocalError) throw reciprocalError
    return data
  }
}
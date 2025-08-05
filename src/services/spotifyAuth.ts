// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || ''

// Debug logging
console.log('Spotify Config Debug:', {
  clientId: SPOTIFY_CLIENT_ID,
  redirectUri: SPOTIFY_REDIRECT_URI,
  env: import.meta.env
})
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify'
].join(' ')

// Generate random string for state parameter
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

// Generate code verifier for PKCE
function generateCodeVerifier(): string {
  return generateRandomString(128)
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export class SpotifyAuthService {
  private static instance: SpotifyAuthService
  private codeVerifier: string | null = null

  static getInstance(): SpotifyAuthService {
    if (!SpotifyAuthService.instance) {
      SpotifyAuthService.instance = new SpotifyAuthService()
    }
    return SpotifyAuthService.instance
  }

  // Initiate Spotify OAuth flow
  async initiateAuth(): Promise<void> {
    // Get fresh environment variables
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
    
    console.log('Auth Debug:', { clientId, redirectUri })
    
    if (!clientId || !redirectUri) {
      console.error('Missing Spotify configuration:', { clientId, redirectUri })
      alert('Spotify configuration is missing. Please check environment variables.')
      return
    }

    const state = generateRandomString(16)
    this.codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(this.codeVerifier)

    // Store state and code verifier in localStorage for later verification
    localStorage.setItem('spotify_auth_state', state)
    localStorage.setItem('spotify_code_verifier', this.codeVerifier)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: SPOTIFY_SCOPES,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log('Generated auth URL:', authUrl)
    window.location.href = authUrl
  }

  // Handle callback from Spotify
  async handleCallback(code: string, state: string): Promise<any> {
    const storedState = localStorage.getItem('spotify_auth_state')
    const storedCodeVerifier = localStorage.getItem('spotify_code_verifier')

    if (state !== storedState) {
      throw new Error('State parameter mismatch')
    }

    if (!storedCodeVerifier) {
      throw new Error('Code verifier not found')
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: storedCodeVerifier,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await response.json()

      // Store tokens securely
      localStorage.setItem('spotify_access_token', tokenData.access_token)
      localStorage.setItem('spotify_refresh_token', tokenData.refresh_token)
      localStorage.setItem('spotify_token_expires_at', 
        (Date.now() + tokenData.expires_in * 1000).toString()
      )

      // Clean up temporary storage
      localStorage.removeItem('spotify_auth_state')
      localStorage.removeItem('spotify_code_verifier')

      // Get user profile
      const userProfile = await this.getUserProfile(tokenData.access_token)
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
        user: userProfile
      }
    } catch (error) {
      console.error('Spotify auth error:', error)
      throw error
    }
  }

  // Get user profile from Spotify
  async getUserProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user profile')
    }

    return response.json()
  }

  // Check if user is connected to Spotify
  isConnected(): boolean {
    const token = localStorage.getItem('spotify_access_token')
    const expiresAt = localStorage.getItem('spotify_token_expires_at')
    
    if (!token || !expiresAt) {
      return false
    }

    return Date.now() < parseInt(expiresAt)
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (!this.isConnected()) {
      return null
    }
    return localStorage.getItem('spotify_access_token')
  }

  // Disconnect from Spotify
  disconnect(): void {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expires_at')
  }
}
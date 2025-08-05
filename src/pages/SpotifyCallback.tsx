import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { SpotifyAuthService } from '../services/spotifyAuth'
import { DatabaseService } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SpotifyCallbackProps {
  onComplete: () => void
}

export function SpotifyCallback({ onComplete }: SpotifyCallbackProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(`Spotify authorization error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter')
        }

        const spotifyAuth = SpotifyAuthService.getInstance()
        const result = await spotifyAuth.handleCallback(code, state)

        // Save Spotify account to database if user is logged in and database is configured
        if (user && result.user && DatabaseService.isConfigured()) {
          try {
            await DatabaseService.saveSpotifyAccount({
              user_id: user.id,
              spotify_user_id: result.user.id,
              access_token: result.accessToken,
              refresh_token: result.refreshToken,
              expires_at: new Date(result.expiresAt).toISOString(),
              display_name: result.user.display_name,
              email: result.user.email,
              image_url: result.user.images?.[0]?.url
            })
            console.log('Spotify account saved to database')
          } catch (dbError) {
            console.error('Error saving Spotify account to database:', dbError)
            // Continue anyway - local storage still works
          }
        } else if (!DatabaseService.isConfigured()) {
          console.log('Database not configured - Spotify connection saved locally only')
        }

        console.log('Spotify connection successful:', result.user)
        setStatus('success')

        // Redirect back to link accounts page after 2 seconds
        setTimeout(() => {
          onComplete()
        }, 2000)

      } catch (err) {
        console.error('Spotify callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connecting to Spotify...
              </h2>
              <p className="text-gray-300">
                Please wait while we securely connect your Spotify account.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Successfully Connected!
              </h2>
              <p className="text-gray-300 mb-4">
                Your Spotify account has been linked to ChordCircle.
              </p>
              <p className="text-sm text-gray-400">
                Redirecting you back to the app...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connection Failed
              </h2>
              <p className="text-gray-300 mb-6">
                {error || 'Failed to connect your Spotify account. Please try again.'}
              </p>
              <button
                onClick={onComplete}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Back to Link Accounts
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
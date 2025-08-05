import { useState, useEffect } from 'react'
import { Music, ExternalLink, Clock, CheckCircle, AlertCircle, User, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SpotifyAuthService } from '../services/spotifyAuth'
import { DatabaseService } from '../lib/supabase'

interface LinkAccountProps {
  onBack: () => void
  onAuthClick: () => void
}

export function LinkAccount({ onBack, onAuthClick }: LinkAccountProps) {
  const { user } = useAuth()
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const spotifyAuth = SpotifyAuthService.getInstance()

  // Check if Spotify is already connected on component mount
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      if (user) {
        try {
          // Try database first, fallback to local storage
          const spotifyAccount = await DatabaseService.getSpotifyAccount(user.id)
          setSpotifyConnected(!!spotifyAccount || spotifyAuth.isConnected())
        } catch (error) {
          console.error('Error checking Spotify connection:', error)
          // Fallback to local storage check
          setSpotifyConnected(spotifyAuth.isConnected())
        }
      }
    }
    
    checkSpotifyConnection()
  }, [user])

  const handleSpotifyConnect = async () => {
    try {
      setIsConnecting(true)
      await spotifyAuth.initiateAuth()
    } catch (error) {
      console.error('Failed to initiate Spotify auth:', error)
      setIsConnecting(false)
    }
  }

  const handleSpotifyDisconnect = async () => {
    try {
      if (user) {
        await DatabaseService.deleteSpotifyAccount(user.id)
      }
      spotifyAuth.disconnect()
      setSpotifyConnected(false)
    } catch (error) {
      console.error('Error disconnecting Spotify:', error)
    }
  }

  const platforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Connect your Spotify account to sync playlists and discover music',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: Music,
      available: true,
      connected: spotifyConnected,
      isConnecting: isConnecting,
      action: handleSpotifyConnect
    },
    {
      id: 'apple',
      name: 'Apple Music',
      description: 'Apple Music integration coming soon with full playlist sync',
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      icon: Music,
      available: false,
      connected: false,
      isConnecting: false,
      action: () => {}
    }
  ]

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={onBack}
              className="inline-flex items-center text-green-400 hover:text-green-300 mb-6 transition-colors"
            >
              ← Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Link Your Music Accounts
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect your music streaming accounts to start syncing playlists and sharing music with friends
            </p>
          </div>

          {/* Authentication Required */}
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Sign In Required
              </h2>
              
              <p className="text-lg text-gray-300 mb-8">
                You need to create an account or sign in to ChordCircle before linking your music streaming accounts.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={onAuthClick}
                  className="w-full bg-green-500 text-white px-8 py-4 rounded-lg text-lg hover:bg-green-600 transition-colors transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In / Sign Up</span>
                </button>
                
                <p className="text-sm text-gray-400">
                  Already have an account? The same button works for both sign in and sign up!
                </p>
              </div>

              {/* Benefits */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Why create an account?
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Secure Storage</h4>
                      <p className="text-sm text-gray-300">Your linked accounts and playlists are safely stored</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Cross-Device Sync</h4>
                      <p className="text-sm text-gray-300">Access your music from any device, anywhere</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Friend Connections</h4>
                      <p className="text-sm text-gray-300">Share and discover music with your friends</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Playlist Management</h4>
                      <p className="text-sm text-gray-300">Organize and sync playlists across platforms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-6 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Link Your Music Accounts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome back, {user.name}! Connect your music streaming accounts to start syncing playlists and sharing music with friends
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300"
            >
              {/* Platform Icon */}
              <div className={`w-20 h-20 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <platform.icon className="w-10 h-10 text-white" />
              </div>

              {/* Platform Info */}
              <h3 className="text-2xl font-bold text-white mb-4">
                {platform.name}
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                {platform.description}
              </p>

              {/* Connection Status & Action */}
              {platform.available ? (
                <div className="space-y-4">
                  {platform.connected ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Connected Successfully!</span>
                    </div>
                  ) : null}
                  
                  {platform.connected ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className={`w-full ${platform.color} text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 opacity-75`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Connected</span>
                      </button>
                      <button
                        onClick={platform.id === 'spotify' ? handleSpotifyDisconnect : undefined}
                        className="w-full border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={platform.action}
                      disabled={platform.isConnecting}
                      className={`w-full ${platform.color} ${platform.hoverColor} text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
                    >
                      {platform.isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          <span>Link Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-4">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Coming Soon</span>
                  </div>
                  
                  <button
                    disabled
                    className="w-full bg-gray-500 text-white px-6 py-4 rounded-lg font-semibold opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Feature Coming Soon</span>
                  </button>
                </div>
              )}

              {/* Additional Info */}
              {platform.available && (
                <div className="mt-6 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Secure OAuth 2.0 authentication</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            What happens when you connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Secure Access</h3>
              <p className="text-sm">We only access your public playlists and basic profile info</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Playlist Sync</h3>
              <p className="text-sm">Your playlists will be available across all connected platforms</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Easy Management</h3>
              <p className="text-sm">Disconnect anytime from your profile settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
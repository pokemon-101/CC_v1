import { useState, useEffect } from 'react'
import { Music, Link, Shuffle, UserPlus } from 'lucide-react'

interface HomePageProps {
  onGetStarted: () => void
  onPageChange?: (page: string) => void
}

export function HomePage({ onGetStarted, onPageChange }: HomePageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const mainFeatures = [
    {
      icon: Link,
      title: 'Link Accounts',
      description: 'Connect your Spotify and Apple Music accounts in one secure place',
      action: 'Link Now',
      onClick: () => onPageChange?.('link-account')
    },
    {
      icon: Shuffle,
      title: 'Sync Playlists',
      description: 'Automatically sync your playlists across all connected platforms',
      action: 'Start Sync',
      onClick: () => onGetStarted()
    },
    {
      icon: UserPlus,
      title: 'Add Friends',
      description: 'Connect with friends and share your favorite music discoveries',
      action: 'Find Friends',
      onClick: () => onGetStarted()
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Connect Your{' '}
              <span className="gradient-text">Music</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Seamlessly sync and share your music across Spotify and Apple Music. 
              Discover new tracks with friends and never lose your favorite playlists again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="bg-green-500 text-white px-12 py-4 rounded-lg text-lg hover:bg-green-600 transition-colors transform hover:scale-105"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect, sync, and share your music with friends across all platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass rounded-2xl p-8 text-center hover:scale-105 transition-all duration-500 opacity-0 translate-y-8 ${
                  isLoaded ? 'animate-fade-in-up' : ''
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 text-lg">
                  {feature.description}
                </p>
                <button 
                  onClick={feature.onClick}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105 font-semibold"
                >
                  {feature.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`glass rounded-3xl p-12 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Connect?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of music lovers who have already connected their accounts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="bg-green-500 text-white px-12 py-4 rounded-lg text-lg hover:bg-green-600 transition-colors transform hover:scale-105"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ChordCircle</span>
          </div>
          <p className="text-gray-400">
            © 2025 ChordCircle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
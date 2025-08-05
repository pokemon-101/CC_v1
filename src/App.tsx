import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { AccountProvider } from './contexts/AccountContext'
import { Header } from './components/Header'
import { AuthModal } from './components/AuthModal'
import { Dashboard } from './pages/Dashboard'
import { LinkAccount } from './pages/LinkAccount'
import { HomePage } from './pages/HomePage'
import { Playlists } from './pages/Playlists'
import { Friends } from './pages/Friends'
import { Profile } from './pages/Profile'
import { SpotifyCallback } from './pages/SpotifyCallback'


function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Check if this is a Spotify callback
  const isSpotifyCallback = window.location.pathname === '/callback/spotify' || 
                           window.location.search.includes('code=')

  const renderPage = () => {
    // Handle Spotify callback
    if (isSpotifyCallback) {
      return <SpotifyCallback onComplete={() => {
        // Clear URL parameters and redirect to link-account page
        window.history.replaceState({}, document.title, window.location.pathname.split('?')[0])
        setCurrentPage('link-account')
      }} />
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'playlists':
        return <Playlists />
      case 'friends':
        return <Friends />
      case 'profile':
        return <Profile />
      case 'link-account':
        return <LinkAccount 
          onBack={() => setCurrentPage('home')} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
      default:
        return <HomePage 
          onGetStarted={() => setAuthModalOpen(true)}
          onPageChange={setCurrentPage}
        />
    }
  }

  return (
    <AuthProvider>
      <AccountProvider>
        <div className="min-h-screen">
          <Header
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onAuthClick={() => setAuthModalOpen(true)}
          />
          
          {renderPage()}

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        </div>
      </AccountProvider>
    </AuthProvider>
  )
}

export default App
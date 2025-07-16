import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import './App.css'

// Services
import web3Service from './services/web3Service'

// Components
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedProjects from './components/FeaturedProjects'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import Footer from './components/Footer'
import {
  ProjectsPage,
  CharitiesPage,
  ProjectDetail,
  CharityDetail,
  Dashboard
} from './components/PlaceholderPages'
import AuthModal from './components/AuthModal'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [walletBalance, setWalletBalance] = useState('0')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }

    const initWallet = async () => {
      const isConnected = await web3Service.initialize()
      if (isConnected) {
        const bal = await web3Service.getBalance()
        setWalletBalance(bal)
        setUser({
          account: web3Service.account,
          network: web3Service.getNetworkName()
        })
      }
    }

    initWallet()
  }, [])

  const handleWalletConnect = async () => {
    try {
      const result = await web3Service.connectWallet()
      const bal = await web3Service.getBalance()
      setWalletBalance(bal)
      setUser({
        account: result.account,
        network: web3Service.getNetworkName()
      })
    } catch (error) {
      alert('MetaMask connection failed.')
      console.error(error)
    }
  }

  const handleLogout = () => {
    web3Service.disconnect()
    setUser(null)
    setWalletBalance('0')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Header 
          user={user}
          walletBalance={walletBalance}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onWalletConnect={handleWalletConnect}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main>
          <Routes>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Hero onGetStarted={() => setIsAuthModalOpen(true)} />
                <Stats />
                <FeaturedProjects />
                <HowItWorks />
              </motion.div>
            } />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/charities" element={<CharitiesPage />} />
            <Route path="/charities/:id" element={<CharityDetail />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          </Routes>
        </main>

        <Footer />

        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={setUser}
        />
      </div>
    </Router>
  )
}

export default App

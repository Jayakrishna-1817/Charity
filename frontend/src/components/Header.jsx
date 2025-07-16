import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Heart, Menu, X, Sun, Moon, Wallet,
  User, LogOut, Settings, Copy, ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import web3Service from '../services/web3Service'

const Header = ({ user, onAuthClick, onLogout, darkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('0')
  const [networkName, setNetworkName] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Charities', href: '/charities' },
    // { name: 'How it Works', href: '/#how-it-works' },
  ]

  useEffect(() => {
    initializeWeb3()
  }, [])

  const initializeWeb3 = async () => {
    try {
      const wasDisconnected = localStorage.getItem('walletDisconnected') === 'true'
      if (wasDisconnected) {
        setWalletConnected(false)
        return
      }

      const initialized = await web3Service.initialize()
      if (initialized && web3Service.isConnected) {
        setWalletConnected(true)
        setWalletAddress(web3Service.account)
        updateWalletInfo()
      }
    } catch (error) {
      console.error('Web3 initialization error:', error)
    }
  }

  const updateWalletInfo = async () => {
    try {
      if (web3Service.isConnected) {
        const balance = await web3Service.getBalance()
        setWalletBalance(parseFloat(balance).toFixed(4))
        setNetworkName(web3Service.getNetworkName())
      }
    } catch (error) {
      console.error('Error updating wallet info:', error)
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      const connection = await web3Service.connectWallet()

      localStorage.removeItem('walletDisconnected')
      setWalletConnected(true)
      setWalletAddress(connection.account)
      await updateWalletInfo()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    web3Service.disconnect()
    localStorage.setItem('walletDisconnected', 'true')
    setWalletConnected(false)
    setWalletAddress('')
    setWalletBalance('0')
    setNetworkName('')
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const openInExplorer = () => {
    const explorerUrls = {
      '0x1': 'https://etherscan.io',
      '0x5': 'https://goerli.etherscan.io',
      '0x89': 'https://polygonscan.com',
      '0x13881': 'https://mumbai.polygonscan.com',
      '0x7A69': '#'
    }
    const baseUrl = explorerUrls[web3Service.chainId] || 'https://etherscan.io'
    if (baseUrl !== '#') {
      window.open(`${baseUrl}/address/${walletAddress}`, '_blank')
    }
  }

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2">
              <div className="relative">
                <Heart className="h-8 w-8 text-primary fill-current" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                CharityChain
              </span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {walletConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden lg:inline">
                      {web3Service.formatAddress(walletAddress)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {walletBalance} ETH
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-2">
                    <div className="text-sm font-medium">Connected Wallet</div>
                    <div className="text-xs text-muted-foreground mt-1">{networkName}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openInExplorer} className="cursor-pointer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Explorer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={connectWallet} disabled={isConnecting} className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
            )}

            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                {walletConnected ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Wallet: {web3Service.formatAddress(walletAddress)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {walletBalance} ETH • {networkName}
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectWallet} className="w-full">
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={connectWallet} disabled={isConnecting} className="w-full flex items-center justify-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </Button>
                )}

                {user && (
                  <Button onClick={onLogout} variant="outline" className="w-full">
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

export default Header
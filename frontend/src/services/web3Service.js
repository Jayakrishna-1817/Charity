// src/services/web3Service.js
import { ethers } from 'ethers'

class Web3Service {
  constructor() {
    this.provider = null
    this.signer = null
    this.account = ''
    this.chainId = ''
    this.isConnected = false
  }

  async initialize() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await this.provider.send('eth_accounts', [])
      if (accounts.length > 0) {
        this.signer = await this.provider.getSigner()
        this.account = accounts[0]
        const network = await this.provider.getNetwork()
        this.chainId = network.chainId.toString()
        this.isConnected = true
        return true
      }
    }
    return false
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await this.provider.send('eth_requestAccounts', [])
    this.signer = await this.provider.getSigner()
    this.account = accounts[0]
    const network = await this.provider.getNetwork()
    this.chainId = network.chainId.toString()
    this.isConnected = true
    return { account: this.account, chainId: this.chainId }
  }

  async donate(amountInEth, toAddress) {
    if (!this.signer) {
      await this.connectWallet()
    }

    const tx = await this.signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amountInEth.toString())
    })

    return tx
  }

  async getBalance() {
    if (!this.signer) return '0'
    const balance = await this.signer.getBalance()
    return ethers.formatEther(balance)
  }

  getNetworkName() {
    const chainNames = {
      '1': 'Ethereum Mainnet',
      '5': 'Goerli Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Mumbai Testnet',
      '31337': 'Localhost'
    }
    return chainNames[this.chainId] || `Chain ${this.chainId}`
  }

  disconnect() {
    this.provider = null
    this.signer = null
    this.account = ''
    this.chainId = ''
    this.isConnected = false
  }

  formatAddress(addr) {
    if (!addr) return ''
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }
}

const web3Service = new Web3Service()
export default web3Service

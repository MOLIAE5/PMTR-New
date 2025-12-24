import { useState, useEffect, } from "react";
import { initOnboard } from "../ulits/onboard";
import { config } from "../dapp.config";
import {
  getTotalMinted,
  getMaxSupply,
  getNumberMinted,
  isAirdropState,
  isPausedState,
  isPublicSaleState,
  isWlMintState,
  wlMint,
  publicMint,
  airdrop,
  getMaxperWallet,
  getWlCost,
  getPublicCost
} from "../ulits/interact";


export default function Home() {

  const [maxSupply, setMaxSupply] = useState(0)
  const [totalMinted, setTotalMinted] = useState(0)
  const [NumberMinted, setNumberMinted] = useState(0)
  const [maxMintAmount, setMaxMintAmount] = useState(0)

  const [paused, setPaused] = useState(false)
  const [isPublicSale, setIsPublicSale] = useState(false)
  const [isWLMint, setIsWlMint] = useState(false)
  const [isAirdroping, setIsAirdroping] = useState(false)

  const [status, setStatus] = useState(null)
  const [mintAmount, setMintAmount] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [onboard, setOnboard] = useState(null)
  const [walletAddress, setWalletAddress] = useState('')

  const [cost, setCost] = useState(0)

  // Email subscription states
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeStatus, setSubscribeStatus] = useState(null)
  const [pdfLink, setPdfLink] = useState(null)


  useEffect(() => {
    const init = async () => {
      setMaxSupply(await getMaxSupply())
      setTotalMinted(await getTotalMinted())
      setNumberMinted(await getNumberMinted())
      setPaused(await isPausedState())
      setIsPublicSale(await isPublicSaleState())
      const isWlMint = await isWlMintState()
      setIsWlMint(isWlMint)
      setIsAirdroping(await isAirdropState())

      // Fetch cost based on state
      if (isWlMint) {
        setCost(await getWlCost())
      } else {
        setCost(await getPublicCost())
      }

      setMaxMintAmount(
        isAirdroping ? config.maxPerWalletAirdrop : isWLMint ? config.maxPerWalletWL : config.maxPerWallet
      )
    }
    init()
  }, [])

  useEffect(() => {
    const onboardData = initOnboard({
      address: (address) => setWalletAddress(address ? address : ''),
      wallet: (wallet) => {
        if (wallet.provider) {
          window.localStorage.setItem('selectedWallet', wallet.name)
        } else {
          window.localStorage.removeItem('selectedWallet')
        }
      }
    })
    setOnboard(onboardData)
  }, [])

  const previouslySelectedWallet = typeof window !== 'undefined' &&
    window.localStorage.getItem('selectedWallet')

  useEffect(() => {
    if (previouslySelectedWallet !== null && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }, [onboard, previouslySelectedWallet])

  const connectWalletHandler = async () => {
    const walletSelected = await onboard.walletSelect()
    if (walletSelected) {
      await onboard.walletCheck()
      window.location.reload(false)
    }
  }

  const incrementMintAmount = () => {
    if (mintAmount < maxMintAmount) {
      setMintAmount(mintAmount + 1)
    }
  }

  const decrementMintAmount = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1)
    }
  }

  const wlMintHandler = async () => {
    setIsMinting(true)
    const { success, status } = await wlMint(mintAmount)
    setStatus({ success, message: status })
    setIsMinting(false)
  }

  const publicMintHandler = async () => {
    setIsMinting(true)
    const { success, status } = await publicMint(mintAmount)
    setStatus({ success, message: status })
    setIsMinting(false)
  }

  const airdropHandler = async () => {
    setIsMinting(true)
    const { success, status } = await airdrop(mintAmount)
    setStatus({ success, message: status })
    setIsMinting(false)
  }

  // Email subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setSubscribeStatus({ success: false, message: 'Please enter a valid email' })
      return
    }

    if (!walletAddress) {
      setSubscribeStatus({ success: false, message: 'Please connect your wallet first' })
      return
    }

    setIsSubscribing(true)
    setSubscribeStatus(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, walletAddress })
      })

      const data = await res.json()

      if (res.ok) {
        setSubscribeStatus({ success: true, message: data.message })
        setPdfLink(data.pdfLink)
        setEmail('')
      } else {
        setSubscribeStatus({ success: false, message: data.error })
      }
    } catch (error) {
      setSubscribeStatus({ success: false, message: 'Something went wrong. Please try again.' })
    }

    setIsSubscribing(false)
  }

  return (
    <div className="min-h-screen w-full relative bg-black overflow-x-hidden overflow-y-auto md:overflow-hidden">

      {/* Background */}
      <img src="/bg.png" alt="Background" className="hidden md:block w-full h-full absolute object-cover object-center z-0" />
      <div className="md:hidden fixed inset-0 z-0">
        <img src="/bgmobile.png" alt="Background mobile" className="object-cover w-full h-full" />
      </div>

      {/* Cosmic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/70 z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-[1] pointer-events-none" />

      {/* Mobile Layout - Scrollable column */}
      <div className="md:hidden relative z-10 flex flex-col items-center px-4 py-6 pb-12">
        {/* Mobile Header */}
        <div className="text-center mb-4">
          <div className="flex flex-row items-center justify-center gap-3">
            <img src="/NFTlogo.png" alt="PMTR Logo" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-3xl font-bold title-hieroglyph tracking-[0.15em]">PMTR</h1>
              <div className="h-[2px] w-full bg-gradient-to-r from-[#d4af37] via-[#f5d76e] to-transparent my-1"></div>
              <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase">Collection</p>
            </div>
          </div>
        </div>

        {/* Mobile Preview Cards */}
        <div className="flex gap-2 mb-4">
          <img src='gif1.gif' alt="Preview 1" className="w-[50px] h-[50px] rounded-lg preview-card" />
          <img src='gif2.gif' alt="Preview 2" className="w-[50px] h-[50px] rounded-lg preview-card" />
          <img src='gif3.gif' alt="Preview 3" className="w-[50px] h-[50px] rounded-lg preview-card" />
          <img src='gif4.gif' alt="Preview 4" className="w-[50px] h-[50px] rounded-lg preview-card" />
        </div>

        {/* Mobile Mint Card */}
        <div className="w-full max-w-[360px] cosmic-card p-5">
          {/* Page Logo */}
          <div className="flex justify-center mb-3">
            <img src="/pageLogo.png" alt="Page Logo" className="w-14 h-14 object-contain" />
          </div>

          {/* Status Badge */}
          <div className="text-center mb-4">
            <span className="status-badge inline-block text-[10px] uppercase font-bold">
              {paused ? 'Coming Soon' : isAirdroping ? 'Airdrop Live' : isWLMint ? 'Whitelist' : isPublicSale ? 'Public Sale' : 'Coming Soon'}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-xl font-bold text-center text-cosmic-gold mb-1 tracking-wider">
            Mint Your NFT
          </h2>

          {/* Wallet Address */}
          <p className="text-center text-[10px] text-[#8b7326] tracking-widest mb-4">
            {walletAddress ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Not Connected
              </span>
            )}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#8b7326]">Minted</span>
              <span className="text-[#f5d76e] font-bold">{totalMinted} / {maxSupply}</span>
            </div>
            <div className="progress-track-gold">
              <div className="progress-fill-gold" style={{ width: `${(totalMinted / maxSupply) * 100}%` }}></div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-5 mb-4">
            <button className="qty-orb !w-10 !h-10 text-xl" onClick={decrementMintAmount} disabled={isMinting || paused}>−</button>
            <div className="text-center">
              <p className="text-3xl font-bold text-cosmic-gold">{mintAmount}</p>
              <p className="text-[10px] text-[#8b7326] tracking-[0.2em] uppercase">Quantity</p>
            </div>
            <button className="qty-orb !w-10 !h-10 text-xl" onClick={incrementMintAmount} disabled={isMinting || paused}>+</button>
          </div>

          {/* Price */}
          <div className="egyptian-border p-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[#8b7326] text-xs">Total Price</span>
              <div className="text-right">
                <span className="text-lg font-bold text-[#f5d76e]">
                  {Number.parseFloat(cost * mintAmount).toFixed(4)} ETH
                </span>
                <span className="text-[10px] text-[#8b7326] ml-1">+ gas</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {walletAddress ? (
            <button
              className={`w-full btn-golden !py-3 !text-sm ${paused || isMinting ? '' : ''}`}
              disabled={paused || isMinting}
              onClick={isAirdroping ? airdropHandler : isWLMint ? wlMintHandler : publicMintHandler}
            >
              {isMinting ? '◈ Minting... ◈' : '◈ Mint Now ◈'}
            </button>
          ) : (
            <button className='w-full btn-golden !py-3 !text-sm' onClick={connectWalletHandler}>
              ◈ Connect Wallet ◈
            </button>
          )}

          {/* Status Message */}
          {status && (
            <div className={`mt-4 p-2 rounded-lg text-xs text-center border ${status.success
              ? 'bg-green-900/30 border-green-500/40 text-green-300'
              : 'bg-red-900/30 border-red-500/40 text-red-300'
              }`}>
              {status.message}
            </div>
          )}
        </div>

        {/* Mobile Social Icons */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {[
                        { href: 'https://moliaeworld.com', icon: 'globe.svg', label: 'Website' },
            { href: 'https://moliaebeauty.com/', icon: 'shop.svg', label: 'Shop' },
            { href: 'https://etherscan.io/address/0x1f1F860A0A3bEC70107d31CFDcAEfF2E59631a27', icon: 'etherscansvg.svg', label: 'Etherscan' },
            { href: 'https://discord.com/invite/nurws4nAgE', icon: 'discord.svg', label: 'Discord' },
            { href: 'https://instagram.com/moliae8', icon: 'instagram.svg', label: 'Instagram' },
            { href: 'https://x.com/moliae', icon: 'twitter.svg', label: 'X' },
            { href: 'https://facebook.com/moliae', icon: 'facebook.svg', label: 'Facebook' },
          ].map((social, idx) => (
            <a
              key={idx}
              className="social-gold"
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={social.icon} alt={social.label} />
            </a>
          ))}
        </div>

        {/* Mobile Email Subscription Section */}
        <div className="w-full max-w-[360px] mt-4 px-2">
          <div className="cosmic-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/book.svg" alt="Book" className="w-8 h-8 social-gold p-1.5" style={{filter: 'invert(80%) sepia(50%) saturate(500%) hue-rotate(10deg)'}} />
              <h3 className="text-sm font-bold text-[#f5d76e] tracking-wider">GET THE DECODE BOOK</h3>
            </div>
            
            {!pdfLink ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-[#8b7326] focus:outline-none focus:border-[#f5d76e] transition-colors font-sans"
                />
                <button
                  type="submit"
                  disabled={isSubscribing || !email || !walletAddress}
                  className={`w-full btn-green-gold py-3 text-sm ${(!email || !walletAddress) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubscribing ? 'Submitting...' : 'Subscribe & Download'}
                </button>
              </form>
            ) : (
              <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full btn-green-gold py-3 text-sm text-center"
              >
                ◈ Download Decode Book ◈
              </a>
            )}

            {subscribeStatus && (
              <p className={`mt-2 text-xs text-center ${subscribeStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                {subscribeStatus.message}
              </p>
            )}
          </div>
        </div>
        
        {/* Nichel Anderson Logo - Mobile */}
        <div className="mt-6 mb-4 flex items-center gap-3">
          <img src="/Nichel Anderson.png" alt="Nichel Anderson" className="w-40 h-auto object-contain" />
          <img src="/Nichel Anderson Signature.png" alt="Nichel Anderson Signature" className="w-24 h-auto object-contain" style={{filter: 'invert(1)'}} />
        </div>
      </div>

      {/* Desktop Layout - Absolute positioning */}
      {/* TOP LEFT CORNER: Logo + Title */}
      <div className="hidden md:block absolute top-10 left-12 z-20">
        <div className="flex flex-row items-center gap-4">
          <img src="/NFTlogo.png" alt="PMTR Logo" className="w-20 h-20 lg:w-24 lg:h-24 object-contain" />
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold title-hieroglyph tracking-[0.15em]">
              PMTR
            </h1>
            <div className="h-[2px] w-full bg-gradient-to-r from-[#d4af37] via-[#f5d76e] to-transparent my-2"></div>
            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase">Collection</p>
          </div>
        </div>

        {/* Preview Cards - Below Title */}
        <div className="flex gap-3 mt-6">
          <img src='gif1.gif' alt="Preview 1" className="w-[70px] h-[70px] rounded-lg preview-card" />
          <img src='gif2.gif' alt="Preview 2" className="w-[70px] h-[70px] rounded-lg preview-card" />
          <img src='gif3.gif' alt="Preview 3" className="w-[70px] h-[70px] rounded-lg preview-card" />
          <img src='gif4.gif' alt="Preview 4" className="w-[70px] h-[70px] rounded-lg preview-card" />
        </div>

        {/* Social Icons */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[            { href: 'https://moliaeworld.com', icon: 'globe.svg', label: 'Website' },
            { href: 'https://moliaebeauty.com/', icon: 'shop.svg', label: 'Shop' },
            { href: 'https://etherscan.io/address/0x1f1F860A0A3bEC70107d31CFDcAEfF2E59631a27', icon: 'etherscansvg.svg', label: 'Etherscan' },
            { href: 'https://discord.com/invite/nurws4nAgE', icon: 'discord.svg', label: 'Discord' },
            { href: 'https://instagram.com/moliae8', icon: 'instagram.svg', label: 'Instagram' },
            { href: 'https://x.com/moliae', icon: 'twitter.svg', label: 'X' },
            { href: 'https://facebook.com/moliae', icon: 'facebook.svg', label: 'Facebook' },
          ].map((social, idx) => (
            <a
              key={idx}
              className="social-gold"
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={social.icon} alt={social.label} />
            </a>
          ))}
        </div>

      </div>

      {/* Desktop Email Subscription Section - Bottom Left */}
      <div className="hidden md:block absolute bottom-8 left-12 z-20 w-[400px]">
        <div className="cosmic-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <img src="/book.svg" alt="Book" className="w-10 h-10 social-gold p-2" style={{filter: 'invert(80%) sepia(50%) saturate(500%) hue-rotate(10deg)'}} />
            <h3 className="text-base font-bold text-[#f5d76e] tracking-wider">GET THE DECODE BOOK</h3>
          </div>
          
          {!pdfLink ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-[#8b7326] focus:outline-none focus:border-[#f5d76e] transition-colors font-sans"
              />
              <button
                type="submit"
                disabled={isSubscribing || !email || !walletAddress}
                className={`w-full btn-green-gold py-3 text-sm ${(!email || !walletAddress) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubscribing ? 'Submitting...' : '◈ Subscribe & Download ◈'}
              </button>
            </form>
          ) : (
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full btn-green-gold py-3 text-sm text-center"
            >
              ◈ Download Decode Book ◈
            </a>
          )}

          {subscribeStatus && (
            <p className={`mt-3 text-sm text-center ${subscribeStatus.success ? 'text-green-400' : 'text-red-400'}`}>
              {subscribeStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* Nichel Anderson Logo - Bottom Center (Desktop only) */}
      <div className="hidden md:flex items-end absolute bottom-8 left-[480px] z-20">
        <img src="/Nichel Anderson.png" alt="Nichel Anderson" className="w-auto h-[280px] lg:h-[320px] object-contain" />
        <img src="/Nichel Anderson Signature.png" alt="Nichel Anderson Signature" className="w-auto h-6 object-contain" style={{filter: 'invert(1)'}} />
      </div>

      {/* RIGHT SIDE: Mint Card (Desktop only) */}
      <div className='hidden md:block absolute right-12 top-1/2 -translate-y-1/2 z-10 w-full max-w-[480px]'>
        <div className="cosmic-card p-6 lg:p-8">

          {/* Page Logo */}
          <div className="flex justify-center mb-4">
            <img src="/pageLogo.png" alt="Page Logo" className="w-16 h-16 lg:w-20 lg:h-20 object-contain" />
          </div>

          {/* Status Badge */}
          <div className="text-center mb-6">
            <span className="status-badge inline-block text-xs uppercase font-bold">
              {paused ? 'Coming Soon' : isAirdroping ? 'Airdrop Live' : isWLMint ? 'Whitelist' : isPublicSale ? 'Public Sale' : 'Coming Soon'}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-cosmic-gold mb-2 tracking-wider">
            Mint Your NFT
          </h2>

          {/* Wallet Address */}
          <p className="text-center text-xs text-[#8b7326] tracking-widest mb-6">
            {walletAddress ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Not Connected
              </span>
            )}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#8b7326]">Minted</span>
              <span className="text-[#f5d76e] font-bold">{totalMinted} / {maxSupply}</span>
            </div>
            <div className="progress-track-gold">
              <div className="progress-fill-gold" style={{ width: `${(totalMinted / maxSupply) * 100}%` }}></div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button className="qty-orb" onClick={decrementMintAmount} disabled={isMinting || paused}>−</button>
            <div className="text-center">
              <p className="text-4xl font-bold text-cosmic-gold">{mintAmount}</p>
              <p className="text-xs text-[#8b7326] tracking-[0.3em] uppercase mt-1">Quantity</p>
            </div>
            <button className="qty-orb" onClick={incrementMintAmount} disabled={isMinting || paused}>+</button>
          </div>

          {/* Price */}
          <div className="egyptian-border p-3 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-[#8b7326] text-sm">Total Price</span>
              <div className="text-right">
                <span className="text-xl font-bold text-[#f5d76e]">
                  {Number.parseFloat(cost * mintAmount).toFixed(4)} ETH
                </span>
                <span className="text-xs text-[#8b7326] ml-2">+ gas</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {walletAddress ? (
            <button
              className={`w-full btn-golden ${paused || isMinting ? '' : ''}`}
              disabled={paused || isMinting}
              onClick={isAirdroping ? airdropHandler : isWLMint ? wlMintHandler : publicMintHandler}
            >
              {isMinting ? '◈ Minting... ◈' : '◈ Mint Now ◈'}
            </button>
          ) : (
            <button className='w-full btn-golden' onClick={connectWalletHandler}>
              ◈ Connect Wallet ◈
            </button>
          )}



          {/* Status Message */}
          {status && (
            <div className={`mt-5 p-3 rounded-lg text-sm text-center border ${status.success
              ? 'bg-green-900/30 border-green-500/40 text-green-300'
              : 'bg-red-900/30 border-red-500/40 text-red-300'
              }`}>
              {status.message}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
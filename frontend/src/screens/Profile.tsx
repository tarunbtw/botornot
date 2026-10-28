import React, { useState } from 'react'
import { CyborgAvatar } from '../components/CyborgAvatar'
import { CoinIcon } from '../components/CoinIcon'
import { Button, Card } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import {
  ArrowLeft,
  Copy,
  Check,
  Flame,
  Target,
  Trophy,
  ShieldCheck,
  LogIn,
  LogOut,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authClient } from '../lib/auth-client'
import { logout, deleteAccount, type UserProfileResponse } from '../lib/api'

interface ProfileProps {
  onBack: () => void
  user: UserProfileResponse | null
  onUserUpdate: (u: UserProfileResponse | null) => void
  coins: number
  streak: number
  wins: number
  losses: number
  onCoinsChange?: (coins: number) => void
}

export const Profile: React.FC<ProfileProps> = ({
  onBack,
  user,
  onUserUpdate,
  coins,
  streak,
  wins,
  losses,
  onCoinsChange,
}) => {
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isGuest = !user || user.id.startsWith('guest_')
  const totalGames = wins + losses
  const accuracy = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 63
  const publicId = user?.publicId || 'ANON-HUMAN'

  const handleCopyId = () => {
    navigator.clipboard.writeText(publicId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      })
    } catch (err) {
      console.error('Google sign-in error:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    onUserUpdate(null)
    onBack()
    window.location.reload()
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const success = await deleteAccount()
    setIsDeleting(false)
    setShowDeleteModal(false)
    if (success) {
      onUserUpdate(null)
      localStorage.clear()
      onBack()
      window.location.reload()
    } else {
      alert('Failed to delete account. Please try again.')
    }
  }

  const handleUpgradeMock = () => {
    if (onCoinsChange) {
      onCoinsChange(coins + 50)
    }
    if (user) {
      onUserUpdate({ ...user, isPro: true })
    }
    setShowUpgradeModal(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col flex-1 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-xl border-3 shadow-[3px_3px_0px_0px_#000]"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-black leading-none">
              Player Profile
            </h1>
            <span className="font-mono text-xs font-bold text-neutral-600">
              SOCIAL TURING CREDENTIALS &amp; STATS
            </span>
          </div>
        </div>

        {/* Public ID Pill */}
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD100] transition-colors cursor-pointer"
          title="Click to copy ID"
        >
          <span>ID: {publicId}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
        </button>
      </div>

      {/* Guest Account Banner */}
      {isGuest && (
        <Card className="p-4 sm:p-5 bg-[#FFF8D6] border-3 border-black shadow-[4px_4px_0px_0px_#000] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black bg-black text-[#FFD100] px-2 py-0.5 rounded">
                GUEST SESSION
              </span>
              <h3 className="font-display font-black text-sm uppercase text-black">
                Playing Anonymously
              </h3>
            </div>
            <p className="text-xs text-neutral-700 font-bold leading-relaxed max-w-xl">
              Sign in with Google to save your earned Human Coins, link your rank to the global leaderboard, and keep your history across devices.
            </p>
          </div>

          <Button
            variant="dark"
            size="sm"
            onClick={handleGoogleSignIn}
            className="shrink-0 flex items-center gap-2 py-2 px-4 text-xs font-black border-2 shadow-[2px_2px_0px_0px_#000]"
          >
            <LogIn className="w-4 h-4 text-[#FFD100]" />
            <span>Sign in with Google</span>
          </Button>
        </Card>
      )}

      {/* Identity Card */}
      <Card className="p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-20 h-20 rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_#000] object-cover"
              />
            ) : (
              <div className="p-2 bg-neutral-100 rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                <CyborgAvatar size="lg" />
              </div>
            )}
            {user?.isPro && (
              <span className="absolute -bottom-2 -right-2 bg-[#FFD100] border-2 border-black rounded-lg px-1.5 py-0.5 font-mono text-[9px] font-black shadow-[1px_1px_0px_0px_#000]">
                PRO
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h2 className="text-2xl font-display font-black text-black leading-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>{user?.name || 'Anonymous Human'}</span>
                  {!isGuest && <ShieldCheck className="w-5 h-5 text-green-600 fill-green-100" />}
                </h2>
                <p className="font-mono text-xs font-bold text-neutral-600">
                  {isGuest ? 'Temporary Guest Account' : user?.email}
                </p>
              </div>

              {/* Supporter Pass Tag */}
              <div>
                {user?.isPro ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFD100] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                    <Sparkles className="w-3.5 h-3.5" /> SUPPORTER PRO
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                    className="py-1 px-3 text-xs font-black border-2 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD100] fill-[#FFD100]" />
                    <span>Get Pro Pass</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-300 rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold text-neutral-700">
                User ID: {publicId}
              </span>
              <span className="inline-flex items-center gap-1 bg-[#FFD100]/40 border border-black rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold text-black">
                {isGuest ? 'Unlinked Profile' : 'Google Authenticated'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 bg-white border-3 border-black text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="w-9 h-9 bg-blue-100 rounded-xl border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="font-mono text-2xl font-black text-black leading-none mb-1">{accuracy}%</div>
          <div className="font-mono text-[10px] font-black uppercase text-neutral-500">Turing Accuracy</div>
        </Card>

        <Card className="p-4 bg-white border-3 border-black text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="w-9 h-9 bg-[#FFD100] rounded-xl border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_#000]">
            <CoinIcon size="sm" />
          </div>
          <div className="font-mono text-2xl font-black text-black leading-none mb-1">{coins}</div>
          <div className="font-mono text-[10px] font-black uppercase text-neutral-500">Human Coins</div>
        </Card>

        <Card className="p-4 bg-white border-3 border-black text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="w-9 h-9 bg-orange-100 rounded-xl border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          </div>
          <div className="font-mono text-2xl font-black text-black leading-none mb-1">{streak}</div>
          <div className="font-mono text-[10px] font-black uppercase text-neutral-500">Win Streak</div>
        </Card>

        <Card className="p-4 bg-white border-3 border-black text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="w-9 h-9 bg-purple-100 rounded-xl border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div className="font-mono text-2xl font-black text-black leading-none mb-1">
            {wins}W / {losses}L
          </div>
          <div className="font-mono text-[10px] font-black uppercase text-neutral-500">Career Record</div>
        </Card>
      </div>

      {/* Account Settings / Danger Zone */}
      <Card className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] mb-6">
        <h3 className="font-display font-black text-sm uppercase text-black mb-3">
          Account Actions
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-neutral-200">
          <div className="text-xs font-bold text-neutral-600">
            {isGuest ? 'Session stored locally in browser cookie.' : `Signed in as ${user?.email}`}
          </div>

          <div className="flex items-center gap-2.5">
            {!isGuest && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-black border-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </Button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-mono font-black text-red-600 hover:bg-red-50 border-2 border-red-500 rounded-xl shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Ad placement */}
      <div className="w-full mt-auto pt-4">
        <div className="hidden sm:block">
          <AdSlot format="leaderboard" id="profile-desktop-ad" />
        </div>
        <div className="sm:hidden">
          <AdSlot format="mobile_banner" id="profile-mobile-ad" />
        </div>
      </div>

      {/* Upgrade to Pro Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="relative bg-[#FFFDF5] p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD100] border-3 border-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_0px_#000]">
                    <Sparkles className="w-6 h-6 text-black fill-black" />
                  </div>
                  <h3 className="text-xl font-display font-black text-black">
                    Bot or Not Supporter Pass
                  </h3>
                  <p className="text-xs font-bold text-neutral-600 mt-1">
                    Supercharge your social Turing experiment experience
                  </p>
                </div>

                <div className="space-y-2.5 mb-6 text-xs font-bold text-neutral-700 bg-white p-4 rounded-2xl border-3 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Unlimited free 5-minute chat extensions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>+50 Bonus Human Coins instantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Golden Supporter Nameplate on Leaderboards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Zero queue delays &amp; priority matching</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleUpgradeMock}
                    className="py-3 text-xs font-black uppercase tracking-wider"
                  >
                    Activate Pro Pass ($4.99)
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="relative bg-[#FFFDF5] p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                <div className="flex items-center gap-2.5 text-red-600 mb-3">
                  <Trash2 className="w-6 h-6" />
                  <h3 className="text-lg font-display font-black text-black">
                    Permanently Delete Account?
                  </h3>
                </div>

                <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-6">
                  This will permanently delete your player credentials, reset all earned Human Coins, wipe your streak, and remove your records from the database. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowDeleteModal(false)}
                    className="py-2.5 text-xs font-black border-2"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-display font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

import React, { useState } from 'react'
import { CoinIcon } from '../components/CoinIcon'
import { Button, Card } from '../components/UI'
import {
  ArrowLeft,
  Copy,
  Check,
  FireFlame,
  PrecisionTool,
  Trophy,
  ShieldCheck,
  LogIn,
  LogOut,
  Trash,
} from 'iconoir-react'
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
  onCoinsChange: _onCoinsChange,
}) => {
  const [copied, setCopied] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isGuest = !user || user.id.startsWith('guest_')
  const totalGames = wins + losses
  const accuracy = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 63
  const publicId = user?.publicId || 'ANON-HUMAN'
  const avatarSeed = user?.email || user?.name || publicId || 'player'
  const blobatarUrl = `https://blobatar.dev/avatar/${encodeURIComponent(avatarSeed)}`

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="p-2 rounded-xl shadow-xs"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-black dark:text-white">
          Profile
        </h1>
      </div>

      <div className="space-y-5">
        {/* User Identity Banner Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Blobatar Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-black/15 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-xs shrink-0">
                <img
                  src={blobatarUrl}
                  alt={user?.name || 'Player Avatar'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="font-display font-black text-2xl text-black dark:text-white leading-tight">
                  {user?.name || 'Anonymous Human'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FAFAF8] dark:bg-[#121218] border border-black/20 dark:border-neutral-700 font-mono text-xs font-bold text-neutral-600 dark:text-neutral-300">
                    <span>ID: {publicId}</span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer ml-0.5"
                      title="Copy Public ID"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-black/10 dark:border-neutral-700">
                    {isGuest ? 'Guest Player' : 'Google Account'}
                  </span>
                </div>
              </div>
            </div>

            {/* Coin Balance Pill */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-black/10 dark:border-neutral-800 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Current Balance
              </span>
              <div className="flex items-center gap-1.5 font-mono font-black text-2xl text-black dark:text-white mt-0.5">
                <span>{coins}</span>
                <CoinIcon size="sm" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid: Occupies full width with 3 spacious cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-black/20 dark:border-neutral-700 flex items-center justify-center mb-2">
              <PrecisionTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="font-mono font-black text-3xl text-black dark:text-white">
              {accuracy}%
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
              Accuracy
            </div>
          </Card>

          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-black/20 dark:border-neutral-700 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="font-mono font-black text-3xl text-black dark:text-white">
              {wins}W <span className="text-neutral-400 font-normal">/</span> {losses}L
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
              Win / Loss Record
            </div>
          </Card>

          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-black/20 dark:border-neutral-700 flex items-center justify-center mb-2">
              <FireFlame className="w-5 h-5 text-orange-500" />
            </div>
            <div className="font-mono font-black text-3xl text-black dark:text-white">
              {streak}
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
              Current Streak
            </div>
          </Card>
        </div>

        {/* Account Management Card */}
        <Card className="p-6">
          <h3 className="font-display font-black text-base uppercase text-black dark:text-white mb-4">
            Account Management
          </h3>

          {isGuest ? (
            <div className="p-5 bg-[#FFF8D6] dark:bg-[#201F12] rounded-xl border border-black/15 dark:border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-black text-base text-black dark:text-white">
                  Save Your Progress
                </h4>
                <p className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">
                  Link with Google to sync your coins, streaks, and match history across devices.
                </p>
              </div>
              <Button
                variant="dark"
                size="md"
                onClick={handleGoogleSignIn}
                className="whitespace-nowrap px-5 py-2.5 text-xs font-black uppercase tracking-wider shrink-0"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FAFAF8] dark:bg-[#121218] rounded-xl border border-black/20 dark:border-neutral-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-black dark:text-white">{user?.email}</div>
                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">Authenticated Google Account</div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-700 rounded-2xl p-6 shadow-md text-center"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 rounded-xl border border-black/20 dark:border-neutral-700 flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400">
                <Trash className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-xl text-black dark:text-white mb-1">
                Delete Account?
              </h3>
              <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
                This will permanently remove your user profile, coin balance, and streak history. This action cannot be undone.
              </p>

              <div className="flex gap-2.5">
                <Button
                  variant="danger"
                  fullWidth
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="py-2.5 text-xs font-black uppercase tracking-wider"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowDeleteModal(false)}
                  className="py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

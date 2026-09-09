import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain,
  MessageSquare,
  Gamepad2,
  Bot,
  Trophy,
  Crown,
  Zap,
  Target,
  Sparkles,
  Search,
} from 'lucide-react'

// --- Types ---
interface Article {
  id: number
  title: string
  category: string
  readTime: string
  icon: typeof Brain
}

interface FAQItem {
  question: string
  answer: string
}

// --- Data ---
const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'The Turing Test: Explained Through Bot or Not Game',
    category: 'Analysis',
    readTime: '4 min read',
    icon: Brain,
  },
  {
    id: 2,
    title: 'New Dating Concept by Humans and AI Inc.',
    category: 'Culture',
    readTime: '3 min read',
    icon: MessageSquare,
  },
  {
    id: 3,
    title: 'The Turing Test: The Original Imitation Game',
    category: 'History',
    readTime: '6 min read',
    icon: Gamepad2,
  },
  {
    id: 4,
    title: 'When Large Language Models Pass the Turing Test',
    category: 'Research',
    readTime: '5 min read',
    icon: Bot,
  },
]

const HOME_FAQS: FAQItem[] = [
  {
    question: 'Are you talking to humans or AI in the game?',
    answer:
      'You may be chatting with either a real person or an AI. Figuring out which is the challenge. Both are active participants in the queue at all times.',
  },
  {
    question: 'Is Bot or Not a game or a chat app?',
    answer:
      "It's a game first. The chat exists only to test whether you can tell a human from a bot within a quick two-minute window.",
  },
  {
    question: 'Do I need to register to play Bot or Not?',
    answer:
      'No. You can play instantly with no registration required. Creating an account is optional but lets you appear on the leaderboard, save your stats, keep earned Human Coins, and access your chat history.',
  },
  {
    question: 'Is Bot or Not safe to use?',
    answer:
      'Yes. Conversations are completely anonymous, short, and strictly moderated for gameplay rather than personal data exchange.',
  },
  {
    question: 'Why do some humans sound like bots?',
    answer:
      'Short conversations, limited context, meme culture, and rapid typing habits can often make real people sound remarkably artificial or repetitive.',
  },
  {
    question: 'Why do some AI bots sound human?',
    answer:
      'Modern neural language models are trained on billions of real conversations, allowing them to mimic colloquialisms, natural pauses, humor, and subtle emotional cues.',
  },
]

const LEADERBOARD_USERS = [
  { rank: 1, name: 'TuringChamp_99', score: '2,840', winRate: '88%', Icon: Crown },
  { rank: 2, name: 'CyberIntuition', score: '2,490', winRate: '82%', Icon: Zap },
  { rank: 3, name: 'Socrates42', score: '2,150', winRate: '79%', Icon: Target },
  { rank: 4, name: 'PixelWhisperer', score: '1,980', winRate: '76%', Icon: Sparkles },
  { rank: 5, name: 'Synthetik', score: '1,820', winRate: '74%', Icon: Search },
]

// --- Retro Pixel Art Avatar (Half Human, Half Cyborg) ---
function CyborgPixelAvatar() {
  return (
    <div className="relative w-28 h-28 mx-auto -mb-14 z-20 transition-transform duration-200 hover:scale-105">
      <svg
        viewBox="0 0 28 28"
        className="w-full h-full drop-shadow-[0_4px_6px_rgba(35,35,35,0.25)]"
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
      >
        {/* Hair / Headgear Top */}
        <rect x="9" y="1" width="10" height="2" fill="#22c55e" />
        <rect x="7" y="3" width="14" height="2" fill="#16a34a" />
        <rect x="6" y="5" width="16" height="2" fill="#15803d" />

        {/* Left Side: Robot / Cyborg */}
        <rect x="5" y="7" width="9" height="13" fill="#f1eee7" />
        <rect x="5" y="7" width="2" height="13" fill="#232323" />
        <rect x="4" y="10" width="2" height="5" fill="#22c55e" />
        <rect x="7" y="10" width="4" height="3" fill="#232323" />
        <rect x="8" y="11" width="2" height="2" fill="#22c55e" />
        <rect x="7" y="14" width="5" height="1" fill="#22c55e" />
        <rect x="9" y="15" width="1" height="3" fill="#22c55e" />
        <rect x="7" y="17" width="4" height="1" fill="#232323" />
        <rect x="8" y="18" width="2" height="1" fill="#22c55e" />

        {/* Right Side: Human Face */}
        <rect x="14" y="7" width="9" height="13" fill="#fde68a" />
        <rect x="21" y="7" width="2" height="13" fill="#232323" />
        <rect x="15" y="9" width="5" height="1" fill="#232323" />
        <rect x="16" y="10" width="3" height="3" fill="#232323" />
        <rect x="17" y="11" width="1" height="1" fill="#f1eee7" />
        <rect x="22" y="11" width="2" height="4" fill="#fde68a" />
        <rect x="14" y="13" width="2" height="2" fill="#f59e0b" />
        <rect x="15" y="16" width="4" height="1" fill="#ef4444" />
        <rect x="16" y="17" width="2" height="1" fill="#b91c1c" />

        {/* Center Split Line */}
        <rect x="13" y="5" width="2" height="15" fill="#232323" />

        {/* Chin & Jaw */}
        <rect x="8" y="20" width="12" height="2" fill="#232323" />
        <rect x="10" y="22" width="8" height="2" fill="#232323" />
        <rect x="9" y="20" width="4" height="1" fill="#22c55e" />
        <rect x="15" y="20" width="4" height="1" fill="#fde68a" />
      </svg>
    </div>
  )
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Start game: clean in-place connection state with NO popup modal
  const handleStartGame = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
    }, 2000)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 pb-20">
      {/* --- Hero Game Card Area --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative mt-8 mb-16"
      >
        {/* Overlapping Character Pixel Avatar */}
        <CyborgPixelAvatar />

        {/* Outer Neobrutalist Container */}
        <div className="neo-card p-5 sm:p-8 pt-16 relative bg-[#f1eee7]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Social Turing Game Hero */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-[#232323] text-[#f1eee7] rounded-xl p-6 sm:p-8 border-2 border-[#232323] shadow-[3px_3px_0px_#232323]">
              <div className="text-center my-auto py-4">
                <h1 className="font-pixel text-2xl sm:text-3xl text-[#22c55e] tracking-tight mb-6 font-bold">
                  Social Turing Game
                </h1>

                {/* Big START GAME Button (No popup/modal) */}
                <div className="flex justify-center mb-6">
                  <button
                    id="start-game-button"
                    type="button"
                    onClick={handleStartGame}
                    className="neo-btn neo-btn-green px-8 py-4 font-pixel text-lg sm:text-xl font-bold tracking-wider rounded-xl hover:scale-105 transition-all text-[#232323]"
                  >
                    {isConnecting ? 'MATCHING QUEUE...' : 'START GAME'}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Chat with someone for two minutes. Try to figure out if it was a human or an AI bot. Think you can tell the difference?
                </p>
              </div>
            </div>

            {/* Right Column: Understanding Humans and AI */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-pixel font-bold tracking-wider text-[#232323] uppercase mb-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e]"></span>
                  Understanding Humans and AI
                </h2>

                <div className="space-y-3">
                  {ARTICLES.map((article) => {
                    const IconComp = article.icon
                    return (
                      <div
                        key={article.id}
                        onClick={() => setActiveArticle(article)}
                        className="group flex items-start gap-3 p-2.5 rounded-lg bg-[#f1eee7] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-[#232323] text-[#22c55e] flex items-center justify-center rounded-md border border-[#232323]">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-[#232323] leading-snug group-hover:text-[#22c55e] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-bold">
                            <span>{article.category}</span>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#232323] hover:text-[#22c55e] mt-4 transition-colors"
              >
                View all articles →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- Play & Rank / Leaderboard & Stats Section --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-16"
      >
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-pixel font-bold text-[#232323] mb-1">
            <Trophy className="w-4 h-4 text-[#22c55e]" />
            <span>PLAY &amp; RANK</span>
            <span className="w-4 h-4 rounded-full bg-[#22c55e] border border-[#232323] inline-flex items-center justify-center font-pixel text-[9px] font-bold">
              H
            </span>
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] tracking-wider uppercase">
            Leaderboard
          </h2>
        </div>

        {/* 2 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Card 1: Games Today */}
          <div className="neo-card p-6 flex flex-col justify-between bg-[#f1eee7]">
            <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
              Games Played Today
            </span>
            <div className="my-4">
              <div className="font-pixel text-4xl sm:text-5xl font-bold text-[#22c55e] tracking-tight">
                27 523
              </div>
            </div>
            <div className="pt-2 border-t border-[#232323]/20">
              <Link
                to="/turner-index"
                className="text-xs font-pixel font-bold text-[#232323] hover:text-[#22c55e] flex items-center justify-between"
              >
                <span>STUDY TURING TEST</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Stats Card 2: Games Won Today */}
          <div className="neo-card p-6 flex flex-col justify-between bg-[#f1eee7]">
            <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
              Games Won Today
            </span>
            <div className="my-4">
              <div className="flex items-baseline gap-3">
                <div className="font-pixel text-4xl sm:text-5xl font-bold text-[#232323]">
                  37%
                </div>
                <span className="text-xs font-bold text-slate-600">
                  Human accuracy rate
                </span>
              </div>
              {/* Neobrutalist Progress Meter */}
              <div className="w-full h-5 bg-[#f1eee7] border-2 border-[#232323] rounded-md mt-3 overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#22c55e] rounded-sm transition-all duration-700"
                  style={{ width: '37%' }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#232323]/20 flex justify-between items-center text-xs text-slate-600 font-bold">
              <span>Total attempts: 74,386</span>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="text-xs font-pixel font-bold text-[#232323] hover:text-[#22c55e]"
              >
                VIEW RANKS →
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- Section: What is Bot or Not --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-14"
      >
        <div className="neo-card p-6 sm:p-8 bg-[#f1eee7]">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-4 flex items-center gap-2">
            <span className="text-[#22c55e]">#</span> What is Bot or Not
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#232323] font-bold leading-relaxed">
            <p>
              <strong className="text-[#232323] font-bold">Bot or Not</strong> is a social Turing game where you chat with a stranger for two minutes and try to decide if you&apos;re talking to a real person or an AI.
            </p>
            <p>
              Inspired by the classic <strong className="text-[#232323] font-bold">Turing Test</strong>, the game explores how closely <strong className="text-[#232323] font-bold">artificial intelligence</strong> can mimic <strong className="text-[#232323] font-bold">human conversation</strong>—and how well humans can tell the difference.
            </p>
            <p>
              Unlike traditional quizzes or simulations, every round is a real, live interaction, making each decision unpredictable and unique.
            </p>
          </div>
        </div>
      </motion.section>

      {/* --- Section: How It Works --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-14"
      >
        <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-6 flex items-center gap-2">
          <span className="text-[#22c55e]">⚙</span> How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Step 1 */}
          <div className="neo-card p-5 text-center flex flex-col items-center justify-center min-h-[140px] bg-[#f1eee7]">
            <div className="w-8 h-8 rounded-full bg-[#f1eee7] border-2 border-[#232323] font-pixel text-xs font-bold flex items-center justify-center mb-3">
              1
            </div>
            <p className="text-sm font-bold text-[#232323] leading-snug">
              Start a chat with a random participant
            </p>
          </div>

          {/* Step 2 */}
          <div className="neo-card p-5 text-center flex flex-col items-center justify-center min-h-[140px] bg-[#f1eee7]">
            <div className="w-8 h-8 rounded-full bg-[#22c55e] border-2 border-[#232323] font-pixel text-xs font-bold text-[#232323] flex items-center justify-center mb-3">
              2
            </div>
            <p className="text-sm font-bold text-[#232323] leading-snug">
              Talk for two minutes
            </p>
          </div>

          {/* Step 3 */}
          <div className="neo-card p-5 text-center flex flex-col items-center justify-center min-h-[140px] bg-[#f1eee7]">
            <div className="w-8 h-8 rounded-full bg-[#232323] border-2 border-[#232323] font-pixel text-xs font-bold text-[#f1eee7] flex items-center justify-center mb-3">
              3
            </div>
            <p className="text-sm font-bold text-[#232323] leading-snug">
              Decide: human or AI?
            </p>
          </div>
        </div>
      </motion.section>

      {/* --- Section: Why Play Bot or Not --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-14"
      >
        <div className="neo-card p-6 sm:p-8 bg-[#f1eee7]">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-6 flex items-center gap-2">
            <span className="text-[#22c55e]">★</span> Why Play Bot or Not
          </h2>

          <ul className="space-y-3.5 text-sm sm:text-base text-[#232323] font-bold">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] font-pixel text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Challenge yourself to identify AI in real conversations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] font-pixel text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Understand how AI language differs from human behavior</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] font-pixel text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Experience a live version of the Turing Test</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] font-pixel text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Improve your intuition in spotting automated interactions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] font-pixel text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Enjoy quick, anonymous chats with real stakes</span>
            </li>
          </ul>
        </div>
      </motion.section>

      {/* --- Section: Frequently Asked Questions Preview --- */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-14"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] flex items-center gap-2">
            <span className="text-[#22c55e]">?</span> Frequently Asked Questions
          </h2>
          <Link to="/faq" className="text-xs font-bold text-[#22c55e] hover:underline">
            VIEW ALL FAQS →
          </Link>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="neo-card overflow-hidden transition-all bg-[#f1eee7]">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#232323] hover:text-[#22c55e] transition-colors"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <span className="w-6 h-6 rounded-md bg-[#f1eee7] border border-[#232323] flex items-center justify-center font-pixel text-xs text-[#232323] flex-shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-[#232323] font-bold leading-relaxed border-t border-[#232323]/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* --- Leaderboard Modal --- */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232323]/70 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md bg-[#f1eee7] p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#232323] mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#22c55e]" />
                <h3 className="font-pixel text-lg font-bold text-[#232323]">
                  Global Leaderboard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboard(false)}
                className="w-7 h-7 rounded-md bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {LEADERBOARD_USERS.map((user) => {
                const BadgeIcon = user.Icon
                return (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-2.5 rounded-lg border-2 border-[#232323] bg-[#f1eee7] text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 font-pixel font-bold text-slate-600">
                        #{user.rank}
                      </span>
                      <BadgeIcon className="w-4 h-4 text-[#22c55e]" />
                      <span className="font-bold text-[#232323]">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#232323]">{user.score} pts</div>
                      <div className="text-[10px] text-slate-600">Win rate {user.winRate}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowLeaderboard(false)
                handleStartGame()
              }}
              className="neo-btn neo-btn-green w-full py-3 font-pixel text-xs font-bold rounded-lg"
            >
              START A ROUND &amp; CLIMB
            </button>
          </div>
        </div>
      )}

      {/* --- Article Detail Modal --- */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232323]/70 backdrop-blur-xs">
          <div className="neo-card w-full max-w-lg bg-[#f1eee7] p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#232323] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#22c55e]">
                {activeArticle.category} • {activeArticle.readTime}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="w-7 h-7 rounded-md bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <h3 className="font-pixel text-lg font-bold text-[#232323] mb-3 leading-snug">
              {activeArticle.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#232323] leading-relaxed mb-6 font-bold">
              This article explores the psychological and linguistic factors at play in the Bot or Not
              experiment. Across millions of conversations, participants navigate nuance, humor, and
              artificial pauses to decipher the essence of personhood.
            </p>

            <div className="flex justify-between items-center gap-3">
              <Link
                to="/blog"
                onClick={() => setActiveArticle(null)}
                className="neo-btn neo-btn-green flex-1 py-2.5 font-pixel text-xs font-bold rounded-lg text-center"
              >
                VIEW FULL BLOG →
              </Link>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="neo-btn bg-[#232323] text-[#f1eee7] px-4 py-2.5 font-pixel text-xs font-bold rounded-lg"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

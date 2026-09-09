import { motion } from 'framer-motion'
import {
  Milestone,
  Sparkles,
  Radio,
  Cpu,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Check,
} from 'lucide-react'

interface MilestoneItem {
  id: string
  phase: string
  title: string
  status: 'In Progress' | 'Planned' | 'Research'
  description: string
  features: string[]
  icon: typeof Radio
}

const ROADMAP_ITEMS: MilestoneItem[] = [
  {
    id: 'voice',
    phase: 'Phase 1',
    title: 'Real-Time Voice Turing Rounds',
    status: 'In Progress',
    description:
      'Expanding beyond text chat to live 90-second voice conversations. Test your intuition against ultra-realistic low-latency voice synthesis models.',
    features: [
      'Sub-200ms voice pipeline with natural breathing and pauses',
      'Real-time acoustic analysis and Turing score metrics',
      'Anonymous voice masking for human participants',
    ],
    icon: Radio,
  },
  {
    id: 'models',
    phase: 'Phase 2',
    title: 'Community Model Arena',
    status: 'Planned',
    description:
      'Allow AI labs and developers to submit fine-tuned models to the live queue. Measure model deceit benchmarks through the Turner Index.',
    features: [
      'Automated leaderboard for top conversational AI models',
      'Blinded match queue balancing human vs diverse LLM architectures',
      'Public model deceive-rate benchmarks and analysis papers',
    ],
    icon: Cpu,
  },
  {
    id: 'ranked',
    phase: 'Phase 3',
    title: 'Ranked Competitive Seasons',
    status: 'Planned',
    description:
      'Climb tiered competitive ranks (Novice, Intuitive, Turing Master) with Elo-based MMR matchmaking and seasonal trophies.',
    features: [
      'Seasonal ladders with leaderboard resets and rewards',
      'Match history review with detailed round breakdown',
      'Weekly community tournaments and spectator mode',
    ],
    icon: Trophy,
  },
  {
    id: 'proofs',
    phase: 'Phase 4',
    title: 'Decentralized Proof-of-Humanity',
    status: 'Research',
    description:
      'Explore zero-knowledge verifiable credentials confirming biological personhood without revealing user identity or biometric data.',
    features: [
      'Sybil-resistant game queue protection',
      'Cryptographic match verification receipts',
      'Zero-knowledge proof integrations',
    ],
    icon: ShieldCheck,
  },
]

export default function Roadmap() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#22c55e]/15 border-2 border-[#232323] text-xs font-bold text-[#15803d] mb-4"
      >
        <Milestone className="w-3.5 h-3.5 text-[#22c55e]" />
        <span>DEVELOPMENT TIMELINE • UPDATED REGULARLY</span>
      </motion.div>

      {/* Main Titles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-10"
      >
        <h1 className="font-pixel text-3xl sm:text-5xl font-bold text-[#232323] tracking-tight mb-3">
          Roadmap
        </h1>
        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl leading-relaxed">
          Our upcoming milestones, experimental features, and research targets for Bot or Not. We are
          building the global testing ground for human-AI interaction.
        </p>
      </motion.div>

      {/* Milestones List */}
      <div className="space-y-6">
        {ROADMAP_ITEMS.map((item, index) => {
          const IconComp = item.icon
          const isInProgress = item.status === 'In Progress'
          const isPlanned = item.status === 'Planned'

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
              className="neo-card p-6 sm:p-7 bg-[#f1eee7] relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#232323]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#232323] text-[#22c55e] flex items-center justify-center border border-[#232323]">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-pixel text-xs font-bold text-[#22c55e] uppercase tracking-wider mr-2">
                      {item.phase}
                    </span>
                    <h2 className="inline font-pixel text-base sm:text-lg font-bold text-[#232323]">
                      {item.title}
                    </h2>
                  </div>
                </div>

                {/* Status Pill */}
                <div
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-pixel text-[11px] font-bold border-2 border-[#232323] shadow-[1.5px_1.5px_0px_#232323] ${
                    isInProgress
                      ? 'bg-[#22c55e] text-[#232323]'
                      : isPlanned
                      ? 'bg-[#232323] text-[#f1eee7]'
                      : 'bg-[#f1eee7] text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isInProgress
                        ? 'bg-[#232323] animate-pulse'
                        : isPlanned
                        ? 'bg-[#22c55e]'
                        : 'bg-slate-400'
                    }`}
                  ></span>
                  <span>{item.status.toUpperCase()}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#232323] mb-4 leading-relaxed">
                {item.description}
              </p>

              <div className="space-y-2">
                <div className="font-pixel text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Key Deliverables:
                </div>
                <ul className="space-y-1.5">
                  {item.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#232323]"
                    >
                      <span className="w-4 h-4 rounded-md bg-[#22c55e] border border-[#232323] text-[#232323] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Community Suggestions Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="mt-10 neo-card p-6 sm:p-7 bg-[#232323] text-[#f1eee7] border-2 border-[#232323] shadow-[3px_3px_0px_#232323]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#22c55e] font-pixel text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>COMMUNITY INPUT</span>
            </div>
            <h3 className="font-pixel text-lg sm:text-xl font-bold text-[#f1eee7]">
              Have a feature request or model benchmark idea?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-bold mt-1 max-w-xl">
              Our development priorities are heavily shaped by player feedback and research experiments.
            </p>
          </div>

          <a
            href="mailto:support@botornot.so"
            className="neo-btn neo-btn-green px-6 py-2.5 font-pixel text-xs sm:text-sm font-bold tracking-wider rounded-lg text-[#232323] self-start sm:self-auto hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <span>SUBMIT FEEDBACK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}

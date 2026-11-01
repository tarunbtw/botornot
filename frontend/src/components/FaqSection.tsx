import React, { useState } from 'react'
import { NavArrowDown, NavArrowUp, HelpCircle } from 'iconoir-react'

export interface FAQItem {
  q: string
  a: string
}

export const FAQS: FAQItem[] = [
  {
    q: 'Are you talking to real humans or AI in the game?',
    a: 'You can be matched with either a live person or an AI. Both participate in the queue. Figuring out which one is chatting with you is the core challenge!',
  },
  {
    q: 'How long does each conversation last?',
    a: 'Each match lasts exactly two minutes (120 seconds). When the timer expires, you submit your deduction: Human or AI.',
  },
  {
    q: 'Do I need to register to play?',
    a: 'No! You can play instantly as a guest without any registration. Your tokens, streaks, and match stats are tracked automatically.',
  },
  {
    q: 'Why do modern AI bots sound so convincingly human?',
    a: 'Today’s neural language models are trained on billions of real conversations, allowing them to imitate colloquialisms, humor, natural pauses, and emotional nuances.',
  },
]

interface FaqSectionProps {
  onOpenSettings?: () => void
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenSettings: _onOpenSettings }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-black dark:text-white" />
          Frequently Asked Questions
        </h2>
      </div>

      {/* Clean vertical stack of 4 FAQs */}
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#181820] rounded-xl border border-black/15 dark:border-neutral-800 shadow-xs dark:shadow-none overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 font-display font-black text-sm text-black dark:text-white cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1F1F2B] transition-colors"
              >
                <span className="leading-snug">{faq.q}</span>
                {isOpen ? (
                  <NavArrowUp className="w-4 h-4 shrink-0 text-black dark:text-white" />
                ) : (
                  <NavArrowDown className="w-4 h-4 shrink-0 text-black dark:text-white" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-black/10 dark:border-neutral-800">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

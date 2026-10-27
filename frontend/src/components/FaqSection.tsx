import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Settings } from 'lucide-react'
import { Button } from './UI'

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
    q: 'Why do real humans sometimes sound like bots?',
    a: 'Meme slang, brief one-word answers, rapid texting habits, and lack of context can frequently make genuine people sound repetitive or robotic.',
  },
  {
    q: 'Why do modern AI bots sound so convincingly human?',
    a: 'Today’s neural language models are trained on billions of real conversations, allowing them to imitate colloquialisms, humor, natural pauses, and emotional nuances.',
  },
  {
    q: 'Is the chat safe and anonymous?',
    a: 'Yes. All chats are completely anonymous, ephemeral, and strictly moderated for gameplay.',
  },
]

interface FaqSectionProps {
  onOpenSettings?: () => void
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenSettings }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-black" />
          Frequently Asked Questions
        </h2>
        {onOpenSettings && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSettings}
            className="text-xs py-1.5 px-3 border-2"
          >
            <Settings className="w-3.5 h-3.5" /> Rules &amp; Settings
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_#000] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 font-display font-black text-sm text-black cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <span className="leading-snug">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 shrink-0 text-black" />
                ) : (
                  <ChevronDown className="w-4 h-4 shrink-0 text-black" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs font-bold text-neutral-700 leading-relaxed border-t-2 border-black/10">
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

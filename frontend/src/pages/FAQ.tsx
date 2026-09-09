import { Link } from 'react-router-dom'

interface FAQEntry {
  question: string
  answer: string
  linkText?: string
  linkHref?: string
}

const FAQ_DATA: FAQEntry[] = [
  {
    question: 'What is Bot or Not?',
    answer:
      'Bot or Not is a social Turing test game where you chat for two minutes and try to determine if you’re talking to a real person or an AI bot. Chat data may be used to train AI models. All information is public and can be shared online.',
  },
  {
    question: 'Who are the humans I’m chatting with?',
    answer:
      'Real players from around the world who are also trying to spot bots and prove they’re human.',
  },
  {
    question: 'Which AI models power the bots?',
    answer:
      'We use advanced Large Language Models including GPT-5, Claude, and Google Gemini Flash. Chat data from games may be used to improve these AI models.',
  },
  {
    question: 'Is the game free to play?',
    answer: 'Yes! The core game is completely free.',
  },
  {
    question: 'Where can I find the legal policies?',
    answer:
      'You can find our Terms of Use, Privacy Policy, and Cookie Policy on their respective pages. We encourage you to read them.',
  },
  {
    question: 'Will you shut down like the original game?',
    answer: 'No. We’re committed to keeping this game running and evolving long-term.',
  },
  {
    question: 'What’s the Turing Test?',
    answer:
      'Proposed by Alan Turing in 1950, the Turing Test evaluates a machine’s ability to exhibit intelligent behavior indistinguishable from a human.',
    linkText: 'Learn more in our Turing Test blog post.',
    linkHref: '/blog',
  },
  {
    question: 'How do I get better at detecting bots?',
    answer:
      'Practice asking unconventional questions. Bots excel at generic conversation but can struggle with recent events or deeply personal experiences.',
  },
  {
    question: 'Who created Bot or Not?',
    answer:
      'The game was created by Oleg (programming) and Kate (design). You can visit their websites at nederev.dev and katami.design.',
  },
  {
    question: 'How can I contact the Team?',
    answer:
      'Email us at support@botornot.so for questions, feedback, or bug reports.',
  },
]

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-pixel text-2xl sm:text-3xl text-[#22c55e] mb-8 tracking-tight font-bold">
        FAQ
      </h1>

      {/* Important notices directly on page background */}
      <div className="space-y-4 mb-8 text-sm sm:text-base leading-relaxed text-[#232323] font-bold">
        <p>
          <span className="text-[#22c55e]">Important:</span> All information on this site is public.
          Your chats can be shared online by other users or published on leaderboards. Do not share
          any personal information.
        </p>
        <p>
          This site is for everyone, including kids. If parents don&apos;t like this site, take your kids
          off it.
        </p>
      </div>

      {/* Q&A list directly on page background */}
      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#232323] font-bold">
        {FAQ_DATA.map((item, idx) => (
          <section key={idx}>
            <h2 className="font-pixel text-base sm:text-lg text-[#22c55e] font-bold mb-2">
              {item.question}
            </h2>
            <p>
              {item.answer}{' '}
              {item.linkText && item.linkHref && (
                <Link to={item.linkHref} className="text-[#22c55e] hover:underline ml-1">
                  {item.linkText}
                </Link>
              )}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

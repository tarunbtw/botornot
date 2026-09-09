import { useState } from 'react'
import { Brain, MessageSquare, Gamepad2, Bot, Zap, type LucideIcon } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  category: string
  readTime: string
  date: string
  author: string
  Icon: LucideIcon
  excerpt: string
  content: string[]
}

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'The Turing Test: Explained Through Bot or Not Game',
    category: 'Analysis',
    readTime: '4 min read',
    date: 'Aug 24, 2026',
    author: 'Oleg & Kate',
    Icon: Brain,
    excerpt:
      'How Alan Turing’s 1950 imitation game was brought into the 21st century as a high-speed social experiment on human perception.',
    content: [
      'In 1950, British mathematician Alan Turing published "Computing Machinery and Intelligence", posing the timeless question: Can machines think? Rather than debating definitions of consciousness, he proposed the Imitation Game.',
      'In Bot or Not, players face the modern equivalent: two minutes in an anonymous chatroom with no clues other than text. The game strips away visual and acoustic cues, forcing players to evaluate conversational cadence, emotional depth, and semantic spontaneity.',
      'Our data reveals that humans often rely on subtle linguistic markers—slang, typos, and hesitation—to detect fellow humans. Yet, as modern LLMs are tuned to produce organic hesitations, the boundary continues to blur.',
    ],
  },
  {
    id: 2,
    title: 'New Dating Concept by Humans and AI Inc.',
    category: 'Culture',
    readTime: '3 min read',
    date: 'Aug 18, 2026',
    author: 'Kate',
    Icon: MessageSquare,
    excerpt:
      'What happens when dating apps integrate blind Turing tests to weed out bots, catfishes, and scripted openers?',
    content: [
      'Modern digital romance suffers from an influx of automated spam bots, scripted icebreakers, and engagement-farming algorithms.',
      'By applying the Bot or Not mechanism to social connection, we discovered that authentic vulnerability and quirky spontaneity are the clearest indicators of true personhood.',
      'Users reported that guessing whether someone was real made initial conversations substantially more engaging than traditional swipe mechanics.',
    ],
  },
  {
    id: 3,
    title: 'The Turing Test: The Original Imitation Game',
    category: 'History',
    readTime: '6 min read',
    date: 'Aug 11, 2026',
    author: 'Research Team',
    Icon: Gamepad2,
    excerpt:
      'A deep-dive into historical attempts to pass the Turing test—from ELIZA in 1966 to Eugene Goostman and contemporary GPT-5 models.',
    content: [
      'The earliest conversational bot, Joseph Weizenbaum’s ELIZA (1966), operated on simple pattern matching. By reframing the user’s statements as questions like a Rogerian psychotherapist, ELIZA famously fooled early testers.',
      'Decades later, Eugene Goostman (2014) claimed to pass a 30% Turing threshold by posing as a 13-year-old Ukrainian boy to excuse grammatical errors and knowledge gaps.',
      'Today, large language models don’t need excuses—they possess vast encyclopedic knowledge and fluent phrasing. Ironically, over-politeness and lack of typos are now their biggest giveaways.',
    ],
  },
  {
    id: 4,
    title: 'When Large Language Models Pass the Turing Test',
    category: 'Research',
    readTime: '5 min read',
    date: 'Jul 29, 2026',
    author: 'Oleg',
    Icon: Bot,
    excerpt:
      'Statistical insights from 250,000 live rounds: which model prompts fool players most reliably?',
    content: [
      'Across thousands of rounds, AI bot victory rates fluctuate around 37% to 42%. In other words, in roughly 4 out of 10 interactions, players mistake an AI model for a human.',
      'The most successful bot personas are not intellectual polymaths, but relaxed, slightly sarcastic conversationalists who respond in concise lowercase sentences with occasional colloquialisms.',
      'Conversely, when bots generate long, comprehensive paragraphs packed with bullet points and summaries, human detection rates jump above 92%.',
    ],
  },
  {
    id: 5,
    title: 'Why People Confuse Human Typos with AI Tokens',
    category: 'Linguistics',
    readTime: '4 min read',
    date: 'Jul 15, 2026',
    author: 'Research Team',
    Icon: Zap,
    excerpt:
      'Linguistic analysis on why real people often get accused of being bots during fast 2-minute chats.',
    content: [
      'One of the most fascinating phenomena in Bot or Not is the false positive rate: real humans being voted as bots.',
      'When humans type quickly, use repetitive internet slang ("lol", "fr", "bro"), or give one-word answers, their conversational entropy drops, mimicking low-temperature neural outputs.',
    ],
  },
]

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activePost, setActivePost] = useState<BlogPost | null>(null)

  const categories = ['All', 'Analysis', 'Culture', 'History', 'Research', 'Linguistics']

  const filteredPosts =
    selectedCategory === 'All'
      ? POSTS
      : POSTS.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-3xl sm:text-4xl text-[#22c55e] tracking-tight font-bold mb-2">
          Blog &amp; Articles
        </h1>
        <p className="text-xs sm:text-sm text-[#232323] font-bold">
          Field notes, linguistic research, and empirical data from millions of Turing test rounds.
        </p>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`neo-btn px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              selectedCategory === cat
                ? 'bg-[#22c55e] text-[#232323]'
                : 'bg-[#f1eee7] text-[#232323] hover:bg-[#232323] hover:text-[#f1eee7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filteredPosts.map((post) => {
          const PostIcon = post.Icon
          return (
            <div
              key={post.id}
              onClick={() => setActivePost(post)}
              className="neo-card p-6 flex flex-col justify-between hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer group bg-[#f1eee7]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-[#f1eee7] border border-[#232323] text-[#232323]">
                    {post.category}
                  </span>
                  <span className="text-slate-600">{post.readTime}</span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#232323] text-[#22c55e] flex items-center justify-center flex-shrink-0">
                    <PostIcon className="w-5 h-5" />
                  </div>
                  <h2 className="font-pixel text-base font-bold text-[#232323] group-hover:text-[#22c55e] transition-colors leading-snug">
                    {post.title}
                  </h2>
                </div>

                <p className="text-xs text-[#232323] font-bold leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-[#232323]/20 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                <span>By {post.author}</span>
                <span className="text-[#22c55e] font-bold group-hover:underline">
                  READ ARTICLE →
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full Article Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232323]/70 backdrop-blur-xs">
          <div className="neo-card w-full max-w-2xl bg-[#f1eee7] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#232323] mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#22c55e]">
                <span>{activePost.category}</span>
                <span>•</span>
                <span>{activePost.readTime}</span>
                <span>•</span>
                <span className="text-[#232323]">{activePost.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="w-7 h-7 rounded-md bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-4 leading-snug">
              {activePost.title}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#232323] font-bold leading-relaxed mb-8">
              {activePost.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-[#232323]">
              <span className="text-xs text-[#232323] font-bold">Published by {activePost.author}</span>
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="neo-btn bg-[#232323] text-[#f1eee7] px-4 py-2 font-pixel text-xs font-bold rounded-lg"
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

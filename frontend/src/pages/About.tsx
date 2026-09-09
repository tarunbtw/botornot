import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-pixel text-2xl sm:text-3xl text-[#22c55e] mb-8 tracking-tight font-bold">
        About Us
      </h1>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#232323] font-bold">
        {/* What is Bot or Not? */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            What is Bot or Not?
          </h2>
          <p>
            Bot or Not is a social Turing test game. You get matched with a random chat partner for
            a two-minute conversation, then guess whether you were talking to a real person or an AI
            bot. It&apos;s that simple, and that addictive.
          </p>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            How It Works
          </h2>
          <p>
            Press play, get matched, and start chatting. After two minutes, cast your vote: Human or
            Bot? You&apos;ll earn points for correct guesses and climb the global leaderboards.
          </p>
        </section>

        {/* Our Mission */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            Our Mission
          </h2>
          <p>
            As AI gets smarter, telling humans and machines apart is becoming one of the most
            important skills of our time. We built this game to make that challenge fun, accessible,
            and eye-opening for everyone.
          </p>
        </section>

        {/* The Team */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            The Team
          </h2>
          <p>
            Bot or Not was created by <span className="text-[#22c55e]">Oleg</span> (programming)
            and <span className="text-[#22c55e]">Kate</span> (design).
          </p>
        </section>

        {/* Get in Touch */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            Get in Touch
          </h2>
          <p>
            Have questions, feedback, or just want to say hi? Email us at{' '}
            <a
              href="mailto:support@botornot.so"
              className="text-[#22c55e] hover:underline"
            >
              support@botornot.so
            </a>
            . You can also check out our{' '}
            <Link to="/faq" className="text-[#22c55e] hover:underline">
              FAQ
            </Link>{' '}
            for common questions.
          </p>
        </section>
      </div>
    </div>
  )
}

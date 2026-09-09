import { Link } from 'react-router-dom'

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-pixel text-2xl sm:text-3xl text-[#22c55e] mb-8 tracking-tight font-bold">
        Contact Us
      </h1>

      <p className="text-sm sm:text-base leading-relaxed text-[#232323] font-bold mb-8">
        We&apos;d love to hear from you. Whether you have a question about the game, found a bug, or
        just want to share your feedback, reach out using any of the options below.
      </p>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#232323] font-bold">
        {/* General Support */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            General Support
          </h2>
          <p>
            For questions, feedback, or bug reports, email us at{' '}
            <a href="mailto:support@botornot.so" className="text-[#22c55e] hover:underline">
              support@botornot.so
            </a>
          </p>
        </section>

        {/* Legal & Privacy */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            Legal &amp; Privacy
          </h2>
          <p>
            For privacy requests, data deletion, or legal inquiries, email{' '}
            <a href="mailto:legal@botornot.so" className="text-[#22c55e] hover:underline">
              legal@botornot.so
            </a>
          </p>
        </section>

        {/* Community */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-2">
            Community
          </h2>
          <p>
            Join the conversation on{' '}
            <a
              href="https://reddit.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#22c55e] hover:underline"
            >
              Reddit
            </a>
          </p>
        </section>

        {/* Helpful Links */}
        <section>
          <h2 className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold mb-3">
            Helpful Links
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <Link to="/faq" className="text-[#22c55e] hover:underline">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[#22c55e] hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-[#22c55e] hover:underline">
                Terms of Use
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { User } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="w-full bg-[#f1eee7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Refined Bold Logo: "bot or" line 1, "not?" line 2 */}
        <NavLink to="/" className="flex flex-col group leading-none select-none py-1">
          <span
            className="font-pixel font-black text-xl sm:text-2xl tracking-tight text-[#232323] "
            style={{
              WebkitTextStroke: '0.8px #232323',
              textShadow: '0.8px 0 0 #232323, 0 0.8px 0 #232323',
            }}
          >
            Bot or
          </span>
          <span
            className="font-pixel font-black text-xl sm:text-2xl tracking-tight text-[#22c55e]  -mt-0.5"
            style={{
              WebkitTextStroke: '0.8px #22c55e',
              textShadow: '0.8px 0 0 #22c55e, 0 0.8px 0 #22c55e',
            }}
          >
            not?
          </span>
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-bold">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            Blog
          </NavLink>
          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            FAQ
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            Contact
          </NavLink>
          <NavLink
            to="/turner-index"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? 'text-[#22c55e] underline underline-offset-4 decoration-2' : 'text-[#232323] hover:text-[#22c55e]'
              }`
            }
          >
            Turner Index
          </NavLink>
        </nav>

        {/* User Status / Coins */}
        <div className="flex items-center gap-2.5">
          {/* Coin Pill */}
          <div className="flex items-center gap-1.5 bg-[#f1eee7] border-2 border-[#232323] rounded-full px-2.5 py-1 shadow-[2px_2px_0px_#232323]">
            <div className="w-5 h-5 rounded-full bg-[#22c55e] border border-[#232323] flex items-center justify-center font-pixel text-xs text-[#232323] font-bold">
              H
            </div>
            <span className="font-pixel text-xs font-bold text-[#232323]">10</span>
          </div>

          {/* Profile Avatar Button using Lucide User icon */}
          <NavLink
            to="/turner-index"
            title="View Turner Index & Leaderboard"
            className="w-9 h-9 rounded-full bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center shadow-[2px_2px_0px_#232323] hover:-translate-y-0.5 transition-transform"
          >
            <User className="w-4 h-4 text-[#232323]" />
          </NavLink>
        </div>
      </div>
    </header>
  )
}

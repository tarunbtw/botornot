import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Monitor, Tablet } from 'lucide-react'

export default function TurnerIndex() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '14d'>('7d')

  return (
    <div className="w-full pb-20">
      {/* Top Live Ticker Marquee */}
      <div className="w-full overflow-hidden border-b-2 border-[#232323] bg-[#232323] text-[#f1eee7] py-2 text-xs">
        <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
          <span className="flex items-center gap-2">
            <span className="text-[#22c55e]">●</span> TURNER INDEX: <strong className="text-[#22c55e]">37%</strong>
            <span className="text-[#22c55e]">▲ +2%</span>
          </span>
          <span>|</span>
          <span className="flex items-center gap-2">
            HUMAN WIN: <strong className="text-[#f1eee7]">63%</strong>
            <span className="text-rose-400">▼ -2%</span>
          </span>
          <span>|</span>
          <span>
            GAMES TODAY: <strong className="text-[#f1eee7]">27,475</strong>
          </span>
          <span>|</span>
          <span>
            MOBILE ACCURACY: <strong className="text-[#f1eee7]">35%</strong>
          </span>
          <span>|</span>
          <span>
            DESKTOP ACCURACY: <strong className="text-[#f1eee7]">40%</strong>
          </span>
          <span>|</span>
          <span>
            TOP COUNTRY: <strong className="text-[#22c55e]">UNITED KINGDOM (64%)</strong>
          </span>
          <span>|</span>
          <span>
            MOST CHALLENGED: <strong className="text-rose-400">AUSTRALIA (59%)</strong>
          </span>
          <span>|</span>
          <span className="flex items-center gap-2">
            <span className="text-[#22c55e]">●</span> TURNER INDEX: <strong className="text-[#22c55e]">37%</strong>
            <span className="text-[#22c55e]">▲ +2%</span>
          </span>
          <span>|</span>
          <span className="flex items-center gap-2">
            HUMAN WIN: <strong className="text-[#f1eee7]">63%</strong>
            <span className="text-rose-400">▼ -2%</span>
          </span>
          <span>|</span>
          <span>
            GAMES TODAY: <strong className="text-[#f1eee7]">27,475</strong>
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#22c55e]/15 border-2 border-[#232323] text-xs font-bold text-[#15803d] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
          Weekly Index Report • 7-day data updated live
        </div>

        {/* Title */}
        <h1 className="font-pixel text-3xl sm:text-5xl font-bold text-[#232323] tracking-tight mb-2">
          The Turner Index
        </h1>
        <h2 className="font-pixel text-xl sm:text-2xl text-[#22c55e] font-bold mb-4">
          How well can humans still detect AI?
        </h2>
        <p className="text-sm sm:text-base text-[#232323] font-bold max-w-2xl leading-relaxed mb-10">
          A live, weekly-tracked measure of how often people fail to tell AI apart from other humans in
          real-time conversation across hundreds of thousands of rounds.
        </p>

        {/* Hero Metric Banner Card */}
        <div className="neo-card p-6 sm:p-8 mb-12 bg-[#f1eee7]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Overall Turner Index
              </span>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-pixel text-6xl sm:text-7xl font-bold text-[#22c55e]">
                  37%
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#22c55e]/20 border border-[#232323] text-xs font-bold text-[#15803d]">
                  ▼ -2% vs prev 7d
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#232323] mb-1">
                of users failed to detect AI
              </p>
              <p className="text-xs text-slate-600 font-bold">
                Based on 210,622 completed conversations in the last 7 days.
              </p>

              <div className="flex gap-3 mt-6">
                <Link
                  to="/"
                  className="neo-btn neo-btn-green px-5 py-2.5 font-pixel text-xs font-bold rounded-lg"
                >
                  TRY IT YOURSELF →
                </Link>
                <a
                  href="#livedata"
                  className="neo-btn bg-[#f1eee7] px-4 py-2.5 font-pixel text-xs font-bold rounded-lg"
                >
                  VIEW LIVE DATA ↓
                </a>
              </div>
            </div>

            {/* Sparkline Visual Card */}
            <div className="md:col-span-6 bg-[#f1eee7] p-5 rounded-xl border-2 border-[#232323]">
              <div className="flex justify-between items-center mb-3 text-xs font-bold text-slate-600">
                <span>7-DAY TREND (AI FOOL RATE)</span>
                <span className="text-[#22c55e]">STABLE (35-39%)</span>
              </div>
              {/* SVG Sparkline */}
              <div className="w-full h-32 flex items-end">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <path
                    d="M 0,60 L 50,55 L 100,58 L 150,50 L 200,54 L 250,48 L 300,52"
                    fill="none"
                    stroke="#232323"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0,60 L 50,55 L 100,58 L 150,50 L 200,54 L 250,48 L 300,52 L 300,100 L 0,100 Z"
                    fill="#22c55e"
                    fillOpacity="0.25"
                  />
                  <circle cx="300" cy="52" r="5" fill="#22c55e" stroke="#232323" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-bold">
                <span>Day 1 (39%)</span>
                <span>Day 4 (38%)</span>
                <span>Today (37%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Data Grid */}
        <section id="livedata" className="mb-14 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Live Data
              </span>
              <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323]">
                Live Turner Index Metrics
              </h2>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">TIMEFRAME:</span>
              {(['24h', '7d', '14d'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`neo-btn px-2.5 py-1 text-xs font-bold rounded-md ${
                    timeframe === tf ? 'bg-[#22c55e] text-[#232323]' : 'bg-[#f1eee7]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Turner Index (AI Win %)
              </span>
              <div className="font-pixel text-3xl font-bold text-[#22c55e] my-2">37%</div>
              <div className="text-xs text-[#15803d] font-bold mb-1">▼ -2% vs prev</div>
              <p className="text-[11px] text-[#232323] font-bold leading-snug">
                % of games where players incorrectly identified AI as human
              </p>
            </div>

            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Human Win %
              </span>
              <div className="font-pixel text-3xl font-bold text-[#232323] my-2">63%</div>
              <div className="text-xs text-[#15803d] font-bold mb-1">▲ +2% vs prev</div>
              <p className="text-[11px] text-[#232323] font-bold leading-snug">
                % of games where players correctly identified the partner
              </p>
            </div>

            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Total Games (24h)
              </span>
              <div className="font-pixel text-3xl font-bold text-[#232323] my-2">27,475</div>
              <div className="text-xs text-slate-600 font-bold mb-1">Active global queue</div>
              <p className="text-[11px] text-[#232323] font-bold leading-snug">
                Completed Turing rounds in the last 24-hour cycle
              </p>
            </div>

            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Games vs AI
              </span>
              <div className="font-pixel text-3xl font-bold text-[#22c55e] my-2">59%</div>
              <div className="text-xs text-slate-600 font-bold mb-1">↔ Balanced split</div>
              <p className="text-[11px] text-[#232323] font-bold leading-snug">
                Proportion of rounds where the partner was a language model
              </p>
            </div>
          </div>
        </section>

        {/* Device Breakdown with Lucide Icons */}
        <section className="mb-14">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Breakdown — Device
            </span>
            <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323]">
              How Performance Differs by Device
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-xs font-bold text-[#232323] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#22c55e]" />
                <span>Mobile</span>
              </span>
              <div className="font-pixel text-3xl font-bold text-[#232323] my-2">35%</div>
              <span className="text-xs text-slate-600 font-bold block mb-1">Failed to detect AI</span>
              <span className="text-[10px] text-slate-600 font-bold block">
                n = 122,813 sessions (last 7d)
              </span>
            </div>

            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-xs font-bold text-[#232323] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#22c55e]" />
                <span>Desktop</span>
              </span>
              <div className="font-pixel text-3xl font-bold text-[#232323] my-2">40%</div>
              <span className="text-xs text-slate-600 font-bold block mb-1">Failed to detect AI</span>
              <span className="text-[10px] text-slate-600 font-bold block">
                n = 81,899 sessions (last 7d)
              </span>
            </div>

            <div className="neo-card p-5 bg-[#f1eee7]">
              <span className="text-xs font-bold text-[#232323] flex items-center gap-2">
                <Tablet className="w-4 h-4 text-[#22c55e]" />
                <span>Tablet</span>
              </span>
              <div className="font-pixel text-3xl font-bold text-[#232323] my-2">40%</div>
              <span className="text-xs text-slate-600 font-bold block mb-1">Failed to detect AI</span>
              <span className="text-[10px] text-slate-600 font-bold block">
                n = 5,910 sessions (last 7d)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border-2 border-dashed border-[#232323] bg-[#f1eee7] text-xs text-[#232323] font-bold">
            Tablet and Desktop users are measurably more likely to misidentify AI compared to Mobile
            users — a 5-point gap this week.
          </div>
        </section>

        {/* Country Breakdown with Clean ISO Code Badges (No Emojis) */}
        <section className="mb-14">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Breakdown — Country
            </span>
            <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323]">
              Which Countries Detect AI Best
            </h2>
          </div>

          <div className="neo-card p-6 space-y-4 bg-[#f1eee7]">
            {[
              { rank: '01', country: 'United Kingdom', code: 'GB', score: 64, trend: '▼ -2%' },
              { rank: '02', country: 'United States', code: 'US', score: 62, trend: '↔ flat' },
              { rank: '03', country: 'Canada', code: 'CA', score: 62, trend: '▲ +3%' },
              { rank: '04', country: 'India', code: 'IN', score: 59, trend: '▲ +2%' },
              { rank: '05', country: 'Australia', code: 'AU', score: 59, trend: '▼ -1%' },
            ].map((c) => (
              <div key={c.rank} className="flex items-center gap-4 text-xs font-bold">
                <span className="w-6 text-slate-600">{c.rank}</span>
                <span className="w-8 text-center px-1 py-0.5 rounded bg-[#232323] text-[#22c55e] text-[10px] font-mono font-bold">
                  {c.code}
                </span>
                <span className="w-36 text-[#232323]">{c.country}</span>
                <div className="flex-1 h-3 bg-[#f1eee7] border border-[#232323] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22c55e] rounded-full"
                    style={{ width: `${c.score}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right text-[#232323]">{c.score}%</span>
                <span className="w-16 text-right text-slate-600 text-[10px]">{c.trend}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section className="neo-card p-6 sm:p-8 mb-12 bg-[#f1eee7]">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-4">
            How the Turner Index Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#232323] font-bold leading-relaxed">
            <div className="p-4 rounded-lg bg-[#f1eee7] border-2 border-[#232323]">
              <strong className="text-[#22c55e] font-bold block mb-1">01 • Real Conversation</strong>
              Each session is a live 2-minute conversation between a player and an anonymous partner.
            </div>
            <div className="p-4 rounded-lg bg-[#f1eee7] border-2 border-[#232323]">
              <strong className="text-[#22c55e] font-bold block mb-1">02 • Human or Machine</strong>
              The system randomly matches you with either a real human participant or a tuned AI model.
            </div>
            <div className="p-4 rounded-lg bg-[#f1eee7] border-2 border-[#232323]">
              <strong className="text-[#22c55e] font-bold block mb-1">03 • Final Judgment</strong>
              Players cast their final vote before the 120-second timer elapses.
            </div>
            <div className="p-4 rounded-lg bg-[#f1eee7] border-2 border-[#232323]">
              <strong className="text-[#22c55e] font-bold block mb-1">04 • Index Aggregation</strong>
              The decision is verified and added to the weekly live Turner Index benchmark dataset.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

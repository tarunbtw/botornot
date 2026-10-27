import React from 'react'

export type AdFormat = 'leaderboard' | 'skyscraper' | 'rectangle' | 'mobile_banner' | 'in_feed'

interface AdSlotProps {
  format: AdFormat
  className?: string
  id?: string
}

const FORMAT_SPECS: Record<
  AdFormat,
  { label: string; dimensions: string; containerClass: string }
> = {
  leaderboard: {
    label: 'Leaderboard (728x90 / Responsive)',
    dimensions: '728 × 90',
    containerClass: 'w-full max-w-[728px] min-h-[90px] h-[90px]',
  },
  skyscraper: {
    label: 'Skyscraper Rail (160x600)',
    dimensions: '160 × 600',
    containerClass: 'w-[160px] min-h-[600px] h-[600px]',
  },
  rectangle: {
    label: 'Medium Rectangle (300x250)',
    dimensions: '300 × 250',
    containerClass: 'w-full max-w-[300px] min-h-[250px] h-[250px]',
  },
  mobile_banner: {
    label: 'Mobile Banner (320x50)',
    dimensions: '320 × 50',
    containerClass: 'w-full max-w-[320px] min-h-[50px] h-[50px]',
  },
  in_feed: {
    label: 'In-Feed Native Card (Responsive)',
    dimensions: 'Responsive Native',
    containerClass: 'w-full min-h-[110px] h-auto',
  },
}

export const AdSlot: React.FC<AdSlotProps> = ({ format, className = '', id }) => {
  const spec = FORMAT_SPECS[format]

  return (
    <aside
      id={id}
      role="complementary"
      aria-label="Sponsored Advertisement"
      className={`mx-auto select-none overflow-hidden bg-white border-2 border-dashed border-black rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-neutral-50/50 ${spec.containerClass} ${className}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-[#FFD100] text-black border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#000]">
          Ad / Sponsored
        </span>
        <span className="text-[10px] font-mono font-bold text-neutral-500">
          {spec.dimensions}
        </span>
      </div>
      <p className="text-[11px] font-bold text-neutral-600 leading-tight">
        Targeted space optimized for SEO &amp; AdSense
      </p>
    </aside>
  )
}

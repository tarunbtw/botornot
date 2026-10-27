interface CyborgAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showShadow?: boolean
}

const SIZES = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

export function CyborgAvatar({ size = 'md', className = '', showShadow = true }: CyborgAvatarProps) {
  const sizeClass = SIZES[size] || SIZES.md

  return (
    <div
      className={`relative inline-block transition-transform duration-200 hover:scale-105 select-none ${sizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 28 28"
        className={`w-full h-full ${
          showShadow ? 'drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]' : ''
        }`}
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Headgear / Top Cyber Crown in Yellow & Black */}
        <rect x="9" y="1" width="10" height="2" fill="#FFD100" />
        <rect x="7" y="3" width="14" height="2" fill="#E6BC00" />
        <rect x="6" y="5" width="16" height="2" fill="#000000" />

        {/* --- LEFT SIDE: ROBOT / CYBORG (White & Yellow Sensor) --- */}
        {/* Robot Face Metal Shell (Clean White) */}
        <rect x="5" y="7" width="9" height="13" fill="#FFFFFF" />
        {/* Robot Tech Detail Lines */}
        <rect x="5" y="7" width="1" height="13" fill="#E5E7EB" />
        <rect x="6" y="14" width="3" height="1" fill="#E5E7EB" />
        <rect x="6" y="16" width="4" height="1" fill="#E5E7EB" />
        {/* Robot Optic Sensor Eye (Glowing Yellow + Black Core) */}
        <rect x="7" y="9" width="5" height="4" fill="#000000" />
        <rect x="8" y="10" width="3" height="2" fill="#FFD100" />
        <rect x="9" y="10" width="1" height="1" fill="#FFFFFF" />
        {/* Robot Cyber Port / Chin accent */}
        <rect x="7" y="18" width="4" height="1" fill="#FFD100" />

        {/* --- RIGHT SIDE: HUMAN FACE (Warm Yellow & Human Features) --- */}
        {/* Human Skin (Warm Yellow Tone) */}
        <rect x="14" y="7" width="9" height="13" fill="#FFD100" />
        {/* Human Hair fringe */}
        <rect x="21" y="7" width="2" height="13" fill="#000000" />
        {/* Human Eyebrow */}
        <rect x="15" y="8" width="5" height="1" fill="#000000" />
        {/* Human Eye */}
        <rect x="16" y="10" width="4" height="3" fill="#FFFFFF" />
        <rect x="17" y="10" width="2" height="3" fill="#000000" />
        <rect x="17" y="10" width="1" height="1" fill="#FFFFFF" />
        {/* Human Ear / Side Contour */}
        <rect x="22" y="11" width="1" height="4" fill="#E6BC00" />
        {/* Human Cheek Tint */}
        <rect x="15" y="13" width="2" height="2" fill="#FBBF24" />
        {/* Human Mouth / Smile */}
        <rect x="15" y="16" width="4" height="1" fill="#000000" />
        <rect x="16" y="17" width="2" height="1" fill="#E11D48" />

        {/* --- CENTER SPLIT DIVIDER (Crisp Solid Black) --- */}
        <rect x="13" y="5" width="2" height="15" fill="#000000" />

        {/* --- JAW & CHIN BASE --- */}
        <rect x="8" y="20" width="12" height="2" fill="#000000" />
        <rect x="10" y="22" width="8" height="2" fill="#000000" />
        {/* Left Chin (Robot White) */}
        <rect x="9" y="20" width="4" height="1" fill="#FFFFFF" />
        {/* Right Chin (Human Yellow) */}
        <rect x="15" y="20" width="4" height="1" fill="#FFD100" />
      </svg>
    </div>
  )
}

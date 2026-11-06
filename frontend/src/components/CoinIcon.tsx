import React from 'react'

interface CoinIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  animated?: boolean
}

export const CoinIcon: React.FC<CoinIconProps> = ({
  size = 'md',
  className = '',
  animated = false,
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 14
      : size === 'sm'
      ? 18
      : size === 'md'
      ? 22
      : size === 'lg'
      ? 34
      : 52 // xl

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${animated ? 'animate-[spin_2.5s_linear_infinite]' : ''} ${className}`}
    >
      {/* Outer 3D Shadow Edge */}
      <circle cx="16" cy="17" r="14" fill="#000000" />
      {/* Outer Coin Body & Thick Black Rim */}
      <circle cx="16" cy="16" r="14" fill="#FFC700" stroke="#000000" strokeWidth="2.5" />
      {/* Inner Face with Neo-Brutalist Yellow */}
      <circle cx="16" cy="16" r="11" fill="#FFD100" />
      {/* Inner Engraved Stamped Dotted Ring */}
      <circle
        cx="16"
        cy="16"
        r="8.5"
        fill="none"
        stroke="#D99B00"
        strokeWidth="1.2"
        strokeDasharray="2 1.5"
      />
      {/* Top Gloss Arc Highlight */}
      <path
        d="M9 10.5C10.5 8.5 13 7.5 16 7.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Embossed Cyborg Face (Bot or Not Half Robot / Half Human) */}
      <g transform="translate(6, 6) scale(0.714)">
        {/* Outer Headgear / Top Cyber Crown */}
        <rect x="9" y="1" width="10" height="2" fill="#000000" />
        <rect x="7" y="3" width="14" height="2" fill="#E6BC00" />
        <rect x="6" y="5" width="16" height="2" fill="#000000" />

        {/* --- LEFT SIDE: ROBOT (White & Yellow Sensor) --- */}
        <rect x="5" y="7" width="8" height="13" fill="#FFFFFF" />
        <rect x="5" y="7" width="1" height="13" fill="#000000" />
        <rect x="6" y="14" width="3" height="1" fill="#D1D5DB" />
        <rect x="6" y="16" width="3" height="1" fill="#D1D5DB" />
        {/* Robot Optic Sensor Eye */}
        <rect x="7" y="9" width="4" height="4" fill="#000000" />
        <rect x="8" y="10" width="2" height="2" fill="#FFD100" />
        <rect x="9" y="10" width="1" height="1" fill="#FFFFFF" />
        {/* Robot Cyber Port */}
        <rect x="7" y="18" width="4" height="1" fill="#FFD100" />

        {/* --- RIGHT SIDE: HUMAN FACE (Warm Yellow) --- */}
        <rect x="15" y="7" width="8" height="13" fill="#FFD100" />
        <rect x="21" y="7" width="2" height="13" fill="#000000" />
        <rect x="16" y="8" width="4" height="1" fill="#000000" />
        {/* Human Eye */}
        <rect x="16" y="10" width="4" height="3" fill="#FFFFFF" />
        <rect x="17" y="10" width="2" height="3" fill="#000000" />
        <rect x="17" y="10" width="1" height="1" fill="#FFFFFF" />
        {/* Human Mouth / Smile */}
        <rect x="16" y="16" width="3" height="1" fill="#000000" />

        {/* --- CENTER SPLIT DIVIDER --- */}
        <rect x="13" y="5" width="2" height="15" fill="#000000" />

        {/* --- JAW & CHIN BASE --- */}
        <rect x="8" y="20" width="12" height="2" fill="#000000" />
        <rect x="10" y="22" width="8" height="2" fill="#000000" />
      </g>
    </svg>
  )
}

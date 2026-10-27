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
      {/* Embossed Turing 'T' Stamp with Solid Black Shadow and Crisp Face */}
      <g>
        {/* Drop shadow of T */}
        <path
          d="M10.5 11.5H21.5V14H17.5V22H14.5V14H10.5V11.5Z"
          fill="#000000"
        />
        {/* Front face of T */}
        <path
          d="M10 11H21V13.5H17V21.5H14V13.5H10V11Z"
          fill="#000000"
        />
        <path
          d="M11 12H20V13H16.5V20.5H14.5V13H11V12Z"
          fill="#FFF48C"
        />
      </g>
    </svg>
  )
}

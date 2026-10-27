import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'dark' | 'purple'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#FFD100] text-black hover:bg-[#E6BC00] active:bg-[#CCA700]',
      secondary: 'bg-white text-black hover:bg-neutral-50 active:bg-neutral-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      success: 'bg-emerald-400 text-black hover:bg-emerald-500 active:bg-emerald-600',
      dark: 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 border-black',
      purple: 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      md: 'px-5 py-2.5 text-sm font-bold rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      lg: 'px-6 py-3.5 text-base font-extrabold rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
      xl: 'px-8 py-4 text-lg font-black rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'font-display transition-all duration-75 flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const hasCustomBg = className && /\bbg-/.test(className)
  return (
    <div
      className={cn(
        !hasCustomBg && 'bg-white',
        'rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const Badge = ({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'yellow' | 'success' | 'danger' | 'purple' | 'dark'
}) => {
  const variants = {
    default: 'bg-white text-black',
    yellow: 'bg-[#FFD100] text-black',
    success: 'bg-emerald-400 text-black',
    danger: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    dark: 'bg-black text-white',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-display font-black uppercase tracking-wider border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

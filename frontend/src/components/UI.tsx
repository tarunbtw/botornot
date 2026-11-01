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
      primary: 'bg-[#FFD100] text-black hover:bg-[#E6BC00] active:bg-[#CCA700] border border-black/80',
      secondary: 'bg-white dark:bg-[#1E1E26] text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-[#272733] border border-neutral-300 dark:border-neutral-700',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border border-black/80',
      success: 'bg-emerald-400 text-black hover:bg-emerald-500 active:bg-emerald-600 border border-black/80',
      dark: 'bg-black dark:bg-[#FFD100] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#E6BC00] border border-black/80 dark:border-black/20',
      purple: 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 border border-black/80',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs active:translate-x-[1px] active:translate-y-[1px]',
      md: 'px-4 py-2 text-sm font-bold rounded-xl shadow-xs active:translate-x-[1px] active:translate-y-[1px]',
      lg: 'px-6 py-3 text-base font-extrabold rounded-xl shadow-sm active:translate-x-[1px] active:translate-y-[1px]',
      xl: 'px-8 py-3.5 text-lg font-black rounded-2xl shadow-sm active:translate-x-[1px] active:translate-y-[1px]',
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
        !hasCustomBg && 'bg-white dark:bg-[#181820]',
        'rounded-2xl border border-black/15 dark:border-neutral-800 shadow-xs dark:shadow-none p-5 text-black dark:text-white',
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
    default: 'bg-white dark:bg-[#1E1E26] text-black dark:text-white',
    yellow: 'bg-[#FFD100] text-black',
    success: 'bg-emerald-400 text-black',
    danger: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    dark: 'bg-black text-white dark:bg-white dark:text-black',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-display font-black uppercase tracking-wider border border-black dark:border-neutral-600 rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

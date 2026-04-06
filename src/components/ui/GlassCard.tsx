import { forwardRef } from 'react'
import clsx from 'clsx'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  glowColor?: string
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, glow, glowColor, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('glass', className)}
        style={{
          ...(glow && glowColor
            ? { boxShadow: `0 0 30px ${glowColor}30, 0 0 60px ${glowColor}10` }
            : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
export default GlassCard

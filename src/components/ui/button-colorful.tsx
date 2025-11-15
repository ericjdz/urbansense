import * as React from "react"
import { ArrowUpRight } from "lucide-react"

interface ButtonColorfulProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export function ButtonColorful({
  style,
  label = "Explore Luneta",
  ...props
}: ButtonColorfulProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    height: '44px',
    padding: '0 20px',
    overflow: 'hidden',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    background: isHovered 
      ? 'linear-gradient(135deg, #0078D4 0%, #00A0E3 50%, #00C3FF 100%)'
      : 'linear-gradient(135deg, #0066B3 0%, #0088CC 50%, #00A8E8 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 10,
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...buttonStyle, ...style }}
      {...props}
    >
      <div style={contentStyle}>
        <span style={{ color: '#ffffff', fontWeight: 600 }}>{label}</span>
        <ArrowUpRight style={{ width: '16px', height: '16px', color: '#ffffff' }} />
      </div>
    </button>
  )
}

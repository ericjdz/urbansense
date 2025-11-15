import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const lunetaImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&auto=format&fit=crop',
    title: 'Rizal Monument & Park Plaza',
    caption: 'Iconic heritage landmark at the heart of Manila',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=1200&auto=format&fit=crop',
    title: 'Green Canopy Walkways',
    caption: 'Shaded pathways under heritage trees',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519923984312-e7c4c0d1e641?q=80&w=1200&auto=format&fit=crop',
    title: 'Open-Air Community Spaces',
    caption: 'Civic gathering areas for cultural events',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?q=80&w=1200&auto=format&fit=crop',
    title: 'Museum Quarter Views',
    caption: 'National Museum complex perimeter',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1542223533-2c85b9d4e7d2?q=80&w=1200&auto=format&fit=crop',
    title: 'Smart Canopy Network',
    caption: 'IoT-enabled shade structures for climate comfort',
  },
]

export default function LunetaCarousel() {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)
  const x = useMotionValue(0)

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1
      const targetX = -index * containerWidth

      animate(x, targetX, {
        type: 'spring',
        stiffness: 280,
        damping: 32,
      })
    }
  }, [index, x])

  // Auto-advance carousel
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % lunetaImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const handlePrevious = () => {
    setIndex((i) => (i - 1 + lunetaImages.length) % lunetaImages.length)
  }

  const handleNext = () => {
    setIndex((i) => (i + 1) % lunetaImages.length)
  }

  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  }

  const navButtonHoverStyle = {
    transform: 'translateY(-50%) scale(1.1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        marginBottom: '24px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        }}
        ref={containerRef}
      >
        <motion.div style={{ display: 'flex', x }}>
          {lunetaImages.map((item) => (
            <div
              key={item.id}
              style={{
                flexShrink: 0,
                width: '100%',
                height: '400px',
                position: 'relative',
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
              {/* Overlay gradient for text readability */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  padding: '32px 24px 24px',
                  color: 'white',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    opacity: 0.9,
                  }}
                >
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          style={{
            ...navButtonStyle,
            left: '16px',
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, navButtonHoverStyle)
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%)'
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          }}
          aria-label="Previous image"
        >
          <ChevronLeft style={{ width: '24px', height: '24px', color: '#333' }} />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          style={{
            ...navButtonStyle,
            right: '16px',
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, navButtonHoverStyle)
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%)'
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          }}
          aria-label="Next image"
        >
          <ChevronRight style={{ width: '24px', height: '24px', color: '#333' }} />
        </button>

        {/* Progress Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {lunetaImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                height: '8px',
                width: i === index ? '32px' : '8px',
                borderRadius: '4px',
                backgroundColor: i === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

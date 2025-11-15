import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeritageCarousel({ images = [], title = '' }) {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)
  const x = useMotionValue(0)

  useEffect(() => {
    if (containerRef.current && images.length > 0) {
      const containerWidth = containerRef.current.offsetWidth || 1
      const targetX = -index * containerWidth

      animate(x, targetX, {
        type: 'spring',
        stiffness: 280,
        damping: 32,
      })
    }
  }, [index, x, images.length])

  // Auto-advance carousel
  useEffect(() => {
    if (!isHovered && images.length > 1) {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % images.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isHovered, images.length])

  const handlePrevious = () => {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setIndex((i) => (i + 1) % images.length)
  }

  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px',
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No images available</p>
      </div>
    )
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
        position: 'relative',
        width: '100%',
        height: '400px',
        overflow: 'hidden',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      {/* Carousel Container */}
      <motion.div
        style={{
          display: 'flex',
          height: '100%',
          x,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              minWidth: '100%',
              height: '100%',
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)',
              }}
            />
            
            {/* Title Overlay */}
            {title && i === index && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px',
                  color: 'white',
                  zIndex: 5,
                }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {title}
                </h2>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            style={{ ...navButtonStyle, left: '16px' }}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, navButtonStyle, { left: '16px' })}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} color="#000" />
          </button>

          <button
            onClick={handleNext}
            style={{ ...navButtonStyle, right: '16px' }}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle, { left: 'auto', right: '16px' })}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, navButtonStyle, { right: '16px' })}
            aria-label="Next image"
          >
            <ChevronRight size={24} color="#000" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: i === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

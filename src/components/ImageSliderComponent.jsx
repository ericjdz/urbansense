import { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Stack } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

const DEFAULT_IMAGES = [
  'https://picsum.photos/seed/luneta1/1200/600',
  'https://picsum.photos/seed/luneta2/1200/600',
  'https://picsum.photos/seed/luneta3/1200/600',
  'https://picsum.photos/seed/luneta4/1200/600'
]

export default function ImageSliderComponent({ images = DEFAULT_IMAGES, interval = 4000 }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  const go = (dir) => setIndex(i => (i + (dir === 'next' ? 1 : -1) + images.length) % images.length)
  const goTo = (i) => setIndex(i)

  useEffect(() => {
    start()
    return stop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length])

  const start = () => {
    stop()
    timerRef.current = setInterval(() => go('next'), interval)
  }
  const stop = () => timerRef.current && clearInterval(timerRef.current)

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3 }} onMouseEnter={stop} onMouseLeave={start}>
      <AnimatePresence mode="popLayout">
        <motion.img
          key={index}
          src={images[index]}
          alt={`Slide ${index + 1}`}
          style={{ width: '100%', display: 'block' }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Arrows */}
      <IconButton onClick={() => go('prev')} sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'common.white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
        <ChevronLeftRoundedIcon />
      </IconButton>
      <IconButton onClick={() => go('next')} sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'common.white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
        <ChevronRightRoundedIcon />
      </IconButton>

      {/* Dots */}
      <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
        {images.map((_, i) => (
          <Box key={i} onClick={() => goTo(i)} sx={{ width: 10, height: 10, borderRadius: 10, cursor: 'pointer', bgcolor: i === index ? 'primary.main' : 'action.disabledBackground', boxShadow: i === index ? 2 : 0 }} />
        ))}
      </Stack>
    </Box>
  )
}

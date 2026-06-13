import { useEffect, useRef } from 'react'
import { media } from '../assets/media'

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  twinkle: number
}

export const ParticleAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create minimal stars
    const createStars = () => {
      const stars: Star[] = []
      const starCount = 60 // Reduced number

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.7, // Increased speed for more noticeable movement
          vy: (Math.random() - 0.5) * 0.7, // Increased speed for more noticeable movement
          size: Math.random() * 1.5 + 0.5, // Smaller stars
          opacity: Math.random() * 0.6 + 0.3,
          twinkle: Math.random() * Math.PI * 2
        })
      }

      return stars
    }

    starsRef.current = createStars()

    // Simple animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars only
      starsRef.current.forEach((star) => {
        // Gentle movement
        star.x += star.vx
        star.y += star.vy
        star.twinkle += 0.02 // Slower twinkling

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Subtle twinkling
        const twinkleOpacity = star.opacity * (0.7 + 0.3 * Math.sin(star.twinkle))

        // Simple white star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <>
      <img 
        src={media.backgrounds.cosmicHorizon} 
        alt="Space Background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',   // Make responsive without squishing
          objectPosition: 'center', // Center it nicely on mobile
          zIndex: -2,
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay so text is readable
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0, // Put particles just over the dark overlay
          pointerEvents: 'none'
        }}
      />
    </>
  )
}

import { useEffect, useRef } from "react"
import { useAnimationLoop } from "../hooks/useAnimationLoop"

interface StarFieldProps {
  width: number
  height: number
}

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
  speed: number
  offset: number
}

function StarField({ width, height }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const frameRef = useRef(0)

  // Génération des étoiles une seule fois au montage
  useEffect(() => {
    starsRef.current = Array.from({ length: 300 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.05 + 0.005, // vitesse de scintillement
      offset: Math.random() * Math.PI * 2,  // offset pour désynchroniser les étoiles
    }))
  }, [width, height])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    frameRef.current += 1

    starsRef.current.forEach((star) => {
      // Math.sin oscille entre -1 et 1 — on l'utilise pour faire varier l'alpha
      const flicker = Math.sin(frameRef.current * star.speed + star.offset)
      const currentAlpha = star.alpha + flicker * 0.5

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`
      ctx.fill()
    })
  }

  useAnimationLoop(draw)

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  )
}

export default StarField
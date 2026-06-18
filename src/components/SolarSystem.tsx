import { useRef, useState, useCallback } from "react"
import { PLANETS } from "../data/planets.js"
import { useAnimationLoop } from "../hooks/useAnimationLoop"
import StarField from "./StarField"
import PlanetCard from "./PlanetCard"
import "./SolarSystem.css"

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CX = WIDTH / 2
const CY = HEIGHT / 2

function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const planetsState = useRef(
    PLANETS.map((p) => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
      spinAngle: 0,
    }))
  )

  const [hoveredPlanet, setHoveredPlanet] = useState<typeof PLANETS[0] | null>(null)
  const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 })
  const mouseRef = useRef({ x: -999, y: -999 })

  function drawSun(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.shadowBlur = 40
    ctx.shadowColor = "#ffaa00"
    ctx.beginPath()
    ctx.arc(CX, CY, 20, 0, Math.PI * 2)
    ctx.fillStyle = "#ffe566"
    ctx.fill()
    ctx.restore()
  }

  function drawOrbit(ctx: CanvasRenderingContext2D, orbit: number) {
    ctx.beginPath()
    ctx.arc(CX, CY, orbit, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)"
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  function drawPlanet(
    ctx: CanvasRenderingContext2D,
    planet: typeof PLANETS[0] & { angle: number; spinAngle: number },
    isHovered: boolean
  ) {
    const x = CX + Math.cos(planet.angle) * planet.orbit
    const y = CY + Math.sin(planet.angle) * planet.orbit

    ctx.save()
    ctx.shadowBlur = isHovered ? 20 : 8
    ctx.shadowColor = planet.color
    ctx.beginPath()
    ctx.arc(x, y, planet.r, 0, Math.PI * 2)
    ctx.fillStyle = planet.color
    ctx.fill()

    if (planet.hasRing) {
      ctx.restore()
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, 0.3)
      ctx.beginPath()
      ctx.arc(0, 0, planet.r + 10, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(226, 209, 145, 0.45)"
      ctx.lineWidth = 5
      ctx.stroke()
    }

    ctx.restore()

    if (isHovered) {
      ctx.beginPath()
      ctx.arc(x, y, planet.r + 5, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    return { x, y }
  }

  function hitTest(planet: typeof PLANETS[0] & { angle: number }) {
    const x = CX + Math.cos(planet.angle) * planet.orbit
    const y = CY + Math.sin(planet.angle) * planet.orbit
    const dx = mouseRef.current.x - x
    const dy = mouseRef.current.y - y
    return Math.sqrt(dx * dx + dy * dy) < planet.r + 10
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    planetsState.current.forEach((p) => drawOrbit(ctx, p.orbit))
    drawSun(ctx)

    let newHovered: typeof PLANETS[0] | null = null
    let newPos = { x: 0, y: 0 }

    planetsState.current.forEach((planet) => {
      const isHovered = hitTest(planet)
      if (isHovered) newHovered = planet

      const pos = drawPlanet(ctx, planet, isHovered)
      if (isHovered) newPos = pos

      planet.angle += planet.speed * 0.1  //C'EST PARTIT LETS GOOOO
      planet.spinAngle += planet.selfSpin
    })

    setHoveredPlanet((prev) => {
      if (prev?.id !== newHovered?.id) {
        if (newHovered) setHoveredPos(newPos)
        return newHovered
      }
      if (newHovered) setHoveredPos(newPos)
      return prev
    })
  }, [])

  useAnimationLoop(draw)

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handleMouseLeave() {
    mouseRef.current = { x: -999, y: -999 }
    setHoveredPlanet(null)
  }

  return (
    <div className="solar-system">
      <h1 className="solar-system__title">Système Solaire</h1>
      <div
        className="solar-system__canvas-wrap"
        style={{ width: WIDTH, height: HEIGHT }}
      >
        <StarField width={WIDTH} height={HEIGHT} />
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            cursor: hoveredPlanet ? "pointer" : "default",
          }}
        />
        {hoveredPlanet && (
          <PlanetCard
            planet={hoveredPlanet}
            x={hoveredPos.x}
            y={hoveredPos.y}
            canvasW={WIDTH}
            canvasH={HEIGHT}
          />
        )}
      </div>
    </div>
  )
}

export default SolarSystem
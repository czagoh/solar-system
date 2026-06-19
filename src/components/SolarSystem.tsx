import { useRef, useState, useCallback } from "react"
import { useNavigate } from 'react-router-dom'
import { PLANETS } from "../data/planets.js"
import { useAnimationLoop } from "../hooks/useAnimationLoop"
import StarField from "./StarField"
import PlanetCard from "./PlanetCard"
import "./SolarSystem.css"

// ─── Dimensions du canvas ────────────────────────────────────────
// Modifie WIDTH et HEIGHT pour changer la taille du canvas
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const CX = WIDTH / 2  // Centre horizontal (position du soleil)
const CY = HEIGHT / 2 // Centre vertical (position du soleil)

// ─── Facteur d'échelle ────────────────────────────────────────────
// S'adapte à la taille de l'écran — 900px est la taille de référence
// Sur un petit écran tout se réduit proportionnellement
const SCALE = Math.min(WIDTH, HEIGHT) / 900

// ─── Props ───────────────────────────────────────────────────────
// onShowIntro : callback pour revenir à l'écran d'intro au clic sur le titre
interface SolarSystemProps {
  onShowIntro: () => void
}

function SolarSystem({ onShowIntro }: SolarSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ─── État des planètes ─────────────────────────────────────────
  // Chaque planète reçoit un angle de départ aléatoire pour ne pas
  // toutes commencer au même endroit. spinAngle gère la rotation
  // sur elle-même (non visible tant qu'on n'a pas de textures sur canvas)
  const planetsState = useRef(
    PLANETS.map((p) => ({
      ...p,
      angle: Math.random() * Math.PI * 2,
      spinAngle: 0,
    }))
  )

  // ─── States React ──────────────────────────────────────────────
  const [hoveredPlanet, setHoveredPlanet] = useState<typeof PLANETS[0] | null>(null)
  const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 })
  const [speedMultiplier, setSpeedMultiplier] = useState(1) // Valeur affichée dans le slider

  // ─── Refs (valeurs sans re-render) ─────────────────────────────
  const speedRef = useRef(1)                      // Vitesse réelle lue dans la boucle d'animation
  const mouseRef = useRef({ x: -999, y: -999 })  // Position souris hors écran par défaut
  const navigate = useNavigate()

  // ─── Dessin du soleil ──────────────────────────────────────────
  // Pour modifier le soleil : taille → arc(..., 20, ...) | couleur → fillStyle | halo → shadowBlur/shadowColor
  // SCALE appliqué sur le rayon pour que le soleil s'adapte à l'écran
  function drawSun(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.shadowBlur = 40          // Intensité du halo — augmente pour un glow plus fort
    ctx.shadowColor = "#ffaa00"  // Couleur du halo
    ctx.beginPath()
    ctx.arc(CX, CY, 20 * SCALE, 0, Math.PI * 2) // 20 = rayon de base, SCALE = adaptation écran
    ctx.fillStyle = "#ffe566"    // Couleur du soleil
    ctx.fill()
    ctx.restore()
  }

  // ─── Dessin des orbites ────────────────────────────────────────
  // Pour modifier les orbites : opacité → strokeStyle rgba(...) | épaisseur → lineWidth
  // Les rayons des orbites viennent de la propriété "orbit" dans planets.js
  // SCALE appliqué pour que les orbites s'adaptent à l'écran
  function drawOrbit(ctx: CanvasRenderingContext2D, orbit: number) {
    ctx.beginPath()
    ctx.arc(CX, CY, orbit * SCALE, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)" // 0.22 = opacité des orbites
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ─── Dessin des planètes ───────────────────────────────────────
  // La position x/y est calculée avec cos/sin à partir de l'angle orbital
  // Pour modifier : taille → planet.r dans planets.js | couleur → planet.color dans planets.js
  // Pour le halo hover : shadowBlur isHovered ? 20 : 8
  function drawPlanet(
    ctx: CanvasRenderingContext2D,
    planet: typeof PLANETS[0] & { angle: number; spinAngle: number },
    isHovered: boolean
  ) {
    // Conversion angle → coordonnées x/y sur l'orbite (avec SCALE pour la responsivité)
    const x = CX + Math.cos(planet.angle) * planet.orbit * SCALE
    const y = CY + Math.sin(planet.angle) * planet.orbit * SCALE

    ctx.save()
    ctx.shadowBlur = isHovered ? 20 : 8 // Glow plus fort au hover
    ctx.shadowColor = planet.color
    ctx.beginPath()
    ctx.arc(x, y, planet.r * SCALE, 0, Math.PI * 2) // rayon adapté à l'écran
    ctx.fillStyle = planet.color
    ctx.fill()

    // ─── Anneau de Saturne ─────────────────────────────────────
    // Déclenché par hasRing: true dans planets.js
    // scale(1, 0.3) aplatit le cercle pour simuler la perspective
    // planet.r + 10 = distance de l'anneau par rapport au centre de la planète
    if (planet.hasRing) {
      ctx.restore()
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, 0.3)       // Aplatissement — 0.3 = très plat, 0.5 = moins plat
      ctx.beginPath()
      ctx.arc(0, 0, (planet.r + 10) * SCALE, 0, Math.PI * 2) // +10 = écart anneau/planète
      ctx.strokeStyle = "rgba(226, 209, 145, 0.45)"           // Couleur et opacité de l'anneau
      ctx.lineWidth = 5        // Épaisseur de l'anneau
      ctx.stroke()
    }

    ctx.restore()

    // ─── Halo de sélection au hover ────────────────────────────
    // planet.r + 5 = taille du halo (5px autour de la planète)
    if (isHovered) {
      ctx.beginPath()
      ctx.arc(x, y, (planet.r + 5) * SCALE, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    return { x, y }
  }

  // ─── Détection du hover ────────────────────────────────────────
  // Pythagore : si la distance souris-planète < rayon + 10px → hover
  // Modifie + 10 pour agrandir/réduire la zone de détection
  function hitTest(planet: typeof PLANETS[0] & { angle: number }) {
    const x = CX + Math.cos(planet.angle) * planet.orbit * SCALE
    const y = CY + Math.sin(planet.angle) * planet.orbit * SCALE
    const dx = mouseRef.current.x - x
    const dy = mouseRef.current.y - y
    return Math.sqrt(dx * dx + dy * dy) < (planet.r + 10) * SCALE
  }

  // ─── Boucle d'animation (60fps) ───────────────────────────────
  // Appelée à chaque frame par useAnimationLoop via requestAnimationFrame
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Efface le canvas à chaque frame pour repartir de zéro
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    // Ordre de dessin important : orbites → soleil → planètes
    planetsState.current.forEach((p) => drawOrbit(ctx, p.orbit))
    drawSun(ctx)

    let newHovered: typeof PLANETS[0] | null = null
    let newPos = { x: 0, y: 0 }

    planetsState.current.forEach((planet) => {
      const isHovered = hitTest(planet)
      if (isHovered) newHovered = planet

      const pos = drawPlanet(ctx, planet, isHovered)
      if (isHovered) newPos = pos

      // ─── Vitesse orbitale ─────────────────────────────────────
      // planet.speed vient de planets.js (ex: Mercure 0.047, Neptune 0.005)
      // 0.1 = facteur global de ralentissement — augmente pour accélérer tout
      // speedRef.current = multiplicateur du slider utilisateur
      planet.angle += planet.speed * 0.1 * speedRef.current

      // ─── Rotation propre ──────────────────────────────────────
      // planet.selfSpin vient de planets.js
      // Non visible tant qu'on n'a pas de textures sur le canvas (Phase 2)
      planet.spinAngle += planet.selfSpin
    })

    // Met à jour la planète survolée uniquement si elle change
    // pour éviter des re-renders inutiles à 60fps
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

  // ─── Événements souris ────────────────────────────────────────
  // getBoundingClientRect() donne la position du canvas dans la page
  // On soustrait left/top pour avoir les coordonnées relatives au canvas
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handleMouseLeave() {
    mouseRef.current = { x: -999, y: -999 } // Hors écran = aucune planète survolée
    setHoveredPlanet(null)
  }

  function handleClick() {
    if (hoveredPlanet) {
      navigate(`/planet/${hoveredPlanet.id}`) // Redirige vers la page détail
    }
  }

  // ─── Retour intro au clic sur le titre ────────────────────────
  function handleTitleClick() {
    sessionStorage.removeItem('introSeen')
    onShowIntro()
  }

  return (
    <div className="solar-system">
      <h1
        className="solar-system__title"
        onClick={handleTitleClick}
        style={{ cursor: 'pointer' }}
      >
        Système Solaire
      </h1>
      <div
        className="solar-system__canvas-wrap"
        style={{ width: WIDTH, height: HEIGHT }}>

        {/* Fond étoilé statique — généré une seule fois au montage */}
        <StarField width={WIDTH} height={HEIGHT} />

        {/* Canvas principal — animé à 60fps */}
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            cursor: hoveredPlanet ? "pointer" : "default",
          }}
        />

        {/* Carte d'info — affichée uniquement au hover */}
        {hoveredPlanet && (
          <PlanetCard
            planet={hoveredPlanet}
            x={hoveredPos.x}
            y={hoveredPos.y}
            canvasW={WIDTH}
            canvasH={HEIGHT}
          />
        )}

        {/* ─── Slider de vitesse ───────────────────────────────────
            min/max : plage de vitesse (0 = pause, 100 = très rapide)
            step : précision du slider
            speedRef.current : valeur lue dans la boucle d'animation */}
        <div className="solar-system__speed">
          <span>VITESSE</span>
          <button
            className="solar-system__speed-btn"
            onClick={() => {
              const val = Math.max(0, speedRef.current - 0.5)
              setSpeedMultiplier(val)
              speedRef.current = val
            }}
          >
            −
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={speedMultiplier}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setSpeedMultiplier(val)
              speedRef.current = val
            }}
          />
          <button
            className="solar-system__speed-btn"
            onClick={() => {
              const val = Math.min(100, speedRef.current + 0.5)
              setSpeedMultiplier(val)
              speedRef.current = val
            }}
          >
            +
          </button>
          <span>{speedMultiplier.toFixed(1)}x</span>
          <button
            className="solar-system__speed-reset"
            onClick={() => {
              setSpeedMultiplier(1) // Remet le state à 1
              speedRef.current = 1  // Remet le ref à 1
            }}
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  )
}

export default SolarSystem
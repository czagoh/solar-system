interface PlanetCardProps {
  planet: {
    name: string
    type: string
    typeColor: string
    description: string
    size: string
    dist: string
    period: string
    temp: string
    atm: string
    moons: string
  }
  x: number
  y: number
  canvasW: number
  canvasH: number
}

function PlanetCard({ planet, x, y, canvasW, canvasH }: PlanetCardProps) {
    const CARD_WIDTH = 220
    const CARD_HEIGHT = 240
    const OFFSET = 18

    let left = x + OFFSET
    let top = y - CARD_HEIGHT / 2

    if (left + CARD_WIDTH > canvasW) left = x - CARD_WIDTH - OFFSET
    if (left < 8) left = 8
    if (top + CARD_HEIGHT > canvasH) top = canvasH - CARD_HEIGHT - 8
    if (top < 8) top = 8

    return (
        <div style={{
        position: "absolute",
        left,
        top,
        width: CARD_WIDTH,
        pointerEvents: "none",
        background: "rgba(8, 12, 30, 0.95)",
        border: "0.5px solid rgba(255,255,255,0.18)",
        borderRadius: 10,
        padding: "14px 16px",
        color: "#fff",
        animation: "fadeIn 0.15s ease",
        }}>
        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{planet.name}</p>
        <span style={{
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 4,
            padding: "2px 8px",
            display: "inline-block",
            marginBottom: 8,
            background: planet.typeColor + "22",
            color: planet.typeColor,
            border: `0.5px solid ${planet.typeColor}55`,
        }}>
            {planet.type}
        </span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 10px", lineHeight: 1.5 }}>
            {planet.description}
        </p>
        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            {[
            ["Diamètre", planet.size],
            ["Distance du Soleil", planet.dist],
            ["Période orbitale", planet.period],
            ["Température", planet.temp],
            ["Atmosphère", planet.atm],
            ["Lunes", planet.moons],
            ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{value}</span>
            </div>
            ))}
        </div>
        </div>
    )
}

export default PlanetCard
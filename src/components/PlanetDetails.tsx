import { useParams, useNavigate } from 'react-router-dom'
import { PLANETS } from '../data/planets.js'
import './PlanetDetails.css'

function PlanetDetails() {
    const { id } = useParams()
    const planet = PLANETS.find((pl) => pl.id === id)
    if (!planet) {
        return <p>Planète introuvable</p>
    }
    const navigate = useNavigate()
    const currentIndex = PLANETS.findIndex((p) => p.id === id)
    const prevPlanet = PLANETS[currentIndex - 1] ?? PLANETS[PLANETS.length - 1]
    const nextPlanet = PLANETS[currentIndex + 1] ?? PLANETS[0]

    return (
        
        <div className="planet-detail">
            <button className="planet-detail__back" onClick={() => navigate('/')}>
                ← Retour
            </button>

            {prevPlanet && (
                <button className="planet-detail__nav planet-detail__nav--prev" onClick={() => navigate(`/planet/${prevPlanet.id}`)}>
                    ← {prevPlanet.name}
                </button>
            )}

            {nextPlanet && (
                <button className="planet-detail__nav planet-detail__nav--next" onClick={() => navigate(`/planet/${nextPlanet.id}`)}>
                    {nextPlanet.name} →
                </button>
            )}

            <div className="planet-detail__layout">
                <div className="planet-detail__left">
                    <div
                        className="planet-detail__sphere"
                        style={{ backgroundImage: `url(/solar-system${planet.texture})` }}
                    />
                    <div className="planet-detail__coords">
                        <p>DIST. SOLEIL — {planet.dist}</p>
                        <p>RÉVOLUTION SOLAIRE — {planet.period}</p>
                    </div>
                </div>

                <div className="planet-detail__right">
                    <h1 className="planet-detail__name">{planet.name}</h1>
                    <span
                        className="planet-detail__type"
                        style={{
                            background: planet.typeColor + "22",
                            color: planet.typeColor,
                            border: `0.5px solid ${planet.typeColor}55`,
                        }}
                    >
                        {planet.type}
                    </span>
                    <div className="planet-detail__divider" />
                    <p className="planet-detail__description">{planet.description}</p>
                    <div className="planet-detail__card">
                        {[
                            ["Diamètre",            planet.size],
                            ["Température",         planet.temp],
                            ["Atmosphère",          planet.atm],
                            ["Lunes",               planet.moons],
                            ["Âge",                 planet.age],
                            ["Vitesse orbitale",    planet.orbitalSpeed],
                            ["Vitesse de rotation", planet.rotationSpeed],
                            ["Durée d'une journée", planet.dayLength],
                        ].map(([label, value]) => (
                            <div className="planet-detail__row" key={label}>
                                <span className="planet-detail__label">{label}</span>
                                <span className="planet-detail__value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default PlanetDetails
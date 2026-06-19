import { useState } from 'react'
import StarField from './StarField'
import './Intro.css'

interface IntroProps {
  onStart: () => void
}

function Intro({ onStart }: IntroProps) {
  const [leaving, setLeaving] = useState(false)

  function handleStart() {
    setLeaving(true)
    setTimeout(() => onStart(), 900)
  }

  return (
    <div className={`intro ${leaving ? 'intro--leaving' : ''}`}>
      <StarField width={window.innerWidth} height={window.innerHeight} />
      <div className="intro__content">
        <p className="intro__sub">— Bienvenue dans —</p>
        <h1 className="intro__title">Le Système Solaire</h1>
        <p className="intro__desc">
          8 planètes. 4,6 milliards d'années d'histoire.<br />
          Une étoile au centre de tout.
        </p>
        <button className="intro__btn" onClick={handleStart}>
          Explorer
        </button>
      </div>
    </div>
  )
}

export default Intro
import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import SolarSystem from './components/SolarSystem'
import PlanetDetails from './components/PlanetDetails'
import Intro from './components/Intro'
import './App.css'

function App() {
  // Vérifie si l'intro a déjà été vue pendant cette session
  const [started, setStarted] = useState(() => {
    return sessionStorage.getItem('introSeen') === 'true'
  })

  function handleStart() {
    sessionStorage.setItem('introSeen', 'true') // On mémorise
    setStarted(true)
  }

  return (
    <HashRouter>
      {!started && <Intro onStart={handleStart} />}
      <Routes>
        <Route path="/" element={<SolarSystem onShowIntro={() => setStarted(false)} />} />
        <Route path="/planet/:id" element={<PlanetDetails />} />
      </Routes>
    </HashRouter>
  )
}

export default App
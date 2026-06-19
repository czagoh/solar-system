import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import SolarSystem from './components/SolarSystem'
import PlanetDetails from './components/PlanetDetails'
import Intro from './components/Intro'
import './index.css'

function App() {
  const [started, setStarted] = useState(false)

  return (
    <HashRouter>
      {!started && <Intro onStart={() => setStarted(true)} />}
      <Routes>
        <Route path="/" element={<SolarSystem />} />
        <Route path="/planet/:id" element={<PlanetDetails />} />
      </Routes>
    </HashRouter>
  )
}

export default App
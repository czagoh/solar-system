import { HashRouter, Routes, Route } from 'react-router-dom'
import SolarSystem from './components/SolarSystem'
import PlanetDetail from './components/PlanetDetails'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SolarSystem />} />
        <Route path="/planet/:id" element={<PlanetDetail />} />
      </Routes>
    </HashRouter>
  )
}

export default App
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Baseline from './pages/Baseline'
import Session from './pages/Session'
import Progress from './pages/Progress'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/baseline" element={<Baseline />} />
      <Route path="/session" element={<Session />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import MainApp from './pages/MainApp.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<MainApp />} />
    </Routes>
  )
}
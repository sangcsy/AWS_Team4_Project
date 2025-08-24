import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import MainApp from './pages/MainApp.tsx'
import RandomChat from './pages/RandomChat.tsx'   

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/random-chat" element={<RandomChat />} /> 
      </Routes>
    </Router>
  )
}

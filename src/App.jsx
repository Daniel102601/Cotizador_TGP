import { Routes, Route } from "react-router-dom"
import Menu from "./pages/Menu"
import Cotizador from "./pages/cotizador"
import Nomina from "./pages/Nomina"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/cotizador" element={<Cotizador />} />
      <Route path="/nomina" element={<Nomina />} />
    </Routes>
  )
}

export default App
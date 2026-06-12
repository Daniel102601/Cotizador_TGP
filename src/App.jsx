import { Routes, Route } from "react-router-dom"
import Menu from "./pages/Menu"
import Cotizador from "./pages/cotizador"
import Nomina from "./pages/Nomina"
import Clientes from "./pages/Clientes" // 👈 Importamos el nuevo módulo

function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/cotizador" element={<Cotizador />} />
      <Route path="/nomina" element={<Nomina />} />
      {/* 👈 Le asignamos su ruta para que el menú la encuentre */}
      <Route path="/clientes" element={<Clientes />} /> 
    </Routes>
  )
}

export default App
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [mostrarModal, setMostrarModal] = useState(false)
  const [cargando, setCargando] = useState(true)

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    correo: "",
    direccion: ""
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true })

    if (!error && data) setClientes(data)
    setCargando(false)
  }

  const guardarCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      return alert("El nombre y el teléfono son obligatorios.")
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert([nuevoCliente])
      .select()

    if (!error && data) {
      setClientes([...clientes, data[0]])
      setNuevoCliente({ nombre: "", documento: "", telefono: "", correo: "", direccion: "" })
      setMostrarModal(false)
      alert("✅ Cliente guardado correctamente")
    } else {
      alert("Error: " + error.message)
    }
  }

  const eliminarCliente = async (id, nombre) => {
    if (window.confirm(`¿Deseas eliminar a ${nombre} de la lista activa?`)) {
      const { error } = await supabase
        .from("clientes")
        .update({ activo: false })
        .eq("id", id)

      if (!error) {
        setClientes(clientes.filter(c => c.id !== id))
      }
    }
  }

  // Filtro de búsqueda en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.documento.includes(busqueda)
  )

  const obtenerIniciales = (n) => n.substring(0, 2).toUpperCase()

  return (
    <div className="clientes-container" style={{ padding: "20px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <style>{`
        .header-cli { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
        .search-bar { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #cbd5e1; background: #fff; color: #000; font-size: 15px; margin-bottom: 20px; outline: none; }
        .search-bar:focus { border-color: #FFD000; box-shadow: 0 0 0 3px rgba(255, 208, 0, 0.2); }
        .grid-cli { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .card-cli { background: #fff; padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; position: relative; transition: 0.2s; }
        .card-cli:hover { border-color: #FFD000; transform: translateY(-2px); }
        .avatar-cli { width: 50px; height: 50px; border-radius: 12px; background: #000; color: #FFD000; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
        .btn-add { background: #FFD000; color: #000; border: none; padding: 14px 24px; border-radius: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 208, 0, 0.3); }
        .input-cli { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; margin-top: 5px; color: #000; background: #f8fafc; }
        
        @media (max-width: 600px) {
          .header-cli { flex-direction: column; align-items: stretch; text-align: center; }
          .grid-cli { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header-cli">
        <div>
          <h1 style={{ margin: 0, fontWeight: "900", color: "#000" }}>Directorio de Clientes</h1>
          <p style={{ margin: 0, color: "#64748b" }}>TGP Construcciones SAS</p>
        </div>
        <button className="btn-add" onClick={() => setMostrarModal(true)}>+ Nuevo Cliente</button>
      </div>

      <input 
        type="text" 
        className="search-bar" 
        placeholder="🔍 Buscar por nombre o documento..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>Cargando clientes...</p>
      ) : (
        <div className="grid-cli">
          {clientesFiltrados.map(c => (
            <div key={c.id} className="card-cli">
              <div className="avatar-cli">{obtenerIniciales(c.nombre)}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "17px", color: "#000" }}>{c.nombre}</h3>
                <p style={{ margin: "2px 0", color: "#64748b", fontSize: "13px" }}>📞 {c.telefono}</p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>ID: {c.documento || "N/A"}</p>
              </div>
              <button 
                onClick={() => eliminarCliente(c.id, c.nombre)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "18px" }}
              >🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR CLIENTE */}
      {mostrarModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0, color: "#000" }}>Registrar Cliente</h2>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Nombre o Empresa</label>
              <input className="input-cli" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Cédula o NIT</label>
              <input className="input-cli" value={nuevoCliente.documento} onChange={(e) => setNuevoCliente({...nuevoCliente, documento: e.target.value})} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Teléfono / WhatsApp</label>
              <input className="input-cli" type="tel" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Correo Electrónico</label>
              <input className="input-cli" type="email" value={nuevoCliente.correo} onChange={(e) => setNuevoCliente({...nuevoCliente, correo: e.target.value})} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
              <button onClick={guardarCliente} style={{ flex: 2, padding: "14px", background: "#000", color: "#FFD000", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer" }}>Guardar Cliente</button>
              <button onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: "14px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "15px" }
const modalStyle = { background: "#fff", padding: "30px", borderRadius: "24px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }
const labelStyle = { fontSize: "13px", fontWeight: "700", color: "#475569" }

export default Clientes
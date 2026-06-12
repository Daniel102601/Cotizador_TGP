import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"

function Menu() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0a0a, #1c1c1c)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Poppins', 'Inter', sans-serif",
        color: "#fff"
      }}
    >
      {/* 🔹 ESTILOS GLOBALES DEL MENÚ */}
      <style>{`
        .grid-menu { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 20px; 
          width: 100%; 
          max-width: 900px; 
          margin-top: 40px; 
        }
        
        .card-menu { 
          padding: 25px; 
          border-radius: 20px; 
          cursor: pointer; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
          transition: all 0.25s ease; 
        }
        
        .card-menu:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 15px 35px rgba(0,0,0,0.5); 
        }
        
        .card-menu:active { 
          transform: scale(0.97); 
        }
        
        .card-cotizador { background: linear-gradient(135deg, #FFD000, #ffb700); }
        .card-clientes { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); }
        .card-nomina { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 208, 0, 0.3); }

        /* Si la pantalla es grande (Tablet/PC), se ponen en columnas */
        @media (min-width: 768px) {
          .grid-menu { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* 🔹 HEADER */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <img
          src={logo}
          alt="Logo TGP"
          style={{ width: "110px", marginBottom: "10px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}
        />
        <h1 style={{ color: "#FFD000", margin: 0, fontWeight: "800", letterSpacing: "-0.5px" }}>
          Sistema TGP
        </h1>
        <p style={{ color: "#aaa", fontSize: "14px", margin: "5px 0 0 0" }}>
          Gestión empresarial integrada
        </p>
      </div>

      {/* 🔹 TARJETAS */}
      <div className="grid-menu">
        
        {/* 🔸 COTIZADOR */}
        <div className="card-menu card-cotizador" onClick={() => navigate("/cotizador")}>
          <h2 style={{ margin: 0, color: "#000", fontSize: "22px", fontWeight: "800" }}>📄 Cotizador</h2>
          <p style={{ margin: "8px 0 0 0", color: "#222", fontSize: "14px" }}>
            Genera cotizaciones profesionales en segundos.
          </p>
        </div>

        {/* 🔸 CLIENTES (NUEVO) */}
        <div className="card-menu card-clientes" onClick={() => navigate("/clientes")}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "22px", fontWeight: "800" }}>🤝 Clientes</h2>
          <p style={{ margin: "8px 0 0 0", color: "#ccc", fontSize: "14px" }}>
            Directorio y gestión de contactos comerciales.
          </p>
        </div>

        {/* 🔸 NOMINA */}
        <div className="card-menu card-nomina" onClick={() => navigate("/nomina")}>
          <h2 style={{ margin: 0, color: "#FFD000", fontSize: "22px", fontWeight: "800" }}>👷 Nómina</h2>
          <p style={{ margin: "8px 0 0 0", color: "#ccc", fontSize: "14px" }}>
            Administra empleados y genera comprobantes de pago.
          </p>
        </div>

      </div>

      {/* 🔹 FOOTER */}
      <div style={{ marginTop: "auto", paddingTop: "40px" }}>
        <p style={{ fontSize: "12px", color: "#555", fontWeight: "600", letterSpacing: "1px" }}>
          © TGP CONSTRUCCIONES SAS
        </p>
      </div>
    </div>
  )
}

export default Menu
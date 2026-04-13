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
        fontFamily: "Poppins, Arial",
        color: "#fff"
      }}
    >
      {/* 🔹 HEADER */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "110px",
            marginBottom: "10px"
          }}
        />

        <h1
          style={{
            color: "#FFD000",
            margin: 0,
            fontWeight: "600"
          }}
        >
          Sistema TGP
        </h1>

        <p style={{ color: "#aaa", fontSize: "14px" }}>
          Gestión empresarial
        </p>
      </div>

      {/* 🔹 TARJETAS */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          marginTop: "40px"
        }}
      >
        {/* 🔸 COTIZADOR */}
        <div
          onClick={() => navigate("/cotizador")}
          style={{
            background: "linear-gradient(135deg, #FFD000, #ffb700)",
            borderRadius: "18px",
            padding: "25px",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            transition: "all 0.25s ease",
            transform: "scale(1)"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={{ margin: 0, color: "#000" }}>📄 Cotizador</h2>
          <p style={{ marginTop: "8px", color: "#333" }}>
            Genera cotizaciones profesionales en segundos
          </p>
        </div>

        {/* 🔸 NOMINA */}
        <div
          onClick={() => navigate("/nomina")}
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "18px",
            padding: "25px",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 208, 0, 0.3)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            transition: "all 0.25s ease",
            transform: "scale(1)"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={{ margin: 0, color: "#FFD000" }}>👷 Nómina</h2>
          <p style={{ marginTop: "8px", color: "#ccc" }}>
            Administra empleados y genera comprobantes
          </p>
        </div>
      </div>

      {/* 🔹 FOOTER */}
      <div style={{ marginTop: "auto", paddingTop: "40px" }}>
        <p style={{ fontSize: "12px", color: "#777" }}>
          © TGP Construcciones SAS
        </p>
      </div>
    </div>
  )
}

export default Menu
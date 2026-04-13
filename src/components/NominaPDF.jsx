import logo from "../assets/logo.png"

function NominaPDF({ datos, calculos, formatoMoneda }) {

  const formatFecha = (f) =>
    f ? new Date(f).toLocaleDateString("es-CO") : "-"

  const totalDevengado =
    Number(calculos.sueldo) +
    Number(calculos.dominicales) +
    Number(calculos.extras)

  return (
    <div
      id="pdf-nomina"
      style={{
        width: "190mm",
        margin: "auto",
        background: "#ffffff",
        padding: "15mm",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: "#111",
        position: "relative",
        overflow: "hidden"
      }}
    >

      {/* 🔥 MARCA DE AGUA */}
      <img
        src={logo}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "320px",
          opacity: 0.04,
          zIndex: 0
        }}
      />

      {/* 🔹 CONTENIDO */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* 🔹 HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #FFD000",
            paddingBottom: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={logo} style={{ width: "65px" }} />
            <div>
              <h2 style={{ margin: 0, letterSpacing: "1px" }}>
                TGP CONSTRUCCIONES SAS
              </h2>
              <p style={{ margin: 0, fontSize: "11px", color: "#777" }}>
                Comprobante de nómina
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0 }}>DESPRENDIBLE</h3>
            <p style={{ margin: 0, fontSize: "11px", color: "#777" }}>
              {datos.fecha}
            </p>
          </div>
        </div>

        {/* 🔹 INFO EMPLEADO */}
        <div
          style={{
            marginTop: "15px",
            padding: "14px",
            borderRadius: "12px",
            background: "#fafafa",
            border: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "11px", color: "#777" }}>
              EMPLEADO
            </p>
            <h3 style={{ margin: "2px 0" }}>{datos.nombre}</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
              CC: {datos.documento}
            </p>
          </div>

          {/* 🔥 PERIODO PRO */}
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>
              PERIODO LIQUIDADO
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              {formatFecha(datos.fechaInicio)} → {formatFecha(datos.fechaFin)}
            </p>
          </div>
        </div>

        {/* 🔹 TABLA */}
        <div style={{ marginTop: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
              overflow: "hidden"
            }}
          >
            <thead>
              <tr style={{ background: "#FFD000" }}>
                <th style={th}>Concepto</th>
                <th style={th}>Devengado</th>
                <th style={th}>Deducción</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={td}>Sueldo</td>
                <td style={tdRight}>{formatoMoneda(calculos.sueldo)}</td>
                <td style={tdRight}>—</td>
              </tr>

              <tr>
                <td style={td}>Dominicales</td>
                <td style={tdRight}>{formatoMoneda(calculos.dominicales)}</td>
                <td style={tdRight}>—</td>
              </tr>

              <tr>
                <td style={td}>Horas Extra</td>
                <td style={tdRight}>{formatoMoneda(calculos.extras)}</td>
                <td style={tdRight}>—</td>
              </tr>

              <tr>
                <td style={td}>Préstamo</td>
                <td style={tdRight}>—</td>
                <td style={tdRight}>{formatoMoneda(calculos.prestamo)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🔹 RESUMEN */}
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <div
            style={{
              width: "260px",
              background: "#000",
              color: "#fff",
              borderRadius: "12px",
              padding: "15px"
            }}
          >
            <p style={{ margin: 0, color: "#FFD000", fontSize: "12px" }}>
              RESUMEN
            </p>

            <p style={{ margin: "6px 0" }}>
              Devengado:
              <br />
              {formatoMoneda(totalDevengado)}
            </p>

            <p style={{ margin: "6px 0" }}>
              Deducciones:
              <br />
              {formatoMoneda(calculos.prestamo)}
            </p>

            <hr style={{ borderColor: "#444" }} />

            <h2 style={{ margin: 0, color: "#FFD000" }}>
              {formatoMoneda(calculos.neto)}
            </h2>
          </div>
        </div>

        {/* 🔹 FIRMAS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "70px",
            textAlign: "center",
            fontSize: "12px"
          }}
        >
          <div style={{ width: "40%" }}>
            <hr />
            Firma Responsable
          </div>

          <div style={{ width: "40%" }}>
            <hr />
            Firma Empleado
          </div>
        </div>

        {/* 🔹 FOOTER */}
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "10px",
            color: "#777"
          }}
        >
          TGP Construcciones SAS · Documento generado automáticamente
        </div>
      </div>
    </div>
  )
}

// 🔹 ESTILOS
const th = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold"
}

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
}

const tdRight = {
  padding: "10px",
  textAlign: "right",
  borderBottom: "1px solid #eee"
}

export default NominaPDF
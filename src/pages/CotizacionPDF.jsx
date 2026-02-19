import logo from "../assets/logo.png"

function CotizacionPDF({
  numeroCotizacion,
  fecha,
  cliente,
  items,
  subtotal,
  administracion,
  imprevistos,
  utilidad,
  iva,
  totalGeneral,
  garantia,
  tiempoEntrega,
  observaciones,
  formatoMoneda
}) {
  return (

      <div
        id="area-pdf"
        style={{
          width: "794px",           // ancho A4 en px
          minHeight: "1123px",      // alto A4 en px
          padding: "50px",
          backgroundColor: "white",
          color: "black",
          fontFamily: "'Arial', sans-serif",
          margin: "auto",
          boxSizing: "border-box"
        }}>

      {/* 🔹 ENCABEZADO EMPRESARIAL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Logo TGP"
            style={{ width: "110px", marginRight: "20px" }}
          />

          <div>
            <h2 style={{ margin: 0 }}>CONSTRUCCIONES TGP SAS</h2>
            <p style={{ margin: 0, fontSize: "13px" }}>
              DE LA IDEA A LA OBRA
            </p>
          </div>
        </div>

        <div style={{ fontSize: "12px", textAlign: "right", lineHeight: "18px" }}>
          <p style={{ margin: 0 }}><strong>NIT:</strong> 901.790.921-5</p>
          <p style={{ margin: 0 }}>Bogotá, Colombia</p>
          <p style={{ margin: 0 }}>350 859 8273 - 301 687 2575</p>
          <p style={{ margin: 0 }}>
            tgpconstrucciones@gmail.com
          </p>
        </div>
      </div>

      <hr style={{ border: "2px solid #FFD000", marginBottom: "25px" }} />

      {/* 🔹 INFORMACIÓN COTIZACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}
      >
        <div>
          <p><strong>COTIZACIÓN N°:</strong> {numeroCotizacion}</p>
        </div>
        <div>
          <p><strong>Fecha:</strong> {fecha}</p>
        </div>
      </div>

      <hr />

      {/* 🔹 DATOS CLIENTE */}
      <h3>Datos del Cliente</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <p><strong>Nombre:</strong> {cliente.nombre}</p>
        <p><strong>Documento / NIT:</strong> {cliente.documento}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>
      </div>

      <hr />

      {/* 🔹 DETALLE */}
      <h3>Detalle de la Cotización</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>Descripción</th>
            <th style={thStyle}>Cant</th>
            <th style={thStyle}>V. Unit</th>
            <th style={thStyle}>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={tdCenter}>{index + 1}</td>
              <td style={tdLeft}>{item.descripcion}</td>
              <td style={tdCenter}>{item.cantidad}</td>
              <td style={tdRight}>
                {formatoMoneda(item.valorUnitario)}
              </td>
              <td style={tdRight}>
                {formatoMoneda(item.cantidad * item.valorUnitario)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: "30px 0" }} />

      {/* 🔹 RESUMEN FINANCIERO ALINEADO DERECHA */}
      <div style={{ width: "320px", marginLeft: "auto" }}>
        {resumenItem("Subtotal", subtotal)}
        {resumenItem("Administración", administracion)}
        {resumenItem("Imprevistos", imprevistos)}
        {resumenItem("Utilidad", utilidad)}
        {resumenItem("IVA", iva)}

        <hr />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "18px"
          }}
        >
          <span>Total General</span>
          <span>{formatoMoneda(totalGeneral)}</span>
        </div>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* 🔹 CONDICIONES */}
      <h3>Condiciones Comerciales</h3>
      <p><strong>VALIDEZ:</strong> 5-6 días hábiles</p>
      <p>
        <strong>PAGO:</strong> Efectivo o cuenta 108 0000 7115 - Bancolombia
      </p>
      <p><strong>Garantía:</strong> {garantia}</p>
      <p><strong>Tiempo de entrega:</strong> {tiempoEntrega}</p>
      <p><strong>Observaciones:</strong> {observaciones}</p>

      <hr />

      {/* 🔹 PIE */}
      <div style={{ marginTop: "40px", fontSize: "12px", textAlign: "center" }}>
        <p>TGP Construcciones SAS · Colombia</p>
        <p>Gracias por confiar en nosotros</p>
      </div>

    </div>
  )

  function resumenItem(label, value) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span>{label}</span>
        <span>{formatoMoneda(value)}</span>
      </div>
    )
  }
}

/* 🔹 ESTILOS TABLA */
const thStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "center",
  fontWeight: "bold"
}

const tdLeft = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "left"
}

const tdCenter = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "center"
}

const tdRight = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "right"
}

export default CotizacionPDF

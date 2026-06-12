import React from 'react';

function CotizacionPDF({
  numeroCotizacion,
  fecha,
  cliente,
  items = [],
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
      style={{
        width: "100%", 
        maxWidth: "794px", // Ancho exacto de A4 para evitar recortes
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "40px",
        color: "#000000", // Negro del logo
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
        lineHeight: "1.5",
        fontSize: "12px"
      }}
    >
      {/* ENCABEZADO PRINCIPAL */}
      <div style={{ display: "table", width: "100%", borderBottom: "4px solid #FFCC00", paddingBottom: "20px", marginBottom: "25px", boxSizing: "border-box" }}>
        
        {/* Info de la Empresa y Logo */}
        <div style={{ display: "table-cell", width: "65%", verticalAlign: "middle" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* Reemplaza la ruta del src con la ruta real de tu logo */}
            <img 
              src="/public/logo192.png" 
              alt="TGP Construcciones Logo" 
              style={{ width: "80px", height: "auto" }} 
            />
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#000000", letterSpacing: "-0.5px" }}>
                CONSTRUCCIONES TGP SAS
              </h1>
              <p style={{ margin: "2px 0 8px 0", color: "#FFCC00", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px" }}>
                Soluciones Integrales en Construcción e Infraestructura
              </p>
              <div style={{ color: "#333333", fontSize: "10px", lineHeight: "1.4" }}>
                <p style={{ margin: 0 }}><strong>NIT:</strong> 901.790.921</p>
                <p style={{ margin: 0 }}><strong>Teléfono:</strong> +57 350 859 8273 | +57 301 6872575</p>
                <p style={{ margin: 0 }}><strong>Email:</strong> construccionestgp@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info del Documento */}
        <div style={{ display: "table-cell", width: "35%", textAlign: "right", verticalAlign: "top" }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#000000", letterSpacing: "1px" }}>
            COTIZACIÓN
          </h2>
          <div style={{ display: "inline-block", marginTop: "10px", textAlign: "left", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#000000", color: "#FFCC00", padding: "6px 20px", fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>
              {numeroCotizacion}
            </div>
            <div style={{ padding: "6px 20px", backgroundColor: "#f9f9f9", fontSize: "11px", color: "#000000" }}>
              <strong>Fecha:</strong> {fecha}
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL CLIENTE */}
      <div style={{ backgroundColor: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "15px", marginBottom: "25px", boxSizing: "border-box" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#000000", fontWeight: "bold", borderBottom: "1px solid #cccccc", paddingBottom: "5px" }}>
          DATOS DEL CLIENTE / PROYECTO
        </h3>
        
        <div style={{ display: "table", width: "100%", tableLayout: "fixed" }}>
          <div style={{ display: "table-cell", width: "50%", paddingRight: "10px", lineHeight: "1.6" }}>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "#666666" }}>Cliente:</span> <strong>{cliente?.nombre}</strong></div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "#666666" }}>NIT/CC:</span> <span>{cliente?.documento}</span></div>
          </div>
          <div style={{ display: "table-cell", width: "50%", paddingLeft: "10px", lineHeight: "1.6" }}>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "#666666" }}>Teléfono:</span> <span>{cliente?.telefono}</span></div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: "#666666" }}>Dirección/Obra:</span> <span>{cliente?.direccion}</span></div>
          </div>
        </div>
      </div>

      {/* TABLA DE PRESUPUESTO */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px", tableLayout: "fixed", boxSizing: "border-box" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "6%", textAlign: "center" }}>#</th>
            <th style={{ ...thStyle, width: "46%", textAlign: "left" }}>Descripción de Actividades</th>
            <th style={{ ...thStyle, width: "10%", textAlign: "center" }}>Cant.</th>
            <th style={{ ...thStyle, width: "19%", textAlign: "right" }}>Val. Unitario</th>
            <th style={{ ...thStyle, width: "19%", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={{ ...tdStyle, textAlign: "center", color: "#666666" }}>{index + 1}</td>
              <td style={{ ...tdStyle, fontWeight: "500" }}>{item.descripcion}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{item.cantidad}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{formatoMoneda(item.valorUnitario)}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold", color: "#000000" }}>
                {formatoMoneda(item.cantidad * item.valorUnitario)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BLOQUE DE LIQUIDACIÓN / RESUMEN AIU */}
      <div style={{ display: "table", width: "100%", marginTop: "15px", boxSizing: "border-box" }}>
        {/* Espacio izquierdo libre */}
        <div style={{ display: "table-cell", width: "45%" }}></div>
        
        {/* Cuadro de Totales */}
        <div style={{ display: "table-cell", width: "55%", verticalAlign: "top" }}>
          <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
            <ResumenFila label="Costo Directo (Subtotal)" valor={formatoMoneda(subtotal)} />
            <ResumenFila label="Administración" valor={formatoMoneda(administracion)} />
            <ResumenFila label="Imprevistos" valor={formatoMoneda(imprevistos)} />
            <ResumenFila label="Utilidad" valor={formatoMoneda(utilidad)} />
            <ResumenFila label="IVA sobre Utilidad" valor={formatoMoneda(iva)} />
            
            <div
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "12px 15px",
                fontWeight: "bold",
                fontSize: "16px",
                display: "table",
                width: "100%",
                boxSizing: "border-box"
              }}
            >
              <div style={{ display: "table-cell", textAlign: "left" }}>TOTAL GENERAL</div>
              <div style={{ display: "table-cell", textAlign: "right", color: "#FFCC00" }}>
                {formatoMoneda(totalGeneral)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONDICIONES COMERCIALES */}
      <div style={{ marginTop: "30px", backgroundColor: "#f9f9f9", borderRadius: "6px", padding: "15px", border: "1px solid #e0e0e0", boxSizing: "border-box" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#000000", fontWeight: "bold" }}>
          CONDICIONES TÉCNICAS Y COMERCIALES
        </h4>
        <div style={{ fontSize: "10px", color: "#333333", lineHeight: "1.5" }}>
          <div style={{ marginBottom: "3px" }}>• <strong>Validez de la oferta:</strong> 15 días calendario a partir de la fecha.</div>
          <div style={{ marginBottom: "3px" }}>• <strong>Garantía de obra:</strong> {garantia || "12 meses en estabilidad de obra civil."}</div>
          <div style={{ marginBottom: "3px" }}>• <strong>Tiempo de ejecución:</strong> {tiempoEntrega || "A convenir según acta de inicio."}</div>
          
          {observaciones && (
            <div style={{ marginTop: "10px" }}>
              <strong>Notas adicionales:</strong>
              <div style={{ whiteSpace: "pre-line", marginTop: "4px", padding: "8px", backgroundColor: "#ffffff", borderRadius: "4px", border: "1px solid #e0e0e0", color: "#666666" }}>
                {observaciones}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <div style={{ marginTop: "20px", textAlign: "center", borderTop: "2px solid #FFCC00", paddingTop: "12px", color: "#666666", fontSize: "10px" }}>
        Construimos confianza, calidad y futuro.
      </div>
    </div>
  );
}

/* ESTILOS AUXILIARES */

const thStyle = {
  backgroundColor: "#000000", 
  color: "#FFCC00", // Letras amarillas en fondo negro para resaltar
  padding: "8px 10px",
  fontSize: "10px",
  fontWeight: "bold",
  textTransform: "uppercase",
  border: "none"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #e0e0e0",
  fontSize: "11px",
  verticalAlign: "middle",
  wordWrap: "break-word"
};

const ResumenFila = ({ label, valor }) => (
  <div
    style={{
      display: "table",
      width: "100%",
      padding: "8px 15px",
      borderBottom: "1px solid #e0e0e0",
      fontSize: "11px",
      backgroundColor: "#ffffff",
      boxSizing: "border-box"
    }}
  >
    <div style={{ display: "table-cell", textAlign: "left", color: "#333333" }}>{label}</div>
    <div style={{ display: "table-cell", textAlign: "right", fontWeight: "bold", color: "#000000" }}>{valor}</div>
  </div>
);

export default CotizacionPDF;
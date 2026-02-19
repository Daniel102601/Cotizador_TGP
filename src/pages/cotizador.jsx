import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import "../cotizador.css"
import CotizacionPDF from "./CotizacionPDF"

function Cotizador() {

  // 🔹 Fecha automática
  const fechaActual = new Date().toLocaleDateString("sv-SE")
  const [fecha, setFecha] = useState(fechaActual)

  // 🔹 Cotizaciones guardadas
  const [cotizacionesGuardadas, setCotizacionesGuardadas] = useState([])

  // 🔹 Número de cotización (se genera al guardar)
  const [numeroCotizacion, setNumeroCotizacion] = useState("COT-1000")

  // 🔹 Datos cliente
  const [cliente, setCliente] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    direccion: ""
  })

  // 🔹 Condiciones comerciales
  const [garantia, setGarantia] = useState("")
  const [tiempoEntrega, setTiempoEntrega] = useState("")
  const [observaciones, setObservaciones] = useState("")

  // 🔹 Opciones activables
  const [aplicarAdministracion, setAplicarAdministracion] = useState(true)
  const [aplicarImprevistos, setAplicarImprevistos] = useState(true)
  const [aplicarUtilidad, setAplicarUtilidad] = useState(true)
  const [aplicarIva, setAplicarIva] = useState(true)

  // 🔹 Items
  const [items, setItems] = useState([
    { descripcion: "", cantidad: 1, valorUnitario: 0 }
  ])

  // 🔹 Cargar cotizaciones guardadas al montar
  useEffect(() => {
    const guardadas = localStorage.getItem("cotizaciones")
    if (guardadas) {
      setCotizacionesGuardadas(JSON.parse(guardadas))
    }

    // Generar número inicial según último guardado
    const ultimoNumero = localStorage.getItem("contadorCotizaciones")
    if (ultimoNumero) {
      setNumeroCotizacion(`COT-${String(parseInt(ultimoNumero) + 1).padStart(4, "1")}`)
    }
  }, [])

  // 🔹 Funciones de items
  const agregarItem = () => {
    setItems([...items, { descripcion: "", cantidad: 1, valorUnitario: 0 }])
  }

  const eliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items]
    if (campo === "cantidad" || campo === "valorUnitario") {
      valor = Number(valor)
      if (valor < 0) valor = 0
    }
    nuevosItems[index][campo] = valor
    setItems(nuevosItems)
  }

  const calcularTotalItem = (item) => item.cantidad * item.valorUnitario

  const subtotal = items.reduce((acc, item) => acc + calcularTotalItem(item), 0)

  // 🔹 Cálculos base
  const administracionBase = subtotal * 0.05
  const imprevistosBase = administracionBase * 0.04
  const utilidadBase = subtotal * 0.05
  const ivaBase = utilidadBase * 0.19

  const administracion = aplicarAdministracion ? administracionBase : 0
  const imprevistos = aplicarAdministracion && aplicarImprevistos ? imprevistosBase : 0
  const utilidad = aplicarUtilidad ? utilidadBase : 0
  const iva = aplicarUtilidad && aplicarIva ? ivaBase : 0

  const totalGeneral = subtotal + administracion + imprevistos + utilidad + iva

  const formatoMoneda = (valor) =>
    valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    })

  // 🔹 Guardar cotización (incrementa número correctamente)
  const guardarCotizacion = () => {
    let lista = JSON.parse(localStorage.getItem("cotizaciones")) || []

    const nueva = {
      numero: numeroCotizacion,
      fecha,
      cliente,
      items,
      subtotal,
      totalGeneral,
      garantia,
      tiempoEntrega,
      observaciones
    }
    // Si ya existe, reemplazar
    const index = lista.findIndex(c => c.numero === numeroCotizacion)
    if (index !== -1) {
      lista[index] = nueva
    } else {
      lista.push(nueva)
      // Incrementar número solo al guardar nueva
      const ultimoNumero = localStorage.getItem("contadorCotizaciones") || "1000"
      const nuevoNumero = parseInt(ultimoNumero) + 1
      localStorage.setItem("contadorCotizaciones", nuevoNumero)
      setNumeroCotizacion(`COT-${String(nuevoNumero).padStart(4, "1000")}`)
    }

    localStorage.setItem("cotizaciones", JSON.stringify(lista))
    setCotizacionesGuardadas(lista)
    alert("Cotización guardada correctamente ✅")
  }


   const generarPDF = async () => {
      const element = document.getElementById("area-pdf")

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true
      })

      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF("p", "mm", "a4")

      const pageWidth = 210
      const pageHeight = 297

      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let position = 0
      let heightLeft = imgHeight

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

        // Nombre dinámico
        const nombreLimpio = cliente.nombre
          .replace(/\s+/g, "_")
          .replace(/[^\w]/g, "")

        const nombreArchivo = `${numeroCotizacion}_${nombreLimpio}.pdf`

        pdf.save(nombreArchivo)
    }

     const enviarWhatsApp = async () => {
      await generarPDF()

      if (!cliente.telefono) {
        alert("El cliente no tiene número de teléfono")
        return
      }

      let numero = cliente.telefono.replace(/\D/g, "")

      if (!numero.startsWith("57")) {
        numero = "57" + numero
      }

      const mensaje = `Hola ${cliente.nombre}, te compartimos la cotización ${numeroCotizacion} de CONSTRUCCIONES TGP SAS. Quedamos atentos.`

      const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`

      window.open(url, "_blank")
  }

  // 🔹 Cargar cotización para editar
  const cargarCotizacion = (cot) => {
    setNumeroCotizacion(cot.numero)
    setFecha(cot.fecha)
    setCliente(cot.cliente)
    setItems(cot.items)
    setGarantia(cot.garantia)
    setTiempoEntrega(cot.tiempoEntrega)
    setObservaciones(cot.observaciones)
    setAplicarAdministracion(true)
    setAplicarImprevistos(true)
    setAplicarUtilidad(true)
    setAplicarIva(true)
  }


  const eliminarCotizacion = (numero) => {

    const confirmar = window.confirm("¿Estás seguro de eliminar esta cotización?")
    if (!confirmar) return

    let lista = JSON.parse(localStorage.getItem("cotizaciones")) || []

    // Filtrar la que se quiere eliminar
    const nuevaLista = lista.filter(c => c.numero !== numero)

    // Actualizar localStorage
    localStorage.setItem("cotizaciones", JSON.stringify(nuevaLista))

    // Actualizar estado
    setCotizacionesGuardadas(nuevaLista)

  }

  // 🔹 Nueva cotización (resetea campos pero mantiene número siguiente)
  const nuevaCotizacion = () => {
    setCliente({ nombre: "", documento: "", telefono: "", direccion: "" })
    setGarantia("")
    setTiempoEntrega("")
    setObservaciones("")
    setItems([{ descripcion: "", cantidad: 1, valorUnitario: 0 }])
    setAplicarAdministracion(true)
    setAplicarImprevistos(true)
    setAplicarUtilidad(true)
    setAplicarIva(true)
    setFecha(new Date().toISOString().split("T")[0])
  }

  return (
    <div className="app-container">
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      {/* 🔹 Historial */}
      <hr />
      <h3>Cotizaciones Guardadas</h3>
      <ul>
        {cotizacionesGuardadas.map((cot, index) => (
      <li key={index}>
        {cot.numero} - {cot.cliente.nombre} - {formatoMoneda(cot.totalGeneral)}

        <button
          onClick={() => cargarCotizacion(cot)}
          style={{ marginLeft: "10px" }}
        >
          Editar
        </button>

        <button
          onClick={() => eliminarCotizacion(cot.numero)}
          style={{
            marginLeft: "10px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Eliminar
        </button>

  </li>
))}
      </ul>

      <hr />


      <CotizacionPDF
      numeroCotizacion={numeroCotizacion}
      fecha={fecha}
      cliente={cliente}
      items={items}
      subtotal={subtotal}
      administracion={administracion}
      imprevistos={imprevistos}
      utilidad={utilidad}
      iva={iva}
      totalGeneral={totalGeneral}
      garantia={garantia}
      tiempoEntrega={tiempoEntrega}
      observaciones={observaciones}
      formatoMoneda={formatoMoneda}
      />

      {/* 🔹 Encabezado */}
      <h1 className="titulo">
        COTIZACIÓN - CONSTRUCCIONES TGP SAS
      </h1>
      <button className="boton" onClick={nuevaCotizacion}>
        Nueva Cotización
      </button>

      <button className="boton boton-secundario" onClick={guardarCotizacion}>
        Guardar Cotización
      </button>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>N° Cotización:</strong></label>
        <input
          type="text"
          value={numeroCotizacion}
          readOnly
          style={{ marginLeft: "10px", marginRight: "20px" }}
        />
        <label><strong>Fecha:</strong></label>
        <input
          type="date"
          value={fecha}
          readOnly
          style={{ marginLeft: "10px" }}
        />
      </div>

      {/* 🔹 Cliente */}
      <h3>Datos del Cliente</h3>
      <input
        type="text"
        placeholder="Nombre / Razón Social"
        value={cliente.nombre}
        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Documento / NIT"
        value={cliente.documento}
        onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={cliente.telefono}
        onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Dirección"
        value={cliente.direccion}
        onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      {/* 🔹 Tabla de items */}
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ITEM</th>
            <th>Descripción</th>
            <th>Cant</th>
            <th>V. Unit</th>
            <th>V. Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <input
                  value={item.descripcion}
                  onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(index, "cantidad", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.valorUnitario}
                  onChange={(e) => actualizarItem(index, "valorUnitario", e.target.value)}
                />
              </td>
              <td>{formatoMoneda(calcularTotalItem(item))}</td>
              <td>
                <button className="boton-item" onClick={() => eliminarItem(index)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <button className="boton-item" onClick={agregarItem}>Agregar Ítem</button>

      <hr />

      <div className="resumen">



          {/* 🔹 Totales y opciones */}
          <h3>Subtotal: {formatoMoneda(subtotal)}</h3>
          {aplicarAdministracion && (
            <h4>Administración (5%): {formatoMoneda(administracion)}</h4>
          )}

          {aplicarAdministracion && aplicarImprevistos && (
            <h4>Imprevistos (4% sobre administración): {formatoMoneda(imprevistos)}</h4>
          )}

          {aplicarUtilidad && (
            <h4>Utilidad (5%): {formatoMoneda(utilidad)}</h4>
          )}

          {aplicarUtilidad && aplicarIva && (
           <h4>IVA sobre utilidad (19%): {formatoMoneda(iva)}</h4>
          )}



      </div>


      <h2 className="total">
        Total General: {formatoMoneda(totalGeneral)}
      </h2>


      <div className="opciones-movil">

        <label className={`toggle ${aplicarAdministracion ? "activo" : ""}`}>
          <input
            type="checkbox"
            checked={aplicarAdministracion}
            onChange={() => setAplicarAdministracion(!aplicarAdministracion)}
          />
          Administración 5%
        </label>

        <label className={`toggle ${aplicarImprevistos ? "activo" : ""}`}>
          <input
            type="checkbox"
            checked={aplicarImprevistos}
            onChange={() => setAplicarImprevistos(!aplicarImprevistos)}
          />
          Imprevistos 4%
        </label>

        <label className={`toggle ${aplicarUtilidad ? "activo" : ""}`}>
          <input
            type="checkbox"
            checked={aplicarUtilidad}
            onChange={() => setAplicarUtilidad(!aplicarUtilidad)}
          />
          Utilidad 5%
        </label>

        <label className={`toggle ${aplicarIva ? "activo" : ""}`}>
          <input
            type="checkbox"
            checked={aplicarIva}
            onChange={() => setAplicarIva(!aplicarIva)}
          />
          IVA 19%
        </label>



      </div>

      <hr/>

      {/* 🔹 Condiciones */}
      <h3>Condiciones Comerciales</h3>
      <p><strong>VALIDEZ:</strong> 5-6 días hábiles</p>
      <p><strong>PAGO:</strong> Efectivo o cuenta de ahorros 108 0000 7115 - Bancolombia</p>
      <label><strong>GARANTÍA:</strong></label>
      <textarea value={garantia} onChange={(e) => setGarantia(e.target.value)} rows="2" style={{ width: "100%", marginBottom: "10px" }} />
      <label><strong>TIEMPO DE ENTREGA:</strong></label>
      <textarea value={tiempoEntrega} onChange={(e) => setTiempoEntrega(e.target.value)} rows="2" style={{ width: "100%", marginBottom: "10px" }} />
      <label><strong>OBSERVACIONES:</strong></label>
      <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="3" style={{ width: "100%" }} />

      <button type="button" className="boton-item"  onClick={generarPDF} >
        Descargar PDF

      </button>

      <button className="boton-item" onClick={enviarWhatsApp}>
         Enviar por WhatsApp
      </button>




    </div>
  </div>
  )
}

export default Cotizador

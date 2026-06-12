import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import NominaPDF from "../components/NominaPDF"
import { supabase } from "../lib/supabase"

function Nomina() {
  const fechaActual = new Date().toLocaleDateString("es-CO")

  // 🔹 STORAGE EN NUBE
  const [empleados, setEmpleados] = useState([])
  const [mostrarInforme, setMostrarInforme] = useState(false)
  const [mostrarResumenNomina, setMostrarResumenNomina] = useState(false)
const [resumenNomina, setResumenNomina] = useState([])
const [totalResumenNomina, setTotalResumenNomina] = useState(0)
const [mostrarFaltas, setMostrarFaltas] = useState(false)
const [faltas, setFaltas] = useState({})
const [diasExtra, setDiasExtra] = useState({})
const [mostrarEditarEmpleado, setMostrarEditarEmpleado] = useState(false)
const [empleadoEditar, setEmpleadoEditar] = useState(null)

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const cargarEmpleados = async () => {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .order("nombre", { ascending: true })

    if (!error && data) {
      const empleadosMapeados = data.map(emp => ({
        ...emp,
        valorDia: Number(emp.valor_dia)
      }))
      setEmpleados(empleadosMapeados)
    }
  }

  const [empleadoActivo, setEmpleadoActivo] = useState(null)
  const [mostrarCrear, setMostrarCrear] = useState(false)

  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: "", documento: "", valorDia: "", celular: "" })
  const [valores, setValores] = useState({ dias: 0, prestamo: 0, horasExtra: 0, tieneDominical: false, domCantidad: 0, domValor: 0, fechaInicio: "", fechaFin:"" })

  // 🔹 GESTOR DE ADELANTOS
  const [adelantos, setAdelantos] = useState([])
  const [nuevoVale, setNuevoVale] = useState({ motivo: "", valor: "" })

  useEffect(() => {
    const totalAdelantos = adelantos.reduce((sum, a) => sum + Number(a.valor || 0), 0)
    setValores(prev => ({ ...prev, prestamo: totalAdelantos }))
  }, [adelantos])

  const abrirEmpleado = async (emp) => {
    setEmpleadoActivo(emp)
    setValores({ dias: 0, prestamo: 0, horasExtra: 0, tieneDominical: false, domCantidad: 0, domValor: 0, fechaInicio: "", fechaFin: "" })
    setNuevoVale({ motivo: "", valor: "" })
    
    const { data } = await supabase
      .from("adelantos")
      .select("*")
      .eq("empleado_id", emp.id)
      .eq("estado", "pendiente")
    
    if (data) setAdelantos(data)
  }

  const guardarVale = async () => {
    if (!nuevoVale.motivo || !nuevoVale.valor) return alert("Llena el motivo y el valor del vale")

    const { data, error } = await supabase
      .from("adelantos")
      .insert([{ empleado_id: empleadoActivo.id, motivo: nuevoVale.motivo, valor: Number(nuevoVale.valor), estado: "pendiente" }])
      .select()

    if (!error && data) {
      setAdelantos([...adelantos, data[0]])
      setNuevoVale({ motivo: "", valor: "" })
    } else {
      alert("Error al guardar el vale: " + error?.message)
    }
  }

  const eliminarVale = async (id) => {
    const { error } = await supabase.from("adelantos").delete().eq("id", id)
    if (!error) setAdelantos(adelantos.filter(a => a.id !== id))
  }

  const crearEmpleado = async () => {
    if (!nuevoEmpleado.nombre || !nuevoEmpleado.celular) return
    const { data, error } = await supabase.from("empleados").insert([{
      nombre: nuevoEmpleado.nombre, documento: nuevoEmpleado.documento, valor_dia: Number(nuevoEmpleado.valorDia), celular: nuevoEmpleado.celular, activo: true
    }]).select()
    if (!error && data) {
      setEmpleados([...empleados, { ...data[0], valorDia: Number(data[0].valor_dia) }])
      setNuevoEmpleado({ nombre: "", documento: "", valorDia: "", celular: "" })
      setMostrarCrear(false)
    }
  }

  const actualizarEmpleado = async () => {

    if (!empleadoEditar) return

    const { error } = await supabase
      .from("empleados")
      .update({
        nombre: empleadoEditar.nombre,
        documento: empleadoEditar.documento,
        celular: empleadoEditar.celular,
        valor_dia: Number(empleadoEditar.valorDia)
      })
      .eq("id", empleadoEditar.id)

    if (!error) {

      setEmpleados(
        empleados.map(emp =>
          emp.id === empleadoEditar.id
            ? empleadoEditar
            : emp
        )
      )

      setMostrarEditarEmpleado(false)

      alert("Empleado actualizado correctamente ✅")
    }
  }

  const ocultarEmpleado = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de ocultar a ${nombre}? \n(No perderás su historial de pagos)`)
    if (!confirmar) return
    const { error } = await supabase.from("empleados").update({ activo: false }).eq("id", id)
    if (!error) setEmpleados(empleados.map(emp => emp.id === id ? { ...emp, activo: false } : emp))
  }

  const empleadosInactivos = empleados.filter(
  e => !e.activo
  )

  const reactivarEmpleado = async (id) => {

  const { error } = await supabase
    .from("empleados")
    .update({ activo: true })
    .eq("id", id)

  if (!error) {

    setEmpleados(
      empleados.map(emp =>
        emp.id === id
          ? { ...emp, activo: true }
          : emp
      )
    )

    alert("Empleado reactivado ✅")
  }
}

  const formato = (v) => Number(v).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })
  const fechaArchivo = () => new Date().toISOString().split("T")[0]

  const generarNominaCompleta = () => {

  const empleadosActivos = empleados.filter(emp => emp.activo)

  const resumen = empleadosActivos.map(emp => ({
    id: emp.id,
    nombre: emp.nombre,
    valorDia: emp.valorDia,
    dias: 14,
    total: emp.valorDia * 14
  }))

  const totalGeneral = resumen.reduce(
    (acc, emp) => acc + emp.total,
    0
  )

  setResumenNomina(resumen)
  setTotalResumenNomina(totalGeneral)
  setMostrarResumenNomina(true)
}

  const generarNominaConFaltas = () => {
      const empleadosActivos = empleados.filter(emp => emp.activo)

      const resumen = empleadosActivos.map(emp => {
        const diasFaltados = Number(faltas[emp.id] || 0)
        const extras = Number(diasExtra[emp.id] || 0) // <-- Leemos los días extra
        
        // Cálculo: 14 base - faltas + extras
        const diasPagados = Math.max(0, 14 - diasFaltados + extras) 
        const total = diasPagados * emp.valorDia

        return {
          id: emp.id,
          nombre: emp.nombre,
          valorDia: emp.valorDia,
          faltas: diasFaltados,
          diasExtra: extras,
          dias: diasPagados,
          total
        }
      })

      const totalGeneral = resumen.reduce(
        (acc, emp) => acc + emp.total,
        0
      )

      setResumenNomina(resumen)
      setTotalResumenNomina(totalGeneral)
      setMostrarFaltas(false)
      setMostrarResumenNomina(true)
    }
  const descargarInformeQuincenal = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1. ENCABEZADO CORPORATIVO
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 35, "F");

    // Borde inferior amarillo del encabezado
    pdf.setFillColor(255, 204, 0); // Amarillo #FFCC00
    pdf.rect(0, 35, pageWidth, 2, "F");

    pdf.setTextColor(255, 204, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("CONSTRUCCIONES TGP SAS", 15, 18);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text("INFORME CATORCENAL DE NÓMINA", 15, 27);

    // 2. METADATOS DEL REPORTE
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Fecha de Generación:", 15, 50);
    pdf.setFont("helvetica", "normal");
    pdf.text(fechaArchivo(), 55, 50);

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Empleados:", 15, 56);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(resumenNomina.length), 45, 56);

    // 3. ENCABEZADO DE LA TABLA
    let y = 68;
    pdf.setFillColor(0, 0, 0);
    pdf.rect(15, y, pageWidth - 30, 10, "F");

    pdf.setTextColor(255, 204, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("EMPLEADO", 20, y + 7);
    pdf.text("DÍAS", 135, y + 7, { align: "center" });
    pdf.text("TOTAL PAGADO", 190, y + 7, { align: "right" });

    y += 10;

    // 4. FILAS DE LA TABLA (Con estilo cebra)
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    resumenNomina.forEach((emp, index) => {
      // Fondo intercalado gris muy claro
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, y, pageWidth - 30, 9, "F");
      }

      // Línea divisoria inferior
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(15, y + 9, pageWidth - 15, y + 9);

      pdf.setTextColor(30, 41, 59); // Gris muy oscuro para el texto
      
      // Textos
      pdf.text(emp.nombre.substring(0, 45), 20, y + 6);
      pdf.text(String(emp.dias), 135, y + 6, { align: "center" });
      pdf.text(formato(emp.total), 190, y + 6, { align: "right" });

      y += 9;

      // Paginación automática si se llena la hoja
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = 20;
        
        // Volver a pintar el encabezado de la tabla en la nueva hoja
        pdf.setFillColor(0, 0, 0);
        pdf.rect(15, y, pageWidth - 30, 10, "F");
        pdf.setTextColor(255, 204, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text("EMPLEADO", 20, y + 7);
        pdf.text("DÍAS", 135, y + 7, { align: "center" });
        pdf.text("TOTAL PAGADO", 190, y + 7, { align: "right" });
        
        y += 10;
        pdf.setFont("helvetica", "normal");
      }
    });

    // 5. BLOQUE DE GRAN TOTAL
    y += 8;
    
    // Evitar que el total quede huérfano al final de la página
    if (y > pageHeight - 30) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFillColor(0, 0, 0);
    pdf.rect(110, y, pageWidth - 125, 14, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("TOTAL NÓMINA:", 115, y + 9);

    pdf.setTextColor(255, 204, 0);
    pdf.text(formato(totalResumenNomina), 190, y + 9, { align: "right" });

    // 6. PIE DE PÁGINA
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text("Documento generado automáticamente por TGP Nómina", pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save(`Informe_Nomina_${fechaArchivo()}.pdf`);
  }

  const sueldo = valores.dias * (empleadoActivo?.valorDia || 0)
  const dominicales = valores.tieneDominical ? valores.domCantidad * valores.domValor : 0
  const neto = Number(sueldo) + Number(dominicales) + Number(valores.horasExtra) - Number(valores.prestamo)

  const procesarPagoNomina = async () => {
    await supabase.from("nominas").insert([{
      empleado_id: empleadoActivo.id, fecha_inicio: valores.fechaInicio || null, fecha_fin: valores.fechaFin || null,
      dias: Number(valores.dias) || 0, horas_extra: Number(valores.horasExtra) || 0, prestamo: Number(valores.prestamo) || 0,
      dom_cantidad: Number(valores.domCantidad) || 0, dom_valor: Number(valores.domValor) || 0, total: neto
    }])

    if (adelantos.length > 0) {
      await supabase.from("adelantos").update({ estado: "pagado" }).eq("empleado_id", empleadoActivo.id).eq("estado", "pendiente")
      setAdelantos([])
      setValores(prev => ({...prev, prestamo: 0}))
    }
  }

  const generarPDFBlob = async () => {
    const input = document.getElementById("pdf-nomina")
    const canvas = await html2canvas(input, { scale: 2 })
    const pdf = new jsPDF("p", "mm", "a4")
    const width = 210
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height)
    return pdf
  }

  const descargarPDF = async () => {
    const pdf = await generarPDFBlob()
    await procesarPagoNomina()
    pdf.save(`Nomina_${empleadoActivo.nombre}_${fechaArchivo()}.pdf`)
    alert("¡Nómina procesada! Los vales han sido descontados y reiniciados para la próxima semana. ✅")
  }

  const enviarWhatsApp = async () => {
    const pdf = await generarPDFBlob()
    await procesarPagoNomina()
    pdf.save(`Nomina_${empleadoActivo.nombre}_${fechaArchivo()}.pdf`)

    let numero = empleadoActivo.celular.replace(/\D/g, "")
    if (!numero.startsWith("57")) numero = "57" + numero
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(`Hola ${empleadoActivo.nombre}, te comparto tu recibo de nómina del día ${fechaArchivo()}`)}`, "_blank")
    alert("¡Nómina procesada! Los vales han sido descontados y reiniciados para la próxima semana. ✅")
  }

  const obtenerIniciales = (nombre) => {
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  }

  // 🔥 VISTA PRINCIPAL (DASHBOARD)
  if (!empleadoActivo) {
    const empleadosActivos = empleados.filter(e => e.activo)
    const totalNomina = empleadosActivos.reduce((acc, emp) => acc + (emp.valorDia || 0) * 30, 0)
    const promedioDia = empleadosActivos.length > 0 ? empleadosActivos.reduce((acc, e) => acc + e.valorDia, 0) / empleadosActivos.length : 0

    return (
      <div className="contenedor-master" style={{ padding: "15px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <style>{`
          /* ANTI-DESBORDES GLOBAL */
          .contenedor-master { width: 100%; max-width: 100vw; overflow-x: hidden; box-sizing: border-box; }
          .contenedor-master * { box-sizing: border-box; }

          .emp-card { background: #fff; padding: 20px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; align-items: center; border: 1px solid #e2e8f0; transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden; width: 100%; }
          .emp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); border-color: #cbd5e1; }
          .emp-card::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: #FFD000; }
          
          .header-app { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
          .grid-dash { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; width: 100%; }
          .grid-emp { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; width: 100%; }
          
          .btn-nomina { flex: 1; padding: 12px; background: #000; color: #FFD000; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; width: 100%; }
          .btn-nomina:hover { background: #222; }
          .btn-eliminar { width: 45px; height: 45px; background: #fee2e2; color: #ef4444; border: none; border-radius: 12px; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
          .btn-eliminar:hover { background: #fca5a5; color: #b91c1c; }

          .input-pro { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 15px; background: #f8fafc; outline: none; transition: 0.2s; color: #000; }
          .input-pro:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(255, 208, 0, 0.3); }

          @media (max-width: 600px) {
            .header-app { flex-direction: column; align-items: stretch; text-align: center; }
            .btn-crear { width: 100%; padding: 16px !important; font-size: 16px !important; }
            .grid-emp { gap: 12px; }
          }
        `}</style>

      <div className="header-app">
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#000",
                  fontSize: "28px",
                  fontWeight: "900",
                  letterSpacing: "-0.5px"
                }}
              >
                TGP Nómina
              </h1>

              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#64748b",
                  fontSize: "15px"
                }}
              >
                Panel de control administrativo
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              <button
                style={{
                  ...btnFlotante,
                  background: "#000",
                  color: "#FFD000"
                }}
                onClick={() => setMostrarInforme(true)}
              >
                📊 Informe Quincenal
              </button>

              <button
                className="btn-crear"
                style={btnFlotante}
                onClick={() => setMostrarCrear(true)}
              >
                + Añadir Personal
              </button>
            </div>
          </div>

        <div className="grid-dash">
          <DashboardCard title="Base Nómina (Aprox Mensual)" value={formato(totalNomina)} icon="💰" color="#000" />
          <DashboardCard title="Promedio Pago Diario" value={formato(promedioDia)} icon="📈" color="#FFD000" textColor="#000" />
        </div>

        <div style={{ marginTop: "40px", marginBottom: "15px" }}>
          <h2 style={{ color: "#000", margin: 0, fontSize: "20px", fontWeight: "800" }}>Personal Activo ({empleadosActivos.length})</h2>
        </div>

        {empleadosActivos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: "20px", color: "#94a3b8" }}>
            <h3 style={{ margin: 0 }}>No hay empleados activos</h3>
            <p>Toca "+ Añadir Personal" para empezar.</p>
          </div>
        ) : (
          <div className="grid-emp">
            {empleadosActivos.map(emp => (
              <div key={emp.id} className="emp-card">
                <div style={avatarStyle}>{obtenerIniciales(emp.nombre)}</div>
                <h3 style={{ margin: "5px 0 2px 0", color: "#000", fontSize: "18px", fontWeight: "700", textAlign: "center" }}>{emp.nombre}</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>ID: {emp.documento}</p>
                <div style={tagStyle}>Tarifa: <strong style={{ color: "#000" }}>{formato(emp.valorDia)}</strong> / día</div>
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button onClick={() => abrirEmpleado(emp)} className="btn-nomina">Pagar Nómina</button>
                  <button onClick={() => ocultarEmpleado(emp.id, emp.nombre)} className="btn-eliminar" title="Ocultar">🗑️</button>
                  <button
                  style={{
                    background: "#FFD000",
                    color: "#000",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                  onClick={() => {
                    setEmpleadoEditar({...emp})
                    setMostrarEditarEmpleado(true)
                  }}
                >
                  ✏️
                </button>
                </div>
              </div>
            ))}
          </div>
        )}

       {empleadosInactivos.length > 0 && (
          <>
            <div
               style={{
            ...modalPro,
            maxWidth: "700px",
            background: "#fff",
            color: "#000"
            }}
            >
              <h2
                style={{
                  color: "#64748b",
                  margin: 0
                }}
              >
                Personal Inactivo
              </h2>
            </div>

            <div className="grid-emp">
              {empleadosInactivos.map(emp => (
                <div
                  key={emp.id}
                  className="emp-card"
                  style={{ opacity: 0.8 }}
                >
                  <h3
                  style={{
                    color:"#000"
                  }}>{emp.nombre}</h3>

                  <button
                    style={btnGuardar}
                    onClick={() =>
                      reactivarEmpleado(emp.id)
                    }
                  >
                    🔄 Reactivar
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODAL CREAR EMPLEADO */}
        {mostrarCrear && (
          <div style={overlayStyle}>
            <div style={modalPro}>
              <h2 style={{ marginTop: 0, color: "#000", fontSize: "24px", fontWeight: "800" }}>Nuevo Registro</h2>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Ingresa los datos del trabajador.</p>
              <Input label="Nombre Completo" value={nuevoEmpleado.nombre} onChange={(v) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: v })} />
              <Input label="Documento (Cédula/NIT)" value={nuevoEmpleado.documento} onChange={(v) => setNuevoEmpleado({ ...nuevoEmpleado, documento: v })} type="number"/>
              <Input label="Valor Día Laborado ($)" type="number" value={nuevoEmpleado.valorDia} onChange={(v) => setNuevoEmpleado({ ...nuevoEmpleado, valorDia: v })} />
              <Input label="Teléfono (WhatsApp)" value={nuevoEmpleado.celular} onChange={(v) => setNuevoEmpleado({ ...nuevoEmpleado, celular: v })} type="number"/>
              <div style={{ display: "flex", gap: "10px", marginTop: "30px", flexDirection: "column" }}>
                <button style={btnGuardar} onClick={crearEmpleado}>Guardar Empleado</button>
                <button style={btnCancelar} onClick={() => setMostrarCrear(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}


        {mostrarEditarEmpleado && (
        <div style={overlayStyle}>
          <div style={modalPro}>
            <h2>Editar Empleado</h2>

            <Input
              label="Nombre"
              value={empleadoEditar?.nombre || ""}
              onChange={(v) =>
                setEmpleadoEditar({
                  ...empleadoEditar,
                  nombre: v
                })
              }
            />

            <Input
              label="Valor Día"
              type="number"
              value={empleadoEditar?.valorDia || ""}
              onChange={(v) =>
                setEmpleadoEditar({
                  ...empleadoEditar,
                  valorDia: v
                })
              }
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px"
              }}
            >
              <button
                style={btnGuardar}
                onClick={actualizarEmpleado}
              >
                Guardar
              </button>

              <button
                style={btnCancelar}
                onClick={() => setMostrarEditarEmpleado(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFORME QUINCENAL */}
              {mostrarInforme && (
                <div style={overlayStyle}>
                  <div style={modalPro}>
                    <h2
                      style={{
                        marginTop: 0,
                        color: "#000",
                        fontSize: "24px",
                        fontWeight: "800"
                      }}
                    >
                      📊 Informe Quincenal
                    </h2>

                    <p
                      style={{
                        color: "#64748b",
                        marginBottom: "20px"
                      }}
                    >
                      ¿La nómina está completa?
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <button
                        style={btnGuardar}
                        onClick={() =>{
                          generarNominaCompleta()
                        }}
                      >
                        ✅ Sí
                      </button>

                      <button
                        style={btnCancelar}
                        onClick={() => {
                           setMostrarInforme(false)
                           setMostrarFaltas(true)
                        }}
                      >
                        ❌ No
                      </button>

                      <button
                        style={btnCancelar}
                        onClick={() => setMostrarInforme(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}


    {mostrarFaltas && (
          <div style={overlayStyle}>
            <div
              style={{
                ...modalPro,
                maxWidth: "600px",
                color: "#000"
              }}
            >
              <h2 style={{ marginTop: 0, color: "#000", fontSize: "22px", fontWeight: "900" }}>
                ⚖️ Ajuste de Días
              </h2>

              <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
                Modifica los días de la catorcena base (14 días).
              </p>

              {/* Encabezados de columnas */}
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "2px solid #e2e8f0", marginBottom: "10px", fontWeight: "800", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>
                <div style={{ width: "40%" }}>Empleado</div>
                <div style={{ width: "25%", textAlign: "center" }}>Faltas (-)</div>
                <div style={{ width: "25%", textAlign: "center" }}>Extras (+)</div>
              </div>

              <div
                style={{
                  maxHeight: "450px",
                  overflowY: "auto",
                  paddingRight: "5px"
                }}
              >
                {empleados
                  .filter(emp => emp.activo)
                  .map(emp => (
                    <div
                      key={emp.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: "1px solid #f1f5f9"
                      }}
                    >
                      <strong style={{ color: "#0f172a", width: "40%", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.nombre}
                      </strong>

                      {/* Input de Faltas */}
                      <div style={{ width: "25%", textAlign: "center" }}>
                        <input
                          type="number"
                          min="0"
                          max="14"
                          placeholder="0"
                          value={faltas[emp.id] || ""}
                          onChange={(e) => setFaltas({ ...faltas, [emp.id]: e.target.value })}
                          style={{
                            width: "60px",
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #fca5a5",
                            textAlign: "center",
                            background: "#fef2f2",
                            color: "#ef4444",
                            fontWeight: "bold",
                            outline: "none"
                          }}
                        />
                      </div>

                      {/* Input de Días Extra */}
                      <div style={{ width: "25%", textAlign: "center" }}>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={diasExtra[emp.id] || ""}
                          onChange={(e) => setDiasExtra({ ...diasExtra, [emp.id]: e.target.value })}
                          style={{
                            width: "60px",
                            padding: "8px",
                            borderRadius: "8px",
                            border: "1px solid #6ee7b7",
                            textAlign: "center",
                            background: "#ecfdf5",
                            color: "#10b981",
                            fontWeight: "bold",
                            outline: "none"
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "25px"
                }}
              >
                <button
                  style={btnGuardar}
                  onClick={generarNominaConFaltas}
                >
                  📊 Generar Informe
                </button>

                <button
                  style={btnCancelar}
                  onClick={() => {
                    setMostrarFaltas(false)
                    setFaltas({})     // Limpiamos los campos al cancelar
                    setDiasExtra({})  // Limpiamos los campos al cancelar
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      {mostrarResumenNomina && (
      <div style={overlayStyle}>
        <div
          style={{
        ...modalPro,
        maxWidth: "700px",
        background: "#fff",
        color: "#000"
        }}
        >
          <h2 style={{ marginTop: 0 }}>
            📊 Resumen Nómina Quincenal
          </h2>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto"
            }}
          >
            {resumenNomina.map(emp => (
              <div
                key={emp.id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #000"
                }}
              >
                <strong>{emp.nombre}</strong>

                <div>
                  Valor día: {formato(emp.valorDia)}
                </div>

                <div>
                  Días: {emp.dias}
                </div>

                <div>
                  Total: {formato(emp.total)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#000",
              color: "#FFD000",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "20px"
            }}
          >
            Total Nómina: {formato(totalResumenNomina)}
          </div>
            <div
              style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px"
            }}
          >
            <button
              style={btnGuardar}
              onClick={descargarInformeQuincenal}
            >
              📄 Descargar PDF
            </button>

            <button
              style={btnCancelar}
              onClick={() => setMostrarResumenNomina(false)}
            >
              Cerrar
            </button>
            </div>
        </div>
      </div>
    )}
      </div>
    )
  }

  // 🔥 VISTA DE NÓMINA INDIVIDUAL (BLINDADA PARA CELULAR)
  return (
    <div className="contenedor-nomina" style={{ padding: "15px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        /* ANTI-DESBORDES GLOBAL PARA LA VISTA INDIVIDUAL */
        .contenedor-nomina { width: 100%; max-width: 100vw; overflow-x: hidden; box-sizing: border-box; }
        .contenedor-nomina * { box-sizing: border-box; }

        .btn-volver-top { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #fff; color: #000; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: 700; cursor: pointer; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        
        .header-empleado { background: #fff; padding: 20px; border-radius: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-left: 6px solid #FFD000; display: flex; align-items: center; gap: 15px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.03); width: 100%; }
        .tarifa-badge { background: #000; color: #FFD000; padding: 6px 12px; border-radius: 10px; font-weight: 800; font-size: 13px; position: absolute; right: 20px; top: 20px; }

        .seccion-card { background: #fff; padding: 20px; border-radius: 20px; margin-bottom: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); width: 100%; }
        
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
        .botones-accion { display: flex; gap: 15px; margin-top: 25px; width: 100%; }
        .btn-accion { flex: 1; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; font-size: 16px; text-align: center; border: none; }
        
        .vale-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; width: 100%; }

        @media (max-width: 600px) {
          .contenedor-nomina { padding: 10px !important; }
          .header-empleado { flex-direction: column; align-items: flex-start; padding: 15px; gap: 10px; }
          .tarifa-badge { position: static; margin-top: 5px; display: inline-block; }
          .grid-2-col { grid-template-columns: 1fr; gap: 12px; }
          .botones-accion { flex-direction: column; gap: 12px; }
          .botones-accion button { width: 100%; }
          .seccion-card { padding: 15px; }
        }
      `}</style>

      <button onClick={() => setEmpleadoActivo(null)} className="btn-volver-top">
        ⬅ Volver al panel
      </button>

      {/* 🔹 ENCABEZADO REDISEÑADO Y ORGANIZADO */}
      <div className="header-empleado">
        <div style={{...avatarStyle, margin: 0, width: "55px", height: "55px", fontSize: "20px"}}>{obtenerIniciales(empleadoActivo.nombre)}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: "#000", fontSize: "22px", fontWeight: "900", lineHeight: "1.2" }}>{empleadoActivo.nombre}</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>C.C. {empleadoActivo.documento}</p>
        </div>
        <div className="tarifa-badge">
          {formato(empleadoActivo.valorDia)} / día
        </div>
      </div>

      <div className="seccion-card">
        <h3 style={{marginTop: 0, fontSize: "18px", color: "#000", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px"}}>💰 Detalles de Ingresos</h3>
        <div className="grid-2-col">
          <Input label="Periodo inicio" type="date" value={valores.fechaInicio} onChange={(v) => setValores({ ...valores, fechaInicio: v })} />
          <Input label="Periodo fin" type="date" value={valores.fechaFin} onChange={(v) => setValores({ ...valores, fechaFin: v })} />
        </div>
        <div className="grid-2-col" style={{marginTop: "12px"}}>
          <Input label="Días trabajados" type="number" onChange={(v) => setValores({ ...valores, dias: v })} />
          <Input label="Extras Por Pagar ($)" type="number" onChange={(v) => setValores({ ...valores, horasExtra: v })} />
        </div>
        <div style={{ marginTop: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#000", display: "block", marginBottom: "6px" }}>¿Tiene Dominical?</label>
          <select className="input-pro" onChange={(e) => setValores({ ...valores, tieneDominical: e.target.value === "si" })}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>
        {valores.tieneDominical && (
          <div className="grid-2-col" style={{marginTop: "12px"}}>
            <Input label="Cant. dominicales" type="number" onChange={(v) => setValores({ ...valores, domCantidad: v })} />
            <Input label="Valor dominical ($)" type="number" onChange={(v) => setValores({ ...valores, domValor: v })} />
          </div>
        )}
      </div>

      <div className="seccion-card">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px"}}>
            <h3 style={{marginTop: 0, marginBottom: 0, fontSize: "18px", color: "#000"}}>📉 Vales y Adelantos</h3>
        </div>

        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: "#000" }}>+ Registrar Nuevo Vale</p>
          <div className="grid-2-col">
            <Input label="Motivo (Ej. Pasajes)" value={nuevoVale.motivo} onChange={(v) => setNuevoVale({ ...nuevoVale, motivo: v })} />
            <Input label="Valor ($)" type="number" value={nuevoVale.valor} onChange={(v) => setNuevoVale({ ...nuevoVale, valor: v })} />
          </div>
          <button onClick={guardarVale} style={{ width: "100%", marginTop: "15px", background: "#000", color: "#FFD000", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
            Guardar Vale en la Nube ☁️
          </button>
        </div>

        {adelantos.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: "10px 0" }}>Sin adelantos pendientes.</p>
        ) : (
          <div>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#000", marginBottom: "10px" }}>Vales Guardados:</p>
            {adelantos.map((adelanto) => (
              <div key={adelanto.id} className="vale-card">
                <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "#000", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adelanto.motivo}</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>{new Date(adelanto.fecha).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: "800", color: "#ef4444", fontSize: "15px" }}>- {formato(adelanto.valor)}</p>
                  <button onClick={() => eliminarVale(adelanto.id)} style={{ background: "#fee2e2", color: "#ef4444", border: "none", width: "35px", height: "35px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Eliminar">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px", padding: "15px", background: "#fff", borderRadius: "12px", border: "2px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", color: "#475569", fontSize: "14px" }}>Total Deducciones:</span>
            <span style={{ fontWeight: "900", color: "#ef4444", fontSize: "20px" }}>- {formato(valores.prestamo)}</span>
        </div>
      </div>

      <div className="seccion-card" style={{ background: "#000", color: "#fff", border: "none" }}>
        <h3 style={{marginTop: 0, color: "#94a3b8", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px"}}>📊 Liquidación Final</h3>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0", fontSize: "15px" }}><p style={{margin:0}}>Sueldo Base:</p> <p style={{margin:0, fontWeight:"600"}}>{formato(sueldo)}</p></div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0", fontSize: "15px" }}><p style={{margin:0}}>Dominicales:</p> <p style={{margin:0, fontWeight:"600"}}>{formato(dominicales)}</p></div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0", fontSize: "15px" }}><p style={{margin:0}}>Horas Extras:</p> <p style={{margin:0, fontWeight:"600"}}>{formato(valores.horasExtra)}</p></div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0", color: "#f87171", fontSize: "15px" }}><p style={{margin:0}}>Deducciones (Vales):</p> <p style={{margin:0, fontWeight:"600"}}>- {formato(valores.prestamo)}</p></div>
        
        <hr style={{ borderColor: "#333", margin: "15px 0" }} />
        
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#e2e8f0" }}>Total a Pagar:</h2>
            <h2 style={{ color: "#FFD000", margin: 0, fontSize: "28px", fontWeight: "900" }}>{formato(neto)}</h2>
        </div>
      </div>

      <div className="botones-accion">
        <button className="btn-accion" style={{ background: "#fff", color: "#000", border: "2px solid #000" }} onClick={descargarPDF}>📄 Descargar PDF</button>
        <button className="btn-accion" style={{ background: "#25D366", color: "#fff", boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)" }} onClick={enviarWhatsApp}>📲 Enviar WhatsApp</button>
      </div>

      <div style={{ position: "absolute", left: "-9999px" }}>
      <NominaPDF
          datos={{ ...empleadoActivo, fecha: fechaActual, fechaInicio: valores.fechaInicio, fechaFin: valores.fechaFin }}
          calculos={{ sueldo, dominicales, extras: valores.horasExtra, prestamo: valores.prestamo, neto }}
          formatoMoneda={formato}
          />
      </div>
    </div>
  )
}

// 🔹 COMPONENTES UI REUTILIZABLES
const Input = ({ label, value, onChange, type = "text" }) => (
  <div style={{ width: "100%" }}>
    <label style={{ fontSize: "13px", fontWeight: "700", color: "#000", marginBottom: "6px", display: "block" }}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-pro" />
  </div>
)

const DashboardCard = ({ title, value, icon, color, textColor = "#fff" }) => (
  <div style={{ background: color, color: textColor, padding: "24px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 20px rgba(0,0,0,0.08)", width: "100%" }}>
    <div>
      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", opacity: 0.8 }}>{title}</p>
      <h3 style={{ margin: "5px 0 0 0", fontSize: "26px", fontWeight: "900", letterSpacing: "-0.5px" }}>{value}</h3>
    </div>
    <div style={{ fontSize: "35px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>{icon}</div>
  </div>
)

const avatarStyle = { width: "65px", height: "65px", borderRadius: "50%", background: "#000", color: "#FFD000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "900", marginBottom: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", flexShrink: 0 }
const tagStyle = { background: "#f8fafc", color: "#64748b", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", marginTop: "12px", marginBottom: "20px", border: "1px solid #e2e8f0" }
const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "15px" }
const modalPro = { background: "#fff", padding: "30px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }
const btnFlotante = { background: "#FFD000", color: "#000", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 15px rgba(255, 208, 0, 0.4)", padding: "14px 24px" }
const btnGuardar = { width: "100%", padding: "16px", background: "#000", color: "#FFD000", border: "none", borderRadius: "14px", fontWeight: "800", cursor: "pointer", fontSize: "16px" }
const btnCancelar = { width: "100%", padding: "16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", fontSize: "16px" }

export default Nomina
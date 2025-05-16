// ==========================
// ADMIN.JS COMPLETO Y ACTUALIZADO
// ==========================

function renderEmpleados() {
  const lista = obtenerEmpleados();
  const ul = document.getElementById("listaEmpleados");
  ul.innerHTML = "";

  lista.forEach(nombre => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${nombre}
      <button onclick="reiniciarDatosEmpleado('${nombre}')">Reset Horas</button>
      <button onclick="eliminarEmpleado('${nombre}')">Eliminar</button>
    `;
    ul.appendChild(li);
  });
}

function crearEmpleado() {
  const input = document.getElementById("nuevoEmpleado");
  const nombre = input.value.trim();
  if (nombre) {
    if (agregarEmpleado(nombre)) {
      alert(`Empleado ${nombre} añadido.`);
      renderEmpleados();
      input.value = "";
    } else {
      alert("Ese empleado ya existe.");
    }
  }
}

function eliminarEmpleado(nombre) {
  let empleados = obtenerEmpleados().filter(e => e !== nombre);
  guardarEmpleados(empleados);
  localStorage.removeItem(nombre);
  renderEmpleados();
}

// ==========================
// MOSTRAR Y EDITAR JORNADAS
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  renderEmpleados();
  mostrarJornadasEditable();
});

function mostrarJornadasEditable() {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const descansos = JSON.parse(localStorage.getItem("descansos") || "[]");
  const contenedor = document.getElementById("listaJornadas");
  contenedor.innerHTML = "";

  registros.forEach((r, i) => {
    const entradaMins = r.entrada.hour * 60 + r.entrada.minute;
    const salidaMins = r.salida.hour * 60 + r.salida.minute;
    const duracionMins = salidaMins - entradaMins;
    const horas = Math.floor(duracionMins / 60);
    const minutos = duracionMins % 60;

    const descanso = descansos.find(d => d.empleado === r.empleado && d.day === r.day);
    let descansoInicio = "";
    let descansoFin = "";
    let descansoDuracion = "0h 0min";

    if (descanso) {
      descansoInicio = formatHoraMin(descanso.inicio);
      descansoFin = formatHoraMin(descanso.fin);
      const di = descanso.inicio.hour * 60 + descanso.inicio.minute;
      const df = descanso.fin.hour * 60 + descanso.fin.minute;
      const dmin = df - di;
      descansoDuracion = `${Math.floor(dmin / 60)}h ${dmin % 60}min`;
    }

    const div = document.createElement("div");
    div.className = "jornada-edit";

    div.innerHTML = `
      <strong>${r.empleado}</strong> (${["L", "M", "X", "J", "V", "S", "D"][r.day]})<br>
      Entrada: <input type="time" id="entrada-${i}" value="${formatHoraMin(r.entrada)}">
      Salida: <input type="time" id="salida-${i}" value="${formatHoraMin(r.salida)}">
      <span style="margin-left: 10px; font-weight: bold;">→ ${horas}h ${minutos}min</span><br>
      Descanso de: <input type="time" id="descanso-inicio-${i}" value="${descansoInicio}"> a
      <input type="time" id="descanso-fin-${i}" value="${descansoFin}">
      <span style="margin-left: 10px; font-style: italic;">→ ${descansoDuracion}</span><br>
      <button onclick="guardarEdicion(${i})">Guardar</button>
      <button onclick="eliminarJornada(${i})" style="color: red;">Eliminar</button>
      <hr>
    `;

    contenedor.appendChild(div);
  });
}

function formatHoraMin({ hour, minute }) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function guardarEdicion(index) {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const entradaStr = document.getElementById(`entrada-${index}`).value;
  const salidaStr = document.getElementById(`salida-${index}`).value;
  const descansoInicioStr = document.getElementById(`descanso-inicio-${index}`).value;
  const descansoFinStr = document.getElementById(`descanso-fin-${index}`).value;

  const [eh, em] = entradaStr.split(":").map(Number);
  const [sh, sm] = salidaStr.split(":").map(Number);
  registros[index].entrada = { hour: eh, minute: em };
  registros[index].salida = { hour: sh, minute: sm };

  if (descansoInicioStr && descansoFinStr) {
    const [diH, diM] = descansoInicioStr.split(":").map(Number);
    const [dfH, dfM] = descansoFinStr.split(":").map(Number);
    const empleado = registros[index].empleado;
    const day = registros[index].day;

    const descansos = JSON.parse(localStorage.getItem("descansos") || "[]");
    const filtrados = descansos.filter(d => !(d.empleado === empleado && d.day === day));
    filtrados.push({
      empleado,
      day,
      inicio: { hour: diH, minute: diM },
      fin: { hour: dfH, minute: dfM }
    });
    localStorage.setItem("descansos", JSON.stringify(filtrados));
  }

  localStorage.setItem("registros", JSON.stringify(registros));
  alert("Registro actualizado.");
  mostrarJornadasEditable();
}

function eliminarJornada(index) {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  if (!confirm("¿Estás seguro de que quieres eliminar esta jornada?")) return;
  registros.splice(index, 1);
  localStorage.setItem("registros", JSON.stringify(registros));
  mostrarJornadasEditable();
}

// ==========================
// REGENERAR HORAS TOTALES
// ==========================
function recalcularHorasTodos() {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const descansos = JSON.parse(localStorage.getItem("descansos") || "[]");
  const resumen = {};

  registros.forEach(r => {
    const empleado = r.empleado;
    const entradaMin = r.entrada.hour * 60 + r.entrada.minute;
    const salidaMin = r.salida.hour * 60 + r.salida.minute;
    let minutos = salidaMin - entradaMin;

    const desc = descansos.filter(d => d.empleado === empleado && d.day === r.day);
    desc.forEach(d => {
      const di = d.inicio.hour * 60 + d.inicio.minute;
      const df = d.fin.hour * 60 + d.fin.minute;
      minutos -= (df - di);
    });

    if (!resumen[empleado]) {
      resumen[empleado] = { semana: 0, mes: 0 };
    }

    resumen[empleado].semana += minutos / 60;
    resumen[empleado].mes += minutos / 60;
  });

  for (const empleado in resumen) {
    localStorage.setItem(empleado, JSON.stringify(resumen[empleado]));
  }
}

recalcularHorasTodos();

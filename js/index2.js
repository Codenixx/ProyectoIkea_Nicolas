document.addEventListener("DOMContentLoaded", () => {
  const empleados = obtenerEmpleados();
  const contenedor = document.getElementById("empleados");

  empleados.forEach(nombre => {
    const card = document.createElement("div");
    card.className = "empleado-card";

    const minutosTotales = calcularHorasDesdeRegistros(nombre);
    const hs = Math.floor(minutosTotales / 60);
    const ms = minutosTotales % 60;

    card.innerHTML = `
      <h3>${nombre}</h3>
      <p>Horas semanales: ${hs}h ${ms}min</p>
      <button onclick="enviarCorreo('${nombre}')">Enviar correo</button>
    `;

    contenedor.appendChild(card);
  });
});

function descargarRegistroGlobal() {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const descansos = JSON.parse(localStorage.getItem("descansos") || "[]");

  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const filas = [
    [
      "Empleado",
      "Día",
      "Inicio Jornada contractual",
      "Inicio Descanso Jornada",
      "Horas Descanso Jornada",
      "Fin Descanso Jornada",
      "Fin Jornada contractual",
      "Horas Jornada (Diaria)",
      "Minutos Jornada diaria"
    ]
  ];

  registros.forEach(r => {
    const dia = ["L", "M", "X", "J", "V", "S", "D"][r.day];
    const entradaStr = formatHoraMin(r.entrada);
    const salidaStr = formatHoraMin(r.salida);
    const entradaMin = r.entrada.hour * 60 + r.entrada.minute;
    const salidaMin = r.salida.hour * 60 + r.salida.minute;

    const descansosEmpleado = descansos.find(
      d => d.empleado === r.empleado && d.day === r.day
    );

    let descansoInicio = "-";
    let descansoFin = "-";
    let descansoDuracion = "-";
    let minutosDescanso = 0;

    if (descansosEmpleado) {
      descansoInicio = formatHoraMin(descansosEmpleado.inicio);
      descansoFin = formatHoraMin(descansosEmpleado.fin);
      const ini = descansosEmpleado.inicio.hour * 60 + descansosEmpleado.inicio.minute;
      const fin = descansosEmpleado.fin.hour * 60 + descansosEmpleado.fin.minute;
      minutosDescanso = fin - ini;
      descansoDuracion = `${Math.floor(minutosDescanso / 60)}:${(minutosDescanso % 60).toString().padStart(2, '0')}`;
    }

    const minutosJornada = Math.max(salidaMin - entradaMin - minutosDescanso, 0);
    const horasJornada = `${Math.floor(minutosJornada / 60)}h ${minutosJornada % 60}min`;

    filas.push([
      r.empleado,
      dia,
      entradaStr,
      descansoInicio,
      descansoDuracion,
      descansoFin,
      salidaStr,
      horasJornada,
      minutosJornada
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, "registros_empleados_completo.xlsx");
}

function formatHoraMin(obj) {
  return `${obj.hour}:${obj.minute.toString().padStart(2, '0')}`;
}

function calcularHorasDesdeRegistros(nombre) {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const descansos = JSON.parse(localStorage.getItem("descansos") || "[]");

  const jornadas = registros.filter(r => r.empleado === nombre);
  const pausas = descansos.filter(d => d.empleado === nombre);

  let totalMinutos = 0;

  jornadas.forEach(r => {
    const entrada = r.entrada.hour * 60 + r.entrada.minute;
    const salida = r.salida.hour * 60 + r.salida.minute;
    let duracion = salida - entrada;

    // Restar descansos de ese mismo día
    const descs = pausas.filter(d => d.day === r.day);
    descs.forEach(d => {
      const di = d.inicio.hour * 60 + d.inicio.minute;
      const df = d.fin.hour * 60 + d.fin.minute;
      duracion -= (df - di);
    });

    totalMinutos += Math.max(duracion, 0);
  });

  return totalMinutos;
}

function enviarCorreo(nombre) {
  const correo = prompt(`Introduce el correo de ${nombre}:`);
  if (correo) {
    const asunto = encodeURIComponent("Notificación desde el sistema de fichaje IKEA");
    const cuerpo = encodeURIComponent(`Hola ${nombre},\n\nNecesitamos comentarte algo respecto a tu jornada.\n\nUn saludo,\nRRHH`);
    window.location.href = `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;
  }
}

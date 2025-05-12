document.addEventListener("DOMContentLoaded", () => {
  const empleados = obtenerEmpleados();
  const contenedor = document.getElementById("empleados");

  empleados.forEach(nombre => {
    const card = document.createElement("div");
    card.className = "empleado-card";

    const horasSemana = obtenerHoras(nombre, "semana");
    const horasMes = obtenerHoras(nombre, "mes");

    const hs = Math.floor(horasSemana);
    const ms = Math.round((horasSemana - hs) * 60);
    const hm = Math.floor(horasMes);
    const mm = Math.round((horasMes - hm) * 60);

    card.innerHTML = `
      <h3>${nombre}</h3>
      <p>Horas semanales: ${hs}h ${ms}min</p>
      <p>Horas mensuales: ${hm}h ${mm}min</p>
      <button onclick="enviarCorreo('${nombre}')">Enviar correo</button>
    `;

    contenedor.appendChild(card);
  });
});

function descargarRegistroGlobal() {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");

  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const filas = [
    ["Empleado", "Día", "Hora Entrada", "Hora Salida", "Minutos Trabajados"]
  ];

  registros.forEach(r => {
    const dia = ["L", "M", "X", "J", "V", "S", "D"][r.day];
    const entradaMin = r.entrada.hour * 60 + r.entrada.minute;
    const salidaMin = r.salida.hour * 60 + r.salida.minute;
    const tiempo = salidaMin - entradaMin;
    const entrada = `${r.entrada.hour}:${r.entrada.minute.toString().padStart(2, '0')}`;
    const salida = `${r.salida.hour}:${r.salida.minute.toString().padStart(2, '0')}`;
    filas.push([r.empleado, dia, entrada, salida, tiempo]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(filas);
  XLSX.utils.book_append_sheet(wb, ws, "Registros");

  XLSX.writeFile(wb, "registros_empleados.xlsx");
}

function obtenerHoras(nombre, tipo) {
  const datos = JSON.parse(localStorage.getItem(nombre) || "{}");
  return datos[tipo] || 0;
}

function enviarCorreo(nombre) {
  const correo = prompt(`Introduce el correo de ${nombre}:`);
  if (correo) {
    const asunto = encodeURIComponent("Notificación desde el sistema de fichaje IKEA");
    const cuerpo = encodeURIComponent(`Hola ${nombre},\n\nNecesitamos comentarte algo respecto a tu jornada.\n\nUn saludo,\nRRHH`);
    window.location.href = `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;
  }
}

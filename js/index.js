generarSelectorEmpleados("empleadoSelect");
generarHorasVerticales();

document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("empleadoSelect");

  selector.addEventListener("change", () => {
    const empleado = selector.value;
    renderizarBloquesEmpleado(empleado);
    mostrarEntradaActiva(empleado);
  });

  if (selector.value) {
    renderizarBloquesEmpleado(selector.value);
    mostrarEntradaActiva(selector.value);
  }
});

function ficharEntrada() {
  const empleado = document.getElementById("empleadoSelect").value;
  setEmpleadoActual(empleado);

  if (hayEntradaActiva(empleado)) {
    logAlerta("Ya hay una entrada activa.");
    return;
  }

  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const hour = now.getHours();
  const minute = now.getMinutes();

  const entrada = { day, hour, minute, empleado };
  localStorage.setItem(`entrada_${empleado}`, JSON.stringify(entrada));
  logAlerta(`Entrada registrada para ${empleado} a las ${hour}:${minute.toString().padStart(2, '0')}`);
  mostrarEntradaActiva(empleado);
}

function ficharSalida() {
  const empleado = document.getElementById("empleadoSelect").value;
  const now = new Date();
  const salidaHour = now.getHours();
  const salidaMinute = now.getMinutes();

  const entrada = JSON.parse(localStorage.getItem(`entrada_${empleado}`));
  if (!entrada) {
    logAlerta("No hay entrada registrada.");
    return;
  }

  const horaInicio = new Date();
  horaInicio.setHours(entrada.hour, entrada.minute);
  const duracionMinutos = Math.floor((now - horaInicio) / 60000);

  registrarHoras(empleado, duracionMinutos / 60, "semana");
  registrarHoras(empleado, duracionMinutos / 60, "mes");

  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  registros.push({
    empleado,
    day: entrada.day,
    entrada: { hour: entrada.hour, minute: entrada.minute },
    salida: { hour: salidaHour, minute: salidaMinute }
  });
  localStorage.setItem("registros", JSON.stringify(registros));
  localStorage.removeItem(`entrada_${empleado}`);

  logAlerta(`Salida registrada. ${empleado} trabajó ${duracionMinutos} minutos.`);
  renderizarBloquesEmpleado(empleado);
}

function hayEntradaActiva(empleado) {
  return localStorage.getItem(`entrada_${empleado}`) !== null;
}

function mostrarEntradaActiva(empleado) {
  const entrada = JSON.parse(localStorage.getItem(`entrada_${empleado}`));
  if (!entrada) return;

  const columna = document.getElementById(`columna-${entrada.day}`);
  if (!columna) return;

  let bloque = columna.querySelector(".bloque-trabajo-activa");
  if (!bloque) {
    bloque = document.createElement("div");
    bloque.className = "bloque-trabajo bloque-trabajo-activa";
    columna.appendChild(bloque);
  }

  const actualizar = () => {
    const inicio = new Date();
    inicio.setHours(entrada.hour, entrada.minute, 0, 0);
    const ahora = new Date();
    const diff = (ahora - inicio) / 60000;
    if (diff < 0 || diff > 1440) return;

    const top = entrada.hour * 60 + entrada.minute;
    const height = Math.min(diff, 1440 - top);

    bloque.style.top = `${top}px`;
    bloque.style.height = `${height}px`;
  };

  actualizar();
  setInterval(actualizar, 60000);
}

function renderizarBloquesEmpleado(empleado) {
  const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  const filtrados = registros.filter(r => r.empleado === empleado);

  for (let d = 0; d < 7; d++) {
    const columna = document.getElementById(`columna-${d}`);
    if (columna) columna.innerHTML = "";
  }

  filtrados.forEach(r => {
    const columna = document.getElementById(`columna-${r.day}`);
    if (!columna) return;

    const bloque = document.createElement("div");
    bloque.className = "bloque-trabajo";
    const top = (r.entrada.hour * 60 + r.entrada.minute);
    const fin = (r.salida.hour * 60 + r.salida.minute);
    const height = Math.max(fin - top, 1);

    bloque.style.top = `${top}px`;
    bloque.style.height = `${height}px`;
    columna.appendChild(bloque);
  });
}

function generarHorasVerticales() {
  document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".contenedor-horas");
    if (!contenedor) return;
    for (let h = 0; h < 24; h++) {
      const div = document.createElement("div");
      div.className = "hora";
      div.textContent = `${h}:00`;
      contenedor.appendChild(div);
    }
  });
}

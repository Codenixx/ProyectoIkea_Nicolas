// ======================
// FUNCIONES GLOBALES
// ======================

// Empleado activo
function getEmpleadoActual() {
    return localStorage.getItem("EmpleadoActual") || "Jhon";
  }
  
  function setEmpleadoActual(nombre) {
    localStorage.setItem("EmpleadoActual", nombre);
  }
  
  // Validación de entrada activa
  function hayEntradaActiva() {
    return localStorage.getItem("entrada") !== null;
  }
  
  // Formato hora
  function obtenerHoraActual() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Día en texto
  function nombreDia(index) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return dias[index] || "";
  }
  
  // Alerta y consola
  function logAlerta(msg) {
    console.log(`[Sistema]: ${msg}`);
    alert(msg);
  }
  
  // Calcular duración
  function calcularDuracion(horaInicio, horaFin) {
    return horaFin >= horaInicio ? horaFin - horaInicio : 0;
  }
  
  // Reiniciar un empleado
  function reiniciarDatosEmpleado(nombre) {
    localStorage.removeItem(nombre);
    logAlerta(`Datos reiniciados para ${nombre}`);
  }
  
  // ======================
  // UI / SELECTORES
  // ======================
  
  function generarSelectorEmpleados(elementId, callback) {
    const empleados = obtenerEmpleados(); // <- usa los datos reales
    const select = document.getElementById(elementId);
    select.innerHTML = ""; // limpiar opciones existentes
  
    empleados.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp;
      opt.textContent = emp;
      select.appendChild(opt);
    });
  
    select.value = getEmpleadoActual();
    select.addEventListener("change", e => {
      setEmpleadoActual(e.target.value);
      if (callback) callback(e.target.value);
    });
  }
  
  
  // ======================
  // HORARIO VISUAL
  // ======================
  function cargarHorarioVisual(containerId, entradas = []) {
    const cont = document.getElementById(containerId);
    cont.innerHTML = "";
  
    // Primera fila: vacía + días de la semana
    cont.appendChild(document.createElement("div")); // celda vacía
  
    const dias = ["L", "M", "X", "J", "V", "S", "D"];
    dias.forEach(d => {
      const dia = document.createElement("div");
      dia.className = "grid-item day-label";
      dia.textContent = d;
      cont.appendChild(dia);
    });
  
    // Rellenar las filas con horas
    for (let h = 0; h < 24; h++) {
      const hora = document.createElement("div");
      hora.className = "grid-item hour-label";
      hora.textContent = `${h}:00`;
      cont.appendChild(hora);
  
      for (let d = 0; d < 7; d++) {
        const celda = document.createElement("div");
        celda.className = "grid-item";
        celda.dataset.day = d;
        celda.dataset.hour = h;
  
        // Marcar como llena si viene desde localStorage (en un futuro)
        if (entradas.some(ent => ent.day === d && h >= ent.start && h <= ent.end)) {
          celda.classList.add("filled");
        }
  
        cont.appendChild(celda);
      }
    }
  }
  
  
  
  
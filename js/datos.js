// ===========================
// EMPLEADOS
// ===========================

// Obtener lista de empleados desde localStorage
function obtenerEmpleados() {
    return JSON.parse(localStorage.getItem("empleados")) || [];
  }
  
  // Guardar lista de empleados en localStorage
  function guardarEmpleados(lista) {
    localStorage.setItem("empleados", JSON.stringify(lista));
  }
  
  // Agregar nuevo empleado si no existe
  function agregarEmpleado(nombre) {
    let lista = obtenerEmpleados();
    if (!lista.includes(nombre)) {
      lista.push(nombre);
      guardarEmpleados(lista);
      localStorage.setItem(nombre, JSON.stringify({ semana: 0, mes: 0 }));
      return true;
    }
    return false;
  }
  
  // ===========================
  // HORAS
  // ===========================
  
  // Obtener resumen de horas de un empleado
  function obtenerResumen(nombre) {
    return JSON.parse(localStorage.getItem(nombre)) || { semana: 0, mes: 0 };
  }
  
  // Registrar horas trabajadas
  function registrarHoras(nombre, horas, tipo) {
    let data = obtenerResumen(nombre);
    data[tipo] += horas;
    localStorage.setItem(nombre, JSON.stringify(data));
  }
  
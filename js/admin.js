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
  
  // Inicializar
  renderEmpleados();
  
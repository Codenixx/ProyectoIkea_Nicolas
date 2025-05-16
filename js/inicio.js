document.addEventListener("DOMContentLoaded", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <div class="inicio-sesion" style="text-align: center; margin-top: 50px;">
        <h2>Iniciar sesión</h2>
        <input id="usuario" type="text" placeholder="ID de usuario" required style="padding: 10px; margin: 10px;"><br>
        <input id="password" type="password" placeholder="Contraseña" required style="padding: 10px; margin: 10px;"><br>
        <button type="submit" style="padding: 10px 20px;">Entrar</button>
        <p id="error" style="color: red;"></p>
      </div>
    `;
    document.body.appendChild(form);
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const id = document.getElementById("usuario").value.trim();
      const pass = document.getElementById("password").value.trim();
      const lista = JSON.parse(localStorage.getItem("SSO_Ikea") || "[]");
  
      const usuario = lista.find(u => u.id === id && u.password === pass);
  
      if (usuario) {
        localStorage.setItem("EmpleadoActual", usuario.id);
  
        if (usuario.marca === "fancycoffe") {
          window.location.href = "fancycoffe/index.html";
        } else if (usuario.marca === "thermaflow") {
          window.location.href = "thermaflow/index.html";
        } else {
          document.getElementById("error").textContent = "Marca desconocida. Contacte con administración.";
        }
      } else {
        document.getElementById("error").textContent = "Credenciales incorrectas.";
      }
    });
  });
  
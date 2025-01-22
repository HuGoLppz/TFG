document.addEventListener("DOMContentLoaded", function () {
    const relojDigital = document.getElementById("clock-display");

    function actualizarReloj() {
        const estadoGuardado = JSON.parse(localStorage.getItem("pomodoro"));

        if (estadoGuardado && estadoGuardado.tiempo >= 0) {
            const minutos = Math.floor(estadoGuardado.tiempo / 60);
            const segundos = estadoGuardado.tiempo % 60;
            const tiempoFormateado = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
            relojDigital.textContent = tiempoFormateado;
        } else {
            relojDigital.textContent = "No hay temporizador activo";
        }
    }

    // Actualizar cada segundo
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
});

document.addEventListener("DOMContentLoaded", function () {
    const cuerpo = document.body;
    const botonIniciar = document.getElementById("start-timer");
    const botonDetener = document.getElementById("stop-timer");
    const inputEstudio = document.getElementById("study-time");
    const inputDescanso = document.getElementById("break-time");
    let intervalo;

    const tiempoEstudioPorDefecto = 25;
    const tiempoDescansoPorDefecto = 5;

    if (!localStorage.getItem("studyTime")) {
        localStorage.setItem("studyTime", tiempoEstudioPorDefecto);
    }
    if (!localStorage.getItem("breakTime")) {
        localStorage.setItem("breakTime", tiempoDescansoPorDefecto);
    }

    if (inputEstudio) inputEstudio.value = localStorage.getItem("studyTime");
    if (inputDescanso) inputDescanso.value = localStorage.getItem("breakTime");

    const widget = document.createElement("div");
    widget.id = "pomodoro-widget";
    widget.style = `
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        background: black; 
        color: white; 
        border-radius: 5px; 
        padding: 10px; 
        cursor: pointer; 
        z-index: 1000; 
        display: none;
    `;
    widget.innerHTML = `
        <div id="cabecera-widget" style="font-weight: bold;">Pomodoro</div>
        <div id="temporizador-widget" style="display: none; margin-top: 10px;">
            <div id="estado-temporizador" style="font-size: 14px; margin-bottom: 5px;">Estado: -</div>
            <div id="pantalla-temporizador" style="font-size: 18px;">00:00</div>
        </div>
    `;
    cuerpo.appendChild(widget);

    const cabeceraWidget = document.getElementById("cabecera-widget");
    const temporizadorWidget = document.getElementById("temporizador-widget");
    const estadoTemporizador = document.getElementById("estado-temporizador");
    const pantallaTemporizador = document.getElementById("pantalla-temporizador");

    cabeceraWidget.addEventListener("click", function () {
        temporizadorWidget.style.display =
            temporizadorWidget.style.display === "none" ? "block" : "none";
    });

    function mostrarBloqueador(mensaje) {
        const bloqueador = document.createElement("div");
        bloqueador.id = "page-blocker";
        bloqueador.innerHTML = `
            <div>${mensaje}</div>
            <br>
            <br>
            <button id="cerrar-bloqueador" style="text-align: center">Cerrar</button>
        `;
        cuerpo.appendChild(bloqueador);

        document.getElementById("cerrar-bloqueador").addEventListener("click", function () {
            bloqueador.remove();
        });
    }

    function actualizarPantallas(minutos, segundos, textoEstado) {
        const tiempoFormateado = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
        pantallaTemporizador.textContent = tiempoFormateado;
        if (textoEstado) {
            estadoTemporizador.textContent = `Estado: ${textoEstado}`;
        }
    }

    function iniciarTemporizador(duracion, esDescanso) {
        let tiempo = duracion * 60;
        const textoEstado = esDescanso ? "Descanso" : "Estudio";
        clearInterval(intervalo);

        localStorage.setItem(
            "pomodoro",
            JSON.stringify({
                tiempo: tiempo,
                esDescanso: esDescanso,
            })
        );

        intervalo = setInterval(() => {
            const minutos = Math.floor(tiempo / 60);
            const segundos = tiempo % 60;

            actualizarPantallas(minutos, segundos, textoEstado);

            localStorage.setItem(
                "pomodoro",
                JSON.stringify({
                    tiempo: tiempo,
                    esDescanso: esDescanso,
                })
            );

            if (tiempo <= 0) {
                clearInterval(intervalo);
                mostrarBloqueador(esDescanso ? "¡Tiempo de estudio! <br>" : "¡Tiempo de descanso! <br>");
                const siguienteDuracion = esDescanso
                    ? parseInt(localStorage.getItem("studyTime"), 10)
                    : parseInt(localStorage.getItem("breakTime"), 10);
                iniciarTemporizador(siguienteDuracion, !esDescanso);
            }

            tiempo--;
        }, 1000);
    }

    function detenerTemporizador() {
        clearInterval(intervalo);
        actualizarPantallas(0, 0, "Detenido");
        localStorage.removeItem("pomodoro");

        widget.style.display = "none";
    }

    const estadoGuardado = JSON.parse(localStorage.getItem("pomodoro"));
    if (estadoGuardado) {
        widget.style.display = "block";
        iniciarTemporizador(estadoGuardado.tiempo / 60, estadoGuardado.esDescanso);
    }

    botonIniciar?.addEventListener("click", function () {
        const tiempoEstudio = parseInt(inputEstudio?.value || localStorage.getItem("studyTime"), 10);
        const tiempoDescanso = parseInt(inputDescanso?.value || localStorage.getItem("breakTime"), 10);

        if (isNaN(tiempoEstudio) || isNaN(tiempoDescanso)) {
            return;
        }

        localStorage.setItem("studyTime", tiempoEstudio);
        localStorage.setItem("breakTime", tiempoDescanso);

        widget.style.display = "block";
        iniciarTemporizador(tiempoEstudio, false);
    });

    botonDetener?.addEventListener("click", function () {
        detenerTemporizador();
    });
});

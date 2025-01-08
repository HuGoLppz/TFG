$(document).ready(function () {
    inicializarEventos();
    listarSalas();

    let amigosSeleccionados = [];

    function inicializarEventos() {
        $(".crear-sala").on("click", function () {
            $(".menu-crear-sala").show();
        });

        $(".cerrar-ventana").on("click", function () {
            $(".menu-crear-sala").hide();
        });

        $(".btn-crear-sala").on("click", function (event) {
            event.preventDefault();
            crearSala();
        });

        $("#buscar_amigos").on("input", function () {
            buscarAmigos($(this).val().trim());
        });

        $(document).on("click", function (e) {
            if (!$(e.target).closest("#buscar_amigos, #sugerencias_amigos").length) {
                $("#sugerencias_amigos").hide();
            }
        });

        $(".cont-salas").on("click", ".btn-ir", function () {
            const salaId = $(this).data("sala-id");
            obtenerInfoSala(salaId);
        });

        $(".cabecero-sala").on("click", ".acceso-tarea", function () {
            const salaId = $(this).data("sala-id");
            obtenerInfoSala(salaId);
        });


        $(".cabecero-sala").on("click", ".acceso-documentos", function () {
            mostrarGestionDocumentos($(this).data("sala-id"));
            listarArchivos($(this).data("sala-id"));
        });

        $(".cabecero-sala").on("click", ".acceso-chat-grupo", function () {
            const salaId = $(this).data("sala-id");
            mostrarChat(salaId);
            iniciarAutoActualizacionChat(salaId);
        });
        

        $(".contenido-sala").on("click", ".btn-env-mensaje", function () {
            const salaId = $(this).data("sala-id");
            enviarMensaje(salaId);
        });


        $(".cabecero-sala").on("click", ".acceso-ajustes", function () {

        });  
        
        $(".btn-descargar-archivo").on("click", function (event) {
            event.preventDefault();
            
            const url = $(this).attr("href");
            const nombre = $(this).data("nombre");
        
            if (!url || !nombre) {
                alert("No se encontró el archivo a descargar.");
                return;
            }
        
            if (confirm(`¿Quieres descargar el archivo "${nombre}"?`)) {
                const enlace = document.createElement("a");
                enlace.href = url;
                enlace.download = nombre;
                document.body.appendChild(enlace);
                enlace.click();
                document.body.removeChild(enlace);
            }
        });

        $(document).on("click", "#boton-nuevo-mensaje", function () {
            const contenedorMensajes = $("#contenedor-mensajes");
            contenedorMensajes.scrollTop(contenedorMensajes.prop("scrollHeight"));
            $(this).hide(); 
        });

                    
    }

    let intervalChat; 
    let ultimoMensajeId = null;

    function iniciarAutoActualizacionChat(salaId) {
        if (intervalChat) {
            clearInterval(intervalChat);
        }

        intervalChat = setInterval(function () {
            actualizarChat(salaId);
        }, 3000);
    }

    function detenerAutoActualizacionChat() {
        if (intervalChat) {
            clearInterval(intervalChat);
            intervalChat = null;
        }
    }

    function actualizarChat(salaId) {
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "listar_mensajes", salaId: salaId },
            success: function (response) {
                const data = JSON.parse(response);
                if (data.success) {
                    const mensajes = data.mensajes;
                    const listaMensajes = $("#lista-mensajes");
                    const contenedorMensajes = $("#contenedor-mensajes");
                    const botonNuevoMensaje = $("#boton-nuevo-mensaje");

                    if (mensajes.length > 0) {
                        const ultimoMensajeNuevo = mensajes[mensajes.length - 1].mensaje_id;

                        // Si hay nuevos mensajes y el scroll no está abajo, mostrar el botón
                        const scrollAbajo = contenedorMensajes.prop("scrollHeight") - contenedorMensajes.scrollTop() === contenedorMensajes.outerHeight();

                        listaMensajes.empty(); // Limpiar mensajes actuales
                        mensajes.forEach(mensaje => {
                            const alignClass = mensaje.nombre_usuario === "Yo" ? "align-right" : "mensaje";

                            listaMensajes.append(`
                                <li id="${mensaje.usuario_id}" class="${alignClass}">
                                    <strong>${mensaje.nombre_usuario}</strong> 
                                    <p>${mensaje.mensaje}</p>
                                </li>
                            `);
                        });

                        if (ultimoMensajeId !== null && ultimoMensajeNuevo !== ultimoMensajeId && !scrollAbajo) {
                            botonNuevoMensaje.show(); // Mostrar el botón si hay nuevos mensajes
                        }

                        ultimoMensajeId = ultimoMensajeNuevo; // Actualizar el último mensaje recibido
                    } else {
                        listaMensajes.empty();
                        listaMensajes.append("<li>No hay mensajes en esta sala.</li>");
                    }
                } else {
                    alert(data.error || "Error al obtener los mensajes.");
                }
            },
            error: function () {
                alert("Error al conectar con el servidor.");
            },
        });
    }

    function crearSala() {
        $(".menu-crear-sala").hide();

        const nombreSala = $("#nombre_sala").val();
        const descripcionSala = $("#descripcion_sala").val();
        const fechaEntrega = $("#fecha_entrega").val();
        const idAmigos = amigosSeleccionados.map((amigo) => amigo.id);

        if (!nombreSala || !descripcionSala || !fechaEntrega || idAmigos.length === 0) {
            alert("Por favor, completa todos los campos y selecciona al menos un amigo.");
            return;
        }

        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: {
                action: "crear",
                nombre_sala: nombreSala,
                descripcion_sala: descripcionSala,
                fecha_entrega: fechaEntrega,
                idAmigos: idAmigos,
            },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    alert("Sala creada exitosamente!");
                    listarSalas();
                } else {
                    alert("Error al crear la sala: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Hubo un error al conectar con el servidor.");
            },
        });
    }

    function listarSalas() {
        $.ajax({
            url: "../php/salas.php",
            type: "GET",
            data: { action: "listar_participacion" },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    const salas = data.salas;
                    const htmlContent = salas
                        .map((sala) => `
                            <li>
                                <div class="sala">
                                    <h3>${sala.nombre}</h3>
                                    <p>Fecha de entrega: ${sala.fecha_entrega || "No definida"}</p>
                                    <button class="btn-ir" data-sala-id="${sala.sala_id}">Ir a la sala</button>
                                </div>
                            </li>`)
                        .join("");

                    $(".cont-salas ul").html(htmlContent);
                } else {
                    alert("Error al listar salas: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Hubo un error al conectar con el servidor.");
            },
        });
    }

    function obtenerInfoSala(salaId) {
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "infoSala", sala_id: salaId },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    mostrarInfoSala(data.sala, data.participantes);
                } else {
                    alert("Error al obtener información de la sala: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Hubo un error al conectar con el servidor.");
            },
        });
    }

    function mostrarInfoSala(sala, participantes) {
        $(".cabecero-sala").html(`
            <h2>${sala.nombre}</h2>
            <div class="iconos-cabecero-sala">
                <img src="../img/book-outline.svg" class="acceso-tarea" data-sala-id="${sala.sala_id}">
                <img src="../img/document-outline.svg" class="acceso-documentos" data-sala-id="${sala.sala_id}">
                <img src="../img/chatbubble-ellipses-outline.svg" class="acceso-chat-grupo" data-sala-id="${sala.sala_id}">
                <img src="../img/settings-outline.svg" class="acceso-ajustes" data-sala-id="${sala.sala_id}">
            </div>`).show();
        $(".cabecero-sala").css("display", "flex");

        $(".contenido-sala").html(`
            <p><strong>Descripción:</strong> ${sala.descripcion}</p>
            <p><strong>Fecha de creación:</strong> ${sala.fecha_creacion}</p>
            <p><strong>Creador:</strong> ${sala.creador}</p>
            <h3>Participantes:</h3>
            <ul>${participantes.map((p) => `<li>${p.nombre}</li>`).join("")}</ul>`).show();
    }

    function buscarAmigos(a) {
        if (a.length === 0) {
            $("#sugerencias_amigos").empty().hide();
            return;
        }

        $.ajax({
            url: "../php/amigos.php",
            type: "POST",
            data: { accion: "buscar_amigos", a },
            success: function (data) {
                const amigos = JSON.parse(data);
                mostrarSugerenciasAmigos(amigos);
            },
        });
    }

    function listarArchivos(salaId) {
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "listar_archivos", sala_id: salaId },
            success: function (response) {
                console.log(response);
                const data = JSON.parse(response);

                if (data && data.success) {
                    const archivos = data.archivos;
                    const listaArchivos = $("#lista-archivos");
                    listaArchivos.empty();

                    if (archivos.length > 0) {
                        archivos.forEach((archivo) => {
                            console.log(archivo)
                            listaArchivos.append(`
                                <li>
                                    <p>${archivo.nombre}</p>
                                    <div class="randomNameUseless">
                                        <button class="btn-descargar-archivo" href="../archivos/${archivo.sala_id}/${archivo.nombre}" data-nombre="archivo.pdf">Descargar</button>
                                        <button class="btn-eliminar-archivo" data-archivo-id="${archivo.archivo_id}">Eliminar</button>
                                    </div>
                                </li>
                            `);                            
                        });
                    } else {
                        listaArchivos.append("<li>No hay archivos disponibles.</li>");
                    }

                    $(".btn-eliminar-archivo").on("click", function () {
                        const archivoId = $(this).data("archivo-id");
                        eliminarArchivo(archivoId, salaId);
                    });
                } else {
                    alert("Error al listar archivos: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Error al conectar con el servidor.");
            },
        });
    }

    function eliminarArchivo(archivoId, salaId) {
        console.log("Hola");
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "eliminar_archivo", archivo_id: archivoId },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    alert("Archivo eliminado correctamente.");
                    listarArchivos(salaId);
                } else {
                    alert("Error al eliminar archivo: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Error al conectar con el servidor.");
            },
        });
    }


    function mostrarSugerenciasAmigos(amigos) {
        const sugerenciasDiv = $("#sugerencias_amigos");
        sugerenciasDiv.empty().show();

        amigos.forEach((amigo) => {
            const amigoDiv = $(`<div data-id="${amigo.usuario_id}">${amigo.nombre}</div>`);
            amigoDiv.on("click", function () {
                agregarAmigo(amigo.usuario_id, amigo.nombre);
                $("#buscar_amigos").val("");
                sugerenciasDiv.hide();
            });
            sugerenciasDiv.append(amigoDiv);
        });
    }

    function agregarAmigo(id, nombre) {
        if (!amigosSeleccionados.some((amigo) => amigo.id === id)) {
            amigosSeleccionados.push({ id, nombre });
            $("#amigos_invitados").append(
                `<li>${nombre} <button type="button" onclick="eliminarAmigo(${id})">Eliminar</button></li>`
            );
            $("#crearSalaForm").append(`<input type="hidden" name="lista_amigos[]" value="${id}">`);
        }
    }

    window.eliminarAmigo = function (id) {
        amigosSeleccionados = amigosSeleccionados.filter((amigo) => amigo.id !== id);
        $(`input[name="lista_amigos[]"][value="${id}"]`).remove();
        $(`#amigos_invitados li button[onclick="eliminarAmigo(${id})"]`).parent().remove();
    };

    function mostrarGestionDocumentos(salaId) {
        console.log(salaId);
        $(".contenido-sala").html(`
            <h3>Gestión de documentos</h3>
            <div class="subir-archivo">
                <input type="file" id="archivo" style="display:none">
                <label for="archivo" class="file-box" style="margin-right: 20px;">
                    Seleccionar archivo
                </label>
                <button id="btn-subir" data-sala-id="${salaId}">Subir archivo</button>
            </div>
            <h4>Archivos subidos:</h4>
            <ul id="lista-archivos">
                <li>No hay archivos aún.</li>
            </ul>`);
    
        $("#archivo").on("change", function () {
            const archivo = this.files[0];
            if (archivo) {
                $("label[for='archivo']").text(archivo.name);
            } else {
                $("label[for='archivo']").text("Seleccionar archivo");
            }
        });
    
        $("#btn-subir").on("click", function () {
            const archivo = $("#archivo")[0].files[0];
            if (!archivo) {
                alert("Por favor, selecciona un archivo para subir.");
                return;
            }
    
            const formData = new FormData();
            formData.append("archivo", archivo);
            formData.append("action", "subir_archivo");
            formData.append("sala_id", salaId);
    
            $.ajax({
                url: "../php/salas.php",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    const data = JSON.parse(response);
                    if (data.success) {
                        alert("Archivo subido correctamente.");
                        listarArchivos(salaId);
                        $("#archivo").val("");
                        $("label[for='archivo']").text("Seleccionar archivo");
                    } else {
                        alert("Error: " + data.error);
                    }
                },
                error: function () {
                    alert("Error al conectar con el servidor.");
                },
            });
        });
    }
    

    function enviarMensaje(salaId) {
        console.log($("#texto_mensaje").val().trim())
        const mensaje = $("#texto_mensaje").val().trim();

        if (!mensaje || typeof mensaje !== "string" || mensaje.trim() === "") {
            alert("El mensaje no puede estar vacío.");
            return;
        }

        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: {
                action: "enviar_mensaje",
                sala_id: salaId,
                mensaje: mensaje.trim(),
            },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    $("#mensaje-input").val("");
                    mostrarChat(salaId);
                } else {
                    alert("Error al enviar el mensaje: " + (data.error || "Desconocido"));
                }
            },
            error: function () {
                alert("Error al conectar con el servidor.");
            },
        });
    }

    function mostrarChat(salaId) {
        $(".contenido-sala").html(`
            <ul id="lista-mensajes">
                <li>Cargando mensajes...</li>
            </ul>

            <div class="form">
                <div class="input-container">
                    <input class = "input" type="text" id="texto_mensaje" placeholder="Envia un mensaje">
                    <span class="input-border"></span>
                </div>
                <span class="input-border"></span>
                <button class="btn-env-mensaje" data-sala-id="${salaId}">Enviar</button>
            </div>
        `);
        /*<div id="boton-nuevo-mensaje" style="display:none">nuevo mensaje</div>*/ 
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "listar_mensajes", salaId: salaId },
            success: function (response) {
                const data = JSON.parse(response);
                if (data.success) {
                    const mensajes = data.mensajes;
                    const listaMensajes = $("#lista-mensajes");
                    listaMensajes.empty();
                    console.log(response);
                    if (mensajes.length > 0) {
                        mensajes.forEach(mensaje => {
                            const alignClass = mensaje.nombre_usuario === "Yo" ? "align-right" : "mensaje";
                            
                            listaMensajes.append(`
                                <li id="${mensaje.usuario_id}" class="${alignClass}">
                                    <strong>${mensaje.nombre_usuario}</strong> 
                                    <p>${mensaje.mensaje}</p>
                                </li>   
                            `);
                        });
                    } else {
                        listaMensajes.append("<li>No hay mensajes en esta sala.</li>");
                    }
                    const contenedorMensajes = $("#lista-mensajes");
                    contenedorMensajes.scrollTop(contenedorMensajes.prop("scrollHeight"));
                } else {
                    alert(data.error || "Error al obtener los mensajes.");
                }
            },
            error: function () {
                alert("Error al conectar con el servidor.");
            },
        });
        
    }
});

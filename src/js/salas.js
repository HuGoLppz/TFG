$(document).ready(function () {
    inicializarEventos();
    listarSalas();
    cargarAsignaturas();

    let amigosSeleccionados = [];

    function inicializarEventos() {
        console.log($(".tareas-crear").length);

        $(".btn-crear-tarea").on("click", function () {
            const salaId = $(".acceso-tarea").data("sala-id");
            console.log(salaId);
            crearTarea(salaId);
            obtenerInfoSala(salaId);
            $(".menu-crear-sala").hide();
            $(".tareas-crear").hide();
        });

        $(".crear-sala").on("click", function () {
            $(".menu-crear-sala").show();
        });

        $(".cerrar-ventana").on("click", function () {
            $(".menu-crear-sala").hide();
            $(".tareas-crear").hide();
            $(".cont-info-tareas").hide();
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

        $(document).on("click", ".btn-descargar-archivo", function (event) {
            event.preventDefault();

            const url = $(this).data("url");
            const nombre = $(this).data("nombre");

            if (!url || !nombre) {
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

    function crearTarea(id_a) {
        $('form').off('submit').on('submit', function (e) {
            e.preventDefault();
    
            var titulo = $('#titulo').val();
            var descripcion = $('#descripcion').val();
            var fecha_entrega = $('#fecha_entrega2').val();
            console.log(fecha_entrega, descripcion);
            console.log('Fecha Entrega:', fecha_entrega);

            var id = id_a;
    
            $.ajax({
                url: '../php/salas.php',
                method: 'POST',
                data: {
                    action: "insertar_tarea",
                    titulo: titulo,
                    descripcion: descripcion,
                    fecha_entrega: fecha_entrega,
                    id: id,
                },
                success: function (response) {

                },
                error: function (xhr, status, error) {
                }
            });
        });
    }
    
    function listarTareas(sala_id) {
        $.ajax({
            url: '../php/salas.php',
            method: 'POST',
            data: {
                action: "listar_tareas",
                sala_id: sala_id,
            },
            success: function (response) {
                let data;
                try {
                    data = typeof response === "string" ? JSON.parse(response) : response;
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (!data.success) {
                    return;
                }
                const tareas = data.tareas;
                $('.lista_tareas_sala').empty();
                if (Array.isArray(tareas) && tareas.length > 0) {
                    tareas.forEach(function (tarea) {
                        const tareaHTML = `
                            <li class="tarea_lista" 
                                data-id="${tarea.tarea_sala_id}" 
                                data-titulo="${tarea.titulo}" 
                                data-fecha_entrega="${tarea.fecha_entrega}" 
                                data-descripcion="${tarea.descripcion || ''}" 
                                data-estado="${tarea.estado || ''}">
                                <strong>${tarea.titulo}</strong><br>
                                <p>Fecha de entrega: ${tarea.fecha_entrega}</p><br>
                            </li>
                        `;
                        $('.lista_tareas_sala').append(tareaHTML);
                    });
                }

                $(".tarea_lista").on("click", function () {
                    const tareaId = $(this).data("id");
                    const tareaTitulo = $(this).data("titulo");
                    const tareaFechaEntrega = $(this).data("fecha_entrega");
                    const tareaDescripcion = $(this).data("descripcion") || "Sin descripción";
                    const tareaEstado = $(this).data("estado") || "Sin estado";

                    console.log("Tarea ID clicada:", tareaId);
                    $(".cont-info-tareas").show();

                    let $infoContainer = $(".cont-info-tareas");
                    if ($infoContainer.length === 0) {
                        $infoContainer = $('<section class="cont-info-tareas"></section>');
                        $('body').append($infoContainer);
                    }

                    const infoHTML = `
                        <img src="../img/x-lg.svg" alt="cerrar ventana" class="cerrar-ventana">
                        <h3>Información detallada</h3>
                        <p>Título: ${tareaTitulo}</p>
                        <p>Fecha de entrega: ${tareaFechaEntrega}</p>
                        <p>Descripción: ${tareaDescripcion}</p>
                        <p>Estado: ${tareaEstado}</p>
                        <p>Calificación de la tarea:</p>
                        <div class="input-container">
                            <input type="number" id="numeric_input" name="numeric_input" min="0" max="10">
                            <span class="input-border"></span>
                        </div>
                        <br>
                        <button id="enviar-info">Completar tarea</button>
                        <button id="eliminar-tarea">Eliminar tarea</button>
                    `;
                    $infoContainer.html(infoHTML);

                    $(".cerrar-ventana").on("click", function () {
                        $(".cont-info-tareas").hide();
                    });

                    $("#enviar-info").on("click", function () {
                        const inputValue = $("#numeric_input").val();
                        if (!inputValue || isNaN(inputValue)) {
                            return;
                        }
                        else{
                            completarTarea(tareaId, inputValue, sala_id);
                        }
                    });

                    $("#eliminar-tarea").on("click", function () {
                        eliminar_tarea(tareaId, sala_id);
                    })
                });
            },
            error: function (xhr, status, error) {
                console.log(status, error);
            }
        })
    };

    function eliminar_tarea(tareaId, salaId) {
        if (!tareaId) {
            return;
        }
        $.ajax({
            url: '../php/salas.php',
            method: 'POST',
            data: {
                action: "eliminar_tarea",
                tarea_id: tareaId,
            },
            success: function (response) {
                let data;
                try {
                    if (!response) {
                        throw new Error("Respuesta vacía del servidor.");
                    }
                    data = typeof response === "string" ? JSON.parse(response) : response;
                } catch (e) {
                    console.error("Error al procesar la respuesta del servidor:", e);
                    return;
                }
                if (data.success) {
                    console.log("ID de tarea enviada:", tareaId);
                    obtenerInfoSala(salaId);
                    $(".cont-info-tareas").hide();
                } else {
                }
            },
            error: function (xhr, status, error) {
                console.error("Error en la solicitud AJAX:", status, error);
            },
        });
    }

    function completarTarea(id_tarea, nota, id_sala) {
        $.ajax({
            url: '../php/salas.php',
            type: 'POST',
            data: {
                action: 'completar_tarea',
                id_tarea: id_tarea,
                nota: nota,
                id_sala: id_sala
            },
            success: function(response) {
                console.log('Tarea completada y datos actualizados:', response);
                listarTareas(id_sala);
                $(".cont-info-tareas").hide();

            },
            error: function(error) {
                console.error('Error al completar la tarea:', error);
            }
        });
    }    

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

                        const scrollAbajo = contenedorMensajes.prop("scrollHeight") - contenedorMensajes.scrollTop() === contenedorMensajes.outerHeight();

                        listaMensajes.empty();
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
                            botonNuevoMensaje.show();
                        }

                        ultimoMensajeId = ultimoMensajeNuevo;
                    } else {
                        listaMensajes.empty();
                        listaMensajes.append("<li>No hay mensajes en esta sala.</li>");
                    }
                } else {
                }
            },
            error: function () {
            },
        });
    }
    function cargarAsignaturas() {
        $.ajax({
            url: "../php/tareas.php",
            method: "POST",
            data: { action: "listarAsignaturas" },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    const asignaturas = response.data;
                    const selectAsignatura = $("#asignaturaSeleccionada");
                    selectAsignatura.empty();
                    selectAsignatura.append('<option value="">Selecciona una asignatura</option>');
                    asignaturas.forEach(function (asignatura) {
                        selectAsignatura.append(
                            `<option value="${asignatura.nombre_asignatura}">${asignatura.nombre_asignatura}</option>`
                        );
                    });
                } else {
                }
            },
            error: function () {
            },
        });
    }

    function crearSala() {
        $(".menu-crear-sala").hide();

        const nombreSala = $("#nombre_sala").val();
        const descripcionSala = $("#descripcion_sala").val();
        const fechaEntrega = $("#fecha_entrega").val();
        const asignatura = $("#asignaturaSeleccionada").val();
        const idAmigos = amigosSeleccionados.map((amigo) => amigo.id);

        if (!nombreSala || !descripcionSala || !fechaEntrega || !asignatura || idAmigos.length === 0) {
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
                asignatura: asignatura,
                idAmigos: idAmigos,
            },
            success: function (response) {
                const data = JSON.parse(response);

                if (data.success) {
                    listarSalas();
                } else {
                }
            },
            error: function () {
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
                }
            },
            error: function () {
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
                    listarTareas(salaId)
                } else {
                }
            },
            error: function () {
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
            <div class="cont-display">
                <div class="usuarios_sala_cont">
                    <h3>Participantes</h3>
                    <ul class="cont_usuarios_sala">${participantes.map((p) =>
            `<li class="usuarios_sala">
                            <img src="${p.foto_perfil || '../img/default-profile.png'}" alt="Foto de perfil" class="imagenes">
                            <p>${p.nombre}</p>
                        </li>`).join("")}
                    </ul>
                </div> 
                <div class="tareas_salas_cont">
                    <h3>Tareas de la sala</h3>
                    <ul class="lista_tareas_sala">
                    </ul>
                    <button class="anadir-tares-sala">Añadir tarea</button>
                </div>
            </div>
        `).show();
        $(".tareas_salas_cont").on("click", ".anadir-tares-sala", function () {
            $(".tareas-crear").show();
        });
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
                const data = JSON.parse(response);

                if (data && data.success) {
                    const archivos = data.archivos;
                    const listaArchivos = $("#lista-archivos");
                    listaArchivos.empty();

                    if (archivos.length > 0) {
                        archivos.forEach((archivo) => {
                            const salaIdLimpio = archivo.sala_id.replace('#', '');
                            listaArchivos.append(`
                        <li>
                            <p>${archivo.nombre}</p>
                            <div class="randomNameUseless">
                            <button class="btn-descargar-archivo" data-url="../archivos/${salaIdLimpio}/${archivo.nombre}" data-nombre="${archivo.nombre}">Descargar</button>
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
                }
            },
            error: function () {
            },
        });
    }

    function eliminarArchivo(archivoId, salaId) {
        $.ajax({
            url: "../php/salas.php",
            type: "POST",
            data: { action: "eliminar_archivo", archivo_id: archivoId },
            success: function (response) {
                const data = JSON.parse(response);
                if (data.success) {
                    listarArchivos(salaId);
                } else {
                }
            },
            error: function () {
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
                        listarArchivos(salaId);
                        $("#archivo").val("");
                        $("label[for='archivo']").text("Seleccionar archivo");
                    } else {
                    }
                },
                error: function () {
                },
            });
        });
    }

    function enviarMensaje(salaId) {
        const mensaje = $("#texto_mensaje").val().trim();
        if (!mensaje || typeof mensaje !== "string" || mensaje.trim() === "") {
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
                }
            },
            error: function () {
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
                }
            },
            error: function () {
            },
        });
    }
});
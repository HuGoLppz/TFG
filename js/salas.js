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
                <img src="../img/chatbubble-ellipses-outline.svg" class="acceso-chat-grupo">
                <img src="../img/settings-outline.svg" class="acceso-ajustes">
            </div>`).show();
            $(".cabecero-sala").css("display", "flex");

        $(".contenido-sala").html(`
            <p><strong>Descripción:</strong> ${sala.descripcion}</p>
            <p><strong>Fecha de creación:</strong> ${sala.fecha_creacion}</p>
            <p><strong>Creador:</strong> ${sala.creador}</p>
            <h3>Participantes:</h3>
            <ul>${participantes.map((p) => `<li>${p.nombre}</li>`).join("")}</ul>`).show();
    }

    function buscarAmigos(query) {
        if (query.length === 0) {
            $("#sugerencias_amigos").empty().hide();
            return;
        }

        $.ajax({
            url: "../php/amigos.php",
            type: "POST",
            data: { accion: "buscar_amigos", query },
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
                            listaArchivos.append(`
                                <li>
                                    <a href="${archivo.url}" target="_blank">${archivo.nombre}</a>
                                    <button class="btn-eliminar-archivo" data-archivo-id="${archivo.archivo_id}">Eliminar</button>
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
                <input type="file" id="archivo">
                <button id="btn-subir" data-sala-id="${salaId}">Subir archivo</button>
            </div>
            <h4>Archivos subidos:</h4>
            <ul id="lista-archivos">
                <li>No hay archivos aún.</li>
            </ul>`);

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
});

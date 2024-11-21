$(document).ready(function() {
    listarSalas();
    
    $(".crear-sala").on("click", function() {
        $(".menu-crear-sala").css("display", "block");
    });

    $(".cerrar-ventana").on("click", function(){
        $(".menu-crear-sala").css("display", "none");
    });

    $(".btn-crear-sala").on("click", function(event) {
        event.preventDefault(); 
        $(".menu-crear-sala").css("display", "none");

        var nombre_sala = $('#nombre_sala').val();
        var descripcion_sala = $('#descripcion_sala').val();
        var fecha_entrega = $('#fecha_entrega').val();
        var idAmigos = amigosSeleccionados.map(amigo => amigo.id); 

        console.log("IDs de amigos seleccionados: ", idAmigos);

        if (!nombre_sala || !descripcion_sala || !fecha_entrega || idAmigos.length === 0) {
            alert('Por favor, completa todos los campos y selecciona al menos un amigo.');
            return;
        }

        $.ajax({
            url: '../php/salas.php',
            type: 'POST',
            data: {
                action: 'crear',
                nombre_sala: nombre_sala,
                descripcion_sala: descripcion_sala,
                fecha_entrega: fecha_entrega,
                idAmigos: idAmigos 
            },
            success: function(response) {
                console.log(response);
                var data = JSON.parse(response);

                if (data.success) {
                    alert('Sala creada exitosamente!');
                    listarSalas();
                } else {
                    alert('Error al crear la sala: ' + (data.error || 'Desconocido'));
                }
            },
            error: function() {
                alert('Hubo un error al conectar con el servidor.');
            }
        });
    });

    function listarSalas() {
        $.ajax({
            url: '../php/salas.php',
            type: 'GET',
            data: { action: 'listar_participacion' },
            success: function(response) {
                console.log(response);
                var data = JSON.parse(response);

                if (data.success) {
                    var salas = data.salas;
                    var htmlContent = '';

                    salas.forEach(function(sala) {
                        htmlContent += `
                            <li>
                                <div class="sala">
                                    <h3>${sala.nombre}</h3>
                                    <p>Fecha de entrega: ${sala.fecha_entrega ? sala.fecha_entrega : 'No definida'}</p>
                                    <button class="btn-ir" data-sala-id="${sala.sala_id}">Ir a la sala</button>
                                </div>
                            </li>`;
                    });

                    $(".cont-salas ul").html(htmlContent);
                } else {
                    alert('Error al listar salas: ' + (data.error || 'Desconocido'));
                }
            },
            error: function() {
                alert('Hubo un error al conectar con el servidor.');
            }
        });
    }

    $(".cont-salas").on("click", ".btn-ir", function() {
        const salaId = $(this).data("sala-id"); 
        obtenerInfoSala(salaId);
    });
    
    function obtenerInfoSala(salaId) {
        $.ajax({
            url: '../php/salas.php',
            type: 'POST',
            data: { action: 'infoSala', sala_id: salaId },
            success: function(response) {
                const data = JSON.parse(response);
                if (data.success) {
                    mostrarInfoSala(data.sala, data.participantes);
                } else {
                    alert('Error al obtener información de la sala: ' + (data.error || 'Desconocido'));
                }
            },
            error: function() {
                alert('Hubo un error al conectar con el servidor.');
            }
        });
    }
    
    function mostrarInfoSala(sala, participantes) {
        const contenidoCabeceroSala = $(".cabecero-sala");
        contenidoCabeceroSala.empty();
        contenidoCabeceroSala.append(`
            <h2>${sala.nombre}</h2>
                <div class="iconos-cabecero-sala">
                    <img src="../img/book-outline.svg" class="acceso-tarea">
                    <img src="../img/document-outline.svg" class="acceso-documentos">
                    <img src="../img/chatbubble-ellipses-outline.svg" class="acceso-chat-grupo">
                    <img src="../img/settings-outline.svg" class="acceso-ajustes">
                </div>
            `);
        const contenidoSala = $(".contenido-sala");
        contenidoSala.empty(); 
        contenidoSala.append(`
            <p><strong>Descripción:</strong> ${sala.descripcion}</p>
            <p><strong>Fecha de creación:</strong> ${sala.fecha_creacion}</p>
            <p><strong>Fecha de entrega:</strong> ${sala.fecha_entrega || 'No definida'}</p>
            <p><strong>Creador:</strong> ${sala.creador}</p>
            <h3>Participantes:</h3>
            <ul>${participantes.map(participante => `<li>${participante.nombre}</li>`).join('')}</ul>
        `);
        $(".cabecero-sala").css("display", "flex");
        contenidoSala.css("display", "block");
    }
    let amigosSeleccionados = [];
    
    $('#buscar_amigos').on('input', function() {
        const query = $(this).val().trim();
        if (query.length > 0) {
            $.ajax({
                url: '../php/amigos.php',
                type: 'POST',
                data: { accion: 'buscar_amigos', query: query },
                success: function(data) {
                    const amigos = JSON.parse(data);
                    mostrarSugerencias(amigos);
                }
            });
        } else {
            $('#sugerencias_amigos').empty().hide();
        }
    });

    function mostrarSugerencias(amigos) {
        const sugerenciasDiv = $('#sugerencias_amigos');
        sugerenciasDiv.empty().show();
        amigos.forEach(amigo => {
            const amigoDiv = $(`<div data-id="${amigo.usuario_id}">${amigo.nombre}</div>`);
            amigoDiv.on('click', function() {
                agregarAmigo(amigo.usuario_id, amigo.nombre);
                $('#buscar_amigos').val('');
                sugerenciasDiv.hide();
            });
            sugerenciasDiv.append(amigoDiv);
        });
    }

    function agregarAmigo(id, nombre) {
        if (!amigosSeleccionados.some(amigo => amigo.id === id)) {
            amigosSeleccionados.push({ id: id, nombre: nombre });
            $('#amigos_invitados').append(`<li>${nombre} <button type="button" onclick="eliminarAmigo(${id})">Eliminar</button></li>`);
            $('#crearSalaForm').append(`<input type="hidden" name="lista_amigos[]" value="${id}">`);
        }
    }

    window.eliminarAmigo = function(id) {
        amigosSeleccionados = amigosSeleccionados.filter(amigo => amigo.id !== id);
        $(`input[name="lista_amigos[]"][value="${id}"]`).remove();
        $(`#amigos_invitados li button[onclick="eliminarAmigo(${id})"]`).parent().remove();
    };

    $(document).on('click', function(e) {
        if (!$(e.target).closest('#buscar_amigos, #sugerencias_amigos').length) {
            $('#sugerencias_amigos').hide();
        }
    });

    $(".cont-salas").on("click", ".btn-ir", function() {
        $(".cabecero-sala").css("display", "flex");
        $(".contenido-sala").css("display", "block");
    });
});

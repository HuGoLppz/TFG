$(document).ready(function() {
    listarSalas();
    
    $(".crear-sala").on("click", function() {
        $(".menu-crear-sala").css("display", "block");
    });

    $(".btn-crear-sala").on("click", function(event) {
        event.preventDefault(); 
        $(".menu-crear-sala").css("display", "none");

        var nombre_sala = $('#nombre_sala').val();
        var descripcion_sala = $('#descripcion_sala').val();
        var fecha_entrega = $('#fecha_entrega').val();
        var idAmigos = amigosSeleccionados.map(amigo => amigo.id); // IDs de los amigos seleccionados

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

    // Variables para manejar los amigos seleccionados y sugerencias de búsqueda
    let amigosSeleccionados = [];
    
    // Buscar amigos en tiempo real al escribir
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

    // Mostrar sugerencias de amigos en el desplegable
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

    // Agregar amigo a la lista de invitados
    function agregarAmigo(id, nombre) {
        if (!amigosSeleccionados.some(amigo => amigo.id === id)) {
            amigosSeleccionados.push({ id: id, nombre: nombre });
            $('#amigos_invitados').append(`<li>${nombre} <button type="button" onclick="eliminarAmigo(${id})">Eliminar</button></li>`);
            $('#crearSalaForm').append(`<input type="hidden" name="lista_amigos[]" value="${id}">`);
        }
    }

    // Eliminar amigo de la lista de invitados
    window.eliminarAmigo = function(id) {
        amigosSeleccionados = amigosSeleccionados.filter(amigo => amigo.id !== id);
        $(`input[name="lista_amigos[]"][value="${id}"]`).remove();
        $(`#amigos_invitados li button[onclick="eliminarAmigo(${id})"]`).parent().remove();
    };

    // Ocultar sugerencias cuando se hace clic fuera
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

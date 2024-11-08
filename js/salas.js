$(document).ready(function() {
    listarSalas();
    $(".crear-sala").on("click", function() {
        $(".menu-crear-sala").css("display", "block");
        listarAmigos();
    });

    $(".btn-crear-sala").on("click", function(event) {
        event.preventDefault(); 
        $(".menu-crear-sala").css("display", "none");

        var nombre_sala = $('#nombre_sala').val();
        var descripcion_sala = $('#descripcion_sala').val();
        var fecha_entrega = $('#fecha_entrega').val();
        var idAmigos = $('#lista_amigos').val(); 

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
    function listarAmigos() {
        $.ajax({
            url: '../php/amigos.php',
            type: 'POST',
            data: { accion: 'listar_amigos' },
            success: function(data) {
                const amigos = JSON.parse(data);
                $('#lista_amigos').empty(); 
                $('#lista_amigos').append('<option value="">Selecciona un amigo</option>');
                amigos.forEach(amigo => {
                    $('#lista_amigos').append(`
                        <option value="${amigo.usuario_id}">${amigo.nombre}</option>
                    `);
                });
            }
        });
    }

    $(".cont-salas").on("click", ".btn-ir", function() {
        $(".cabecero-sala").css("display", "flex");
        $(".contenido-sala").css("display", "block");
    });
});

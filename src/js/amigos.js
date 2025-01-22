$(document).ready(function() {
    function listarAmigos() {
        const valorBusqueda = $('#busqueda-nuevos').val();
        $.ajax({
            url: '../php/amigos.php',
            type: 'POST',
            data: { 
                accion: 'listar_amigos',
                valor: valorBusqueda
            },
            success: function (data) {
                const amigos = JSON.parse(data);
                $('#lista-amigos').empty();
                amigos.forEach(amigo => {
                    $('#lista-amigos').append(`
                        <li>
                            <div class="amigo">
                                <a href="../html/perfil-amigo.html?usuario_id=${amigo.usuario_id.replace('#', '')}">
                                    <img src="${amigo.foto_perfil || '../img/default-profile.png'}" alt="Amigo ${amigo.nombre}" class="img-perfil">
                                    <h3>${amigo.nombre}</h3>
                                    <p>${amigo.usuario_id}</p>
                                </a>
                            </div>
                        </li>
                    `);
                });
            },
            error: function () {
                $('#lista-amigos').html('<p>Error al cargar la lista de amigos.</p>');
            }
        });
    }

    $('#busqueda-nuevos').on('input', function () {
        listarAmigos();
        console.log($('#busqueda-nuevos').val())
    });

    listarAmigos(); 

    $('#busqueda').on('input', function() {
        const busqueda = $('#busqueda').val();
        $.ajax({
            url: '../php/amigos.php',
            type: 'POST',
            data: { accion: 'buscar_agregar', busqueda: busqueda },
            success: function(data) {
                console.log(data)
                const usuarios = JSON.parse(data);
                $('#resultados-busqueda').empty();

                if (usuarios.mensaje) {
                    $('#resultados-busqueda').append(`<li>${usuarios.mensaje}</li>`);
                }
                else if(busqueda === ""){
                    $('#resultados-busqueda').append(`<li>No se encontraron usuarios</li>`);
                }
                else {
                    usuarios.forEach(usuario => {
                        $('#resultados-busqueda').append(`
                            <li>
                                <div class="usuario">
                                    <p>${usuario.nombre} | ${usuario.usuario_id}</p>
                                    <button class="agregar-amigo" data-id="${usuario.usuario_id}">Agregar</button>
                                </div>
                            </li>
                        `);
                    });
                }
            }
        });
    });

    $(document).on('click', '.agregar-amigo', function() {
        const amigo_id = $(this).data('id');
        $.ajax({
            url: '../php/amigos.php',
            type: 'POST',
            data: { accion: 'agregar_amigo', amigo_id: amigo_id },
            success: function(data) {
                const respuesta = JSON.parse(data);
                listarAmigos();
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    });
});

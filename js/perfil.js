$(document).ready(function () {
    $.ajax({
        url: '../php/profile.php',
        type: 'GET',
        data: { datos_usuario: true },  
        dataType: 'json',
        success: function (data) {
            if (data.success) {
                let profileData = data.userData;
                $('#nombre-usuario').text(profileData.nombre || 'Usuario no disponible');
                $('#id-usuario').text(profileData.usuario_id || 'Usuario no disponible');
                $('#estudios-usuario').text((profileData.curso || '') + " " + (profileData.estudios || 'Estudios no disponibles'));
                $('#descripcion-usuario').text(profileData.descripcion || 'Sin descripción');
                $('#imagen-perfil').attr('src', profileData.foto_perfil || '../img/default-profile.png');
    
                $('#descripcion').val(profileData.descripcion || '');
                $('#curso').val(profileData.curso || '');
                $('#estudios').val(profileData.estudios || '');
                $('#privacidad').prop('checked', profileData.privacidad == 1);
            } else {
                alert(data.error || 'Error desconocido');
            }
        },
        error: function () {
            alert('Hubo un error al cargar los datos del perfil.');
        }
    });
    

    $("#conf-perfil").on("click", function() {
        $(".perfil-contenedor").hide();
        $(".formulario-perfil").show();
        listarAsignaturas();
    });

    $("#mostrar-cont-asignaturas").on("click", function(){
        $(".formulario-perfil").hide();
        $(".cont-asignaturas").show();
    });

    $("#volver-editar").on("click", function(){
        $(".formulario-perfil").show();
        $(".cont-asignaturas").hide();
    });

    $("#enviar-formulario").on("click", function(event) {
        event.preventDefault();

        var formData = new FormData();
        formData.append("descripcion", $("#descripcion").val());
        formData.append("curso", $("#curso").val());
        formData.append("estudios", $("#estudios").val());
        formData.append("privacidad", $("#privacidad").is(":checked") ? 1 : 0);

        const fileInput = document.querySelector('.foto-perfil-input');
        if (fileInput.files[0]) {
            formData.append("foto_perfil", fileInput.files[0]);
        }

        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert(response.success);
                } else {
                    alert(response.error || 'Error al actualizar el perfil.');
                }

                $(".perfil-contenedor").show();
                $(".formulario-perfil").hide();

                location.reload();
            },
            error: function() {
                alert('Error al intentar actualizar el perfil.');
            }
        });
    });

    // Crear nueva asignatura
    $('#crear_asignatura').on('click', function () {
        const nuevaAsignatura = $('#nueva_asignatura').val().trim();

        if (nuevaAsignatura) {
            $.ajax({
                url: '../php/profile.php',
                type: 'POST',
                data: { crear_asignatura: nuevaAsignatura },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        listarAsignaturas();  // Refrescar la lista de asignaturas
                    } else {
                        alert(response.error || 'Error al crear la asignatura.');
                    }
                },
                error: function () {
                    alert('Hubo un error al crear la asignatura.');
                }
            });
        } else {
            alert('Por favor, ingresa el nombre de la asignatura.');
        }
    });

    function eliminarAsignatura(id, item) {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { eliminar_asignatura: id },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    item.remove();  
                } else {
                    alert(response.error || 'Error al eliminar la asignatura.');
                }
            },
            error: function () {
                alert('Hubo un error al eliminar la asignatura.');
            }
        });
    }

    function listarAsignaturas() {
        $.ajax({
            url: '../php/profile.php',
            type: 'GET',
            data: { listar_asignaturas: true },  
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#asignaturas_añadidas').empty();    

                    response.asignaturas.forEach(function(asignatura) {
                        const listItem = $('<li class="asignatura">')
                            .text(asignatura.nombre_asignatura)
                            .attr('data-id', asignatura.asignatura_id);
                        
                        // Crear botón de eliminar
                        const deleteButton = $('<button>')
                            .text('Eliminar')
                            .on('click', function() {
                                eliminarAsignatura(asignatura.asignatura_id, listItem);
                            });
                        
                        listItem.append(deleteButton);
                        $('#asignaturas_añadidas').append(listItem);
                    });
                } else {
                    alert('Error al listar las asignaturas');
                }
            },
            error: function () {
                alert('Hubo un error al listar las asignaturas.'); 
            }
        });
    }
});

$(document).ready(function () {
    notasMedias();
    obtenerEstadisticas();
    $.ajax({
        url: '../php/profile.php',
        type: 'POST',
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
                        listarAsignaturas(); 
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

    function obtenerEstadisticas() {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { obtener_estadisticas: true },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const estadisticas = response.estadisticas;
    
                    const estadisticasContainer = $('.estadisticas');
                    estadisticasContainer.empty();
    
                    const lista = $('<ul></ul>');
                    lista.append(`<li>Amigos totales: ${estadisticas.total_amigos}</li>`);
                    lista.append(`<li>Tareas completadas: ${estadisticas.tareas_completadas}</li>`);
                    lista.append(`<li>Tareas sin completar: ${estadisticas.tareas_sin_completar}</li>`);
                    lista.append(`<li>Media total de las asignaturas: ${estadisticas.media_total_asignaturas}</li>`);
                    lista.append(`<li>Salas totales: ${estadisticas.total_salas}</li>`);
                    lista.append(`<li>Fecha de registro: ${estadisticas.fecha_registro}</li>`);
                    lista.append(`<li>Correo electrónico: ${estadisticas.correo_usuario}</li>`);
    
                    estadisticasContainer.append(lista);
                } else {
                    alert(response.error || 'Error al obtener las estadísticas.');
                }
            },
            error: function (xhr, status, error) {
                alert('Hubo un error al cargar las estadísticas.');
            }
        });
    }

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
    function notasMedias() {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { info_notasmedias: true },
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    const notasContainer = $('.notas');
                    notasContainer.empty(); 
    
                    data.medias.forEach(function (nota) {
                        const notaContainer = $('<div class="nota-container"></div>');
                        const notaLabel = $('<div class="nota-label"></div>').text(nota.asignatura);
                        const progressBarWrapper = $('<div class="progress-bar-wrapper"></div>');
                        const progressBar = $('<div class="progress-bar"></div>').css('width', `${(nota.promedio_calificaciones / 10) * 100}%`);
                        const progressValue = $('<div class="progress-value"></div>').text(nota.promedio_calificaciones);
    
                        progressBarWrapper.append(progressBar).append(progressValue);
                        notaContainer.append(notaLabel).append(progressBarWrapper);
                        notasContainer.append(notaContainer);
                    });
                } else {
                    $('.notas').text('No se pudieron cargar las calificaciones.');
                }
            },
            error: function () {
                $('.notas').text('Error al cargar las calificaciones.');
            }
        });
    }
    
    
    function listarAsignaturas() {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { listar_asignaturas: true },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#asignaturas_añadidas').empty();    
                    response.asignaturas.forEach(function(asignatura) {
                        const listItem = $('<li class="asignatura">')
                            .text(asignatura.nombre_asignatura).attr('data-id', asignatura.asignatura_id);
                            const deleteButton = $('<button>').text('Eliminar').on('click', function() {
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

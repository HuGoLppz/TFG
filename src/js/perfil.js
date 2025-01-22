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
                $('#imagen-perfil').attr('src',profileData.foto_perfil || '../img/default-profile.png');
    
                $('#descripcion').val(profileData.descripcion || '');
                $('#curso').val(profileData.curso || '');
                $('#estudios').val(profileData.estudios || '');
            } else {
            }
        },
        error: function () {
        }
    });
    
    $("#conf-perfil").on("click", function() {
        $(".perfil-contenedor").hide();
        $(".formulario-perfil").show();
        listarAsignaturas();
    });

    $("#mostrar-cont-asignaturas").on("click", function(){
        listarAsignaturas();
        $(".perfil-contenedor").hide();
        $(".cont-asignaturas").show();
    });

    $("#volver-editar").on("click", function(){
        $(".perfil-contenedor").show();
        $(".cont-asignaturas").hide();
    });

    $(".cont-btn-notificacion").on("click", function() {
        $(".datos-perfil").hide();
        $(".cont-notificaciones").show();
        listarNotificaciones();
        $(".cont-btn-notificacion").html('<div class="nuevo-notification-container"><img src="../img/person-circle.svg" class="btn-notificacion"></div>');
    });
    
    $(document).on("click", ".nuevo-notification-container", function() {
        $(".datos-perfil").show();
        $(".cont-notificaciones").hide();
        $(".cont-btn-notificacion").html('<div class="cont-btn-notificacion"><img src="../img/bell.svg" alt="notificacion" class="btn-notificacion"></div>'); 
    });
    
    $("#enviar-formulario").on("click", function(event) {
        event.preventDefault();
        var formData = new FormData($("#perfil-form")[0]);
        formData.append("modificar_informacion", true);    
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) { 
                } else {
                }
                $(".perfil-contenedor").show();
                $(".formulario-perfil").hide();
                location.reload();
            },
            error: function(xhr, status, error) {
                $(".perfil-contenedor").show();
                $(".formulario-perfil").hide();
                location.reload();
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
                    }
                },
                error: function () {
                }
            });
        } else {
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
                    if (!estadisticasContainer.length) {
                        console.error('Contenedor de estadísticas no encontrado.');
                        return;
                    }
                    estadisticasContainer.empty();
                    const lista = $('<ul></ul>');
                    lista.append(`<li>Amigos totales: ${estadisticas.total_amigos}</li>`);
                    lista.append(`<li>Tareas completadas: ${estadisticas.tareas_completadas}</li>`);
                    lista.append(`<li>Tareas sin completar: ${estadisticas.tareas_sin_completar}</li>`);
                    lista.append(`<li>Media total de las tareas: ${estadisticas.media_total_asignaturas}</li>`);
                    lista.append(`<li>Salas totales: ${estadisticas.total_salas}</li>`);
                    lista.append(`<li>Fecha de registro: ${estadisticas.fecha_registro}</li>`);
                    lista.append(`<li>Correo electrónico: ${estadisticas.correo_usuario}</li>`);
                    lista.append(`<li>Pomodoro: ${estadisticas.contador_pomodoro}</li>`);
    
                    estadisticasContainer.append(lista);
                } else {
                    console.error(response.error || 'No se pudieron obtener las estadísticas.');
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
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
                }
            },
            error: function () {
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
                }
            },
            error: function () {
            }
        });
    }

    function listarNotificaciones() {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { listar_notificaciones: true },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const notificacionesContainer = $('.notificaciones');
                    notificacionesContainer.empty();
    
                    response.notificaciones.forEach(function (notificacion) {
                        const listItem = $('<li class="notificacion-item"></li>');
                        if(notificacion.tipo === "Solicitud de amistad"){
                            listItem.append(`
                                <div class=notificacion>
                                    <p><strong>Tipo:</strong> ${notificacion.tipo}</p>
                                    <p><strong>Mensaje:</strong> ${notificacion.mensaje}</p>
                                    <button class="aceptar-solicitud-amistad" data-amigo-id="${notificacion.remitente_id}" data-notificacion-id="${notificacion.notificacion_id}">
                                        Aceptar solicitud
                                    </button>
                                </div>
                            `);
                            notificacionesContainer.append(listItem);
                        }
                        if(notificacion.tipo === "Solicitud de unión a sala"){
                            listItem.append(`
                                <div class=notificacion>
                                    <p><strong>Tipo:</strong> ${notificacion.tipo}</p>
                                    <p><strong>Mensaje:</strong> ${notificacion.mensaje}</p>
                                    <button class="aceptar-solicitud-sala" data-sala-id="${notificacion.remitente_id}" data-notificacion-id="${notificacion.notificacion_id}">
                                        Aceptar solicitud
                                    </button>
                                </div>
                            `);
                            notificacionesContainer.append(listItem);
                        }
                    });
                    $('.aceptar-solicitud-amistad').on('click', function () {
                        const amigoID = $(this).data('amigo-id');
                        const notificacionId = $(this).data('notificacion-id');
                        aceptar_solicitud_amistad(amigoID);
                        eliminar_notificacion(notificacionId);
                    });
                    $('.aceptar-solicitud-sala').on('click', function () {
                        const salaId = $(this).data('sala-id');
                        const notificacionId = $(this).data('notificacion-id');
                        const modalHtml = `
                            <div id="modalAsignaturas" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:20px; border:1px solid #ccc; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                                <h3>Selecciona una asignatura</h3>
                                <select id="asignaturaSeleccionada">
                                    <option value="">Selecciona una asignatura</option>
                                </select>
                                <br><br>
                                <button id="confirmarAsignatura">Confirmar</button>
                                <button id="cancelarAsignatura">Cancelar</button>
                            </div>
                        `;
                        if ($('#modalAsignaturas').length === 0) {
                            $('body').append(modalHtml);
                        }
                        $('#modalAsignaturas').show();
                        cargarAsignaturas();
                        $('#confirmarAsignatura').off('click').on('click', function () {
                            const asignatura = $('#asignaturaSeleccionada').val();
                            if (!asignatura) {
                                return;
                            }
                            aceptar_solicitud_sala(salaId, asignatura);
                            eliminar_notificacion(notificacionId);
                            $('#modalAsignaturas').remove();
                        });
                    
                        $('#cancelarAsignatura').off('click').on('click', function () {
                            $('#modalAsignaturas').remove();
                        });
                    });
                    
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
                    
                } else {
                    $('.notificaciones').text(response.error || 'No se encontraron notificaciones.');
                }
            },
            error: function (xhr) {
                $('.notificaciones').text('Error al cargar las notificaciones.');
            }
        });
    }

    function eliminar_notificacion(a) {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: {
                accion: 'borrar_notificacion',
                id_notificacion: a,
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    listarNotificaciones();
                } else {
                    listarNotificaciones();
                }
            },
            error: function (xhr, status, error) {
                listarNotificaciones();
            }
        });
    }

    function aceptar_solicitud_amistad(a) {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: {
                accion: 'aceptar_solicitud_amistad',
                amigo_id: a,
            },
            dataType: 'json',
            success: function (response) {
            },
            error: function (xhr) {
            }
        });
    }

    function aceptar_solicitud_sala(a, b) {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: {
                accion: 'aceptar_solicitud_sala',
                sala_id: a,
                asignatura: b,
            },
            dataType: 'json',
            success: function (response) {
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    }
});

$(document).ready(function () {
    function getParameterByName(name) {
        const url = new URL(window.location.href);
        let value = url.searchParams.get(name);
        if (!value) {
            const fragment = url.hash.substring(1);
            const params = new URLSearchParams(fragment);
            value = params.get(name);
        }

        if (value && value.startsWith('#')) {
            value = value.replace('#', '');
        }
        return value;
    }
    const usuario_id = getParameterByName('usuario_id');
    console.log("ID de usuario obtenido:", usuario_id);
    $.ajax({
        url: '../php/profile-friend.php',
        type: 'GET',
        dataType: 'json',
        data: { 
            usuario_id: "#" + usuario_id, 
            obtener_perfil: true,
        },
        success: function (data) {
            if (data.error) {
            } else {
                $('#nombre-usuario').text(data.nombre || 'Usuario no disponible');
                $('#id-usuario').text(data.usuario_id || 'Usuario no disponible');
                $('#estudios-usuario').text(data.curso + " " + data.estudios || 'Estudios no disponibles');
                $('#descripcion-usuario').text(data.descripcion || 'Sin descripción');
                console.log(data);
                $('#imagen-perfil').attr('src', data.foto_perfil || '../img/default-profile.png');
            }
        },
        error: function () {
        }
    });

    $.ajax({
        url: '../php/profile-friend.php',
        type: 'GET',
        data: {
            usuario_id: "#" + usuario_id,
            obtener_estadisticas: true
        },
        dataType: 'json',
        success: function (response) {
            console.log(response);
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

    $.ajax({
        url: '../php/profile-friend.php',
        type: 'GET',
        data: {
            usuario_id: "#" + usuario_id,
            info_notasmedias: true,
        },
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
                    const progressValue = $('<div class="progress-value"></div>').text(nota.promedio_calificaciones); progressBarWrapper.append(progressBar).append(progressValue); notaContainer.append(notaLabel).append(progressBarWrapper); notasContainer.append(notaContainer);
                });
            } else { $('.notas').text('No se pudieron cargar las calificaciones.'); }
        }, error: function () { $('.notas').text('Error al cargar las calificaciones.'); }
    });
});
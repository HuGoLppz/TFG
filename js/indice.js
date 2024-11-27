$(document).ready(function() {
    // Carrusel del index
    $('.informacion').slick({
        arrows: false,
        dots: false,
        infinite: true,
        centerPadding: '300px',  
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 250,
        centerMode: true,
        pauseOnHover: true,
    });
    
    var val = 0;
    $.ajax({
        url: '../php/session.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.auth) {
                $('.container').css('display', 'block');
                $('.cont').css('display', 'none');
                val = 1;
            } else {
                $('.container').css('display', 'none');
                $('.cont').css('display', 'block');
            }
        },
        error: function() {
            console.error("No se pudo verificar la sesión");
        }
    });
    if (val = 1){
        $.ajax({
            url: '../php/tareas.php', 
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                } else {
                    $('.tareas ul').empty(); 
                    data.forEach(function(tarea) {
                        $('.tareas ul').append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                    <button class="btn-ir-tarea">Ir a página de tareas</button>
                                </div>
                            </li>
                        `);
                    });
                }
            },
            error: function() {
                alert('Error al cargar las tareas.');
            }
        });
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { listar_notificaciones: true },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const notificacionesContainer = $('.notis');
                    notificacionesContainer.empty();
        
                    if (response.notificaciones.length > 0) {
                        response.notificaciones.forEach(function (notificacion) {
                            const listItem = $('<li class="notificacion-item"></li>');
        
                            if (notificacion.tipo === "Solicitud de amistad") {
                                listItem.append(`
                                    <div>
                                        <h4>${notificacion.tipo}</h4>
                                        <p>${notificacion.mensaje}</p>
                                        <p><strong>Fecha:</strong> ${notificacion.fecha}</p>
                                        <button class="aceptar-solicitud-amistad" data-amigo-id="${notificacion.remitente_id}" data-notificacion-id="${notificacion.notificacion_id}">
                                            Aceptar solicitud
                                        </button>
                                    </div>
                                `);
                            } else if (notificacion.tipo === "Solicitud de unión a sala") {
                                listItem.append(`
                                    <div>
                                        <h4>${notificacion.tipo}</h4> 
                                        <p>${notificacion.mensaje}</p>
                                        <p><strong>Fecha:</strong> ${notificacion.fecha}</p>
                                        <button class="aceptar-solicitud-sala" data-sala-id="${notificacion.remitente_id}" data-notificacion-id="${notificacion.notificacion_id}">
                                            Aceptar solicitud
                                        </button>
                                    </div>
                                `);
                            }
        
                            notificacionesContainer.append(listItem);
                        });
        
                        // Asignar eventos a los botones después de añadir los elementos al DOM
                        $('.aceptar-solicitud-amistad').on('click', function () {
                            const amigoID = $(this).data('amigo-id');
                            const notificacionId = $(this).data('notificacion-id');
                            aceptar_solicitud_amistad(amigoID);
                            eliminar_notificacion(notificacionId);
                        });
        
                        $('.aceptar-solicitud-sala').on('click', function () {
                            const salaId = $(this).data('sala-id');
                            const notificacionId = $(this).data('notificacion-id');
                            aceptar_solicitud_sala(salaId);
                            eliminar_notificacion(notificacionId);
                        });
        
                    } else {
                        notificacionesContainer.append('<h2>No hay notificaciones</h2>');
                    }
                } else {
                    $('.notificaciones').text(response.error || 'No se encontraron notificaciones.');
                }
            },
            error: function (xhr) {
                $('.notificaciones').text('Error al cargar las notificaciones.');
            }
        });        
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { info_notasmedias: true },
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    const notasContainer = $('.notas');
                    notasContainer.empty();
        
                    let sumaNotas = 0;
                    let totalNotas = 0;
        
                    data.medias.forEach(function (nota) {
                        sumaNotas += parseFloat(nota.promedio_calificaciones);
                        totalNotas++;
                        sumaNotas.toFixed(2);
                        
                        const notaContainer = $('<div class="nota-container"></div>');
                        const notaLabel = $('<div class="nota-label"></div>').text(nota.asignatura);
                        const progressBarWrapper = $('<div class="progress-bar-wrapper"></div>');
                        const progressBar = $('<div class="progress-bar"></div>').css('width', `${(nota.promedio_calificaciones / 10) * 100}%`);
                        
                        let progressValueText = parseFloat(nota.promedio_calificaciones) === 10 ? 
                                                '10' : 
                                                parseFloat(nota.promedio_calificaciones).toFixed(2);
                    
                        const progressValue = $('<div class="progress-value"></div>').text(progressValueText);
                    
                        progressBarWrapper.append(progressBar).append(progressValue);
                        notaContainer.append(notaLabel).append(progressBarWrapper);
                        notasContainer.append(notaContainer);
                    });
                    
        
                    const mediaAritmetica = totalNotas > 0 ? (sumaNotas / totalNotas) : 0;
                    console.log(mediaAritmetica);
                    const mostrarMediaPorcentaje = (mediaAritmetica * 10).toFixed(2); 
                    console.log(mostrarMediaPorcentaje);
                    var a = 10;
                    if (mostrarMediaPorcentaje >= 100) {
                        a = 0;
                    } else {
                        a = 10;
                    }                    
                    const ctx = $('#mediaChart')[0].getContext('2d');
                    const mediaChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Media', 'Restante'],
                            datasets: [{
                                data: [mediaAritmetica, 10 - mediaAritmetica],
                                backgroundColor: ['white', 'rgba(134,158,255,1)'],
                                borderWidth: 0,
                                borderRadius: a,
                            }]
                        },
                        options: {
                            cutout: "80%",
                            plugins: {
                                tooltip: { enabled: false },
                                legend: { display: false },
                                title: {
                                    display: false 
                                }
                            },
                            hover: {
                                mode: null,
                            }
                        },
                        plugins: [{
                            id: 'customCenterText',
                            beforeDraw(chart) {
                                const { width } = chart;
                                const { ctx } = chart;
                                const centerX = chart.getDatasetMeta(0).data[0].x;
                                const centerY = chart.getDatasetMeta(0).data[0].y;
                    
                                ctx.save();
                                ctx.font = '30px Arial'; // Fuente Arial y tamaño 18px
                                ctx.fillStyle = 'white'; // Color blanco
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(`${mostrarMediaPorcentaje}`+"%", centerX, centerY);
                                ctx.restore();
                            }
                        }]
                    });
                    
                } else {
                    $('.notas').text('No se pudieron cargar las calificaciones.');
                }
            },
            error: function () {
                $('.notas').text('Error al cargar las calificaciones.');
            }
        });
        
        $.ajax({
            url: '../php/amigos.php',
            type: 'POST',
            data: { accion: 'listar_amigos' },
            success: function(data) {
                const amigos = JSON.parse(data);
                $('#lista-amigos').empty();
                amigos.forEach(amigo => {
                    $('.companero ul').append(`
                        <li>
                            <div class="amigo">
                                <a href="../html/perfil-amigo.html?usuario_id=${amigo.usuario_id.replace('#', '')}">
                                    <img src="${amigo.foto_perfil || '../img/default-profile.png'}" alt="Amigo ${amigo.nombre}">
                                    <h3>${amigo.nombre}</h3>
                                    <p>${amigo.email}</p>
                                </a>
                            </div>
                        </li>
                    `);
                });
            }
        }); 
        $.ajax({
            url: '../php/salas.php',
            type: 'GET',
            data: { action: 'listar_participacion' },
            success: function(response) {
                try {
                    var data = JSON.parse(response);
                    
                    if (data.success) {
                        $('.salas ul').empty();
                        if (Array.isArray(data.salas)) {
                            data.salas.forEach(function(sala) {
                                $('.salas ul').append(`
                                    <li>
                                        <div class="sala">
                                            <h3>${sala.nombre}</h3>
                                            <p>Fecha de entrega: ${sala.fecha_entrega || 'No definida'}</p>
                                            <button class="btn-ir" data-sala-id="${sala.sala_id}">Ir a la sala</button>
                                        </div>
                                    </li>
                                `);
                            });
                        } else {
                            alert('No se encontraron salas.');
                        }
                    } else {
                        alert('Error al listar salas: ' + (data.error || 'Desconocido'));
                    }
                } catch (e) {
                    console.error('Error de formato JSON:', e);
                    alert('Hubo un problema al procesar los datos del servidor.');
                }
            },
            error: function() {
                alert('Hubo un error al conectar con el servidor.');
            }
        });               
    }
    $(document).on('click', '.btn-ir-tarea', function() {
        window.location.href = "../html/tareas.html";
    });

});

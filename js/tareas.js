$(document).ready(function() {
    $(".btn-volver").hide();
    
    $(".btn-crear").on("click", function() {
    $(".tareas-crear").toggle(); 
    $(".tareas").css("opacity", $(".tareas-crear").is(":visible") ? 0.5 : 1);
        $.ajax({
            url: '../php/tareas.php',
            method: 'GET',
            data: { action: 'listarAsignaturas' }, 
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    const asignaturas = response.data;
                    const selectAsignatura = $('#asignatura');
                    selectAsignatura.empty(); 
                    asignaturas.forEach(function(asignatura) {
                        selectAsignatura.append(`<option value="${asignatura.asignatura_id}">${asignatura.nombre_asignatura}</option>`);
                    });
                } else {
                    alert(response.error || 'Error al cargar las asignaturas.');
                }
                },
            error: function() {
                alert('Error en la solicitud de asignaturas.');
            }
        });
    });

    $(".btn-crear2, .cerrar-ventana").on("click", function() {
        $(".tareas-crear, .form-tarea-completar").hide();
        $(".tareas").css("opacity", 1);
    });

    $(".btn-historial").on("click", function() {
        $(".btn-volver").show();
        $(this).hide();
        cargarTareasCompletadas();
    });

    $(".btn-volver").on("click", function() {
        $(".btn-historial").show();
        $(this).hide();
        cargarTareas();
    });

    function cargarTareas() {
        $.ajax({
            url: '../php/tareas.php',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $('.tareas-cont ul').empty(); 
                    data.forEach(function(tarea) {
                        $('.tareas ul').append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                    <button class="btn-completar">Marcar como Completada</button>
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
    }

    function cargarTareasCompletadas() {
        $.ajax({
            url: '../php/tareas.php',
            method: 'GET',
            data: { action: 'listarCompletado' },
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $('.tareas ul').empty();
                    data.forEach(function(tarea) {
                        $('.tareas ul').append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                </div>
                            </li>
                        `);
                    });
                }
            },
            error: function() {
                alert('Error al cargar las tareas completadas.');
            }
        });
    }

    cargarTareas();

    $(document).on('click', '.btn-completar', function() {
        const tareaId = $(this).closest('.tarea').data('id');
        $('#tarea-id-completar').val(tareaId); 
        $(".form-tarea-completar").toggle();
    });

    $('#form-completar-tarea').on('submit', function(event) {
        event.preventDefault(); 

        const tareaId = $('#tarea-id-completar').val();
        const nota = $('#nota').val();

        if (nota < 0 || nota > 10) {
            alert('La nota debe estar entre 0.00 y 10.00');
            return;
        }

        $.ajax({
            url: '../php/tareas.php',
            method: 'POST',
            data: {
                action: 'completar',
                tarea_id: tareaId,
                nota: nota
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Tarea completada con éxito.');
                    cargarTareas(); 
                    $(".form-tarea-completar").hide(); 
                } else {
                    alert(response.error || 'No se pudo completar la tarea.');
                }
            },
            error: function() {
                alert('Error al completar la tarea.');
            }
        });
    });

    $('.btn-crear-tarea').on('click', function(event) {
        event.preventDefault(); 
        
        const nuevaTarea = {
            action: 'crear',
            titulo: $('#titulo').val(),
            descripcion: $('#descripcion').val(),
            fecha_entrega: $('#fecha_entrega').val(),
            asignatura: $('#asignatura').val(),
            tipo_actividad: $('#tipo_actividad').val(),
            urgencia: $('#urgencia').val(),
        };

        $.ajax({
            url: '../php/tareas.php',
            method: 'POST',
            data: nuevaTarea,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Tarea creada con éxito.');
                    cargarTareas(); 
                    $('form')[0].reset(); 
                    $(".tareas-crear").hide(); 
                    $(".tareas").css("opacity", 1); 
                } else {
                    alert(response.error || 'No se pudo crear la tarea.');
                }
            },
            error: function() {
                alert('Error al crear la tarea.');
            }
        });
        
    });

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        firstDay: 1,
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Evento 1',
                start: '2024-10-10'
            },
            {
                title: 'Evento 2',
                start: '2024-10-15',
            },
        ]
    });
    calendar.render();
});

$(document).ready(function() {
    $(".btn-volver").css("display", "none");
    
    // Mostrar el formulario de creación de tareas
    $(".btn-crear").on("click", function() {
        $(".tareas-crear").css("display", "inline-block");
    });
    
    // Ocultar el formulario de creación de tareas
    $(".btn-crear2").on("click", function() {
        $(".tareas-crear").css("display", "none");
        $(".tareas").css("opacity", 1);
    });

    // Mostrar el historial de tareas completadas
    $(".btn-historial").on("click", function() {
        $(".btn-volver").css("display", "inline-block");
        $(".btn-historial").css("display", "none");
        cargarTareasCompletadas();
    });

    // Volver a mostrar las tareas pendientes
    $(".btn-volver").on("click", function() {
        $(".btn-volver").css("display", "none");
        $(".btn-historial").css("display", "inline-block");
        cargarTareas();
    });

    // Función para cargar tareas pendientes al iniciar la página
    function cargarTareas() {
        $.ajax({
            url: '../php/tareas.php', 
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $('.tareas-cont ul').empty(); // Limpiar la lista antes de agregar nuevas tareas
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

    // Función para cargar tareas completadas
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
                    $('.tareas ul').empty(); // Limpiar la lista antes de agregar nuevas tareas
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

    // Llamar a la función para cargar las tareas al iniciar la página
    cargarTareas();

    // Evento para marcar una tarea como completada
    $(document).on('click', '.btn-completar', function() {
        const tareaId = $(this).closest('.tarea').data('id');
        
        $.ajax({
            url: '../php/tareas.php', 
            method: 'POST',
            data: { action: 'completar', tarea_id: tareaId },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Tarea marcada como completada.');
                    cargarTareas(); // Recargar tareas pendientes
                } else {
                    alert(response.error || 'No se pudo completar la tarea.');
                }
            },
            error: function() {
                alert('Error al completar la tarea.');
            }
        });
    });

    // Evento para el envío del formulario de creación de nueva tarea
    $('form').on('submit', function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        
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
                    cargarTareas(); // Recargar tareas pendientes
                    $('form')[0].reset(); // Limpiar el formulario
                    $(".tareas-crear").css("display", "none"); // Ocultar el formulario
                    $(".tareas").css("opacity", 1); // Restaurar la opacidad
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

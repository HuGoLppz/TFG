$(document).ready(function() {
    // Mostrar formulario de creación de tareas
    $(".btn-crear").on("click", function() {
        $(".tareas-crear").css("display", "block");
        $(".tareas").css("opacity", 0.5);
    });

    // Ocultar formulario de creación de tareas
    $(".btn-crear2").on("click", function() {
        $(".tareas-crear").css("display", "none");
        $(".tareas").css("opacity", 1);
    });

    // Función para cargar tareas pendientes al cargar la página
    function cargarTareas() {
        $.ajax({
            url: '../php/tareas.php', // Ruta a tareas.php
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $('.tareas ul').empty();
                    data.forEach(function(tarea) {
                        console.log(tarea.tarea_id);
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

    // Llamar a la función para cargar las tareas al iniciar la página
    cargarTareas();

    // Evento para marcar una tarea como completada
    $(document).on('click', '.btn-completar', function() {
        const tareaId = $(this).closest('.tarea').data('id');
        
        $.ajax({
            url: '../php/tareas.php', // Ruta a tareas.php
            method: 'POST',
            data: { action: 'completar', tarea_id: tareaId },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Tarea marcada como completada.');
                    cargarTareas();
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
            url: '../php/tareas.php', // Ruta a tareas.php
            method: 'POST',
            data: nuevaTarea,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Tarea creada con éxito.');
                    cargarTareas();
                    $('form')[0].reset();
                    $(".tareas-crear").css("display", "none");
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
});

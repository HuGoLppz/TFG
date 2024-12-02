$(document).ready(function () {
    $(".btn-volver").hide();
    cargarTareas();
    calendario();

    $(".btn-crear").on("click", function () {
        $(".tareas-crear").toggle();
        $(".tareas").css("opacity", $(".tareas-crear").is(":visible") ? 0.5 : 1);
        cargarAsignaturas();
        calendario();
    });

    $(".btn-crear2, .cerrar-ventana").on("click", function () {
        $(".tareas-crear, .form-tarea-completar").hide();
        $(".detalle-tarea").css("display", "none");
        $(".tareas").css("opacity", 1);
    });

    $(".btn-historial").on("click", function () {
        $(".btn-volver").show();
        $(this).hide();
        cargarTareasCompletadas();
    });

    $(".btn-volver").on("click", function () {
        $(".btn-historial").show();
        $(this).hide();
        cargarTareas();
    });

    $(document).on("click", ".btn-info-tarea", function () {
        const tareaId = $(this).closest(".tarea").data("id"); 
        obtenerDetalleTarea(tareaId); 
    });

    $(document).on("click", ".fc-event", function () {
        const tareaId = $(this).closest(".tarea").data("id"); 
        obtenerDetalleTarea(tareaId); 
    });

    $(document).on("click", ".btn-completar", function () {
        const tareaId = $(this).closest(".tarea").data("id");
        $("#tarea-id-completar").val(tareaId);
        $(".form-tarea-completar").toggle();
    });

    $("#form-completar-tarea").on("submit", function (event) {
        event.preventDefault();

        const tareaId = $("#tarea-id-completar").val();
        const nota = $("#nota").val();

        if (nota < 0 || nota > 10) {
            alert("La nota debe estar entre 0.00 y 10.00");
            return;
        }

        $.ajax({
            url: "../php/tareas.php",
            method: "POST",
            data: {
                action: "completar",
                tarea_id: tareaId,
                nota: nota,
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    alert("Tarea completada con éxito.");
                    cargarTareas();
                    $(".form-tarea-completar").hide();
                } else {
                    alert(response.error || "No se pudo completar la tarea.");
                }
            },
            error: function () {
                alert("Error al completar la tarea.");
            },
        });
    });

    $(".btn-crear-tarea").on("click", function (event) {
        event.preventDefault();

        const nuevaTarea = {
            action: "crear",
            titulo: $("#titulo").val(),
            descripcion: $("#descripcion").val(),
            fecha_entrega: $("#fecha_entrega").val(),
            asignatura: $("#asignatura").val(),
            tipo_actividad: $("#tipo_actividad").val(),
            urgencia: $("#urgencia").val(),
        };

        $.ajax({
            url: "../php/tareas.php",
            method: "POST",
            data: nuevaTarea,
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    alert("Tarea creada con éxito.");
                    cargarTareas();
                    $("form")[0].reset();
                    $(".tareas-crear").hide();
                    $(".tareas").css("opacity", 1);
                } else {
                    alert(response.error || "No se pudo crear la tarea.");
                }
            },
            error: function () {
                alert("Error al crear la tarea.");
            },
        });
    });
    function obtenerDetalleTarea(tareaId) {
        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            data: { action: "detalle", tarea_id: tareaId }, 
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    mostrarDetalleTarea(response.data); 
                } else {
                    alert(response.error || "No se pudo obtener el detalle de la tarea.");
                }
            },
            error: function () {
                alert("Error al obtener el detalle de la tarea.");
            },
        });
    }
    
    function mostrarDetalleTarea(data) {
        const detalleTarea = $(".detalle-contenido");
    
        detalleTarea.html(`
            <h3>${data.titulo}</h3>
            <p>${data.descripcion}</p>
            <p><strong>Fecha de entrega:</strong> ${data.fecha_entrega}</p>
            <p><strong>Asignatura:</strong> ${data.asignatura || "No especificada"}</p>
            <p><strong>Estado:</strong> ${data.estado === 'completada' ? "Completada" : "Pendiente"}</p>
            <p><strong>Calificación:</strong> ${data.calificacion !== null ? data.calificacion : "Pendiente"}</p>
        `);
    
        $(".detalle-tarea").css("display", "block");
    }
       

    function cargarTareas() {
        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            dataType: "json",
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $(".tareas-cont ul").empty();
                    data.forEach(function (tarea) {
                        $(".tareas ul").append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                    <button class="btn-completar">Marcar como Completada</button>
                                    <button class="btn-info-tarea">Ver información de la tarea</button>
                                </div>
                            </li>
                        `);
                    });
                }
            },
            error: function () {
                alert("Error al cargar las tareas.");
            },
        });
    }

    function cargarTareasCompletadas() {
        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            data: { action: "listarCompletado" },
            dataType: "json",
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $(".tareas ul").empty();
                    data.forEach(function (tarea) {
                        $(".tareas ul").append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                    <button class="btn-info-tarea">Ver información de la tarea</button>
                                </div>
                            </li>
                        `);
                    });
                }
            },
            error: function () {
                alert("Error al cargar las tareas completadas.");
            },
        });
    }
    

    function cargarAsignaturas() {
        $.ajax({
            url: "../php/tareas.php",
            method: "POST",
            data: { action: "listarAsignaturas" },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    const asignaturas = response.data;
                    const selectAsignatura = $("#asignatura");
                    selectAsignatura.empty();
                    asignaturas.forEach(function (asignatura) {
                        selectAsignatura.append(
                            `<option value="${asignatura.nombre_asignatura}">${asignatura.nombre_asignatura}</option>`
                        );
                    });
                } else {
                    alert(response.error || "Error al cargar las asignaturas.");
                }
            },
            error: function () {
                alert("Error en la solicitud de asignaturas.");
            },
        });
    }

    function calendario() {
        const calendarEl = document.getElementById("calendar");
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            firstDay: 1,
            locale: "es",
            headerToolbar: {
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
            },
            buttonText: {
                dayGridMonth: "Mes",
                timeGridWeek: "Sem",
            },
            events: async function (fetchInfo, successCallback, failureCallback) {
                try {
                    const response = await fetch("../php/tareas.php?action=listar_calendario");
                    const data = await response.json();
    
                    if (data.success) {
                        successCallback(data.events);
                    } else {
                        console.error("Error al cargar eventos:", data.error);
                        failureCallback();
                    }
                } catch (error) {
                    console.error("Error de red:", error);
                    failureCallback();
                }
            },
            eventDidMount: function (info) {
                if (info.event.extendedProps.estado === 'pendiente') {
                    info.el.style.backgroundColor = 'red';
                    info.el.style.color = 'white';
                }
            },
            eventClick: async function (info) {
                try {
                    const tarea_id = info.event.extendedProps.id;
                    if (!tarea_id) {
                        console.error("El evento no tiene un ID válido.");
                        return;
                    }
                    const responseTarea = await fetch(`../php/tareas.php?action=detalle&tarea_id=${tarea_id}`);
                    const dataTarea = await responseTarea.json();
            
                    if (dataTarea.success) {
                        const data = {
                            titulo: info.event.title,
                            descripcion: info.event.extendedProps.descripcion,
                            fecha_entrega: info.event.start.toISOString().split("T")[0],
                            asignatura: info.event.extendedProps.asignatura,
                            estado: info.event.extendedProps.estado,
                            calificacion: dataTarea.data.calificacion, 
                        };
                        mostrarDetalleTarea(data);
                    } else {
                        console.error("Error al cargar el detalle de la tarea:", dataTarea.error);
                    }
                } catch (error) {
                    console.error("Error al obtener el detalle de la tarea:", error);
                }
            }
        });
        calendar.render();
    }
    
    
});

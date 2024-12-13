$(document).ready(function () {
    $(".btn-volver").hide();
    $(".openFiltros2").hide();
    cargarTareas();
    calendario();
    cargarAsignaturas();

    $(".btn-completar-filtro").on("click", function () {
        cargarTareas();
        $(".form-filtro").hide();
        $("#nombre_filtro").val("");
    });

    $(".btn-completar-filtro2").on("click", function () {
        cargarTareasCompletadas();
        $(".form-filtro2").hide();
        $("#nombre_filtro2").val("");
    });

    $(".openFiltros").on("click", function () {
        $(".form-filtro").toggle();
        cargarAsignaturas();
    });

    $(".openFiltros2").on("click", function () {
        $(".form-filtro2").toggle();
        cargarAsignaturas();
    });

    $(".btn-crear").on("click", function () {
        $(".tareas-crear").toggle();
        $(".tareas").css("opacity", $(".tareas-crear").is(":visible") ? 0.5 : 1);
        cargarAsignaturas();
    });

    $(".btn-crear2, .cerrar-ventana").on("click", function () {
        $(".tareas-crear, .form-tarea-completar").hide();
        $(".detalle-tarea").css("display", "none");
        $('.form-filtro').css("display", "none");
        $('.form-filtro2').css("display", "none");
        $(".tareas").css("opacity", 1);
        calendario();
    });

    $(".btn-historial").on("click", function () {
        $(".btn-volver").show();
        $(this).hide();
        cargarTareasCompletadas();
        $(".openFiltros2").toggle();
        $(".openFiltros").hide();
    });

    $(".btn-volver").on("click", function () {
        $(".btn-historial").show();
        $(this).hide();
        cargarTareas();
        $(".openFiltros2").hide();
        $(".openFiltros").toggle();
    });

    $(document).on("click", ".btn-info-tarea", function () {
        const tareaId = $(this).closest(".tarea").data("id");
        obtenerDetalleTarea(tareaId);
        $(document).on("click", ".btn-borrar-tarea", function () {
            const detalleTarea = $(".detalle-contenido");
            detalleTarea.html(`
                <p style="color: red" class="advertenciaEliminar">¿Estás totalmente seguro? Una vez borrada, la calificación se borrará con la tarea</p>
                <button class="btn-borrar-tarea2">Eliminar tarea</button>
            `);

            $(".btn-borrar-tarea").css("display", "none");
            $(document).on("click", ".btn-borrar-tarea2", function () {
                $(".btn-borrar-tarea").css("display", "block");
                borrarTarea(tareaId);
                console.log(tareaId);
                $(".detalle-tarea").css("display", "none");
                cargarTareasCompletadas();
            });
        });
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
        calendario();
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
                    //alert("No se pudo obtener el detalle de la tarea.");
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
        if (data.estado === 'completada') {
            detalleTarea.html(`
                <h3>${data.titulo}</h3>
                <p>${data.descripcion}</p>
                <p><strong>Fecha de entrega:</strong> ${data.fecha_entrega}</p>
                <p><strong>Asignatura:</strong> ${data.asignatura || "No especificada"}</p>
                <p><strong>Estado:</strong> ${data.estado === 'completada' ? "Completada" : "Pendiente"}</p>
                <p><strong>Calificación:</strong> ${data.calificacion !== null ? data.calificacion : "Pendiente"}</p>
                <br>
                <button class="btn-borrar-tarea">Eliminar tarea</button>
            `);
        }
        $(".detalle-tarea").css("display", "block");
    }


    function cargarTareas() {
        const nombre = $("#nombre_filtro").val() || '';
        const asignatura = $("#asignatura2").val() || '';

        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            data: {
                action: "listarPendiente",
                nombre: nombre,
                asignatura: asignatura,
            },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $(".openFiltros").attr("id", "filtroTareas");
                    $('.tareas > h2').empty();
                    $(".tareas > h2").append('Tus tareas sin completar');
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
        const nombre = $("#nombre_filtro2").val() || '';
        const asignatura = $("#asignatura3").val() || '';
        console.log(nombre, asignatura);
        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            data: {
                action: "listarCompletado",
                nombre: nombre,
                asignatura: asignatura,
            },
            dataType: "json",
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $(".openFiltros").attr("id", "filtroCompletado");
                    $(".tareas ul").empty();
                    $('.tareas > h2').empty();
                    $(".tareas > h2").append('Tus tareas completadas');
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

    function borrarTarea(a) {
        const id = a;
        $.ajax({
            url: "../php/tareas.php",
            method: "GET",
            data: {
                action: "eliminarTarea",
                id: id,
            },
            dataType: "json",
            success: function (response) {
                console.log(response);
            },
            error(response, xhr, a) {
                console.log(response); console.log(xhr); console.log(a);
            }
        })
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

                    // Llenar el select en el formulario de creación
                    const selectAsignaturaCrear = $("#asignatura");
                    selectAsignaturaCrear.empty();
                    asignaturas.forEach(function (asignatura) {
                        selectAsignaturaCrear.append(
                            `<option value="${asignatura.nombre_asignatura}">${asignatura.nombre_asignatura}</option>`
                        );
                    });

                    // Llenar el select en el formulario de filtros
                    const selectAsignaturaFiltro = $("#asignatura2");
                    selectAsignaturaFiltro.empty();
                    selectAsignaturaFiltro.append(
                        `<option value="">Todas las asignaturas</option>`
                    );
                    asignaturas.forEach(function (asignatura) {
                        selectAsignaturaFiltro.append(
                            `<option value="${asignatura.nombre_asignatura}">${asignatura.nombre_asignatura}</option>`
                        );
                    });

                    // Llenar el select en el formulario de filtros
                    const selectAsignaturaFiltro2 = $("#asignatura3");
                    selectAsignaturaFiltro2.empty();
                    selectAsignaturaFiltro2.append(
                        `<option value="">Todas las asignaturas</option>`
                    );
                    asignaturas.forEach(function (asignatura) {
                        selectAsignaturaFiltro2.append(
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

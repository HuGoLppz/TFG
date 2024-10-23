document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',   // Vista inicial (mes completo)
        locale: 'es',                  // Cambiar a español
        firstDay: 1,                   // Comienza la semana en lunes
        headerToolbar: {
            left: 'prev,next today',   // Botones de navegación
            center: 'title',           // Título en el centro
            right: 'dayGridMonth,timeGridWeek,timeGridDay'  // Vistas disponibles
        },
        events: [
            {
                title: 'Evento 1',
                start: '2024-10-10'
            },
            {
                title: 'Evento 2',
                start: '2024-10-15',
            }
        ]
    });

    calendar.render();
});
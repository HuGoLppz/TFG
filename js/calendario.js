document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',   
        locale: 'es',                  
        firstDay: 1,                   
        headerToolbar: {
            left: 'prev,next today',   
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
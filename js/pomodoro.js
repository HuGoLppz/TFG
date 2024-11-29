$(document).ready(function () {
    const $startButton = $('#start-timer');
    const $studyInput = $('#study-time');
    const $breakInput = $('#break-time');
    let interval;

    function startTimer(duration, isBreak) {
        let time = duration * 60; 
        clearInterval(interval);

        $.post('../php/pomodoro.php', {
            action: 'start',
            duracion_trabajo: $studyInput.val(),
            duracion_descanso: $breakInput.val(),
            estado: 'en_proceso'
        });

        interval = setInterval(() => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;

            $('#digital-timer').text(
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );

            if (time <= 0) {
                clearInterval(interval);
                alert(isBreak ? '¡Tiempo de estudio!' : '¡Tiempo de descanso!');
                const nextDuration = isBreak ? $studyInput.val() : $breakInput.val();

                $.post('../php/pomodoro.php', {
                    action: 'update',
                    estado: isBreak ? 'completado' : 'en_proceso'
                });

                startTimer(parseInt(nextDuration, 10), !isBreak);
            }

            time--;
        }, 1000);
    }

    $startButton.on('click', function () {
        const studyTime = parseInt($studyInput.val(), 10);
        const breakTime = parseInt($breakInput.val(), 10);

        if (isNaN(studyTime) || isNaN(breakTime)) {
            alert('Por favor, introduce valores válidos.');
            return;
        }

        startTimer(studyTime, false);
    });
});

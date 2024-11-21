$(document).ready(function () {
    const $startButton = $('#start-timer');
    const $studyInput = $('#study-time');
    const $breakInput = $('#break-time');
    const $displayType = $('#display-type');
    const $digitalTimer = $('#digital-timer');
    const $analogClock = $('#analog-clock');
    const $hourHand = $('.hand.hour');
    const $minuteHand = $('.hand.minute');
    let interval;

    function startTimer(duration, isBreak) {
        let time = duration * 60; // Convertir a segundos
        clearInterval(interval);

        if ($displayType.val() === 'digital') {
            $analogClock.hide();
            $digitalTimer.show();
        } else {
            $digitalTimer.hide();
            $analogClock.show();
        }

        interval = setInterval(() => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;

            if ($displayType.val() === 'digital') {
                $digitalTimer.text(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            } else {
                const totalMinutes = duration;
                const minuteDeg = (360 / totalMinutes) * (totalMinutes - time / 60);
                const hourDeg = (minuteDeg / 12); // Simplificado para demostración
                $minuteHand.css('transform', `rotate(${minuteDeg}deg)`);
                $hourHand.css('transform', `rotate(${hourDeg}deg)`);
            }

            if (time <= 0) {
                clearInterval(interval);
                alert(isBreak ? '¡Tiempo de estudio!' : '¡Tiempo de descanso!');
                if (isBreak) {
                    startTimer(parseInt($studyInput.val(), 10), false);
                } else {
                    startTimer(parseInt($breakInput.val(), 10), true);
                }
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

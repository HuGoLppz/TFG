$(document).ready(function() {
    $.ajax({
        url: 'php/session.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.auth) {
                window.location.href = 'html/indice.html';
            } else {
                window.location.href = 'index.html';
            }
        },
        error: function() {
            console.error("No se pudo verificar la sesión");
        }
    });
});

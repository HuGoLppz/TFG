$(document).ready(function() {
    // Botón para continuar al segundo formulario
    $('#btn-continue').on('click', function() {
        // Copiar datos del primer formulario a inputs ocultos en el segundo formulario
        $('#hidden-user').val($('#user').val());
        $('#hidden-email').val($('#email').val());
        $('#hidden-password').val($('#password').val());

        // Ocultar el primer formulario y mostrar el segundo
        $('#formulario1').hide();
        $('#formulario2').fadeIn();
    });

    // Manejo del segundo formulario
    $('#formulario2').on('submit', function(event) {
        event.preventDefault();

        // Enviar todos los datos al PHP
        var formData = {
            user: $('#hidden-user').val(),
            email: $('#hidden-email').val(),
            password: $('#hidden-password').val(),
            course: $('#course').val(),
            study_name: $('#study-name').val(),
            description: $('#description').val()
        };

        $.ajax({
            url: '../php/sing_up.php',
            type: 'POST',
            dataType: 'json',
            data: formData,
            success: function(response) {
                if (response.success) {
                    alert(response.message);
                    window.location.href = "../index.html";
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr);
                console.log(status);
                console.log(error);
                alert('Hubo un problema con la solicitud. Intenta de nuevo más tarde.');
            }
        });
    });
});

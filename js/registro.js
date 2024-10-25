$(document).ready(function() {
    $('form').on('submit', function(event) {
        event.preventDefault(); 

        var user = $('#user').val();
        var email =$('#email').val();
        var password = $('#password').val();

        $.ajax({
            url: '../php/sing_up.php',  
            type: 'POST',
            dataType: 'json',
            data: {
                email: email,
                user: user, 
                password: password   
            },
            success: function(response) {
                if (response.success) {
                    alert(response.message);
                    window.location.href = "../index.html";  
                } else {
                    alert(response.message);  
                }
            },
            error: function(xhr, status, error) {
                alert('Hubo un problema con la solicitud. Intenta de nuevo más tarde.');
            }
        });
    });
});

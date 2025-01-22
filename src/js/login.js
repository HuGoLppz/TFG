$(document).ready(function() {
    $('form').on('submit', function(event) {
        event.preventDefault(); 

        var user = $('#user').val();
        var password = $('#password').val();

        $.ajax({
            url: '../php/login.php',  
            type: 'POST',
            dataType: 'json',
            data: {
                user: user, 
                password: password   
            },
            success: function(response) {
                if (response.success) {
                    window.location.href = "home.html";  
                } else {
                }
            },
            error: function(xhr, status, error) {
            }
        });
    });
});

$(document).ready(function () {
    // Hacer una solicitud AJAX a obtener_perfil.php
    $.ajax({
        url: '../php/profile.php',  
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error); 
            } else {
                
                // Actualiza los campos de perfil con los datos del usuario
                $('#nombre-usuario').text(data.nombre || 'Usuario no disponible');
                $('#id-usuario').text(data.usuario_id || 'Usuario no disponible');
                $('#estudios-usuario').text(data.curso + " " +data.estudios || 'Estudios no disponibles');
                $('#descripcion-usuario').text(data.descripcion || 'Sin descripción');
                console.log(data);
                // Si hay una imagen de perfil, mostrarla; si no, usar una imagen por defecto
                $('#imagen-perfil').attr('src', data.foto_perfil || '../img/default-profile.png');
            }
        },
        error: function () {
            alert('Hubo un error al cargar los datos del perfil.');
        }
    });

    $("#conf-perfil").on("click", function() {
        $(".datos-perfil").css("display", "none");
        $(".info-perfil").css("opacity", ".6");
        $("#conf-perfil").prop("disabled", true);
        $(".formulario-perfil").css("display", "block");
        $('#imagen-perfil').css("opacity", ".6");
    });

    $("#enviar-formulario").on("click", function() {
        $.ajax({
            
        })
        $(".datos-perfil").css("display", "block");
        $(".info-perfil").css("opacity", "1");
        $("#conf-perfil").prop("disabled", false);
        $(".formulario-perfil").css("display", "none");
        $('#imagen-perfil').css("opacity", "1");
    });
});

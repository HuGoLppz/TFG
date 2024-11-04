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
});

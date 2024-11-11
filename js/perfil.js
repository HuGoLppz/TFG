$(document).ready(function () {
    // Cargar los datos iniciales del perfil y rellenar el formulario
    $.ajax({
        url: '../php/profile.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error); 
            } else {
                // Mostrar los datos en el perfil y en el formulario
                $('#nombre-usuario').text(data.nombre || 'Usuario no disponible');
                $('#id-usuario').text(data.usuario_id || 'Usuario no disponible');
                $('#estudios-usuario').text((data.curso || '') + " " + (data.estudios || 'Estudios no disponibles'));
                $('#descripcion-usuario').text(data.descripcion || 'Sin descripción');
                $('#imagen-perfil').attr('src', data.foto_perfil || '../img/default-profile.png');
                
                // Rellenar el formulario con los datos existentes
                $('#descripcion').val(data.descripcion || '');
                $('#curso').val(data.curso || '');
                $('#estudios').val(data.estudios || '');
                $('#privacidad').prop('checked', data.privacidad == 1);
            }
        },
        error: function () {
            alert('Hubo un error al cargar los datos del perfil.');
        }
    });

    // Mostrar formulario de edición de perfil
    $("#conf-perfil").on("click", function() {
        $(".perfil-contenedor").css("display", "none");
        $(".formulario-perfil").css("display", "block");
        $('.foto-perfil-input').on('change', function(event) {
            const file = event.target.files[0];
            const previewImg = $(this).siblings('.file-input-label').find('.preview-img');
            
            if (file) {
              const reader = new FileReader();
              reader.onload = function(e) {
                previewImg.attr('src', e.target.result); // Muestra la imagen seleccionada
              };
              reader.readAsDataURL(file);
            } else {
              previewImg.attr('src', 'path/to/default-icon.svg'); // Imagen predeterminada si no hay archivo
            }
          });
    });

    // Enviar formulario de actualización de perfil
    $("#enviar-formulario").on("click", function(event) {
        event.preventDefault();

        // Crear el FormData para manejar archivos
        var formData = new FormData();
        formData.append("descripcion", $("#descripcion").val());
        formData.append("curso", $("#curso").val());
        formData.append("estudios", $("#estudios").val());
        formData.append("privacidad", $("#privacidad").is(":checked") ? 1 : 0);


        // Enviar los datos mediante AJAX
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.success) {

                } else {
                    alert(response.error || 'Error al actualizar el perfil.');
                }

                // Restaurar vista del perfil
                $(".perfil-contenedor").css("display", "block");
                $(".formulario-perfil").css("display", "none");

                // Recargar los datos del perfil después de la actualización
                location.reload();
            },
            error: function() {
                alert('Error al intentar actualizar el perfil.');
            }
        });
    });
});

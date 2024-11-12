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
        $(".perfil-contenedor").hide();
        $(".formulario-perfil").show();
    });

    // Previsualización de la imagen de perfil
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
            previewImg.attr('src', '../img/pen.svg'); // Imagen predeterminada si no hay archivo
        }
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

        // Agregar archivo de foto de perfil si se seleccionó
        const fileInput = document.querySelector('.foto-perfil-input');
        if (fileInput.files[0]) {
            formData.append("foto_perfil", fileInput.files[0]);
        }

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
                    alert(response.success);
                } else {
                    alert(response.error || 'Error al actualizar el perfil.');
                }

                // Restaurar vista del perfil
                $(".perfil-contenedor").show();
                $(".formulario-perfil").hide();

                // Recargar los datos del perfil después de la actualización
                location.reload();
            },
            error: function() {
                alert('Error al intentar actualizar el perfil.');
            }
        });
    });

    $('#crear_asignatura').on('click', function () {
        const nuevaAsignatura = $('#nueva_asignatura').val().trim();

        if (nuevaAsignatura) {
            $.ajax({
                url: '../php/profile.php',
                type: 'POST',
                data: { crear_asignatura: nuevaAsignatura },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        // Añade la nueva asignatura a la lista del usuario
                        agregarAsignatura(response.asignatura_id, nuevaAsignatura);
                        $('#nueva_asignatura').val(''); // Limpia el campo
                    } else {
                        alert(response.error || 'Error al crear la asignatura.');
                    }
                },
                error: function () {
                    alert('Hubo un error al crear la asignatura.');
                }
            });
        } else {
            alert('Por favor, ingresa el nombre de la asignatura.');
        }
    });

    // Agregar asignatura seleccionada
    function agregarAsignatura(id, nombre) {
        const asignaturaItem = $(`<li data-id="${id}">${nombre} <button class="eliminar-asignatura">Eliminar</button></li>`);
        asignaturaItem.find('.eliminar-asignatura').on('click', function () {
            eliminarAsignatura(id, asignaturaItem);
        });
        $('#asignaturas_añadidas').append(asignaturaItem);

        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { agregar_asignatura: id },
            dataType: 'json',
            success: function (response) {
                if (!response.success) {
                    alert(response.error || 'Error al añadir la asignatura.');
                    asignaturaItem.remove(); // Eliminar la asignatura del frontend si hubo un error
                }
            }
        });
    }

    // Eliminar asignatura del usuario
    function eliminarAsignatura(id, item) {
        $.ajax({
            url: '../php/profile.php',
            type: 'POST',
            data: { eliminar_asignatura: id },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    item.remove();
                } else {
                    alert(response.error || 'Error al eliminar la asignatura.');
                }
            }
        });
    }
});

$(document).ready(function () {
    function getParameterByName(name) {
        const url = new URL(window.location.href);
        let value = url.searchParams.get(name);

        if (!value) {
            const fragment = url.hash.substring(1); 
            const params = new URLSearchParams(fragment);
            value = params.get(name);
        }

        if (value && value.startsWith('#')) {
            value = value.replace('#', '');
        }
        return value;
    }

    const usuario_id = getParameterByName('usuario_id');
    console.log("ID de usuario obtenido:", usuario_id);

    $.ajax({
        url: '../php/profile-friend.php',
        type: 'GET',
        dataType: 'json',
        data: { usuario_id: "#"+usuario_id },
        success: function (data) {
            if (data.error) {
                alert(data.error); 
            } else {
                $('#nombre-usuario').text(data.nombre || 'Usuario no disponible');
                $('#id-usuario').text(data.usuario_id || 'Usuario no disponible');
                $('#estudios-usuario').text(data.curso + " " +data.estudios || 'Estudios no disponibles');
                $('#descripcion-usuario').text(data.descripcion || 'Sin descripción');
                console.log(data);
                $('#imagen-perfil').attr('src', data.foto_perfil || '../img/default-profile.png');
            }
        },
        error: function () {
            alert('Hubo un error al cargar los datos del perfil.');
        }
    });
});

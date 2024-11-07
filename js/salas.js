$(document).ready(function() {
    $(".crear-sala").on("click", function(){
        $(".menu-crear-sala").css("display", "block");
    });
    $(".btn-crear-sala").on("click", function(){
        $(".menu-crear-sala").css("display", "none");
            var nombre_sala = $('#nombre_sala').val();
            var descripcion_sala = $('#descripcion_sala').val();
            var fecha_entrega = $('#fecha_entrega').val();
    
            if (!nombre_sala || !descripcion_sala || !fecha_entrega) {
                alert('Por favor, completa todos los campos.');
                return;
            }
    
            $.ajax({
                url: '../php/salas.php',
                type: 'POST',
                data: {
                    action: 'crear',
                    nombre_sala: nombre_sala,
                    descripcion_sala: descripcion_sala,
                    fecha_entrega: fecha_entrega,
                },
                success: function(response) {
                    console.log(response);
                    var data = JSON.parse(response);
                    
                    if (data.success) {
                        alert('Sala creada exitosamente!');
                    } else {
                        alert('Error al crear la sala: ' + (data.error || 'Desconocido'));
                    }
                },
                error: function() {
                    alert('Hubo un error al conectar con el servidor.');
                }
            });
    });
})
$(document).ready(function() {
    // Carrusel del index
    $('.informacion').slick({
        arrows: false,
        dots: false,
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 250,
        centerMode: true,
        pauseOnHover: true,
    });
    var val = 0;
    // Verificar que el usuario está activado
    $.ajax({
        url: 'php/session.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.auth) {
                $('.container').css('display', 'block');
                $('.cont').css('display', 'none');
                val = 1;
            } else {
                $('.container').css('display', 'none');
                $('.cont').css('display', 'block');
            }
        },
        error: function() {
            console.error("No se pudo verificar la sesión");
        }
    });
    if (val = 1){
        $.ajax({
            url: 'php/tareas.php', 
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.error) {
                } else {
                    $('.tareas ul').empty(); 
                    data.forEach(function(tarea) {
                        $('.tareas ul').append(`
                            <li>
                                <div class="tarea" data-id="${tarea.tarea_id}">
                                    <h3>${tarea.titulo}</h3>
                                    <p>Fecha de entrega: ${tarea.fecha_entrega}</p>
                                    <button class="btn-ir-tarea">Ir a página de tareas</button>
                                </div>
                            </li>
                        `);
                    });
                }
            },
            error: function() {
                alert('Error al cargar las tareas.');
            }
        });
        $.ajax({
            url: 'php/amigos.php',
            type: 'POST',
            data: { accion: 'listar_amigos' },
            success: function(data) {
                const amigos = JSON.parse(data);
                $('#lista-amigos').empty();
                amigos.forEach(amigo => {
                    $('.companero ul').append(`
                        <li>
                            <div class="amigo">
                                <a href="html/perfil-amigo.html?usuario_id=${amigo.usuario_id.replace('#', '')}">
                                    <img src="${amigo.foto_perfil || 'img/default-profile.png'}" alt="Amigo ${amigo.nombre}">
                                    <h3>${amigo.nombre}</h3>
                                    <p>${amigo.email}</p>
                                </a>
                            </div>
                        </li>
                    `);
                });
            }
        }); 
        $.ajax({
            url: 'php/salas.php',
            type: 'GET',
            data: { action: 'listar_participacion' },
            success: function(response) {
                try {
                    var data = JSON.parse(response);
                    
                    if (data.success) {
                        $('.salas ul').empty();
                        
                        // Verifica si `salas` realmente existe en los datos devueltos
                        if (Array.isArray(data.salas)) {
                            data.salas.forEach(function(sala) {
                                $('.salas ul').append(`
                                    <li>
                                        <div class="sala">
                                            <h3>${sala.nombre}</h3>
                                            <p>Fecha de entrega: ${sala.fecha_entrega || 'No definida'}</p>
                                            <button class="btn-ir" data-sala-id="${sala.sala_id}">Ir a la sala</button>
                                        </div>
                                    </li>
                                `);
                            });
                        } else {
                            alert('No se encontraron salas.');
                        }
                    } else {
                        alert('Error al listar salas: ' + (data.error || 'Desconocido'));
                    }
                } catch (e) {
                    console.error('Error de formato JSON:', e);
                    alert('Hubo un problema al procesar los datos del servidor.');
                }
            },
            error: function() {
                alert('Hubo un error al conectar con el servidor.');
            }
        });               
    }
    $(document).on('click', '.btn-ir-tarea', function() {
        window.location.href = "html/tareas.html";
    });

});
document.addEventListener("DOMContentLoaded", () => {
    // Animación de entrada para el contenedor ".cont"
    gsap.to(".cont", {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
    });

    // Animación de los elementos dentro de ".cont"
    gsap.from(".cont h1", {
        y: -50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "back.out(1.7)"
    });

    gsap.from(".cont p", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        stagger: 0.2,
        ease: "power2.out"
    });

    gsap.from(".cont .table-info", {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        delay: 0.7,
        ease: "back.out(1.5)"
    });

    gsap.from(".btn-comenzar", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.9,
        stagger: 0.2,
        ease: "power2.out"
    });
});
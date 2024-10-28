$(document).ready(function() {
    // Carrusel del index
    $('.informacion').slick({
        arrows: false,
        dots: true,
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 250,
        centerMode: true,
        centerPadding: '0px',
        pauseOnHover: true,
    });

    // Verificar que el usuario está activado
    $.ajax({
        url: 'php/session.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.auth) {
                $('.container').css('display', 'block');
                $('.cont').css('display', 'none');
                console.log(`Bienvenido, ${response.nombre_usuario}`);
            } else {
                $('.container').css('display', 'none');
                $('.cont').css('display', 'block');

            }
        },
        error: function() {
            console.error("No se pudo verificar la sesión");
        }
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
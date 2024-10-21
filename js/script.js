$(document).ready(function() {
    //Hola mundo//
    // Animaciones del cabecero //
    $(".btn-cabezero").click(function() {
        $(".line-1").toggleClass("hide");
        $(".line-2").toggleClass("rotate-45");
        $(".line-3").toggleClass("rotate--45");
        $(".menu-cabezero").slideToggle(); 
    });
    // Carrusel del index //
    $('.informacion').slick({
        arrows: false, 
        dots: true, 
        infinite: true,
        slidesToShow: 2,
        autoplay: true,
        autoplaySpeed: 4000, 
        speed: 500,
    });
});

$(document).ready(function() {
    // Carrusel del index //
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
});


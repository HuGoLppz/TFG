$(document).ready(function() {
    // Carrusel del index //
    $('.informacion').slick({
        arrows: false, 
        dots: false, 
        infinite: true,
        slidesToShow: 3, 
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000, 
        speed: 500,
        centerMode: true,  
    });
});

$(document).ready(function() {
    //Hola mundo//
    // Animaciones del cabecero //
    $(".btn-cabezero").click(function() {
        $(".line-1").toggleClass("hide");
        $(".line-2").toggleClass("rotate-45");
        $(".line-3").toggleClass("rotate--45");
        $(".menu-cabezero").slideToggle(); 
    });
});
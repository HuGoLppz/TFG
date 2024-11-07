$(document).ready(function() {
    $(".btn-cabecero").click(function() {
        $(".line-1").toggleClass("hide");
        $(".line-2").toggleClass("rotate-45");
        $(".line-3").toggleClass("rotate--45");
        $(".menu-cabecero").slideToggle(); 
    });
});

/*$(document).ready(function() {
    $(".cabecero").hover(
        function() {
            // Cuando el ratón entra al área del botón
            $(".line-1").toggleClass("hide");
            $(".line-2").toggleClass("rotate-45");
            $(".line-3").toggleClass("rotate--45");
            $(".menu-cabecero").slideDown();  // Muestra el menú
        },
        function() {
            // Cuando el ratón sale del área del botón
            $(".line-1").toggleClass("hide");
            $(".line-2").toggleClass("rotate-45");
            $(".line-3").toggleClass("rotate--45");
            $(".menu-cabecero").slideUp();  // Oculta el menú
        }
    );
});*/
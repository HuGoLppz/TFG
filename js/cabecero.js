$(document).ready(function() {
    $(".btn-cabecero").click(function() {
        $(".line-1").toggleClass("hide");
        $(".line-2").toggleClass("rotate-45");
        $(".line-3").toggleClass("rotate--45");
        $(".menu-cabecero").slideToggle(); 
    });

    $(".checkbox").on("change", function () {
        if ($(this).is(":checked")) {
            // Activar modo oscuro
            $("body").css("background-color", "#121212");
            $(".cont").css("color", "#ffffff");
            $(".cont h1").css("color", "#ffffff");
            $(".cont .intro p").css("color", "#dddddd");
            $(".botones > a > button").css({
                "background-color": "#333333",
                "color": "#ffffff",
                "border": "1px solid #ffffff"
            });
            $(".cont-logo, .circulo-logo").css("background-color", "rgb(42, 53, 86)");
            $(".logo").css("filter", "invert(1)");
            $(".logo").css({
                "transform": "translateX(-50%) rotate(180deg)",
                "transition": "transform 0.5s"
            });
        } else {
            // Volver a modo claro
            $("body").css("background-color", "#ffffff");
            $(".cont").css("color", "#000000");
            $(".cont h1").css("color", "#000000");
            $(".cont .intro p").css("color", "#000000");
            $(".botones > a > button").css({
                "background-color": "",
                "color": "",
                "border": ""
            });
            $(".cont-logo, .circulo-logo").css("background-color", "rgb(134, 149, 232)");
            $(".logo").css("filter", "invert(0)");
            $(".logo").css({
                "transform": "translateX(-50%) rotate(0deg)",
                "transition": "transform 0.5s"
            });
        }
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
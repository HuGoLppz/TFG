$(document).ready(function() {
    $('#loader').fadeIn();
    $('.container').css("display", "none");
    /*Cabecero y pie de página*/
    $("#header").load("includes/header.html");
    $("#footer").load("includes/footer.html");
    /*Loader*/
    $("#loader").load("includes/loader.html");
    /*Cambio de colores*/
    $(document).ajaxStart(function() {
        $('#loader').fadeIn();
        console.log("Hola");
    });
    
    $(document).ajaxStop(function() {
        $('#loader').fadeOut();
        $('.container').css("display", "flex");
        console.log("Adios");
    });

    $(".checkbox").on("change", function () {
        if ($(this).is(":checked")) {
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
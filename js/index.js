$(document).ready(function () {
    /*swich color*/
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
            $(".cont-logo, .circulo-logo").css("background-color", "#1f1f1f");
            $(".logo").css("filter", "invert(1)");
            $(".logo").css({ 
                "transform": "translateX(-50%) rotate(180deg)", // Unir transformaciones
                "transition": "transform 0.5s" // Asegurar la transición afecta solo a transform
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
                "transform": "translateX(-50%) rotate(0deg)", // Unir transformaciones
                "transition": "transform 0.5s" // Asegurar la transición afecta solo a transform
            });
        }
    });
    

    /* Animación con GSAP para el contenedor circulo-logo */
    gsap.from(".circulo-logo", {
        x: -500,        // Comienza desde la izquierda fuera de la pantalla
        rotation: 360,  // Da una vuelta completa
        duration: 1,    // Dura 1 segundo
        ease: "power2.out",
        onComplete: function () {
            // Cuando termine la animación del círculo, empieza la animación del h1
            animarH1();
        }
    });

    /* Animación con GSAP para letras de h1 */
    function animarH1() {
        const h1Element = $(".cont h1");
        const text = h1Element.text();

        // Divide el texto en letras individuales y reemplaza el contenido del h1
        h1Element.html("");
        text.split("").forEach((char) => {
            const span = $("<span>").text(char === " " ? "\u00A0" : char); // Manejar espacios
            h1Element.append(span);
        });

        // Animar las letras con GSAP
        gsap.to(".cont h1", {
            opacity: 1, // Hacer que el h1 sea visible
            duration: 0.5, // Duración para aparecer
            delay: 1, // Retraso para que espere hasta que termine la animación del círculo
            onComplete: function () {
                // Después de que el h1 sea visible, animamos las letras
                gsap.from(".cont h1 span", {
                    opacity: 0,
                    y: 10,
                    duration: 0.05, // Duración de cada animación individual
                    stagger: 0.05,  // Espaciado entre las animaciones
                    ease: "power2.out",
                    onComplete: function () {
                        // Cuando termine la animación del h1, comienza la de los párrafos
                        gsap.fromTo(".cont p",
                            { opacity: 0, y: 30 }, // Estado inicial
                            { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" } // Animación
                        );
                    }
                });
            }
        });
    }
});

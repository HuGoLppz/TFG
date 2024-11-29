$(document).ready(function () {
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
    $(".cont h1").css("opacity", "0");
    gsap.from(".circulo-logo", {
        x: -500,        
        rotation: 360,  
        duration: 1,    
        ease: "power2.out",
        onComplete: function () {
            animarH1();
        }
    });

    function animarH1() {
        const h1Element = $(".cont h1").css("opacity", "1");
        const text = h1Element.text();
        h1Element.html(""); 
        text.split("").forEach((char) => {
            const span = $("<span>").text(char === " " ? "\u00A0" : char); 
            h1Element.append(span);
        });

        gsap.from(".cont h1 span", {
            opacity: 0, 
            y: 10,     
            duration: 0.05,  
            stagger: 0.03,  
            ease: "power2.out", 
            onComplete: function () {
                gsap.fromTo(".cont p",
                    { opacity: 0, y: 0 }, 
                    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" }
                );
            }
        });
    }    
});

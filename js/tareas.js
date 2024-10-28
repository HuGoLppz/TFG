$(document).ready(function() {
    $(".btn-crear").on("click", function(){
        $(".tareas-crear").css("display","block");
        $(".tareas").css("opacity",0.5);
        // $("button").not(".btn-crear2").prop("disabled", true);
    })
    $(".btn-crear2").on("click", function(){
        $(".tareas-crear").css("display","none");
        // $("button").not(".btn-crear2").prop("disabled", false);
    })
});

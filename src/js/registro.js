$(document).ready(function () {
    // Declarar variables globales
    let user, email, password, course, studyName, description;

    function validateForm1() {
        let isValid = true;
        $("#formulario1 .error-message").remove();

        user = $('#user').val().trim();
        email = $('#email').val().trim();
        password = $('#password').val().trim();

        if (!user) {
            $("#0").after('<p class="error-message" id="error-user">El nombre completo es obligatorio.</p>');
            isValid = false;
        }
        if (!email) {
            $("#1").after('<p class="error-message" id="error-email">El correo electrónico es obligatorio.</p>');
            isValid = false;
        } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            $("#1").after('<p class="error-message" id="error-email">El correo electrónico no es válido.</p>');
            isValid = false;
        }
        if (!password) {
            $("#2").after('<p class="error-message" id="error-password">La contraseña es obligatoria.</p>');
            isValid = false;
        } else if (password.length < 6) {
            $("#2").after('<p class="error-message" id="error-password">La contraseña debe tener al menos 6 caracteres.</p>');
            isValid = false;
        }
        return isValid;
    }

    function validateForm2() {
        let isValid = true;
        $("#formulario2 .error-message").remove();

        course = $('#course').val().trim();
        studyName = $('#study-name').val().trim();
        description = $('#description').val().trim();

        if (!course) {
            $("#4").after('<p class="error-message" id="error-course">El curso es obligatorio.</p>');
            isValid = false;
        }
        if (!studyName) {
            $("#5").after('<p class="error-message" id="error-study-name">El nombre del estudio es obligatorio.</p>');
            isValid = false;
        }
        if (!description) {
            $("#6").after('<p class="error-message" id="error-description">La descripción es obligatoria.</p>');
            isValid = false;
        }

        return isValid;
    }

    $('#btn-continue').on('click', function () {
        if (validateForm1()) {
            $('#hidden-user').val(user);
            $('#hidden-email').val(email);
            $('#hidden-password').val(password);

            $('#formulario1').hide();
            $('#formulario2').fadeIn();
        }
    });

    $('#formulario2').on('submit', function (event) {
        event.preventDefault();

        if (validateForm2()) {
            $.ajax({
                url: '../php/sing_up.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    agregar_usuario: true,
                    user: $('#hidden-user').val(),
                    password: $('#hidden-password').val(),
                    email: $('#hidden-email').val(),
                    course: $('#course').val(),
                    study_name: $('#study-name').val(),
                    description: $('#description').val()
                },
                success: function (response) {
                    console.log(response.message + response.id_user);
                    var usuarioID = response.id_user;
                    if (response.success) {
                        $('#formulario1, #formulario2').hide();
                        $(".registro-container").empty();
                        const formulario3 = $(`
                        <div id="formulario3">
                            <h1>Regístrate en STUDY-PLANNER</h1>
                            <p style="text-align:justify">
                                Para continuar con el registro, añade las asignaturas que estás cursando actualmente.
                                Para modificarlas, accede a "perfil/modificar asignaturas".
                            </p>
                            <label for="nueva_asignatura">Crear tus asignaturas:</label>
                            <div class="input-container">
                                <input type="text" id="nueva_asignatura" placeholder="Nombre de la nueva asignatura">
                                <span class="input-border"></span>
                            </div>
                            <br>
                            <button type="button" id="crear_asignatura">Crear y Añadir</button>
                            <button type="button" class="boton-volver">Ir al inicio de sesión</button>
                            <br>
                            <label>Asignaturas añadidas:</label>
                            <ul id="asignaturas_añadidas"></ul>
                            <p>¿Ya tienes cuenta? <a href="login.html">Inicia sesión aquí</a></p>
                        </div>
                        `);
                        $(".registro-container").append(formulario3);

                        $(".boton-volver").on("click", function(){
                            window.location.href = "login.html";
                        });

                        function cargarAsignaturas(a) {
                            console.log("1");
                            console.log(a);
                            $.ajax({
                                url: '../php/sing_up.php',
                                type: 'POST',
                                dataType: 'json',
                                data: { 
                                    listar_asignaturas: true,
                                    usuarioID: a,
                                },
                                success: function (response) {
                                    console.log(response);
                                    if (response.success && response.asignaturas) {
                                        $('#asignaturas_añadidas').empty();
                                        response.asignaturas.forEach(asignatura => {
                                            $('#asignaturas_añadidas').append(`<li>${asignatura.nombre_asignatura}</li>`);
                                        });
                                    } else {
                                        alert('No se pudieron cargar las asignaturas.');
                                    }
                                },
                                error: function (xhr, status, error) {
                                    console.error(response);
                                }
                            });
                        }

                        $('#crear_asignatura').on('click', function () {
                            const nuevaAsignatura = $('#nueva_asignatura').val().trim();
                            console.log(usuarioID);
                            if (nuevaAsignatura) {
                                $.ajax({
                                    url: '../php/sing_up.php',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        crear_asignatura: nuevaAsignatura,
                                        usuarioID: usuarioID,
                                    },
                                    success: function (response) {
                                        if (response.success) {
                                            cargarAsignaturas(usuarioID);
                                            $('#nueva_asignatura').val('');
                                        } else {
                                            alert(response.error || 'Error al crear la asignatura.');
                                        }
                                    },
                                    error: function (xhr, status, error) {
                                        console.log(xhr, error, status);
                                    }
                                });
                            } else {
                                alert('Por favor, introduce un nombre para la nueva asignatura.');
                            }
                        });
                    } else {
                        alert(response.message);
                        $('#formulario1').fadeIn();
                        $('#formulario2').hide();
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error, status, xhr);
                }
            });
        }
    });
});

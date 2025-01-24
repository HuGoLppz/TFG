<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = conectar();

    if (isset($_POST['agregar_usuario'])) {
        $id_user = "";
        $name = $_POST['user'] ?? null;
        $password = $_POST['password'] ?? null;
        $email = $_POST['email'] ?? null;
        $course = $_POST['course'] ?? null;
        $studyName = $_POST['study_name'] ?? null;
        $description = $_POST['description'] ?? null;

        if (empty($name) || empty($password) || empty($email) || empty($course) || empty($studyName) || empty($description)) {
            echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
            exit;
        }

        try {
            $checkEmailStmt = $conn->prepare("SELECT COUNT(*) FROM Usuarios WHERE email = :email");
            $checkEmailStmt->bindParam(':email', $email);
            $checkEmailStmt->execute();
            if ($checkEmailStmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
                exit;
            }

            $checkNameStmt = $conn->prepare("SELECT COUNT(*) FROM Usuarios WHERE nombre = :nombre");
            $checkNameStmt->bindParam(':nombre', $name);
            $checkNameStmt->execute();
            if ($checkNameStmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya está registrado.']);
                exit;
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare(
                "INSERT INTO Usuarios (usuario_id, nombre, email, password, curso, estudios, descripcion) 
                 SELECT generar_id_usuario(), :name, :email, :password, :course, :studyName, :description"
            );
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->bindParam(':course', $course);
            $stmt->bindParam(':studyName', $studyName);
            $stmt->bindParam(':description', $description);

            if ($stmt->execute()) {
                $sqlid = $conn->prepare("SELECT usuario_id FROM Usuarios WHERE nombre = :name AND email = :email");
                $sqlid->bindParam(':name', $name);
                $sqlid->bindParam(':email', $email);
                $sqlid->execute();
                $id_user = $sqlid->fetchColumn();

                echo json_encode(['success' => true, 'message' => 'Usuario y estudio registrados correctamente.', 'id_user' => $id_user]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
        }
    }

    if (isset($_POST['listar_asignaturas'])) {
        $id = $_POST['usuarioID'];
        
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
            exit;
        }
    
        try {
            $stmt = $conn->prepare("SELECT a.asignatura_id, a.nombre_asignatura 
                                    FROM Asignaturas a
                                    JOIN Usuarios_Asignaturas ua ON a.asignatura_id = ua.asignatura_id
                                    WHERE ua.usuario_id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_STR);
            $stmt->execute();
            $asignaturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            echo json_encode(['success' => true, 'asignaturas' => $asignaturas, 'a' => $id]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al cargar las asignaturas: ' . $e->getMessage()]);
        }
        exit;
    }
    
    if (isset($_POST['crear_asignatura'])) {
        $id1 = $_POST['usuarioID'];
        $nombreAsignatura = trim($_POST['crear_asignatura']);

        $stmt = $conn->prepare("SELECT asignatura_id FROM Asignaturas WHERE nombre_asignatura = :nombre_asignatura LIMIT 1");
        $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturaExistente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($asignaturaExistente) {
            $asignaturaId = $asignaturaExistente['asignatura_id'];
        } else {
            $stmt = $conn->prepare("INSERT INTO Asignaturas (nombre_asignatura, color, descripcion) VALUES (:nombre_asignatura, :color, :descripcion)");
            $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
            $stmt->bindParam(':color', $color, PDO::PARAM_STR);
            $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
            if ($stmt->execute()) {
                $asignaturaId = $conn->lastInsertId();
            } else {
                echo json_encode(['error' => 'Error al crear la asignatura.']);
                exit;
            }
        }
        $stmt = $conn->prepare("INSERT IGNORE INTO Usuarios_Asignaturas (usuario_id, asignatura_id) VALUES (:usuario_id, :asignatura_id)");
        $stmt->bindParam(':usuario_id', $id1, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignaturaId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'asignatura_id' => $asignaturaId]);
        } else {
            echo json_encode(['error' => 'Error al vincular la asignatura con el usuario.']);
        }
        exit;
    }

    if (isset($_POST['agregar_asignatura'])) {
        $id = $_SESSION['usuario_id'];
        $asignatura_id = $_POST['agregar_asignatura'];
        $stmt = $conn->prepare("INSERT IGNORE INTO Usuarios_Asignaturas (usuario_id, asignatura_id) VALUES (:usuario_id, :asignatura_id)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignatura_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error al añadir la asignatura']);
        }
        exit;
    }
}
?>

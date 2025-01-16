<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['error' => 'No tienes permisos para realizar esta acción']);
    exit();
}

$id = $_SESSION['usuario_id'];
$conn = conectar();

if (!$conn) {
    echo json_encode(['error' => 'No se pudo establecer la conexión a la base de datos']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    if (isset($_POST['modificar_informacion'])) {
        $descripcion = $_POST['descripcion'] ?? '';
        $curso = $_POST['curso'] ?? '';
        $estudios = $_POST['estudios'] ?? '';
        $id = $_SESSION['usuario_id'] ?? '';
    
        if (empty($id)) {
            echo json_encode(['error' => 'No se encontró el ID del usuario']);
            exit;
        }
    
        $fotoPerfilPath = '';
    
        $id_mod = '';

        if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {
            if ($_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['error' => 'Error al subir la imagen: ' . $_FILES['foto_perfil']['error']]);
                exit;
            }
    
            $fotoPerfil = $_FILES['foto_perfil'];
            $id_mod = str_replace('#', '', $id);
            $uploadDir = "../img/perfil/$id_mod/";
    
            if (!file_exists($uploadDir) && !mkdir($uploadDir, 0777, true)) {
                echo json_encode(['error' => 'No se pudo crear el directorio para guardar la imagen']);
                exit;
            }
    
            $fotoPerfilNombre = 'pfp.jpg';
            $uploadPath = $uploadDir . $fotoPerfilNombre;
    
            $allowedTypes = ['image/jpeg', 'image/png'];
    
            if (!in_array($fotoPerfil['type'], $allowedTypes)) {
                echo json_encode(['error' => 'Solo se permiten imágenes en formato JPG, PNG o GIF']);
                exit;
            }
    
            if (!move_uploaded_file($fotoPerfil['tmp_name'], $uploadPath)) {
                echo json_encode(['error' => 'Error al mover la imagen subida']);
                exit;
            }
    
            $fotoPerfilPath = "../img/perfil/$id_mod/$fotoPerfilNombre";
    
            $query = "UPDATE Usuarios SET foto_perfil = :foto_perfil WHERE usuario_id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':foto_perfil', $fotoPerfilPath, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    
            if (!$stmt->execute()) {
                echo json_encode(['error' => 'Error al actualizar la foto de perfil en la base de datos']);
                exit;
            }
        }
    
        $query = "UPDATE Usuarios SET descripcion = :descripcion, curso = :curso, estudios = :estudios WHERE usuario_id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
        $stmt->bindParam(':curso', $curso, PDO::PARAM_STR);
        $stmt->bindParam(':estudios', $estudios, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Perfil actualizado con éxito']);
        } else {
            echo json_encode(['error' => 'Error al actualizar el perfil']);
        }
    }              

    if (isset($_POST['obtener_estadisticas'])) {
        $query = "SELECT 
            (SELECT COUNT(*) FROM Amigos WHERE usuario_id = :id1) AS total_amigos,
            (SELECT COUNT(*) FROM Tareas WHERE usuario_id = :id2 AND estado = 'completada') AS tareas_completadas,
            (SELECT COUNT(*) FROM Tareas WHERE usuario_id = :id3 AND estado != 'completada') AS tareas_sin_completar,
            (SELECT AVG(calificacion) FROM Calificaciones WHERE usuario_id = :id4) AS media_total_asignaturas,
            (SELECT COUNT(*) FROM Participantes_Salas WHERE usuario_id = :id5) AS total_salas,
            (SELECT fecha_registro FROM Usuarios WHERE usuario_id = :id6) AS fecha_registro,
            (SELECT email FROM Usuarios WHERE usuario_id = :id7) AS correo_usuario,
            (SELECT estado FROM Pomodoro WHERE usuario_id = :id5) AS contador_pomodoro
        FROM DUAL";

        $stmt = $conn->prepare($query);

        if ($stmt) {
            $params = [
                ':id1' => $id,
                ':id2' => $id,
                ':id3' => $id,
                ':id4' => $id,
                ':id5' => $id,
                ':id6' => $id,
                ':id7' => $id,
            ];

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $estadisticas = [
                    'total_amigos' => $result['total_amigos'] ?? 0,
                    'tareas_completadas' => $result['tareas_completadas'] ?? 0,
                    'tareas_sin_completar' => $result['tareas_sin_completar'] ?? 0,
                    'media_total_asignaturas' => $result['media_total_asignaturas'] ?? 0,
                    'total_salas' => $result['total_salas'] ?? 0,
                    'fecha_registro' => $result['fecha_registro'] ?? 'No disponible',
                    'correo_usuario' => $result['correo_usuario'] ?? 'No disponible',
                ];

                echo json_encode(['success' => true, 'estadisticas' => $estadisticas]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No se encontraron estadísticas.']);
            }
        } else {
            echo json_encode(['error' => 'Error al preparar la consulta']);
        }
        exit();
    }
    
    if (isset($_POST['datos_usuario'])) {
        $stmt = $conn->prepare("SELECT nombre, foto_perfil, descripcion, curso, estudios, usuario_id FROM Usuarios WHERE usuario_id = :id LIMIT 1");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userData) {
            echo json_encode(['success' => true, 'userData' => $userData]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        }
        exit();
    }

    if (isset($_POST['listar_asignaturas'])) {
        $stmt = $conn->prepare("SELECT a.asignatura_id, a.nombre_asignatura FROM Asignaturas a
                                JOIN Usuarios_Asignaturas ua ON a.asignatura_id = ua.asignatura_id
                                WHERE ua.usuario_id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'asignaturas' => $asignaturas]);
        exit();
    }
    
    if (isset($_POST['info_notasmedias'])) {
        $stmt = $conn->prepare("SELECT t.asignatura, AVG(c.calificacion) AS promedio_calificaciones
                                FROM Tareas t JOIN Calificaciones c 
                                ON t.tarea_id = c.tarea_id
                                WHERE c.usuario_id = :id GROUP BY t.asignatura;");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'medias' => $asignaturas]);
        exit();
    }

    if (isset($_POST['crear_asignatura'])) {
        $nombreAsignatura = trim($_POST['crear_asignatura']);
    
        $stmt = $conn->prepare("SELECT asignatura_id FROM Asignaturas WHERE nombre_asignatura = :nombre_asignatura LIMIT 1");
        $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturaExistente = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($asignaturaExistente) {
            $asignaturaId = $asignaturaExistente['asignatura_id'];
        } else {
            $stmt = $conn->prepare("INSERT INTO Asignaturas (nombre_asignatura) VALUES (:nombre_asignatura)");
            $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
            if ($stmt->execute()) {
                $asignaturaId = $conn->lastInsertId(); 
            } else {
                echo json_encode(['error' => 'Error al crear la asignatura.']);
                exit();
            }
        }
    
        $stmt = $conn->prepare("INSERT IGNORE INTO Usuarios_Asignaturas (usuario_id, asignatura_id) VALUES (:usuario_id, :asignatura_id)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignaturaId, PDO::PARAM_INT);
    
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Asignatura creada y añadida con éxito.', 'asignatura_id' => $asignaturaId]);
        } else {
            echo json_encode(['error' => 'Error al vincular la asignatura con el usuario.']);
        }
        exit();
    }
    

    if (isset($_POST['agregar_asignatura'])) {
        $asignatura_id = $_POST['agregar_asignatura'];
        $stmt = $conn->prepare("INSERT IGNORE INTO Usuarios_Asignaturas (usuario_id, asignatura_id) VALUES (:usuario_id, :asignatura_id)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignatura_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Asignatura añadida con éxito']);
        } else {
            echo json_encode(['error' => 'Error al añadir la asignatura']);
        }
        exit();
    }

    if (isset($_POST['eliminar_asignatura'])) {
        $asignatura_id = $_POST['eliminar_asignatura'];
        $stmt = $conn->prepare("DELETE FROM Usuarios_Asignaturas WHERE usuario_id = :usuario_id AND asignatura_id = :asignatura_id");
        $stmt2 = $conn->prepare("DELETE FROM Asignaturas WHERE asignatura_id = :asignatura_id");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignatura_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Asignatura eliminada con éxito']);
            $stmt2->bindParam(':usuario_id', $id, PDO::PARAM_STR);
            $stmt2->bindParam(':asignatura_id', $asignatura_id, PDO::PARAM_INT);
        } else {
            echo json_encode(['error' => 'Error al eliminar la asignatura']);
        }
        exit();
    }

    if(isset($_POST['listar_notificaciones'])){
        $stmt = $conn->prepare("SELECT * FROM Notificaciones WHERE usuario_id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'notificaciones' => $notificaciones]);
        exit();
    }

    if (isset($_POST['accion']) && $_POST['accion'] === 'aceptar_solicitud_amistad') {
        $nuevo_amigo_id = $_POST['amigo_id'];
        
        $stmt = $conn->prepare("SELECT COUNT(*) FROM Amigos WHERE 
            (usuario_id = :usuario_id AND amigo_id = :amigo_id) OR 
            (usuario_id = :amigo_id AND amigo_id = :usuario_id)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':amigo_id', $nuevo_amigo_id, PDO::PARAM_STR);
        $stmt->execute();
        $existeRelacion = $stmt->fetchColumn();
    
        if ($existeRelacion > 0) {
            echo json_encode(["mensaje" => "Ya existe una relación de amistad"]);
            exit();
        }
    
        $stmt = $conn->prepare("INSERT INTO Amigos (usuario_id, amigo_id) 
                                VALUES (:usuario_id, :amigo_id), (:amigo_id, :usuario_id)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':amigo_id', $nuevo_amigo_id, PDO::PARAM_STR);
    
        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Amigo agregado exitosamente"]);
        } else {
            echo json_encode(["mensaje" => "Error al agregar amigo"]);
        }
        exit();
    }
    
    if (isset($_POST['accion']) && $_POST['accion'] === 'aceptar_solicitud_sala') {
        $nuevo_sala_id = $_POST['sala_id'];
        $asignatura = $_POST['asignatura'];
        $stmt = $conn->prepare("INSERT INTO Participantes_Salas (sala_id, usuario_id, administrador, asignatura) VALUES (:sala_id, :usuario_id, 0, :asignatura)");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':sala_id', $nuevo_sala_id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura', $asignatura, PDO::PARAM_STR);
    
        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Se ha agregado exitosamente a la sala"]);
        } else {
            echo json_encode(["mensaje" => "Error al agregar a la sala"]);
        }
        exit();
    }
    
    if (isset($_POST['accion']) && $_POST['accion'] === 'borrar_notificacion') {
        $notificacion_id = $_POST["id_notificacion"];
        $stmt = $conn->prepare("DELETE FROM Notificaciones WHERE usuario_id = :usuario_id AND notificacion_id = :notificacion_id");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':notificacion_id', $notificacion_id, PDO::PARAM_INT);
        $stmt->execute();
        exit();
    }
    
}
?>

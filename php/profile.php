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
    if (isset($_POST['obtener_estadisticas'])) {
        $query = "SELECT 
                    (SELECT COUNT(*) FROM Amigos WHERE usuario_id = ?) AS total_amigos,
                    (SELECT COUNT(*) FROM Tareas WHERE usuario_id = ? AND estado = 'completada') AS tareas_completadas,
                    (SELECT COUNT(*) FROM Tareas WHERE usuario_id = ? AND estado != 'completada') AS tareas_sin_completar,
                    (SELECT AVG(media_calificaciones) FROM Progreso_Academico WHERE usuario_id = ?) AS media_total_asignaturas,
                    (SELECT COUNT(*) FROM Participantes_Salas WHERE usuario_id = ?) AS total_salas,
                    (SELECT fecha_registro FROM Usuarios WHERE usuario_id = ?) AS fecha_registro,
                    (SELECT email FROM Usuarios WHERE usuario_id = ?) AS correo_usuario
                ";
    
        $stmt = $conn->prepare($query);
        if ($stmt) {
            $stmt->bind_param('sssssss', $id, $id, $id, $id, $id, $id, $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result && $data = $result->fetch_assoc()) {
                $estadisticas = [
                    'total_amigos' => $data['total_amigos'] ?? 0,
                    'tareas_completadas' => $data['tareas_completadas'] ?? 0,
                    'tareas_sin_completar' => $data['tareas_sin_completar'] ?? 0,
                    'media_total_asignaturas' => $data['media_total_asignaturas'] ?? 0,
                    'total_salas' => $data['total_salas'] ?? 0,
                    'fecha_registro' => $data['fecha_registro'] ?? 'No disponible',
                    'correo_usuario' => $data['correo_usuario'] ?? 'No disponible',
                ];
    
                echo json_encode(['success' => true, 'estadisticas' => $estadisticas]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al obtener las estadísticas.']);
            }
            $stmt->close();
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

    $descripcion = $_POST['descripcion'] ?? '';
    $curso = $_POST['curso'] ?? '';
    $estudios = $_POST['estudios'] ?? '';
    $privacidad = isset($_POST['privacidad']) ? 1 : 0;
    $fotoPerfil = $_FILES['foto_perfil']['name'] ?? null;

    if ($fotoPerfil) {
        $uploadDir = '../img/profiles/';
        $uploadFile = $uploadDir . basename($_FILES['foto_perfil']['name']);
        
        if (move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $uploadFile)) {
            $fotoPerfilPath = $uploadFile;
        } else {
            echo json_encode(['error' => 'Error al subir la imagen']);
            exit();
        }
    } else {
        $fotoPerfilPath = null;
    }

    $query = "UPDATE Usuarios SET descripcion = :descripcion, curso = :curso, estudios = :estudios, privacidad = :privacidad";
    if ($fotoPerfilPath) {
        $query .= ", foto_perfil = :foto_perfil";
    }
    $query .= " WHERE usuario_id = :id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
    $stmt->bindParam(':curso', $curso, PDO::PARAM_STR);
    $stmt->bindParam(':estudios', $estudios, PDO::PARAM_STR);
    $stmt->bindParam(':privacidad', $privacidad, PDO::PARAM_INT);
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    if ($fotoPerfilPath) {
        $stmt->bindParam(':foto_perfil', $fotoPerfilPath, PDO::PARAM_STR);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => 'Perfil actualizado con éxito']);
    } else {
        echo json_encode(['error' => 'Error al actualizar el perfil']);
    }
}
?>

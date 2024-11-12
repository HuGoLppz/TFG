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

// Obtener datos de perfil o sugerencias de asignaturas
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['buscar_asignatura'])) {
        // Buscar asignaturas
        $query = "%" . $_GET['buscar_asignatura'] . "%";
        $stmt = $conn->prepare("SELECT asignatura_id, nombre_asignatura FROM Asignaturas WHERE nombre_asignatura LIKE :query");
        $stmt->bindParam(':query', $query, PDO::PARAM_STR);
        $stmt->execute();
        $sugerencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sugerencias' => $sugerencias]);
        exit();
    }

    // Obtener perfil del usuario
    $stmt = $conn->prepare("SELECT nombre, foto_perfil, descripcion, curso, estudios, usuario_id FROM Usuarios WHERE usuario_id = :id LIMIT 1");
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    $stmt->execute();
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData) {
        echo json_encode($userData);
    } else {
        echo json_encode(['error' => 'Usuario no encontrado']);
    }
    exit();
}

// Actualizar datos del perfil, añadir o eliminar asignaturas
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Crear nueva asignatura si no existe
    if (isset($_POST['crear_asignatura'])) {
        $nombreAsignatura = trim($_POST['crear_asignatura']);

        // Verificar si la asignatura ya existe
        $stmt = $conn->prepare("SELECT asignatura_id FROM Asignaturas WHERE nombre_asignatura = :nombre_asignatura LIMIT 1");
        $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturaExistente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($asignaturaExistente) {
            echo json_encode(['success' => 'Asignatura ya existente añadida.', 'asignatura_id' => $asignaturaExistente['asignatura_id']]);
        } else {
            // Crear la asignatura
            $stmt = $conn->prepare("INSERT INTO Asignaturas (nombre_asignatura) VALUES (:nombre_asignatura)");
            $stmt->bindParam(':nombre_asignatura', $nombreAsignatura, PDO::PARAM_STR);
            if ($stmt->execute()) {
                $nuevaAsignaturaId = $conn->lastInsertId();
                echo json_encode(['success' => 'Asignatura creada y añadida con éxito.', 'asignatura_id' => $nuevaAsignaturaId]);
            } else {
                echo json_encode(['error' => 'Error al crear la asignatura.']);
            }
        }
        exit();
    }

    // Añadir asignatura al perfil del usuario
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

    // Eliminar asignatura del perfil del usuario
    if (isset($_POST['eliminar_asignatura'])) {
        $asignatura_id = $_POST['eliminar_asignatura'];
        $stmt = $conn->prepare("DELETE FROM Usuarios_Asignaturas WHERE usuario_id = :usuario_id AND asignatura_id = :asignatura_id");
        $stmt->bindParam(':usuario_id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':asignatura_id', $asignatura_id, PDO::PARAM_INT);
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Asignatura eliminada con éxito']);
        } else {
            echo json_encode(['error' => 'Error al eliminar la asignatura']);
        }
        exit();
    }

    // Actualizar datos de perfil del usuario
    $descripcion = $_POST['descripcion'] ?? '';
    $curso = $_POST['curso'] ?? '';
    $estudios = $_POST['estudios'] ?? '';
    $privacidad = isset($_POST['privacidad']) ? 1 : 0;
    $fotoPerfil = $_FILES['foto_perfil']['name'] ?? null;

    // Manejar subida de imagen de perfil si se proporciona
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

    // Actualización de perfil en la base de datos
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

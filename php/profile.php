<?php
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_SESSION['usuario_id'])) {
    // Lógica para obtener los datos de perfil
    $id = $_SESSION['usuario_id'];

    $conn = conectar();
    if (!$conn) {
        echo json_encode(['error' => 'No se pudo establecer la conexión a la base de datos']);
        exit();
    }

    $stmt = $conn->prepare("SELECT nombre, foto_perfil, descripcion, curso, estudios, usuario_id FROM Usuarios WHERE usuario_id = :id LIMIT 1");
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    $stmt->execute();

    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userData) {
        header('Content-Type: application/json');
        echo json_encode($userData);
    } else {
        echo json_encode(['error' => 'Usuario no encontrado']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['usuario_id'])) {
    // Lógica para actualizar los datos del perfil
    $id = $_SESSION['usuario_id'];
    $conn = conectar();
    if (!$conn) {
        echo json_encode(['error' => 'No se pudo establecer la conexión a la base de datos']);
        exit();
    }

    // Recolecta los datos enviados desde el formulario
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
        $fotoPerfilPath = null; // Mantén la foto actual si no se sube una nueva
    }

    // Actualización en la base de datos
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
} else {
    echo json_encode(['error' => 'No tienes permisos para realizar esta acción']);
}
?>

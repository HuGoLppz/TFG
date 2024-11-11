<?php
require_once 'db.php';

// Verifica si el usuario_id ha sido pasado en la URL
if (isset($_GET['usuario_id'])) {
    $id = $_GET['usuario_id'];

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
} else {
    echo json_encode(['error' => 'No se proporcionó un usuario_id']);
}
?>

<?php
session_start();
require_once 'db.php';

if (isset($_SESSION['usuario_id'])) {
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
} else {
    echo json_encode(['error' => 'No has iniciado sesión']);
}
?>

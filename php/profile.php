<?php
session_start();

$host = 'localhost';
$dbname = 'study_planner';
$username = 'root';
$password = '';

// Conectar a la base de datos
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si el usuario ha iniciado sesión
    if (isset($_SESSION['usuario_id'])) {
        $id = $_SESSION['usuario_id'];

        // Preparar y ejecutar la consulta SQL
        $stmt = $conn->prepare("SELECT nombre, foto_perfil, descripcion, curso, estudios FROM Usuarios WHERE usuario_id = :id LIMIT 1");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();

        // Obtener los datos del usuario
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userData) {
            // Enviar los datos como JSON
            header('Content-Type: application/json');
            echo json_encode($userData);
        } else {
            echo json_encode(['error' => 'Usuario no encontrado']);
        }
    } else {
        echo json_encode(['error' => 'No has iniciado sesión']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
}

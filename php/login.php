<?php
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['user'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
        exit();
    }

    $conn = conectar();
    if (!$conn) {
        echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT usuario_id, password FROM Usuarios WHERE nombre = :name LIMIT 1");
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($password = $user['password']) {
            $_SESSION['usuario_id'] = $user['usuario_id'];
            $_SESSION['nombre_usuario'] = $name;
            echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Nombre de usuario no registrado']);
    }
}
?>

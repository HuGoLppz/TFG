<?php
session_start();

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $conn = conectar();
    
    $name = $_POST['user'];
    $password = $_POST['password'];
    $email = $_POST['email'];

    // Verificar si el correo ya existe
    $checkEmailStmt = $conn->prepare("SELECT COUNT(*) FROM Usuarios WHERE email = :email");
    $checkEmailStmt->bindParam(':email', $email);
    $checkEmailStmt->execute();
    $emailExists = $checkEmailStmt->fetchColumn();

    if ($emailExists) {
        echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
        exit;
    }

    // Verificar si el nombre ya existe
    $checkNameStmt = $conn->prepare("SELECT COUNT(*) FROM Usuarios WHERE nombre = :nombre");
    $checkNameStmt->bindParam(':nombre', $name);
    $checkNameStmt->execute();
    $nameExists = $checkNameStmt->fetchColumn();

    if ($nameExists) {
        echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya está registrado.']);
        exit;
    }

    // Cifrar la contraseña y registrar el usuario
    $cifrarContrasena = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO `Usuarios` (usuario_id, nombre, email, password)
                            SELECT generar_id_usuario(), :name, :email, :password");
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $cifrarContrasena);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente.']);
}
?>

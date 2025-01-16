<?php
session_start();

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $conn = conectar();

    // Datos del primer formulario
    $name = $_POST['user'];
    $password = $_POST['password'];
    $email = $_POST['email'];

    // Datos del segundo formulario
    $course = $_POST['course'];
    $studyName = $_POST['study_name'];
    $description = $_POST['description'];

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
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO Usuarios (usuario_id, nombre, email, password, curso, estudios, descripcion) 
                            SELECT generar_id_usuario(), :name, :email, :password, :course, :studyName, :description");
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':course', $course);
    $stmt->bindParam(':studyName', $studyName);
    $stmt->bindParam(':description', $description);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Usuario y estudio registrados correctamente.']);
}
?>

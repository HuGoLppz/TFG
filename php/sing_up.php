<?php
session_start();

require_once 'db.php';    

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {

        $conn = conectar();
        
        $name = $_POST['user'];
        $password = $_POST['password'];
        $email = $_POST['email']; 
        
        $checkEmailStmt = $conn->prepare("SELECT COUNT(*) FROM `Usuarios` WHERE email = :email");
        $checkEmailStmt->bindParam(':email', $email);
        $checkEmailStmt->execute();
        
        $emailExists = $checkEmailStmt->fetchColumn();
        
        if ($emailExists) {
            echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
        } else {
            $stmt = $conn->prepare("INSERT INTO `Usuarios` (usuario_id, nombre, email, password)
                                    SELECT generar_id_usuario(), :name, :email, :password");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente.']);
        }
    }
?>

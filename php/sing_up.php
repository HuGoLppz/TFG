<?php
session_start();

$host = 'localhost';  
$dbname = 'study_planner';
$username = 'root';   
$password = '';       

try {
    // Crear conexión a la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $name = $_POST['user'];
        $password = $_POST['password'];
        $email = $_POST['email']; 
        
        // Verificar si el correo ya está registrado
        $checkEmailStmt = $conn->prepare("SELECT COUNT(*) FROM `Usuarios` WHERE email = :email");
        $checkEmailStmt->bindParam(':email', $email);
        $checkEmailStmt->execute();
        
        $emailExists = $checkEmailStmt->fetchColumn();
        
        if ($emailExists) {
            // Correo ya registrado
            echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
        } else {
            // Insertar el usuario en la base de datos
            $stmt = $conn->prepare("INSERT INTO `Usuarios` (usuario_id, nombre, email, password)
                                    SELECT generar_id_usuario(), :name, :email, :password");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente.']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
}
?>

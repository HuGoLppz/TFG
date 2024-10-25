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
        $name = $_POST['user']; // Cambiado de email a user
        $email = $_POST['user']; // Cambiado de email a user
        $password = $_POST['password'];
        
        // Consultar el usuario en la base de datos
        $stmt = $conn->prepare("SELECT usuario_id, password FROM Usuarios WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        // Verificar si el usuario existe
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificar la contraseña
            if (password_verify($password, $user['password'])) {
                $_SESSION['usuario_id'] = $user['usuario_id'];
                echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Correo no registrado']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos']);
}
?>

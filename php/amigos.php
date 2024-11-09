<?php
session_start();
require_once 'db.php';

$usuario_id = $_SESSION['usuario_id'] ?? null;

if (!$usuario_id) {
    echo json_encode(["mensaje" => "No hay usuario autenticado"]);
    exit();
}

// Conectar a la base de datos
$conn = conectar();
if (!$conn) {
    echo json_encode(["mensaje" => "Error de conexión a la base de datos"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $accion = $_POST['accion'];

    // Listar amigos
    if ($accion === 'listar_amigos') {
        $stmt = $conn->prepare("SELECT u.usuario_id, u.nombre, u.email, u.foto_perfil 
                                FROM Amigos a 
                                JOIN Usuarios u ON a.amigo_id = u.usuario_id 
                                WHERE a.usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();
        $amigos = $stmt->fetchAll();
        echo json_encode($amigos);
    }

    // Buscar amigos según un término de búsqueda
    if ($accion === 'buscar_amigos') {
        $busqueda = $_POST['query'] ?? '';
        $likeBusqueda = "%{$busqueda}%";
        
        $stmt = $conn->prepare("SELECT u.usuario_id, u.nombre 
                                FROM Usuarios u
                                WHERE (u.nombre LIKE :likeBusqueda)
                                AND u.usuario_id != :usuario_id
                                AND u.usuario_id IN (SELECT amigo_id FROM Amigos WHERE usuario_id = :usuario_id)
                                LIMIT 15");
        $stmt->bindParam(':likeBusqueda', $likeBusqueda, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();
        
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($resultados ?: ["mensaje" => "No se encontraron amigos"]);
    }
    
    // Buscar y agregar amigos (opcional: nueva funcionalidad)
    if ($accion === 'buscar_agregar') {
        $busqueda = $_POST['busqueda'];
        $likeBusqueda = "%{$busqueda}%";
        $stmt = $conn->prepare("SELECT usuario_id, nombre, email, foto_perfil 
                                FROM Usuarios 
                                WHERE (usuario_id LIKE :likeBusqueda OR nombre LIKE :likeBusqueda) 
                                AND usuario_id != :usuario_id 
                                AND usuario_id NOT IN (SELECT amigo_id FROM Amigos WHERE usuario_id = :usuario_id)
                                LIMIT 15");
        $stmt->bindParam(':likeBusqueda', $likeBusqueda, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();
        $usuarios = $stmt->fetchAll();
        echo json_encode($usuarios ?: ["mensaje" => "No se encontraron usuarios"]);
    }

    // Agregar amigo
    if ($accion === 'agregar_amigo') {
        $nuevo_amigo_id = $_POST['amigo_id'];
        $stmt = $conn->prepare("INSERT INTO Amigos (usuario_id, amigo_id) VALUES (:usuario_id, :amigo_id)");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->bindParam(':amigo_id', $nuevo_amigo_id, PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Amigo agregado exitosamente"]);
        } else {
            echo json_encode(["mensaje" => "Error al agregar amigo"]);
        }
    }
}
?>

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

    if ($accion === 'listar_amigos') {
        $usuario_id = $_SESSION['usuario_id']; 
        $nombre = '%' . $_POST['valor'] . '%'; 

        try {
            $stmt = $conn->prepare("SELECT u.usuario_id, u.nombre, u.email, u.foto_perfil 
                                    FROM Amigos a 
                                    JOIN Usuarios u ON a.amigo_id = u.usuario_id 
                                    WHERE a.usuario_id = :usuario_id AND u.nombre LIKE :nombre");
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
            $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
            $stmt->execute();
            $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($amigos);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    if ($accion === 'buscar_amigos') {
        $busqueda = $_POST['query'] ?? '';
        $likeBusqueda = "%{$busqueda}%";

        $stmt = $conn->prepare("SELECT u.usuario_id, u.nombre 
                                FROM Usuarios u
                                WHERE (u.nombre LIKE :likeBusqueda)
                                AND u.usuario_id != :usuario_id
                                AND u.usuario_id IN (SELECT amigo_id FROM Amigos WHERE usuario_id = :usuario_id)
                                ");
        $stmt->bindParam(':likeBusqueda', $likeBusqueda, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($resultados ?: ["mensaje" => "No se encontraron amigos"]);
    }

    if ($accion === 'listar_amigos2') {
        $stmt = $conn->prepare("SELECT u.usuario_id, u.nombre, u.email, u.foto_perfil 
                                FROM Amigos a 
                                JOIN Usuarios u ON a.amigo_id = u.usuario_id 
                                WHERE a.usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();
        $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($amigos);
    }

    // Buscar y agregar amigos
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
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios ?: ["mensaje" => "No se encontraron usuarios"]);
    }

    // Agregar amigo (enviar solicitud de amistad)
    if ($accion === 'agregar_amigo') {
        $nuevo_amigo_id = $_POST['amigo_id'];

        $stmt = $conn->prepare("SELECT nombre FROM Usuarios WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        $stmt->execute();
        $nombre_usuario = $stmt->fetchColumn();

        if ($nombre_usuario) {
            $mensaje = "El usuario {$nombre_usuario} te ha enviado una solicitud de amistad.";
            $tipo = "Solicitud de amistad";

            $stmt = $conn->prepare("INSERT INTO Notificaciones (usuario_id, remitente_id, tipo, mensaje, leida) 
                                    VALUES (:amigo_id, :id, :tipo, :mensaje, curdate())");
            $stmt->bindParam(':amigo_id', $nuevo_amigo_id, PDO::PARAM_STR);
            $stmt->bindParam(':id', $usuario_id, PDO::PARAM_STR);
            $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);
            $stmt->bindParam(':mensaje', $mensaje, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(["mensaje" => "Solicitud de amistad enviada exitosamente"]);
            } else {
                echo json_encode(["mensaje" => "Error al enviar la solicitud de amistad"]);
            }
        } else {
            echo json_encode(["mensaje" => "Error al obtener la información del usuario"]);
        }
    }
}
?>

<?php

session_start();
require_once 'db.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit;
}

$conn = conectar();
if (!$conn) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id']; 
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';

        if ($action === 'listar') {
            $query = "SELECT * FROM Salas 
                      WHERE creador_id = :usuario_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR); 
            $stmt->execute();
            $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($salas);
            exit;
        } 
    } elseif ($method === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'crear') {
            $nombre_sala = $_POST['nombre_sala'] ?? '';
            $descripcion_sala = $_POST['descripcion_sala'] ?? '';
            $fecha_entrega = $_POST['fecha_entrega'] ?? '';
            $usuario_id = $_SESSION['usuario_id']; 

            // Crear la sala en la tabla Salas
            $query_sala = "INSERT INTO Salas (sala_id, nombre, descripcion, fecha_creacion, creador_id) 
                           SELECT generar_id_sala(), :nombre_sala, :descripcion_sala, CURRENT_TIMESTAMP, :usuario_id";
            $stmt_sala = $conn->prepare($query_sala);
            $stmt_sala->bindParam(':nombre_sala', $nombre_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':descripcion_sala', $descripcion_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);

            $success_sala = $stmt_sala->execute();
            
            if ($success_sala) {
                $sala_id = $conn->lastInsertId(); 

                $query_participante = "INSERT INTO Participantes_Salas (sala_id, usuario_id) 
                                       VALUES (:sala_id, :usuario_id)";
                $stmt_participante = $conn->prepare($query_participante);
                $stmt_participante->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                $stmt_participante->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);

                $success_participante = $stmt_participante->execute();

                if ($success_participante) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Error al agregar el participante a la sala.']);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al crear la sala.']);
            }
            exit;
        } else {
            echo json_encode(['success' => false, 'error' => 'Acción no válida.']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Método de solicitud no permitido.']);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de ejecución: ' . $e->getMessage()]);
    exit;
}
?>

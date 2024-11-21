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

        if ($action === 'listar_participacion') {
            // Listar salas en las que el usuario participa
            $query = "SELECT Salas.sala_id, Salas.nombre, Salas.descripcion, Salas.fecha_creacion, Salas.creador_id
                      FROM Salas
                      INNER JOIN Participantes_Salas ON Salas.sala_id = Participantes_Salas.sala_id
                      WHERE Participantes_Salas.usuario_id = :usuario_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
            $stmt->execute();
            $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'salas' => $salas]);
            exit;
        } else {
            echo json_encode(['success' => false, 'error' => 'Acción no válida.']);
            exit;
        }
    } elseif ($method === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'crear') {
            $nombre_sala = $_POST['nombre_sala'] ?? '';
            $descripcion_sala = $_POST['descripcion_sala'] ?? '';
            $fecha_entrega = $_POST['fecha_entrega'] ?? '';
            $usuario_id = $_SESSION['usuario_id'];
            $idAmigos = $_POST['idAmigos'] ?? []; 
        
            $query_generar_id = "SELECT generar_id_sala() AS sala_id";
            $stmt_generar_id = $conn->prepare($query_generar_id);
            $stmt_generar_id->execute();
            $sala_id = $stmt_generar_id->fetchColumn();
        
            $query_sala = "INSERT INTO Salas (sala_id, nombre, descripcion, fecha_creacion, creador_id) 
                           VALUES (:sala_id, :nombre_sala, :descripcion_sala, CURRENT_TIMESTAMP, :usuario_id)";
            $stmt_sala = $conn->prepare($query_sala);
            $stmt_sala->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt_sala->bindParam(':nombre_sala', $nombre_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':descripcion_sala', $descripcion_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        
            $success_sala = $stmt_sala->execute();
        
            if ($success_sala) {
                $query_participante = "INSERT INTO Participantes_Salas (sala_id, usuario_id) 
                                       VALUES (:sala_id, :usuario_id)";
                $stmt_participante = $conn->prepare($query_participante);
                $stmt_participante->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                $stmt_participante->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                $success_participante = $stmt_participante->execute();
        
                if (!isset($nombre_usuario)) {
                    $query_get_nombre = "SELECT nombre FROM Usuarios WHERE usuario_id = :usuario_id";
                    $stmt_get_nombre = $conn->prepare($query_get_nombre);
                    $stmt_get_nombre->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                    $stmt_get_nombre->execute();
                    $nombre_usuario = $stmt_get_nombre->fetchColumn();
                }
                $success_participante_amigos = true;
        
                foreach ($idAmigos as $idAmigo) {
                    $mensaje = "El usuario {$nombre_usuario} te ha enviado una solicitud de unión a la sala {$nombre_sala}.";
                    $tipo = "Solicitud de unión a sala";
                    $stmt = $conn->prepare("INSERT INTO Notificaciones (usuario_id, remitente_id, tipo, mensaje, leida) 
                                            VALUES (:amigo_id, :sala_id, :tipo, :mensaje, 0)");
                    $stmt->bindParam(':amigo_id', $idAmigo, PDO::PARAM_STR);
                    $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                    $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);
                    $stmt->bindParam(':mensaje', $mensaje, PDO::PARAM_STR);
        
                    if (!$stmt->execute()) {
                        $success_participante_amigos = false;
                        break;
                    }
                }
                if ($success_participante && $success_participante_amigos) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Error al agregar participantes a la sala.']);
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

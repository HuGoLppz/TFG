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
        
            $query_sala = "INSERT INTO Salas (sala_id, nombre, descripcion, fecha_creacion, creador_id) 
                           VALUES (generar_id_sala(), :nombre_sala, :descripcion_sala, CURRENT_TIMESTAMP, :usuario_id)";
            $stmt_sala = $conn->prepare($query_sala);
            $stmt_sala->bindParam(':nombre_sala', $nombre_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':descripcion_sala', $descripcion_sala, PDO::PARAM_STR);
            $stmt_sala->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
        
            $success_sala = $stmt_sala->execute();
        
            if ($success_sala) {
                $query_get_sala_id = "SELECT sala_id FROM Salas WHERE creador_id = :usuario_id ORDER BY fecha_creacion DESC LIMIT 1";
                $stmt_get_sala_id = $conn->prepare($query_get_sala_id);
                $stmt_get_sala_id->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                $stmt_get_sala_id->execute();
                $sala_id = $stmt_get_sala_id->fetchColumn();
        
                if ($sala_id) {
                    $query_participante = "INSERT INTO Participantes_Salas (sala_id, usuario_id) 
                                           VALUES (:sala_id, :usuario_id)";
                    $stmt_participante = $conn->prepare($query_participante);
                    $stmt_participante->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                    $stmt_participante->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                    $success_participante = $stmt_participante->execute();
        
                    $success_participante_amigos = true;
                    foreach ($idAmigos as $idAmigo) {
                        $query_participantes = "INSERT INTO Participantes_Salas (sala_id, usuario_id) 
                                                VALUES (:sala_id, :idAmigo)";
                        $stmt_participantes = $conn->prepare($query_participantes);
                        $stmt_participantes->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                        $stmt_participantes->bindParam(':idAmigo', $idAmigo, PDO::PARAM_STR);
                        
                        if (!$stmt_participantes->execute()) {
                            $success_participante_amigos = false;
                            break; // Salir del bucle si falla la inserción de algún amigo
                        }
                    }
        
                    if ($success_participante && $success_participante_amigos) {
                        echo json_encode(['success' => true]);
                    } else {
                        echo json_encode(['success' => false, 'error' => 'Error al agregar participantes a la sala.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'error' => 'Error al obtener el ID de la sala.']);
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

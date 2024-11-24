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

        if ($_POST['action'] === 'listar_archivos') {
            $sala_id = $_POST['sala_id'];
        
            $query = "SELECT archivo_id, nombre_archivo AS nombre, ruta_archivo AS url, fecha_subida 
                      FROM Archivos_Salas 
                      WHERE sala_id = :sala_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
        
            if ($stmt->execute()) {
                $archivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
                echo json_encode([
                    "success" => true,
                    "archivos" => $archivos,
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "error" => "Error al obtener la lista de archivos.",
                ]);
            }
        
            exit;
        }
                       
        if ($_POST['action'] === 'eliminar_archivo') {
            $archivo_id = $_POST['archivo_id'];
        
            $query = "SELECT ruta_archivo FROM Archivos_Salas WHERE archivo_id = :archivo_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':archivo_id', $archivo_id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                $archivo = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($archivo) {
                    $archivo_path = $archivo['ruta_archivo'];

                    $deleteQuery = "DELETE FROM Archivos_Salas WHERE archivo_id = :archivo_id";
                    $deleteStmt = $conn->prepare($deleteQuery);
                    $deleteStmt->bindParam(':archivo_id', $archivo_id, PDO::PARAM_INT);

                    if ($deleteStmt->execute()) {
                        if (file_exists($archivo_path) && unlink($archivo_path)) {
                            echo json_encode(["success" => true]);
                        } else {
                            echo json_encode(["success" => false, "error" => "Archivo eliminado de la base de datos, pero no del sistema de archivos."]);
                        }
                    } else {
                        echo json_encode(["success" => false, "error" => "Error al eliminar el archivo de la base de datos."]);
                    }
                } else {
                    echo json_encode(["success" => false, "error" => "Archivo no encontrado."]);
                }
            } else {
                echo json_encode(["success" => false, "error" => "Error al buscar el archivo."]);
            }
            exit;
        }
                
        if ($action === 'subir_archivo') {
            $sala_id = $_POST['sala_id'] ?? '';
        
            if (empty($sala_id)) {
                echo json_encode(['success' => false, 'error' => 'ID de la sala no proporcionado.']);
                exit;
            }
        
            if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['success' => false, 'error' => 'No se pudo subir el archivo.']);
                exit;
            }
        
            $query_sala = "SELECT sala_id FROM Salas WHERE sala_id = :sala_id";
            $stmt_sala = $conn->prepare($query_sala);
            $stmt_sala->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt_sala->execute();
        
            if (!$stmt_sala->fetchColumn()) {
                echo json_encode(['success' => false, 'error' => 'Sala no encontrada.']);
                exit;
            }
        
            $ruta_directorio = "../archivos/{$sala_id}";
            if (!is_dir($ruta_directorio)) {
                if (!mkdir($ruta_directorio, 0777, true) && !is_dir($ruta_directorio)) {
                    echo json_encode(['success' => false, 'error' => 'No se pudo crear el directorio de destino.']);
                    exit;
                }
            }
        
            $archivo = $_FILES['archivo'];
            $nombre_archivo = basename($archivo['name']);
            $ruta_destino = $ruta_directorio . '/' . uniqid('archivo_', true) . '_' . $nombre_archivo;
        
            if (move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
                $query_archivo = "INSERT INTO Archivos_Salas (sala_id, usuario_id, nombre_archivo, ruta_archivo) 
                                  VALUES (:sala_id, :usuario_id, :nombre_archivo, :ruta_archivo)";
                $stmt_archivo = $conn->prepare($query_archivo);
                $stmt_archivo->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                $stmt_archivo->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                $stmt_archivo->bindParam(':nombre_archivo', $nombre_archivo, PDO::PARAM_STR);
                $stmt_archivo->bindParam(':ruta_archivo', $ruta_destino, PDO::PARAM_STR);
        
                if ($stmt_archivo->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Archivo subido correctamente.']);
                } else {
                    unlink($ruta_destino);
                    echo json_encode(['success' => false, 'error' => 'Error al registrar el archivo en la base de datos.']);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al mover el archivo al directorio de destino.']);
            }
            exit;
        }     

        if ($action === 'enviar_mensaje') {
            $sala_id = $_POST['sala_id'] ?? '';
            $mensaje = $_POST['mensaje'] ?? '';
        
            if (empty($sala_id) || empty($mensaje)) {
                echo json_encode(['success' => false, 'error' => 'Datos incompletos.']);
                exit;
            }
        
            $query_sala = "SELECT sala_id FROM Salas WHERE sala_id = :sala_id";
            $stmt_sala = $conn->prepare($query_sala);
            $stmt_sala->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt_sala->execute();
        
            if (!$stmt_sala->fetchColumn()) {
                echo json_encode(['success' => false, 'error' => 'Sala no encontrada.']);
                exit;
            }
        
            $query_mensaje = "INSERT INTO Mensajes_Salas (sala_id, usuario_id, mensaje, fecha_envio) 
                              VALUES (:sala_id, :usuario_id, :mensaje, NOW())";
            $stmt_mensaje = $conn->prepare($query_mensaje);
            $stmt_mensaje->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt_mensaje->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
            $stmt_mensaje->bindParam(':mensaje', $mensaje, PDO::PARAM_STR);
        
            if ($stmt_mensaje->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al guardar el mensaje.']);
            }
            exit;
        }        
        
        if ($_POST['action'] === 'listar_mensajes') {
            $sala_id = $_POST['salaId'] ?? '';
            
            if (empty($sala_id)) {
                echo json_encode(['success' => false, 'error' => 'ID de la sala no proporcionado.']);
                exit;
            }
            
            $query = "SELECT Mensajes_Salas.mensaje_id, Mensajes_Salas.mensaje, Mensajes_Salas.fecha_envio, 
                             Usuarios.usuario_id, Usuarios.nombre AS nombre_usuario
                      FROM Mensajes_Salas
                      JOIN Usuarios ON Mensajes_Salas.usuario_id = Usuarios.usuario_id
                      WHERE Mensajes_Salas.sala_id = :sala_id
                      ORDER BY Mensajes_Salas.fecha_envio ASC";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            
            if ($stmt->execute()) {
                $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'mensajes' => $mensajes]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al obtener los mensajes de la sala.']);
            }
            exit;
        }        

        if ($action === 'infoSala') {
            $sala_id = $_POST['sala_id'] ?? '';
        
            if (empty($sala_id)) {
                echo json_encode(['success' => false, 'error' => 'ID de la sala no proporcionado.']);
                exit;
            }
        
            $query = "SELECT Salas.sala_id, Salas.nombre, Salas.descripcion, Salas.fecha_creacion, Usuarios.nombre AS creador
                      FROM Salas
                      JOIN Usuarios ON Salas.creador_id = Usuarios.usuario_id
                      WHERE Salas.sala_id = :sala_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt->execute();
            $sala = $stmt->fetch(PDO::FETCH_ASSOC);
        
            if ($sala) {
                $query_participantes = "SELECT Usuarios.usuario_id, Usuarios.nombre
                                        FROM Participantes_Salas
                                        JOIN Usuarios ON Participantes_Salas.usuario_id = Usuarios.usuario_id
                                        WHERE Participantes_Salas.sala_id = :sala_id";
                $stmt_participantes = $conn->prepare($query_participantes);
                $stmt_participantes->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                $stmt_participantes->execute();
                $participantes = $stmt_participantes->fetchAll(PDO::FETCH_ASSOC);
        
                echo json_encode(['success' => true, 'sala' => $sala, 'participantes' => $participantes]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Sala no encontrada.']);
            }
            exit;
        }
        
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
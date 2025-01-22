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

            $query = "SELECT sala_id, archivo_id, nombre_archivo AS nombre, ruta_archivo AS url, fecha_subida 
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

        if ($_POST['action'] === 'insertar_tarea') {
            $sala_id = $_POST['id'];
            $titulo = $_POST['titulo'];
            $descripcion = $_POST['descripcion'];
            $fecha_entrega = $_POST['fecha_entrega'];

            $sql = "INSERT INTO Tareas_Sala (titulo, descripcion, fecha_entrega, sala_id, usuario_id) 
                    VALUES (:titulo, :descripcion, :fecha_entrega, :sala_id, :usuario_id)";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
            $stmt->bindParam(':titulo', $titulo, PDO::PARAM_STR);
            $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
            $stmt->bindParam(':fecha_entrega', $fecha_entrega);
            $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $success = $stmt->execute();
            echo json_encode(['success' => $success]);
            exit;
        }

        if ($_POST['action'] === 'listar_tareas') {
            $sala_id = $_POST['sala_id'];
            $sql = "SELECT *
                    FROM Tareas_Sala 
                    WHERE sala_id = :sala_id 
                    ORDER BY fecha_entrega DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
            $stmt->execute();
            $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($tareas) {
                echo json_encode(["success" => true, "tareas" => $tareas]);
            } else {
                echo json_encode(["success" => false, "error" => "No se encontraron tareas."]);
            }
            exit;
        }

        if ($_POST['action'] === 'eliminar_tarea') {
            $tarea_id = $_POST['tarea_id'];

            try {
                $sql = "DELETE FROM Tareas_Sala WHERE tarea_sala_id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":id", $tarea_id, PDO::PARAM_INT);
                $stmt->execute();

                echo json_encode([
                    "success" => true,
                    "message" => "Tarea eliminada correctamente."
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Error al eliminar la tarea: " . $e->getMessage()
                ]);
            }
            exit;
        }

        if ($_POST['action'] === 'completar_tarea') {
            $id_tarea = $_POST['id_tarea'];
            $nota = $_POST['nota'];
            $id_sala = $_POST['id_sala'];
        
            $query_tarea = "SELECT * FROM Tareas_Sala WHERE tarea_sala_id = ?";
            $stmt = $conn->prepare($query_tarea);
            $stmt->bindParam(1, $id_tarea, PDO::PARAM_INT);
            $stmt->execute();
            $tarea = $stmt->fetch(PDO::FETCH_ASSOC);
        
            if (!$tarea) {
                echo json_encode(['error' => 'Tarea no encontrada.']);
                exit;
            }
        
            $query_delete = "DELETE FROM Tareas_Sala WHERE tarea_sala_id = ?";
            $stmt = $conn->prepare($query_delete);
            $stmt->bindParam(1, $id_tarea, PDO::PARAM_INT);
            $stmt->execute();
        
            $query_participantes = "SELECT usuario_id, asignatura FROM Participantes_Salas WHERE sala_id = ?";
            $stmt = $conn->prepare($query_participantes);
            $stmt->bindParam(1, $id_sala, PDO::PARAM_STR);
            $stmt->execute();
            $participantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
            $query_insert_tarea = "INSERT INTO Tareas (usuario_id, titulo, descripcion, fecha_creacion, fecha_entrega, asignatura, tipo_actividad, urgencia, estado) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt_tarea = $conn->prepare($query_insert_tarea);
            $query_insert_calificacion = "INSERT INTO Calificaciones (usuario_id, tarea_id, asignatura, calificacion) 
                                          VALUES (?, ?, ?, ?)";
            $stmt_calificacion = $conn->prepare($query_insert_calificacion);
            foreach ($participantes as $participante) {
                $usuario_id = $participante['usuario_id'];
                $asignatura = $participante['asignatura'];
        
                $stmt_tarea->execute([
                    $usuario_id,
                    $tarea['titulo'],
                    $tarea['descripcion'],
                    $tarea['fecha_creacion'],
                    $tarea['fecha_entrega'],
                    $asignatura,
                    'completada',
                    'media',
                    'completada'
                ]);
                $nuevo_tarea_id = $conn->lastInsertId();
                $stmt_calificacion->execute([
                    $usuario_id,
                    $nuevo_tarea_id,
                    $asignatura,
                    $nota
                ]);
            }     
            $stmt_tarea->closeCursor();
            $stmt_calificacion->closeCursor();
            $conn = null;
        
            echo json_encode(['success' => 'Tarea completada y datos actualizados.']);
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

            $sala_id1 = str_replace('#', '', $sala_id);

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

            $ruta_directorio = "../archivos/{$sala_id1}";
            if (!is_dir($ruta_directorio)) {
                if (!mkdir($ruta_directorio, 0777, true) && !is_dir($ruta_directorio)) {
                    echo json_encode(['success' => false, 'error' => 'No se pudo crear el directorio de destino.']);
                    exit;
                }
            }

            $archivo = $_FILES['archivo'];
            $nombre_archivo = basename($archivo['name']);
            $ruta_destino = $ruta_directorio . '/' . $nombre_archivo;

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

                foreach ($mensajes as &$mensaje) {
                    if ($mensaje['usuario_id'] == $usuario_id) {
                        $mensaje['nombre_usuario'] = 'Yo';
                    }
                }

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

            $query = "SELECT Salas.sala_id, Salas.nombre, Salas.descripcion, Salas.fecha_creacion, Usuarios.nombre AS creador, Usuarios.foto_perfil 
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
            $asignatura = $_POST['asignatura'] ?? [];

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
                $query_participante = "INSERT INTO Participantes_Salas (sala_id, usuario_id, administrador, asignatura) 
                                       VALUES (:sala_id, :usuario_id, 1, :asignatura)";
                $stmt_participante = $conn->prepare($query_participante);
                $stmt_participante->bindParam(':sala_id', $sala_id, PDO::PARAM_STR);
                $stmt_participante->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
                $stmt_participante->bindParam(':asignatura', $asignatura, PDO::PARAM_STR);
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

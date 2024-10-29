<?php
header('Content-Type: application/json');
require_once 'db.php';

$conn = conectar();

if (!$conn) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $query = "SELECT tarea_id, titulo, descripcion, fecha_entrega FROM tareas WHERE estado = 'pendiente'";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tareas);
        exit;

    } elseif ($method === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'completar') {
            $tarea_id = $_POST['tarea_id'] ?? null;

            if ($tarea_id) {
                $query = "UPDATE tareas SET estado = 'completada' WHERE tarea_id = :tarea_id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':tarea_id', $tarea_id, PDO::PARAM_INT);
                $success = $stmt->execute();

                echo json_encode(['success' => $success]);
            } else {
                echo json_encode(['success' => false, 'error' => 'ID de tarea no proporcionado.']);
            }
            exit;

        } elseif ($action === 'crear') {
            $titulo = $_POST['titulo'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $fecha_entrega = $_POST['fecha_entrega'] ?? '';
            $asignatura = $_POST['asignatura'] ?? '';
            $tipo_actividad = $_POST['tipo_actividad'] ?? '';
            $urgencia = $_POST['urgencia'] ?? '';

            $query = "INSERT INTO tareas (titulo, descripcion, fecha_entrega, asignatura, tipo_actividad, urgencia, estado) 
                      VALUES (:titulo, :descripcion, :fecha_entrega, :asignatura, :tipo_actividad, :urgencia, 'pendiente')";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':titulo', $titulo);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':fecha_entrega', $fecha_entrega);
            $stmt->bindParam(':asignatura', $asignatura);
            $stmt->bindParam(':tipo_actividad', $tipo_actividad);
            $stmt->bindParam(':urgencia', $urgencia);
            $success = $stmt->execute();

            echo json_encode(['success' => $success]);
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

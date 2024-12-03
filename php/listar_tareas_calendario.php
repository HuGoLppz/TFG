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

try { 
    $query = "SELECT 
                tarea_id, 
                titulo, 
                descripcion, 
                fecha_entrega, 
                estado 
              FROM Tareas 
              WHERE usuario_id = :usuario_id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_STR);
    $stmt->execute();
    $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transformar datos al formato FullCalendar
    $eventos = array_map(function($tarea) {
        return [
            'id' => $tarea['tarea_id'],
            'title' => $tarea['titulo'],
            'start' => $tarea['fecha_entrega'],
            'description' => $tarea['descripcion'],
            'color' => $tarea['estado'] === 'completada' ? 'green' : 'red',
        ];
    }, $tareas);

    echo json_encode(['success' => true, 'events' => $eventos]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de ejecución: ' . $e->getMessage()]);
}
?>

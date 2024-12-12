<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$action = $_POST['action'];
$duracion_trabajo = intval($_POST['duracion_trabajo']);
$duracion_descanso = intval($_POST['duracion_descanso']);
$estado = $_POST['estado'];

if ($action === 'start') {
    $query = "INSERT INTO Pomodoro (usuario_id, duracion_trabajo, duracion_descanso, estado) 
              VALUES (:usuario_id, :duracion_trabajo, :duracion_descanso, :estado)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->bindParam(':duracion_trabajo', $duracion_trabajo);
    $stmt->bindParam(':duracion_descanso', $duracion_descanso);
    $stmt->bindParam(':estado', $estado);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Pomodoro iniciado.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al iniciar el Pomodoro.']);
    }
} elseif ($action === 'update') {
    $query = "UPDATE Pomodoro 
              SET estado = :estado, ciclos = ciclos + 1
              WHERE usuario_id = :usuario_id AND estado = 'en_proceso' 
              ORDER BY pomodoro_id DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':usuario_id', $usuario_id);
    $stmt->bindParam(':estado', $estado);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Pomodoro actualizado.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al actualizar el Pomodoro.']);
    }
}
?>

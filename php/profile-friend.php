<?php
require_once 'db.php';

if (isset($_GET['usuario_id'])) {
    $id = $_GET['usuario_id'];
    $conn = conectar();
    
    if (!$conn) {
        echo json_encode(['error' => 'No se pudo establecer la conexión a la base de datos']);
        exit();
    }
    
    if(isset($_GET['obtener_perfil'])){
        $stmt = $conn->prepare("SELECT nombre, foto_perfil, descripcion, curso, estudios, usuario_id FROM Usuarios WHERE usuario_id = :id LIMIT 1");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($userData) {
            header('Content-Type: application/json');
            echo json_encode($userData);
        } else {
            echo json_encode(['error' => 'Usuario no encontrado']);
        }
    
    }

    if (isset($_GET['obtener_estadisticas'])) {  
        $query = "SELECT 
            (SELECT COUNT(*) FROM Amigos WHERE usuario_id = :id1) AS total_amigos,
            (SELECT COUNT(*) FROM Tareas WHERE usuario_id = :id2 AND estado = 'completada') AS tareas_completadas,
            (SELECT COUNT(*) FROM Tareas WHERE usuario_id = :id3 AND estado != 'completada') AS tareas_sin_completar,
            (SELECT AVG(calificacion) FROM Calificaciones WHERE usuario_id = :id4) AS media_total_asignaturas,
            (SELECT COUNT(*) FROM Participantes_Salas WHERE usuario_id = :id5) AS total_salas,
            (SELECT fecha_registro FROM Usuarios WHERE usuario_id = :id6) AS fecha_registro,
            (SELECT email FROM Usuarios WHERE usuario_id = :id7) AS correo_usuario,
            (SELECT estado FROM Pomodoro WHERE usuario_id = :id8 ORDER BY fecha_inicio DESC LIMIT 1) AS contador_pomodoro
        FROM DUAL";

        $stmt = $conn->prepare($query);
        if ($stmt) {
            $params = [':id1' => $id, ':id2' => $id, ':id3' => $id, ':id4' => $id, ':id5' => $id, ':id6' => $id, ':id7' => $id, ':id8' => $id];
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                echo json_encode(['success' => true, 'estadisticas' => $result]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No se encontraron estadísticas.']);
            }
        } else {
            echo json_encode(['error' => 'Error al preparar la consulta']);
        }
    } elseif (isset($_GET['info_notasmedias'])) {  
        $stmt = $conn->prepare("SELECT t.asignatura, AVG(c.calificacion) AS promedio_calificaciones
                                FROM Tareas t JOIN Calificaciones c 
                                ON t.tarea_id = c.tarea_id
                                WHERE c.usuario_id = :id GROUP BY t.asignatura");
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $asignaturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($asignaturas) {
            echo json_encode(['success' => true, 'medias' => $asignaturas]);
        } else {
            echo json_encode(['success' => false, 'medias' => []]);
        }
    }
}
?>
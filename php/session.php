<?php
session_start();

$response = ['auth' => false];

if (isset($_SESSION['usuario_id'])) {
    $response['auth'] = true;
    $response['usuario_id'] = $_SESSION['usuario_id'];
    $response['nombre_usuario'] = $_SESSION['nombre_usuario'];
}
echo json_encode($response);
?>

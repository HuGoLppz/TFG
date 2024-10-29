<?php
function conectar() {
    $dbname = 'study_planner';
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $charset = 'utf8';

    try {
        $connect = new PDO("mysql:host=$host;dbname=$dbname;charset=$charset", $username, $password);

        $connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $connect->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        return $connect; 

    } catch (PDOException $e) {
        echo 'Error de conexión: ' . $e->getMessage();
        return null;
    }
}
?>

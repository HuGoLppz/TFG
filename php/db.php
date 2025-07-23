<?php
function conectar() {
    /*Conexión con la bdd real*/
    
    $dbname = 'dbs13739129';
    $host = 'db5017076511.hosting-data.io';
    $username = 'dbu1665227';
    $password = 'xxxx'; 
    $charset = 'utf8';
    
    /*Conexión con la bdd local*/
    /*
    $dbname = 'study_planner';
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $charset = 'utf8';
    */
    try {
        $connect = new PDO("mysql:host=$host;port=3306;dbname=$dbname;charset=$charset", $username, $password);


        $connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $connect->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        return $connect;

    } catch (PDOException $e) {
        echo 'Error de conexión: ' . $e->getMessage();
        return null;
    }
}
?>

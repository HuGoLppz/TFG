<?php
	function conectar($db){
        try {
            $connect = new PDO("mysql:host=localhost; dbname=$db; charset=utf8", 'root', '');
        } catch (PDOException $e) {
            echo 'Error '.$e->getMessage();
        }
        return $connect;
    }
?>      
-- Eliminar la base de datos si ya existe
DROP DATABASE IF EXISTS study_planner;
CREATE DATABASE study_planner;

-- Usar la base de datos
USE study_planner;

-- Eliminar triggers y funciones si existen
DROP FUNCTION IF EXISTS generar_id_usuario;
DROP FUNCTION IF EXISTS generar_id_sala;

-- Borrar tablas si ya existen
DROP TABLE IF EXISTS Archivos_Salas;
DROP TABLE IF EXISTS Mensajes_Salas;
DROP TABLE IF EXISTS Tareas_Sala;
DROP TABLE IF EXISTS Participantes_Salas;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Calificaciones;
DROP TABLE IF EXISTS Notificaciones;
DROP TABLE IF EXISTS Pomodoro;
DROP TABLE IF EXISTS Progreso_Academico;
DROP TABLE IF EXISTS Usuarios_Asignaturas;
DROP TABLE IF EXISTS Asignaturas;
DROP TABLE IF EXISTS Tareas;
DROP TABLE IF EXISTS Amigos;
DROP TABLE IF EXISTS Usuarios;

-- USUARIOS
CREATE TABLE Usuarios (
    usuario_id VARCHAR(9) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    foto_perfil TEXT,
    descripcion TEXT,
    curso VARCHAR(100),
    estudios VARCHAR(255),
    privacidad BOOLEAN DEFAULT FALSE, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AMIGOS O COMPAÑEROS
CREATE TABLE Amigos (
    usuario_id VARCHAR(9),
    amigo_id VARCHAR(9),
    fecha_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, amigo_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CREACIÓN DE ASIGNATURAS
CREATE TABLE Asignaturas (
    asignatura_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_asignatura VARCHAR(100) NOT NULL,
    color varchar(7),
    descripcion TEXT
);

-- RELACIÓN MUCHOS A MUCHOS ENTRE USUARIOS Y ASIGNATURAS
CREATE TABLE Usuarios_Asignaturas (
    usuario_id VARCHAR(9),
    asignatura_id INT,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, asignatura_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES Asignaturas(asignatura_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CREACIÓN DE TAREAS
CREATE TABLE Tareas (
    tarea_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATE NOT NULL,
    asignatura VARCHAR(100),
    tipo_actividad VARCHAR(50), 
    urgencia VARCHAR(20), 
    estado VARCHAR(20) DEFAULT 'pendiente', 
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- REGISTRO DE CALIFICACIONES
CREATE TABLE Calificaciones (
    calificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    tarea_id INT,
    asignatura VARCHAR(100) NOT NULL,
    calificacion DECIMAL(5, 2) CHECK (calificacion >= 0 AND calificacion <= 10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tarea_id) REFERENCES Tareas(tarea_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CREACIÓN DE SALAS DE TRABAJO GRUPALES
CREATE TABLE Salas (
    sala_id VARCHAR(9) PRIMARY KEY, 
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creador_id VARCHAR(9),
    FOREIGN KEY (creador_id) REFERENCES Usuarios(usuario_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PARTICIPANTES DE LAS SALAS DE TRABAJO
CREATE TABLE Participantes_Salas (
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sala_id, usuario_id),
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- TAREAS ASIGNADAS A LOS PARTICIPANTES DE LAS SALAS
CREATE TABLE Tareas_Sala (
    tarea_sala_id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CHAT GRUPAL DE LAS SALAS
CREATE TABLE Mensajes_Salas (
    mensaje_id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- BIBLIOTECA DE ARCHIVOS DE LAS SALAS
CREATE TABLE Archivos_Salas (
    archivo_id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- NOTIFICACIONES Y RECORDATORIOS
CREATE TABLE Notificaciones (
    notificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    remitente_id VARCHAR(9),
    usuario_id VARCHAR(9),
    tipo VARCHAR(50), 
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CRONÓMETRO Y TÉCNICA POMODORO
CREATE TABLE Pomodoro (
    pomodoro_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_trabajo INT NOT NULL, 
    duracion_descanso INT NOT NULL, 
    ciclos INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'en_proceso', 
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- VISUALIZACIÓN DE MEDIAS Y PROGRESO ACADÉMICO
CREATE TABLE Progreso_Academico (
    progreso_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    asignatura VARCHAR(100),
    media_calificaciones DECIMAL(5, 2),
    tareas_completadas INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Generación de ID de usuario
DELIMITER //
CREATE FUNCTION generar_id_usuario() 
RETURNS VARCHAR(9)
DETERMINISTIC
BEGIN
    DECLARE nuevo_id VARCHAR(9);
    DECLARE existe INT DEFAULT 1;

    WHILE existe DO
        SET nuevo_id = CONCAT('#', 
                    CHAR(FLOOR(65 + RAND() * 26)),
                    CHAR(FLOOR(65 + RAND() * 26)),
                    CHAR(FLOOR(65 + RAND() * 26)),
                    CHAR(FLOOR(65 + RAND() * 26)),
                    FLOOR(RAND() * 10),
                    FLOOR(RAND() * 10),
                    FLOOR(RAND() * 10),
                    FLOOR(RAND() * 10));
        SELECT COUNT(*) INTO existe FROM Usuarios WHERE usuario_id = nuevo_id;
    END WHILE;
    RETURN nuevo_id;
END //
DELIMITER ;

-- Generación de ID de sala
DELIMITER //
CREATE FUNCTION generar_id_sala() 
RETURNS VARCHAR(9)
DETERMINISTIC
BEGIN
    DECLARE nuevo_id VARCHAR(9);
    DECLARE existe INT DEFAULT 1;

    WHILE existe DO
        SET nuevo_id = CONCAT('#', 
                    CHAR(FLOOR(65 + RAND() * 26)), 
                    FLOOR(RAND() * 10), 
                    CHAR(FLOOR(65 + RAND() * 26)), 
                    FLOOR(RAND() * 10), 
                    CHAR(FLOOR(65 + RAND() * 26)), 
                    FLOOR(RAND() * 10), 
                    CHAR(FLOOR(65 + RAND() * 26)), 
                    FLOOR(RAND() * 10));
        SELECT COUNT(*) INTO existe FROM Salas WHERE sala_id = nuevo_id;
    END WHILE;
    RETURN nuevo_id;
END //
DELIMITER ;

DELIMITER //

-- Función para insertar notificación cuando falta 1 día para la entrega de una tarea
CREATE PROCEDURE generar_notificaciones_tareas()
BEGIN
    DECLARE tarea_id INT;
    DECLARE usuario_id VARCHAR(9);
    DECLARE titulo_tarea VARCHAR(255);
    
    DECLARE cursor_tareas CURSOR FOR
    SELECT tarea_id, usuario_id, titulo 
    FROM Tareas 
    WHERE DATE(fecha_entrega) = CURDATE() + INTERVAL 1 DAY;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cursor_tareas;
    leer_tareas: LOOP
        FETCH cursor_tareas INTO tarea_id, usuario_id, titulo_tarea;
        IF done THEN
            LEAVE leer_tareas;
        END IF;
        INSERT INTO Notificaciones (
            remitente_id, usuario_id, tipo, mensaje
        )
        VALUES (
            tarea_id,
            usuario_id,
            CONCAT('La entrega de "', titulo_tarea, '" es hoy'),
            CONCAT( titulo_tarea, '" debe ser entregada hoy.')
        );
    END LOOP;
    CLOSE cursor_tareas;
END //
DELIMITER ;

CREATE EVENT generar_notificaciones_diarias
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
CALL generar_notificaciones_tareas();


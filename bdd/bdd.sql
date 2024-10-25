-- Borrar la base de datos si existe y luego crearla
DROP DATABASE IF EXISTS study_planner;
CREATE DATABASE study_planner;

-- Usar la base de datos
USE study_planner;

-- Eliminar triggers y funciones si existen
DROP TRIGGER IF EXISTS actualizar_progreso_trigger;
DROP PROCEDURE IF EXISTS actualizar_progreso;
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
DROP TABLE IF EXISTS Tareas;
DROP TABLE IF EXISTS Amigos;
DROP TABLE IF EXISTS Usuarios;

-- CREACIÓN DE USUARIOS Y PERFILES
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
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
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
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- REGISTRO DE CALIFICACIONES
CREATE TABLE Calificaciones (
    calificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    tarea_id INT,
    asignatura VARCHAR(100) NOT NULL,
    calificacion DECIMAL(5, 2) CHECK (calificacion >= 0 AND calificacion <= 10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (tarea_id) REFERENCES Tareas(tarea_id) ON DELETE CASCADE
);

-- CREACIÓN DE SALAS DE TRABAJO GRUPALES
CREATE TABLE Salas (
    sala_id VARCHAR(9) PRIMARY KEY, 
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creador_id VARCHAR(9),
    FOREIGN KEY (creador_id) REFERENCES Usuarios(usuario_id) ON DELETE SET NULL
);

-- PARTICIPANTES DE LAS SALAS DE TRABAJO
CREATE TABLE Participantes_Salas (
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sala_id, usuario_id),
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
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
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- CHAT GRUPAL DE LAS SALAS
CREATE TABLE Mensajes_Salas (
    mensaje_id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- BIBLIOTECA DE ARCHIVOS DE LAS SALAS
CREATE TABLE Archivos_Salas (
    archivo_id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id VARCHAR(9),
    usuario_id VARCHAR(9),
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- NOTIFICACIONES Y RECORDATORIOS
CREATE TABLE Notificaciones (
    notificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    tipo VARCHAR(50), 
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
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
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- VISUALIZACIÓN DE MEDIAS Y PROGRESO ACADÉMICO
CREATE TABLE Progreso_Academico (
    progreso_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(9),
    asignatura VARCHAR(100),
    media_calificaciones DECIMAL(5, 2),
    tareas_completadas INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- ACTUALIZACIÓN DE PROGRESO AUTOMÁTICO DESPUÉS DE UNA CALIFICACIÓN
DELIMITER //
CREATE PROCEDURE actualizar_progreso()
BEGIN
    INSERT INTO Progreso_Academico (usuario_id, asignatura, media_calificaciones, tareas_completadas, fecha_actualizacion)
    VALUES (NEW.usuario_id, NEW.asignatura, NEW.calificacion, 1, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
        media_calificaciones = (Progreso_Academico.media_calificaciones * Progreso_Academico.tareas_completadas + NEW.calificacion) / (Progreso_Academico.tareas_completadas + 1),
        tareas_completadas = Progreso_Academico.tareas_completadas + 1,
        fecha_actualizacion = CURRENT_TIMESTAMP;
END //
DELIMITER ;

CREATE TRIGGER actualizar_progreso_trigger
AFTER INSERT ON Calificaciones
FOR EACH ROW
CALL actualizar_progreso();

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

        -- Verificar si el ID ya existe en la tabla Salas
        SELECT COUNT(*) INTO existe FROM Salas WHERE sala_id = nuevo_id;
    END WHILE;

    RETURN nuevo_id;
END //
DELIMITER ;
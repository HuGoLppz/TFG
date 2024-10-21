-- Borrar la base de datos si existe y luego crearla
DROP DATABASE IF EXISTS study_planner;
CREATE DATABASE study_planner;

-- Usar la base de datos
USE study_planner;

-- Eliminar triggers y funciones si existen
DROP TRIGGER IF EXISTS actualizar_progreso_trigger ON Calificaciones;
DROP FUNCTION IF EXISTS actualizar_progreso;

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
    usuario_id VARCHAR(9) PRIMARY KEY, -- Cambiado de SERIAL a VARCHAR(9)
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
    usuario_id INT,
    amigo_id INT,
    fecha_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, amigo_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- CREACIÓN DE TAREAS
CREATE TABLE Tareas (
    tarea_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATE NOT NULL,
    asignatura VARCHAR(100),
    tipo_actividad VARCHAR(50), -- trabajos, exámenes, etc.
    urgencia VARCHAR(20), -- bajo, medio, alto.
    estado VARCHAR(20) DEFAULT 'pendiente' -- pendiente, completada, eliminada.
);

-- REGISTRO DE CALIFICACIONES
CREATE TABLE Calificaciones (
    calificacion_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    tarea_id INT REFERENCES Tareas(tarea_id) ON DELETE CASCADE,
    asignatura VARCHAR(100) NOT NULL,
    calificacion NUMERIC(5, 2) CHECK (calificacion >= 0 AND calificacion <= 10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREACIÓN DE SALAS DE TRABAJO GRUPALES

CREATE TABLE Salas (
    sala_id VARCHAR(9) PRIMARY KEY, 
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creador_id VARCHAR(9) REFERENCES Usuarios(usuario_id) ON DELETE SET NULL
);


-- PARTICIPANTES DE LAS SALAS DE TRABAJO
CREATE TABLE Participantes_Salas (
    sala_id INT,
    usuario_id INT,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sala_id, usuario_id),
    FOREIGN KEY (sala_id) REFERENCES Salas(sala_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- TAREAS ASIGNADAS A LOS PARTICIPANTES DE LAS SALAS
CREATE TABLE Tareas_Sala (
    tarea_sala_id SERIAL PRIMARY KEY,
    sala_id INT REFERENCES Salas(sala_id) ON DELETE CASCADE,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, completada
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHAT GRUPAL DE LAS SALAS
CREATE TABLE Mensajes_Salas (
    mensaje_id SERIAL PRIMARY KEY,
    sala_id INT REFERENCES Salas(sala_id) ON DELETE CASCADE,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BIBLIOTECA DE ARCHIVOS DE LAS SALAS
CREATE TABLE Archivos_Salas (
    archivo_id SERIAL PRIMARY KEY,
    sala_id INT REFERENCES Salas(sala_id) ON DELETE CASCADE,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICACIONES Y RECORDATORIOS
CREATE TABLE Notificaciones (
    notificacion_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    tipo VARCHAR(50), -- tarea, calificación, mensaje, etc.
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRONÓMETRO Y TÉCNICA POMODORO
CREATE TABLE Pomodoro (
    pomodoro_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_trabajo INT NOT NULL, -- duración en minutos
    duracion_descanso INT NOT NULL, -- duración en minutos
    ciclos INT NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'en_proceso' -- en_proceso, completado
);

-- VISUALIZACIÓN DE MEDIAS Y PROGRESO ACADÉMICO
CREATE TABLE Progreso_Academico (
    progreso_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    asignatura VARCHAR(100),
    media_calificaciones NUMERIC(5, 2),
    tareas_completadas INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACTUALIZACIÓN DE PROGRESO AUTOMÁTICO DESPUÉS DE UNA CALIFICACIÓN
CREATE OR REPLACE FUNCTION actualizar_progreso() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Progreso_Academico (usuario_id, asignatura, media_calificaciones, tareas_completadas, fecha_actualizacion)
    VALUES (NEW.usuario_id, NEW.asignatura, NEW.calificacion, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (usuario_id, asignatura) DO UPDATE
    SET 
        media_calificaciones = (Progreso_Academico.media_calificaciones * Progreso_Academico.tareas_completadas + NEW.calificacion) / (Progreso_Academico.tareas_completadas + 1),
        tareas_completadas = Progreso_Academico.tareas_completadas + 1,
        fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_progreso_trigger
AFTER INSERT ON Calificaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_progreso();

CREATE OR REPLACE FUNCTION generar_id_usuario()
RETURNS VARCHAR(9) AS $$
DECLARE
    nuevo_id VARCHAR(9);
    existe BOOLEAN;
BEGIN
    LOOP
        -- Generar un ID con el formato #AAAA1111
        nuevo_id := '#' || 
                    chr(trunc(65 + random() * 26)::int) || 
                    chr(trunc(65 + random() * 26)::int) || 
                    chr(trunc(65 + random() * 26)::int) || 
                    chr(trunc(65 + random() * 26)::int) ||
                    trunc(random() * 10)::int ||
                    trunc(random() * 10)::int ||
                    trunc(random() * 10)::int ||
                    trunc(random() * 10)::int;

        -- Verificar si el ID ya existe en la tabla Usuarios
        SELECT EXISTS (SELECT 1 FROM Usuarios WHERE usuario_id = nuevo_id) INTO existe;

        -- Si no existe, retornar el nuevo ID
        EXIT WHEN NOT existe;
    END LOOP;

    RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generar_id_sala()
RETURNS VARCHAR(9) AS $$
DECLARE
    nuevo_id VARCHAR(9);
    existe BOOLEAN;
BEGIN
    LOOP
        -- Generar un ID con el formato #A1A1A1A1
        nuevo_id := '#' || 
                    chr(trunc(65 + random() * 26)::int) || 
                    trunc(random() * 10)::int ||
                    chr(trunc(65 + random() * 26)::int) || 
                    trunc(random() * 10)::int ||
                    chr(trunc(65 + random() * 26)::int) || 
                    trunc(random() * 10)::int ||
                    chr(trunc(65 + random() * 26)::int) || 
                    trunc(random() * 10)::int;

        -- Verificar si el ID ya existe en la tabla Salas
        SELECT EXISTS (SELECT 1 FROM Salas WHERE sala_id = nuevo_id) INTO existe;

        -- Si no existe, retornar el nuevo ID
        EXIT WHEN NOT existe;
    END LOOP;

    RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;



-- Script para agregar la columna precio a la tabla eventos
-- Ejecutar este script en la base de datos de eventos

-- Agregar columna precio con valor por defecto
ALTER TABLE eventos ADD COLUMN precio DECIMAL(10,2) NOT NULL DEFAULT 50.00;

-- Actualizar eventos existentes con precios por defecto según el tipo de evento
UPDATE eventos SET precio = 75.00 WHERE nombre LIKE '%Concierto%' OR nombre LIKE '%Maluma%' OR nombre LIKE '%Morat%';
UPDATE eventos SET precio = 40.00 WHERE nombre LIKE '%Teatro%' OR nombre LIKE '%Obra%';
UPDATE eventos SET precio = 60.00 WHERE nombre LIKE '%Jazz%' OR nombre LIKE '%Festival%';
UPDATE eventos SET precio = 30.00 WHERE nombre LIKE '%Tecnolog%' OR nombre LIKE '%Feria%';

-- Verificar que todos los eventos tengan precio
SELECT idEvento, nombre, precio FROM eventos WHERE precio IS NULL OR precio = 0;

-- Mostrar todos los eventos con sus nuevos precios
SELECT idEvento, nombre, establecimiento, fecha, hora, capacidad, precio FROM eventos ORDER BY precio DESC;
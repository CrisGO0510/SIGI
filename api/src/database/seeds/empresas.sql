-- Seed: Crear empresas de ejemplo
-- Description: Inserta empresas de ejemplo en la base de datos
-- Nota: Ejecutar DESPUÉS de crear la tabla empresas

-- Empresa 1: Tech Solutions
INSERT INTO empresas (id, nombre, correo_contacto, direccion, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Tech Solutions S.A.',
  'contacto@techsolutions.com',
  'Av. Tecnológica 123, Ciudad de Panamá',
  NOW(),
  NOW()
);

-- Empresa 2: Innovación Digital
INSERT INTO empresas (id, nombre, correo_contacto, direccion, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Innovación Digital Corp.',
  'info@innovaciondigital.com',
  'Centro Empresarial Torre 2, Piso 5',
  NOW(),
  NOW()
);

-- Empresa 3: Servicios Empresariales
INSERT INTO empresas (id, nombre, correo_contacto, direccion, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Servicios Empresariales del Pacífico',
  'rrhh@serviciospacifico.com',
  'Zona Industrial Costa del Este',
  NOW(),
  NOW()
);

-- Consultar empresas creadas
SELECT id, nombre, correo_contacto FROM empresas;

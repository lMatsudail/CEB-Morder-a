-- Insertar usuario patronista de ejemplo
INSERT INTO users (firstname, lastname, email, password, role, phone, city, createdat, updatedat)
VALUES 
  ('María', 'García', 'maria@ejemplo.com', '$2a$10$YourHashedPasswordHere', 'patronista', '1234567890', 'Buenos Aires', NOW(), NOW()),
  ('Carlos', 'López', 'carlos@ejemplo.com', '$2a$10$YourHashedPasswordHere', 'patronista', '0987654321', 'Madrid', NOW(), NOW());

-- Obtener los IDs de los usuarios creados (asumiendo que son 1 y 2)
-- Insertar productos de ejemplo
INSERT INTO products (patronistaid, title, description, categoryid, basicprice, trainingprice, difficulty, sizes, active, createdat, updatedat)
VALUES 
  (1, 'Vestido Casual Elegante', 'Molde de vestido casual con corte elegante y ajustable', 1, 25.00, 40.00, 'Intermedio', '["XS", "S", "M", "L", "XL"]', true, NOW(), NOW()),
  (1, 'Blusa Floral Moderna', 'Blusa con diseño floral moderno y mangas ajustables', 2, 18.00, 30.00, 'Principiante', '["S", "M", "L"]', true, NOW(), NOW()),
  (2, 'Pantalón Slim Fit', 'Pantalón slim fit con bolsillos laterales', 3, 30.00, 45.00, 'Intermedio', '["28", "30", "32", "34", "36"]', true, NOW(), NOW()),
  (2, 'Falda Plisada Clásica', 'Falda plisada de corte clásico con cintura alta', 4, 22.00, 35.00, 'Intermedio', '["XS", "S", "M", "L"]', true, NOW(), NOW()),
  (1, 'Chaqueta Blazer Profesional', 'Chaqueta blazer de corte profesional para oficina', 5, 45.00, 60.00, 'Avanzado', '["S", "M", "L", "XL"]', true, NOW(), NOW());

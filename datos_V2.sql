-- 1. Insertar datos en la tabla Usuarios (6 registros: 3 vendedores y 3 compradores)
INSERT INTO Usuarios (username, email, password) VALUES
--vendedor  
  ('jhernandaez', 'jhernandez@gmail.com', '1234'),
  ('msanchez', 'msanchez@gmail.com', '1234'),
  ('rvaca', 'rvaca@gmail.com', '1234'),
  ('achavez', 'achavez@gmail.com', '1234'),
--comprdor
  ('etenelema', 'etenelema@gmail.com', '1234'),
  ('lallison', 'lallison@gmail.com', '1234'),
  ('dtorres', 'dtorres@gmail.com', '1234');

-- 2. Insertar datos en la tabla Vendedores (se asume que los usuarios con id 1, 2 y 3 serán vendedores)
INSERT INTO Vendedores (id_vendedor) VALUES
  (1),
  (2),
  (3);

-- 3. Insertar datos en la tabla Compradores (se asume que los usuarios con id 4, 5 y 6 serán compradores)
INSERT INTO Compradores (id_comprador) VALUES
  (4),
  (5),
  (6);

-- 4. Insertar datos en la tabla Autos (cada auto publicado por un vendedor)
INSERT INTO Autos (id_vendedor, marca, modelo, año, precio_base, estado)
VALUES
  (1, 'Toyota', 'Corolla', 2018, 10000.00, 'disponible'),
  (2, 'Honda', 'Civic', 2020, 15000.00, 'disponible'),
  (3, 'Ford', 'Fusion', 2019, 12000.00, 'disponible');

-- 5. Insertar datos en la tabla Subastas (cada subasta creada por un vendedor)
INSERT INTO Subastas (id_vendedor, fecha_inicio, fecha_fin, estado)
VALUES
  (1, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'activa'),
  (2, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'activa'),
  (3, NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'activa');

-- 6. Insertar datos en la tabla SubastaAutos (relaciona cada subasta con un auto)
INSERT INTO SubastaAutos (id_subasta, id_auto)
VALUES
  (1, 1),
  (2, 2),
  (3, 3);

-- 7. Insertar datos en la tabla Pujas (realizadas por compradores para los autos en subasta)
INSERT INTO Pujas (id_subasta_auto, id_comprador, monto)
VALUES
  (1, 4, 11000.00),
  (2, 5, 16000.00),
  (3, 6, 12500.00);

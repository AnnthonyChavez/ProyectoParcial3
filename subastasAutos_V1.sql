-- Elimina las tablas si ya existen (en el orden correcto por las restricciones de clave foránea)
DROP TABLE IF EXISTS Pujas;
DROP TABLE IF EXISTS SubastaAutos;
DROP TABLE IF EXISTS Subastas;
DROP TABLE IF EXISTS Autos;
DROP TABLE IF EXISTS Usuarios;

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('comprador', 'vendedor', 'administrador') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- Tabla de Autos
CREATE TABLE Autos (
    id_auto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año INT NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'en subasta', 'vendido') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_autos_usuario FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

-- Tabla de Subastas
CREATE TABLE Subastas (
    id_subasta INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_subastas_vendedor FOREIGN KEY (id_vendedor) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

-- Tabla intermedia SubastaAutos
CREATE TABLE SubastaAutos (
    id_subasta_auto INT AUTO_INCREMENT PRIMARY KEY,
    id_subasta INT NOT NULL,
    id_auto INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subastaautos_subasta FOREIGN KEY (id_subasta) REFERENCES Subastas(id_subasta),
    CONSTRAINT fk_subastaautos_auto FOREIGN KEY (id_auto) REFERENCES Autos(id_auto)
) ENGINE=InnoDB;

-- Tabla de Pujas
CREATE TABLE Pujas (
    id_puja INT AUTO_INCREMENT PRIMARY KEY,
    id_subasta_auto INT NOT NULL,
    id_comprador INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_puja DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_pujas_subastaauto FOREIGN KEY (id_subasta_auto) REFERENCES SubastaAutos(id_subasta_auto),
    CONSTRAINT fk_pujas_comprador FOREIGN KEY (id_comprador) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

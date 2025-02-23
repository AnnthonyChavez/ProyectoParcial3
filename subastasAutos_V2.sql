-- Eliminamos las tablas existentes en el orden correcto para evitar conflictos por claves foráneas
DROP TABLE IF EXISTS Pujas;
DROP TABLE IF EXISTS SubastaAutos;
DROP TABLE IF EXISTS Subastas;
DROP TABLE IF EXISTS Autos;
DROP TABLE IF EXISTS Compradores;
DROP TABLE IF EXISTS Vendedores;
DROP TABLE IF EXISTS Usuarios;

-- Tabla base: Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- Tabla derivada: Vendedores
CREATE TABLE Vendedores (
    id_vendedor INT PRIMARY KEY,
    -- Aquí podrías agregar campos específicos para vendedores (por ejemplo, rating, etc.)
    FOREIGN KEY (id_vendedor) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

-- Tabla derivada: Compradores
CREATE TABLE Compradores (
    id_comprador INT PRIMARY KEY,
    -- Aquí podrías agregar campos específicos para compradores
    FOREIGN KEY (id_comprador) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

-- Tabla de Autos (ahora los autos son publicados por vendedores, no por usuarios generales)
CREATE TABLE Autos (
    id_auto INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año INT NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'en subasta', 'vendido') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_autos_vendedor FOREIGN KEY (id_vendedor) REFERENCES Vendedores(id_vendedor)
) ENGINE=InnoDB;

-- Tabla de Subastas (creadas por vendedores)
CREATE TABLE Subastas (
    id_subasta INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_subastas_vendedor FOREIGN KEY (id_vendedor) REFERENCES Vendedores(id_vendedor)
) ENGINE=InnoDB;

-- Tabla intermedia para relacionar Autos con Subastas
CREATE TABLE SubastaAutos (
    id_subasta_auto INT AUTO_INCREMENT PRIMARY KEY,
    id_subasta INT NOT NULL,
    id_auto INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subastaautos_subasta FOREIGN KEY (id_subasta) REFERENCES Subastas(id_subasta),
    CONSTRAINT fk_subastaautos_auto FOREIGN KEY (id_auto) REFERENCES Autos(id_auto)
) ENGINE=InnoDB;

-- Tabla de Pujas (realizadas por compradores)
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
    CONSTRAINT fk_pujas_comprador FOREIGN KEY (id_comprador) REFERENCES Compradores(id_comprador)
) ENGINE=InnoDB;

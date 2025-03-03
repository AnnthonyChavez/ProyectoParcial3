-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-03-2025 a las 05:47:39
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db_proyectopiii`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_comprador`
--

CREATE TABLE `gp_comprador` (
  `COM_ID` int(11) NOT NULL,
  `USU_ID` int(11) NOT NULL,
  `COM_STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_comprador`
--

INSERT INTO `gp_comprador` (`COM_ID`, `USU_ID`, `COM_STATUS`) VALUES
(1, 6, 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_pujas`
--

CREATE TABLE `gp_pujas` (
  `PUJ_ID` int(11) NOT NULL,
  `SUB_ID` int(11) NOT NULL,
  `COM_ID` int(11) NOT NULL,
  `PUJ_MONTO` decimal(10,2) NOT NULL,
  `PUJ_STATUS` varchar(20) NOT NULL,
  `PUJ_FECHA_HORA` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_pujas`
--

INSERT INTO `gp_pujas` (`PUJ_ID`, `SUB_ID`, `COM_ID`, `PUJ_MONTO`, `PUJ_STATUS`, `PUJ_FECHA_HORA`) VALUES
(1, 2, 1, 15030.00, 'ACTIVO', '2025-03-01 17:36:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_rol`
--

CREATE TABLE `gp_rol` (
  `ROL_ID` int(11) NOT NULL,
  `ROL_NOMBRE` varchar(50) NOT NULL,
  `ROL_STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_rol`
--

INSERT INTO `gp_rol` (`ROL_ID`, `ROL_NOMBRE`, `ROL_STATUS`) VALUES
(1, 'ADMIN', 'ACTIVO'),
(2, 'COMPRADOR', 'ACTIVO'),
(3, 'VENDEDOR', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_subasta`
--

CREATE TABLE `gp_subasta` (
  `SUB_ID` int(11) NOT NULL,
  `SUB_FECHA_INICIO` datetime NOT NULL,
  `SUB_FECHA_FIN` datetime NOT NULL,
  `SUB_ESTADO` varchar(20) NOT NULL,
  `SUB_STATUS` varchar(20) NOT NULL,
  `VEN_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_subasta`
--

INSERT INTO `gp_subasta` (`SUB_ID`, `SUB_FECHA_INICIO`, `SUB_FECHA_FIN`, `SUB_ESTADO`, `SUB_STATUS`, `VEN_ID`) VALUES
(2, '2024-03-01 10:00:00', '2024-03-01 18:00:00', 'FINALIZADA', 'ACTIVO', 1),
(3, '2025-03-01 10:00:00', '2025-03-01 18:00:00', 'FINALIZADA', 'ACTIVO', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_subasta_vehiculo`
--

CREATE TABLE `gp_subasta_vehiculo` (
  `SUB_VEH_ID` int(11) NOT NULL,
  `SUB_ID` int(11) NOT NULL,
  `VEH_ID` int(11) NOT NULL,
  `SUB_VEH_STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_subasta_vehiculo`
--

INSERT INTO `gp_subasta_vehiculo` (`SUB_VEH_ID`, `SUB_ID`, `VEH_ID`, `SUB_VEH_STATUS`) VALUES
(1, 2, 1, 'ACTIVO'),
(2, 3, 1, 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_usuario`
--

CREATE TABLE `gp_usuario` (
  `USU_ID` int(11) NOT NULL,
  `USU_NOMBRE` varchar(100) NOT NULL,
  `USU_EMAIL` varchar(100) NOT NULL,
  `USU_PASSWORD` varchar(255) NOT NULL,
  `USU_STATUS` varchar(20) NOT NULL,
  `ROL_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_usuario`
--

INSERT INTO `gp_usuario` (`USU_ID`, `USU_NOMBRE`, `USU_EMAIL`, `USU_PASSWORD`, `USU_STATUS`, `ROL_ID`) VALUES
(3, 'Admin', 'admin@email.com', '$2a$10$uj/hUq64LDa7B9wdiq7TGuU/ztn5xnJhixRIUhBe8Jj3AlOnCrNwe', 'ACTIVO', 1),
(4, 'Jey', 'jey@gmail.com', '$2a$10$t89LgVU2DGMGSTrosz0wJO9bErmDw.SljOEv5p9bgStuGAAToT6US', 'ACTIVO', 3),
(5, 'Daniel', 'daniel@gmail.com', '$2a$10$8ob3rTSzJLVd12JXnCp4Uu1UblnRAGXBcyRlKuAS3pucdErREBc1e', 'ACTIVO', 2),
(6, 'Fernando', 'fernando@gmail.com', '$2a$10$3hg5ZD2R2UdIJT6wKFUfZ.m3PbfgYTLL5LbCKeT3/hqqxtGO9r94O', 'ACTIVO', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_vehiculo`
--

CREATE TABLE `gp_vehiculo` (
  `VEH_ID` int(11) NOT NULL,
  `VEN_ID` int(11) NOT NULL,
  `VEH_MARCA` varchar(50) NOT NULL,
  `VEH_MODELO` varchar(50) NOT NULL,
  `VEH_ANO` int(11) NOT NULL,
  `VEH_PRECIO_BASE` decimal(10,2) NOT NULL,
  `VEH_ESTADO` varchar(20) NOT NULL,
  `VEH_STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_vehiculo`
--

INSERT INTO `gp_vehiculo` (`VEH_ID`, `VEN_ID`, `VEH_MARCA`, `VEH_MODELO`, `VEH_ANO`, `VEH_PRECIO_BASE`, `VEH_ESTADO`, `VEH_STATUS`) VALUES
(1, 1, 'Toyota', 'Corolla', 2020, 15000.00, 'VENDIDO', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gp_vendedor`
--

CREATE TABLE `gp_vendedor` (
  `VEN_ID` int(11) NOT NULL,
  `USU_ID` int(11) NOT NULL,
  `VEN_STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gp_vendedor`
--

INSERT INTO `gp_vendedor` (`VEN_ID`, `USU_ID`, `VEN_STATUS`) VALUES
(1, 4, 'ACTIVO');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `gp_comprador`
--
ALTER TABLE `gp_comprador`
  ADD PRIMARY KEY (`COM_ID`),
  ADD UNIQUE KEY `USU_ID` (`USU_ID`);

--
-- Indices de la tabla `gp_pujas`
--
ALTER TABLE `gp_pujas`
  ADD PRIMARY KEY (`PUJ_ID`),
  ADD KEY `SUB_ID` (`SUB_ID`),
  ADD KEY `COM_ID` (`COM_ID`);

--
-- Indices de la tabla `gp_rol`
--
ALTER TABLE `gp_rol`
  ADD PRIMARY KEY (`ROL_ID`),
  ADD UNIQUE KEY `ROL_NOMBRE` (`ROL_NOMBRE`);

--
-- Indices de la tabla `gp_subasta`
--
ALTER TABLE `gp_subasta`
  ADD PRIMARY KEY (`SUB_ID`),
  ADD KEY `FK_SUBASTA_VENDEDOR` (`VEN_ID`);

--
-- Indices de la tabla `gp_subasta_vehiculo`
--
ALTER TABLE `gp_subasta_vehiculo`
  ADD PRIMARY KEY (`SUB_VEH_ID`),
  ADD KEY `SUB_ID` (`SUB_ID`),
  ADD KEY `VEH_ID` (`VEH_ID`);

--
-- Indices de la tabla `gp_usuario`
--
ALTER TABLE `gp_usuario`
  ADD PRIMARY KEY (`USU_ID`),
  ADD UNIQUE KEY `USU_EMAIL` (`USU_EMAIL`),
  ADD KEY `ROL_ID` (`ROL_ID`);

--
-- Indices de la tabla `gp_vehiculo`
--
ALTER TABLE `gp_vehiculo`
  ADD PRIMARY KEY (`VEH_ID`),
  ADD KEY `VEN_ID` (`VEN_ID`);

--
-- Indices de la tabla `gp_vendedor`
--
ALTER TABLE `gp_vendedor`
  ADD PRIMARY KEY (`VEN_ID`),
  ADD UNIQUE KEY `USU_ID` (`USU_ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `gp_comprador`
--
ALTER TABLE `gp_comprador`
  MODIFY `COM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gp_pujas`
--
ALTER TABLE `gp_pujas`
  MODIFY `PUJ_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gp_rol`
--
ALTER TABLE `gp_rol`
  MODIFY `ROL_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `gp_subasta`
--
ALTER TABLE `gp_subasta`
  MODIFY `SUB_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `gp_subasta_vehiculo`
--
ALTER TABLE `gp_subasta_vehiculo`
  MODIFY `SUB_VEH_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `gp_usuario`
--
ALTER TABLE `gp_usuario`
  MODIFY `USU_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `gp_vehiculo`
--
ALTER TABLE `gp_vehiculo`
  MODIFY `VEH_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gp_vendedor`
--
ALTER TABLE `gp_vendedor`
  MODIFY `VEN_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `gp_comprador`
--
ALTER TABLE `gp_comprador`
  ADD CONSTRAINT `gp_comprador_ibfk_1` FOREIGN KEY (`USU_ID`) REFERENCES `gp_usuario` (`USU_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `gp_pujas`
--
ALTER TABLE `gp_pujas`
  ADD CONSTRAINT `gp_pujas_ibfk_2` FOREIGN KEY (`COM_ID`) REFERENCES `gp_comprador` (`COM_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `gp_pujas_ibfk_3` FOREIGN KEY (`SUB_ID`) REFERENCES `gp_subasta_vehiculo` (`SUB_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `gp_subasta`
--
ALTER TABLE `gp_subasta`
  ADD CONSTRAINT `FK_SUBASTA_VENDEDOR` FOREIGN KEY (`VEN_ID`) REFERENCES `gp_vendedor` (`VEN_ID`);

--
-- Filtros para la tabla `gp_subasta_vehiculo`
--
ALTER TABLE `gp_subasta_vehiculo`
  ADD CONSTRAINT `gp_subasta_vehiculo_ibfk_1` FOREIGN KEY (`SUB_ID`) REFERENCES `gp_subasta` (`SUB_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `gp_subasta_vehiculo_ibfk_2` FOREIGN KEY (`VEH_ID`) REFERENCES `gp_vehiculo` (`VEH_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `gp_usuario`
--
ALTER TABLE `gp_usuario`
  ADD CONSTRAINT `gp_usuario_ibfk_1` FOREIGN KEY (`ROL_ID`) REFERENCES `gp_rol` (`ROL_ID`);

--
-- Filtros para la tabla `gp_vehiculo`
--
ALTER TABLE `gp_vehiculo`
  ADD CONSTRAINT `gp_vehiculo_ibfk_1` FOREIGN KEY (`VEN_ID`) REFERENCES `gp_vendedor` (`VEN_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `gp_vendedor`
--
ALTER TABLE `gp_vendedor`
  ADD CONSTRAINT `gp_vendedor_ibfk_1` FOREIGN KEY (`USU_ID`) REFERENCES `gp_usuario` (`USU_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

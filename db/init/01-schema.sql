-- ===========================================================
-- POWER SHELL COMMAND
-- ===========================================================
-- check if mariadb in installed
-- winget list | Where-Object { $_ -match 'MariaDB|MySQL' }
--
-- Search paquet name
-- winget search mariadb
-- 
-- Install Mariadb
-- winget install --id MariaDB.Server -e
--
-- Check version
-- mariadb --version
--
-- Update Mariadb
-- winget upgrade MariaDB.Server

CREATE DATABASE IF NOT EXISTS voc_db CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

USE voc_db;

CREATE TABLE
    IF NOT EXISTS word (
        id_word INT UNSIGNED NOT NULL AUTO_INCREMENT,
        original_word VARCHAR(255) NOT NULL,
        translation VARCHAR(255) NOT NULL,
        PRIMARY KEY (id_word)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'apppwd';
GRANT SELECT,INSERT,UPDATE,DELETE ON voc_db.* TO 'app'@'%';
FLUSH PRIVILEGES;
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
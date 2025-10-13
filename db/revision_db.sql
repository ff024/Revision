-- 1) Créer la base
CREATE DATABASE IF NOT EXISTS `revision_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `revision_db`;

-- 2) Tables
CREATE TABLE IF NOT EXISTS `lesson` (
  `id_lesson` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(127) NOT NULL,
  PRIMARY KEY (`id_lesson`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `word` (
  `id_word`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `word_original`    VARCHAR(255) NOT NULL,
  `word_translation` VARCHAR(255) NOT NULL,
  `fk_lesson`        INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_word`),
  KEY `idx_word_lesson` (`fk_lesson`),
  CONSTRAINT `fk_word_lesson`
    FOREIGN KEY (`fk_lesson`) REFERENCES `lesson`(`id_lesson`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- User
CREATE USER IF NOT EXISTS 'node_user'@'%' IDENTIFIED BY 'Super';
GRANT ALL PRIVILEGES ON `revision_db`.* TO 'node_user'@'%';
FLUSH PRIVILEGES;

-- Insert
INSERT INTO `lesson` (`name`) VALUES ('English Unit 1');
SET @lesson_id := LAST_INSERT_ID();

-- Insérer les mots liés à cette leçon
INSERT INTO `word` (`word_original`, `word_translation`, `fk_lesson`) VALUES
  ('dog',   'chien',         @lesson_id),
  ('cat',   'chat',          @lesson_id),
  ('racoon','raton laveur',  @lesson_id);
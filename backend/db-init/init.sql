USE photo_management_db;

CREATE TABLE `User` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `register_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `role` ENUM('USER','ADMIN') DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Photo` (
  `photo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `filename` VARCHAR(255) NOT NULL,
  `filepath` VARCHAR(512) NOT NULL,
  `thumbnail_path` VARCHAR(512),
  `upload_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `exif_time` DATETIME NULL,
  `exif_location` VARCHAR(255) NULL,
  `resolution` VARCHAR(50) NULL,
  `orientation` VARCHAR(50) NULL,
  `view_count` INT DEFAULT 0,
  `like_count` INT DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Like` (
  `user_id` INT NOT NULL,
  `photo_id` INT NOT NULL,
  `like_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `photo_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Favorite` (
  `user_id` INT NOT NULL,
  `photo_id` INT NOT NULL,
  `fav_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `photo_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Comment` (
  `comment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `photo_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `comment_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Tag` (
  `tag_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `PhotoTag` (
  `photo_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`photo_id`, `tag_id`),
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

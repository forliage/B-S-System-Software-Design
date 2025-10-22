USE photo_management_db;

CREATE TABLE `User` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `register_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `role` ENUM('USER','ADMIN') DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 你可以在这里添加一些初始数据用于测试
-- INSERT INTO `User` (username, email, password_hash) VALUES ('testuser', 'test@example.com', 'somehashedpassword');

CREATE TABLE `Photo` (
  `photo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `filename` VARCHAR(255) NOT NULL,
  `filepath` VARCHAR(512) NOT NULL,
  `upload_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Like` (
  `user_id` INT NOT NULL,
  `photo_id` INT NOT NULL,
  `like_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `photo_id`), -- 联合主键确保一个用户只能点赞一次
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 在 Photo 表中添加 like_count 字段
ALTER TABLE `Photo` ADD COLUMN `like_count` INT DEFAULT 0;

CREATE TABLE `Comment` (
  `comment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `photo_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `comment_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`photo_id`) REFERENCES `Photo`(`photo_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Database Initialization

CREATE DATABASE IF NOT EXISTS photosite;
USE photosite;

-- Users Table
CREATE TABLE IF NOT EXISTS User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  role ENUM('USER','ADMIN') DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Photos Table
CREATE TABLE IF NOT EXISTS Photo (
  photo_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(512) NOT NULL,
  thumbnail_path VARCHAR(512),
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(100),
  description TEXT,
  exif_time DATETIME,
  exif_location VARCHAR(255),
  resolution VARCHAR(50),
  orientation VARCHAR(50),
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags Table
CREATE TABLE IF NOT EXISTS Tag (
  tag_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PhotoTag relation
CREATE TABLE IF NOT EXISTS PhotoTag (
  photo_id INT,
  tag_id INT,
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES Photo(photo_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES Tag(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comments Table
CREATE TABLE IF NOT EXISTS Comment (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  photo_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT,
  comment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_id) REFERENCES Photo(photo_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Likes Table
CREATE TABLE IF NOT EXISTS `Like` (
  user_id INT,
  photo_id INT,
  like_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, photo_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES Photo(photo_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Favorites Table
CREATE TABLE IF NOT EXISTS Favorite (
  user_id INT,
  photo_id INT,
  fav_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, photo_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES Photo(photo_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

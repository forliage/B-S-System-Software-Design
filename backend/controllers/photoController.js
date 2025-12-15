const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const exifParser = require('exif-parser');
const sharp = require('sharp');

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { title, description, tags } = req.body;
        const userId = req.user.id;
        const filename = req.file.filename;
        const filepath = `/uploads/${filename}`;

        // Parse EXIF
        const buffer = fs.readFileSync(req.file.path);
        let exifTime = null;
        let exifLocation = null;
        let resolution = null;

        try {
            const parser = exifParser.create(buffer);
            const exifResult = parser.parse();
            if (exifResult.tags.DateTimeOriginal) {
                exifTime = new Date(exifResult.tags.DateTimeOriginal * 1000);
            }
            if (exifResult.tags.GPSLatitude && exifResult.tags.GPSLongitude) {
                exifLocation = `${exifResult.tags.GPSLatitude}, ${exifResult.tags.GPSLongitude}`;
            }
            if (exifResult.imageSize) {
                resolution = `${exifResult.imageSize.width}x${exifResult.imageSize.height}`;
            }
        } catch (e) {
            console.log("EXIF parse error", e);
        }

        // Insert into DB
        const [result] = await db.query(
            'INSERT INTO Photo (user_id, filename, filepath, title, description, exif_time, exif_location, resolution) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, filename, filepath, title || '', description || '', exifTime || null, exifLocation, resolution]
        );

        const photoId = result.insertId;

        // Handle Tags
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
            for (const tagName of tagList) {
                let [tagRows] = await db.query('SELECT tag_id FROM Tag WHERE name = ?', [tagName]);
                let tagId;
                if (tagRows.length > 0) {
                    tagId = tagRows[0].tag_id;
                } else {
                    const [newTag] = await db.query('INSERT INTO Tag (name) VALUES (?)', [tagName]);
                    tagId = newTag.insertId;
                }
                await db.query('INSERT IGNORE INTO PhotoTag (photo_id, tag_id) VALUES (?, ?)', [photoId, tagId]);
            }
        }

        res.status(201).json({
            photo_id: photoId,
            url: filepath,
            message: 'Photo uploaded successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPhotos = async (req, res) => {
    try {
        const { user_id, tag, keyword } = req.query;
        let sql = 'SELECT p.*, u.username FROM Photo p JOIN User u ON p.user_id = u.user_id WHERE 1=1';
        let params = [];

        if (user_id) {
            sql += ' AND p.user_id = ?';
            params.push(user_id);
        }
        if (keyword) {
            sql += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (tag) {
            sql += ' AND p.photo_id IN (SELECT pt.photo_id FROM PhotoTag pt JOIN Tag t ON pt.tag_id = t.tag_id WHERE t.name = ?)';
            params.push(tag);
        }

        sql += ' ORDER BY p.upload_time DESC';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPhotoById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT p.*, u.username FROM Photo p JOIN User u ON p.user_id = u.user_id WHERE p.photo_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

        const photo = rows[0];

        const [tags] = await db.query('SELECT t.name FROM Tag t JOIN PhotoTag pt ON t.tag_id = pt.tag_id WHERE pt.photo_id = ?', [req.params.id]);
        photo.tags = tags.map(t => t.name);

        const [comments] = await db.query('SELECT c.*, u.username FROM Comment c JOIN User u ON c.user_id = u.user_id WHERE c.photo_id = ? ORDER BY c.comment_time ASC', [req.params.id]);
        photo.comments = comments;

        const userId = req.user ? req.user.id : null;
        if (userId) {
            const [likes] = await db.query('SELECT * FROM `Like` WHERE user_id = ? AND photo_id = ?', [userId, photo.photo_id]);
            photo.isLiked = likes.length > 0;
            const [favs] = await db.query('SELECT * FROM Favorite WHERE user_id = ? AND photo_id = ?', [userId, photo.photo_id]);
            photo.isFavorited = favs.length > 0;
        }

        res.json(photo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deletePhoto = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

        const photo = rows[0];
        if (photo.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const fullPath = path.join(__dirname, '..', photo.filepath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await db.query('DELETE FROM Photo WHERE photo_id = ?', [req.params.id]);
        res.json({ message: 'Photo deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likePhoto = async (req, res) => {
    try {
        const photoId = req.params.id;
        const userId = req.user.id;

        const [likes] = await db.query('SELECT * FROM `Like` WHERE user_id = ? AND photo_id = ?', [userId, photoId]);

        if (likes.length > 0) {
            await db.query('DELETE FROM `Like` WHERE user_id = ? AND photo_id = ?', [userId, photoId]);
            await db.query('UPDATE Photo SET like_count = like_count - 1 WHERE photo_id = ?', [photoId]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO `Like` (user_id, photo_id) VALUES (?, ?)', [userId, photoId]);
            await db.query('UPDATE Photo SET like_count = like_count + 1 WHERE photo_id = ?', [photoId]);
            res.json({ liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.editPhoto = async (req, res) => {
    try {
        const { crop, grayscale, blur } = req.body;
        const photoId = req.params.id;

        const [rows] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [photoId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

        const photo = rows[0];
        if (photo.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const originalPath = path.join(__dirname, '..', photo.filepath);
        if (!fs.existsSync(originalPath)) return res.status(404).json({ error: 'File not found' });

        let image = sharp(originalPath);

        if (crop) {
            const rect = {
                left: parseInt(crop.x),
                top: parseInt(crop.y),
                width: parseInt(crop.width),
                height: parseInt(crop.height)
            };
            image = image.extract(rect);
        }

        if (grayscale) {
            image = image.grayscale();
        }

        if (blur) {
            image = image.blur(parseInt(blur) || 5);
        }

        const buffer = await image.toBuffer();
        fs.writeFileSync(originalPath, buffer);

        res.json({ message: 'Image updated successfully', url: photo.filepath + '?t=' + Date.now() });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Image processing failed' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const photoId = req.params.id;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ error: 'Content required' });

        await db.query('INSERT INTO Comment (photo_id, user_id, content) VALUES (?, ?, ?)', [photoId, userId, content]);
        res.status(201).json({ message: 'Comment added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

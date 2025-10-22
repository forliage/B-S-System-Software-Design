const db = require('../db');

// 接收标签名数组，返回标签ID数组
// 如果标签不存在，则创建新标签
exports.findOrCreateTags = async (tagNames) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const tagIds = [];
  for (const name of tagNames) {
    // 查找标签
    let [tags] = await db.query('SELECT tag_id FROM Tag WHERE name = ?', [name]);
    let tagId;

    if (tags.length > 0) {
      tagId = tags[0].tag_id;
    } else {
      // 如果不存在，创建新标签
      const [result] = await db.query('INSERT INTO Tag (name) VALUES (?)', [name]);
      tagId = result.insertId;
    }
    tagIds.push(tagId);
  }
  return tagIds;
};
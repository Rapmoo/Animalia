const pool = require('../config/database');

async function getMediaById(id) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      media_type,
      storage_key,
      file_name,
      mime_type,
      file_size,
      caption,
      description
    FROM media
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  getMediaById
};
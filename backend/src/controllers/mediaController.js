const fs = require('fs');
const path = require('path');

const mediaService = require('../services/mediaService');

// backend/uploads is the root all storage_key values are relative to.
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Resolves a DB-provided storage_key to an absolute path, refusing to
// resolve outside UPLOADS_ROOT (e.g. a storage_key containing "../..").
function resolveStoragePath(storageKey) {
  if (!storageKey) {
    return null;
  }

  const resolved = path.resolve(UPLOADS_ROOT, storageKey);

  const isInsideUploadsRoot =
    resolved === UPLOADS_ROOT ||
    resolved.startsWith(UPLOADS_ROOT + path.sep);

  return isInsideUploadsRoot ? resolved : null;
}

// GET /api/media/:id
// Streams the underlying file for a media record, honoring Range requests
// so <audio>/<video> elements can seek. Missing DB rows and missing files
// on disk are both handled as ordinary 404s instead of crashing the request.
async function streamMedia(req, res) {
  try {
    const { id } = req.params;

    const media = await mediaService.getMediaById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDIA_NOT_FOUND',
          message: 'Media record not found'
        }
      });
    }

    const filePath = resolveStoragePath(media.storage_key);

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STORAGE_KEY',
          message: 'Media storage key is invalid'
        }
      });
    }

    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      // The DB row exists but the file hasn't been uploaded to disk yet.
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDIA_FILE_MISSING',
          message: 'Media file is not available on the server'
        }
      });
    }

    const fileSize = stat.size;
    const mimeType = media.mime_type || 'application/octet-stream';
    const range = req.headers.range;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${media.file_name}"`
    );

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match && match[1] ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1;

      if (
        !match ||
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start > end ||
        start >= fileSize
      ) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).end();
      }

      const safeEnd = Math.min(end, fileSize - 1);
      const chunkSize = safeEnd - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${safeEnd}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      fs.createReadStream(filePath, { start, end: safeEnd }).pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Failed to stream media file:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MEDIA_STREAM_FAILED',
          message: 'Failed to stream media file'
        }
      });
    }
  }
}

module.exports = {
  streamMedia
};
const mediaRepository = require('../repositories/mediaRepository');

async function getMediaById(id) {
  return await mediaRepository.getMediaById(id);
}

module.exports = {
  getMediaById
};
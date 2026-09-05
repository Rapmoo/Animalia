const animalRepository = require('../repositories/animalRepository');

async function getAllAnimals() {
  return await animalRepository.getAllAnimals();
}

async function getAnimalById(id) {
  return await animalRepository.getAnimalById(id);
}
async function getPhysicalCharacteristics(animalId) {
  return await animalRepository.getPhysicalCharacteristics(animalId);
}

async function getAnimalHabitats(animalId) {
  return await animalRepository.getAnimalHabitats(animalId);
}

async function getAnimalHabitatOverview(animalId) {
  return await animalRepository.getAnimalHabitatOverview(animalId);
}

async function getAnimalRange(animalId) {
  return await animalRepository.getAnimalRange(animalId);
}

async function getAnimalDiets(animalId) {
  return await animalRepository.getAnimalDiets(animalId);
}

async function getAnimalBehavior(animalId) {
  return await animalRepository.getAnimalBehavior(animalId);
}

async function getAnimalSounds(animalId) {
  return await animalRepository.getAnimalSounds(animalId);
}

async function getAnimalReproduction(animalId) {
  return await animalRepository.getAnimalReproduction(animalId);
}

async function getAnimalLifespan(animalId) {
  return await animalRepository.getAnimalLifespan(animalId);
}

async function getAnimalConservation(animalId) {
  return await animalRepository.getAnimalConservation(animalId);
}

async function getAnimalEcologicalRole(animalId) {
  return await animalRepository.getAnimalEcologicalRole(animalId);
}

async function getAnimalInterestingFacts(animalId) {
  return await animalRepository.getAnimalInterestingFacts(animalId);
}

async function getAnimalMedia(animalId) {
  return await animalRepository.getAnimalMedia(animalId);
}

async function getAnimalNames(animalId) {
  return await animalRepository.getAnimalNames(animalId);
}

async function getAnimalBiomes(animalId) {
  return await animalRepository.getAnimalBiomes(animalId);
}

async function getAnimalFoods(animalId) {
  return await animalRepository.getAnimalFoods(animalId);
}
async function getAnimalProfile(animalId) {
  return await animalRepository.getAnimalProfile(animalId);
}


module.exports = {
  getAllAnimals,
  getAnimalById,
  getPhysicalCharacteristics,
  getAnimalHabitats,
  getAnimalHabitatOverview,
  getAnimalRange,
  getAnimalDiets,
  getAnimalBehavior,
  getAnimalSounds,
  getAnimalReproduction,
  getAnimalLifespan,
  getAnimalConservation,
  getAnimalEcologicalRole,
  getAnimalInterestingFacts,
  getAnimalMedia,
  getAnimalNames,
  getAnimalBiomes,
  getAnimalFoods,
  getAnimalProfile  
};
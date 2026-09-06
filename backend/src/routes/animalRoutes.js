const express = require('express');

const animalController = require('../controllers/animalController');

const router = express.Router();

router.get('/', animalController.getAllAnimals);

router.get(
  '/:id/physical-characteristics',
  animalController.getPhysicalCharacteristics
);

router.get(
  '/:id/habitats',
  animalController.getAnimalHabitats
);

router.get(
  '/:id/habitat-overview',
  animalController.getAnimalHabitatOverview
);

router.get(
  '/:id/range',
  animalController.getAnimalRange
);

router.get(
  '/:id/diets',
  animalController.getAnimalDiets
);

router.get(
  '/:id/behavior',
  animalController.getAnimalBehavior
);

router.get(
  '/:id/sounds',
  animalController.getAnimalSounds
);

router.get(
  '/:id/reproduction',
  animalController.getAnimalReproduction
);

router.get(
  '/:id/lifespan',
  animalController.getAnimalLifespan
);

router.get(
  '/:id/conservation',
  animalController.getAnimalConservation
);

router.get(
  '/:id/ecological-role',
  animalController.getAnimalEcologicalRole
);

router.get(
  '/:id/interesting-facts',
  animalController.getAnimalInterestingFacts
);

router.get(
  '/:id/media',
  animalController.getAnimalMedia
);

router.get(
  '/:id/names',
  animalController.getAnimalNames
);

router.get(
  '/:id/biomes',
  animalController.getAnimalBiomes
);
router.get(
  '/:id/foods',
  animalController.getAnimalFoods
);

router.get(
  '/:id/profile',
  animalController.getAnimalProfile
);

router.get('/:id', animalController.getAnimalById);

module.exports = router;
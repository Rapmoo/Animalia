const animalService = require('../services/animalService');

async function getAllAnimals(req, res) {
  try {
    const animals = await animalService.getAllAnimals();

    res.json({
      success: true,
      data: animals
    });
  } catch (error) {
    console.error('Failed to fetch animals:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMALS_FETCH_FAILED',
        message: 'Failed to fetch animals'
      }
    });
  }
}

async function getAnimalById(req, res) {
  try {
    const { id } = req.params;

    const animal = await animalService.getAnimalById(id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Failed to fetch animal:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_FETCH_FAILED',
        message: 'Failed to fetch animal'
      }
    });
  }
}
async function getPhysicalCharacteristics(req, res) {
  try {
    const { id } = req.params;

    const characteristics =
      await animalService.getPhysicalCharacteristics(id);

    if (!characteristics) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PHYSICAL_CHARACTERISTICS_NOT_FOUND',
          message: 'Physical characteristics not found'
        }
      });
    }

    res.json({
      success: true,
      data: characteristics
    });
  } catch (error) {
    console.error(
      'Failed to fetch physical characteristics:',
      error
    );

    res.status(500).json({
      success: false,
      error: {
        code: 'PHYSICAL_CHARACTERISTICS_FETCH_FAILED',
        message: 'Failed to fetch physical characteristics'
      }
    });
  }
}
async function getAnimalHabitats(req, res) {
  try {
    const { id } = req.params;

    const habitats = await animalService.getAnimalHabitats(id);

    res.json({
      success: true,
      data: habitats
    });
  } catch (error) {
    console.error('Failed to fetch animal habitats:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_HABITATS_FETCH_FAILED',
        message: 'Failed to fetch animal habitats'
      }
    });
  }
}

async function getAnimalHabitatOverview(req, res) {
  try {
    const { id } = req.params;

    const overview =
      await animalService.getAnimalHabitatOverview(id);

    if (!overview) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Failed to fetch habitat overview:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_HABITAT_OVERVIEW_FETCH_FAILED',
        message: 'Failed to fetch animal habitat overview'
      }
    });
  }
}

async function getAnimalRange(req, res) {
  try {
    const { id } = req.params;

    const ranges = await animalService.getAnimalRange(id);

    res.json({
      success: true,
      data: ranges
    });
  } catch (error) {
    console.error('Failed to fetch animal range:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_RANGE_FETCH_FAILED',
        message: 'Failed to fetch animal geographic range'
      }
    });
  }
}

async function getAnimalDiets(req, res) {
  try {
    const { id } = req.params;

    const diets = await animalService.getAnimalDiets(id);

    res.json({
      success: true,
      data: diets
    });
  } catch (error) {
    console.error('Failed to fetch animal diets:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_DIETS_FETCH_FAILED',
        message: 'Failed to fetch animal diets'
      }
    });
  }
}

async function getAnimalBehavior(req, res) {
  try {
    const { id } = req.params;

    const behavior = await animalService.getAnimalBehavior(id);

    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    console.error('Failed to fetch animal behavior:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_BEHAVIOR_FETCH_FAILED',
        message: 'Failed to fetch animal behavior'
      }
    });
  }
}

async function getAnimalSounds(req, res) {
  try {
    const { id } = req.params;

    const sounds = await animalService.getAnimalSounds(id);

    res.json({
      success: true,
      data: sounds
    });
  } catch (error) {
    console.error('Failed to fetch animal sounds:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_SOUNDS_FETCH_FAILED',
        message: 'Failed to fetch animal sounds'
      }
    });
  }
}

async function getAnimalReproduction(req, res) {
  try {
    const { id } = req.params;

    const reproduction =
      await animalService.getAnimalReproduction(id);

    if (!reproduction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: reproduction
    });
  } catch (error) {
    console.error('Failed to fetch animal reproduction:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_REPRODUCTION_FETCH_FAILED',
        message: 'Failed to fetch animal reproduction'
      }
    });
  }
}

async function getAnimalLifespan(req, res) {
  try {
    const { id } = req.params;

    const lifespan =
      await animalService.getAnimalLifespan(id);

    if (!lifespan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: lifespan
    });
  } catch (error) {
    console.error('Failed to fetch animal lifespan:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_LIFESPAN_FETCH_FAILED',
        message: 'Failed to fetch animal lifespan'
      }
    });
  }
}

async function getAnimalConservation(req, res) {
  try {
    const { id } = req.params;

    const conservation =
      await animalService.getAnimalConservation(id);

    res.json({
      success: true,
      data: conservation
    });
  } catch (error) {
    console.error('Failed to fetch animal conservation:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_CONSERVATION_FETCH_FAILED',
        message: 'Failed to fetch animal conservation records'
      }
    });
  }
}

async function getAnimalEcologicalRole(req, res) {
  try {
    const { id } = req.params;

    const roles =
      await animalService.getAnimalEcologicalRole(id);

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Failed to fetch ecological role:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_ECOLOGICAL_ROLE_FETCH_FAILED',
        message: 'Failed to fetch ecological role'
      }
    });
  }
}

async function getAnimalInterestingFacts(req, res) {
  try {
    const { id } = req.params;

    const facts =
      await animalService.getAnimalInterestingFacts(id);

    res.json({
      success: true,
      data: facts
    });
  } catch (error) {
    console.error('Failed to fetch interesting facts:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_INTERESTING_FACTS_FETCH_FAILED',
        message: 'Failed to fetch interesting facts'
      }
    });
  }
}

async function getAnimalMedia(req, res) {
  try {
    const { id } = req.params;

    const media =
      await animalService.getAnimalMedia(id);

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Failed to fetch animal media:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_MEDIA_FETCH_FAILED',
        message: 'Failed to fetch animal media'
      }
    });
  }
}

async function getAnimalNames(req, res) {
  try {
    const { id } = req.params;

    const names =
      await animalService.getAnimalNames(id);

    res.json({
      success: true,
      data: names
    });
  } catch (error) {
    console.error('Failed to fetch animal names:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_NAMES_FETCH_FAILED',
        message: 'Failed to fetch animal names'
      }
    });
  }
}

async function getAnimalBiomes(req, res) {
  try {
    const { id } = req.params;

    const biomes =
      await animalService.getAnimalBiomes(id);

    res.json({
      success: true,
      data: biomes
    });
  } catch (error) {
    console.error('Failed to fetch animal biomes:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_BIOMES_FETCH_FAILED',
        message: 'Failed to fetch animal biomes'
      }
    });
  }
}

async function getAnimalFoods(req, res) {
  try {
    const { id } = req.params;

    const foods =
      await animalService.getAnimalFoods(id);

    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Failed to fetch animal foods:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_FOODS_FETCH_FAILED',
        message: 'Failed to fetch animal foods'
      }
    });
  }
}

async function getAnimalProfile(req, res) {
  try {
    const { id } = req.params;

    const profile = await animalService.getAnimalProfile(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANIMAL_NOT_FOUND',
          message: 'Animal not found'
        }
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Failed to fetch animal profile:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'ANIMAL_PROFILE_FETCH_FAILED',
        message: 'Failed to fetch animal profile'
      }
    });
  }
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
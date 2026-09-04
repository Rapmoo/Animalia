const pool = require('../config/database');

async function getAllAnimals() {
  const result = await pool.query(`
    SELECT
      a.id,
      a.common_name,
      tn.scientific_name,
      tn.rank
    FROM animals a
    JOIN taxonomy_nodes tn
      ON a.taxonomy_node_id = tn.id
    ORDER BY a.common_name ASC;
  `);

  return result.rows;
}

async function getAnimalById(id) {
  const result = await pool.query(
    `
    WITH RECURSIVE taxonomy_path AS (
      SELECT
        tn.id,
        tn.parent_id,
        tn.name,
        tn.scientific_name,
        tn.rank
      FROM taxonomy_nodes tn
      JOIN animals a
        ON a.taxonomy_node_id = tn.id
      WHERE a.id = $1

      UNION ALL

      SELECT
        parent.id,
        parent.parent_id,
        parent.name,
        parent.scientific_name,
        parent.rank
      FROM taxonomy_nodes parent
      JOIN taxonomy_path child
        ON child.parent_id = parent.id
    )
    SELECT
      a.id,
      a.common_name,
      a.description,
      tp.id AS taxonomy_node_id,
      tp.name AS taxonomy_name,
      tp.scientific_name,
      tp.rank
    FROM animals a
    JOIN taxonomy_path tp
      ON true
    WHERE a.id = $1
    ORDER BY
      CASE tp.rank
        WHEN 'kingdom' THEN 1
        WHEN 'phylum' THEN 2
        WHEN 'class' THEN 3
        WHEN 'order' THEN 4
        WHEN 'family' THEN 5
        WHEN 'genus' THEN 6
        WHEN 'species' THEN 7
      END;
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const first = result.rows[0];

const species = result.rows.find(
  row => row.rank === 'species'
);

const animal = {
  id: first.id,
  common_name: first.common_name,
  description: first.description,
  scientific_name: species
    ? species.scientific_name
    : null,
  classification: {}
};

  // Only the standard Linnaean ranks belong in the classification
  // display; taxonomy_nodes can also hold 'domain' or 'subspecies'
  // ancestors/descendants, which are outside the requested scope.
  const CLASSIFICATION_RANKS = [
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'genus',
    'species'
  ];

  for (const row of result.rows) {
    if (!CLASSIFICATION_RANKS.includes(row.rank)) {
      continue;
    }

    animal.classification[row.rank] = {
      name: row.taxonomy_name,
      scientific_name: row.scientific_name
    };
  }

  return animal;
}

async function getPhysicalCharacteristics(animalId) {
  // Physical measurements live directly on the animals table
  // (there is no separate physical_characteristics table).
  const result = await pool.query(
    `
    SELECT
      id AS animal_id,
      common_name,
      length_min,
      length_max,
      length_unit,
      weight_min,
      weight_max,
      weight_unit,
      height_min,
      height_max,
      height_unit,
      physical_features
    FROM animals
    WHERE id = $1;
    `,
    [animalId]
  );

  return result.rows[0] || null;
}

async function getAnimalHabitats(animalId) {
  const result = await pool.query(
    `
    SELECT
      h.id,
      h.name,
      h.description
    FROM habitats h
    JOIN animal_habitats ah
      ON ah.habitat_id = h.id
    WHERE ah.animal_id = $1
    ORDER BY h.id;
    `,
    [animalId]
  );

  return result.rows;
}
async function getAnimalHabitatOverview(animalId) {
  const result = await pool.query(
    `
    SELECT
      id AS animal_id,
      common_name,
      preferred_conditions,
      habitat_description
    FROM animals
    WHERE id = $1;
    `,
    [animalId]
  );

  return result.rows[0] || null;
}

async function getAnimalRange(animalId) {
  // Note: the schema has no dedicated point-location table for animals,
  // only polygon ranges (geographic_ranges) and reference country
  // boundaries. ST_PointOnSurface derives a real point that is
  // guaranteed to fall inside each range polygon (unlike a centroid,
  // which can land outside concave shapes) so the map has a marker to
  // place per range without inventing any coordinates.
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      range_type,
      ST_AsGeoJSON(geometry)::json AS geometry,
      ST_AsGeoJSON(ST_PointOnSurface(geometry))::json AS representative_point,
      description
    FROM geographic_ranges
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}
async function getAnimalDiets(animalId) {
  const result = await pool.query(
    `
    SELECT
      d.id,
      d.name,
      d.description
    FROM diets d
    JOIN animal_diets ad
      ON ad.diet_id = d.id
    WHERE ad.animal_id = $1
    ORDER BY d.id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalBehavior(animalId) {
  const result = await pool.query(
    `
    SELECT
      id AS animal_id,
      common_name,
      feeding_behavior,
      social_structure,
      communication,
      behaviors
    FROM animals
    WHERE id = $1;
    `,
    [animalId]
  );

  return result.rows[0] || null;
}

async function getAnimalSounds(animalId) {
  const result = await pool.query(
    `
    SELECT
      s.id AS sound_id,
      s.sound_type,
      s.description,
      s.duration,
      m.id AS media_id,
      m.file_name,
      m.media_type,
      m.storage_key,
      m.mime_type,
      m.file_size,
      m.caption,
      m.description AS media_description
    FROM sounds s
    JOIN media m
      ON m.id = s.media_id
    WHERE s.animal_id = $1
    ORDER BY s.id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalReproduction(animalId) {
  const result = await pool.query(
    `
    SELECT
      id AS animal_id,
      common_name,
      reproduction_type,
      gestation_or_incubation,
      offspring_count_min,
      offspring_count_max,
      breeding_season
    FROM animals
    WHERE id = $1;
    `,
    [animalId]
  );

  return result.rows[0] || null;
}

async function getAnimalLifespan(animalId) {
  const result = await pool.query(
    `
    SELECT
      id AS animal_id,
      common_name,
      lifespan_average,
      lifespan_maximum,
      lifespan_conditions
    FROM animals
    WHERE id = $1;
    `,
    [animalId]
  );

  return result.rows[0] || null;
}

async function getAnimalConservation(animalId) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      status,
      population_trend,
      threats,
      conservation_efforts,
      source,
      recorded_at
    FROM conservation_records
    WHERE animal_id = $1
    ORDER BY recorded_at DESC, id DESC;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalEcologicalRole(animalId) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      role,
      food_web_role,
      ecosystem_impact
    FROM ecological_roles
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalInterestingFacts(animalId) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      fact
    FROM interesting_facts
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalMedia(animalId) {
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
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalNames(animalId) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      name,
      name_type
    FROM animal_names
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalBiomes(animalId) {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.name,
      b.description
    FROM animal_biomes ab
    JOIN biomes b
      ON b.id = ab.biome_id
    WHERE ab.animal_id = $1
    ORDER BY b.id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalFoods(animalId) {
  const result = await pool.query(
    `
    SELECT
      id,
      animal_id,
      food_name
    FROM animal_foods
    WHERE animal_id = $1
    ORDER BY id;
    `,
    [animalId]
  );

  return result.rows;
}

async function getAnimalProfile(animalId) {
  const [
    animal,
    names,
    physicalCharacteristics,
    habitats,
    habitatOverview,
    range,
    diets,
    foods,
    behavior,
    sounds,
    reproduction,
    lifespan,
    conservation,
    ecologicalRole,
    interestingFacts,
    media,
    biomes
  ] = await Promise.all([
    getAnimalById(animalId),
    getAnimalNames(animalId),
    getPhysicalCharacteristics(animalId),
    getAnimalHabitats(animalId),
    getAnimalHabitatOverview(animalId),
    getAnimalRange(animalId),
    getAnimalDiets(animalId),
    getAnimalFoods(animalId),
    getAnimalBehavior(animalId),
    getAnimalSounds(animalId),
    getAnimalReproduction(animalId),
    getAnimalLifespan(animalId),
    getAnimalConservation(animalId),
    getAnimalEcologicalRole(animalId),
    getAnimalInterestingFacts(animalId),
    getAnimalMedia(animalId),
    getAnimalBiomes(animalId)
  ]);

  if (!animal) {
    return null;
  }

  return {
    animal,
    names,
    physical_characteristics: physicalCharacteristics,
    habitats,
    habitat_overview: habitatOverview,
    geographic_range: range,
    diets,
    foods,
    behavior,
    sounds,
    reproduction,
    lifespan,
    conservation,
    ecological_roles: ecologicalRole,
    interesting_facts: interestingFacts,
    media,
    biomes
  };
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
-- ============================================================
-- ANIMALIA DATABASE SCHEMA
-- PostgreSQL + PostGIS
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'admin'
);

CREATE TYPE taxonomy_rank AS ENUM (
    'domain',
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'genus',
    'species',
    'subspecies'
);

CREATE TYPE media_type AS ENUM (
    'image',
    'audio'
);

CREATE TYPE range_type AS ENUM (
    'native',
    'introduced',
    'historical',
    'seasonal'
);


-- ============================================================
-- 3. USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'admin',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 4. TAXONOMY NODES
-- Reusable self-referencing taxonomy hierarchy
-- ============================================================

CREATE TABLE taxonomy_nodes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    parent_id BIGINT NULL,

    name VARCHAR(255) NOT NULL,

    scientific_name VARCHAR(255) NOT NULL,

    rank taxonomy_rank NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_taxonomy_parent
        FOREIGN KEY (parent_id)
        REFERENCES taxonomy_nodes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT uq_taxonomy_scientific_name_rank
        UNIQUE (scientific_name, rank),

    CONSTRAINT chk_taxonomy_not_self_parent
        CHECK (parent_id IS NULL OR parent_id <> id)
);


-- ============================================================
-- 5. ANIMALS
-- Scientific name/classification comes from taxonomy_nodes.
-- animals stores the public/common name.
-- ============================================================

CREATE TABLE animals (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    taxonomy_node_id BIGINT NOT NULL,

    common_name VARCHAR(255) NOT NULL,

    description TEXT,

    -- Physical characteristics
    length_min NUMERIC(10,2),
    length_max NUMERIC(10,2),
    length_unit VARCHAR(20),

    weight_min NUMERIC(10,2),
    weight_max NUMERIC(10,2),
    weight_unit VARCHAR(20),

    height_min NUMERIC(10,2),
    height_max NUMERIC(10,2),
    height_unit VARCHAR(20),

    physical_features TEXT,

    -- Habitat
    preferred_conditions TEXT,
    habitat_description TEXT,

    -- Diet
    feeding_behavior TEXT,

    -- Behavior
    social_structure TEXT,
    communication TEXT,
    behaviors TEXT,

    -- Reproduction
    reproduction_type VARCHAR(100),
    gestation_or_incubation VARCHAR(100),

    offspring_count_min INTEGER,
    offspring_count_max INTEGER,

    breeding_season TEXT,

    -- Lifespan
    lifespan_average NUMERIC(6,2),
    lifespan_maximum NUMERIC(6,2),
    lifespan_conditions TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_animal_taxonomy
        FOREIGN KEY (taxonomy_node_id)
        REFERENCES taxonomy_nodes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_length_range
        CHECK (
            length_min IS NULL
            OR length_max IS NULL
            OR length_min <= length_max
        ),

    CONSTRAINT chk_weight_range
        CHECK (
            weight_min IS NULL
            OR weight_max IS NULL
            OR weight_min <= weight_max
        ),

    CONSTRAINT chk_height_range
        CHECK (
            height_min IS NULL
            OR height_max IS NULL
            OR height_min <= height_max
        ),

    CONSTRAINT chk_offspring_range
        CHECK (
            offspring_count_min IS NULL
            OR offspring_count_max IS NULL
            OR offspring_count_min <= offspring_count_max
        ),

    CONSTRAINT chk_measurements_nonnegative
        CHECK (
            (length_min IS NULL OR length_min >= 0)
            AND
            (length_max IS NULL OR length_max >= 0)
            AND
            (weight_min IS NULL OR weight_min >= 0)
            AND
            (weight_max IS NULL OR weight_max >= 0)
            AND
            (height_min IS NULL OR height_min >= 0)
            AND
            (height_max IS NULL OR height_max >= 0)
        ),

    CONSTRAINT chk_offspring_nonnegative
        CHECK (
            (offspring_count_min IS NULL OR offspring_count_min >= 0)
            AND
            (offspring_count_max IS NULL OR offspring_count_max >= 0)
        ),

    CONSTRAINT chk_lifespan_nonnegative
        CHECK (
            (lifespan_average IS NULL OR lifespan_average >= 0)
            AND
            (lifespan_maximum IS NULL OR lifespan_maximum >= 0)
        ),

    CONSTRAINT chk_lifespan_range
        CHECK (
            lifespan_average IS NULL
            OR lifespan_maximum IS NULL
            OR lifespan_average <= lifespan_maximum
        )
);


-- ============================================================
-- 6. TAXONOMY SPECIES VALIDATION TRIGGER
--
-- Every animal MUST reference a taxonomy node whose
-- rank is 'species'.
-- ============================================================

CREATE OR REPLACE FUNCTION validate_animal_taxonomy()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    node_rank taxonomy_rank;
BEGIN

    SELECT rank
    INTO node_rank
    FROM taxonomy_nodes
    WHERE id = NEW.taxonomy_node_id;

    IF node_rank IS NULL THEN
        RAISE EXCEPTION
            'Invalid taxonomy node: % does not exist.',
            NEW.taxonomy_node_id;
    END IF;

    IF node_rank <> 'species' THEN
        RAISE EXCEPTION
            'Animal taxonomy_node_id must reference a species node. '
            'Node % has rank %.',
            NEW.taxonomy_node_id,
            node_rank;
    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_validate_animal_taxonomy
BEFORE INSERT OR UPDATE OF taxonomy_node_id
ON animals
FOR EACH ROW
EXECUTE FUNCTION validate_animal_taxonomy();


-- ============================================================
-- 7. ANIMAL NAMES
-- ============================================================

CREATE TABLE animal_names (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    name_type VARCHAR(50) NOT NULL DEFAULT 'alternative',

    CONSTRAINT fk_animal_name_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_animal_name
        UNIQUE (animal_id, name)
);


-- ============================================================
-- 8. HABITATS
-- ============================================================

CREATE TABLE habitats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT
);


-- ============================================================
-- 9. ANIMAL ↔ HABITAT
-- ============================================================

CREATE TABLE animal_habitats (
    animal_id BIGINT NOT NULL,

    habitat_id BIGINT NOT NULL,

    PRIMARY KEY (animal_id, habitat_id),

    CONSTRAINT fk_animal_habitat_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_animal_habitat_habitat
        FOREIGN KEY (habitat_id)
        REFERENCES habitats(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 10. BIOMES
-- ============================================================

CREATE TABLE biomes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT
);


-- ============================================================
-- 11. ANIMAL ↔ BIOME
-- ============================================================

CREATE TABLE animal_biomes (
    animal_id BIGINT NOT NULL,

    biome_id BIGINT NOT NULL,

    PRIMARY KEY (animal_id, biome_id),

    CONSTRAINT fk_animal_biome_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_animal_biome_biome
        FOREIGN KEY (biome_id)
        REFERENCES biomes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 12. DIETS
-- ============================================================

CREATE TABLE diets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT
);


-- ============================================================
-- 13. ANIMAL ↔ DIET
-- ============================================================

CREATE TABLE animal_diets (
    animal_id BIGINT NOT NULL,

    diet_id BIGINT NOT NULL,

    PRIMARY KEY (animal_id, diet_id),

    CONSTRAINT fk_animal_diet_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_animal_diet_diet
        FOREIGN KEY (diet_id)
        REFERENCES diets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 14. ANIMAL FOODS
-- ============================================================

CREATE TABLE animal_foods (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    food_name VARCHAR(255) NOT NULL,

    CONSTRAINT fk_animal_food_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_animal_food
        UNIQUE (animal_id, food_name)
);


-- ============================================================
-- 15. MEDIA
-- Stores metadata/reference to actual files.
-- Actual files are stored outside PostgreSQL.
-- ============================================================

CREATE TABLE media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    media_type media_type NOT NULL,

    storage_key TEXT NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    file_size BIGINT NOT NULL,

    caption TEXT,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_media_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_media_file_size
        CHECK (file_size >= 0),

    CONSTRAINT uq_media_storage_key
        UNIQUE (storage_key)
);


-- ============================================================
-- 16. SOUNDS
-- Audio-specific metadata.
-- Each sound references exactly one media record.
-- ============================================================

CREATE TABLE sounds (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    media_id BIGINT NOT NULL UNIQUE,

    sound_type VARCHAR(100) NOT NULL,

    description TEXT,

    duration NUMERIC(8,2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sound_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_sound_media
        FOREIGN KEY (media_id)
        REFERENCES media(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_sound_duration
        CHECK (
            duration IS NULL OR duration >= 0
        )
);


-- ============================================================
-- 17. GEOGRAPHIC RANGES
-- ============================================================

CREATE TABLE geographic_ranges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    range_type range_type NOT NULL DEFAULT 'native',

    geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_geographic_range_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_geographic_range_valid
        CHECK (ST_IsValid(geometry))
);


-- ============================================================
-- 18. COUNTRY BOUNDARIES
-- Supporting GIS reference data.
-- Countries are derived through spatial operations.
-- ============================================================

CREATE TABLE country_boundaries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    iso_code CHAR(2) NOT NULL,

    geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,

    CONSTRAINT uq_country_iso
        UNIQUE (iso_code),

    CONSTRAINT chk_country_geometry_valid
        CHECK (ST_IsValid(geometry))
);


-- ============================================================
-- 19. CONSERVATION HISTORY
-- ============================================================

CREATE TABLE conservation_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    status VARCHAR(100) NOT NULL,

    population_trend VARCHAR(100),

    threats TEXT,

    conservation_efforts TEXT,

    source TEXT,

    recorded_at DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conservation_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 20. ECOLOGICAL ROLES
-- ============================================================

CREATE TABLE ecological_roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    role TEXT NOT NULL,

    food_web_role TEXT,

    ecosystem_impact TEXT,

    CONSTRAINT fk_ecological_role_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 21. INTERESTING FACTS
-- ============================================================

CREATE TABLE interesting_facts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    animal_id BIGINT NOT NULL,

    fact TEXT NOT NULL,

    CONSTRAINT fk_interesting_fact_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 22. INDEXES
-- ============================================================

-- Taxonomy
CREATE INDEX idx_taxonomy_parent
    ON taxonomy_nodes(parent_id);

CREATE INDEX idx_taxonomy_rank
    ON taxonomy_nodes(rank);

CREATE INDEX idx_taxonomy_name
    ON taxonomy_nodes(name);

CREATE INDEX idx_taxonomy_scientific_name
    ON taxonomy_nodes(scientific_name);


-- Animals
CREATE INDEX idx_animals_taxonomy
    ON animals(taxonomy_node_id);

CREATE INDEX idx_animals_common_name
    ON animals(common_name);


-- Alternative names
CREATE INDEX idx_animal_names_animal
    ON animal_names(animal_id);

CREATE INDEX idx_animal_names_name
    ON animal_names(name);


-- Junction tables
CREATE INDEX idx_animal_habitats_habitat
    ON animal_habitats(habitat_id);

CREATE INDEX idx_animal_biomes_biome
    ON animal_biomes(biome_id);

CREATE INDEX idx_animal_diets_diet
    ON animal_diets(diet_id);


-- Foods
CREATE INDEX idx_animal_foods_animal
    ON animal_foods(animal_id);

CREATE INDEX idx_animal_foods_name
    ON animal_foods(food_name);


-- Sounds
CREATE INDEX idx_sounds_animal
    ON sounds(animal_id);


-- Media
CREATE INDEX idx_media_animal
    ON media(animal_id);

CREATE INDEX idx_media_type
    ON media(media_type);


-- Geographic ranges
CREATE INDEX idx_geographic_ranges_animal
    ON geographic_ranges(animal_id);

CREATE INDEX idx_geographic_ranges_geometry
    ON geographic_ranges
    USING GIST(geometry);


-- Country boundaries
CREATE INDEX idx_country_boundaries_geometry
    ON country_boundaries
    USING GIST(geometry);


-- Conservation
CREATE INDEX idx_conservation_animal
    ON conservation_records(animal_id);

CREATE INDEX idx_conservation_recorded_at
    ON conservation_records(recorded_at);


-- Ecological roles
CREATE INDEX idx_ecological_roles_animal
    ON ecological_roles(animal_id);


-- Interesting facts
CREATE INDEX idx_interesting_facts_animal
    ON interesting_facts(animal_id);


-- ============================================================
-- 23. UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


-- ============================================================
-- 24. UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER trg_taxonomy_nodes_updated_at
BEFORE UPDATE ON taxonomy_nodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER trg_animals_updated_at
BEFORE UPDATE ON animals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER trg_geographic_ranges_updated_at
BEFORE UPDATE ON geographic_ranges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- END OF ANIMALIA SCHEMA
-- ============================================================
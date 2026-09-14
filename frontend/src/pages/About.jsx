import { motion } from 'motion/react'

const cards = [
  {
    number: '01',
    title: 'Discover',
    body: 'Explore animals from different environments and learn about their unique characteristics and lifestyles.',
  },
  {
    number: '02',
    title: 'Understand',
    body: 'Learn about classification, habitats, diets, behavior, reproduction, sounds, and lifespan.',
  },
  {
    number: '03',
    title: 'Protect',
    body: 'Understand conservation challenges and the important ecological roles animals play in nature.',
  },
]

const cardGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

function About() {
  return (
    <section className="about-page">
      <motion.div
        className="about-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          ABOUT ANIMALIA
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          A digital encyclopedia
          <span> for the animal kingdom.</span>
        </motion.h1>

        <motion.p
          className="about-description"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Animalia is a digital platform designed to make exploring the
          animal kingdom easier, more informative, and more interactive.
        </motion.p>

        <motion.div
          className="about-cards"
          variants={cardGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.number}
              className="about-card"
              variants={cardVariants}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
              whileTap={{ scale: 0.99, transition: { duration: 0.15 } }}
            >
              <span>{card.number}</span>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default About
import { motion } from 'motion/react'

// Short, professional fade + slight rise used for every top-level page.
// Kept subtle on purpose: page transitions should feel instant, not showy.
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] }

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
// Définitions d'animations Framer Motion

export const messageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export const typingIndicatorVariants = {
  hidden: {
    opacity: 0.4,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
}

export const inputFocusVariants = {
  unfocused: {
    boxShadow: '0 0 0 0px rgba(16, 163, 127, 0)',
  },
  focused: {
    boxShadow: '0 0 0 3px rgba(16, 163, 127, 0.1)',
    transition: { duration: 0.2 },
  },
}

export const buttonVariants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 0 20px rgba(16, 163, 127, 0.3)',
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
}

export const sidebarVariants = {
  hidden: {
    x: -300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export const fadeInVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
}

export const slideInVariants = {
  hidden: {
    x: -20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}



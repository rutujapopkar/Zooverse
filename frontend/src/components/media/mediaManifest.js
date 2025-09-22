// Central manifest for hero slider media (images + videos)
// Videos folder path: /Videos (public)
// Images path: /images/animals
// Add or remove entries as needed; type can be 'image' or 'video'

export const heroMedia = [
  { id: 'tiger', type: 'image', src: '/images/animals/tiger.jpg', alt: 'Tiger' },
  { id: 'giraffe', type: 'image', src: '/images/animals/giraffe.jpg', alt: 'Giraffe' },
  { id: 'crocodile', type: 'image', src: '/images/animals/crocodile.jpg', alt: 'Crocodile' },
  // Add videos now that assets exist
  { id: 'lion-video', type: 'video', src: '/Videos/Lion.mp4', alt: 'Lion roaming', poster: '/images/animals/tiger.jpg' },
  { id: 'deer-video', type: 'video', src: '/Videos/Deer.mp4', alt: 'Deer herd', poster: '/images/animals/giraffe.jpg' },
  { id: 'nilgai-video', type: 'video', src: '/Videos/nilgai video.mp4', alt: 'Nilgai grazing', poster: '/images/animals/crocodile.jpg' }
]

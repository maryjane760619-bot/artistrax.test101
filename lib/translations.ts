// Spanish translations for Artistrax

export const translations = {
  en: {
    // Accessibility Toolbar
    accessibility: 'Accessibility',
    accessibilityTools: 'Accessibility Tools',
    highContrast: 'High Contrast',
    betterVisibility: 'Better visibility',
    largeText: 'Large Text',
    easierToRead: 'Easier to read',
    reducedMotion: 'Reduced Motion',
    lessAnimation: 'Less animation',
    focusHighlight: 'Focus Highlight',
    showKeyboardFocus: 'Show keyboard focus',
    textToSpeech: 'Text-to-Speech',
    readPage: 'Read Page',
    stop: 'Stop',
    settingsSavedAuto: 'Settings saved automatically',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    
    // Navigation
    home: 'Home',
    browse: 'Browse',
    artists: 'Artists',
    labels: 'Labels',
    myAccount: 'My Account',
    dashboard: 'Dashboard',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    
    // Account Types
    fan: 'Fan',
    artist: 'Artist',
    label: 'Label',
    
    // Common Actions
    upload: 'Upload',
    download: 'Download',
    play: 'Play',
    pause: 'Pause',
    buy: 'Buy',
    free: 'Free',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    search: 'Search',
    
    // Music Terms
    tracks: 'Tracks',
    albums: 'Albums',
    playlists: 'Playlists',
    favorites: 'Favorites',
    following: 'Following',
    newReleases: 'New Releases',
    topDownloads: 'Top Downloads',
    
    // Account
    email: 'Email',
    password: 'Password',
    username: 'Username',
    displayName: 'Display Name',
    bio: 'Bio',
    website: 'Website',
    
    // Subscription
    subscription: 'Subscription',
    freeTrial: 'Free Trial',
    monthly: 'Monthly',
    annual: 'Annual',
    subscribe: 'Subscribe',
    choosePlan: 'Choose Plan',
    
    // Points
    points: 'Points',
    rewardsPoints: 'Rewards Points',
    earnPoints: 'Earn Points',
    redeemPoints: 'Redeem Points',
    
    // Footer
    foundedBy: 'Founded by',
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // AI Chat
    aiAssistant: 'AI Assistant',
    aiPoweredSupport: 'AI-powered support',
    askQuestion: 'Ask a question...',
    thinking: 'Thinking...',
    
    // Common Phrases
    welcomeBack: 'Welcome back',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    contactUs: 'Contact Us',
    needHelp: 'Need help?',
  },
  
  es: {
    // Accessibility Toolbar
    accessibility: 'Accesibilidad',
    accessibilityTools: 'Herramientas de Accesibilidad',
    highContrast: 'Alto Contraste',
    betterVisibility: 'Mejor visibilidad',
    largeText: 'Texto Grande',
    easierToRead: 'Más fácil de leer',
    reducedMotion: 'Movimiento Reducido',
    lessAnimation: 'Menos animación',
    focusHighlight: 'Resaltar Enfoque',
    showKeyboardFocus: 'Mostrar enfoque de teclado',
    textToSpeech: 'Texto a Voz',
    readPage: 'Leer Página',
    stop: 'Detener',
    settingsSavedAuto: 'Configuración guardada automáticamente',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    
    // Navigation
    home: 'Inicio',
    browse: 'Explorar',
    artists: 'Artistas',
    labels: 'Sellos',
    myAccount: 'Mi Cuenta',
    dashboard: 'Panel',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    
    // Account Types
    fan: 'Fan',
    artist: 'Artista',
    label: 'Sello',
    
    // Common Actions
    upload: 'Subir',
    download: 'Descargar',
    play: 'Reproducir',
    pause: 'Pausar',
    buy: 'Comprar',
    free: 'Gratis',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    share: 'Compartir',
    search: 'Buscar',
    
    // Music Terms
    tracks: 'Pistas',
    albums: 'Álbumes',
    playlists: 'Listas de Reproducción',
    favorites: 'Favoritos',
    following: 'Siguiendo',
    newReleases: 'Nuevos Lanzamientos',
    topDownloads: 'Más Descargadas',
    
    // Account
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de Usuario',
    displayName: 'Nombre Público',
    bio: 'Biografía',
    website: 'Sitio Web',
    
    // Subscription
    subscription: 'Suscripción',
    freeTrial: 'Prueba Gratuita',
    monthly: 'Mensual',
    annual: 'Anual',
    subscribe: 'Suscribirse',
    choosePlan: 'Elegir Plan',
    
    // Points
    points: 'Puntos',
    rewardsPoints: 'Puntos de Recompensa',
    earnPoints: 'Ganar Puntos',
    redeemPoints: 'Canjear Puntos',
    
    // Footer
    foundedBy: 'Fundado por',
    allRightsReserved: 'Todos los derechos reservados',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    
    // AI Chat
    aiAssistant: 'Asistente de IA',
    aiPoweredSupport: 'Soporte con IA',
    askQuestion: 'Haz una pregunta...',
    thinking: 'Pensando...',
    
    // Common Phrases
    welcomeBack: 'Bienvenido de nuevo',
    getStarted: 'Comenzar',
    learnMore: 'Saber Más',
    contactUs: 'Contáctenos',
    needHelp: '¿Necesitas ayuda?',
  },
};

export type TranslationKey = keyof typeof translations.en;
export type Language = 'en' | 'es';

// Get translation function
export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}

// Save language preference
export function setLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }
}

// Get saved language preference
export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language;
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
    
    // Auto-detect from browser
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  }
  return 'en';
}

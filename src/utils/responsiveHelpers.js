/**
 * Responsive Design Helper Utilities
 * 
 * This file contains utility functions and constants to help implement
 * responsive design consistently across all components.
 */

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Common responsive class mappings
export const RESPONSIVE_CLASSES = {
  // Container classes
  container: 'responsive-container',
  padding: 'responsive-padding',
  paddingX: 'responsive-padding-x',
  paddingY: 'responsive-padding-y',
  margin: 'responsive-margin',
  marginX: 'responsive-margin-x',
  marginY: 'responsive-margin-y',

  // Grid classes
  grid: 'responsive-grid',
  grid2: 'responsive-grid-2',
  grid3: 'responsive-grid-3',
  productGrid: 'responsive-product-grid',
  dashboardGrid: 'responsive-dashboard-grid',

  // Typography classes
  textSm: 'responsive-text-sm',
  textBase: 'responsive-text-base',
  textLg: 'responsive-text-lg',
  textXl: 'responsive-text-xl',
  text2xl: 'responsive-text-2xl',
  text3xl: 'responsive-text-3xl',
  text4xl: 'responsive-text-4xl',
  text5xl: 'responsive-text-5xl',

  // Component classes
  card: 'responsive-card',
  cardLarge: 'responsive-card-large',
  button: 'responsive-button',
  buttonLarge: 'responsive-button-large',
  input: 'responsive-input',
  textarea: 'responsive-textarea',
  select: 'responsive-select',

  // Layout classes
  hero: 'responsive-hero',
  heroContent: 'responsive-hero-content',
  heroTitle: 'responsive-hero-title',
  heroSubtitle: 'responsive-hero-subtitle',
  dashboard: 'responsive-dashboard',
  dashboardCard: 'responsive-dashboard-card',
  sidebar: 'responsive-sidebar',
  mainContent: 'responsive-main-content',

  // Modal classes
  modal: 'responsive-modal',
  modalContent: 'responsive-modal-content',
  modalPadding: 'responsive-modal-padding',

  // Navigation classes
  nav: 'responsive-nav',
  navItem: 'responsive-nav-item',

  // Form classes
  form: 'responsive-form',

  // Table classes
  table: 'responsive-table',

  // Utility classes
  flex: 'responsive-flex',
  aspectSquare: 'responsive-aspect-square',
  aspectVideo: 'responsive-aspect-video',
  truncate: 'responsive-truncate',
  center: 'responsive-center',
  fullWidth: 'responsive-full-width',
  maxWidth: 'responsive-max-width',

  // Animation classes
  fadeIn: 'responsive-fade-in',
  slideUp: 'responsive-slide-up',

  // Visibility classes
  hideMobile: 'hide-mobile',
  showMobile: 'show-mobile',
  hideDesktop: 'hide-desktop',
  showDesktop: 'show-desktop'
};

/**
 * Get responsive class name
 * @param {string} key - The key from RESPONSIVE_CLASSES
 * @returns {string} The responsive class name
 */
export const getResponsiveClass = (key) => {
  return RESPONSIVE_CLASSES[key] || '';
};

/**
 * Combine multiple responsive classes
 * @param {...string} keys - Keys from RESPONSIVE_CLASSES
 * @returns {string} Combined class names
 */
export const combineResponsiveClasses = (...keys) => {
  return keys.map(key => getResponsiveClass(key)).filter(Boolean).join(' ');
};

/**
 * Convert legacy classes to responsive classes
 * @param {string} classNames - Existing class names
 * @returns {string} Updated class names with responsive classes
 */
export const convertToResponsive = (classNames) => {
  const conversions = {
    // Container conversions
    'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': RESPONSIVE_CLASSES.container,
    'p-6': RESPONSIVE_CLASSES.padding,
    'px-6': RESPONSIVE_CLASSES.paddingX,
    'py-6': RESPONSIVE_CLASSES.paddingY,
    
    // Grid conversions
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6': RESPONSIVE_CLASSES.grid3,
    'grid grid-cols-1 md:grid-cols-2 gap-6': RESPONSIVE_CLASSES.grid2,
    'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4': RESPONSIVE_CLASSES.productGrid,
    
    // Typography conversions
    'text-4xl sm:text-5xl lg:text-6xl': RESPONSIVE_CLASSES.text4xl,
    'text-3xl sm:text-4xl lg:text-5xl': RESPONSIVE_CLASSES.text3xl,
    'text-2xl sm:text-3xl': RESPONSIVE_CLASSES.text2xl,
    'text-xl sm:text-2xl': RESPONSIVE_CLASSES.textXl,
    'text-lg sm:text-xl': RESPONSIVE_CLASSES.textLg,
    'text-base sm:text-lg': RESPONSIVE_CLASSES.textBase,
    'text-sm sm:text-base': RESPONSIVE_CLASSES.textSm,
    
    // Button conversions
    'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg rounded-lg': RESPONSIVE_CLASSES.buttonLarge,
    'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg': RESPONSIVE_CLASSES.button,
    
    // Card conversions
    'bg-white rounded-xl shadow-md p-6 sm:p-8': RESPONSIVE_CLASSES.cardLarge,
    'bg-white rounded-lg shadow-sm p-4 sm:p-6': RESPONSIVE_CLASSES.card
  };

  let updatedClasses = classNames;
  
  // Apply conversions
  Object.entries(conversions).forEach(([oldClass, newClass]) => {
    updatedClasses = updatedClasses.replace(oldClass, newClass);
  });
  
  return updatedClasses;
};

/**
 * Check if current screen size matches breakpoint
 * @param {string} breakpoint - Breakpoint key (sm, md, lg, xl, 2xl)
 * @returns {boolean} Whether current screen matches breakpoint
 */
export const matchesBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false;
  
  const breakpointValue = BREAKPOINTS[breakpoint];
  if (!breakpointValue) return false;
  
  const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue})`);
  return mediaQuery.matches;
};

/**
 * Get current breakpoint
 * @returns {string} Current breakpoint (sm, md, lg, xl, 2xl)
 */
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'sm';
  
  const breakpoints = ['2xl', 'xl', 'lg', 'md', 'sm'];
  
  for (const bp of breakpoints) {
    if (matchesBreakpoint(bp)) {
      return bp;
    }
  }
  
  return 'sm'; // Default to smallest breakpoint
};

/**
 * Hook for responsive behavior
 * @param {Object} config - Configuration object with breakpoint-specific values
 * @returns {*} Value for current breakpoint
 */
export const useResponsiveValue = (config) => {
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Find the appropriate value for current breakpoint
  const breakpoints = ['2xl', 'xl', 'lg', 'md', 'sm'];
  
  for (const bp of breakpoints) {
    if (config[bp] !== undefined && matchesBreakpoint(bp)) {
      return config[bp];
    }
  }
  
  // Return default value or first available value
  return config.default || config[Object.keys(config)[0]];
};

/**
 * Generate responsive image props
 * @param {string} baseSrc - Base image source
 * @param {Object} sizes - Size configuration
 * @returns {Object} Props for responsive image
 */
export const getResponsiveImageProps = (baseSrc, sizes = {}) => {
  const defaultSizes = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw'
  };
  
  const imageSizes = { ...defaultSizes, ...sizes };
  
  return {
    src: baseSrc,
    sizes: Object.entries(imageSizes)
      .map(([bp, size]) => `(min-width: ${BREAKPOINTS[bp]}) ${size}`)
      .join(', '),
    loading: 'lazy',
    className: 'w-full h-auto object-cover'
  };
};

// Export default object with all utilities
export default {
  BREAKPOINTS,
  RESPONSIVE_CLASSES,
  getResponsiveClass,
  combineResponsiveClasses,
  convertToResponsive,
  matchesBreakpoint,
  getCurrentBreakpoint,
  useResponsiveValue,
  getResponsiveImageProps
};

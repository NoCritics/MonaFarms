/**
 * Performance Optimization Utilities
 * 
 * Tools for improving application performance
 */

/**
 * Debounce function
 * Delays the execution of a function until after a specified time has elapsed
 * Useful for handling fast-firing events like window resizing, scrolling, etc.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @param {boolean} immediate - If true, trigger the function on the leading edge instead of trailing
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 100, immediate = false) => {
  let timeout;
  
  return function(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
};

/**
 * Throttle function
 * Limits the execution of a function to once per specified interval
 * Useful for limiting the rate of execution (e.g., scrolling, animation frames)
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoize function
 * Caches the results of a function based on its arguments
 * Useful for expensive calculations
 * 
 * @param {Function} func - The function to memoize
 * @returns {Function} - Memoized function with caching
 */
export const memoize = (func) => {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * RequestAnimationFrame Wrapper
 * Provides a consistent way to use requestAnimationFrame with fallback
 * 
 * @param {Function} callback - The callback function to execute
 * @returns {number} - The request ID
 */
export const rafCallback = (callback) => {
  return window.requestAnimationFrame || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame || 
         function(callback) { 
           window.setTimeout(callback, 1000 / 60); 
         };
};

/**
 * CancelAnimationFrame Wrapper
 * Provides a consistent way to use cancelAnimationFrame with fallback
 * 
 * @param {number} id - The request ID to cancel
 */
export const cancelRaf = (id) => {
  (window.cancelAnimationFrame || 
   window.webkitCancelAnimationFrame || 
   window.mozCancelAnimationFrame || 
   window.clearTimeout)(id);
};

/**
 * LazyLoad Function
 * Dynamically imports a component only when needed
 * 
 * @param {Function} importFunc - The import function (e.g., () => import('./Component'))
 * @param {Function} fallback - Optional fallback component to show during loading
 * @returns {React.Component} - Lazy-loaded component
 */
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return props => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Check if browser supports WebP image format
 * @returns {Promise<boolean>} - Resolves to true if WebP is supported
 */
export const supportsWebP = async () => {
  if (!self.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  return createImageBitmap(blob).then(() => true, () => false);
};

/**
 * Detect device capabilities
 * @returns {Object} - Device capability info
 */
export const getDeviceCapabilities = () => {
  return {
    // Touch support
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Screen size category
    screen: window.innerWidth < 768 ? 'mobile' : 
            window.innerWidth < 1024 ? 'tablet' : 'desktop',
    
    // Hardware acceleration support
    hardwareAcceleration: 'WebGLRenderingContext' in window,
    
    // Reduced motion preference
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // High contrast preference
    highContrast: window.matchMedia('(prefers-contrast: more)').matches,
    
    // Dark mode preference
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    
    // Connection type (if available)
    connection: navigator.connection ? navigator.connection.effectiveType : null,
    
    // Device memory (if available)
    memory: navigator.deviceMemory || null
  };
};

/**
 * Creates a progressive loading queue for heavy resources
 * @param {Array} resources - Array of resource loading functions
 * @param {Function} onProgress - Progress callback (percent, loaded, total)
 * @param {Function} onComplete - Completion callback
 */
export const progressiveLoad = (resources, onProgress, onComplete) => {
  let loaded = 0;
  const total = resources.length;
  
  const loadNext = (index) => {
    if (index >= total) {
      onComplete && onComplete();
      return;
    }
    
    // Execute the loading function for this resource
    const loadingPromise = resources[index]();
    
    loadingPromise.then(() => {
      loaded++;
      const percent = (loaded / total) * 100;
      onProgress && onProgress(percent, loaded, total);
      
      // Small delay to allow UI to update before loading next resource
      setTimeout(() => loadNext(index + 1), 50);
    }).catch(err => {
      console.error(`Error loading resource at index ${index}:`, err);
      // Continue with next resource even if this one failed
      loadNext(index + 1);
    });
  };
  
  // Start loading the first resource
  loadNext(0);
};

/**
 * Image preloading utility
 * @param {string} src - Image source URL
 * @returns {Promise} - Resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

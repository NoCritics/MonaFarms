/**
 * Progressive Resource Loader
 * 
 * Manages prioritized loading of assets and resources
 * Improves perceived performance by loading critical resources first
 */

class ProgressiveLoader {
  constructor(options = {}) {
    this.options = {
      concurrency: 3,                // Number of concurrent resource loads
      batchDelay: 50,                // Delay between batches in ms
      priorityLevels: 3,             // Number of priority levels
      retryCount: 2,                 // Number of retries for failed loads
      retryDelay: 1000,              // Delay before retry in ms
      ...options
    };
    
    this.resources = [];
    this.loadedCount = 0;
    this.failedCount = 0;
    this.isLoading = false;
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    this.activeLoads = 0;
  }
  
  /**
   * Add a resource to the loading queue
   * 
   * @param {string} id - Unique identifier for the resource
   * @param {Function} loadFn - Function that returns a Promise for loading the resource
   * @param {number} priority - Priority level (lower number = higher priority)
   * @param {Object} metadata - Additional information about the resource
   * @returns {ProgressiveLoader} - Instance for chaining
   */
  add(id, loadFn, priority = 1, metadata = {}) {
    this.resources.push({
      id,
      loadFn,
      priority: Math.min(Math.max(0, priority), this.options.priorityLevels - 1),
      metadata,
      loaded: false,
      failed: false,
      retries: 0
    });
    
    return this;
  }
  
  /**
   * Add multiple resources at once
   * 
   * @param {Array} resourcesArray - Array of resource objects
   * @returns {ProgressiveLoader} - Instance for chaining
   */
  addBatch(resourcesArray) {
    resourcesArray.forEach(resource => {
      this.add(
        resource.id,
        resource.loadFn,
        resource.priority || 1,
        resource.metadata || {}
      );
    });
    
    return this;
  }
  
  /**
   * Set the progress callback
   * 
   * @param {Function} callback - Function to call on progress updates
   * @returns {ProgressiveLoader} - Instance for chaining
   */
  onProgress(callback) {
    this.onProgressCallback = callback;
    return this;
  }
  
  /**
   * Set the completion callback
   * 
   * @param {Function} callback - Function to call when all resources are loaded
   * @returns {ProgressiveLoader} - Instance for chaining
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
    return this;
  }
  
  /**
   * Start loading resources
   * 
   * @returns {Promise} - Resolves when all resources are loaded
   */
  start() {
    if (this.isLoading) {
      return Promise.reject(new Error('Loader already running'));
    }
    
    this.isLoading = true;
    this.loadedCount = 0;
    this.failedCount = 0;
    this.activeLoads = 0;
    
    return new Promise((resolve) => {
      // Sort resources by priority
      const sortedResources = [...this.resources].sort((a, b) => a.priority - b.priority);
      
      // Group resources by priority
      const priorityGroups = [];
      for (let i = 0; i < this.options.priorityLevels; i++) {
        priorityGroups.push(sortedResources.filter(r => r.priority === i));
      }
      
      // Process each priority group sequentially
      const processGroups = async (groupIndex = 0) => {
        if (groupIndex >= priorityGroups.length) {
          // All groups processed
          if (this.onCompleteCallback) {
            this.onCompleteCallback({
              total: this.resources.length,
              loaded: this.loadedCount,
              failed: this.failedCount,
              resources: this.resources
            });
          }
          this.isLoading = false;
          resolve({
            total: this.resources.length,
            loaded: this.loadedCount,
            failed: this.failedCount,
            resources: this.resources
          });
          return;
        }
        
        const group = priorityGroups[groupIndex];
        
        if (group.length === 0) {
          // Skip empty groups
          processGroups(groupIndex + 1);
          return;
        }
        
        // Process resources in this priority group
        await this.processResourceBatch(group);
        
        // Short delay before moving to next priority group
        setTimeout(() => {
          processGroups(groupIndex + 1);
        }, this.options.batchDelay);
      };
      
      // Start processing from highest priority group
      processGroups();
    });
  }
  
  /**
   * Process a batch of resources with load limiting
   * 
   * @param {Array} resources - Resources to process
   * @returns {Promise} - Resolves when all resources in the batch are processed
   */
  async processResourceBatch(resources) {
    return new Promise((resolve) => {
      const total = resources.length;
      let processed = 0;
      
      // Check if batch is complete
      const checkComplete = () => {
        if (processed >= total) {
          resolve();
        }
      };
      
      // Load a single resource
      const loadResource = async (resource) => {
        if (this.activeLoads >= this.options.concurrency) {
          // Too many concurrent loads, try again later
          setTimeout(() => loadResource(resource), 50);
          return;
        }
        
        this.activeLoads++;
        
        try {
          await resource.loadFn();
          resource.loaded = true;
          this.loadedCount++;
        } catch (error) {
          console.error(`Failed to load resource ${resource.id}:`, error);
          resource.failed = true;
          
          // Retry if retries remain
          if (resource.retries < this.options.retryCount) {
            resource.retries++;
            resource.failed = false;
            
            setTimeout(() => {
              this.activeLoads--;
              loadResource(resource);
            }, this.options.retryDelay);
            return;
          }
          
          this.failedCount++;
        }
        
        this.activeLoads--;
        processed++;
        
        if (this.onProgressCallback) {
          this.onProgressCallback({
            total: this.resources.length,
            loaded: this.loadedCount,
            failed: this.failedCount,
            percent: Math.round((this.loadedCount + this.failedCount) / this.resources.length * 100),
            resource
          });
        }
        
        checkComplete();
        
        // Try to load the next resource
        loadNext();
      };
      
      // Start loading resources up to concurrency limit
      let index = 0;
      const loadNext = () => {
        if (index >= total) {
          return;
        }
        
        const resource = resources[index++];
        if (resource.loaded || resource.failed) {
          processed++;
          checkComplete();
          loadNext();
        } else {
          loadResource(resource);
        }
      };
      
      // Initialize loading by starting up to concurrency limit
      for (let i = 0; i < this.options.concurrency; i++) {
        loadNext();
      }
      
      // Handle empty batch
      checkComplete();
    });
  }
  
  /**
   * Reset the loader state
   * 
   * @returns {ProgressiveLoader} - Instance for chaining
   */
  reset() {
    this.resources = [];
    this.loadedCount = 0;
    this.failedCount = 0;
    this.isLoading = false;
    this.activeLoads = 0;
    
    return this;
  }
  
  /**
   * Create common resource loading functions
   */
  static loaders = {
    // Image loader
    image: (src) => () => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    },
    
    // Script loader
    script: (src, attributes = {}) => () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        
        // Apply additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
        
        script.onload = resolve;
        script.onerror = reject;
        
        document.head.appendChild(script);
      });
    },
    
    // CSS loader
    stylesheet: (href) => () => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        
        link.onload = resolve;
        link.onerror = reject;
        
        document.head.appendChild(link);
      });
    },
    
    // Font loader
    font: (fontFamily, url, options = {}) => () => {
      return new Promise((resolve, reject) => {
        // Create @font-face CSS
        const fontFace = new FontFace(
          fontFamily,
          `url(${url})`,
          options
        );
        
        fontFace.load()
          .then(loadedFace => {
            document.fonts.add(loadedFace);
            resolve(loadedFace);
          })
          .catch(reject);
      });
    },
    
    // JSON data loader
    json: (url) => () => {
      return fetch(url).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      });
    }
  };
}

export default ProgressiveLoader;
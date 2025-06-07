interface ImageCache {
  [key: string]: {
    src: string;
    status: 'loading' | 'loaded' | 'error';
    timestamp: number;
  };
}

class ImageService {
  private cache: ImageCache = {};
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Generate a reliable fallback image based on game title
  private generateFallbackImage(title: string): string {
    const seed = encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    return `https://picsum.photos/seed/${seed}/600/337`;
  }

  // Check if an image URL is from a reliable source
  private isReliableSource(url: string): boolean {
    const reliableDomains = [
      'cdn.cloudflare.steamstatic.com',
      'images.unsplash.com',
      'picsum.photos'
    ];
    
    try {
      const urlObj = new URL(url);
      return reliableDomains.some(domain => urlObj.hostname === domain);
    } catch {
      return false;
    }
  }

  // Preload an image and handle errors
  async preloadImage(src: string, title: string): Promise<string> {
    const cacheKey = `${src}-${title}`;
    
    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      if (cached.status === 'loaded') return cached.src;
      if (cached.status === 'error') return this.generateFallbackImage(title);
    }

    // Set loading state
    this.cache[cacheKey] = {
      src,
      status: 'loading',
      timestamp: Date.now()
    };

    return new Promise((resolve) => {
      const img = new Image();
      
      const onLoad = () => {
        this.cache[cacheKey] = {
          src,
          status: 'loaded',
          timestamp: Date.now()
        };
        resolve(src);
      };

      const onError = () => {
        console.warn(`Failed to load image: ${src}`);
        const fallbackSrc = this.generateFallbackImage(title);
        
        this.cache[cacheKey] = {
          src: fallbackSrc,
          status: 'error',
          timestamp: Date.now()
        };
        
        resolve(fallbackSrc);
      };

      img.onload = onLoad;
      img.onerror = onError;
      
      // Add timeout for slow loading images
      setTimeout(() => {
        if (this.cache[cacheKey]?.status === 'loading') {
          onError();
        }
      }, 5000);

      img.src = src;
    });
  }

  // Get the best image URL for a game
  async getOptimizedImageUrl(originalSrc: string, title: string): Promise<string> {
    // If it's already a reliable source, use it
    if (this.isReliableSource(originalSrc)) {
      return this.preloadImage(originalSrc, title);
    }

    // Otherwise, use fallback
    const fallbackSrc = this.generateFallbackImage(title);
    return this.preloadImage(fallbackSrc, title);
  }

  // Clear old cache entries
  clearOldCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > this.CACHE_DURATION) {
        delete this.cache[key];
      }
    });
  }
}

export const imageService = new ImageService();

// Clean cache periodically
setInterval(() => {
  imageService.clearOldCache();
}, 5 * 60 * 1000); // Every 5 minutes

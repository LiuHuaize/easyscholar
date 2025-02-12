type TranslationCache = {
  [key: string]: {
    translation: string;
    timestamp: number;
  };
};

class TranslationCacheManager {
  private static instance: TranslationCacheManager;
  private cache: TranslationCache = {};
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时过期
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
    this.initializeCache();
  }

  private initializeCache(): void {
    if (this.isClient) {
      try {
        const savedCache = window.localStorage.getItem('translationCache');
        if (savedCache) {
          this.cache = JSON.parse(savedCache);
          this.cleanExpiredCache();
        }
      } catch (error) {
        console.error('Failed to load translation cache:', error);
        this.cache = {};
      }
    }
  }

  public static getInstance(): TranslationCacheManager {
    if (!TranslationCacheManager.instance) {
      TranslationCacheManager.instance = new TranslationCacheManager();
    }
    return TranslationCacheManager.instance;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > this.CACHE_EXPIRY) {
        delete this.cache[key];
      }
    });
    this.saveCache();
  }

  private saveCache(): void {
    if (this.isClient) {
      try {
        window.localStorage.setItem('translationCache', JSON.stringify(this.cache));
      } catch (error) {
        console.error('Failed to save translation cache:', error);
      }
    }
  }

  public getTranslation(text: string): string | null {
    const cached = this.cache[text];
    if (cached && Date.now() - cached.timestamp <= this.CACHE_EXPIRY) {
      return cached.translation;
    }
    return null;
  }

  public setTranslation(text: string, translation: string): void {
    this.cache[text] = {
      translation,
      timestamp: Date.now()
    };
    this.saveCache();
  }

  public clearCache(): void {
    this.cache = {};
    this.saveCache();
  }
}

export const translationCache = TranslationCacheManager.getInstance(); 
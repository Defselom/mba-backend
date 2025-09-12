import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext } from '@nestjs/common';

import { Cache } from 'cache-manager';

interface HttpRequest {
  method?: string;
  url?: string;
  path?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
}

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  private readonly cachedRoutes = new Map<string, string[]>();

  trackBy(context: ExecutionContext): string | undefined {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<HttpRequest>();

    // If there is no request, the incoming request is GraphQL, therefore bypass response caching.
    if (!request) {
      return undefined;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());

    // If this is not an HTTP app or if cache metadata is defined
    if (!isHttpApp || cacheMetadata) {
      return cacheMetadata;
    }

    const requestMethod = httpAdapter.getRequestMethod(request) as string;
    const isGetRequest = requestMethod === 'GET';

    // For non-GET requests, invalidate the cache
    if (!isGetRequest) {
      this.invalidateCache();

      return undefined;
    }

    // Retrieve the full URL and base URL
    const fullUrl = httpAdapter.getRequestUrl(request) as string;
    const baseUrl = fullUrl.split('?')[0];

    // Manage cache for this route
    this.updateCachedRoutes(baseUrl, fullUrl);

    return fullUrl;
  }

  /**
   * Invalidate all cache entries asynchronously
   */
  private invalidateCache(): void {
    setTimeout(() => {
      this.performCacheInvalidation().catch((error: unknown) => {
        console.error('Error invalidating cache:', error);
      });
    }, 0);
  }

  /**
   * Perform cache invalidation with typed promises
   */
  private async performCacheInvalidation(): Promise<void> {
    const cacheManager = this.cacheManager as Cache;
    const invalidationPromises: Promise<void>[] = [];

    for (const cachedUrls of this.cachedRoutes.values()) {
      for (const url of cachedUrls) {
        // Create a typed promise for cache invalidation
        const deletePromise = this.deleteCacheEntry(cacheManager, url);

        invalidationPromises.push(deletePromise);
      }
    }

    await Promise.all(invalidationPromises);
    this.cachedRoutes.clear();
  }

  /**
   * Delete a cache entry with error handling
   */
  private async deleteCacheEntry(cacheManager: Cache, key: string): Promise<void> {
    try {
      await cacheManager.del(key);
    } catch (error) {
      console.warn(`Impossible de supprimer la clé de cache "${key}":`, error);
    }
  }

  /**
   * Update the cached routes map
   */
  private updateCachedRoutes(baseUrl: string, fullUrl: string): void {
    const existingUrls = this.cachedRoutes.get(baseUrl);

    if (existingUrls) {
      if (!existingUrls.includes(fullUrl)) {
        existingUrls.push(fullUrl);
      }
    } else {
      this.cachedRoutes.set(baseUrl, [fullUrl]);
    }
  }
}

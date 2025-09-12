/* import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected cachedRoutes = new Map();
  trackBy(context: ExecutionContext): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // if there is no request, the incoming request is graphql, therefore bypass response caching.
    // later we can get the type of request (query/mutation) and if query get its field name, and attributes and cache accordingly. Otherwise, clear the cache in case of the request type is mutation.
    if (!request) {
      return undefined;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    if (!isHttpApp || cacheMetadata) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cacheMetadata;
    }

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';

    if (!isGetRequest) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => {
        for (const values of this.cachedRoutes.values()) {
          for (const value of values) {
            // you don't need to worry about the cache manager as you are extending their interceptor which is using caching manager as you've seen earlier.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            await this.cacheManager.del(value);
          }
        }
      }, 0);

      return undefined;
    }

    // to always get the base url of the incoming get request url.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const key = httpAdapter.getRequestUrl(request).split('?')[0];

    if (
      this.cachedRoutes.has(key) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      !this.cachedRoutes.get(key).includes(httpAdapter.getRequestUrl(request))
    ) {
      this.cachedRoutes.set(key, [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...this.cachedRoutes.get(key),
        httpAdapter.getRequestUrl(request),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return httpAdapter.getRequestUrl(request);
    }

    this.cachedRoutes.set(key, [httpAdapter.getRequestUrl(request)]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return httpAdapter.getRequestUrl(request);
  }
}
 */

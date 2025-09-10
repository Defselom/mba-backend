import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

import { Observable } from 'rxjs';

import { Response } from 'express';
import { map } from 'rxjs/operators';

import { ApiResponse, InterceptorData, ResponseMeta } from '@/shared/interfaces';
import { ResponseUtil } from '@/shared/utils';

@Injectable()
export class ResponseInterceptor<T = any>
  implements NestInterceptor<InterceptorData<T>, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<InterceptorData<T>>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: InterceptorData<T>): ApiResponse<T> => {
        const response = context.switchToHttp().getResponse<Response>();
        const status: number = response.statusCode;

        // Type guard pour vérifier si la réponse est déjà une ApiResponse
        if (this.isApiResponse(data)) {
          return data;
        }

        // Type guard pour vérifier si c'est un objet avec data/message/meta
        if (this.isRawResponseData(data)) {
          return ResponseUtil.success(
            data.data,
            data.message,
            this.isValidMeta(data.meta) ? data.meta : undefined,
            status,
          );
        }

        // Sinon, on traite comme une donnée brute
        return ResponseUtil.success(data, undefined, undefined, status);
      }),
    );
  }

  private isApiResponse<T>(data: unknown): data is ApiResponse<T> {
    if (data === null || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.success === 'boolean' &&
      typeof obj.status === 'number' &&
      'data' in obj &&
      typeof obj.timestamp === 'string'
    );
  }

  private isRawResponseData<T>(
    data: unknown,
  ): data is { data: T; message?: string; meta?: ResponseMeta } {
    if (data === null || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return (
      'data' in obj &&
      !this.isApiResponse(obj) &&
      (obj.message === undefined || typeof obj.message === 'string')
    );
  }

  private isValidMeta(meta: unknown): meta is ResponseMeta {
    if (meta === null || meta === undefined || typeof meta !== 'object') {
      return false;
    }

    const metaObj = meta as Record<string, unknown>;

    return (
      (metaObj.total === undefined || typeof metaObj.total === 'number') &&
      (metaObj.page === undefined || typeof metaObj.page === 'number') &&
      (metaObj.limit === undefined || typeof metaObj.limit === 'number') &&
      (metaObj.totalPages === undefined || typeof metaObj.totalPages === 'number') &&
      (metaObj.hasNext === undefined || typeof metaObj.hasNext === 'boolean') &&
      (metaObj.hasPrevious === undefined || typeof metaObj.hasPrevious === 'boolean') &&
      (metaObj.next === undefined || typeof metaObj.next === 'string') &&
      (metaObj.previous === undefined || typeof metaObj.previous === 'string')
    );
  }
}

import { ApiResponse, ResponseMeta } from '../interfaces/api-response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message?: string,
    meta?: ResponseMeta,
    status: number = 200,
  ): ApiResponse<T> {
    return {
      status,
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    status: number = 400,
    errors?: any[],
    data: unknown = null,
  ): ApiResponse {
    return {
      status,
      success: false,
      message,
      data,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
    baseUrl?: string,
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const meta: ResponseMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrevious,
    };

    if (baseUrl) {
      meta.next = hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : undefined;
      meta.previous = hasPrevious ? `${baseUrl}?page=${page - 1}&limit=${limit}` : undefined;
    }

    return this.success(data, message, meta);
  }
}

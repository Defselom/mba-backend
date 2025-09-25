import { ApiResponse, ResponseMeta } from '../interfaces/api-response.interface';

interface SuccessParams<T> {
  data: T;
  message?: string;
  meta?: ResponseMeta;
  status?: number;
}

interface ErrorParams {
  message: string;
  status?: number;
  errors?: any[];
  data?: unknown;
}

interface PaginatedParams<T> {
  data: T[];
  total: number;
  page?: number; // défaut: 1
  limit?: number; // défaut: 10
  message?: string;
  baseUrl?: string; // ex: "http://localhost:3000/supports?search=abc"
}

export class ResponseUtil {
  private static nowISO(): string {
    return new Date().toISOString();
  }

  static success<T>({ data, message, meta, status = 200 }: SuccessParams<T>): ApiResponse<T> {
    return {
      status,
      success: true,
      message,
      data,
      meta,
      timestamp: this.nowISO(),
    };
  }

  static error({ message, status = 400, errors, data = null }: ErrorParams): ApiResponse {
    return {
      status,
      success: false,
      message,
      data,
      errors,
      timestamp: this.nowISO(),
    };
  }

  static paginated<T>({
    data,
    total,
    page = 1,
    limit = 10,
    message,
    baseUrl,
  }: PaginatedParams<T>): ApiResponse<T[]> {
    const totalPages = Math.max(1, Math.ceil(total / limit));
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
      const url = new URL(baseUrl);

      if (hasNext) {
        url.searchParams.set('page', String(page + 1));
        url.searchParams.set('limit', String(limit));
        meta.next = url.toString();
      }

      if (hasPrevious) {
        url.searchParams.set('page', String(page - 1));
        url.searchParams.set('limit', String(limit));
        meta.previous = url.toString();
      }
    }

    return this.success({ data, message, meta });
  }
}

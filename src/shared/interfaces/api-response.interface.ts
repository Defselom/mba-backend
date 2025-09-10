export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: ResponseMeta;
  errors?: ApiError[];
  timestamp: string;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  next?: string;
  previous?: string;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
